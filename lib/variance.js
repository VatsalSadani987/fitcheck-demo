/* Expectation vs experience. Pure function over the anonymous counters.
   The DECISION for each product comes from fixed rules (so it is auditable). Gemini only explains it in words.
   Counter names (all anonymous):
     x:n:<product>                       receipts (customers who set expectations)
     x:o:<product>:<outcome>             how often an outcome was hoped for
     x:t:<product>:<timeBucket>          when they expected a change
     x:g:<product>:<gap>                 gap between their expected time and the pack/listing: longer | aligned | unknown | unsure
     x:h:<product>:<better|as|less>      how it compared with what they hoped
     x:xt:<product>:<gap>:<hope>         the two together
     x:m:<product>:<outcome>             the hoped-for outcome that fell shortest */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('../data/products.js'));
  else root.FitVariance = factory(root.FitProducts);
})(typeof self !== 'undefined' ? self : this, function (P) {
  var PRODUCTS = P.PRODUCTS, MIN_ANSWERS = 5;
  var DECISIONS = {
    reset_promise: { title: 'Reset the promise', tone: 'warn' },
    fix_guidance: { title: 'Fix the guidance', tone: 'warn' },
    review_delivery: { title: 'Review the product or its use', tone: 'bad' },
    keep: { title: 'Keep it, and use their words', tone: 'good' },
    monitor: { title: 'Keep watching', tone: 'neutral' },
    too_early: { title: 'Too early to call', tone: 'neutral' }
  };

  function g(c, k) { return c[k] || 0; }
  function label(pid, oid) { var o = (PRODUCTS[pid].expect || []).filter(function (x) { return x.id === oid; })[0]; return o ? o.en : oid; }
  function top(c, prefix, ids) {
    var best = null;
    ids.forEach(function (id) { var n = g(c, prefix + id); if (n > 0 && (!best || n > best.n)) best = { id: id, n: n }; });
    return best;
  }
  function pctText(a, b) { return b ? Math.round(100 * a / b) + '%' : '0%'; }

  function forProduct(c, pid) {
    var p = PRODUCTS[pid];
    var outIds = p.expect.map(function (o) { return o.id; });
    var timeIds = P.TIMES.map(function (t) { return t.id; });
    var n = g(c, 'x:n:' + pid);
    var hope = { better: g(c, 'x:h:' + pid + ':better'), as: g(c, 'x:h:' + pid + ':as'), less: g(c, 'x:h:' + pid + ':less') };
    var answered = hope.better + hope.as + hope.less;
    var gap = { longer: g(c, 'x:g:' + pid + ':longer'), aligned: g(c, 'x:g:' + pid + ':aligned'), unknown: g(c, 'x:g:' + pid + ':unknown'), unsure: g(c, 'x:g:' + pid + ':unsure') };
    var lessLonger = g(c, 'x:xt:' + pid + ':longer:less'), lessTotal = hope.less;
    var instr = g(c, 'preason:' + pid + ':instr'), reasonsTotal = Object.keys(c).reduce(function (a, k) { return a + (k.indexOf('preason:' + pid + ':') === 0 ? c[k] : 0); }, 0);
    var topOut = top(c, 'x:o:' + pid + ':', outIds), topTime = top(c, 'x:t:' + pid + ':', timeIds), missed = top(c, 'x:m:' + pid + ':', outIds);
    var lessShare = answered ? hope.less / answered : 0;
    var stated = p.stated && p.stated.en ? p.stated.en : '';
    var key, why, action;

    if (answered < MIN_ANSWERS) {
      key = 'too_early';
      why = answered + ' of ' + n + ' customers have answered so far. At least ' + MIN_ANSWERS + ' are needed before a decision is fair.';
      action = 'Keep collecting check-ins. Nothing to change yet.';
    } else if (lessShare >= 0.4) {
      if (lessTotal > 0 && lessLonger / lessTotal >= 0.5 && stated) {
        key = 'reset_promise';
        why = pctText(hope.less, answered) + ' said it fell short of what they hoped, and ' + lessLonger + ' of those ' + lessTotal + ' expected results sooner than the pack or listing suggests (' + stated + ').';
        action = 'Show the realistic timeline on the product page, the pack and the order confirmation, and send a reassurance message before customers give up.';
      } else if (reasonsTotal > 0 && instr / reasonsTotal >= 0.3) {
        key = 'fix_guidance';
        why = pctText(hope.less, answered) + ' said it fell short, and unclear instructions were the reason in ' + instr + ' of ' + reasonsTotal + ' reasons given.';
        action = 'Add how much and how often to the pack and the page, then check again.';
      } else {
        key = 'review_delivery';
        why = pctText(hope.less, answered) + ' said it fell short of what they hoped, and the timing they expected does not explain it' + (missed ? '. The hope missed most often: ' + label(pid, missed.id) + '.' : '.');
        action = 'Review the product and how it is used' + (missed ? ', starting with "' + label(pid, missed.id) + '"' : '') + '. Read the customer notes for the reason.';
      }
    } else if ((hope.better + hope.as) / answered >= 0.7) {
      key = 'keep';
      why = pctText(hope.better + hope.as, answered) + ' said it matches or beats what they hoped.';
      action = 'Use what customers hope for' + (topOut ? ' (most often "' + label(pid, topOut.id) + '")' : '') + ' as the lead message in the product copy.';
    } else {
      key = 'monitor';
      why = 'Results are mixed: ' + pctText(hope.less, answered) + ' fell short of what they hoped.';
      action = 'Keep collecting check-ins and watch whether the gap grows.';
    }
    return { id: pid, receipts: n, answered: answered, hope: hope, lessShare: lessShare, gap: gap,
      topOut: topOut, topTime: topTime, missed: missed, decision: key, title: DECISIONS[key].title, tone: DECISIONS[key].tone, why: why, action: action };
  }

  function analyse(counts) {
    var c = counts || {};
    var list = P.ORDER.map(function (pid) { return forProduct(c, pid); }).filter(function (r) { return r.receipts > 0 || r.answered > 0; });
    var receipts = list.reduce(function (a, r) { return a + r.receipts; }, 0), answered = list.reduce(function (a, r) { return a + r.answered; }, 0);
    var less = list.reduce(function (a, r) { return a + r.hope.less; }, 0);
    return { products: list, receipts: receipts, answered: answered, lessShare: answered ? less / answered : 0 };
  }


  /* "If we fix this" estimate. ONE number comes from the check-ins: the share of answered check-ins whose verdict was fixable
     (wait longer, adjust usage, or swap) and who might otherwise quietly leave. Everything else is an assumption the team can change.
       rescued = buyers x checkinRate x atRiskShare x rescueRate
       retention gain (points) = rescued / buyers x 100        (each rescued buyer becomes a repeat buyer)
       NPS gain (points)       = rescued / buyers x 100        (an unhappy buyer moves to neutral: +1 each, a cautious count)
       extra revenue           = rescued x repeatOrders x averageOrder */
  function impact(c, inp) {
    var keys = ['keep', 'wait', 'usage', 'swap', 'value', 'doctor'], tot = 0;
    keys.forEach(function (k) { tot += c['verdict:' + k] || 0; });
    var fix = (c['verdict:wait'] || 0) + (c['verdict:usage'] || 0) + (c['verdict:swap'] || 0);
    var share = tot ? fix / tot : 0;
    var num = function (x, d) { x = parseFloat(x); return isFinite(x) && x >= 0 ? x : d; };
    var B = num(inp.buyers, 1000), ck = Math.min(1, num(inp.checkin, 40) / 100), rs = Math.min(1, num(inp.rescue, 15) / 100), ro = num(inp.repeats, 2), ao = num(inp.order, 550);
    var scen = function (m) { var r = B * ck * share * Math.min(1, rs * m); return { rescued: r, retention: B ? 100 * r / B : 0, nps: B ? 100 * r / B : 0, revenue: r * ro * ao }; };
    return { verdicts: tot, fixable: fix, share: share, low: scen(0.5), base: scen(1), high: scen(1.5) };
  }

  return { impact: impact, analyse: analyse, forProduct: forProduct, label: label, DECISIONS: DECISIONS, MIN_ANSWERS: MIN_ANSWERS };
});
