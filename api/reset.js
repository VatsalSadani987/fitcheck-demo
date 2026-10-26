/* Clears the live demo numbers (handy before recording the demo video).
   Protected by the ADMIN_KEY environment variable: nothing happens unless the caller sends the same key. */
const store = require('../lib/store.js');
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).end();
  const key = process.env.ADMIN_KEY || '';
  if (!key) return res.status(403).json({ ok: false, error: 'ADMIN_KEY is not set in Vercel.' });
  if (req.headers['x-admin-key'] !== key) return res.status(401).json({ ok: false, error: 'Wrong key.' });
  await store.clearStats();
  res.status(200).json({ ok: true });
};
