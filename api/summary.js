/* Optional AI summary of the anonymous insights, using Google's Gemini API.
   Set GEMINI_API_KEY (free key from Google AI Studio) in Vercel to switch it on. Without a key the page uses its own rule-based summary.
   Only anonymous counts and already-redacted notes are sent. No phone numbers or names exist in this data.
   The model is chosen automatically from the models your key can use (so a retired model name cannot break it).
   Optional: set GEMINI_MODEL to force one. Open /api/summary?debug=1 to see what happened. */
const store = require('../lib/store.js');
const P = require('../data/products.js');
const gemini = require('../lib/gemini.js');


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
  const debug = !!(req.query && req.query.debug) || /[?&]debug=1/.test(req.url || '');
  const key = process.env.GEMINI_API_KEY;
  const tried = [];
  const finish = (obj) => res.status(200).json(debug ? Object.assign({ configured: !!key, tried }, obj) : obj);
  if (!key) return finish({ source: 'rules', reason: 'GEMINI_API_KEY is not set (or the site was not redeployed after adding it).' });
  const stats = await store.readStats();
  const total = (stats.counts || {}).sessions || 0;
  if (!total) return finish({ source: 'rules', reason: 'No check-ins recorded yet.' });
  try {
    const hit = await store.cacheGet('fc:ai');
    if (hit && !debug) { const o = JSON.parse(hit); if (o.total === total && o.notes === (stats.notes || []).length) return res.status(200).json(o.payload); }
  } catch (e) { /* ignore cache problems */ }

  const prompt = 'You are a product analyst for a skincare and wellness brand. Below are ANONYMOUS aggregate results from a post-purchase check-in ("FitCheck") plus short customer notes. ' +
    'Write a short, honest readout for the brand team. Do not invent numbers that are not in the data. If the sample is small, say so. Do not give medical advice. ' +
    'Return JSON only with this shape: {"headline": string (max 18 words), "themes": [{"title": string, "detail": string (max 28 words)}] (2 to 4 items), "actions": [string] (2 to 3 concrete product or content actions, each max 20 words)}.\n\nDATA:\n' + JSON.stringify(compact(stats));

  const g = await gemini.ask(prompt), out = g.out, used = g.used;
  g.tried.forEach((t) => tried.push(t));
  if (!out) return finish({ source: 'rules', reason: 'Gemini did not return an answer. See "tried".' });

  const payload = { source: 'gemini', model: used, headline: String(out.headline || '').slice(0, 200),
    themes: (out.themes || []).slice(0, 4).map((t) => ({ title: String(t.title || '').slice(0, 80), detail: String(t.detail || '').slice(0, 260) })),
    actions: (out.actions || []).slice(0, 3).map((a) => String(a).slice(0, 200)) };
  try { await store.cacheSet('fc:ai', JSON.stringify({ total, notes: (stats.notes || []).length, payload }), 600); } catch (e) { /* ignore */ }
  return finish(payload);
};
