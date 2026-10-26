/* Optional AI summary of the anonymous insights, using Google's Gemini API.
   Set GEMINI_API_KEY (free key from Google AI Studio) in Vercel to switch it on. Without a key the page uses its own rule-based summary.
   Only anonymous counts and already-redacted notes are sent. No phone numbers or names exist in this data. */
const store = require('../lib/store.js');
const P = require('../data/products.js');

function compact(stats) {
  const c = stats.counts || {};
  const pick = (prefix) => Object.keys(c).filter((k) => k.indexOf(prefix) === 0).reduce((o, k) => { o[k.slice(prefix.length)] = c[k]; return o; }, {});
  const perProduct = {};
  P.ORDER.forEach((id) => { perProduct[P.PRODUCTS[id].name] = { started: c['pstart:' + id] || 0 }; });
  return {
    sessions: c.sessions || 0, shared_with_brand: c.shared || 0,
    how_is_it_going: pick('q1:'), how_used: pick('use:'), reasons_not_as_expected: pick('reason:'), verdicts: pick('verdict:'),
    products_started: perProduct,
    notes: (stats.notes || []).slice(0, 30).map((n) => ({ product: (P.PRODUCTS[n.product] || {}).name || '', tags: n.tags, text: n.text }))
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(200).json({ source: 'rules' });
  const stats = await store.readStats();
  const total = (stats.counts || {}).sessions || 0;
  if (!total) return res.status(200).json({ source: 'rules' });
  const cacheKey = 'fc:ai';
  try {
    const hit = await store.cacheGet(cacheKey);
    if (hit) { const o = JSON.parse(hit); if (o.total === total && o.notes === (stats.notes || []).length) return res.status(200).json(o.payload); }
  } catch (e) { /* ignore cache problems */ }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const prompt = 'You are a product analyst for a skincare and wellness brand. Below are ANONYMOUS aggregate results from a post-purchase check-in ("FitCheck") plus short customer notes. ' +
    'Write a short, honest readout for the brand team. Do not invent numbers that are not in the data. If the sample is small, say so. Do not give medical advice. ' +
    'Return JSON only with this shape: {"headline": string (max 18 words), "themes": [{"title": string, "detail": string (max 28 words)}] (2 to 4 items), "actions": [string] (2 to 3 concrete product or content actions, each max 20 words)}.\n\nDATA:\n' + JSON.stringify(compact(stats));
  try {
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.3 } })
    });
    if (!r.ok) throw new Error('gemini ' + r.status);
    const j = await r.json();
    const txt = j && j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts && j.candidates[0].content.parts[0].text;
    const out = JSON.parse(txt);
    const payload = { source: 'gemini', model, headline: String(out.headline || '').slice(0, 200),
      themes: (out.themes || []).slice(0, 4).map((t) => ({ title: String(t.title || '').slice(0, 80), detail: String(t.detail || '').slice(0, 260) })),
      actions: (out.actions || []).slice(0, 3).map((a) => String(a).slice(0, 200)) };
    await store.cacheSet(cacheKey, JSON.stringify({ total, notes: (stats.notes || []).length, payload }), 600);
    return res.status(200).json(payload);
  } catch (e) {
    console.error('summary failed:', e.message);
    return res.status(200).json({ source: 'rules', error: 'AI summary unavailable right now.' });
  }
};
