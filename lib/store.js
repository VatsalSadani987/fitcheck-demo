/* Storage layer. Uses Upstash Redis (REST) when connected; otherwise a temporary in-memory fallback
   (fine for a quick local test, NOT reliable on Vercel because each request can run on a different instance).
   We never store phone numbers: conversation state is keyed by a salted hash and expires in 2 hours.
   Everything else is anonymous counters, a short activity feed and redacted notes. */
const crypto = require('crypto');

const URL_ = () => (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '').replace(/\/$/, '');
const TOKEN = () => process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';
const hasRedis = () => !!(URL_() && TOKEN());
const mem = (globalThis.__fitcheckMem = globalThis.__fitcheckMem || { kv: new Map(), hash: new Map(), lists: new Map() });
let lastError = '';

/* ---- Redis REST helpers ---- */
async function pipeline(cmds) {
  const r = await fetch(URL_() + '/pipeline', { method: 'POST', headers: { Authorization: 'Bearer ' + TOKEN(), 'Content-Type': 'application/json' }, body: JSON.stringify(cmds) });
  if (!r.ok) throw new Error('redis ' + r.status);
  const arr = await r.json();
  return arr.map((x) => { if (x && x.error) throw new Error('redis: ' + x.error); return x.result; });
}
async function one(cmd) { return (await pipeline([cmd]))[0]; }

/* ---- Tiny in-memory interpreter for the handful of commands we use ---- */
function memRun(cmd) {
  const op = String(cmd[0]).toUpperCase();
  if (op === 'HINCRBY') { mem.hash.set(cmd[2], (mem.hash.get(cmd[2]) || 0) + parseInt(cmd[3], 10)); return 1; }
  if (op === 'LPUSH') { const l = mem.lists.get(cmd[1]) || []; l.unshift(cmd[2]); mem.lists.set(cmd[1], l); return l.length; }
  if (op === 'LTRIM') { const l = mem.lists.get(cmd[1]) || []; mem.lists.set(cmd[1], l.slice(parseInt(cmd[2], 10), parseInt(cmd[3], 10) + 1)); return 'OK'; }
  if (op === 'LRANGE') { const l = mem.lists.get(cmd[1]) || []; return l.slice(parseInt(cmd[2], 10), parseInt(cmd[3], 10) + 1); }
  if (op === 'HGETALL') { const out = []; mem.hash.forEach((v, k) => out.push(k, String(v))); return out; }
  if (op === 'SET') { mem.kv.set(cmd[1], { v: cmd[2], exp: Infinity }); return 'OK'; }
  if (op === 'GET') { const m = mem.kv.get(cmd[1]); return m && m.exp > Date.now() ? m.v : null; }
  if (op === 'DEL') { cmd.slice(1).forEach((k) => { mem.kv.delete(k); mem.lists.delete(k); if (k === 'fc:stats') mem.hash.clear(); }); return 1; }
  return null;
}
async function run(cmds) {
  if (hasRedis()) {
    try { const r = await pipeline(cmds); lastError = ''; return r; } catch (e) { lastError = e.message; console.error('redis failed:', e.message); }
  }
  return cmds.map(memRun);
}

function keyFor(phone) {
  const salt = process.env.STATE_SALT || 'fitcheck-demo';
  return 'fc:s:' + crypto.createHmac('sha256', salt).update(String(phone)).digest('hex').slice(0, 24);
}

async function getState(phone) {
  const k = keyFor(phone);
  try {
    if (hasRedis()) { const v = await one(['GET', k]); return v ? JSON.parse(v) : null; }
  } catch (e) { lastError = e.message; console.error('getState', e.message); }
  const m = mem.kv.get(k); return m && m.exp > Date.now() ? JSON.parse(m.v) : null;
}
async function setState(phone, state) {
  const k = keyFor(phone), v = JSON.stringify(state);
  try { if (hasRedis()) { await one(['SET', k, v, 'EX', '7200']); return; } } catch (e) { lastError = e.message; console.error('setState', e.message); }
  mem.kv.set(k, { v, exp: Date.now() + 7200000 });
}
async function once(key, ttl) { // true the first time a key is seen (idempotency)
  const k = 'fc:i:' + key;
  try { if (hasRedis()) { const r = await one(['SET', k, '1', 'EX', String(ttl || 600), 'NX']); return r === 'OK'; } } catch (e) { console.error('once', e.message); }
  const m = mem.kv.get(k); if (m && m.exp > Date.now()) return false;
  mem.kv.set(k, { v: '1', exp: Date.now() + (ttl || 600) * 1000 }); return true;
}

/* Turn anonymous engine events into counters, a feed and redacted notes. */
async function record(events, source) {
  const src = source === 'whatsapp' ? 'whatsapp' : 'web';
  const now = Date.now();
  const cmds = [];
  const inc = (f) => cmds.push(['HINCRBY', 'fc:stats', f, '1']);
  for (const e of events || []) {
    if (e.name === 'session_start') {
      inc('sessions'); inc('src:' + src);
      (e.products || []).forEach((id) => inc('pstart:' + id));
    } else if (e.name === 'q1') { inc('q1:' + e.value); inc('pq:' + e.product + ':' + e.value); }
    else if (e.name === 'use') inc('use:' + e.value);
    else if (e.name === 'reason') { inc('reason:' + e.value); inc('preason:' + e.product + ':' + e.value); }
    else if (e.name === 'verdict') {
      inc('verdict:' + e.value); inc('pverdict:' + e.product + ':' + e.value);
      cmds.push(['LPUSH', 'fc:feed', JSON.stringify({ t: now, product: e.product, q1: e.q1 || '', verdict: e.value, src })]);
      cmds.push(['LTRIM', 'fc:feed', '0', '19']);
    }
    else if (e.name === 'expect' && e.product) {
      inc('x:n:' + e.product);
      (e.outs || []).forEach((o) => inc('x:o:' + e.product + ':' + o));
      if (e.t) inc('x:t:' + e.product + ':' + e.t);
      if (e.gap) inc('x:g:' + e.product + ':' + e.gap);
    }
    else if (e.name === 'hope' && e.product) {
      inc('x:h:' + e.product + ':' + e.value);
      if (e.gap) inc('x:xt:' + e.product + ':' + e.gap + ':' + e.value);
    }
    else if (e.name === 'missed' && e.product) inc('x:m:' + e.product + ':' + e.value);
    else if (e.name === 'lang') inc('lang:' + (e.value === 'hi' ? 'hi' : 'en'));
    else if (e.name === 'shared') inc('shared');
    else if (e.name === 'session_end') inc('done');
    else if (e.name === 'note') {
      inc('notes');
      cmds.push(['LPUSH', 'fc:notes', JSON.stringify({ t: now, product: e.product, tags: e.tags, text: e.text })]);
      cmds.push(['LTRIM', 'fc:notes', '0', '49']);
    }
  }
  if (!cmds.length) return;
  cmds.push(['SET', 'fc:last', String(now)]);
  await run(cmds);
}

async function readStats() {
  const r = await run([['HGETALL', 'fc:stats'], ['LRANGE', 'fc:notes', '0', '49'], ['LRANGE', 'fc:feed', '0', '19'], ['GET', 'fc:last']]);
  const arr = r[0] || [], counts = {};
  for (let i = 0; i < arr.length; i += 2) counts[arr[i]] = parseInt(arr[i + 1], 10);
  const parse = (x) => { try { return JSON.parse(x); } catch (e) { return null; } };
  return {
    counts,
    notes: (r[1] || []).map(parse).filter(Boolean),
    feed: (r[2] || []).map(parse).filter(Boolean),
    updated: r[3] ? parseInt(r[3], 10) : 0,
    persistent: hasRedis() && !lastError,
    configured: hasRedis(),
    error: lastError || ''
  };
}

/* Expectation receipts: a short code (not a phone number) points to the choices made on the site. Expires in 3 days. */
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function newCode() { const b = crypto.randomBytes(5); let c = ''; for (let i = 0; i < 5; i++) c += CODE_CHARS[b[i] % CODE_CHARS.length]; return c; }
async function setReceipt(receipt) {
  const code = newCode(), k = 'fc:r:' + code, v = JSON.stringify(receipt);
  try { if (hasRedis()) { await one(['SET', k, v, 'EX', '259200']); return code; } } catch (e) { lastError = e.message; console.error('setReceipt', e.message); }
  mem.kv.set(k, { v, exp: Date.now() + 259200000 }); return code;
}
async function getReceipt(code) {
  const k = 'fc:r:' + String(code).toUpperCase().replace(/[^A-Z0-9]/g, '');
  try { if (hasRedis()) { const v = await one(['GET', k]); return v ? JSON.parse(v) : null; } } catch (e) { console.error('getReceipt', e.message); }
  const m = mem.kv.get(k); return m && m.exp > Date.now() ? JSON.parse(m.v) : null;
}

async function clearStats() { await run([['DEL', 'fc:stats', 'fc:notes', 'fc:feed', 'fc:last', 'fc:ai', 'fc:aiexp']]); }

async function cacheGet(k) { const r = await run([['GET', k]]); return r[0] || null; }
async function cacheSet(k, v, ttl) {
  if (hasRedis()) { try { await one(['SET', k, v, 'EX', String(ttl || 300)]); return; } catch (e) { /* fall through */ } }
  mem.kv.set(k, { v, exp: Date.now() + (ttl || 300) * 1000 });
}

module.exports = { getState, setState, once, record, readStats, clearStats, cacheGet, cacheSet, hasRedis, setReceipt, getReceipt };
