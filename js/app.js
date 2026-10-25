/* FitCheck demo store: browse, product guide, cart, checkout, WhatsApp hand-off, in-browser chat, team view. */
(function () {
  var P = window.FitProducts, PRODUCTS = P.PRODUCTS, ORDER = P.ORDER, CFG = window.FIT_CONFIG;
  var app = document.getElementById('app');
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var money = function (n) { return '₹' + Number(n).toLocaleString('en-IN'); };

  /* ---------- cart (browser storage is a convenience only) ---------- */
  var memo = { cart: {}, order: null };
  function getCart() { try { return JSON.parse(localStorage.getItem('fc_cart') || '{}'); } catch (e) { return memo.cart; } }
  function setCart(c) { memo.cart = c; try { localStorage.setItem('fc_cart', JSON.stringify(c)); } catch (e) { /* private mode */ } badge(); }
  function cartIds() { var c = getCart(); return ORDER.filter(function (id) { return c[id] > 0; }); }
  function cartCount() { var c = getCart(); return ORDER.reduce(function (n, id) { return n + (c[id] || 0); }, 0); }
  function badge() { var n = cartCount(), el = $('#cartCount'); el.textContent = n; el.hidden = n === 0; }
  function add(id, q) { var c = getCart(); c[id] = Math.min(9, (c[id] || 0) + (q || 1)); setCart(c); toast(PRODUCTS[id].name + ' added to cart'); }
  function toast(t) { var el = $('#toast'); el.textContent = t; el.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(function () { el.hidden = true; }, 2200); }

  /* ---------- icons ---------- */
  var IC = {
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg>',
    steps: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17h.01"/></svg>',
    wa: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.5L3 20.500l1.600-5.400A8.500 8.500 0 1 1 21 11.500z"/></svg>'
  };

  /* ---------- views ---------- */
  function productCard(id) {
    var p = PRODUCTS[id];
    return '<article class="pcard"><a class="ph" href="#/p/' + id + '" aria-label="' + esc(p.name) + '"><img src="' + p.img + '" alt="' + esc(p.name) + ' pack" loading="lazy" width="520" height="520"></a>' +
      '<div class="pb"><span class="chip" style="align-self:flex-start">' + esc(p.tag) + '</span>' +
      '<h3><a href="#/p/' + id + '">' + esc(p.name) + '</a></h3><div class="meta">' + esc(p.short) + ' · ' + esc(p.size) + '</div>' +
      '<div class="row"><div class="price">' + money(p.price) + '<small>demo price</small></div>' +
      '<div><a class="btn ghost sm" href="#/p/' + id + '">View guide</a></div></div>' +
      '<button class="btn sm" data-add="' + id + '" type="button">Add to cart</button></div></article>';
  }

  function viewHome() {
    return '<section class="hero"><div><span class="chip">Independent concept</span><h1 style="margin-top:12px">Give every new product a fair first trial</h1>' +
      '<p class="lead">Browse the products, read a clear guide to what each one is for, how to use it and how long to give it, then get a friendly check-in on WhatsApp.</p>' +
      '<div class="actions"><a class="btn" href="#/" data-scroll="products">Shop the demo store</a><a class="btn ghost" href="#/how">How it works</a></div></div>' +
      '<div class="steps"><div class="step"><b>1</b><span><strong>Read the guide</strong> on each product page, from the pack and public pages only.</span></div>' +
      '<div class="step"><b>2</b><span><strong>Check out</strong> in the demo cart. No details are collected.</span></div>' +
      '<div class="step"><b>3</b><span><strong>Continue on WhatsApp</strong> for a check-in and an honest next step.</span></div></div></section>' +
      '<div class="sec-h" id="products"><h2 style="margin:0">Products</h2><span class="muted" style="font-size:.88rem">6 products · demo prices</span></div>' +
      '<div class="grid">' + ORDER.map(productCard).join('') + '</div>';
  }

  function guideCard(p) {
    var judgeBrand = p.judge === P.NOT_STATED ? '<span class="muted">' + esc(p.judge) + '</span>' : esc(p.judge);
    return '<section class="guide" aria-labelledby="gh"><div class="guide-h"><div><h2 id="gh">FitCheck guide</h2><div class="sub">What to know before you start</div></div><span class="src">From the pack and public pages</span></div>' +
      '<div class="gg">' +
      '<div class="gb"><div class="gt"><span class="ic">' + IC.target + '</span><h3>What it is for</h3></div><ul>' + p.forList.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
      '<div class="gb"><div class="gt"><span class="ic">' + IC.steps + '</span><h3>How to use it</h3></div><ol>' + p.how.map(function (x) { return '<li><span>' + esc(x) + '</span></li>'; }).join('') + '</ol></div>' +
      '<div class="gb"><div class="gt"><span class="ic">' + IC.clock + '</span><h3>How long to give it</h3></div><div class="when">' +
      '<div class="w brand"><small>Before you judge</small>' + judgeBrand + '</div>' +
      '<div class="w fc"><small>FitCheck suggestion</small>A first check-in at about day ' + p.checkinDays + '. In this demo it arrives after 30 seconds.</div></div></div>' +
      '<div class="gb warn"><div class="gt"><span class="ic">' + IC.alert + '</span><h3>Good to know</h3></div><ul>' + p.good.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
      '</div><div class="guide-f">Compiled from the pack photo and public listing pages. Where a page did not say, we say so and ask you to check your pack. If your pack differs, follow your pack. This is general information, not medical advice.</div></section>';
  }

  function viewProduct(id) {
    var p = PRODUCTS[id]; if (!p) return viewNotFound();
    return '<nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Shop</a> / ' + esc(p.name) + '</nav>' +
      '<div class="pp"><div class="big"><img src="' + p.img + '" alt="' + esc(p.name) + ' pack" width="520" height="520"></div>' +
      '<div class="info"><span class="chip">' + esc(p.tag) + '</span><h1 style="margin-top:10px;font-size:clamp(1.6rem,3.4vw,2.2rem)">' + esc(p.name) + '</h1>' +
      '<p class="muted">' + esc(p.short) + ' · ' + esc(p.size) + '</p><div class="price">' + money(p.price) + '<small>demo price</small></div>' +
      '<div class="buy"><button class="btn" data-add="' + id + '" type="button">Add to cart</button><button class="btn ghost" data-buy="' + id + '" type="button">Buy now</button></div>' +
      '<div class="fcnote"><span style="color:var(--royal)">' + IC.clock.replace('<svg', '<svg width="20" height="20"') + '</span><span>Buy it here and FitCheck will check in on WhatsApp, so you can judge it fairly and know your next step.</span></div></div></div>' +
      guideCard(p);
  }

  function viewCart() {
    var c = getCart(), ids = cartIds();
    if (!ids.length) return '<div class="empty"><h1>Your cart is empty</h1><p class="muted">Pick a product and read its guide first.</p><a class="btn" href="#/">Shop the demo store</a></div>';
    var total = ids.reduce(function (n, id) { return n + PRODUCTS[id].price * c[id]; }, 0);
    return '<h1>Your cart</h1><div class="cart-grid"><div>' + ids.map(function (id) {
      var p = PRODUCTS[id];
      return '<div class="line"><a href="#/p/' + id + '"><img src="' + p.img + '" alt="" width="84" height="84"></a><div><a href="#/p/' + id + '" style="color:var(--navy);font-weight:600;text-decoration:none">' + esc(p.name) + '</a><div class="muted" style="font-size:.86rem">' + esc(p.size) + ' · ' + money(p.price) + '</div><button class="link" data-rm="' + id + '" type="button">Remove</button></div>' +
        '<div class="lt"><div class="qty"><button data-dec="' + id + '" aria-label="Decrease quantity" type="button">−</button><span aria-live="polite">' + c[id] + '</span><button data-inc="' + id + '" aria-label="Increase quantity" type="button">+</button></div></div></div>';
    }).join('') + '</div><aside class="sum"><h3 style="margin-top:0">Order summary</h3><div class="r"><span>Subtotal</span><span>' + money(total) + '</span></div><div class="r"><span>Delivery</span><span>Demo: free</span></div><div class="r tot"><span>Total</span><span>' + money(total) + '</span></div>' +
      '<a class="btn" style="width:100%;margin-top:12px" href="#/checkout">Check out</a><p class="muted" style="font-size:.8rem;margin:10px 0 0">Prices are demo prices. Nothing here is charged.</p></aside></div>';
  }

  function viewCheckout() {
    var c = getCart(), ids = cartIds();
    if (!ids.length) return viewCart();
    var total = ids.reduce(function (n, id) { return n + PRODUCTS[id].price * c[id]; }, 0);
    return '<h1>Checkout</h1><div class="cart-grid"><div><div class="notice"><b>Demo checkout.</b> We do not collect your name, address, phone number or payment details. Nothing is charged and nothing is shipped.</div>' +
      '<div class="card"><h3>What happens next</h3><ol style="padding-left:1.2em;margin:0"><li>You place the demo order.</li><li>You tap <b>Continue on WhatsApp</b>. WhatsApp opens with a message ready to send.</li><li>FitCheck replies with a short guide, then checks in a moment later (in real life, after a week or two).</li></ol></div></div>' +
      '<aside class="sum"><h3 style="margin-top:0">Your order</h3>' + ids.map(function (id) { return '<div class="r"><span>' + esc(PRODUCTS[id].name) + ' × ' + c[id] + '</span><span>' + money(PRODUCTS[id].price * c[id]) + '</span></div>'; }).join('') +
      '<div class="r tot"><span>Total</span><span>' + money(total) + '</span></div><button class="btn" style="width:100%;margin-top:12px" id="place" type="button">Place demo order</button></aside></div>';
  }

  function waLink(ids) {
    var names = ids.map(function (id) { return PRODUCTS[id].name; }).join(', ');
    var msg = 'Hi FitCheck! I just bought: ' + names + ' (demo order). Ref: FC-' + ids.join('.');
    return 'https://wa.me/' + CFG.whatsappNumber + '?text=' + encodeURIComponent(msg);
  }

  function viewDone() {
    var o = memo.order;
    if (!o) return '<div class="empty"><h1>No order yet</h1><a class="btn" href="#/">Shop the demo store</a></div>';
    var link = waLink(o.ids), names = o.ids.map(function (id) { return esc(PRODUCTS[id].name); }).join(', ');
    return '<div class="done"><div class="tick"><svg viewBox="0 0 32 32"><path d="M9 16.5l4.5 4.5L23 11" stroke="#fff" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' +
      '<h1>Demo order placed</h1><p class="muted">' + names + '</p>' +
      '<div class="wa-card"><h2>Your FitCheck is ready</h2><p>Continue on WhatsApp for your guide and a check-in. WhatsApp opens with a message ready for you to send.</p>' +
      '<a class="btn wa" href="' + link + '" target="_blank" rel="noopener" id="waBtn">' + IC.wa + ' Continue on WhatsApp</a>' +
      '<p class="muted" style="font-size:.84rem;margin:12px 0 0">On a computer, scan this with your phone camera:</p><div class="qrbox"><div id="qr" aria-label="QR code to open WhatsApp"></div></div>' +
      '<ol><li>Press send on the ready message.</li><li>FitCheck replies with your guide.</li><li>About 30 seconds later, it checks in (in real life, after a week or two).</li></ol>' +
      '<p class="muted" style="font-size:.82rem;margin:0">The site never asks for your number and does not store it. WhatsApp shows your number to the FitCheck line only so it can reply. Messages come from the independent concept line ' + esc(CFG.whatsappDisplay) + '.</p></div>' +
      '<p>Prefer not to use WhatsApp? <a href="#/chat?ids=' + o.ids.join('.') + '">Try the same check-in here in your browser</a>.</p></div>';
  }

  function viewChat(q) {
    var ids = (q.ids || 'aha5').split('.').filter(function (x) { return PRODUCTS[x]; }).slice(0, 3);
    if (!ids.length) ids = ['aha5'];
    var picks = ORDER.map(function (id) {
      return '<label class="pick"><input type="checkbox" value="' + id + '"' + (ids.indexOf(id) >= 0 ? ' checked' : '') + '><img src="' + PRODUCTS[id].img + '" alt=""><span>' + esc(PRODUCTS[id].name) + '</span></label>';
    }).join('');
    return '<div class="chat-page"><div class="side"><span class="chip">Simulation</span><h1 style="margin-top:10px">Try the check-in in your browser</h1>' +
      '<p class="muted">This is the same conversation that runs on WhatsApp. Choose up to three products, then start.</p>' +
      '<div class="pickers" id="pickers">' + picks + '</div><button class="btn" id="startChat" type="button">Start with these products</button>' +
      '<div class="notice" style="margin-top:18px"><b>Try the paths.</b> Choose <i>Working well</i> for a quick happy path, <i>Not what I expected</i> for guidance, or <i>Skin irritation</i> to see the doctor route. Use the yellow bar to skip the wait.</div></div>' +
      '<div id="chatRoot"></div></div>';
  }

  function viewHow() {
    return '<span class="chip">How it works</span><h1 style="margin-top:10px">A fair first trial, and a way for the brand to learn why</h1>' +
      '<p class="muted" style="max-width:46em">FitCheck is an independent concept built for the Mosaic Wellness Fellowship Builder Challenge. It began with seven real customer conversations about Be.Bodywise (no names or phone numbers are used here).</p>' +
      '<div class="cols" style="margin:20px 0"><div class="card"><h3>What the conversations showed</h3><ul><li>Most customers found a product that worked, and tried it because of reviews, a friend or a claim.</li><li>The same product worked for some and not for others.</li><li>One customer said usage guidance was missing.</li><li>The first four customers knew how to contact the brand, but did not think to.</li></ul></div>' +
      '<div class="card"><h3>The problem we chose</h3><p>When a product disappoints, nothing prompts customers, or makes it easy in the moment, to say so. They quietly drop it or switch, and the brand never learns why.</p><p class="muted" style="font-size:.88rem;margin:0">Seven conversations are thin evidence. We call this an opportunity, not a proven problem.</p></div>' +
      '<div class="card"><h3>What FitCheck does</h3><ol style="padding-left:1.2em;margin:0"><li>A clear guide on the product page.</li><li>A check-in on WhatsApp at the right moment.</li><li>An honest verdict: keep going, wait longer, adjust usage, consider a swap, or see a doctor.</li><li>An optional anonymous note for the brand.</li></ol></div></div>' +
      '<h2>What is real and what is simulated</h2><div class="card" style="padding:0;overflow:auto"><table class="t"><tr><th>Part</th><th>Status</th></tr>' +
      '<tr><td>Product guide</td><td>Real information from the pack and public pages. Gaps are marked as not stated.</td></tr>' +
      '<tr><td>WhatsApp check-in</td><td>Real WhatsApp messages from an independent concept line. The 30 second wait stands in for one to two weeks.</td></tr>' +
      '<tr><td>Orders, cart, payment</td><td>Simulated. No real orders, payments or deliveries, and no personal details collected.</td></tr>' +
      '<tr><td>Verdicts and medical guidance</td><td>Fixed, reviewed text. It never diagnoses. Irritation always means stop and see a doctor.</td></tr>' +
      '<tr><td>Team view</td><td>Sample data (clearly marked) plus anonymous counts from live demo sessions.</td></tr>' +
      '<tr><td>Prices and product photos</td><td>Demo prices. Photos and names belong to their owners and are shown for demonstration.</td></tr></table></div>' +
      '<h2 style="margin-top:28px">Privacy</h2><p>The site never asks for a phone number. When someone messages the WhatsApp line, WhatsApp shares their number with it only so it can reply. A short-lived conversation state is kept under a scrambled key for two hours, and only anonymous counts and redacted notes are kept.</p>' +
      '<p class="muted" style="font-size:.88rem">Built with an AI coding assistant (Claude), with the product thinking, research and decisions by the author.</p>';
  }

  /* ---------- team view ---------- */
  var LABELS = {
    q1: { well: 'Working well', none: 'No change yet', notexp: 'Not what I expected', irr: 'Skin irritation', little: "Haven't used much" },
    verdict: { keep: 'Keep going', wait: 'Wait longer', usage: 'Adjust usage', swap: 'Consider a swap', value: 'Value is their call', doctor: 'See a doctor' },
    reason: { results: 'No visible results', feel: 'Feel or texture', smell: 'Smell', price: 'Price or value', instr: 'Instructions unclear', other: 'Something else' },
    use: { less: 'Less than directed', asdir: 'As directed', unsure: 'Not sure how to use' }
  };
  var SAMPLE = {
    counts: { sessions: 120, shared: 52, 'q1:well': 58, 'q1:none': 21, 'q1:notexp': 22, 'q1:irr': 5, 'q1:little': 14,
      'verdict:keep': 58, 'verdict:wait': 17, 'verdict:usage': 27, 'verdict:swap': 8, 'verdict:value': 5, 'verdict:doctor': 5,
      'reason:results': 9, 'reason:feel': 5, 'reason:smell': 2, 'reason:price': 3, 'reason:instr': 8, 'reason:other': 1,
      'use:less': 13, 'use:asdir': 22, 'use:unsure': 8 },
    notes: [
      { product: 'aha5', tags: ['instructions', 'results'], text: 'Did not know how many times a week to use it, so I stopped after two weeks.' },
      { product: 'roll', tags: ['feel'], text: 'Works for odour but feels sticky for the first minute.' },
      { product: 'serum', tags: ['feel'], text: 'Left my hair looking oily by evening.' },
      { product: 'sa1', tags: ['price'], text: 'Works well, but I found a cheaper option.' }
    ]
  };

  function pct(a, b) { return b ? Math.round(100 * a / b) : 0; }
  function bars(title, map, counts, prefix) {
    var keys = Object.keys(map), vals = keys.map(function (k) { return counts[prefix + ':' + k] || 0; }), max = Math.max.apply(null, vals.concat([1]));
    return '<div class="card"><h3>' + title + '</h3>' + keys.map(function (k, i) { return '<div class="bar"><span>' + esc(map[k]) + '</span><div class="tr"><div class="fl" style="width:' + Math.round(100 * vals[i] / max) + '%"></div></div><em>' + vals[i] + '</em></div>'; }).join('') + '</div>';
  }
  function teamBody(d, sample) {
    var c = d.counts || {}, s = c.sessions || 0;
    if (!s) return '<div class="card"><p style="margin:0">No live demo sessions yet. Try the <a href="#/chat">browser chat</a> or the WhatsApp flow, then come back to see anonymous counts appear here.</p></div>';
    var notOk = (c['q1:none'] || 0) + (c['q1:notexp'] || 0) + (c['q1:irr'] || 0), top = Object.keys(LABELS.reason).sort(function (a, b) { return (c['reason:' + b] || 0) - (c['reason:' + a] || 0); })[0];
    var usageShare = pct((c['verdict:usage'] || 0), (c['verdict:keep'] || 0) + (c['verdict:wait'] || 0) + (c['verdict:usage'] || 0) + (c['verdict:swap'] || 0) + (c['verdict:value'] || 0) + (c['verdict:doctor'] || 0));
    return '<div class="kpis"><div class="kpi"><b>' + s + '</b><span>check-in sessions</span></div><div class="kpi"><b>' + pct(c['q1:well'] || 0, s) + '%</b><span>said it is working well</span></div><div class="kpi"><b>' + pct(notOk, s) + '%</b><span>had no change, a mismatch or irritation</span></div><div class="kpi"><b>' + pct(c.shared || 0, s) + '%</b><span>chose to tell the brand</span></div></div>' +
      '<div class="cols wide">' + bars('How is it going?', LABELS.q1, c, 'q1') + bars('Verdicts given', LABELS.verdict, c, 'verdict') + bars('Main reason when it was not as expected', LABELS.reason, c, 'reason') + bars('How they were using it', LABELS.use, c, 'use') + '</div>' +
      '<div class="card" style="margin-top:16px"><h3>What the team would learn</h3><ul class="insights"><li><b>' + usageShare + '%</b> of verdicts were about usage. Clearer directions could remove avoidable disappointment before a customer leaves.</li><li>The most common reason a product felt wrong: <b>' + esc(LABELS.reason[top] || 'n/a') + '</b>.</li><li>Positive experiences are captured too, so the brand sees what is working, not only complaints.</li></ul></div>' +
      '<div class="card" style="margin-top:16px"><h3>Anonymous notes</h3>' + (d.notes && d.notes.length ? d.notes.map(function (n) { return '<div class="note">' + esc(n.text) + '<br><small>' + esc((PRODUCTS[n.product] || { name: '' }).name) + ' · ' + esc((n.tags || []).join(', ')) + '</small></div>'; }).join('') : '<p class="muted" style="margin:0">No notes yet.</p>') + '</div>';
  }
  function viewTeam() {
    return '<span class="chip">For the team</span><h1 style="margin-top:10px">What the brand would see</h1><p class="muted" style="max-width:46em">Only anonymous reasons. No names, no phone numbers.</p>' +
      '<div class="seg" role="tablist"><button class="on" data-seg="sample" role="tab" type="button">Sample data</button><button data-seg="live" role="tab" type="button">Live demo sessions</button></div>' +
      '<p id="segTag"><span class="tag-sample">SAMPLE DATA, INVENTED FOR ILLUSTRATION</span></p><div id="teamBody"></div>';
  }
  function bindTeam() {
    var body = $('#teamBody'), tag = $('#segTag'), live = null;
    function show(which) {
      document.querySelectorAll('[data-seg]').forEach(function (b) { b.classList.toggle('on', b.dataset.seg === which); });
      if (which === 'sample') { tag.innerHTML = '<span class="tag-sample">SAMPLE DATA, INVENTED FOR ILLUSTRATION</span>'; body.innerHTML = teamBody(SAMPLE, true); return; }
      tag.innerHTML = '<span class="tag-live">LIVE DEMO SESSIONS, ANONYMOUS COUNTS</span>'; body.innerHTML = '<p class="muted">Loading…</p>';
      fetch('api/stats').then(function (r) { return r.ok ? r.json() : { counts: {}, notes: [] }; }).catch(function () { return { counts: {}, notes: [] }; }).then(function (d) { live = d; body.innerHTML = teamBody(d, false) + (d.persistent === false ? '<p class="muted" style="font-size:.8rem">Counts are kept in temporary memory until a database is connected, so they may reset.</p>' : ''); });
    }
    document.querySelectorAll('[data-seg]').forEach(function (b) { b.onclick = function () { show(b.dataset.seg); }; });
    show('sample');
  }

  function viewNotFound() { return '<div class="empty"><h1>Page not found</h1><a class="btn" href="#/">Back to the store</a></div>'; }

  /* ---------- router ---------- */
  function route() {
    var h = location.hash.replace(/^#/, '') || '/', qi = h.indexOf('?'), q = {};
    if (qi >= 0) { h.slice(qi + 1).split('&').forEach(function (kv) { var a = kv.split('='); q[a[0]] = decodeURIComponent(a[1] || ''); }); h = h.slice(0, qi); }
    var parts = h.split('/').filter(Boolean), view = parts[0] || 'home', html = '';
    if (h === 'products') { view = 'home'; }
    if (view === 'home') html = viewHome();
    else if (view === 'p') html = viewProduct(parts[1]);
    else if (view === 'cart') html = viewCart();
    else if (view === 'checkout') html = viewCheckout();
    else if (view === 'done') html = viewDone();
    else if (view === 'chat') html = viewChat(q);
    else if (view === 'how') html = viewHow();
    else if (view === 'team') html = viewTeam();
    else html = viewNotFound();
    app.innerHTML = html;
    document.querySelectorAll('[data-nav]').forEach(function (a) { a.classList.toggle('on', a.dataset.nav === (view === 'p' || view === 'home' ? 'home' : view)); });
    document.title = (view === 'p' && PRODUCTS[parts[1]] ? PRODUCTS[parts[1]].name + ' · ' : '') + 'FitCheck demo store';
    window.scrollTo(0, 0); badge();
    if (view === 'done') drawQr();
    if (view === 'team') bindTeam();
    if (view === 'chat') bindChat(q);
  }

  function drawQr() {
    var el = $('#qr'); if (!el || !memo.order) return;
    if (window.QRCode) { try { new QRCode(el, { text: waLink(memo.order.ids), width: 150, height: 150, correctLevel: QRCode.CorrectLevel.M }); return; } catch (e) { /* fall through */ } }
    el.parentNode.style.display = 'none';
  }
  function bindChat(q) {
    var ids = (q.ids || 'aha5').split('.').filter(function (x) { return PRODUCTS[x]; }).slice(0, 3); if (!ids.length) ids = ['aha5'];
    function start(list) { FitChat.mount($('#chatRoot'), list); }
    $('#startChat').onclick = function () {
      var sel = Array.prototype.map.call(document.querySelectorAll('#pickers input:checked'), function (i) { return i.value; }).slice(0, 3);
      start(sel.length ? sel : ['aha5']);
    };
    start(ids);
  }

  /* ---------- events ---------- */
  document.addEventListener('click', function (e) {
    var sc = e.target.closest('[data-scroll]');
    if (sc) { e.preventDefault(); var tg = document.getElementById(sc.dataset.scroll); if (tg) tg.scrollIntoView({ behavior: 'smooth' }); return; }
    var t = e.target.closest('[data-add],[data-buy],[data-rm],[data-inc],[data-dec],#place'); if (!t) return;
    var c;
    if (t.dataset.add) { add(t.dataset.add); }
    else if (t.dataset.buy) { add(t.dataset.buy); location.hash = '#/checkout'; }
    else if (t.dataset.rm) { c = getCart(); delete c[t.dataset.rm]; setCart(c); route(); }
    else if (t.dataset.inc) { c = getCart(); c[t.dataset.inc] = Math.min(9, (c[t.dataset.inc] || 0) + 1); setCart(c); route(); }
    else if (t.dataset.dec) { c = getCart(); c[t.dataset.dec] = (c[t.dataset.dec] || 1) - 1; if (c[t.dataset.dec] <= 0) delete c[t.dataset.dec]; setCart(c); route(); }
    else if (t.id === 'place') { memo.order = { ids: cartIds().slice(0, 3) }; setCart({}); location.hash = '#/done'; }
  });
  window.addEventListener('hashchange', route);
  route();
})();
