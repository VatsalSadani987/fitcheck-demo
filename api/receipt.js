/* Saves the "expectation receipt" chosen on the site under a short order code (no personal data),
   so the WhatsApp check-in can ask about the same hopes. Expires in 3 days. */
const store = require('../lib/store.js');
const Engine = require('../lib/engine.js');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).end();
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
  const ids = body && Array.isArray(body.ids) ? body.ids.slice(0, 3) : [];
  const clean = Engine.cleanReceipt(body && body.p, ids);
  if (!Object.keys(clean).length) return res.status(200).json({ ok: true, code: '' });
  const code = await store.setReceipt({ p: clean });
  res.status(200).json({ ok: true, code });
};
