/* FitCheck conversation engine. One engine drives both the browser chat and WhatsApp.
   It is a pure function: (state, input) -> { state, out, events }.
   Verdicts and usage guidance are fixed, reviewed text. There is no diagnosis and no free medical advice. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('../data/products.js'));
  else root.FitEngine = factory(root.FitProducts);
})(typeof self !== 'undefined' ? self : this, function (P) {
  var PRODUCTS = P.PRODUCTS;
  var DEMO_DELAY_MS = (typeof process !== 'undefined' && process.env && parseInt(process.env.FITCHECK_DEMO_DELAY_MS, 10)) || 30000;

  var Q1 = [
    { id: 'well', title: 'Working well' },
    { id: 'none', title: 'No change yet' },
    { id: 'notexp', title: 'Not what I expected' },
    { id: 'irr', title: 'Skin irritation' },
    { id: 'little', title: "Haven't used it much" }
  ];
  var USE = [
    { id: 'less', title: 'Less than directed' },
    { id: 'asdir', title: 'As directed' },
    { id: 'unsure', title: 'Not sure how to use' }
  ];
  var REASON = [
    { id: 'results', title: 'No visible results' },
    { id: 'feel', title: 'Feel or texture' },
    { id: 'smell', title: 'Smell' },
    { id: 'price', title: 'Price or value' },
    { id: 'instr', title: 'Instructions unclear' },
    { id: 'other', title: 'Something else' }
  ];
  var SHARE = [
    { id: 'share', title: 'Share anonymously' },
    { id: 'skip', title: 'No thanks' }
  ];

  function text(body, delay) { var m = { kind: 'text', body: body }; if (delay) m.delay = delay; return m; }
  function buttons(body, options, delay) { var m = { kind: 'buttons', body: body, options: options }; if (delay) m.delay = delay; return m; }
  function list(body, options, button, delay) { var m = { kind: 'list', body: body, options: options, button: button || 'Choose', delay: delay || 0 }; return m; }

  function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim(); }

  function matchOption(options, input) {
    if (!input) return null;
    var id = input.id, t = norm(input.text);
    var i, o;
    if (id) { for (i = 0; i < options.length; i++) if (options[i].id === id) return options[i]; }
    if (/^[1-9]$/.test(t)) { var n = parseInt(t, 10) - 1; if (options[n]) return options[n]; }
    if (!t) return null;
    for (i = 0; i < options.length; i++) { o = options[i]; if (norm(o.title) === t || o.id === t) return o; }
    for (i = 0; i < options.length; i++) { o = options[i]; var nt = norm(o.title); if (t.indexOf(nt) >= 0 || (t.length > 3 && nt.indexOf(t) === 0)) return o; }
    return null;
  }

  function redact(s) {
    s = String(s || '');
    s = s.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[removed]');
    s = s.replace(/https?:\/\/\S+/g, '[removed]');
    s = s.replace(/(\+?\d[\d\s().-]{5,}\d)/g, '[removed]');
    s = s.replace(/@\w+/g, '[removed]');
    return s.replace(/\s+/g, ' ').trim().slice(0, 200);
  }

  var TAGS = [
    ['results', /result|work|effect|nothing|no change|difference|improv/i],
    ['feel', /oily|greasy|sticky|texture|feel|thick|dry|harsh|medicinal/i],
    ['smell', /smell|fragrance|scent|odou?r/i],
    ['price', /price|cost|expensive|pricey|value|afford|cheap/i],
    ['instructions', /how to|instruction|direction|usage|use it|unclear|confus|how long|how often/i],
    ['irritation', /irritat|rash|burn|sting|red\b|redness|itch/i],
    ['packaging', /pack|bottle|pump|cap|leak|size/i]
  ];
  function tagsFor(s) { var out = []; TAGS.forEach(function (t) { if (t[1].test(s)) out.push(t[0]); }); return out.length ? out : ['other']; }

  function parseRef(t) {
    t = String(t || '');
    var m = t.match(/Ref:\s*FC-([a-z0-9.]+)/i);
    var ids = [];
    if (m) m[1].toLowerCase().split('.').forEach(function (x) { if (PRODUCTS[x] && ids.indexOf(x) < 0) ids.push(x); });
    if (!ids.length) {
      var nt = norm(t);
      P.ORDER.forEach(function (k) { if (nt.indexOf(norm(PRODUCTS[k].name)) >= 0 && ids.indexOf(k) < 0) ids.push(k); });
    }
    return ids.slice(0, 3);
  }

  function guideText(p) {
    return '*' + p.name + '* (' + p.size + ')\n' +
      '• *What it’s for:* ' + p.forShort + '\n' +
      '• *How to use:* ' + p.how.slice(0, 3).join(' ') + '\n' +
      '• *Give it time:* ' + p.judgeShort + '\n' +
      '• *Good to know:* ' + p.cautionShort;
  }

  function timeText(p) { return p.judge === P.NOT_STATED ? 'The pages we checked do not say how long to give it, so check your pack.' : p.judge; }

  function cur(state) { return PRODUCTS[state.ids[state.i]]; }

  function checkinMsg(state) {
    var p = cur(state);
    var pre = state.ids.length > 1 ? 'Product ' + (state.i + 1) + ' of ' + state.ids.length + '. ' : '';
    return list('⏱ *Time skip (demo):* it is now about day ' + p.checkinDays + ' with *' + p.name + '*. ' + pre + 'How is it going?', Q1, 'Choose', state.i === 0 ? DEMO_DELAY_MS : 1500);
  }

  function ask(state) {
    var p = cur(state);
    switch (state.stage) {
      case 'q1': return [list('How is it going with *' + p.name + '*?', Q1, 'Choose')];
      case 'use': return [buttons('How have you been using it?', USE)];
      case 'reason': return [list('What is the main thing that is not what you expected?', REASON, 'Choose')];
      case 'share': return [buttons('Would you like to tell the brand how this went? It is anonymous: no name, no phone number.', SHARE)];
      case 'note': return [text('Optional: add one line in your own words (please leave out names and phone numbers), or send *skip*.')];
    }
    return [];
  }

  function swapText(p) {
    if (!p.swap || !p.swap.length) return 'There is no like-for-like swap in this demo store. Your options are to adjust how you use it, give it more time, or ask the brand’s support.';
    var lines = p.swap.map(function (id) {
      var s = PRODUCTS[id];
      return '• *' + s.name + '* (' + s.size + ', demo price ₹' + s.price + '): ' + s.forShort;
    });
    return 'A swap in the same range to consider:\n' + lines.join('\n') + '\nI can’t tell you it will suit you better. Compare the full ingredient list on the pack, and patch test.';
  }

  function verdictFor(p, a) {
    if (a.q1 === 'irr') {
      return { key: 'doctor', text: '*Verdict: stop using it and see a doctor or pharmacist if it does not settle.*\nI’m sorry this happened. I can’t diagnose skin problems, and I don’t want you to keep using something that is irritating your skin. Please check the cautions on your pack too.' };
    }
    if (a.q1 === 'well') {
      return { key: 'keep', text: '*Verdict: keep going.*\nGreat to hear. Keep using it the way the guide says. ' + timeText(p) };
    }
    if (a.q1 === 'little') {
      return { key: 'usage', text: '*Verdict: use it as directed first.*\nTo judge a product fairly it needs regular use as directed.\n• ' + p.how.slice(0, 3).join('\n• ') + '\n' + timeText(p) };
    }
    if (a.use === 'less' || a.use === 'unsure') {
      return { key: 'usage', text: '*Verdict: adjust how you use it.*\nIt is hard to judge a product that is not used as directed. Here are the steps again:\n• ' + p.how.slice(0, 3).join('\n• ') + '\nThen give it time. ' + timeText(p) };
    }
    // used as directed
    if (a.reason === 'instr') {
      return { key: 'usage', text: '*Verdict: the instructions need to be clearer.*\nThat is useful for the brand to hear. Here is what the pack and listing pages say:\n• ' + p.how.slice(0, 3).join('\n• ') + '\nIf your pack says something different, follow your pack, and ask the brand’s customer support.' };
    }
    if (a.reason === 'price') {
      return { key: 'value', text: '*Verdict: nothing to fix in how you use it. Whether it is worth the price is your call.*\n' + swapText(p) };
    }
    if (a.reason === 'feel' || a.reason === 'smell') {
      return { key: 'swap', text: '*Verdict: consider a swap.*\nFeel and smell are personal, and using it differently will not change them much.\n' + swapText(p) };
    }
    return { key: 'wait', text: '*Verdict: wait longer.*\nYou are using it as directed, so the next step is time. ' + timeText(p) + '\nIf you reach that point with no change, a swap or a word with a doctor or pharmacist could help.\n' + swapText(p) };
  }

  function nextProductOrFinish(state, out, events) {
    state.i += 1;
    if (state.i < state.ids.length) {
      state.stage = 'q1'; state.a = {};
      out.push(checkinMsg(state));
    } else {
      state.stage = 'done';
      var siteUrl = state.siteUrl || '';
      out.push(text('That is the whole FitCheck flow 🎉 Real check-ins would arrive after about 1 to 4 weeks, not 30 seconds.\n\nThe brand sees only anonymous reasons, never your number.' + (siteUrl ? '\nSee the team view here: ' + siteUrl + '/#/team' : '') + '\n\nReply *demo* to try again.', 800));
      events.push({ name: 'session_end' });
    }
  }

  function startSession(ids, cfg) {
    var state = { v: 1, ids: ids, i: 0, stage: 'q1', a: {}, siteUrl: (cfg && cfg.siteUrl) || '' };
    var out = [text('Hi! I’m *FitCheck* 👋 An independent student concept, not an official Be.Bodywise service. I help you give a new product a fair trial and decide what to do next.', 0)];
    ids.forEach(function (id) { out.push(text(guideText(PRODUCTS[id]), 700)); });
    out.push(text('Real FitChecks arrive after about ' + PRODUCTS[ids[0]].checkinDays + ' days. For this demo I’ll check in in 30 seconds ⏱', 700));
    out.push(checkinMsg(state));
    return { state: state, out: out, events: [{ name: 'session_start', products: ids }] };
  }

  function welcome(cfg) {
    var site = (cfg && cfg.siteUrl) || '';
    return text('Hi! I’m *FitCheck*, an independent student concept (not an official Be.Bodywise service). To start, buy something in the demo store' + (site ? ' at ' + site : '') + ' and tap *Continue on WhatsApp*.\n\nOr reply *demo* to try it with a sample product.');
  }

  function reply(state, input, cfg) {
    var t = input && input.text || '';
    var out = [], events = [];
    var ids = parseRef(t);
    if (ids.length) return startSession(ids, cfg);
    if (/^\s*(demo|restart)\s*[!.]*\s*$/i.test(t)) return startSession(['aha5'], cfg);
    if (!state || state.stage === 'done') return { state: state || null, out: [welcome(cfg)], events: [] };

    var p = cur(state);
    var opt;
    if (state.stage === 'q1') {
      opt = matchOption(Q1, input);
      if (!opt) return { state: state, out: [text('Sorry, I didn’t catch that.', 0)].concat(ask(state)), events: [] };
      state.a = { q1: opt.id };
      events.push({ name: 'q1', product: p.id, value: opt.id });
      if (opt.id === 'well' || opt.id === 'irr' || opt.id === 'little') return finishVerdict(state, p, out, events);
      state.stage = 'use'; out = ask(state);
      return { state: state, out: out, events: events };
    }
    if (state.stage === 'use') {
      opt = matchOption(USE, input);
      if (!opt) return { state: state, out: [text('Sorry, I didn’t catch that.', 0)].concat(ask(state)), events: [] };
      state.a.use = opt.id; events.push({ name: 'use', product: p.id, value: opt.id });
      if (state.a.q1 === 'notexp') { state.stage = 'reason'; return { state: state, out: ask(state), events: events }; }
      state.a.reason = 'results';
      return finishVerdict(state, p, out, events);
    }
    if (state.stage === 'reason') {
      opt = matchOption(REASON, input);
      if (!opt) return { state: state, out: [text('Sorry, I didn’t catch that.', 0)].concat(ask(state)), events: [] };
      state.a.reason = opt.id; events.push({ name: 'reason', product: p.id, value: opt.id });
      return finishVerdict(state, p, out, events);
    }
    if (state.stage === 'share') {
      opt = matchOption(SHARE, input);
      if (!opt) return { state: state, out: [text('Sorry, I didn’t catch that.', 0)].concat(ask(state)), events: [] };
      if (opt.id === 'skip') { out.push(text('No problem. Nothing was shared.')); nextProductOrFinish(state, out, events); return { state: state, out: out, events: events }; }
      events.push({ name: 'shared', product: p.id, q1: state.a.q1, use: state.a.use || '', reason: state.a.reason || '', verdict: state.a.verdict });
      state.stage = 'note'; return { state: state, out: ask(state), events: events };
    }
    if (state.stage === 'note') {
      var clean = redact(t);
      if (clean && !/^skip$/i.test(clean)) events.push({ name: 'note', product: p.id, text: clean, tags: tagsFor(clean) });
      out.push(text('Thank you. Your feedback is anonymous.'));
      nextProductOrFinish(state, out, events);
      return { state: state, out: out, events: events };
    }
    return { state: state, out: ask(state), events: [] };
  }

  function finishVerdict(state, p, out, events) {
    var v = verdictFor(p, state.a);
    state.a.verdict = v.key;
    events.push({ name: 'verdict', product: p.id, value: v.key });
    out.push(text(v.text, 400));
    state.stage = 'share';
    out.push(buttons('Would you like to tell the brand how this went? It is anonymous: no name, no phone number.', SHARE, 900));
    return { state: state, out: out, events: events };
  }

  return {
    DEMO_DELAY_MS: DEMO_DELAY_MS, startSession: startSession, reply: reply, welcome: welcome, parseRef: parseRef,
    ask: ask, redact: redact, tagsFor: tagsFor, verdictFor: verdictFor, matchOption: matchOption,
    OPTIONS: { Q1: Q1, USE: USE, REASON: REASON, SHARE: SHARE }
  };
});
