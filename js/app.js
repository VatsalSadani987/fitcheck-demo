/* Be.Bodywise sample idea + FitCheck: store, product guide, cart, checkout, FitCheck activation, browser chat, insights. */
(function () {
  var P = window.FitProducts, PRODUCTS = P.PRODUCTS, ORDER = P.ORDER, CATS = P.CATS, CFG = window.FIT_CONFIG;
  var app = document.getElementById('app');
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var money = function (n) { return '₹' + Number(n).toLocaleString('en-IN'); };

  /* ---------- state: cart is a convenience (browser storage may be blocked, so every access is guarded) ---------- */
  var memo = { cart: {}, order: null, fc: true };
  var S = { cat: 'all', q: '' };
  function getCart() { try { return JSON.parse(localStorage.getItem('fc_cart') || '{}'); } catch (e) { return memo.cart; } }
  function setCart(c) { memo.cart = c; try { localStorage.setItem('fc_cart', JSON.stringify(c)); } catch (e) { /* private mode */ } badge(); }
  function cartIds() { var c = getCart(); return ORDER.filter(function (id) { return c[id] > 0; }); }
  function cartCount() { var c = getCart(); return ORDER.reduce(function (n, id) { return n + (c[id] || 0); }, 0); }
  function badge() { var n = cartCount(), el = $('#cartCount'); el.textContent = n; el.hidden = n === 0; }
  function add(id, q) { var c = getCart(); c[id] = Math.min(9, (c[id] || 0) + (q || 1)); setCart(c); toast(PRODUCTS[id].nick + ' added to your cart'); }
  function toast(t) { var el = $('#toast'); el.textContent = t; el.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(function () { el.hidden = true; }, 2200); }

  /* ---------- theme ---------- */
  function effectiveTheme() {
    var a = document.documentElement.getAttribute('data-theme');
    if (a === 'dark' || a === 'light') return a;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function syncThemeBtn() { var b = $('#themeBtn'); var d = effectiveTheme() === 'dark'; b.setAttribute('aria-label', d ? 'Switch to light mode' : 'Switch to dark mode'); b.title = d ? 'Light mode' : 'Dark mode'; }
  function toggleTheme() {
    var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('fc_theme', next); } catch (e) { /* fine */ }
    syncThemeBtn();
  }

  /* ---------- icons ---------- */
  var sv = function (inner) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>'; };
  var IC = {
    target: sv('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>'),
    steps: sv('<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>'),
    clock: sv('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    alert: sv('<path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17h.01"/>'),
    chat: sv('<path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.5L3 20.5l1.6-5.4A8.5 8.5 0 1 1 21 11.5z"/>'),
    book: sv('<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>'),
    check: sv('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
    shield: sv('<path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>'),
    wa: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.5L3 20.5l1.6-5.4A8.5 8.5 0 1 1 21 11.5z"/></svg>'
  };

  /* ---------- WhatsApp hand-off: a natural message, no codes ---------- */
  function listNames(ids) {
    var n = ids.map(function (id) { return PRODUCTS[id].name; });
    return n.length > 1 ? n.slice(0, -1).join(', ') + ' and ' + n[n.length - 1] : n[0];
  }
  function waLink(ids, code) {
    var msg = 'Hi! I just ordered the ' + listNames(ids) + ' 🙂 Would love a FitCheck on how ' + (ids.length > 1 ? 'they work.' : 'it works.') + (code ? ' (Order #' + code + ')' : '');
    return 'https://wa.me/' + CFG.whatsappNumber + '?text=' + encodeURIComponent(msg);
  }

  /* ---------- Expectation Receipt: what the customer hopes for, remembered on this device ---------- */
  var TIMES = P.TIMES;
  function getExp() { try { return JSON.parse(localStorage.getItem('fc_exp') || '{}'); } catch (e) { return memo.exp || {}; } }
  function setExp(x) { memo.exp = x; try { localStorage.setItem('fc_exp', JSON.stringify(x)); } catch (e) { /* private mode */ } }
  function expFor(ids) { var all = getExp(), out = {}; ids.forEach(function (id) { if (all[id] && all[id].o && all[id].o.length) out[id] = all[id]; }); return out; }
  function expWidget(id, compact) {
    var p = PRODUCTS[id], e = getExp()[id] || { o: [], t: '' };
    var gap = e.t ? P.timeGap(id, e.t) : '';
    return '<div class="xw" data-xw="' + id + '"' + (compact ? ' data-compact="1"' : '') + '><div class="xh"><span class="ic">' + IC.target + '</span><b>Your expectation receipt</b><span class="tag">OPTIONAL</span></div>' +
      '<p class="muted xs">' + (compact ? esc(p.nick) + ': ' : '') + 'What are you hoping this does for you? Pick up to 3. We remember it on this device and compare it with how things actually go.</p>' +
      '<div class="chips" role="group" aria-label="What you hope for">' + p.expect.map(function (o) { var on = e.o.indexOf(o.id) >= 0; return '<button type="button" class="xc' + (on ? ' on' : '') + '" data-xo="' + id + ':' + o.id + '" aria-pressed="' + on + '">' + esc(o.en) + '</button>'; }).join('') + '</div>' +
      '<p class="xl">When do you expect to notice a change?</p>' +
      '<div class="chips" role="group" aria-label="When you expect a change">' + TIMES.map(function (t) { var on = e.t === t.id; return '<button type="button" class="xc' + (on ? ' on' : '') + '" data-xt="' + id + ':' + t.id + '" aria-pressed="' + on + '">' + esc(t.en) + '</button>'; }).join('') + '</div>' +
      (gap === 'longer' && p.stated ? '<p class="xnote">Heads up: the pack and listing point to ' + esc(p.stated.en) + ', so it may take a little longer than you hope.</p>' : '') + '</div>';
  }
  function receiptCard(ids) {
    var all = expFor(ids), keys = Object.keys(all);
    if (!keys.length) return '';
    return '<div class="rcpt" aria-label="Your expectation receipt"><div class="rh"><b>EXPECTATION RECEIPT</b><span>' + new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + '</span></div>' +
      keys.map(function (id) {
        var p = PRODUCTS[id], e = all[id], gap = P.timeGap(id, e.t);
        return '<div class="rl"><div class="rn">' + esc(p.name) + '</div><div class="rr"><span>Hoping for</span><span>' + e.o.map(function (o) { return esc(p.expect.filter(function (x) { return x.id === o; })[0].en); }).join(', ') + '</span></div>' +
          '<div class="rr"><span>Expected in</span><span>' + esc((TIMES.filter(function (t) { return t.id === e.t; })[0] || TIMES[4]).en) + '</span></div>' +
          '<div class="rr"><span>Pack says</span><span>' + esc(p.stated && p.stated.en ? p.stated.en : 'Not stated') + '</span></div>' +
          (gap === 'longer' ? '<div class="rnote">It may take a little longer than you hope. That is normal.</div>' : '') + '</div>';
      }).join('') + '<div class="rf">We will ask how it compared at your check-in. Your answers stay anonymous.</div></div>';
  }
  function postReceipt(ids) {
    var all = expFor(ids);
    if (!Object.keys(all).length) return Promise.resolve('');
    var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 3500);
    return fetch('api/receipt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: ids, p: all }), signal: ctl ? ctl.signal : undefined })
      .then(function (r) { return r.json(); }).then(function (j) { clearTimeout(timer); return (j && j.code) || ''; }).catch(function () { clearTimeout(timer); return ''; });
  }
  function repaintX(id) {
    document.querySelectorAll('[data-xw="' + id + '"]').forEach(function (w) { var c = w.dataset.compact; w.outerHTML = expWidget(id, !!c); });
  }

  /* ---------- store ---------- */
  function quickLook(p) {
    return '<div class="quick" id="q-' + p.id + '" role="group" aria-label="Quick look at ' + esc(p.name) + '"><div class="qk">Who it is for</div><p>' + esc(p.quick.who) + '</p>' +
      '<div class="qk">At a glance</div><ul>' + p.quick.fit.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' +
      '<div class="qk">Check first</div><p>' + esc(p.quick.check) + '</p><a class="qm" href="#/p/' + p.id + '">Full guide →</a></div>';
  }
  function productCard(id) {
    var p = PRODUCTS[id];
    return '<article class="pcard"><a class="ph" href="#/p/' + id + '" aria-label="' + esc(p.name) + '"><span class="badge">' + esc(p.tag) + '</span><img src="' + p.img + '" alt="' + esc(p.name) + ' pack" loading="lazy" width="520" height="520"></a>' +
      '<button class="qbtn" type="button" data-q="' + id + '" aria-label="Quick look at ' + esc(p.name) + '" aria-expanded="false" aria-controls="q-' + id + '">i</button>' + quickLook(p) +
      '<div class="pb"><div class="kicker">' + esc(p.short) + '</div><h3><a href="#/p/' + id + '">' + esc(p.name) + '</a></h3>' +
      '<div class="pills"><span>' + esc(p.size) + '</span></div>' +
      '<div class="fcline">' + IC.chat + 'FitCheck check-in on day ' + p.checkinDays + '</div>' +
      '<div class="row"><div class="price">' + money(p.price) + '</div><button class="btn sm" data-add="' + id + '" type="button">Add</button></div></div></article>';
  }
  function filtered() {
    var q = S.q.trim().toLowerCase();
    return ORDER.filter(function (id) {
      var p = PRODUCTS[id];
      if (S.cat !== 'all' && p.cats.indexOf(S.cat) < 0) return false;
      if (!q) return true;
      return (p.name + ' ' + p.short + ' ' + p.tag + ' ' + p.nick).toLowerCase().indexOf(q) >= 0;
    });
  }
  function gridHtml() {
    var ids = filtered();
    if (!ids.length) return '<div class="empty"><h3>Nothing matches that</h3><p class="muted">Try another word, or <a href="#/">see everything</a>.</p></div>';
    return '<div class="grid">' + ids.map(productCard).join('') + '</div>';
  }

  var SLIDES = [
    { cls: 's1', h: 'Smoother skin, simpler routine', p: 'Exfoliating body washes and underarm care, each with a clear guide to what it is for and how to use it.', cta: 'Shop body care', href: '#/?cat=body', pics: ['aha5', 'sa1'] },
    { cls: 's2', h: 'New: FitCheck', p: 'Every order now comes with a quick guide and a friendly check-in on WhatsApp, so you know if a product is working and what to do next.', cta: 'See how FitCheck works', href: '#/fitcheck', phone: true },
    { cls: 's3', h: 'Hair care, made simple', p: 'A daily gummy and a leave-in scalp serum, with honest guidance on how long to give them.', cta: 'Shop hair care', href: '#/?cat=hair', pics: ['gum', 'serum'] }
  ];
  function slideHtml(s) {
    var right = s.phone
      ? '<div class="mini-wrap"><div class="mini-phone"><div class="in"><div class="bb">Hey! It’s been about two weeks since you got your <b>5% AHA BHA body wash</b> 🙂<br>How’s it treating you so far?</div><div class="bb o">Working well 😊</div><div class="bb">Love to hear that! 🎉 <b>My take: keep going.</b></div></div></div></div>'
      : '<div class="pics">' + s.pics.map(function (id) { return '<img src="' + PRODUCTS[id].img + '" alt="">'; }).join('') + '</div>';
    return '<div class="slide ' + s.cls + '"><div><h2>' + esc(s.h) + '</h2><p>' + esc(s.p) + '</p><a class="btn" href="' + s.href + '">' + esc(s.cta) + '</a></div>' + right + '</div>';
  }

  function viewHome() {
    var cats = '<nav class="cats" aria-label="Categories">' + CATS.map(function (c) { return '<a href="#/' + (c[0] === 'all' ? '' : '?cat=' + c[0]) + '" class="' + (S.cat === c[0] ? 'on' : '') + '">' + c[1] + '</a>'; }).join('') + '</nav>';
    var strip = '<div class="strip">' +
      '<div><span class="ic">' + IC.book + '</span><span><b>A guide with every product</b>What it is for, how to use it, how long to give it.</span></div>' +
      '<div><span class="ic">' + IC.chat + '</span><span><b>A check-in on WhatsApp</b>Asked after you have had time to try it.</span></div>' +
      '<div><span class="ic">' + IC.check + '</span><span><b>An honest next step</b>Keep going, wait, adjust, swap or see a doctor.</span></div>' +
      '<div><span class="ic">' + IC.shield + '</span><span><b>Anonymous feedback</b>The brand learns why, never who.</span></div></div>';
    return cats +
      '<section class="carousel" aria-roledescription="carousel" aria-label="Highlights"><div class="track" id="track">' + SLIDES.map(slideHtml).join('') + '</div>' +
      '<button class="carr l" data-cprev type="button" aria-label="Previous slide">‹</button><button class="carr r" data-cnext type="button" aria-label="Next slide">›</button>' +
      '<div class="cdots">' + SLIDES.map(function (s, i) { return '<button data-slide="' + i + '" class="' + (i === 0 ? 'on' : '') + '" type="button" aria-label="Go to slide ' + (i + 1) + '"></button>'; }).join('') + '</div></section>' +
      strip +
      '<div class="sec-h" id="products"><h2 style="margin:0">' + (S.cat === 'all' ? 'Shop all' : esc((CATS.filter(function (c) { return c[0] === S.cat; })[0] || ['', 'Products'])[1])) + '</h2><span class="muted" style="font-size:.88rem">' + ORDER.length + ' products · demo prices</span></div>' +
      '<div id="gridBox">' + gridHtml() + '</div>';
  }

  function guideCard(p) {
    var judgeBrand = p.judge === P.NOT_STATED ? '<span class="muted">' + esc(p.judge) + '</span>' : esc(p.judge);
    return '<section class="guide" aria-labelledby="gh"><div class="guide-h"><div><h2 id="gh">FitCheck guide</h2><div class="sub">Know before you start</div></div><span class="src">From the pack and public pages</span></div>' +
      '<div class="gg">' +
      '<div class="gb"><div class="gt"><span class="ic">' + IC.target + '</span><h3>What it is for</h3></div><ul>' + p.forList.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
      '<div class="gb"><div class="gt"><span class="ic">' + IC.steps + '</span><h3>How to use it</h3></div><ol>' + p.how.map(function (x) { return '<li><span>' + esc(x) + '</span></li>'; }).join('') + '</ol></div>' +
      '<div class="gb"><div class="gt"><span class="ic">' + IC.clock + '</span><h3>How long to give it</h3></div><div class="when">' +
      '<div class="w brand"><small>Before you judge</small>' + judgeBrand + '</div>' +
      '<div class="w fc"><small>FitCheck suggestion</small>A first check-in at about day ' + p.checkinDays + '. In this demo it arrives after 30 seconds.</div></div></div>' +
      '<div class="gb warn"><div class="gt"><span class="ic">' + IC.alert + '</span><h3>Good to know</h3></div><ul>' + p.good.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
      '</div><div class="guide-f">Compiled from the pack photo and public listing pages. Where a page did not say, it says so and asks you to check your pack. If your pack differs, follow your pack. This is general information, not medical advice.</div></section>';
  }

  function viewProduct(id) {
    var p = PRODUCTS[id]; if (!p) return viewNotFound();
    var d = p.checkinDays;
    return '<nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Shop</a> / ' + esc(p.name) + '</nav>' +
      '<div class="pp"><div class="big"><img src="' + p.img + '" alt="' + esc(p.name) + ' pack" width="520" height="520"></div>' +
      '<div class="info"><span class="chip">' + esc(p.tag) + '</span><h1 style="margin-top:10px;font-size:clamp(1.6rem,3.4vw,2.2rem)">' + esc(p.name) + '</h1>' +
      '<p class="muted">' + esc(p.short) + ' · ' + esc(p.size) + '</p><div class="price">' + money(p.price) + '<small>demo price</small></div>' +
      '<div class="buy"><button class="btn" data-add="' + id + '" type="button">Add to cart</button><button class="btn ghost" data-buy="' + id + '" type="button">Buy now</button></div>' +
      '<div class="fcnote">' + IC.chat + '<span><b>FitCheck is included.</b> After you order, we send this guide on WhatsApp and check in around day ' + d + ', so you can judge it fairly and know your next step.</span></div></div></div>' +
      '<section class="card xsec">' + expWidget(id) + '</section>' + guideCard(p) +
      '<section class="card plan"><h3>Your trial plan with FitCheck</h3><div class="timeline">' +
      '<div class="st"><div class="dot">1</div><b>Order today</b><span>Read the guide above.</span></div>' +
      '<div class="st"><div class="dot">2</div><b>Start using it</b><span>Follow the steps, as directed.</span></div>' +
      '<div class="st"><div class="dot">3</div><b>Day ' + d + ': check-in</b><span>A short WhatsApp message asks how it is going.</span></div>' +
      '<div class="st"><div class="dot">4</div><b>Your next step</b><span>Keep going, wait, adjust, swap or see a doctor.</span></div></div></section>';
  }

  function optin(checked) {
    return '<label class="optin"><input type="checkbox" id="fcOpt"' + (checked ? ' checked' : '') + '><span><b>Add FitCheck to this order</b><span class="tag">FREE</span><br>A quick guide and a friendly check-in on WhatsApp. We never ask for your number here, and the brand only sees anonymous answers.</span></label>';
  }

  function viewCart() {
    var c = getCart(), ids = cartIds();
    if (!ids.length) return '<div class="empty"><h1>Your cart is empty</h1><p class="muted">Pick a product and read its guide first.</p><a class="btn" href="#/">Shop all</a></div>';
    var total = ids.reduce(function (n, id) { return n + PRODUCTS[id].price * c[id]; }, 0);
    return '<h1>Your cart</h1><div class="cart-grid"><div>' + ids.map(function (id) {
      var p = PRODUCTS[id];
      return '<div class="line"><a href="#/p/' + id + '"><img src="' + p.img + '" alt="" width="84" height="84"></a><div><a class="nm" href="#/p/' + id + '">' + esc(p.name) + '</a><div class="muted" style="font-size:.86rem">' + esc(p.size) + ' · ' + money(p.price) + '</div><button class="link" data-rm="' + id + '" type="button">Remove</button></div>' +
        '<div class="lt"><div class="qty"><button data-dec="' + id + '" aria-label="Decrease quantity" type="button">−</button><span aria-live="polite">' + c[id] + '</span><button data-inc="' + id + '" aria-label="Increase quantity" type="button">+</button></div></div></div>';
    }).join('') + optin(memo.fc) + '</div><aside class="sum"><h3 style="margin-top:0">Order summary</h3><div class="r"><span>Subtotal</span><span>' + money(total) + '</span></div><div class="r"><span>Delivery</span><span>Demo: free</span></div><div class="r"><span>FitCheck</span><span id="fcPrice">' + (memo.fc ? 'Included' : 'Not added') + '</span></div><div class="r tot"><span>Total</span><span>' + money(total) + '</span></div>' +
      '<a class="btn block" style="margin-top:12px" href="#/checkout">Check out</a><p class="muted" style="font-size:.8rem;margin:10px 0 0">Prices are demo prices. Nothing here is charged.</p></aside></div>';
  }

  function viewCheckout() {
    var c = getCart(), ids = cartIds();
    if (!ids.length) return viewCart();
    var total = ids.reduce(function (n, id) { return n + PRODUCTS[id].price * c[id]; }, 0);
    return '<h1>Checkout</h1><div class="cart-grid"><div><div class="notice"><b>Demo checkout.</b> No name, address, phone number or payment details are collected. Nothing is charged and nothing is shipped.</div>' +
      '<div class="card xsec"><h3 style="margin-top:0">Set your expectations</h3><p class="muted xs">Takes 10 seconds and makes your check-in more useful. Skip it if you like.</p>' + ids.map(function (id) { return expWidget(id, true); }).join('') + '</div>' +
      optin(memo.fc) +
      '<div class="card"><h3>What happens after you place the order</h3><ol style="padding-left:1.2em;margin:0"><li>You see your order confirmation.</li><li>If FitCheck is on, you tap <b>Continue on WhatsApp</b>. A message is ready for you to send.</li><li>FitCheck replies with a short guide, then checks in a little later (in real life, after a week or two).</li></ol></div></div>' +
      '<aside class="sum"><h3 style="margin-top:0">Your order</h3>' + ids.map(function (id) { return '<div class="r"><span>' + esc(PRODUCTS[id].name) + ' × ' + c[id] + '</span><span>' + money(PRODUCTS[id].price * c[id]) + '</span></div>'; }).join('') +
      '<div class="r tot"><span>Total</span><span>' + money(total) + '</span></div><button class="btn block" style="margin-top:12px" id="place" type="button">Place demo order</button></aside></div>';
  }

  function viewDone() {
    var o = memo.order;
    if (!o) return '<div class="empty"><h1>No order yet</h1><a class="btn" href="#/">Shop all</a></div>';
    var link = waLink(o.ids, o.code), on = o.fc;
    return '<div class="done"><div class="tick"><svg viewBox="0 0 32 32"><path d="M9 16.5l4.5 4.5L23 11" stroke="#fff" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' +
      '<h1>Thank you! Demo order placed</h1><p class="muted">' + esc(listNames(o.ids)) + '</p>' + receiptCard(o.ids) +
      '<div class="act"><span class="eyebrow"><span class="fcdot"></span>FitCheck</span><h2>' + (on ? 'Your FitCheck is ready to start' : 'Want a FitCheck anyway?') + '</h2>' +
      '<p class="muted" style="margin:0 0 6px">Get your guide and a friendly check-in on WhatsApp. It opens with a message ready to send.</p>' +
      '<div class="act-grid"><div><a class="btn wa" href="' + link + '" target="_blank" rel="noopener" id="waBtn">' + IC.wa + ' Continue on WhatsApp</a>' +
      '<ol><li>Press send on the ready message.</li><li>FitCheck replies with your guide.</li><li>About 30 seconds later it checks in (in real life, after a week or two).</li></ol>' +
      '<p style="margin:0">Prefer not to use WhatsApp? <a href="#/chat?ids=' + o.ids.join('.') + '">Try the same check-in here in your browser</a>.</p></div>' +
      '<div id="qrWrap"><p class="muted" style="font-size:.84rem;margin:0">On a computer? Scan with your phone camera:</p><div class="qrbox"><div id="qr" aria-label="QR code to open WhatsApp"></div></div></div></div>' +
      '<p class="muted" style="font-size:.8rem;margin:14px 0 0">This site never asks for your number or stores it. WhatsApp shares your number with the FitCheck line only so it can reply. Messages come from ' + esc(CFG.whatsappDisplay) + '.</p></div></div>';
  }

  /* ---------- FitCheck page ---------- */
  function viewFitCheck() {
    var verdicts = [
      ['Keep going', 'It is working well', 'Keep using it as directed and let it do its thing.'],
      ['Wait longer', 'Used as directed, no change yet', 'Time is the next step. Shows how long the pack or listing says to give it.'],
      ['Adjust usage', 'Used less than directed, unsure, or directions unclear', 'Repeats the steps from the pack and listing.'],
      ['Consider a swap', 'Feel or smell is not for them', 'Suggests a product in the same range, with a patch-test reminder.'],
      ['Value is their call', 'Price or value is the issue', 'Says plainly that nothing needs fixing, and shows an option.'],
      ['See a doctor', 'Skin irritation', 'Stop using it. See a doctor or pharmacist if it does not settle. Never diagnoses.']
    ];
    return '<section class="fc-hero"><div><span class="eyebrow" style="color:#C6F6EA"><span class="fcdot" style="background:#C6F6EA"></span>New at Be.Bodywise</span><h1 style="margin-top:10px">FitCheck: a fair first trial for everything you buy</h1>' +
      '<p>A short guide when you order, a friendly check-in on WhatsApp when you have had time to try it, and an honest next step. No guessing, no quietly giving up.</p>' +
      '<div class="actions"><a class="btn light" href="' + waLink(['aha5']) + '" target="_blank" rel="noopener">' + IC.wa.replace('stroke="#fff"', 'stroke="#0A6E5C"') + ' Try it on WhatsApp</a><a class="btn ghost" href="#/chat?ids=aha5">Try it in your browser</a></div></div>' +
      '<div><div class="mini-phone" style="transform:none"><div class="in"><div class="bb">Hey! 👋 Welcome to <b>FitCheck</b>, your buddy for getting the most out of your Be.Bodywise order.</div><div class="bb">🧴 <b>5% AHA BHA Exfoliating Body Wash</b><br><br><b>How to use</b><br>1. On wet skin, take some wash in your palms<br>2. Massage gently<br>3. Rinse</div><div class="bb">Hey! It’s been about two weeks 🙂 How’s it treating you so far?</div><div class="bb o">😕 Not what I expected</div></div></div></div></section>' +
      '<h2 style="margin-top:34px">Where FitCheck fits in the Be.Bodywise journey</h2>' +
      '<div class="journey"><div class="j"><b>Browse</b>Product pages</div><div class="j fc"><b>FitCheck</b>Guide on every product page</div><div class="j"><b>Checkout</b>Cart and payment</div><div class="j fc"><b>FitCheck</b>One tick to switch it on</div><div class="j"><b>Delivery</b>Order arrives</div><div class="j fc"><b>FitCheck</b>Check-in on day 7, 14 or 28</div><div class="j fc"><b>FitCheck</b>Honest verdict, anonymous note</div><div class="j"><b>Brand team</b>Insights dashboard</div></div>' +
      '<div class="cols" style="margin:22px 0"><div class="card"><h3>1. Know before you start</h3><p class="muted" style="margin:0">Each product page carries what it is for, how to use it, how long to give it before judging and what to watch for. Taken from the pack and public pages only. If a page does not say, FitCheck says so.</p></div>' +
      '<div class="card"><h3>2. A check-in at the right time</h3><p class="muted" style="margin:0">A short, friendly WhatsApp message around the day the product should start to show. Tap an answer, or type it. In this demo it arrives after 30 seconds instead of two weeks.</p></div>' +
      '<div class="card"><h3>3. An honest next step</h3><p class="muted" style="margin:0">Fixed rules decide the verdict, not a chatbot guessing. Customers can add more than one reason and, if they like, tell the brand anonymously.</p></div></div>' +
      '<h2>The six verdicts</h2><div class="tablewrap"><table class="t"><tr><th>Verdict</th><th>When</th><th>What FitCheck says</th></tr>' + verdicts.map(function (v) { return '<tr><td><b>' + v[0] + '</b></td><td>' + v[1] + '</td><td>' + v[2] + '</td></tr>'; }).join('') + '</table></div>' +
      '<div class="card" style="margin-top:22px;display:flex;gap:18px;align-items:center;flex-wrap:wrap;justify-content:space-between"><div><h3 style="margin:0 0 4px">What the brand gets</h3><p class="muted" style="margin:0;max-width:40em">Why products disappoint, which products need clearer directions, and what is working, as live anonymous charts.</p></div><a class="btn fc" href="#/insights">See the Insights dashboard</a></div>' + aboutBlock();
  }

  function viewChat(q) {
    var ids = (q.ids || 'aha5').split('.').filter(function (x) { return PRODUCTS[x]; }).slice(0, 3);
    if (!ids.length) ids = ['aha5'];
    var picks = ORDER.map(function (id) {
      return '<label class="pick"><input type="checkbox" value="' + id + '"' + (ids.indexOf(id) >= 0 ? ' checked' : '') + '><img src="' + PRODUCTS[id].img + '" alt=""><span>' + esc(PRODUCTS[id].name) + '</span></label>';
    }).join('');
    return '<div class="chat-page"><div class="side"><span class="eyebrow"><span class="fcdot"></span>Browser preview</span><h1 style="margin-top:8px">Try FitCheck in your browser</h1>' +
      '<p class="muted">The same conversation that runs on WhatsApp. Choose up to three products, then start.</p>' +
      '<div class="pickers" id="pickers">' + picks + '</div><button class="btn fc" id="startChat" type="button">Start with these products</button>' +
      '<div class="notice" style="margin-top:18px"><b>Try the paths.</b> Choose <i>Working well</i> for the happy path, <i>Not what I expected</i> to pick several reasons, or <i>Skin irritation</i> to see the doctor route. Use the yellow bar to skip the wait.</div></div>' +
      '<div id="chatRoot"></div></div>';
  }

  /* Short "idea" sections, shown at the bottom of the FitCheck page (no separate About page). */
  function aboutBlock() {
    return '<h2 style="margin-top:36px">Why FitCheck exists</h2>' +
      '<div class="cols"><div class="card"><h3>The problem</h3><p style="margin:0">When a product disappoints, nothing prompts customers, or makes it easy in the moment, to say so. They quietly drop it or switch, and the brand never learns why.</p></div>' +
      '<div class="card"><h3>Where it comes from</h3><p style="margin:0">Seven real customer conversations about Be.Bodywise (no names or numbers are used here). Most found a product that worked, but the same product worked for some and not for others, and one said usage guidance was missing.</p></div>' +
      '<div class="card"><h3>How sure are we?</h3><p style="margin:0">Seven conversations are thin evidence. This is an opportunity worth testing, not a proven problem.</p></div></div>' +
      '<h2 style="margin-top:28px">What is real and what is simulated</h2><div class="tablewrap"><table class="t"><tr><th>Part</th><th>Status</th></tr>' +
      '<tr><td>Product guide</td><td>Real information from the pack and public pages. Gaps are marked as not stated.</td></tr>' +
      '<tr><td>WhatsApp check-in</td><td>Real WhatsApp messages from a demo line. The 30 second wait stands in for one to two weeks.</td></tr>' +
      '<tr><td>Store, cart, payment</td><td>Simulated. No real orders, payments or deliveries, and no personal details collected.</td></tr>' +
      '<tr><td>Verdicts and medical guidance</td><td>Fixed, reviewed text. It never diagnoses. Irritation always means stop and see a doctor.</td></tr>' +
      '<tr><td>Insights</td><td>Live tab: anonymous answers from real demo sessions. Sample tab: invented data, clearly labelled.</td></tr>' +
      '<tr><td>Prices and photos</td><td>Demo prices. Photos and names belong to their owners and are shown for demonstration.</td></tr></table></div>' +
      '<h2 style="margin-top:28px">If this were built for real</h2><ul><li>Trigger each check-in from real delivery dates, not a fixed 30 second wait.</li><li>Offer Hinglish and other languages, since many customers chat that way.</li><li>Connect the verdict and reason tags to the support and product teams’ tools.</li><li>A/B test the check-in wording and timing.</li></ul>' +
      '<p class="muted" style="font-size:.86rem;margin-top:20px">Privacy: the site never asks for a phone number. WhatsApp shares a customer’s number with the FitCheck line only so it can reply. Chat state is kept under a scrambled key for two hours; only anonymous counts and redacted notes are kept. Built with an AI coding assistant (Claude), with the research, product thinking and decisions by the author.</p>';
  }

  function viewNotFound() { return '<div class="empty"><h1>Page not found</h1><a class="btn" href="#/">Back to the store</a></div>'; }

  /* ---------- router ---------- */
  var carTimer = null, carIdx = 0;
  function route() {
    var h = location.hash.replace(/^#/, '') || '/', qi = h.indexOf('?'), q = {};
    if (qi >= 0) { h.slice(qi + 1).split('&').forEach(function (kv) { var a = kv.split('='); q[a[0]] = decodeURIComponent(a[1] || ''); }); h = h.slice(0, qi); }
    var parts = h.split('/').filter(Boolean), view = parts[0] || 'home', html = '';
    if (view === 'team') view = 'insights';
    window.FitInsights.stop(); clearInterval(carTimer);
    if (view === 'home') { S.cat = CATS.some(function (c) { return c[0] === q.cat; }) ? q.cat : 'all'; }
    if (view === 'home') html = viewHome();
    else if (view === 'p') html = viewProduct(parts[1]);
    else if (view === 'cart') html = viewCart();
    else if (view === 'checkout') html = viewCheckout();
    else if (view === 'done') html = viewDone();
    else if (view === 'fitcheck') html = viewFitCheck();
    else if (view === 'chat') html = viewChat(q);
    else if (view === 'about' || view === 'how') { location.replace('#/fitcheck'); return; }
    else if (view === 'insights') html = window.FitInsights.view();
    else html = viewNotFound();
    app.innerHTML = html;
    var navKey = (view === 'p' || view === 'home' || view === 'cart' || view === 'checkout' || view === 'done') ? 'home' : (view === 'chat' ? 'fitcheck' : view);
    document.querySelectorAll('[data-nav]').forEach(function (a) { a.classList.toggle('on', a.dataset.nav === navKey); });
    var titles = { home: 'Shop', fitcheck: 'FitCheck', chat: 'Try FitCheck', insights: 'FitCheck Insights', cart: 'Your cart', checkout: 'Checkout', done: 'Order placed' };
    document.title = (view === 'p' && PRODUCTS[parts[1]] ? PRODUCTS[parts[1]].name : (titles[view] || 'Page not found')) + ' · Be.Bodywise sample idea';
    $('#searchInput').value = view === 'home' ? S.q : '';
    window.scrollTo(0, 0); badge();
    if (view === 'home') startCarousel();
    if (view === 'done') drawQr();
    if (view === 'insights') window.FitInsights.mount();
    if (view === 'chat') bindChat(q);
  }

  function startCarousel() {
    carIdx = 0;
    var track = $('#track'); if (!track) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function go(i) {
      carIdx = (i + SLIDES.length) % SLIDES.length;
      track.style.transform = 'translateX(-' + (carIdx * 100) + '%)';
      document.querySelectorAll('[data-slide]').forEach(function (b, k) { b.classList.toggle('on', k === carIdx); });
    }
    go._f = go; startCarousel.go = go;
    if (!reduce) carTimer = setInterval(function () { go(carIdx + 1); }, 6500);
    var box = $('.carousel'); if (box) { box.onmouseenter = function () { clearInterval(carTimer); }; }
  }

  function drawQr() {
    var el = $('#qr'); if (!el || !memo.order) return;
    function hideQr() { var w = $('#qrWrap'); if (w) w.style.display = 'none'; }
    function draw() { try { new window.QRCode(el, { text: waLink(memo.order.ids, memo.order.code), width: 150, height: 150, correctLevel: window.QRCode.CorrectLevel.M }); } catch (e) { hideQr(); } }
    if (window.QRCode) return draw();
    var s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    s.onload = function () { if ($('#qr')) draw(); }; s.onerror = hideQr;
    document.head.appendChild(s);
  }
  function bindChat(q) {
    var ids = (q.ids || 'aha5').split('.').filter(function (x) { return PRODUCTS[x]; }).slice(0, 3); if (!ids.length) ids = ['aha5'];
    function start(list) { window.FitChat.mount($('#chatRoot'), list, { receipt: expFor(list) }); }
    $('#startChat').onclick = function () {
      var sel = Array.prototype.map.call(document.querySelectorAll('#pickers input:checked'), function (i) { return i.value; }).slice(0, 3);
      start(sel.length ? sel : ['aha5']);
    };
    start(ids);
  }

  /* ---------- events ---------- */
  document.addEventListener('click', function (e) {
    if (e.target.closest('#themeBtn')) { toggleTheme(); return; }
    var sl = e.target.closest('[data-slide],[data-cprev],[data-cnext]');
    if (sl && startCarousel.go) { clearInterval(carTimer); startCarousel.go(sl.dataset.slide !== undefined ? parseInt(sl.dataset.slide, 10) : carIdx + (sl.hasAttribute('data-cnext') ? 1 : -1)); return; }
    var xo = e.target.closest('[data-xo],[data-xt],[data-q]');
    if (xo) {
      if (xo.dataset.q) { var card = xo.closest('.pcard'), open = !card.classList.contains('open'); document.querySelectorAll('.pcard.open').forEach(function (c) { c.classList.remove('open'); var b = c.querySelector('.qbtn'); if (b) b.setAttribute('aria-expanded', 'false'); }); card.classList.toggle('open', open); xo.setAttribute('aria-expanded', String(open)); return; }
      var pr = (xo.dataset.xo || xo.dataset.xt).split(':'), all = getExp(), cur = all[pr[0]] || { o: [], t: '' };
      if (xo.dataset.xo) {
        var i = cur.o.indexOf(pr[1]);
        if (i >= 0) cur.o.splice(i, 1); else if (cur.o.length < 3) cur.o.push(pr[1]); else toast('Pick up to 3');
      } else cur.t = cur.t === pr[1] ? '' : pr[1];
      all[pr[0]] = cur; setExp(all); repaintX(pr[0]);
      var nb = document.querySelector('[data-' + (xo.dataset.xo ? 'xo' : 'xt') + '="' + (xo.dataset.xo || xo.dataset.xt) + '"]'); if (nb) nb.focus();
      return;
    }
    var t = e.target.closest('[data-add],[data-buy],[data-rm],[data-inc],[data-dec],#place'); if (!t) return;
    var c;
    if (t.dataset.add) { add(t.dataset.add); }
    else if (t.dataset.buy) { add(t.dataset.buy); location.hash = '#/checkout'; }
    else if (t.dataset.rm) { c = getCart(); delete c[t.dataset.rm]; setCart(c); route(); }
    else if (t.dataset.inc) { c = getCart(); c[t.dataset.inc] = Math.min(9, (c[t.dataset.inc] || 0) + 1); setCart(c); route(); }
    else if (t.dataset.dec) { c = getCart(); c[t.dataset.dec] = (c[t.dataset.dec] || 1) - 1; if (c[t.dataset.dec] <= 0) delete c[t.dataset.dec]; setCart(c); route(); }
    else if (t.id === 'place') {
      var oids = cartIds().slice(0, 3); t.disabled = true; t.textContent = 'Placing order…';
      postReceipt(oids).then(function (code) { memo.order = { ids: oids, fc: memo.fc, code: code }; setCart({}); location.hash = '#/done'; });
    }
  });
  document.addEventListener('change', function (e) {
    if (e.target && e.target.id === 'fcOpt') { memo.fc = e.target.checked; var fp = $('#fcPrice'); if (fp) fp.textContent = memo.fc ? 'Included' : 'Not added'; }
  });
  $('#searchForm').addEventListener('submit', function (e) { e.preventDefault(); });
  $('#searchInput').addEventListener('input', function (e) {
    S.q = e.target.value;
    var box = $('#gridBox');
    if (box) { box.innerHTML = gridHtml(); return; }
    S.cat = 'all'; location.hash = '#/';
  });
  window.addEventListener('hashchange', route);
  syncThemeBtn();
  route();
})();
