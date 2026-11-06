/* FitCheck conversation engine. One engine drives both the browser chat and WhatsApp.
   It is a pure function: (state, input) -> { state, out, events }.
   Verdicts and usage guidance are fixed, reviewed text. There is no diagnosis and no free medical advice.
   Two languages: English ("en") and Hinglish ("hi", Roman Hindi mixed with English). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('../data/products.js'));
  else root.FitEngine = factory(root.FitProducts);
})(typeof self !== 'undefined' ? self : this, function (P) {
  var PRODUCTS = P.PRODUCTS;
  var DEMO_DELAY_MS = (typeof process !== 'undefined' && process.env && parseInt(process.env.FITCHECK_DEMO_DELAY_MS, 10)) || 6000;
  /* Gap between the three pre-check-in reminders (Day 2 / 5 / 8 in real life, compressed for the demo like every other wait in this engine). */
  var REMINDER_DELAY_MS = (typeof process !== 'undefined' && process.env && parseInt(process.env.FITCHECK_REMINDER_DELAY_MS, 10)) || 6000;
  var MAX_REASONS = 3;

  function wantsStop(t) {
    return /\b(stop|unsubscribe|opt.?out|no more (reminders|messages|nudges)|stop (the )?(reminders|messages|nudges)|band (karo|kijiye)|mat bhejo|rok do)\b/i.test(String(t || ''));
  }

  /* ---------- option lists (same ids in both languages; button titles max 20 characters, list rows max 24) ---------- */
  var OPT = {
    en: {
      Q1: [
        { id: 'well', title: '😊 Working well' }, { id: 'none', title: '🤔 No change yet' }, { id: 'notexp', title: '😕 Not what I expected' },
        { id: 'irr', title: '⚠️ Skin irritation' }, { id: 'little', title: '⏳ Haven’t used it much' }
      ],
      USE: [{ id: 'less', title: 'Less than directed' }, { id: 'asdir', title: 'As directed' }, { id: 'unsure', title: 'Not sure how' }],
      REASON: [
        { id: 'results', title: 'No visible results' }, { id: 'feel', title: 'Feel or texture' }, { id: 'smell', title: 'Smell' },
        { id: 'taste', title: 'Taste' }, { id: 'price', title: 'Price or value' }, { id: 'instr', title: 'Instructions unclear' }, { id: 'other', title: 'Something else' }
      ],
      HOPE: [{ id: 'better', title: 'Better than hoped' }, { id: 'as', title: 'About as hoped' }, { id: 'less', title: 'Less than hoped' }]
    },
    hi: {
      Q1: [
        { id: 'well', title: '😊 Accha chal raha hai' }, { id: 'none', title: '🤔 Abhi koi farak nahi' }, { id: 'notexp', title: '😕 Umeed jaisa nahi' },
        { id: 'irr', title: '⚠️ Skin irritation' }, { id: 'little', title: '⏳ Zyada use nahi kiya' }
      ],
      USE: [{ id: 'less', title: 'Kam use kiya' }, { id: 'asdir', title: 'Sahi se use kiya' }, { id: 'unsure', title: 'Tareeka pata nahi' }],
      REASON: [
        { id: 'results', title: 'Result nahi dikha' }, { id: 'feel', title: 'Feel ya texture' }, { id: 'smell', title: 'Smell pasand nahi' },
        { id: 'taste', title: 'Taste pasand nahi' }, { id: 'price', title: 'Price ya value' }, { id: 'instr', title: 'Directions clear nahi' }, { id: 'other', title: 'Kuch aur' }
      ],
      HOPE: [{ id: 'better', title: 'Umeed se behtar' }, { id: 'as', title: 'Umeed jaisa' }, { id: 'less', title: 'Umeed se kam' }]
    }
  };
  var LANG = [{ id: 'en', title: 'English' }, { id: 'hi', title: 'Hinglish' }];
  var Q1 = OPT.en.Q1, USE = OPT.en.USE, REASON = OPT.en.REASON; // exported for tests

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

  /* Several answers in one go: "1, 3", "feel and smell". Returns unique matches. */
  function matchMany(options, input) {
    if (input && input.id) { var one = matchOption(options, input); return one ? [one] : []; }
    var t = String(input && input.text || '').toLowerCase();
    var parts = /^[\d\s,]+$/.test(t) && /\d\s+\d|,/.test(t) ? t.split(/[\s,]+/) : t.split(/,|;|&|\+|\/|\n|\band\b|\baur\b/);
    var out = [];
    parts.forEach(function (p) {
      var o = matchOption(options, { text: p });
      if (o && out.indexOf(o) < 0) out.push(o);
    });
    if (!out.length) { var whole = matchOption(options, input); if (whole) out.push(whole); }
    return out;
  }

  /* Match against the chosen language first, then the other one (people mix languages). */
  function optsFor(lang, name) { return OPT[lang === 'hi' ? 'hi' : 'en'][name]; }
  function other(lang) { return lang === 'hi' ? 'en' : 'hi'; }
  function matchLang(lang, name, input) { return matchOption(optsFor(lang, name), input) || matchOption(optsFor(other(lang), name), input); }

  function redact(s) {
    s = String(s || '');
    s = s.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[removed]');
    s = s.replace(/https?:\/\/\S+/g, '[removed]');
    s = s.replace(/(\+?\d[\d\s().-]{5,}\d)/g, '[removed]');
    s = s.replace(/@\w+/g, '[removed]');
    return s.replace(/\s+/g, ' ').trim().slice(0, 200);
  }

  var TAGS = [
    ['results', /result|work|effect|nothing|no change|difference|improv|farak|asar/i],
    ['feel', /oily|greasy|sticky|texture|feel|thick|dry|harsh|medicinal|chipchip/i],
    ['smell', /smell|fragrance|scent|odou?r|khushbu|badbu/i],
    ['price', /price|cost|expensive|pricey|value|afford|cheap|mehang|paisa/i],
    ['instructions', /how to|instruction|direction|usage|use it|unclear|confus|how long|how often|kaise|kitni baar/i],
    ['irritation', /irritat|rash|burn|sting|red\b|redness|itch|jalan|khujli/i],
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

  /* ---------- product wording in the chosen language ---------- */
  function fld(p, name, lang) { return lang === 'hi' && p.hi && p.hi[name] ? p.hi[name] : p[name]; }
  function howLines(p, lang, max) {
    return fld(p, 'how', lang).slice(0, max || 4).map(function (s, i) { return (p.ordered ? (i + 1) + '. ' : '• ') + s; }).join('\n');
  }
  /* One short line: how long to give the product (from the stated timeline). */
  function timeShort(p, lang) {
    var st = p.stated; if (!st) return lang === 'hi' ? 'Pack par likha time dekhiye.' : 'Check your pack for how long to give it.';
    return lang === 'hi' ? 'Ise ' + st.hi + ' ka time dijiye.' : 'Give it ' + st.en + '.';
  }
  function firstSentence(t) { t = String(t || ''); var m = /^[^.!?]*[.!?](?=\s|$)/.exec(t); return m ? m[0] : t; }
  function whenText(days, lang) {
    if (lang === 'hi') return days === 7 ? 'lagbhag ek hafte' : days === 14 ? 'lagbhag do hafte' : 'lagbhag ek mahine';
    return days === 7 ? 'about a week' : days === 14 ? 'around two weeks' : 'about a month';
  }


  /* ---------- Expectation Receipt helpers ---------- */
  function cleanReceipt(rec, ids) {
    var out = {};
    ids.forEach(function (id) {
      var r = rec && rec[id]; if (!r) return;
      var valid = PRODUCTS[id].expect.map(function (o) { return o.id; });
      var o = (r.o || []).filter(function (x, i, a) { return valid.indexOf(x) >= 0 && a.indexOf(x) === i; }).slice(0, 4);
      var t = P.TIMES.filter(function (x) { return x.id === r.t; })[0] ? r.t : 'unsure';
      if (!o.length) return;
      out[id] = { o: o, t: t, gap: P.timeGap(id, t) };
    });
    return out;
  }
  function hasExp(state, p) { return !!(state.exp && state.exp[p.id] && state.exp[p.id].o && state.exp[p.id].o.length); }
  function outLabel(p, oid, lang) { var o = p.expect.filter(function (x) { return x.id === oid; })[0]; return o ? (lang === 'hi' ? o.hi : o.en) : oid; }
  function timeLabel(tid, lang) { var t = P.TIMES.filter(function (x) { return x.id === tid; })[0]; return t ? (lang === 'hi' ? t.hi : t.en).toLowerCase() : ''; }
  function expLine(p, e, lang) {
    var hi = lang === 'hi';
    return '🎯 ' + (hi ? 'Aapki umeed' : 'You hope for') + ': ' + e.o.map(function (o) { return outLabel(p, o, lang); }).join(', ') + (e.t && e.t !== 'unsure' ? ' (' + timeLabel(e.t, lang) + ')' : '');
  }
  function timingNote(state, p) {
    var e = state.exp && state.exp[p.id]; if (!e || e.gap !== 'longer' || !p.stated || !p.stated.weeks) return '';
    return state.lang === 'hi'
      ? '\n\n💡 Aapko *' + timeLabel(e.t, 'hi') + '* farak ki umeed thi, par ismein aam taur par *' + p.stated.hi + '* lagte hain. Shayad abhi jaldi hai.'
      : '\n\n💡 You hoped for a change *' + timeLabel(e.t, 'en') + '*, but it usually takes *' + p.stated.en + '*. It may simply be early.';
  }

  function guideText(p, lang, e) {
    var hi = lang === 'hi';
    return p.emoji + ' *' + p.name + '* (' + p.size + ')\n' + fld(p, 'forShort', lang) + '\n\n' +
      '*' + (hi ? 'Kaise use karein' : 'How to use') + '*\n' + howLines(p, lang, 2) + '\n\n' +
      '⏳ ' + timeShort(p, lang) + '\n⚠️ ' + (fld(p, 'cautionShort', lang) || p.cautionShort) +
      (e ? '\n\n' + expLine(p, e, lang) : '');
  }

  function cur(state) { return PRODUCTS[state.ids[state.i]]; }

  var SWAP_WAIT_MS = (typeof process !== 'undefined' && process.env && parseInt(process.env.FITCHECK_SWAP_WAIT_MS, 10)) || 50000;
  var SWAP_DELAY_MS = (typeof process !== 'undefined' && process.env && parseInt(process.env.FITCHECK_SWAP_DELAY_MS, 10)) || 30000;
  /* No in-app deep link to a specific "consult a doctor" screen was found; these are the official
     app listings, found via web search, so the customer can open the app and use its consult feature. */
  var CONSULT = { ios: 'https://apps.apple.com/in/app/id6446192851', android: 'https://play.google.com/store/apps/details?id=com.mosaicwellness.bebodywise' };
  /* Does this free-text message ask for a different product idea? EN + Hinglish. */
  function wantsAlt(t) {
    return /\b(suggest|recommend|another option|something else|other option|different product|alternative|instead of this|swap it|switch (it|product|this)|anything else i (can|could) try|kuch aur suggest|dusra option|doosra option|koi aur option|alag option|better option)\b/i.test(String(t || ''));
  }

  function checkinMsg(state) {
    var p = cur(state), n = state.ids.length, lang = state.lang, hi = lang === 'hi';
    var body;
    if (state.i === 0) {
      var d = p.checkinDays;
      var w = d === 7 ? (hi ? 'ek hafta' : 'a week') : d === 14 ? (hi ? 'do hafte' : 'two weeks') : (hi ? 'ek mahina' : 'a month');
      body = hi ? 'Hey! Aapko *' + p.nick + '* mile ' + w + ' ho gaya 🙂 Ab tak kaisa chal raha hai?'
        : 'Hey! It’s been about ' + w + ' since your *' + p.nick + '* 🙂 How’s it going?';
    } else {
      body = hi ? 'Ab *' + p.nick + '* (' + (state.i + 1) + '/' + n + '): kaisa chal raha hai?'
        : 'Now your *' + p.nick + '* (' + (state.i + 1) + '/' + n + '): how’s it going?';
    }
    return list(body, optsFor(lang, 'Q1'), hi ? 'Bataiye' : 'Tell me', state.i === 0 ? DEMO_DELAY_MS : 400);
  }

  function missedOptions(state, p) {
    var e = state.exp && state.exp[p.id];
    return (e ? e.o : []).filter(function (o) { return o !== 'other'; });
  }
  /* One question for the expectation check: with 2+ hopes it is a list ("better", "as hoped", or which hope fell short). */
  function hopeOptions(state, p, lang) {
    var mo = missedOptions(state, p), base = OPT[lang === 'hi' ? 'hi' : 'en'].HOPE, hi = lang === 'hi';
    if (mo.length < 2) return base;
    return [base[0], base[1]].concat(mo.map(function (o) { return { id: 'm:' + o, title: outLabel(p, o, lang), desc: hi ? 'Ye umeed poori nahi hui' : 'This one fell short' }; }));
  }

  /* "Taste" is offered for the gummies only. */
  function reasonOptions(state, lang) {
    var gum = state.ids && state.ids[state.i] === 'gum';
    return OPT[lang === 'hi' ? 'hi' : 'en'].REASON.filter(function (r) { return r.id !== 'taste' || gum; });
  }

  function retryText(lang) { return lang === 'hi' ? 'Maaf kijiye, samajh nahi aaya 🙈 Ek option chuniye.' : 'Sorry, I didn’t catch that 🙈 Please pick an option.'; }

  function noteQuestion(lang) {
    return lang === 'hi'
      ? 'Kya aap apne shabdon mein kuch aur batana chahenge? (optional, anonymous) Kisi aur option ka suggestion bhi maang sakte hain.'
      : 'Anything else you’d like to share, in your own words? (optional, anonymous) You can also ask for a suggestion.';
  }

  function ask(state) {
    var p = cur(state), hi = state.lang === 'hi', lang = state.lang;
    switch (state.stage) {
      case 'lang': return [greeting()];
      case 'q1': return [list(hi ? 'Aapka *' + p.nick + '* kaisa chal raha hai?' : 'How’s your *' + p.nick + '* going?', optsFor(lang, 'Q1'), hi ? 'Bataiye' : 'Tell me')];
      case 'reason': {
        var rows = reasonOptions(state, lang).map(function (r, i) { return { id: r.id, title: (i + 1) + '. ' + r.title }; });
        var rm = list(hi ? 'Sabse zyada kya pasand nahi aaya? (ek ya zyada, jaise *1, 3*)' : 'What bugs you most? (one or more, like *1, 3*)', rows, hi ? 'Chuniye' : 'Choose');
        rm.multi = true; // the browser preview shows tick-boxes; WhatsApp lists are single-choice, so typing "1, 3" also works
        if (state.flow) { // optional real multi-select: a WhatsApp Flow with tick-boxes (see README)
          return [{ kind: 'flow', flowId: state.flow, multi: true, cta: hi ? 'Options chuniye' : 'Pick options', options: reasonOptions(state, lang),
            body: hi ? 'Sabse zyada kya pasand nahi aaya? (3 tak chuniye)' : 'What bugs you most? (pick up to 3)',
            fallback: rm }];
        }
        return [rm];
      }
      case 'hope': {
        var e = state.exp[p.id], multi = missedOptions(state, p).length > 1;
        var hopes = e.o.map(function (o) { return outLabel(p, o, lang); }).join(', ');
        var opts = hopeOptions(state, p, lang), body = hi
          ? 'Aapko umeed thi: *' + hopes + '*. Ab tak ye kaisa raha?' + (multi ? ' Kam raha to wo chuniye jo sabse kam hua.' : '')
          : 'You hoped for: *' + hopes + '*. How does it compare so far?' + (multi ? ' If it fell short, pick what missed most.' : '');
        return [multi ? list(body, opts, hi ? 'Chuniye' : 'Choose') : buttons(body, opts)];
      }
      case 'other': return [text(hi ? 'Aapko kya pasand nahi aaya? Apne shabdon mein likh dijiye (naam ya number mat likhiye). Chahein to kisi aur option ka suggestion bhi maang sakte hain.' : 'What didn’t you like? Please write it in your own words (no names or numbers). You can also ask for a suggestion.')];
      case 'note': return [text(noteQuestion(lang))];
    }
    return [];
  }

  /* One or two alternative-product lines for the same issue, reused by the delayed follow-up and the on-demand reply. */
  function swapBlockFor(p, rs, lang) {
    var hi = lang === 'hi', lines = [];
    var inId = (p.swap || [])[0];
    if (inId) {
      var s = PRODUCTS[inId], w = p.swapWhy && p.swapWhy[inId];
      lines.push('• *' + s.name + '* (' + s.size + ', ₹' + s.price + ')' + (w ? ': ' + firstSentence(hi ? w.hi : w.en) : ''));
    }
    var ext = (p.swapExt || []).filter(function (e) { return e.name && (!e.when || e.when.some(function (x) { return (rs || []).indexOf(x) >= 0; })); })[0];
    if (ext) lines.push('• *' + ext.name + '* (' + ext.size + (ext.price && ext.price !== 'see site' ? ', ' + ext.price : '') + '): ' + firstSentence(hi ? ext.hi : ext.en) + (ext.url ? '\n  ' + ext.url : ''));
    if (!lines.length) lines.push(hi ? '• Is store mein iske jaisa koi option nahi hai. Support se pooch sakte hain.' : '• No close match in this store. Customer support can help.');
    return lines.join('\n');
  }

  /* The swap follow-up: short, one or two options per product, sent later as a separate message. */
  function swapFollowUp(state) {
    var hi = state.lang === 'hi';
    var blocks = (state.swaps || []).map(function (sw) {
      var p = PRODUCTS[sw.id];
      return (state.swaps.length > 1 ? '*' + p.nick + '*\n' : '') + swapBlockFor(p, sw.rs, state.lang);
    });
    if (!blocks.length) return null;
    var m = text((hi ? '💡 Ek alag option dekhna chahein to:\n\n' : '💡 If you’d like to try something different:\n\n') + blocks.join('\n\n') +
      (hi ? '\n\nNaya product try karne se pehle patch test zaroor kijiye.' : '\n\nPatch test before trying anything new.'), SWAP_DELAY_MS);
    m.late = true;
    return m;
  }

  /* Answers "can you suggest something else?" right away, for the same issue on the current product. */
  function altNow(p, rs, lang) {
    var hi = lang === 'hi';
    return text((hi ? '👍 Zaroor, isi issue ke liye ek option:\n\n' : '👍 Sure, here’s an option for the same issue:\n\n') + swapBlockFor(p, rs, lang) +
      (hi ? '\n\nNaya product try karne se pehle patch test zaroor kijiye.' : '\n\nPatch test before trying anything new.'), 500);
  }

  function reasonsOf(a) { return a.reasons && a.reasons.length ? a.reasons : (a.reason ? [a.reason] : ['results']); }

  /* Short verdicts: one line of feeling, one line of advice. "swap" and "value" also queue a swap follow-up. */
  function verdictFor(p, a, lang) {
    lang = lang === 'hi' ? 'hi' : 'en';
    var hi = lang === 'hi';
    var rs = reasonsOf(a), has = function (r) { return rs.indexOf(r) >= 0; };
    var how = howLines(p, lang, 2), tl = timeShort(p, lang);
    if (a.q1 === 'irr') {
      return { key: 'doctor', text: hi
        ? 'Ye jaankar bura laga 😔\n\n*Salaah: abhi ise use karna band kijiye.* Irritation jaldi theek na ho to doctor ya pharmacist ko dikhaiye.\n\n👩‍⚕️ Be.Bodywise app mein doctor se free consult kar sakte hain:\niOS: ' + CONSULT.ios + '\nAndroid: ' + CONSULT.android
        : 'Sorry to hear that 😔\n\n*My take: stop using it for now.* If the irritation doesn’t settle soon, see a doctor or pharmacist.\n\n👩‍⚕️ You can consult a doctor free in the Be.Bodywise app:\niOS: ' + CONSULT.ios + '\nAndroid: ' + CONSULT.android };
    }
    if (a.q1 === 'well') {
      return { key: 'keep', text: hi
        ? 'Ye sunke accha laga! 🎉\n\n*Salaah: aise hi use karte rahiye.* ' + tl
        : 'Great to hear! 🎉\n\n*My take: keep going as you are.* ' + tl };
    }
    if (a.q1 === 'little') {
      return { key: 'usage', text: hi
        ? 'Koi baat nahi 😄\n\n*Salaah: pehle regular use karke dekhiye:*\n' + how + '\n\n⏳ ' + tl
        : 'No worries 😄\n\n*My take: give it a regular go first:*\n' + how + '\n\n⏳ ' + tl };
    }
    if (has('instr')) {
      return { key: 'usage', text: hi
        ? 'Shukriya, ye kaam ki baat hai 💡\n\n*Salaah: tareeka ye hai:*\n' + how + '\n\nPack par kuch alag likha ho to pack ki baat maaniye.'
        : 'Thanks, that’s useful to know 💡\n\n*My take: the usual way is:*\n' + how + '\n\nIf your pack says otherwise, follow the pack.' };
    }
    if (has('feel') || has('smell') || has('taste')) {
      return { key: 'swap', text: hi
        ? 'Feel, smell aur taste sabki apni pasand hoti hai 🤷\n\n*Salaah: doosra option try kijiye.* Thodi der mein bhejta hoon.'
        : 'Feel, smell and taste are personal 🤷\n\n*My take: try something different.* I’ll send an idea shortly.' };
    }
    if (has('price') && !has('results') && !has('other')) {
      return { key: 'value', text: hi
        ? 'Theek hai 💸\n\n*Salaah: use karne ke tareeke mein kuch badalna nahi hai.* Worth aapka faisla hai. Ek alag option thodi der mein bhejta hoon.'
        : 'Fair enough 💸\n\n*My take: nothing to fix in how you use it.* Worth is your call. I’ll send an alternative shortly.' };
    }
    return { key: 'wait', text: hi
      ? 'Shukriya 🙏\n\n*Salaah: thoda aur time dijiye.* ' + tl
      : 'Thanks 🙏\n\n*My take: give it a bit more time.* ' + tl };
  }

  function greeting() {
    return buttons('Hey! 👋 Welcome to *FitCheck*, your buddy for getting the most out of your Be.Bodywise order.\n\nWhich language is easier?\nKaunsi language aasaan hai?', LANG);
  }

  function startSession(ids, cfg) {
    var state = { v: 4, ids: ids, i: 0, stage: 'lang', a: {}, lang: 'en', swaps: [], siteUrl: (cfg && cfg.siteUrl) || '' };
    if (cfg && cfg.flowId) state.flow = String(cfg.flowId);
    var events = [{ name: 'session_start', products: ids }];
    var exp = cleanReceipt(cfg && cfg.receipt, ids);
    if (Object.keys(exp).length) {
      state.exp = exp;
      Object.keys(exp).forEach(function (id) { events.push({ name: 'expect', product: id, outs: exp[id].o, t: exp[id].t, gap: exp[id].gap }); });
    }
    return { state: state, out: [greeting()], events: events };
  }

  /* After the language is chosen: the short guide, then the (timed) first check-in. */
  /* Three short, playful nudges before the first check-in (Day 2 / 5 / 8 of the routine in real life; compressed here
     like every other wait in this demo). Each carries a one-line routine-progress tracker, and the last one
     says how to opt out. A second product in the same order does not repeat these. */
  function reminderMessages(state, lang) {
    var p = PRODUCTS[state.ids[0]], r = p.reminders, hi = lang === 'hi';
    if (!r) return [];
    var dots = function (n) { return '🟢'.repeat(n) + '⚪'.repeat(3 - n); };
    var track = function (n, d) { return (hi ? 'Din ' + d + ' ' : 'Day ' + d + ' ') + dots(n) + (hi ? ' (routine ka ' + n + '/3)' : ' (routine check ' + n + ' of 3)'); };
    return [
      text(r.day2[lang] + '\n\n' + track(1, 2), REMINDER_DELAY_MS),
      text(r.day5[lang] + '\n\n' + track(2, 5), REMINDER_DELAY_MS),
      text(r.day8[lang] + '\n\n' + track(3, 8) + (hi ? '\n\nReminders band karni ho to kabhi bhi *stop* likh dijiye.' : '\n\nSend *stop* anytime to turn off reminders.'), REMINDER_DELAY_MS)
    ];
  }

  function beginAfterLang(state, lang) {
    state.lang = lang; state.stage = 'q1'; state.a = {};
    var guides = state.ids.map(function (id) { return guideText(PRODUCTS[id], lang, state.exp && state.exp[id]); }).join('\n\n――――――\n\n');
    var reminders = reminderMessages(state, lang);
    var cm = checkinMsg(state); cm.delay = REMINDER_DELAY_MS;
    return [text(guides, 300)].concat(reminders, [cm]);
  }

  function welcome(cfg) {
    var site = (cfg && cfg.siteUrl) || '';
    return text('Hey! 👋 I’m *FitCheck*. Order something in the demo store' + (site ? ':\n' + site : '') + '\nthen tap *Continue on WhatsApp*.\n\nOr send *demo* to try a sample product.');
  }

  function retry(state) { return [text(retryText(state.lang))].concat(ask(state)); }

  function reply(state, input, cfg) {
    var t = input && input.text || '';
    var out = [], events = [];
    var ids = parseRef(t);
    if (ids.length) return startSession(ids, cfg);
    if (/^\s*(demo|restart)\s*[!.]*\s*$/i.test(t)) return startSession(['aha5'], cfg);
    if (!state || state.stage === 'done') return { state: state || null, out: [welcome(cfg)], events: [] };
    if (wantsStop(t) && state.stage !== 'lang') {
      state.remindersOptOut = true;
      var hiStop = state.lang === 'hi';
      out.push(text(hiStop ? 'Theek hai 👍 Ab se koi reminder ya suggestion nahi bheja jayega. Baaki check-in jaari rakhte hain.' : 'Got it 👍 No more reminders or suggestions from here. Let’s carry on with the check-in.'));
      return { state: state, out: out.concat(ask(state)), events: events };
    }

    if (state.stage === 'lang') {
      var lo = matchOption(LANG, input), tt = norm(t);
      var lang = lo ? lo.id : (/hing|hindi|^hi$|hinglish/.test(tt) ? 'hi' : 'en');
      events.push({ name: 'lang', value: lang });
      return { state: state, out: beginAfterLang(state, lang), events: events };
    }

    var p = cur(state), lg = state.lang;
    var opt;
    if (state.stage === 'q1') {
      opt = matchLang(lg, 'Q1', input);
      if (!opt) return { state: state, out: retry(state), events: [] };
      state.a = { q1: opt.id };
      events.push({ name: 'q1', product: p.id, value: opt.id });
      if (opt.id === 'irr' || opt.id === 'little') return finishVerdict(state, p, out, events);
      if (hasExp(state, p)) { state.stage = 'hope'; return { state: state, out: ask(state), events: events }; }
      return afterHope(state, p, out, events);
    }
    if (state.stage === 'hope') {
      var hmatch = matchOption(hopeOptions(state, p, lg), input) || matchOption(hopeOptions(state, p, other(lg)), input);
      if (!hmatch) return { state: state, out: retry(state), events: [] };
      var ex = state.exp[p.id], mo = missedOptions(state, p);
      var hv = hmatch.id.indexOf('m:') === 0 ? 'less' : hmatch.id;
      state.a.hope = hv;
      events.push({ name: 'hope', product: p.id, value: hv, gap: ex.gap, t: ex.t });
      if (hmatch.id.indexOf('m:') === 0) events.push({ name: 'missed', product: p.id, value: hmatch.id.slice(2) });
      else if (hv === 'less' && mo.length === 1) events.push({ name: 'missed', product: p.id, value: mo[0] });
      return afterHope(state, p, out, events);
    }
    if (state.stage === 'reason') {
      var pool = reasonOptions(state, lg), otherPool = reasonOptions(state, other(lg));
      var picks = matchMany(pool, input);
      if (!picks.length) picks = matchMany(otherPool, input).map(function (o) { return pool.filter(function (x) { return x.id === o.id; })[0]; }).filter(Boolean);
      if (!picks.length) return { state: state, out: retry(state), events: [] };
      state.a.reasons = [];
      picks.forEach(function (o) {
        if (state.a.reasons.length < MAX_REASONS && state.a.reasons.indexOf(o.id) < 0) {
          state.a.reasons.push(o.id); events.push({ name: 'reason', product: p.id, value: o.id });
        }
      });
      if (state.a.reasons.indexOf('other') >= 0) { state.stage = 'other'; return { state: state, out: ask(state), events: events }; }
      return finishVerdict(state, p, out, events);
    }
    if (state.stage === 'other') {
      var ot = redact(t);
      if (ot && !/^(skip|no|nope|nah|nahi|nai|nhi|none|nothing)\b/i.test(ot)) events.push({ name: 'note', product: p.id, text: ot, tags: tagsFor(ot) });
      var askedAlt1 = wantsAlt(t);
      var r1 = finishVerdict(state, p, out, events);
      if (askedAlt1) { r1.out.push(altNow(p, reasonsOf(state.a), lg)); state.swapSent = true; } // already answered, skip the later duplicate
      return r1;
    }
    if (state.stage === 'note') {
      var clean = redact(t);
      if (clean && !/^(skip|no|nope|nah|nahi|nai|nhi|none|nothing)\b/i.test(clean)) events.push({ name: 'note', product: p.id, text: clean, tags: tagsFor(clean) });
      state.stage = 'done';
      var site = state.siteUrl || '';
      var askedAlt2 = wantsAlt(t), sf = null;
      if (askedAlt2) { out.push(altNow(p, (state.a && state.a.reasons) || ['results'], lg)); state.swapSent = true; }
      else if (!state.swapSent && !state.remindersOptOut) { sf = swapFollowUp(state); if (sf) { state.swapSent = true; } }
      out.push(text(lg === 'hi' ? 'Shukriya! 💙 Anonymously team tak pahunch gaya.' + (site ? '\n📊 Team ka view: ' + site + '/#/insights' : '')
        : 'Thank you! 💙 Shared anonymously.' + (site ? '\n📊 What the team sees: ' + site + '/#/insights' : '')));
      if (sf) out.push(sf); // the swap idea arrives 30 seconds after the conversation ends
      return { state: state, out: out, events: events };
    }
    return { state: state, out: ask(state), events: [] };
  }

  /* Continue the check-in once the expectation question (if any) is done. */
  function afterHope(state, p, out, events) {
    if (state.a.q1 === 'well') return finishVerdict(state, p, out, events);
    if (state.a.q1 === 'notexp') { state.stage = 'reason'; return { state: state, out: ask(state), events: events }; }
    state.a.reasons = ['results']; // "no change yet": no further question, the verdict is to give it time
    return finishVerdict(state, p, out, events);
  }

  /* Verdict for this product. Sharing the anonymous answers with the brand is automatic. Then the next product, or the one optional closing question. */
  function finishVerdict(state, p, out, events) {
    var v = verdictFor(p, state.a, state.lang);
    if (v.key === 'wait' || (v.key === 'keep' && state.a.hope === 'less')) v.text += timingNote(state, p);
    state.a.verdict = v.key;
    events.push({ name: 'verdict', product: p.id, value: v.key, q1: state.a.q1 });
    events.push({ name: 'shared', product: p.id });
    if (v.key === 'swap' || v.key === 'value') { state.swaps = state.swaps || []; state.swaps.push({ id: p.id, rs: reasonsOf(state.a) }); }
    out.push(text(v.text, 300));
    state.i += 1;
    if (state.i < state.ids.length) {
      state.stage = 'q1'; state.a = {};
      out.push(checkinMsg(state));
    } else {
      state.i = state.ids.length - 1; // the closing note belongs to the last product
      state.stage = 'note';
      out.push(ask(state)[0]); out[out.length - 1].delay = 2500;
      events.push({ name: 'session_end' });
      var f = state.remindersOptOut ? null : swapFollowUp(state);
      if (f) { f.delay = SWAP_WAIT_MS; f.pending = true; out.push(f); } // only sent if they have not answered by then, and not if they opted out
    }
    return { state: state, out: out, events: events };
  }

  return {
    DEMO_DELAY_MS: DEMO_DELAY_MS, SWAP_DELAY_MS: SWAP_DELAY_MS, startSession: startSession, reply: reply, welcome: welcome, parseRef: parseRef,
    ask: ask, redact: redact, tagsFor: tagsFor, verdictFor: verdictFor, matchOption: matchOption, matchMany: matchMany, cleanReceipt: cleanReceipt,
    OPTIONS: { HOPE: OPT.en.HOPE, Q1: Q1, USE: USE, REASON: REASON, LANG: LANG, hi: OPT.hi, en: OPT.en }
  };
});
