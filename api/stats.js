const store = require('../lib/store.js');
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const s = await store.readStats();
  res.status(200).json(s);
};
