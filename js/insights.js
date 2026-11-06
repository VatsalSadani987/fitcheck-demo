/* FitCheck Insights: what the brand team would see. Live tab reads anonymous counts from the database,
   Sample tab shows clearly-labelled invented data. Charts are plain SVG/HTML (no libraries). */
(function () {
  var P = window.FitProducts, PRODUCTS = P.PRODUCTS, ORDER = P.ORDER;
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var $ = function (s, el) { return (el || document).querySelector(s); };

  var L = {
    q1: { well: 'Working well', none: 'No change yet', notexp: 'Not what I expected', irr: 'Skin irritation', little: 'Haven’t used much' },
    verdict: { keep: 'Keep going', wait: 'Wait longer', usage: 'Adjust usage', swap: 'Consider a swap', value: 'Value is their call', doctor: 'See a doctor' },
    reason: { results: 'No visible results', feel: 'Feel or texture', smell: 'Smell', taste: 'Taste', price: 'Price or value', instr: 'Instructions unclear', other: 'Something else' }
  };
  var SLOT = ['var(--s1)', 'var(--s2)', 'var(--s3)', 'var(--s4)', 'var(--s5)', 'var(--s6)', 'var(--s7)', 'var(--s8)'];

  /* ---------- sample data (invented, consistent) ---------- */
  function buildSample() {
    var started = { sa1: 22, aha5: 34, roll: 18, gum: 20, serum: 16, lotion: 10 };
    var mix = { // answered share, then q1 mix: well, none, notexp, irr, little
      sa1: [0.88, [.50, .14, .16, .06, .14]], aha5: [0.86, [.38, .18, .26, .06, .12]], roll: [0.9, [.50, .12, .22, .04, .12]],
      gum: [0.85, [.42, .30, .12, 0, .16]], serum: [0.88, [.40, .24, .20, 0, .16]], lotion: [0.9, [.44, .12, .22, .10, .12]]
    };
    var c = { sessions: 96, 'src:whatsapp': 41, 'src:web': 55 };
    var q1k = ['well', 'none', 'notexp', 'irr', 'little'];
    ORDER.forEach(function (id) {
      c['pstart:' + id] = started[id];
      var ans = Math.round(started[id] * mix[id][0]);
      q1k.forEach(function (k, i) {
        var n = Math.round(ans * mix[id][1][i]); if (!n) return;
        c['pq:' + id + ':' + k] = n; c['q1:' + k] = (c['q1:' + k] || 0) + n;
        var v = k === 'well' ? [['keep', 1]] : k === 'irr' ? [['doctor', 1]] : k === 'little' ? [['usage', 1]]
          : k === 'none' ? [['wait', .6], ['usage', .4]] : [['swap', .4], ['usage', .3], ['value', .15], ['wait', .15]];
        var left = n;
        v.forEach(function (x, j) { var m = j === v.length - 1 ? left : Math.round(n * x[1]); left -= m; if (m > 0) { c['verdict:' + x[0]] = (c['verdict:' + x[0]] || 0) + m; c['pverdict:' + id + ':' + x[0]] = m; } });
      });
    });
    var notexp = c['q1:notexp'] || 0;
    var rs = [['results', .30], ['feel', .26], ['smell', .12], ['price', .14], ['instr', .26], ['other', .06]];
    rs.forEach(function (r) { c['reason:' + r[0]] = Math.round(notexp * r[1] * 1.3); });
    var low = (c['q1:none'] || 0) + notexp;
    var vt = 0; Object.keys(L.verdict).forEach(function (k) { vt += c['verdict:' + k] || 0; });
    c.shared = Math.round(vt * .46); c.notes = 4; c.done = Math.round(vt * .8);
    /* Expectation receipts (invented). One product per decision, so every outcome shows. */
    var X = {
      aha5: { n: 30, hope: [3, 8, 15], gap: { longer: 22, aligned: 5, unknown: 0, unsure: 3 }, lessLonger: 11, t: { w2: 18, w4: 8, m3: 2, unsure: 2 }, o: [20, 14, 12, 6], m: [9, 4, 2] },
      serum: { n: 14, hope: [2, 4, 6], gap: { longer: 3, aligned: 9, unknown: 0, unsure: 2 }, lessLonger: 1, t: { w2: 3, w4: 6, m3: 4, unsure: 1 }, o: [9, 7, 5, 2], m: [3, 2, 1], pr: { instr: 6, feel: 3, results: 3 } },
      roll: { n: 15, hope: [2, 5, 6], gap: { longer: 0, aligned: 0, unknown: 13, unsure: 2 }, lessLonger: 0, t: { w2: 9, w4: 4, m3: 0, unsure: 2 }, o: [11, 8, 5, 2], m: [4, 2, 0], pr: { feel: 4, results: 2, smell: 1 } },
      sa1: { n: 16, hope: [5, 6, 3], gap: { longer: 2, aligned: 12, unknown: 0, unsure: 2 }, lessLonger: 1, t: { w2: 5, w4: 7, m3: 3, unsure: 1 }, o: [12, 9, 6, 2], m: [2, 1, 0] },
      gum: { n: 12, hope: [1, 6, 4], gap: { longer: 3, aligned: 7, unknown: 0, unsure: 2 }, lessLonger: 1, t: { w2: 2, w4: 4, m3: 5, unsure: 1 }, o: [8, 6, 4, 1], m: [2, 1, 1] },
      lotion: { n: 6, hope: [1, 1, 1], gap: { longer: 0, aligned: 5, unknown: 0, unsure: 1 }, lessLonger: 0, t: { w2: 4, w4: 1, m3: 0, unsure: 1 }, o: [4, 3, 2, 1], m: [1, 0, 0] }
    };
    ORDER.forEach(function (id) {
      var x = X[id], ex = PRODUCTS[id].expect;
      c['x:n:' + id] = x.n;
      x.o.forEach(function (v, i) { if (v && ex[i]) c['x:o:' + id + ':' + ex[i].id] = v; });
      x.m.forEach(function (v, i) { if (v && ex[i]) c['x:m:' + id + ':' + ex[i].id] = v; });
      Object.keys(x.t).forEach(function (t) { if (x.t[t]) c['x:t:' + id + ':' + t] = x.t[t]; });
      Object.keys(x.gap).forEach(function (g) { if (x.gap[g]) c['x:g:' + id + ':' + g] = x.gap[g]; });
      ['better', 'as', 'less'].forEach(function (h, i) { c['x:h:' + id + ':' + h] = x.hope[i]; });
      if (x.lessLonger) c['x:xt:' + id + ':longer:less'] = x.lessLonger;
      if (x.pr) Object.keys(x.pr).forEach(function (r) { c['preason:' + id + ':' + r] = x.pr[r]; });
    });
    return {
      counts: c, updated: 0, persistent: true,
      feed: [],
      notes: [
        { product: 'aha5', tags: ['instructions', 'results'], text: 'Did not know how many times a week to use it, so I stopped after two weeks.' },
        { product: 'roll', tags: ['feel'], text: 'Works for odour but feels sticky for the first minute.' },
        { product: 'serum', tags: ['feel'], text: 'Left my hair looking oily by evening.' },
        { product: 'sa1', tags: ['price'], text: 'Works well, but I found a cheaper option.' }
      ]
    };
  }

  /* Example of what the Gemini readout looks like. Written by hand to match the invented sample numbers; NOT generated live. */
  var SAMPLE_AI = { source: 'gemini', sample: true,
    headline: 'Unclear directions and mismatched timing, more than the products themselves, drive most disappointment.',
    expectation: [
      { lead: '5% AHA BHA wash:', detail: 'judged too early. Most expected change within 2 weeks, but it needs 3 to 4 months.' },
      { lead: 'Hair Growth Serum:', detail: 'falls short mostly because directions are unclear.' },
      { lead: '1% salicylic wash:', detail: 'meets or beats what customers hoped for.' }
    ],
    themes: [
      { title: 'Timing expectations', detail: 'Most 5% AHA BHA wash customers expected results within 2 weeks. The brand page says 3 to 4 months, and 58% said it fell short of their hope.' },
      { title: 'Unclear directions', detail: 'Half of the reasons given for the Hair Growth Serum were unclear instructions on how much and how often to use it.' },
      { title: 'Feel of the roll-on', detail: 'The underarm roll-on gets mixed feedback on feel (sticky for the first minute). Worth a look before the next batch.' }
    ],
    actions: ['Show the 3 to 4 month timeline on the wash page and in the order confirmation.', 'Add how much and how often to the serum page and pack.', 'Review the roll-on feel notes with the product team.'] };

  /* ---------- helpers ---------- */
  function sumPrefix(c, prefix) { var n = 0; Object.keys(c).forEach(function (k) { if (k.indexOf(prefix) === 0 && k.split(':').length === prefix.split(':').length) n += c[k]; }); return n; }
  function series(map, c, prefix) { return Object.keys(map).map(function (k, i) { return { key: k, label: map[k], value: c[prefix + ':' + k] || 0, color: SLOT[i] }; }); }
  function pct(a, b) { return b ? Math.round(100 * a / b) : 0; }
  function ago(t) {
    var s = Math.max(1, Math.round((Date.now() - t) / 1000));
    if (s < 60) return s + 's ago'; if (s < 3600) return Math.round(s / 60) + ' min ago'; if (s < 86400) return Math.round(s / 3600) + ' h ago';
    return new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  /* ---------- chart pieces ---------- */
  function donut(items, centreLabel) {
    var total = items.reduce(function (n, x) { return n + x.value; }, 0);
    var r = 52, C = 2 * Math.PI * r, gap = total > 0 && items.filter(function (x) { return x.value > 0; }).length > 1 ? 3 : 0, off = 0, segs = '';
    items.forEach(function (x) {
      if (!x.value) return;
      var len = Math.max(0, C * x.value / total - gap);
      segs += '<circle class="seg-c" cx="75" cy="75" r="' + r + '" style="stroke:' + x.color + '" stroke-dasharray="' + len.toFixed(2) + ' ' + (C - len).toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '"><title>' + esc(x.label) + ': ' + x.value + ' (' + pct(x.value, total) + '%)</title></circle>';
      off += C * x.value / total;
    });
    var track = '<circle cx="75" cy="75" r="' + r + '" style="stroke:var(--soft)" stroke-width="22"/>';
    var legend = items.map(function (x) { return '<li><span class="sw" style="background:' + x.color + '"></span><span>' + esc(x.label) + '</span><em>' + x.value + (total ? ' · ' + pct(x.value, total) + '%' : '') + '</em></li>'; }).join('');
    return '<div class="donut-wrap"><div class="donut"><svg viewBox="0 0 150 150" role="img" aria-label="' + esc(centreLabel) + ' chart">' + track + segs + '</svg><div class="mid"><b>' + total + '</b><span>' + esc(centreLabel) + '</span></div></div><ul class="legend">' + legend + '</ul></div>';
  }
  function hbars(items, color) {
    var max = Math.max.apply(null, items.map(function (x) { return x.value; }).concat([1]));
    return items.map(function (x) { return '<div class="hbar"><span>' + esc(x.label) + '</span><div class="tr"><div class="fl" style="width:' + Math.round(100 * x.value / max) + '%;background:' + color + '"></div></div><em>' + x.value + '</em></div>'; }).join('');
  }
  function perProduct(c) {
    var keys = Object.keys(L.q1);
    var rows = ORDER.map(function (id) {
      var vals = keys.map(function (k) { return c['pq:' + id + ':' + k] || 0; }), tot = vals.reduce(function (a, b) { return a + b; }, 0);
      return { id: id, vals: vals, tot: tot };
    }).filter(function (r) { return r.tot > 0; });
    if (!rows.length) return '<p class="muted" style="margin:0">Product breakdown appears after the first answered check-in.</p>';
    var legend = '<ul class="legend" style="display:flex;flex-wrap:wrap;gap:6px 16px;margin-bottom:6px">' + keys.map(function (k, i) { return '<li style="display:flex;gap:6px;align-items:center"><span class="sw" style="background:' + SLOT[i] + '"></span><span>' + esc(L.q1[k]) + '</span></li>'; }).join('') + '</ul>';
    return legend + rows.map(function (r) {
      return '<div class="stack-row"><span>' + esc(PRODUCTS[r.id].nick) + '</span><div class="stack" role="img" aria-label="' + esc(PRODUCTS[r.id].name) + ' outcomes">' + r.vals.map(function (v, i) { return v ? '<i style="flex:' + v + ';background:' + SLOT[i] + '" title="' + esc(L.q1[keys[i]]) + ': ' + v + '"></i>' : ''; }).join('') + '</div><em>' + r.tot + '</em></div>';
    }).join('');
  }
  function funnel(c) {
    var started = sumPrefix(c, 'pstart:'), answered = sumPrefix(c, 'q1:'), verdicts = sumPrefix(c, 'verdict:'), shared = c.shared || 0, notes = c.notes || 0;
    var steps = [['Check-ins started', started], ['Answered', answered], ['Got a verdict', verdicts], ['Left a note', notes]];
    var max = Math.max(started, 1);
    return '<div class="funnel">' + steps.map(function (s, i) { return '<div class="fr"><span>' + s[0] + '</span><div><div class="fb o' + Math.min(4, i + 1) + '" style="width:' + Math.max(2, Math.round(100 * s[1] / max)) + '%"></div></div><em>' + s[1] + (started ? ' · ' + pct(s[1], started) + '%' : '') + '</em></div>'; }).join('') + '</div>';
  }

  /* ---------- summaries ---------- */
  function ruleSummary(c) {
    var answered = sumPrefix(c, 'q1:'), verdicts = sumPrefix(c, 'verdict:'), out = [];
    if (!answered) return out;
    var well = c['q1:well'] || 0, low = (c['q1:none'] || 0) + (c['q1:notexp'] || 0) + (c['q1:irr'] || 0);
    out.push('<b>' + pct(well, answered) + '%</b> said the product is working well. <b>' + pct(low, answered) + '%</b> had no change, a mismatch or irritation: that is the group a brand rarely hears from.');
    var rkeys = Object.keys(L.reason).sort(function (a, b) { return (c['reason:' + b] || 0) - (c['reason:' + a] || 0); });
    if (c['reason:' + rkeys[0]]) out.push('Top reason a product felt wrong: <b>' + esc(L.reason[rkeys[0]]) + '</b> (' + c['reason:' + rkeys[0]] + ' mentions). Customers can name more than one reason.');
    if (answered < 20) out.push('Small sample (' + answered + ' answered check-ins). Treat this as an illustration, not evidence.');
    return out;
  }

  /* ---------- page ---------- */
  var timer = null, lastTotal = '', lastData = null, notesOpen = false; // whether the viewer has the Anonymous notes card open, kept across live redraws

  function view() {
    return '<span class="eyebrow"><span class="fcdot"></span>FitCheck Insights</span><h1 style="margin-top:8px">What the Be.Bodywise team would see</h1><span class="muted" style="font-size:.72rem">build 19</span>' +
      '<p class="muted" style="max-width:48em">Anonymous answers only: no names, no phone numbers. Every WhatsApp or browser check-in updates the Live tab in seconds.</p>' +
      '<div class="ins-bar"><div class="seg" role="tablist"><button class="on" data-seg="live" role="tab" type="button">Live demo sessions</button><button data-seg="sample" role="tab" type="button">Sample data</button></div><span id="segTag"></span><span class="muted" id="stamp" style="font-size:.82rem"></span></div>' +
      '<div id="insBody"></div>';
  }

  function body(d, sample) {
    var c = d.counts || {}, answered = sumPrefix(c, 'q1:'), started = sumPrefix(c, 'pstart:');
    var warn = '';
    if (!sample && d.configured === false) warn = '<div class="warnbox"><b>Database not connected yet.</b> Counts are kept in temporary memory and may disappear or split across servers. Connect a free Upstash Redis database in Vercel (Storage) and redeploy to make this page fully live.</div>';
    else if (!sample && d.error) warn = '<div class="warnbox"><b>Database problem:</b> ' + esc(d.error) + '. Check the Upstash connection in Vercel.</div>';
    if (!(c.sessions || started)) {
      return warn + '<div class="card" style="text-align:center;padding:36px"><h3>No live check-ins yet</h3><p class="muted" style="max-width:34em;margin:0 auto 16px">Run a check-in on WhatsApp or in the browser and this page fills in within seconds.</p><a class="btn fc" href="#/chat">Run a check-in in the browser</a></div>' + tools(false);
    }
    var low = (c['q1:none'] || 0) + (c['q1:notexp'] || 0) + (c['q1:irr'] || 0), verdicts = sumPrefix(c, 'verdict:');
    var wa = c['src:whatsapp'] || 0, web = c['src:web'] || 0;
    var q1 = series(L.q1, c, 'q1'), vd = series(L.verdict, c, 'verdict');
    var rs = Object.keys(L.reason).map(function (k) { return { label: L.reason[k], value: c['reason:' + k] || 0 }; }).sort(function (a, b) { return b.value - a.value; });
    var kpis = '<div class="kpis"><div class="kpi"><b>' + (c.sessions || 0) + '</b><span>check-in sessions<br>WhatsApp ' + wa + ' · browser ' + web + ((c['lang:hi'] || c['lang:en']) ? '<br>Hinglish ' + (c['lang:hi'] || 0) + ' · English ' + (c['lang:en'] || 0) : '') + '</span></div>' +
      '<div class="kpi"><b>' + pct(c['q1:well'] || 0, answered) + '%</b><span>said it is working well</span></div>' +
      '<div class="kpi"><b>' + pct(low, answered) + '%</b><span>had no change, a mismatch or irritation</span></div>' +
      '<div class="kpi"><b>' + pct(c.notes || 0, verdicts) + '%</b><span>added a note</span></div></div>';
    var charts = '<div class="chartgrid compact">' +
      '<div class="chart"><h3>How is it going?</h3><div class="sub">Customer answer at the check-in</div>' + donut(q1, 'answers') + '</div>' +
      '<div class="chart"><h3>Verdicts given</h3><div class="sub">Fixed rules, no AI medical advice</div>' + donut(vd, 'verdicts') + '</div>' +
      '<div class="chart"><h3>What felt wrong</h3><div class="sub">Up to three reasons each</div>' + hbars(rs, 'var(--s1)') + '</div></div>';
    /* These four go together as a 2x2 grid: the check-in funnel, per-product experience,
       latest activity and the expectation-vs-experience card. Same content as before, new arrangement. */
    var pairgrid = '<div class="chartgrid pairs">' +
      '<div class="chart"><h3>From check-in to feedback</h3><div class="sub">Each product check-in is one unit</div>' + funnel(c) + '</div>' +
      '<div class="chart"><h3>Experience by product</h3><div class="sub">Where each product stands at its check-in</div>' + perProduct(c) + '</div>' +
      '<div class="chart"><h3>Latest activity</h3><div class="sub">Anonymous, newest first</div>' + feedHtml(d.feed, sample) + '</div>' +
      '<div class="chart expcell">' + expSection(c, sample) + '</div></div>';
    var ai = '<div class="ai" id="aiBox">' + aiInner(sample ? SAMPLE_AI : (lastAi && lastAi.source === 'gemini' ? lastAi : null), c, sample) + '</div>';
    var notesList = d.notes && d.notes.length ? d.notes.slice(0, 12).map(function (n) { return '<div class="note">' + esc(n.text) + '<br><small>' + esc((PRODUCTS[n.product] || { name: '' }).name) + (n.tags && n.tags.length ? ' · ' + esc(n.tags.join(', ')) : '') + (n.t ? ' · ' + ago(n.t) : '') + '</small></div>'; }).join('') : '<p class="muted" style="margin:0">No notes yet. Notes appear when a customer adds a line in their own words.</p>';
    var notes = '<details class="card notesbox"' + (notesOpen ? ' open' : '') + '><summary><h3>Anonymous notes</h3><span class="hint">Click to view</span></summary><div class="nlist">' + notesList + '</div></details>';
    return warn + kpis + charts + pairgrid + ai + notes + impactSection(c, sample) + tools(!sample);
  }

  /* ---------- Expectation vs experience ---------- */

  /* ---------- "if we fix this" estimate ---------- */
  var impIn = { buyers: 1000, checkin: 40, rescue: 15, repeats: 2, order: 550, margin: 60, cac: 700 };
  var inr = function (n) { return '₹' + Math.round(n).toLocaleString('en-IN'); };
  var f1 = function (n) { return (Math.round(n * 10) / 10).toLocaleString('en-IN'); };
  /* The three scenarios as cards (not a table): easier to scan, and the base case reads as the headline. */
  var IMP_ROWS = [
    ['Buyers kept', 'rescued', function (x) { return f1(x) + ' /mo'; }],
    ['Repeat-buyer rate', 'retention', function (x) { return '+' + f1(x) + ' pts'; }],
    ['NPS', 'nps', function (x) { return '+' + f1(x) + ' pts'; }],
    ['Extra revenue', 'revenue', function (x) { return inr(x) + '/mo'; }],
    ['Contribution profit', 'profit', function (x) { return inr(x) + '/mo'; }],
    ['CAC saved (re-acquisition avoided)', 'cacSaved', function (x) { return inr(x) + '/mo'; }],
    ['Saving per buyer kept, per month', 'perCustomer', function (x) { return inr(x); }]
  ];
  function impactOut(c, sample) {
    var V = window.FitVariance, usedSample = false, src = c;
    if (V.impact(c, impIn).verdicts < 5) { src = buildSample().counts; usedSample = true; }
    var r = V.impact(src, impIn);
    var card = function (label, scen, feat) {
      return '<div class="imp-card' + (feat ? ' feat' : '') + '"><div class="imp-card-h">' + (feat ? '<span class="imp-star">★</span> ' : '') + label + '</div>' +
        IMP_ROWS.map(function (row) { return '<div class="imp-row"><span>' + row[0] + '</span><b>' + row[2](r[scen][row[1]]) + '</b></div>'; }).join('') + '</div>';
    };
    return (usedSample ? '<div class="warnbox" style="margin-bottom:12px">Fewer than 5 check-ins so far, so this uses the invented sample share of fixable check-ins. It will switch to your live numbers once 5 check-ins are in.</div>' : '') +
      '<p class="imp-line"><b>' + Math.round(100 * r.share) + '%</b> of ' + r.verdicts + ' check-ins ' + (usedSample ? '(sample) ' : '') + 'ended as <i>wait longer</i>, <i>adjust usage</i> or <i>swap</i> &mdash; customers who could be helped, and who might otherwise quietly leave.</p>' +
      '<div class="imp-scen">' + card('Cautious', 'low') + card('Base case', 'base', true) + card('Optimistic', 'high') + '</div>';
  }
  function impactSection(c, sample) {
    var fld = function (id, lab, hint, step) { return '<label class="imp-f"><span>' + lab + '</span><input type="number" min="0" step="' + (step || 1) + '" data-imp="' + id + '" value="' + impIn[id] + '" inputmode="decimal"><em>' + hint + '</em></label>'; };
    return '<div class="sec-h" style="margin-top:28px"><h2 style="margin:0">If we fix this: what it could mean</h2></div>' +
      '<p class="muted" style="max-width:52em;margin:6px 0 14px">A rough estimate of how many buyers FitCheck could keep, and what that does to repeat purchases, NPS and unit economics (contribution profit and CAC avoided). Only the first number below comes from the check-ins. The seven boxes are <b>assumptions you can change</b>, not Be.Bodywise data.</p>' +
      '<div class="card" id="impBox">' +
      '<div class="imp-grp"><h4>Assumptions</h4><div class="imp-in">' +
      fld('buyers', 'Buyers per month', 'for the products in FitCheck', 50) + fld('checkin', 'Finish the check-in (%)', 'share who reply', 5) + fld('rescue', 'Kept because of FitCheck (%)', 'of the helpable ones', 1) +
      fld('repeats', 'Extra orders each', 'per kept buyer', 1) + fld('order', 'Average order (₹)', 'demo store prices', 50) +
      fld('margin', 'Gross margin (%)', 'of AOV, typical D2C wellness', 5) + fld('cac', 'CAC (₹ per customer)', 'paid-media cost to acquire one', 50) + '</div></div>' +
      '<div class="imp-grp"><h4>Result</h4><div id="impOut">' + impactOut(c, sample) + '</div></div>' +
      '<details class="imp-how"><summary>How it is worked out</summary><p>Buyers kept = buyers × check-in rate × helpable share × kept rate. Repeat-buyer rate and NPS both rise by (buyers kept ÷ buyers) × 100 points: each kept buyer becomes a repeat buyer, and an unhappy buyer moving to neutral counts as +1, a cautious count. Extra revenue = buyers kept × extra orders × average order. Extra contribution profit applies the gross-margin assumption to that revenue, since top-line revenue is not what a D2C brand keeps. CAC saved treats each kept buyer as one fewer new customer to acquire at CAC: retaining is usually cheaper than re-acquiring. Cautious uses half the kept rate; optimistic uses one and a half times. Change the boxes to test your own beliefs. Treat the result as a way to size the idea, and replace the assumptions with real numbers from a pilot.</p></details></div>';
  }
  function bindImpact(c, sample) {
    var box = $('#impBox'); if (!box) return;
    box.addEventListener('input', function (e) {
      var id = e.target && e.target.getAttribute && e.target.getAttribute('data-imp'); if (!id) return;
      impIn[id] = e.target.value; var o = $('#impOut'); if (o) o.innerHTML = impactOut(c, sample);
    });
  }

  var xSel = '';
  function expSection(c, sample) {
    var V = window.FitVariance, a = V.analyse(c);
    var head = '<h3>Expectation vs experience</h3><div class="sub">What customers hoped for, versus what they got. Pick a product.</div>';
    if (!a.products.length) return head + '<p class="muted" style="margin:0">No expectation receipts yet.</p>';
    if (!xSel || !a.products.some(function (r) { return r.id === xSel; })) xSel = (a.products.filter(function (r) { return r.tone === 'bad' || r.tone === 'warn'; })[0] || a.products[0]).id;
    var kp = '<div class="xkp"><div><b>' + a.receipts + '</b><span>receipts</span></div><div><b>' + a.answered + '</b><span>compared</span></div><div><b>' + Math.round(100 * a.lessShare) + '%</b><span>fell short</span></div></div>';
    var opts = a.products.map(function (r) { return '<option value="' + r.id + '"' + (r.id === xSel ? ' selected' : '') + '>' + esc(PRODUCTS[r.id].name) + ' · ' + esc(r.title) + '</option>'; }).join('');
    var sel = '<label class="xsel"><select id="xSelect" aria-label="Choose a product to see its expectation vs experience">' + opts + '</select></label>';
    var cards = a.products.map(function (r) {
      var p = PRODUCTS[r.id], t = r.answered || 1, h = r.hope;
      var seg = function (n, col, lab) { return n ? '<i style="width:' + (100 * n / t) + '%;background:' + col + '" title="' + lab + ': ' + n + '"></i>' : ''; };
      var topT = r.topTime ? (P.TIMES.filter(function (x) { return x.id === r.topTime.id; })[0] || {}).en : '–';
      return '<div class="xcard" data-xid="' + r.id + '"' + (r.id === xSel ? '' : ' hidden') + '><h4><span>' + esc(p.name) + '</span><span class="dpill ' + r.tone + '">' + esc(r.title) + '</span></h4>' +
        '<div class="sub">' + r.receipts + ' receipts · ' + r.answered + ' answered</div>' +
        (r.answered ? '<div class="xbar" role="img" aria-label="' + h.better + ' better, ' + h.as + ' as hoped, ' + h.less + ' less than hoped">' + seg(h.better, 'var(--s3)', 'Better') + seg(h.as, 'var(--s1)', 'As hoped') + seg(h.less, 'var(--s2)', 'Less') + '</div>' +
          '<ul class="xleg"><li><span class="sw" style="background:var(--s3)"></span>Better ' + h.better + '</li><li><span class="sw" style="background:var(--s1)"></span>As hoped ' + h.as + '</li><li><span class="sw" style="background:var(--s2)"></span>Less ' + h.less + '</li></ul>' : '<p class="muted" style="margin:0 0 8px;font-size:.84rem">No one has answered the check-in for this product yet.</p>') +
        '<div class="xkv"><span>Hoped for most</span><span>' + (r.topOut ? esc(V.label(r.id, r.topOut.id)) : '–') + '</span>' +
        '<span>Expected in</span><span>' + esc(topT) + '</span>' +
        '<span>Pack says</span><span>' + esc(p.stated && p.stated.en ? p.stated.en : 'Not stated') + '</span></div>' +
        '<div class="xaction"><b>Team:</b> ' + esc(r.action) + '</div></div>';
    }).join('');
    return head + '<div class="xtop">' + kp + sel + '</div>' + cards;
  }
  function bindExp() {
    var sel = $('#xSelect'); if (!sel) return;
    sel.onchange = function () {
      xSel = sel.value;
      document.querySelectorAll('#xPanel .xcard').forEach(function (el) { el.hidden = el.getAttribute('data-xid') !== xSel; });
    };
  }
  function feedHtml(feed, sample) {
    if (sample) return '<p class="muted" style="margin:0">The live tab shows each anonymous check-in here as it happens.</p>';
    if (!feed || !feed.length) return '<p class="muted" style="margin:0">Waiting for the first verdict…</p>';
    return '<div class="feed2">' + feed.slice(0, 4).map(function (f) {
      return '<div class="fi"><span class="tm">' + ago(f.t) + '<span class="src">' + (f.src === 'whatsapp' ? 'WhatsApp' : 'Browser') + '</span></span><span>' + esc((PRODUCTS[f.product] || { nick: 'product' }).nick) + ': ' + esc(L.q1[f.q1] || 'checked in') + ' → <b>' + esc(L.verdict[f.verdict] || f.verdict) + '</b></span></div>';
    }).join('') + '</div>';
  }

  function tools(live) {
    return '<div class="tools"><button class="btn ghost sm" id="csvBtn" type="button">Download CSV (opens in Excel or Google Sheets)</button>' + (live ? '<button class="link" id="resetBtn" type="button">Clear test data</button>' : '') + '</div>';
  }

  function csv(d) {
    var rows = [['group', 'item', 'count']], c = d.counts || {};
    [['how_is_it_going', L.q1, 'q1'], ['verdict', L.verdict, 'verdict'], ['reason', L.reason, 'reason']].forEach(function (g) {
      Object.keys(g[1]).forEach(function (k) { rows.push([g[0], g[1][k], c[g[2] + ':' + k] || 0]); });
    });
    ORDER.forEach(function (id) { rows.push(['product_checkins_started', PRODUCTS[id].name, c['pstart:' + id] || 0]); });
    rows.push(['totals', 'sessions', c.sessions || 0], ['totals', 'notes', c.notes || 0]);
    if (window.FitVariance) window.FitVariance.analyse(c).products.forEach(function (r) {
      var nm = PRODUCTS[r.id].name;
      rows.push(['expectation_receipts', nm, r.receipts], ['expectation_better_than_hoped', nm, r.hope.better], ['expectation_as_hoped', nm, r.hope.as], ['expectation_less_than_hoped', nm, r.hope.less], ['expectation_decision', nm + ': ' + r.title, r.answered]);
    });
    rows.push([], ['notes_product', 'notes_tags', 'notes_text']);
    (d.notes || []).forEach(function (n) { rows.push([(PRODUCTS[n.product] || {}).name || '', (n.tags || []).join('; '), n.text]); });
    return rows.map(function (r) { return r.map(function (v) { v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }).join('\n');
  }

  var lastJson = '', lastAi = null, aiTry = 0;

  /* One Gemini box with three parts: expectation vs experience, FitCheck responses, suggested actions.
     Before (or without) Gemini, the same three parts are filled from fixed rules so the box is never empty. */
  function ruleX(c) {
    var V = window.FitVariance, a = V.analyse(c), lines = [], acts = [];
    a.products.forEach(function (r) {
      if (r.answered > 0) lines.push('<b>' + esc(PRODUCTS[r.id].nick) + '</b>: ' + esc(r.title.toLowerCase()));
      if (r.answered >= V.MIN_ANSWERS && r.decision !== 'monitor' && r.decision !== 'keep' && r.action) acts.push(PRODUCTS[r.id].nick + ': ' + r.action);
    });
    var text = !a.answered ? '<ul><li>Nobody has compared what they hoped for with what they got yet.</li></ul>' :
      '<ul><li><b>' + Math.round(100 * a.lessShare) + '% fell short.</b> Of ' + a.answered + ' customers who compared, this share said it was less than they hoped.</li>' + lines.map(function (l) { return '<li>' + l + '</li>'; }).join('') + '</ul>';
    return { text: text, acts: acts.slice(0, 3) };
  }
  /* bold the figures (58%, 2 weeks, 3 to 4 months) so the key numbers stand out */
  function boldNums(h) { return h.replace(/(\d+(?:\.\d+)?\s?%|\d+(?:\s?(?:to|-)\s?\d+)?\s?(?:weeks?|months?|days?))/g, '<b>$1</b>'); }
  function aiInner(s, c, sample) {
    var gem = s && s.source === 'gemini', rx = ruleX(c);
    var p1 = rx.text;
    if (gem && s.expectation) {
      var ex = Array.isArray(s.expectation) ? s.expectation : [{ lead: '', detail: String(s.expectation) }];
      p1 = '<ul>' + ex.map(function (x) { return '<li>' + (x.lead ? '<b>' + esc(x.lead) + '</b> ' : '') + boldNums(esc(x.detail)) + '</li>'; }).join('') + '</ul>';
    }
    var rules = ruleSummary(c);
    var p2 = gem ? '<p class="aih">' + esc(s.headline) + '</p><ul>' + (s.themes || []).map(function (t) { return '<li><b>' + esc(t.title) + ':</b> ' + esc(t.detail) + '</li>'; }).join('') + '</ul>'
      : '<ul>' + rules.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>';
    var acts = gem && s.actions && s.actions.length ? s.actions.map(esc) : (rx.acts.length ? rx.acts.map(esc) : ['Keep collecting check-ins until each product has at least 5 answers.']);
    var foot = sample ? 'Example text written by hand to match the invented sample numbers. The live tab shows what Gemini writes from real check-ins.'
      : (gem ? 'Written by an AI model from the anonymous numbers and notes on this page. Check against the data before acting.' : 'Rule-based summary from the numbers on this page. Gemini’s version replaces it when available.');
    return '<span class="tag">' + (sample ? 'SAMPLE · Gemini readout' : (gem ? 'AI summary · Gemini' : 'Summary')) + '</span>' + (sample ? '<span class="samplebadge">Illustrative text, not generated live</span>' : '') +
      '<div class="ai3"><section><h4><i>1</i>Expectation vs experience</h4>' + p1 + '</section>' +
      '<section><h4><i>2</i>FitCheck responses</h4>' + p2 + '</section>' +
      '<section><h4><i>3</i>Suggested actions</h4><ul>' + acts.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></section></div>' +
      '<p class="muted aifoot">' + foot + '</p>';
  }
  function renderAi(s) {
    var box = $('#aiBox'); if (!box || !s) return;
    if (s.source === 'gemini') box.innerHTML = aiInner(s, (lastData || {}).counts || {}, false);
    else if (s.error || s.reason) { var f = box.querySelector('.aifoot'); if (f) f.insertAdjacentHTML('beforeend', ' AI summary unavailable: ' + esc(s.error || s.reason) + '.'); }
  }
  function loadAi() {
    aiTry = Date.now();
    fetch('api/summary').then(function (r) { return r.ok ? r.json() : { source: 'rules', reason: 'the summary service returned an error (' + r.status + '). Check that api/summary.js and its files were uploaded.' }; }).then(function (s) {
      if (!s) return;
      lastAi = (s.source === 'gemini' || s.error || s.reason) ? s : null;
      renderAi(lastAi);
    }).catch(function () { /* keep the built-in summary */ });
  }

  function mount() {
    var el = $('#insBody'), tag = $('#segTag'), stamp = $('#stamp'), mode = 'live';
    function paint(d, sample) {
      // read the notes card's open/closed state from the live DOM right before it gets replaced, so a repaint
      // (new check-ins arriving on the Live tab) can never close it under the viewer: only their own click can.
      var prevNb = $('.notesbox'); if (prevNb) notesOpen = prevNb.open;
      lastData = d; el.innerHTML = body(d, sample); try { bindImpact(d.counts || {}, sample); } catch (e) { console.error('impact', e); }
      var nb = $('.notesbox'); if (nb) nb.ontoggle = function () { notesOpen = nb.open; };
      var b = $('#csvBtn'); if (b) b.onclick = function () {
        var blob = new Blob([csv(d)], { type: 'text/csv' }), a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = 'fitcheck-insights.csv'; document.body.appendChild(a); a.click(); a.remove();
      };
      var rb = $('#resetBtn'); if (rb) rb.onclick = function () {
        var k = window.prompt('Enter the admin key (ADMIN_KEY in Vercel) to clear the live test data:'); if (!k) return;
        fetch('api/reset', { method: 'POST', headers: { 'x-admin-key': k } }).then(function (r) { return r.json(); }).then(function (j) { window.alert(j.ok ? 'Cleared.' : (j.error || 'Could not clear.')); lastJson = ''; lastAi = null; poll(); }).catch(function () { window.alert('Could not reach the server.'); });
      };
      try { bindExp(); } catch (e) { console.error('exp', e); }
      if (!sample && (d.counts || {}).sessions) {
        try { if (lastAi) renderAi(lastAi); } catch (e) { console.error('renderAi', e); }
        try {
        } catch (e) { console.error('expectation AI', e); }
        try {
          var failed = !lastAi || lastAi.source !== 'gemini';
          var xs = 0; Object.keys(d.counts).forEach(function (k) { if (k.indexOf('x:h:') === 0) xs += d.counts[k]; });
          var tk = d.counts.sessions + ':' + xs;
          if (tk !== lastTotal || (failed && Date.now() - aiTry > 60000)) { lastTotal = tk; loadAi(); }
        } catch (e) { console.error('summary AI', e); }
      }
    }
    function poll() {
      if (mode !== 'live') return;
      fetch('api/stats', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : Promise.reject(); })
        .then(function (d) {
          if (mode !== 'live' || !$('#insBody')) return;
          var sig = JSON.stringify([d.counts, (d.notes || []).length, (d.feed || []).length && d.feed[0].t, d.configured, d.error]);
          if (sig !== lastJson) { lastJson = sig; paint(d, false); } // only redraw when something changed, so open sections and hovers are not reset
          else { var f = $('.feed2'); if (f && d.feed) f.outerHTML = feedHtml(d.feed, false); }
          stamp.textContent = 'Updated ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        })
        .catch(function () { if (mode === 'live' && $('#insBody') && !lastData) { el.innerHTML = '<div class="warnbox">Could not load live data. If you are running this page from a file, open the deployed site instead.</div>'; } });
    }
    function show(which) {
      mode = which; lastTotal = ''; lastData = null; lastJson = '';
      document.querySelectorAll('[data-seg]').forEach(function (b) { b.classList.toggle('on', b.dataset.seg === which); });
      clearInterval(timer);
      if (which === 'sample') { tag.innerHTML = '<span class="sample-pill">SAMPLE DATA, INVENTED FOR ILLUSTRATION</span>'; stamp.textContent = ''; paint(buildSample(), true); return; }
      tag.innerHTML = '<span class="live-pill">LIVE</span>'; el.innerHTML = '<p class="muted">Loading…</p>'; poll(); timer = setInterval(poll, 6000);
    }
    document.querySelectorAll('[data-seg]').forEach(function (b) { b.onclick = function () { show(b.dataset.seg); }; });
    show('live');
  }
  function stop() { clearInterval(timer); timer = null; }

  window.FitInsights = { view: view, mount: mount, stop: stop, _sample: buildSample };
})();
