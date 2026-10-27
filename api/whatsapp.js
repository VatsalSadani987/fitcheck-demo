/* Kapso webhook: receives inbound WhatsApp messages (event whatsapp.message.received),
   runs the FitCheck engine, and replies. Set KAPSO_WEBHOOK_SECRET to verify signatures. */
const crypto = require('crypto');
const Engine = require('../lib/engine.js');
const store = require('../lib/store.js');
const { sendAll } = require('../lib/send.js');

let waitUntil = null;
try { waitUntil = require('@vercel/functions').waitUntil; } catch (e) { /* fine locally */ }

module.exports.config = { api: { bodyParser: false } };

function rawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(Buffer.from(c)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function verify(raw, signature) {
  const secret = process.env.KAPSO_WEBHOOK_SECRET;
  if (!secret) return true; // not configured yet: allowed for first tests, set the secret before sharing the link
  if (!signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  const a = Buffer.from(expected, 'utf8'), b = Buffer.from(String(signature).trim(), 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/* Finds the id of a tapped button or list row in whatever shape the payload uses. */
function findReply(node, depth) {
  if (!node || typeof node !== 'object' || (depth || 0) > 6) return null;
  for (const key of ['button_reply', 'list_reply']) {
    if (node[key] && typeof node[key] === 'object') return { id: node[key].id, title: node[key].title };
  }
  for (const k of Object.keys(node)) {
    const r = findReply(node[k], (depth || 0) + 1);
    if (r) return r;
  }
  return null;
}

function extract(evt) {
  const m = evt.message || {};
  if (String(m.direction || 'inbound') !== 'inbound') return null;
  const phone = m.phone_number || (evt.conversation && evt.conversation.phone_number) || '';
  if (!phone) return null;
  let id = null, text = '';
  const reply = findReply(m);
  if (reply) { id = reply.id || null; text = reply.title || ''; }
  const data = m.message_type_data || {};
  if (!id && data) { id = data.id || data.button_id || (data.reply && data.reply.id) || null; }
  if (!text) text = typeof m.content === 'string' ? m.content : (m.text && m.text.body) || data.title || data.text || '';
  return { phone, id, text, msgId: m.whatsapp_message_id || m.id };
}

async function handle(evt, cfg) {
  const inbound = extract(evt);
  if (!inbound) return;
  if (inbound.msgId && !(await store.once('m:' + inbound.msgId, 900))) return; // duplicate delivery
  const state = await store.getState(inbound.phone);
  const c = Object.assign({}, cfg);
  const tok = /#([A-HJ-NP-Z2-9]{5})\b/i.exec(inbound.text || '');
  if (tok && Engine.parseRef(inbound.text).length) {
    const rec = await store.getReceipt(tok[1]).catch(() => null);
    if (rec && rec.p) c.receipt = rec.p;
  }
  const result = Engine.reply(state, { id: inbound.id, text: inbound.text }, c);
  if (result.state) await store.setState(inbound.phone, result.state);
  await store.record(result.events, 'whatsapp');
  await sendAll(inbound.phone, result.out);
}

module.exports = async function handler(req, res) {
  if (req.method === 'GET') return res.status(200).send('FitCheck webhook is up');
  if (req.method !== 'POST') return res.status(405).end();
  const raw = await rawBody(req);
  if (!verify(raw, req.headers['x-webhook-signature'])) return res.status(401).send('Invalid signature');
  let body;
  try { body = JSON.parse(raw.toString('utf8')); } catch (e) { return res.status(400).send('Bad JSON'); }
  const cfg = { siteUrl: process.env.SITE_URL || (req.headers.host ? 'https://' + req.headers.host : '') };
  const events = Array.isArray(body) ? body : (Array.isArray(body.data) ? body.data : [body]);
  const work = Promise.all(events.map((e) => handle(e, cfg).catch((err) => console.error('handle error:', err.message))));
  res.status(200).send('OK'); // answer within 5 seconds, then keep working in the background
  if (waitUntil) waitUntil(work); else await work;
};
