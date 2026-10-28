/* Gemini readout for "Expectation vs experience".
   The DECISION for each product comes from fixed rules in lib/variance.js. Gemini only explains it in plain words
   and suggests how the team could act on it. It is told not to change the decision or invent numbers.
   Only anonymous counts are sent. Open /api/expectation?debug=1 to see what happened. */
const store = require('../lib/store.js');
const V = require('../lib/variance.js');
/* Gemini helper is built into this file on purpose, so this endpoint works even if other files are missing. */
const P = require('../data/products.js');

function brief(r) {
  const pn = P.PRODUCTS[r.id];
  return {
    product: pn.name, id: r.id, customers_who_set_expectations: r.receipts, answered_check_in: r.answered,
    compared_with_hope: r.hope,
    most_hoped_for: r.topOut ? V.label(r.id, r.topOut.id) : null,
    most_common_expected_time: r.topTime ? (P.TIMES.filter((t) => t.id === r.topTime.id)[0] || {}).en : null,
    expected_time_vs_pack: r.gap, timeline_on_pack_and_listing: pn.stated && pn.stated.en ? pn.stated.en : 'not stated',
    hope_that_fell_shortest: r.missed ? V.label(r.id, r.missed.id) : null,
    DECISION_ALREADY_MADE_BY_RULES: r.title, reason_for_decision: r.why
  };
}

const API = 'https://generativelanguage.googleapis.com/v1beta';

function parseJson(t) {
  t = String(t || '').trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try { return JSON.parse(t); } catch (e) { const m = t.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]); throw e; }
}

async function generate(model, key, prompt) {
  const r = await fetch(API + '/models/' + encodeURIComponent(model) + ':generateContent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.3 } })
  });
  if (!r.ok) { const t = await r.text().catch(() => ''); const e = new Error('HTTP ' + r.status + ' ' + t.replace(/\s+/g, ' ').slice(0, 160)); e.status = r.status; throw e; }
  const j = await r.json();
  const parts = (j && j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts) || [];
  const txt = parts.filter((p) => !p.thought && typeof p.text === 'string').map((p) => p.text).join('').trim();
  if (!txt) throw new Error('empty answer');
  return parseJson(txt);
}

/* Ask Google which "flash" models this key can use, newest first. */
async function discover(key) {
  const r = await fetch(API + '/models?pageSize=200', { headers: { 'x-goog-api-key': key } });
  if (!r.ok) throw new Error('list models HTTP ' + r.status);
  const j = await r.json();
  const ver = (n) => { const m = /gemini-(\d+(?:\.\d+)?)/.exec(n); return m ? parseFloat(m[1]) : 0; };
  return (j.models || [])
    .filter((m) => (m.supportedGenerationMethods || []).indexOf('generateContent') >= 0)
    .map((m) => String(m.name || '').replace(/^models\//, ''))
    .filter((n) => /flash/i.test(n) && !/(image|tts|live|audio|embed|robotics|computer|native|exp)/i.test(n))
    .sort((a, b) => (ver(b) - ver(a)) || (/lite/i.test(a) - /lite/i.test(b)))
    .slice(0, 3);
}

/* Returns { out, used, tried }. out is null if nothing worked. */
async function ask(prompt) {
  const key = process.env.GEMINI_API_KEY, tried = [];
  if (!key) return { out: null, used: '', tried, noKey: true };
  let remembered = '';
  try { remembered = (await store.cacheGet('fc:aimodel')) || ''; } catch (e) { /* ignore */ }
  const queue = [process.env.GEMINI_MODEL, remembered, 'gemini-2.5-flash'].filter((m, i, a) => m && a.indexOf(m) === i);
  let out = null, used = '', authFail = false;
  const attempt = async (model) => {
    for (let i = 0; i < 3 && !out; i++) {
      try { out = await generate(model, key, prompt); used = model; tried.push({ model, ok: true }); }
      catch (e) {
        tried.push({ model, error: e.message });
        if (e.status === 401 || e.status === 403) { authFail = true; return; }
        if (e.status !== 429 && e.status !== 503 && e.status !== 500) return; // busy or rate-limited: wait and retry
        await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
      }
    }
  };
  for (const m of queue) { if (out || authFail) break; await attempt(m); }
  if (!out && !authFail) {
    try {
      const found = await discover(key); tried.push({ step: 'discover', models: found });
      for (const m of found) { if (out || authFail) break; if (queue.indexOf(m) < 0) await attempt(m); }
    } catch (e) { tried.push({ step: 'discover', error: e.message }); }
  }
  if (out) { try { await store.cacheSet('fc:aimodel', used, 86400); } catch (e) { /* ignore */ } }
  return { out, used, tried };
}


module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const debug = !!(req.query && req.query.debug) || /[?&]debug=1/.test(req.url || '');
  const key = process.env.GEMINI_API_KEY, tried = [];
  const finish = (o) => res.status(200).json(debug ? Object.assign({ configured: !!key, tried }, o) : o);
  if (!key) return finish({ source: 'rules', reason: 'GEMINI_API_KEY is not set.' });
  const stats = await store.readStats();
  const a = V.analyse(stats.counts || {});
  const ready = a.products.filter((r) => r.answered > 0);
  if (!ready.length) return finish({ source: 'rules', reason: 'No expectation check-ins yet.' });
  const sig = JSON.stringify(ready.map((r) => [r.id, r.receipts, r.hope.better, r.hope.as, r.hope.less, r.decision]));
  try {
    const hit = await store.cacheGet('fc:aiexp');
    if (hit && !debug) { const o = JSON.parse(hit); if (o.sig === sig) return res.status(200).json(o.payload); }
  } catch (e) { /* ignore */ }

  const prompt = 'You are a product analyst for a skincare brand. Customers told the brand, before buying, what they hoped a product would do and by when. ' +
    'Later a check-in asked whether it was better than, about as, or less than they hoped. Below are ANONYMOUS totals per product. ' +
    'A fixed rule has ALREADY chosen the decision for each product. Do NOT change or contradict it. Your job: explain the gap between expectation and experience in plain words, and say what the team should do next. ' +
    'Do not invent numbers or facts that are not in the data. If the sample is small, say so. No medical advice. ' +
    'Return JSON only: {"headline": string (max 20 words), "products": [{"id": string (copy the id), "explain": string (max 35 words), "team_should": string (max 28 words)}]}.\n\nDATA:\n' +
    JSON.stringify(ready.map(brief));
  const g = await ask(prompt);
  g.tried.forEach((t) => tried.push(t));
  if (!g.out) return finish({ source: 'rules', reason: 'Gemini did not return an answer.' });
  const ids = ready.map((r) => r.id);
  const payload = {
    source: 'gemini', model: g.used, headline: String(g.out.headline || '').slice(0, 220),
    products: (Array.isArray(g.out.products) ? g.out.products : []).filter((x) => x && ids.indexOf(x.id) >= 0).slice(0, 6)
      .map((x) => ({ id: x.id, explain: String(x.explain || '').slice(0, 300), team_should: String(x.team_should || '').slice(0, 240) }))
  };
  try { await store.cacheSet('fc:aiexp', JSON.stringify({ sig, payload }), 900); } catch (e) { /* ignore */ }
  return finish(payload);
};
