/* Receives anonymous events from the in-browser chat simulation so the "For the team" view can show them.
   Only whitelisted event names and short, redacted strings are accepted. No identifiers are stored. */
const Engine = require('../lib/engine.js');
const store = require('../lib/store.js');
const P = require('../data/products.js');

const NAMES = ['session_start', 'q1', 'use', 'reason', 'verdict', 'shared', 'note'];
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
  const list = body && Array.isArray(body.events) ? body.events.slice(0, 12) : [];
  const clean = [];
  for (const e of list) {
    if (!e || NAMES.indexOf(e.name) < 0) continue;
    const c = { name: e.name };
    if (e.product && P.PRODUCTS[e.product]) c.product = e.product;
    if (typeof e.value === 'string') c.value = e.value.replace(/[^a-z0-9_]/gi, '').slice(0, 20);
    if (e.name === 'note') { c.text = Engine.redact(e.text); c.tags = Engine.tagsFor(c.text); if (!c.text) continue; }
    clean.push(c);
  }
  await store.record(clean, 'web');
  res.status(200).json({ ok: true });
};
