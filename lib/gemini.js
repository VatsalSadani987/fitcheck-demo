/* Small Gemini helper shared by the two AI readouts (api/summary.js and api/expectation.js).
   The model is chosen automatically from the models the key can use, so a retired model name cannot break it.
   Optional: set GEMINI_MODEL to force one. */
const store = require('./store.js');
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
    try { out = await generate(model, key, prompt); used = model; tried.push({ model, ok: true }); }
    catch (e) { tried.push({ model, error: e.message }); if (e.status === 401 || e.status === 403) authFail = true; }
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

module.exports = { ask };
