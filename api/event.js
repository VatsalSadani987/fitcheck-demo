/* Receives anonymous events from the in-browser chat simulation so the Insights page can show them.
   Only whitelisted event names and short, redacted strings are accepted. No identifiers are stored. */
const Engine = require('../lib/engine.js');
const store = require('../lib/store.js');
const P = require('../data/products.js');

const NAMES = ['session_start', 'lang', 'q1', 'use', 'reason', 'verdict', 'shared', 'note', 'session_end', 'expect', 'hope', 'missed'];
const token = (v) => (typeof v === 'string' ? v.replace(/[^a-z0-9_]/gi, '').slice(0, 20) : '');

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
    if (Array.isArray(e.products)) c.products = e.products.filter((id) => P.PRODUCTS[id]).slice(0, 3);
    if (e.name === 'expect') {
      if (!c.product) continue;
      const valid = P.PRODUCTS[c.product].expect.map((o) => o.id);
      c.outs = (Array.isArray(e.outs) ? e.outs : []).filter((o, i, a) => valid.indexOf(o) >= 0 && a.indexOf(o) === i).slice(0, 4);
      c.t = P.TIMES.some((t) => t.id === e.t) ? e.t : 'unsure';
      c.gap = P.timeGap(c.product, c.t);
      if (!c.outs.length) continue;
    }
    if (e.name === 'hope') {
      if (!c.product || ['better', 'as', 'less'].indexOf(e.value) < 0) continue;
      c.gap = ['longer', 'aligned', 'unknown', 'unsure'].indexOf(e.gap) >= 0 ? e.gap : 'unknown';
    }
    if (e.name === 'missed' && (!c.product || P.PRODUCTS[c.product].expect.every((o) => o.id !== e.value))) continue;
    if (e.value) c.value = token(e.value);
    if (e.q1) c.q1 = token(e.q1);
    if (e.name === 'note') { c.text = Engine.redact(e.text); c.tags = Engine.tagsFor(c.text); if (!c.text) continue; }
    clean.push(c);
  }
  await store.record(clean, 'web');
  res.status(200).json({ ok: true });
};
