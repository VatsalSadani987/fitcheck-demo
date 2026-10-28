/* FitCheck Insights: what the brand team would see. Live tab reads anonymous counts from the database,
   Sample tab shows clearly-labelled invented data. Charts are plain SVG/HTML (no libraries). */
(function () {
  var P = window.FitProducts, PRODUCTS = P.PRODUCTS, ORDER = P.ORDER;
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var $ = function (s, el) { return (el || document).querySelector(s); };

  var L = {
    q1: { well: 'Working well', none: 'No change yet', notexp: 'Not what I expected', irr: 'Skin irritation', little: 'Haven’t used much' },
    verdict: { keep: 'Keep going', wait: 'Wait longer', usage: 'Adjust usage', swap: 'Consider a swap', value: 'Value is their call', doctor: 'See a doctor' },
    reason: { results: 'No visible results', feel: 'Feel or texture', smell: 'Smell', price: 'Price or value', instr: 'Instructions unclear', other: 'Something else' },
    use: { less: 'Less than directed', asdir: 'As directed', unsure: 'Not sure how' }
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
    c['use:asdir'] = Math.round(low * .5); c['use:less'] = Math.round(low * .3); c['use:unsure'] = low - c['use:asdir'] - c['use:less'];
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
    themes: [
      { title: 'Timing expectations', detail: 'Most 5% AHA BHA wash customers expected results within 2 weeks. The brand page says 3 to 4 months, and 58% said it fell short of their hope.' },
      { title: 'Unclear directions', detail: 'Half of the reasons given for the Hair Growth Serum were unclear instructions on how much and how often to use it.' },
      { title: 'Feel of the roll-on', detail: 'The underarm roll-on gets mixed feedback on feel (sticky for the first minute). Worth a look before the next batch.' }
    ],
    actions: ['Show the 3 to 4 month timeline on the wash page and in the order confirmation.', 'Add how much and how often to the serum page and pack.', 'Review the roll-on feel notes with the product team.'] };
  var SAMPLE_X = { source: 'gemini', sample: true,
    headline: 'The wash is judged too early, while the serum is misused: both are fixable with clearer guidance.',
    products: [
      { id: 'aha5', explain: 'Most customers expected visible change within 2 weeks, but the brand page points to 3 to 4 months. The disappointment is mostly about timing.', team_should: 'Put the realistic timeline on the page and send a reassurance message around week 3.' },
      { id: 'serum', explain: 'Half of those who fell short blamed unclear instructions, not the formula.', team_should: 'Add how much and how often to use it, then re-check in a month.' },
      { id: 'roll', explain: 'Timing does not explain the gap here. Customers mention how it feels on the skin.', team_should: 'Read the feel notes and review the formula or texture with the product team.' },
      { id: 'sa1', explain: 'Most customers say it matches or beats their hopes. Their top hope is fewer body breakouts.', team_should: 'Lead the product copy with that promise and use customer wording.' }
    ] };

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
    var steps = [['Check-ins started', started], ['Answered', answered], ['Got a verdict', verdicts], ['Told the brand', shared], ['Left a note', notes]];
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
    var us = c['verdict:usage'] || 0;
    if (verdicts) out.push('<b>' + pct(us, verdicts) + '%</b> of verdicts were about how the product is used, so clearer directions could prevent some disappointment before the customer leaves.');
    if (answered < 20) out.push('Small sample (' + answered + ' answered check-ins). Treat this as an illustration, not evidence.');
    return out;
  }

  /* ---------- page ---------- */
  var timer = null, lastTotal = -1, lastData = null;

  function view() {
    return '<span class="eyebrow"><span class="fcdot"></span>FitCheck Insights</span><h1 style="margin-top:8px">What the Be.Bodywise team would see</h1>' +
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
    var q1 = series(L.q1, c, 'q1'), vd = series(L.verdict, c, 'verdict'), us = series(L.use, c, 'use');
    var rs = Object.keys(L.reason).map(function (k) { return { label: L.reason[k], value: c['reason:' + k] || 0 }; }).sort(function (a, b) { return b.value - a.value; });
    var kpis = '<div class="kpis"><div class="kpi"><b>' + (c.sessions || 0) + '</b><span>check-in sessions<br>WhatsApp ' + wa + ' · browser ' + web + ((c['lang:hi'] || c['lang:en']) ? '<br>Hinglish ' + (c['lang:hi'] || 0) + ' · English ' + (c['lang:en'] || 0) : '') + '</span></div>' +
      '<div class="kpi"><b>' + pct(c['q1:well'] || 0, answered) + '%</b><span>said it is working well</span></div>' +
      '<div class="kpi"><b>' + pct(low, answered) + '%</b><span>had no change, a mismatch or irritation</span></div>' +
      '<div class="kpi"><b>' + pct(c.shared || 0, verdicts) + '%</b><span>chose to tell the brand</span></div></div>';
    var charts = '<div class="chartgrid">' +
      '<div class="chart"><h3>How is it going?</h3><div class="sub">Customer answer at the check-in</div>' + donut(q1, 'answers') + '</div>' +
      '<div class="chart"><h3>Verdicts given</h3><div class="sub">Fixed rules, no AI medical advice</div>' + donut(vd, 'verdicts') + '</div>' +
      '<div class="chart"><h3>What felt wrong</h3><div class="sub">Customers could name up to three reasons</div>' + hbars(rs, 'var(--s1)') + '</div>' +
      '<div class="chart"><h3>How they were using it</h3><div class="sub">Asked when results were missing</div>' + donut(us, 'answers') + '</div>' +
      '<div class="chart" style="grid-column:1/-1"><h3>Experience by product</h3><div class="sub">Where each product stands at its check-in</div>' + perProduct(c) + '</div>' +
      '<div class="chart"><h3>From check-in to feedback</h3><div class="sub">Each product check-in is one unit</div>' + funnel(c) + '</div>' +
      '<div class="chart"><h3>Latest activity</h3><div class="sub">Anonymous, newest first</div>' + feedHtml(d.feed, sample) + '</div></div>';
    var summ = ruleSummary(c);
    var ai = '<div class="ai" id="aiBox"><span class="tag">' + (sample ? 'What the team would learn' : 'Summary') + '</span><ul>' + summ.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul></div>';
    var notes = '<div class="card" style="margin-top:16px"><h3>Anonymous notes</h3>' + (d.notes && d.notes.length ? d.notes.slice(0, 12).map(function (n) { return '<div class="note">' + esc(n.text) + '<br><small>' + esc((PRODUCTS[n.product] || { name: '' }).name) + (n.tags && n.tags.length ? ' · ' + esc(n.tags.join(', ')) : '') + (n.t ? ' · ' + ago(n.t) : '') + '</small></div>'; }).join('') : '<p class="muted" style="margin:0">No notes yet. Notes appear when a customer chooses to tell the brand and adds a line.</p>') + '</div>';
    var sampleAi = sample ? '<div class="ai" id="aiSample" style="margin-top:14px">' + aiInner(SAMPLE_AI) + '</div>' : '';
    return warn + kpis + charts + ai + sampleAi + expSection(c, sample) + notes + tableView(c) + tools(!sample);
  }

  /* ---------- Expectation vs experience ---------- */
  function expSection(c, sample) {
    var V = window.FitVariance, a = V.analyse(c);
    var head = '<div class="sec-h" style="margin-top:28px"><h2 style="margin:0">Expectation vs experience</h2></div>' +
      '<p class="muted" style="max-width:52em;margin:6px 0 14px">Before buying, customers said what they hoped for and by when. At the check-in they said how it compared. The decision on each card comes from fixed rules; Gemini only explains it in words.</p>';
    if (!a.products.length) return head + '<div class="card"><p class="muted" style="margin:0">No expectation receipts yet. On the store, pick what you hope for on a product page or at checkout, order, then run the check-in.</p></div>';
    var kp = '<div class="kpis" style="margin-bottom:14px"><div class="kpi"><b>' + a.receipts + '</b><span>expectation receipts</span></div>' +
      '<div class="kpi"><b>' + a.answered + '</b><span>compared with what they hoped</span></div>' +
      '<div class="kpi"><b>' + Math.round(100 * a.lessShare) + '%</b><span>said it fell short of their hope</span></div></div>';
    var ai = sample ? '<div class="xai" id="xaiBox">' + xInner(SAMPLE_X) + '</div>' : '<div class="xai" id="xaiBox"><h4>Gemini readout</h4><p class="muted" style="margin:0;font-size:.86rem">Loading…</p></div>';
    var cards = a.products.map(function (r) {
      var p = PRODUCTS[r.id], t = r.answered || 1, h = r.hope;
      var seg = function (n, col, lab) { return n ? '<i style="width:' + (100 * n / t) + '%;background:' + col + '" title="' + lab + ': ' + n + '"></i>' : ''; };
      var topT = r.topTime ? (P.TIMES.filter(function (x) { return x.id === r.topTime.id; })[0] || {}).en : '–';
      var sooner = r.receipts ? Math.round(100 * (r.gap.longer || 0) / r.receipts) : 0;
      return '<div class="xcard" data-xid="' + r.id + '"><h4><span>' + esc(p.name) + '</span><span class="dpill ' + r.tone + '">' + esc(r.title) + '</span></h4>' +
        '<div class="sub">' + r.receipts + ' receipts · ' + r.answered + ' answered the check-in</div>' +
        (r.answered ? '<div class="xbar" role="img" aria-label="' + h.better + ' better, ' + h.as + ' as hoped, ' + h.less + ' less than hoped">' + seg(h.better, 'var(--s3)', 'Better') + seg(h.as, 'var(--s1)', 'As hoped') + seg(h.less, 'var(--s2)', 'Less') + '</div>' +
          '<ul class="xleg"><li><span class="sw" style="background:var(--s3)"></span>Better ' + h.better + '</li><li><span class="sw" style="background:var(--s1)"></span>As hoped ' + h.as + '</li><li><span class="sw" style="background:var(--s2)"></span>Less than hoped ' + h.less + '</li></ul>' : '') +
        '<div class="xkv"><span>Hoped for most</span><span>' + (r.topOut ? esc(V.label(r.id, r.topOut.id)) : '–') + '</span>' +
        '<span>Expected change in</span><span>' + esc(topT) + '</span>' +
        '<span>Pack says</span><span>' + esc(p.stated && p.stated.en ? p.stated.en : 'Not stated') + '</span>' +
        '<span>Hoped sooner than pack</span><span>' + sooner + '% of receipts</span>' +
        '<span>Fell shortest</span><span>' + (r.missed ? esc(V.label(r.id, r.missed.id)) : '–') + '</span></div>' +
        '<div class="xwhy" style="font-size:.86rem">' + esc(r.why) + '</div>' +
        '<div class="xaction"><b>Team:</b> ' + esc(r.action) + '</div><div class="xexp muted" style="font-size:.84rem"></div></div>';
    }).join('');
    return head + kp + ai + '<div class="xgrid">' + cards + '</div>';
  }
  function xInner(s) {
    return '<h4>Gemini readout' + (s.sample ? '<span class="samplebadge">SAMPLE · illustrative text, not generated live</span>' : '') + '</h4><p style="font-weight:700;margin:0 0 4px">' + esc(s.headline) + '</p><p class="muted" style="font-size:.78rem;margin:0">Explains the rule-based decisions below. It does not change them. ' + (s.sample ? 'Example text written to match the invented sample numbers.' : 'Check against the numbers before acting.') + '</p>';
  }
  var lastXAi = null, xTry = 0;
  function renderXAi(s) {
    var box = $('#xaiBox'); if (!box || !s) return;
    if (s.source === 'gemini') {
      box.innerHTML = xInner(s);
      (s.products || []).forEach(function (x) {
        var card = document.querySelector('[data-xid="' + x.id + '"] .xexp');
        if (card) card.innerHTML = '<b>' + (s.sample ? 'Gemini (sample)' : 'Gemini') + ':</b> ' + esc(x.explain) + (x.team_should ? ' <b>Next:</b> ' + esc(x.team_should) : '');
      });
    } else {
      box.innerHTML = '<h4>Gemini readout</h4><p class="muted" style="margin:0;font-size:.86rem">Not available' + (s.reason ? ' (' + esc(s.reason) + ')' : '') + '. The rule-based decisions below still apply.</p>';
    }
  }
  function loadXAi() {
    xTry = Date.now();
    fetch('api/expectation').then(function (r) { return r.ok ? r.json() : { source: 'rules', reason: 'the service returned an error (' + r.status + '). Check that api/expectation.js was uploaded.' }; }).then(function (s) { if (s) { lastXAi = s; renderXAi(s); } }).catch(function () { /* keep rule-based cards */ });
  }

  function feedHtml(feed, sample) {
    if (sample) return '<p class="muted" style="margin:0">The live tab shows each anonymous check-in here as it happens.</p>';
    if (!feed || !feed.length) return '<p class="muted" style="margin:0">Waiting for the first verdict…</p>';
    return '<ul class="feed">' + feed.slice(0, 8).map(function (f) {
      return '<li><span class="tm">' + ago(f.t) + '</span><span>' + esc((PRODUCTS[f.product] || { nick: 'product' }).nick) + ': ' + esc(L.q1[f.q1] || 'checked in') + ' → <b>' + esc(L.verdict[f.verdict] || f.verdict) + '</b></span><span class="src">' + (f.src === 'whatsapp' ? 'WhatsApp' : 'Browser') + '</span></li>';
    }).join('') + '</ul>';
  }

  function tableView(c) {
    var rows = '';
    [['How is it going?', L.q1, 'q1'], ['Verdicts', L.verdict, 'verdict'], ['Reasons', L.reason, 'reason'], ['Usage', L.use, 'use']].forEach(function (g) {
      Object.keys(g[1]).forEach(function (k) { rows += '<tr><td>' + g[0] + '</td><td>' + esc(g[1][k]) + '</td><td>' + (c[g[2] + ':' + k] || 0) + '</td></tr>'; });
    });
    return '<details class="card tbl-toggle" style="margin-top:16px"><summary style="cursor:pointer;font-weight:700">View the numbers as a table</summary><div class="tablewrap" style="margin-top:12px"><table class="t"><tr><th>Group</th><th>Answer</th><th>Count</th></tr>' + rows + '</table></div></details>';
  }
  function tools(live) {
    return '<div class="tools"><button class="btn ghost sm" id="csvBtn" type="button">Download CSV (opens in Excel or Google Sheets)</button>' + (live ? '<button class="link" id="resetBtn" type="button">Clear test data</button>' : '') + '</div>';
  }

  function csv(d) {
    var rows = [['group', 'item', 'count']], c = d.counts || {};
    [['how_is_it_going', L.q1, 'q1'], ['verdict', L.verdict, 'verdict'], ['reason', L.reason, 'reason'], ['usage', L.use, 'use']].forEach(function (g) {
      Object.keys(g[1]).forEach(function (k) { rows.push([g[0], g[1][k], c[g[2] + ':' + k] || 0]); });
    });
    ORDER.forEach(function (id) { rows.push(['product_checkins_started', PRODUCTS[id].name, c['pstart:' + id] || 0]); });
    rows.push(['totals', 'sessions', c.sessions || 0], ['totals', 'told_the_brand', c.shared || 0]);
    if (window.FitVariance) window.FitVariance.analyse(c).products.forEach(function (r) {
      var nm = PRODUCTS[r.id].name;
      rows.push(['expectation_receipts', nm, r.receipts], ['expectation_better_than_hoped', nm, r.hope.better], ['expectation_as_hoped', nm, r.hope.as], ['expectation_less_than_hoped', nm, r.hope.less], ['expectation_decision', nm + ': ' + r.title, r.answered]);
    });
    rows.push([], ['notes_product', 'notes_tags', 'notes_text']);
    (d.notes || []).forEach(function (n) { rows.push([(PRODUCTS[n.product] || {}).name || '', (n.tags || []).join('; '), n.text]); });
    return rows.map(function (r) { return r.map(function (v) { v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }).join('\n');
  }

  var lastJson = '', lastAi = null, aiTry = 0, lastXTotal = -1;

  function aiInner(s) {
    return '<span class="tag">' + (s.sample ? 'SAMPLE · Gemini readout' : 'AI summary · Gemini') + '</span>' + (s.sample ? '<span class="samplebadge">Illustrative text, not generated live</span>' : '') +
      '<p style="font-weight:700;margin:8px 0 6px">' + esc(s.headline) + '</p>' +
      '<ul>' + s.themes.map(function (t) { return '<li><b>' + esc(t.title) + ':</b> ' + esc(t.detail) + '</li>'; }).join('') + '</ul>' +
      (s.actions && s.actions.length ? '<p style="margin:10px 0 2px;font-weight:700">Suggested actions</p><ul>' + s.actions.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ul>' : '') +
      '<p class="muted" style="font-size:.78rem;margin:8px 0 0">' + (s.sample ? 'This is an example of what the live tab shows once a Gemini key is connected, written to match the invented sample numbers.' : 'Written by an AI model from the anonymous numbers and notes above. Check against the data before acting.') + '</p>';
  }
  function renderAi(s) {
    var box = $('#aiBox'); if (!box || !s) return;
    if (s.source === 'gemini') box.innerHTML = aiInner(s);
    else if (s.error || s.reason) box.insertAdjacentHTML('beforeend', '<p class="muted" style="font-size:.78rem;margin:8px 0 0">AI summary unavailable: ' + esc(s.error || s.reason) + ' (showing the built-in summary).</p>');
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
      lastData = d; el.innerHTML = body(d, sample);
      var b = $('#csvBtn'); if (b) b.onclick = function () {
        var blob = new Blob([csv(d)], { type: 'text/csv' }), a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = 'fitcheck-insights.csv'; document.body.appendChild(a); a.click(); a.remove();
      };
      var rb = $('#resetBtn'); if (rb) rb.onclick = function () {
        var k = window.prompt('Enter the admin key (ADMIN_KEY in Vercel) to clear the live test data:'); if (!k) return;
        fetch('api/reset', { method: 'POST', headers: { 'x-admin-key': k } }).then(function (r) { return r.json(); }).then(function (j) { window.alert(j.ok ? 'Cleared.' : (j.error || 'Could not clear.')); lastJson = ''; lastAi = null; poll(); }).catch(function () { window.alert('Could not reach the server.'); });
      };
      if (sample) renderXAi(SAMPLE_X);
      if (!sample && (d.counts || {}).sessions) {
        if (lastAi) renderAi(lastAi);
        if ($('#xaiBox')) { if (lastXAi) renderXAi(lastXAi); var cc = d.counts, xs = Object.keys(cc).reduce(function (n, k) { return n + (k.indexOf('x:h:') === 0 ? cc[k] : 0); }, 0); if (xs !== lastXTotal || (!lastXAi || lastXAi.source !== 'gemini') && Date.now() - xTry > 60000) { lastXTotal = xs; loadXAi(); } }
        var failed = !lastAi || lastAi.source !== 'gemini';
        if (d.counts.sessions !== lastTotal || (failed && Date.now() - aiTry > 60000)) { lastTotal = d.counts.sessions; loadAi(); }
      }
    }
    function poll() {
      if (mode !== 'live') return;
      fetch('api/stats', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : Promise.reject(); })
        .then(function (d) {
          if (mode !== 'live' || !$('#insBody')) return;
          var sig = JSON.stringify([d.counts, (d.notes || []).length, (d.feed || []).length && d.feed[0].t, d.configured, d.error]);
          if (sig !== lastJson) { lastJson = sig; paint(d, false); } // only redraw when something changed, so open sections and hovers are not reset
          else { var f = $('.feed'); if (f && d.feed) f.outerHTML = feedHtml(d.feed, false); }
          stamp.textContent = 'Updated ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        })
        .catch(function () { if (mode === 'live' && $('#insBody') && !lastData) { el.innerHTML = '<div class="warnbox">Could not load live data. If you are running this page from a file, open the deployed site instead.</div>'; } });
    }
    function show(which) {
      mode = which; lastTotal = -1; lastData = null; lastJson = '';
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
