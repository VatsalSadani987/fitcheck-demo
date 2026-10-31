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
  var MAX_REASONS = 3;

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
        { id: 'price', title: 'Price or value' }, { id: 'instr', title: 'Instructions unclear' }, { id: 'other', title: 'Something else' }
      ],
      SHARE: [{ id: 'share_note', title: 'Share + add a note' }, { id: 'share', title: 'Share, no note' }, { id: 'skip', title: 'No thanks' }],
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
        { id: 'price', title: 'Price ya value' }, { id: 'instr', title: 'Directions clear nahi' }, { id: 'other', title: 'Kuch aur' }
      ],
      SHARE: [{ id: 'share_note', title: 'Share + note likhna' }, { id: 'share', title: 'Bas share kijiye' }, { id: 'skip', title: 'Nahi, rehne dijiye' }],
      HOPE: [{ id: 'better', title: 'Umeed se behtar' }, { id: 'as', title: 'Umeed jaisa' }, { id: 'less', title: 'Umeed se kam' }]
    }
  };
  var LANG = [{ id: 'en', title: 'English' }, { id: 'hi', title: 'Hinglish' }];
  var Q1 = OPT.en.Q1, USE = OPT.en.USE, REASON = OPT.en.REASON, SHARE = OPT.en.SHARE; // exported for tests

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
  function timeLine(p, lang) {
    if (p.judge === P.NOT_STATED) return lang === 'hi' ? 'Humne jo pages dekhe, unmein ye nahi likha ki kitna time dena hai. Aapka pack hi sabse accha guide hai.' : 'The pages I checked don’t say how long to give it, so your pack is the best guide.';
    return fld(p, 'judge', lang);
  }
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
    var line = '🎯 *' + (hi ? 'Aapki umeed' : 'What you’re hoping for') + ':* ' + e.o.map(function (o) { return outLabel(p, o, lang); }).join(', ') + (e.t && e.t !== 'unsure' ? ' (' + timeLabel(e.t, lang) + ')' : '');
    if (e.gap === 'longer' && p.stated && p.stated.weeks) {
      line += '\n\n' + (hi ? 'Dhyan rakhein: pack aur listing ' + p.stated.hi + ' ki baat karte hain, isliye ye aapki umeed se thoda zyada time le sakta hai.'
        : 'Heads up: the pack and listing point to ' + p.stated.en + ', so it may take a little longer than you hope.');
    }
    return line;
  }
  function timingNote(state, p) {
    var e = state.exp && state.exp[p.id]; if (!e || e.gap !== 'longer' || !p.stated || !p.stated.weeks) return '';
    return state.lang === 'hi'
      ? '\n\n💡 Ek baat aur: aapko *' + timeLabel(e.t, 'hi') + '* farak dikhne ki umeed thi, lekin pack aur listing *' + p.stated.hi + '* ki baat karte hain. Ho sakta hai abhi bahut jaldi ho.'
      : '\n\n💡 One more thing: you were hoping for a change *' + timeLabel(e.t, 'en') + '*, but the pack and listing point to *' + p.stated.en + '*. So it may simply be early.';
  }

  function guideText(p, lang, e) {
    var hi = lang === 'hi';
    return p.emoji + ' *' + p.name + '* (' + p.size + ')\n\n' +
      '*' + (hi ? 'Ye kis liye hai' : 'What it’s for') + '*\n' + fld(p, 'forShort', lang) + '\n\n' +
      '*' + (hi ? 'Kaise use karein' : 'How to use') + '*\n' + howLines(p, lang, 4) + '\n\n' +
      '*' + (hi ? 'Kitna time dena hai' : 'Give it time') + '* ⏳\n' + timeLine(p, lang) + '\n\n' +
      '*' + (hi ? 'Dhyan rakhne wali baatein' : 'Good to know') + '*\n' + fld(p, 'good', lang).map(function (g) { return '• ' + g; }).join('\n') +
      (e ? '\n\n' + expLine(p, e, lang) : '');
  }

  function cur(state) { return PRODUCTS[state.ids[state.i]]; }

  function checkinMsg(state) {
    var p = cur(state), n = state.ids.length, lang = state.lang, hi = lang === 'hi';
    var body;
    if (state.i === 0) {
      var d = p.checkinDays;
      var w = d === 7 ? (hi ? 'ek hafta ho gaya' : 'a week') : d === 14 ? (hi ? 'do hafte ho gaye' : 'two weeks') : (hi ? 'ek mahina ho gaya' : 'a month');
      body = hi ? 'Hey! Aapko apna *' + p.nick + '* mile lagbhag ' + w + ' 🙂\n\nAb tak ye kaisa chal raha hai?'
        : 'Hey! It’s been about ' + w + ' since you got your *' + p.nick + '* 🙂\n\nHow’s it treating you so far?';
    } else {
      body = hi ? 'Ab aapke *' + p.nick + '* ke baare mein baat karte hain (' + (state.i + 1) + ' / ' + n + ') 🙂\n\nYe kaisa chal raha hai?'
        : 'Now for your *' + p.nick + '* (' + (state.i + 1) + ' of ' + n + ') 🙂\n\nHow’s that one going?';
    }
    return list(body, optsFor(lang, 'Q1'), hi ? 'Bataiye' : 'Tell me', state.i === 0 ? DEMO_DELAY_MS : 600);
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

  function reasonOptions(state, lang) {
    return OPT[lang === 'hi' ? 'hi' : 'en'].REASON;
  }

  function retryText(lang) { return lang === 'hi' ? 'Maaf kijiye, samajh nahi aaya 🙈 Kripya ek option chuniye.' : 'Sorry, I didn’t catch that 🙈 Could you pick one of the options?'; }

  function ask(state) {
    var p = cur(state), hi = state.lang === 'hi', lang = state.lang;
    switch (state.stage) {
      case 'lang': return [greeting()];
      case 'q1': return [list(hi ? 'Aapka *' + p.nick + '* kaisa chal raha hai?' : 'How’s your *' + p.nick + '* going?', optsFor(lang, 'Q1'), hi ? 'Bataiye' : 'Tell me')];
      case 'use': return [buttons(hi ? 'Ek chhota sa sawal: aap ise kaise use kar rahe hain?' : 'Quick one: how have you been using it?', optsFor(lang, 'USE'))];
      case 'reason': {
        var rows = reasonOptions(state, lang).map(function (r, i) { return { id: r.id, title: (i + 1) + '. ' + r.title }; });
        var rm = list(hi
          ? 'Sabse zyada kya pasand nahi aaya? 👀\n\nList se ek chuniye, ya ek saath kai options likh dijiye, jaise *1, 3*.'
          : 'What’s bugging you most? 👀\n\nTap one from the list, or type several numbers in one go, like *1, 3*.', rows, hi ? 'Chuniye' : 'Choose');
        rm.multi = true; // the browser preview shows tick-boxes; WhatsApp lists are single-choice, so typing "1, 3" also works
        if (state.flow) { // optional real multi-select: a WhatsApp Flow with tick-boxes (see README)
          return [{ kind: 'flow', flowId: state.flow, multi: true, cta: hi ? 'Options chuniye' : 'Pick options', options: reasonOptions(state, lang),
            body: hi ? 'Sabse zyada kya pasand nahi aaya? 👀\n\nNeeche tap karke jo bhi lage, sab chun lijiye (3 tak).' : 'What’s bugging you? 👀\n\nTap below and tick everything that applies (up to 3).',
            fallback: rm }];
        }
        return [rm];
      }
      case 'hope': {
        var e = state.exp[p.id], multi = missedOptions(state, p).length > 1;
        var hopes = e.o.map(function (o) { return outLabel(p, o, lang); }).join(', ');
        var when = e.t && e.t !== 'unsure' ? (hi ? ', aur ye *' + timeLabel(e.t, lang) + '*' : ' (' + timeLabel(e.t, lang) + ')') : '';
        var opts = hopeOptions(state, p, lang), body = hi
          ? 'Aapko ye umeed thi: *' + hopes + '*' + when + '.\n\nAb tak ye aapki umeed ke hisaab se kaisa raha?' + (multi ? ' Agar umeed se kam raha, to wo chuniye jo sabse kam poori hui.' : '')
          : 'You were hoping for: *' + hopes + '*' + when + '.\n\nHow does it compare so far?' + (multi ? ' If it fell short, pick the hope that missed most.' : '');
        return [multi ? list(body, opts, hi ? 'Chuniye' : 'Choose') : buttons(body, opts)];
      }
      case 'share': return [buttons(hi
        ? 'Ek aakhri baat 🙌\n\nKya aap Be.Bodywise team ko apna experience batana chahenge? Ye bilkul anonymous hai: na naam, na number.'
        : 'Last thing 🙌\n\nWant to tell the Be.Bodywise team how this went? It’s completely anonymous: no name, no number.', optsFor(lang, 'SHARE'))];
      case 'note': return [text(hi
        ? 'Shukriya! Chahein to apne shabdon mein ek line likh dijiye (naam ya number mat likhiye), ya *skip* bhej dijiye.'
        : 'Thank you! Add a line in your own words if you like (no names or numbers please), or just send *skip*.')];
    }
    return [];
  }

  function swapText(p, lang, rs) {
    var hi = lang === 'hi';
    var lines = (p.swap || []).map(function (id) {
      var s = PRODUCTS[id], w = p.swapWhy && p.swapWhy[id];
      return '• *' + s.name + '* (' + s.size + ', demo price ₹' + s.price + '): ' + fld(s, 'forShort', lang) + (w ? '\n  ' + (hi ? w.hi : w.en) : '');
    });
    var ext = (p.swapExt || []).filter(function (e) { return !e.when || e.when.some(function (w) { return rs && rs.indexOf(w) >= 0; }); })
      .map(function (e) { return '• ' + (hi ? e.hi : e.en); });
    if (!lines.length && !ext.length) return hi ? 'Is store mein iske jaisa koi doosra product nahi hai. Aap ye kar sakte hain: use karne ka tareeka badal sakte hain, thoda aur time de sakte hain, ya customer support se pooch sakte hain.'
      : 'There’s no like-for-like swap in this store, so your options are adjusting how you use it, giving it more time, or asking customer support.';
    var body = (lines.length ? (hi ? 'Isi range mein ek aur option dekh sakte hain:\n' : 'A swap in the same range to consider:\n') + lines.join('\n') : '') + (lines.length && ext.length ? '\n\n' : '') + ext.join('\n');
    return body + (hi ? '\n\nYe pakka nahi hai ki ye aapko zyada suit karega, isliye pack par ingredient list compare kijiye aur patch test zaroor kijiye.'
        : '\n\nI can’t promise it’ll suit you better, so compare the ingredient list on the pack and do a patch test.');
  }

  function reasonsOf(a) { return a.reasons && a.reasons.length ? a.reasons : (a.reason ? [a.reason] : ['results']); }

  function verdictFor(p, a, lang) {
    lang = lang === 'hi' ? 'hi' : 'en';
    var hi = lang === 'hi';
    var rs = reasonsOf(a), has = function (r) { return rs.indexOf(r) >= 0; };
    var how = howLines(p, lang, 4), tl = timeLine(p, lang), sw = swapText(p, lang, rs);
    if (a.q1 === 'irr') {
      return { key: 'doctor', text: hi
        ? 'Ye jaankar bura laga 😔\n\n*Hamari salaah: abhi ise use karna band kar dijiye.*\n\nIrritation jaldi theek na ho, to kisi doctor ya pharmacist ko dikhaiye. Hum skin ki problem diagnose nahi kar sakte, aur aapka comfort sabse pehle hai.\n\nPack par likhi saavdhaniyan ek baar phir se padh lijiye.'
        : 'I’m really sorry that happened 😔\n\n*My take: stop using it for now.*\n\nIf the irritation doesn’t settle soon, please see a doctor or pharmacist. I can’t diagnose skin problems, and your comfort comes first.\n\nIt’s also worth re-reading the cautions on your pack.' };
    }
    if (a.q1 === 'well') {
      return { key: 'keep', text: hi
        ? 'Ye sunke accha laga! 🎉\n\n*Hamari salaah: aise hi use karte rahiye.* Jaise abhi use kar rahe hain, waise hi chalne dijiye aur product ko apna kaam karne ka time dijiye.\n\n⏳ ' + tl
        : 'Love to hear that! 🎉\n\n*My take: keep going.* Stick with how you’re using it now and let it do its thing.\n\n⏳ ' + tl };
    }
    if (a.q1 === 'little') {
      return { key: 'usage', text: hi
        ? 'Koi baat nahi, kabhi kabhi time nahi mil pata 😄\n\n*Hamari salaah: pehle ise achhe se try kijiye.* Sahi trial ke liye directions ke hisaab se regular use zaroori hai:\n\n' + how + '\n\n⏳ ' + tl
        : 'Totally fine, life gets busy 😄\n\n*My take: give it a proper go first.* A fair trial needs regular use, as directed:\n\n' + how + '\n\n⏳ ' + tl };
    }
    if (a.use === 'less' || a.use === 'unsure') {
      return { key: 'usage', text: hi
        ? 'Sach batane ke liye shukriya 🙏\n\n*Hamari salaah: pehle use karne ka tareeka theek karte hain.* Directions ke hisaab se use kiye bina product ke baare mein faisla karna mushkil hota hai. Short mein steps ye hain:\n\n' + how + '\n\n⏳ Uske baad thoda time dijiye. ' + tl
        : 'Thanks for being honest 🙏\n\n*My take: let’s sort out how it’s used first.* It’s hard to judge a product that isn’t used as directed. Here’s the quick version:\n\n' + how + '\n\n⏳ Then give it time. ' + tl };
    }
    var extra = (has('price') && (has('feel') || has('smell') || has('results') || has('instr'))) ? '\n\n' + (hi ? 'Price ki baat: ye aapke liye worth hai ya nahi, ye sirf aap hi tay kar sakte hain.' : 'On price: only you can say whether it’s worth it for you.') : '';
    if (has('instr')) {
      return { key: 'usage', text: hi
        ? 'Shukriya, ye brand ke liye bahut kaam ki baat hai 💡\n\n*Hamari salaah: instructions aur clear hone chahiye.* Pack aur listing mein ye likha hai:\n\n' + how + '\n\nAgar aapke pack par kuch alag likha hai, to pack ki baat maaniye ya customer support se poochiye.' + extra
        : 'Thanks, this one is really useful for the brand to hear 💡\n\n*My take: the instructions need to be clearer.* Here’s what the pack and listing say:\n\n' + how + '\n\nIf your pack says something different, go with your pack, or ask customer support.' + extra };
    }
    if (has('feel') || has('smell')) {
      return { key: 'swap', text: hi
        ? 'Sahi baat hai, feel aur smell sabki apni pasand hoti hai 🤷\n\n*Hamari salaah: koi doosra option try karke dekhiye.* Use karne ka tareeka badalne se isme zyada farak nahi padega.\n\n' + sw + extra
        : 'That’s fair, feel and smell are very personal 🤷\n\n*My take: consider a swap.* Using it differently won’t change those much.\n\n' + sw + extra };
    }
    if (has('price') && !has('results') && !has('other')) {
      return { key: 'value', text: hi
        ? 'Theek hai 💸\n\n*Hamari salaah: use karne ke tareeke mein kuch badalne ki zaroorat nahi hai.* Ye price ke hisaab se worth hai ya nahi, ye aapka faisla hai.\n\n' + sw
        : 'Fair enough 💸\n\n*My take: nothing to fix in how you’re using it.* Whether it’s worth the price is really your call.\n\n' + sw };
    }
    return { key: 'wait', text: hi
      ? 'Bataane ke liye shukriya 🙏\n\n*Hamari salaah: thoda aur time dijiye.* Aap directions ke hisaab se use kar rahe hain, to ab time hi agla kadam hai.\n\n⏳ ' + tl + '\n\nAgar us samay tak bhi koi farak na dikhe, to doosra option dekhna ya doctor/pharmacist se baat karna madad kar sakta hai.\n\n' + sw + extra
      : 'Thanks for sharing 🙏\n\n*My take: give it more time.* You’re using it as directed, so time is the next step.\n\n⏳ ' + tl + '\n\nIf you reach that point with no change, a swap or a word with a doctor or pharmacist could help.\n\n' + sw + extra };
  }

  function nextProductOrFinish(state, out, events) {
    var before = out.length;
    nextProductOrFinish0(state, out, events);
    // Last product: fold the short "thank you" into the closing message so there is one message less.
    if (state.stage === 'done' && before > 0 && out.length === before + 1 && out[before - 1].kind === 'text') {
      out[before - 1].body += '\n\n' + out[before].body; out.pop();
    }
  }
  function nextProductOrFinish0(state, out, events) {
    state.i += 1;
    var hi = state.lang === 'hi';
    if (state.i < state.ids.length) {
      state.stage = 'q1'; state.a = {};
      out.push(checkinMsg(state));
    } else {
      state.stage = 'done';
      var siteUrl = state.siteUrl || '';
      out.push(text(hi
        ? 'Bas, FitCheck ka poora loop yahi hai 🎉\n\nAsli duniya mein check-in 1 se 4 hafte baad aata hai, kuch second mein nahi. Brand ko sirf anonymous reasons dikhte hain, aapka number kabhi nahi.' + (siteUrl ? '\n\n📊 Team ko ye dikhta hai:\n' + siteUrl + '/#/insights' : '') + '\n\nDobara try karne ke liye *demo* bhejiye.'
        : 'And that’s the whole FitCheck loop 🎉\n\nIn real life, check-ins arrive after 1 to 4 weeks, not a few seconds. The brand only ever sees anonymous reasons, never your number.' + (siteUrl ? '\n\n📊 See what the team sees:\n' + siteUrl + '/#/insights' : '') + '\n\nSend *demo* to try again.', 900));
      events.push({ name: 'session_end' });
    }
  }

  function greeting() {
    return buttons('Hey! 👋 Welcome to *FitCheck*, your buddy for getting the most out of your Be.Bodywise order.\n\nWhich language is easier for you?\nAapke liye kaunsi language aasaan hai?\n\n_A sample idea by Vatsal Sadani, St. Xavier’s College (Autonomous), Kolkata._', LANG);
  }

  function startSession(ids, cfg) {
    var state = { v: 3, ids: ids, i: 0, stage: 'lang', a: {}, lang: 'en', siteUrl: (cfg && cfg.siteUrl) || '' };
    if (cfg && cfg.flowId) state.flow = String(cfg.flowId);
    var events = [{ name: 'session_start', products: ids }];
    var exp = cleanReceipt(cfg && cfg.receipt, ids);
    if (Object.keys(exp).length) {
      state.exp = exp;
      Object.keys(exp).forEach(function (id) { events.push({ name: 'expect', product: id, outs: exp[id].o, t: exp[id].t, gap: exp[id].gap }); });
    }
    return { state: state, out: [greeting()], events: events };
  }

  /* After the language is chosen: the guide, then the (timed) first check-in. */
  function beginAfterLang(state, lang) {
    state.lang = lang; state.stage = 'q1'; state.a = {};
    var hi = lang === 'hi', p0 = PRODUCTS[state.ids[0]];
    var guides = state.ids.map(function (id) { return guideText(PRODUCTS[id], lang, state.exp && state.exp[id]); }).join('\n\n――――――\n\n');
    var tail = hi
      ? 'Hum ' + whenText(p0.checkinDays, lang) + ' baad aapse poochenge ki kaisa chal raha hai. Is demo mein ye bas kuch second mein aa jayega ⏱'
      : 'I’ll message you in ' + whenText(p0.checkinDays, lang) + ' to see how it’s going. For this demo, that’s just a few seconds from now ⏱';
    return [text(guides + '\n\n――――――\n\n' + tail, 400), checkinMsg(state)];
  }

  function welcome(cfg) {
    var site = (cfg && cfg.siteUrl) || '';
    return text('Hey! 👋 I’m *FitCheck*. I help you give a new product a fair trial and work out what to do next.\n\nTo start, order something in the demo store' + (site ? ':\n' + site : '') + '\nthen tap *Continue on WhatsApp*.\n\nOr send *demo* and I’ll show you how it works with a sample product.');
  }

  function retry(state) { return [text(retryText(state.lang))].concat(ask(state)); }

  function reply(state, input, cfg) {
    var t = input && input.text || '';
    var out = [], events = [];
    var ids = parseRef(t);
    if (ids.length) return startSession(ids, cfg);
    if (/^\s*(demo|restart)\s*[!.]*\s*$/i.test(t)) return startSession(['aha5'], cfg);
    if (!state || state.stage === 'done') return { state: state || null, out: [welcome(cfg)], events: [] };

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
    if (state.stage === 'use') {
      opt = matchLang(lg, 'USE', input);
      if (!opt) return { state: state, out: retry(state), events: [] };
      state.a.use = opt.id; events.push({ name: 'use', product: p.id, value: opt.id });
      state.a.reasons = ['results']; // "no change yet": the visible-results question is the reason
      return finishVerdict(state, p, out, events);
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
      return finishVerdict(state, p, out, events);
    }
    if (state.stage === 'share') {
      opt = matchLang(lg, 'SHARE', input);
      if (!opt && !input.id) {
        var yn2 = String(t).trim().toLowerCase();
        if (/^(yes|yep|yeah|sure|haan|han|ok)/.test(yn2)) opt = optsFor(lg, 'SHARE')[0];
        else if (/^(no|nope|nah|nahi|nai|nhi)/.test(yn2)) opt = optsFor(lg, 'SHARE')[2];
      }
      if (!opt) return { state: state, out: retry(state), events: [] };
      if (opt.id === 'skip') { if (state.i + 1 < state.ids.length) out.push(text(lg === 'hi' ? 'Koi baat nahi, kuch share nahi kiya gaya 👍' : 'No problem at all, nothing was shared 👍')); nextProductOrFinish(state, out, events); return { state: state, out: out, events: events }; }
      events.push({ name: 'shared', product: p.id });
      if (opt.id === 'share') { out.push(text(lg === 'hi' ? 'Shukriya! 💙 Ye team tak anonymously pahunchega.' : 'Thank you! 💙 It goes to the team anonymously.')); nextProductOrFinish(state, out, events); return { state: state, out: out, events: events }; }
      state.stage = 'note'; return { state: state, out: ask(state), events: events };
    }
    if (state.stage === 'note') {
      var clean = redact(t);
      if (clean && !/^skip\b/i.test(clean)) events.push({ name: 'note', product: p.id, text: clean, tags: tagsFor(clean) });
      out.push(text(lg === 'hi' ? 'Mil gaya, shukriya! 💙 Ye team tak anonymously pahunchega.' : 'Got it, thank you! 💙 It goes to the team anonymously.'));
      nextProductOrFinish(state, out, events);
      return { state: state, out: out, events: events };
    }
    return { state: state, out: ask(state), events: [] };
  }

  /* Continue the check-in once the expectation question (if any) is done. */
  function afterHope(state, p, out, events) {
    if (state.a.q1 === 'well') return finishVerdict(state, p, out, events);
    state.stage = state.a.q1 === 'notexp' ? 'reason' : 'use'; // "not what I expected" asks why; "no change" asks how it was used
    return { state: state, out: ask(state), events: events };
  }

  function finishVerdict(state, p, out, events) {
    var v = verdictFor(p, state.a, state.lang);
    if (v.key === 'wait' || (v.key === 'keep' && state.a.hope === 'less')) v.text += timingNote(state, p);
    state.a.verdict = v.key;
    events.push({ name: 'verdict', product: p.id, value: v.key, q1: state.a.q1 });
    out.push(text(v.text, 300));
    state.stage = 'share';
    out.push(ask(state)[0]); out[out.length - 1].delay = 600;
    return { state: state, out: out, events: events };
  }

  return {
    DEMO_DELAY_MS: DEMO_DELAY_MS, startSession: startSession, reply: reply, welcome: welcome, parseRef: parseRef,
    ask: ask, redact: redact, tagsFor: tagsFor, verdictFor: verdictFor, matchOption: matchOption, matchMany: matchMany, cleanReceipt: cleanReceipt,
    OPTIONS: { HOPE: OPT.en.HOPE, Q1: Q1, USE: USE, REASON: REASON, SHARE: SHARE, LANG: LANG, hi: OPT.hi, en: OPT.en }
  };
});
