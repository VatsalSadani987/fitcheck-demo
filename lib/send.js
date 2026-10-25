/* Sends engine messages through Kapso's WhatsApp API (same shape as Meta's Cloud API).
   If an interactive message is rejected, it falls back to plain text with numbered options. */
const API_KEY = () => process.env.KAPSO_API_KEY || '';
const PNID = () => process.env.KAPSO_PHONE_NUMBER_ID || '';
const BASE = () => process.env.KAPSO_API_BASE || 'https://api.kapso.ai/meta/whatsapp/v24.0';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cut = (s, n) => (String(s).length > n ? String(s).slice(0, n - 1) + '…' : String(s));

async function post(to, payload) {
  const r = await fetch(BASE() + '/' + PNID() + '/messages', {
    method: 'POST',
    headers: { 'X-API-Key': API_KEY(), 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.assign({ messaging_product: 'whatsapp', to: String(to).replace(/\D/g, '') }, payload))
  });
  if (!r.ok) { const t = await r.text().catch(() => ''); const err = new Error('send ' + r.status + ' ' + t.slice(0, 300)); err.status = r.status; throw err; }
  return r.json().catch(() => ({}));
}

function numbered(m) {
  return m.body + '\n\n' + m.options.map((o, i) => (i + 1) + '. ' + o.title).join('\n') + '\n\nReply with a number.';
}

async function sendMessage(to, m) {
  if (m.kind === 'text') return post(to, { type: 'text', text: { body: cut(m.body, 4000) } });
  try {
    if (m.kind === 'buttons') {
      return await post(to, { type: 'interactive', interactive: { type: 'button', body: { text: cut(m.body, 1000) },
        action: { buttons: m.options.slice(0, 3).map((o) => ({ type: 'reply', reply: { id: o.id, title: cut(o.title, 20) } })) } } });
    }
    return await post(to, { type: 'interactive', interactive: { type: 'list', body: { text: cut(m.body, 1000) },
      action: { button: cut(m.button || 'Choose', 20), sections: [{ title: 'Options', rows: m.options.slice(0, 10).map((o) => ({ id: o.id, title: cut(o.title, 24) })) }] } } });
  } catch (e) {
    console.error('interactive failed, using text fallback:', e.message);
    return post(to, { type: 'text', text: { body: cut(numbered(m), 4000) } });
  }
}

/* Send a sequence. Messages carry an optional delay (ms) before they are sent. */
async function sendAll(to, messages) {
  for (const m of messages) {
    if (m.delay) await sleep(Math.min(m.delay, 35000));
    try { await sendMessage(to, m); } catch (e) { console.error('send failed:', e.message); }
  }
}

module.exports = { sendAll, sendMessage };
