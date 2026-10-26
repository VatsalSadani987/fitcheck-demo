/* FitCheck conversation engine. One engine drives both the browser chat and WhatsApp.
   It is a pure function: (state, input) -> { state, out, events }.
   Verdicts and usage guidance are fixed, reviewed text. There is no diagnosis and no free medical advice. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('../data/products.js'));
  else root.FitEngine = factory(root.FitProducts);
})(typeof self !== 'undefined' ? self : this, function (P) {
  var PRODUCTS = P.PRODUCTS;
  var DEMO_DELAY_MS = (typeof process !== 'undefined' && process.env && parseInt(process.env.FITCHECK_DEMO_DELAY_MS, 10)) || 30000;
  var MAX_REASONS = 3;

  var Q1 = [
    { id: 'well', title: '😊 Working well' },
    { id: 'none', title: '🤔 No change yet' },
    { id: 'notexp', title: '😕 Not what I expected' },
    { id: 'irr', title: '⚠️ Skin irritation' },
    { id: 'little', title: '⏳ Haven’t used it much' }
  ];
  var USE = [
    { id: 'less', title: 'Less than directed' },
    { id: 'asdir', title: 'As directed' },
    { id: 'unsure', title: 'Not sure how' }
  ];
  var REASON = [
    { id: 'results', title: 'No visible results' },
    { id: 'feel', title: 'Feel or texture' },
    { id: 'smell', title: 'Smell' },
    { id: 'price', title: 'Price or value' },
    { id: 'instr', title: 'Instructions unclear' },
    { id: 'other', title: 'Something else' }
  ];
  var MORE = [
    { id: 'more', title: 'Yes, one more' },
    { id: 'done', title: 'That’s all' }
  ];
  var SHARE = [
    { id: 'share', title: 'Yes, share it' },
    { id: 'skip', title: 'No thanks' }
  ];

  function text(body, delay) { var m = { kind: 'text', body: body }; if (delay) m.delay = delay; return m; }
  function buttons(body, options, delay) { var m = { kind: 'buttons', body: body, options: options }; if (delay) m.delay = delay; return m; }
  function list(body, options, button, delay) { return { kind: 'list', body: body, options: options, button: button || 'Choose', delay: delay || 0 }; }

  function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim(); }

  function matchOption(options, input) {
    if (!input) return null;
    var id = input.id, t = norm(input.text);
    var i, o;
    if (id) { for (i = 0; i < options.length; i++) if (options[i].id === id) return options[i]; }
    if (/^[1-9]$/.test(t)) { var n = parseInt(t, 10) - 1; if (options[n]) return options[n]; }
    if (!t) return null;
    for (i = 0; i < options.length; i++) { o = options[i]; if (norm(o.title) === t || o.id === t) return o; }
    for (i = 0; i < options.length; i++) { o = options[i]; var nt = norm(o.title); if (nt && (t.indexOf(nt) >= 0 || (t.length > 3 && nt.indexOf(t) === 0))) return o; }
    return null;
  }

  /* Several answers in one go: "1, 3", "feel and smell", "smell & price". Returns unique matches. */
  function matchMany(options, input) {
    if (input && input.id) { var one = matchOption(options, input); return one ? [one] : []; }
    var t = String(input && input.text || '').toLowerCase();
    var parts = /^[\d\s,]+$/.test(t) && /\d\s+\d|,/.test(t) ? t.split(/[\s,]+/) : t.split(/,|;|&|\+|\/|\n|\band\b/);
    var out = [];
    parts.forEach(function (p) {
      var o = matchOption(options, { text: p });
      if (o && out.indexOf(o) < 0) out.push(o);
    });
    if (!out.length) { var whole = matchOption(options, input); if (whole) out.push(whole); }
    return out;
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

  /* Which products did the person buy? Reads product names from their first message (or an old-style "Ref: FC-id" code). */
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

  function howLines(p, max) {
    var steps = p.how.slice(0, max || 4);
    return steps.map(function (s, i) { return (p.ordered ? (i + 1) + '. ' : '• ') + s; }).join('\n');
  }

  function timeLine(p) {
    return p.judge === P.NOT_STATED ? 'The pages I checked don’t say how long to give it, so your pack is the best guide.' : p.judge;
  }

  function guideText(p) {
    return p.emoji + ' *' + p.name + '* (' + p.size + ')\n\n' +
      '*What it’s for*\n' + p.forShort + '\n\n' +
      '*How to use*\n' + howLines(p, 4) + '\n\n' +
      '*Give it time* ⏳\n' + timeLine(p) + '\n\n' +
      '*Good to know*\n' + p.good.map(function (g) { return '• ' + g; }).join('\n');
  }

  function cur(state) { return PRODUCTS[state.ids[state.i]]; }

  function checkinMsg(state) {
    var p = cur(state), n = state.ids.length;
    var body = state.i === 0
      ? 'Hey! It’s been about ' + (p.checkinDays === 7 ? 'a week' : p.checkinDays === 14 ? 'two weeks' : 'a month') + ' since you got your *' + p.nick + '* 🙂\n\nHow’s it treating you so far?'
      : 'Now for your *' + p.nick + '* (' + (state.i + 1) + ' of ' + n + ') 🙂\n\nHow’s that one going?';
    return list(body, Q1, 'Tell me', state.i === 0 ? DEMO_DELAY_MS : 1500);
  }

  function reasonOptions(state) {
    var picked = state.a.reasons || [];
    return REASON.filter(function (r) { return picked.indexOf(r.id) < 0; });
  }

  function ask(state) {
    var p = cur(state);
    switch (state.stage) {
      case 'q1': return [list('How’s your *' + p.nick + '* going?', Q1, 'Tell me')];
      case 'use': return [buttons('How have you been using it?', USE)];
      case 'reason': return [list((state.a.reasons || []).length ? 'What else is bugging you?' : 'What’s bugging you the most? 👀\n\nYou can pick more than one. I’ll ask after each.', reasonOptions(state), 'Pick one')];
      case 'more': return [buttons('Noted ✅\n\nAnything else?', MORE)];
      case 'share': return [buttons('Last thing 🙌\n\nWant to tell the Be.Bodywise team how this went? It’s completely anonymous: no name, no number.', SHARE)];
      case 'note': return [text('Thank you! Add a line in your own words if you like (no names or numbers please), or just send *skip*.')];
    }
    return [];
  }

  function swapText(p) {
    if (!p.swap || !p.swap.length) return 'There’s no like-for-like swap in this store, so your options are adjusting how you use it, giving it more time, or asking customer support.';
    var lines = p.swap.map(function (id) {
      var s = PRODUCTS[id];
      return '• *' + s.name + '* (' + s.size + ', demo price ₹' + s.price + '): ' + s.forShort;
    });
    return 'A swap in the same range to consider:\n' + lines.join('\n') + '\n\nI can’t promise it’ll suit you better, so compare the ingredient list on the pack and do a patch test.';
  }

  function reasonsOf(a) { return a.reasons && a.reasons.length ? a.reasons : (a.reason ? [a.reason] : ['results']); }

  function verdictFor(p, a) {
    var rs = reasonsOf(a), has = function (r) { return rs.indexOf(r) >= 0; };
    if (a.q1 === 'irr') {
      return { key: 'doctor', text: 'I’m really sorry that happened 😔\n\n*My take: stop using it for now.*\n\nIf the irritation doesn’t settle soon, please see a doctor or pharmacist. I can’t diagnose skin problems, and your comfort comes first.\n\nIt’s also worth re-reading the cautions on your pack.' };
    }
    if (a.q1 === 'well') {
      return { key: 'keep', text: 'Love to hear that! 🎉\n\n*My take: keep going.* Stick with how you’re using it now and let it do its thing.\n\n⏳ ' + timeLine(p) };
    }
    if (a.q1 === 'little') {
      return { key: 'usage', text: 'Totally fine, life gets busy 😄\n\n*My take: give it a proper go first.* A fair trial needs regular use, as directed:\n\n' + howLines(p, 4) + '\n\n⏳ ' + timeLine(p) };
    }
    if (a.use === 'less' || a.use === 'unsure') {
      return { key: 'usage', text: 'Thanks for being honest 🙏\n\n*My take: let’s sort out how it’s used first.* It’s hard to judge a product that isn’t used as directed. Here’s the quick version:\n\n' + howLines(p, 4) + '\n\n⏳ Then give it time. ' + timeLine(p) };
    }
    var extra = (has('price') && (has('feel') || has('smell') || has('results') || has('instr'))) ? '\n\nOn price: only you can say whether it’s worth it for you.' : '';
    if (has('instr')) {
      return { key: 'usage', text: 'Thanks, this one is really useful for the brand to hear 💡\n\n*My take: the instructions need to be clearer.* Here’s what the pack and listing say:\n\n' + howLines(p, 4) + '\n\nIf your pack says something different, go with your pack, or ask customer support.' + extra };
    }
    if (has('feel') || has('smell')) {
      return { key: 'swap', text: 'That’s fair, feel and smell are very personal 🤷\n\n*My take: consider a swap.* Using it differently won’t change those much.\n\n' + swapText(p) + extra };
    }
    if (has('price') && !has('results') && !has('other')) {
      return { key: 'value', text: 'Fair enough 💸\n\n*My take: nothing to fix in how you’re using it.* Whether it’s worth the price is really your call.\n\n' + swapText(p) };
    }
    return { key: 'wait', text: 'Thanks for sharing 🙏\n\n*My take: give it more time.* You’re using it as directed, so time is the next step.\n\n⏳ ' + timeLine(p) + '\n\nIf you reach that point with no change, a swap or a word with a doctor or pharmacist could help.\n\n' + swapText(p) + extra };
  }

  function nextProductOrFinish(state, out, events) {
    state.i += 1;
    if (state.i < state.ids.length) {
      state.stage = 'q1'; state.a = {};
      out.push(checkinMsg(state));
    } else {
      state.stage = 'done';
      var siteUrl = state.siteUrl || '';
      out.push(text('And that’s the whole FitCheck loop 🎉\n\nIn real life, check-ins arrive after 1 to 4 weeks, not 30 seconds. The brand only ever sees anonymous reasons, never your number.' + (siteUrl ? '\n\n📊 See what the team sees:\n' + siteUrl + '/#/insights' : '') + '\n\nSend *demo* to try again.', 900));
      events.push({ name: 'session_end' });
    }
  }

  function startSession(ids, cfg) {
    var state = { v: 2, ids: ids, i: 0, stage: 'q1', a: {}, siteUrl: (cfg && cfg.siteUrl) || '' };
    var p0 = PRODUCTS[ids[0]];
    var when = p0.checkinDays === 7 ? 'about a week' : p0.checkinDays === 14 ? 'around two weeks' : 'about a month';
    var guides = ids.map(function (id) { return guideText(PRODUCTS[id]); }).join('\n\n――――――\n\n');
    var out = [
      text('Hey! 👋 Welcome to *FitCheck*, your buddy for getting the most out of your Be.Bodywise order.\n\nI’ll share a quick guide for what you bought, then check in later to see how it’s going.\n\n_A sample idea by Vatsal Sadani, St. Xavier’s College (Autonomous), Kolkata._'),
      text(guides + '\n\n――――――\n\nI’ll message you in ' + when + ' to see how it’s going. For this demo, that’s about 30 seconds from now ⏱', 1100),
      checkinMsg(state)
    ];
    return { state: state, out: out, events: [{ name: 'session_start', products: ids }] };
  }

  function welcome(cfg) {
    var site = (cfg && cfg.siteUrl) || '';
    return text('Hey! 👋 I’m *FitCheck*. I help you give a new product a fair trial and work out what to do next.\n\nTo start, order something in the demo store' + (site ? ':\n' + site : '') + '\nthen tap *Continue on WhatsApp*.\n\nOr send *demo* and I’ll show you how it works with a sample product.');
  }

  function retry(state) { return [text('Sorry, I didn’t catch that 🙈 Could you pick one of the options?')].concat(ask(state)); }

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
      if (!opt) return { state: state, out: retry(state), events: [] };
      state.a = { q1: opt.id };
      events.push({ name: 'q1', product: p.id, value: opt.id });
      if (opt.id === 'well' || opt.id === 'irr' || opt.id === 'little') return finishVerdict(state, p, out, events);
      state.stage = 'use';
      out = [text('Got it, thanks for being straight with me 🙏'), buttons('Quick one: how have you been using it?', USE, 500)];
      return { state: state, out: out, events: events };
    }
    if (state.stage === 'use') {
      opt = matchOption(USE, input);
      if (!opt) return { state: state, out: retry(state), events: [] };
      state.a.use = opt.id; events.push({ name: 'use', product: p.id, value: opt.id });
      if (state.a.q1 === 'notexp') { state.stage = 'reason'; state.a.reasons = []; return { state: state, out: ask(state), events: events }; }
      state.a.reasons = ['results']; // "no change yet": the visible-results question is the reason
      return finishVerdict(state, p, out, events);
    }
    if (state.stage === 'reason') {
      var picks = matchMany(reasonOptions(state), input);
      if (!picks.length) return { state: state, out: retry(state), events: [] };
      state.a.reasons = state.a.reasons || [];
      picks.forEach(function (o) {
        if (state.a.reasons.length < MAX_REASONS && state.a.reasons.indexOf(o.id) < 0) {
          state.a.reasons.push(o.id); events.push({ name: 'reason', product: p.id, value: o.id });
        }
      });
      if (picks.length > 1 || state.a.reasons.length >= MAX_REASONS || reasonOptions(state).length === 0) return finishVerdict(state, p, out, events);
      state.stage = 'more';
      return { state: state, out: ask(state), events: events };
    }
    if (state.stage === 'more') {
      var yn = String(t).trim().toLowerCase();
      opt = (!input.id && /^(yes|yep|yeah|yup|more|another|one more)\b/.test(yn)) ? MORE[0] : (!input.id && /^(no|nope|nah|all|done|nothing|that)/.test(yn)) ? MORE[1] : matchOption(MORE, input);
      if (!opt) return { state: state, out: retry(state), events: [] };
      if (opt.id === 'more') { state.stage = 'reason'; return { state: state, out: ask(state), events: [] }; }
      return finishVerdict(state, p, out, events);
    }
    if (state.stage === 'share') {
      opt = matchOption(SHARE, input);
      if (!opt) return { state: state, out: retry(state), events: [] };
      if (opt.id === 'skip') { out.push(text('No problem at all, nothing was shared 👍')); nextProductOrFinish(state, out, events); return { state: state, out: out, events: events }; }
      events.push({ name: 'shared', product: p.id });
      state.stage = 'note'; return { state: state, out: ask(state), events: events };
    }
    if (state.stage === 'note') {
      var clean = redact(t);
      if (clean && !/^skip\b/i.test(clean)) events.push({ name: 'note', product: p.id, text: clean, tags: tagsFor(clean) });
      out.push(text('Got it, thank you! 💙 It goes to the team anonymously.'));
      nextProductOrFinish(state, out, events);
      return { state: state, out: out, events: events };
    }
    return { state: state, out: ask(state), events: [] };
  }

  function finishVerdict(state, p, out, events) {
    var v = verdictFor(p, state.a);
    state.a.verdict = v.key;
    events.push({ name: 'verdict', product: p.id, value: v.key, q1: state.a.q1 });
    out.push(text(v.text, 400));
    state.stage = 'share';
    out.push(ask(state)[0]); out[out.length - 1].delay = 1000;
    return { state: state, out: out, events: events };
  }

  return {
    DEMO_DELAY_MS: DEMO_DELAY_MS, startSession: startSession, reply: reply, welcome: welcome, parseRef: parseRef,
    ask: ask, redact: redact, tagsFor: tagsFor, verdictFor: verdictFor, matchOption: matchOption, matchMany: matchMany,
    OPTIONS: { Q1: Q1, USE: USE, REASON: REASON, SHARE: SHARE, MORE: MORE }
  };
});
