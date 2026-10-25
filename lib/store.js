/* Tiny storage layer. Uses Upstash Redis (REST) if configured, otherwise in-memory (works for a quick demo).
   We never store phone numbers: conversation state is keyed by a salted hash and expires in 2 hours. */
const crypto = require('crypto');

const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '';
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';
const mem = (globalThis.__fitcheckMem = globalThis.__fitcheckMem || { kv: new Map(), hash: new Map(), lists: new Map() });

async function cmd(args) {
  const r = await fetch(URL_, { method: 'POST', headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' }, body: JSON.stringify(args) });
  if (!r.ok) throw new Error('redis ' + r.status);
  return (await r.json()).result;
}
const hasRedis = () => !!(URL_ && TOKEN);

function keyFor(phone) {
  const salt = process.env.STATE_SALT || 'fitcheck-demo';
  return 'fc:s:' + crypto.createHmac('sha256', salt).update(String(phone)).digest('hex').slice(0, 24);
}

async function getState(phone) {
  const k = keyFor(phone);
  try {
    if (hasRedis()) { const v = await cmd(['GET', k]); return v ? JSON.parse(v) : null; }
  } catch (e) { console.error('getState', e.message); }
  const m = mem.kv.get(k); return m && m.exp > Date.now() ? JSON.parse(m.v) : null;
}
async function setState(phone, state) {
  const k = keyFor(phone), v = JSON.stringify(state);
  try { if (hasRedis()) { await cmd(['SET', k, v, 'EX', '7200']); return; } } catch (e) { console.error('setState', e.message); }
  mem.kv.set(k, { v, exp: Date.now() + 7200000 });
}
async function once(key, ttl) { // true the first time a key is seen (idempotency)
  const k = 'fc:i:' + key;
  try { if (hasRedis()) { const r = await cmd(['SET', k, '1', 'EX', String(ttl || 600), 'NX']); return r === 'OK'; } } catch (e) { console.error('once', e.message); }
  const m = mem.kv.get(k); if (m && m.exp > Date.now()) return false;
  mem.kv.set(k, { v: '1', exp: Date.now() + (ttl || 600) * 1000 }); return true;
}
async function incr(field) {
  try { if (hasRedis()) { await cmd(['HINCRBY', 'fc:stats', field, '1']); return; } } catch (e) { console.error('incr', e.message); }
  mem.hash.set(field, (mem.hash.get(field) || 0) + 1);
}
async function pushNote(obj) {
  const v = JSON.stringify(obj);
  try { if (hasRedis()) { await cmd(['LPUSH', 'fc:notes', v]); await cmd(['LTRIM', 'fc:notes', '0', '29']); return; } } catch (e) { console.error('pushNote', e.message); }
  const l = mem.lists.get('notes') || []; l.unshift(v); mem.lists.set('notes', l.slice(0, 30));
}
async function readStats() {
  let h = {}, notes = [];
  try {
    if (hasRedis()) {
      const arr = await cmd(['HGETALL', 'fc:stats']) || [];
      for (let i = 0; i < arr.length; i += 2) h[arr[i]] = parseInt(arr[i + 1], 10);
      notes = (await cmd(['LRANGE', 'fc:notes', '0', '29']) || []).map((x) => JSON.parse(x));
      return { counts: h, notes, persistent: true };
    }
  } catch (e) { console.error('readStats', e.message); }
  mem.hash.forEach((v, k) => { h[k] = v; });
  notes = (mem.lists.get('notes') || []).map((x) => JSON.parse(x));
  return { counts: h, notes, persistent: false };
}

/* Record anonymous engine events as counters. No phone numbers, no names. */
async function record(events, source) {
  for (const e of events || []) {
    if (e.name === 'session_start') { await incr('sessions'); await incr('src:' + (source || 'web')); }
    else if (e.name === 'q1') await incr('q1:' + e.value);
    else if (e.name === 'use') await incr('use:' + e.value);
    else if (e.name === 'reason') await incr('reason:' + e.value);
    else if (e.name === 'verdict') { await incr('verdict:' + e.value); await incr('product:' + e.product); }
    else if (e.name === 'shared') await incr('shared');
    else if (e.name === 'note') { await pushNote({ product: e.product, tags: e.tags, text: e.text }); await incr('notes'); }
  }
}

module.exports = { getState, setState, once, record, readStats, hasRedis };
