/* One- or two-line summary of the customer reviews shown on a product's official Be.Bodywise page.
   Gemini is given ONLY the stored review excerpts and the page rating (data/products.js). It must not add facts or medical claims.
   If Gemini is unavailable the page shows the rating and the excerpts without a summary. Open /api/reviews?id=lotion&debug=1 to see what happened. */
const store = require('../lib/store.js');
const P = require('../data/products.js');

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
  const q = req.query || {};
  const id = String(q.id || (/[?&]id=([a-z0-9]+)/.exec(req.url || '') || [])[1] || '');
  const debug = !!q.debug || /[?&]debug=1/.test(req.url || '');
  const p = P.PRODUCTS[id];
  const key = process.env.GEMINI_API_KEY;
  const finish = (o) => res.status(200).json(debug ? Object.assign({ configured: !!key }, o) : o);
  if (!p || !p.detail) return res.status(404).json({ source: 'none', reason: 'Unknown product.' });
  const d = p.detail;
  if (!key) return finish({ source: 'rules', reason: 'GEMINI_API_KEY is not set.' });
  const ck = 'fc:rev2:' + id + ':' + JSON.stringify(d.reviews).length;
  try { const hit = await store.cacheGet(ck); if (hit && !debug) return res.status(200).json(JSON.parse(hit)); } catch (e) { /* ignore */ }
  const prompt = 'You write one short line for a skincare and hair-care shop page, summarising customer reviews. ' +
    'Use ONLY the review excerpts and rating below. Do not add facts, ingredients, results or numbers that are not in them. ' +
    'No medical claims. Say what reviewers mostly praise, in plain friendly words. Because only a few excerpts are shown, write as "Reviewers mention..." and do not say "most" or "all". ' +
    'If the notes say the reviews are about a kit or combo, say so. Write exactly 2 sentences, 40 to 55 words in total: the first on what reviewers mostly praise, the second on one more detail they mention (for example how long they used it, or the kind of skin or hair). ' +
    'Return JSON only: {"summary": string}.\n\nPRODUCT: ' + p.name + '\nPAGE RATING: ' + d.rating.avg + ' out of 5 from ' + d.rating.count + ' reviews\n' +
    (d.reviewNote ? 'NOTE: ' + d.reviewNote + '\n' : '') + 'REVIEW EXCERPTS:\n' + d.reviews.map((r) => '- ' + r.t).join('\n');
  const g = await ask(prompt);
  if (!g.out || !g.out.summary) return finish({ source: 'rules', reason: 'Gemini did not return an answer.', tried: debug ? g.tried : undefined });
  const payload = { source: 'gemini', model: g.used, summary: String(g.out.summary).replace(/\s+/g, ' ').trim().slice(0, 420) };
  try { await store.cacheSet(ck, JSON.stringify(payload), 86400); } catch (e) { /* ignore */ }
  return finish(payload);
};
