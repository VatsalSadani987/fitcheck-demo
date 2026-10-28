/* Product data for the FitCheck demo store.
   Every detail below was checked against the official Be Bodywise product pages (bebodywise.com) on 28 Oct 2026.
   Prices are the brand's listed selling prices on that day (the website shows different prices on different pages for some items) and are shown as DEMO prices. Anything a page does not say is not claimed here. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FitProducts = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  var NS = 'Not stated on the pages we checked. Check your pack.';
  /* Official product photos load from the brand's own image host. If one cannot load, the local copy in img/ is used instead. */
  var CDN = 'https://i.mscwlns.co/media/misc/pdp_rcl/';
  var PRODUCTS = {
    sa1: {
      id: 'sa1', name: '1% Salicylic Acid Body Wash', short: 'Body acne and bumps', size: '375 ml', price: 399,
      img: CDN + '1-salicylic-acid-body-wash-350ml/375ml%20-%20Hero_96u9ib.jpg?tr=w-600', imgFallback: 'img/sa-body-wash-1.jpg', tag: 'Body wash',
      forShort: 'Unclogs pores to help prevent body acne and exfoliates dead skin cells.',
      forList: ['Brand page: exfoliates dead skin cells and unclogs pores to help prevent body acne.', 'Has 1% salicylic acid, chamomile extract and Pentavitin. Free of sulphates and silicones.'],
      how: ['Take an adequate amount of wash in your palms or on a loofah.', 'Apply on wet skin in gentle circular motions.', 'Rinse thoroughly.'],
      judge: 'The brand page recommends daily use for 3 months for best results. Results vary from person to person.',
      judgeShort: 'Daily use for about 3 months (brand page).',
      good: ['Patch test first: apply a little on your arm or elbow bend and leave it 12 to 24 hours.', 'Stop using it if you notice redness, itching or irritation.', 'The brand page does not recommend it for very dry skin.'],
      cautionShort: 'Patch test first. Not for very dry skin.',
      checkinDays: 14,
      swap: ['aha5']
    },
    aha5: {
      id: 'aha5', name: '5% AHA BHA Exfoliating Body Wash', short: 'Exfoliate, de-tan, brighten', size: '700 ml', price: 649,
      img: 'img/aha-bha-body-wash-5.jpg', tag: 'Body wash',
      forShort: 'An all-in-one wash that exfoliates, de-tans and hydrates body skin.',
      forList: ['Brand page: helps reduce tanning, dark patches and rough texture, and fights body acne and strawberry skin.', 'Has lactic, glycolic and salicylic acids with vitamin E and aloe vera. Made for the body, not the face.'],
      how: ['Take a generous amount in your palms or on a loofah.', 'Massage onto wet skin in a circular motion, then rinse thoroughly.', 'Apply sun protection afterwards.'],
      judge: 'The brand page says to use it regularly for 3 to 4 months to see a noticeable difference.',
      judgeShort: '3 to 4 months of regular use (brand page).',
      good: ['Patch test first: apply a little on your arm or elbow bend and leave it 12 to 24 hours.', 'Start with 2 to 3 uses a week, then increase if your skin is fine with it.', 'Use a broad-spectrum SPF 30+ in the day after exfoliating.'],
      cautionShort: 'Patch test. Start 2 to 3 times a week. Use SPF.',
      checkinDays: 14,
      swap: ['sa1']
    },
    roll: {
      id: 'roll', name: '6% AHA BHA Underarm Roll-on', short: 'Odour and underarm pigmentation', size: '75 ml', price: 499,
      img: 'img/underarm-roll-on.jpg', tag: 'Underarm care',
      forShort: 'Helps control underarm odour and reduce underarm pigmentation.',
      forList: ['Brand page: odour control and pigmentation care, with 4% lactic, 1% salicylic, 1% kojic and 1% mandelic acid.', 'Flora fragrance, 75 ml.'],
      how: ['Apply directly on clean underarm skin.', 'Roll evenly and let it dry completely before you dress.', 'Use daily for best results.', 'The brand page says to wait 6 to 12 hours after waxing.'],
      judge: 'The brand page says a change should be noticeable within about 3 months. Results vary.',
      judgeShort: 'A change within about 3 months (brand page).',
      good: ['Do not apply to broken or irritated skin.', 'Patch test first: apply a little on your arm or elbow bend and leave it 12 to 24 hours.', 'Stop using it if you notice redness, itching or irritation.'],
      cautionShort: 'Not on broken or irritated skin. Patch test.',
      checkinDays: 14,
      swap: []
    },
    gum: {
      id: 'gum', name: 'Biotin Hair Gummies', short: 'Biotin, zinc and vitamins', size: '30 gummies', price: 499,
      img: 'img/biotin-gummies.jpg', tag: 'Supplement',
      forShort: 'A vegetarian multivitamin gummy with biotin and zinc for hair strength.',
      forList: ['Brand page: supports hair strength and texture over the long term.', 'Has biotin, zinc and vitamins A, B, C, D, E and K. For women over 18.'],
      how: ['Take 1 gummy a day after any meal.', 'Chew it. No water needed.', 'Follow a 3-month routine.'],
      judge: 'The brand page says you will not see results in the first month. Gains in hair strength show around month 3.',
      judgeShort: 'Not in month 1; around month 3 (brand page).',
      good: ['It is a supplement, not a quick fix.', 'If you are nursing, ask your healthcare professional before taking it.', 'If you are unsure whether it suits you, ask a healthcare professional.'],
      cautionShort: 'If nursing, ask your doctor first.',
      checkinDays: 28,
      swap: []
    },
    serum: {
      id: 'serum', name: 'Advanced Hair Growth Serum Roll-on', short: '3% Rosemary, 3% Redensyl, 2% Aminexil, 2% Anagain', size: '25 ml', price: 569,
      img: 'img/hair-growth-serum.jpg', tag: 'Scalp care',
      forShort: 'A leave-in scalp serum for moderate hair fall and early thinning.',
      forList: ['Brand page: boosts new hair growth and reduces hair fall and thinning.', 'Water-based, non-greasy and fast-absorbing. For women over 18.'],
      how: ['Apply on the scalp only, not on the hair strands.', 'Massage the scalp for about 2 minutes. Late evening or night is ideal. The page says twice a day in its steps and once a day in its FAQ, so follow your pack.', 'Do not apply before washing your hair. It is a leave-in.'],
      judge: 'The brand page says you will not see results in one month. Use it for at least 3 months.',
      judgeShort: 'At least 3 months; not in month 1 (brand page).',
      good: ['Check with a doctor first if you have allergies.', 'It is a leave-in. You do not wash it off.', 'The brand page says there is no quick fix, so give it time.'],
      cautionShort: 'Scalp only. Check with a doctor if allergic.',
      checkinDays: 28,
      swap: []
    },
    lotion: {
      id: 'lotion', name: '10% Urea Body Lotion', short: 'Dry and flaky skin', size: '300 ml', price: 499,
      img: CDN + '10-urea-lotion-300ml/1%20%282%29_35woe0.jpg?tr=w-600', imgFallback: 'img/urea-lotion-10.jpg', tag: 'Body lotion',
      forShort: 'A lightweight, non-greasy lotion for mild to moderate dry skin.',
      forList: ['Brand page: hydrates, softens and exfoliates, with up to 48 hours of moisture.', 'Has 10% urea, mango and kokum butter, shea butter and a ceramide complex.'],
      how: ['Pump out a generous amount.', 'Massage an even layer all over the body until it is absorbed.', 'Use it morning and night.'],
      judge: 'The brand page says to use it regularly for 3 to 4 months to see a noticeable difference.',
      judgeShort: '3 to 4 months of regular use (brand page).',
      good: ['Patch test first: apply a little on your arm or elbow bend and leave it 12 to 24 hours.', 'Stop using it if you notice redness, itching or irritation.', 'Made for mild to moderate dry skin. The brand sells a stronger 20% urea lotion for very dry, flaky skin.'],
      cautionShort: 'Patch test. Stop if it itches or reddens.',
      checkinDays: 14,
      swap: []
    }
  };
  /* Display helpers: a friendly short name for chat, shop categories, whether the steps are a numbered sequence. */
  var EXTRA = {
    sa1:    { nick: '1% salicylic body wash', cats: ['body', 'acne'], ordered: true,  emoji: '🧴' },
    aha5:   { nick: '5% AHA BHA body wash',   cats: ['body'],         ordered: true,  emoji: '🧴' },
    roll:   { nick: 'underarm roll-on',       cats: ['body'],         ordered: false, emoji: '💧' },
    gum:    { nick: 'biotin hair gummies',    cats: ['hair'],         ordered: false, emoji: '🍬' },
    serum:  { nick: 'hair growth serum',      cats: ['hair'],         ordered: false, emoji: '💆' },
    lotion: { nick: '10% urea body lotion',   cats: ['body'],         ordered: false, emoji: '🧴' }
  };
  Object.keys(EXTRA).forEach(function (k) { Object.keys(EXTRA[k]).forEach(function (f) { PRODUCTS[k][f] = EXTRA[k][f]; }); });

  /* Hinglish (Roman Hindi mixed with English) wording for the WhatsApp chat. Same facts as the English text, polite "aap" form,
     everyday words people actually use ("massage", "patch test", "loofah"). */
  var HI = {
    sa1: {
      forShort: 'Pores ko saaf karke body acne se bachne mein madad karta hai aur dead skin cells ko exfoliate karta hai.',
      how: ['Hatheli ya loofah par zaroorat jitna wash lijiye.', 'Gili skin par halke haath se circular motion mein massage kijiye.', 'Achhe se dho lijiye.'],
      judge: 'Brand page ke hisaab se best results ke liye roz 3 mahine tak use kijiye. Results har kisi mein alag ho sakte hain.',
      good: ['Pehle patch test kijiye: haath ya kohni ke andar ki taraf thoda lagakar 12 se 24 ghante rehne dijiye.', 'Redness, khujli ya jalan ho to use band kar dijiye.', 'Brand page bahut dry skin ke liye ise suggest nahi karta.']
    },
    aha5: {
      forShort: 'Ek hi wash mein exfoliate, de-tan aur hydrate karta hai.',
      how: ['Hatheli ya loofah par thoda zyada wash lijiye.', 'Gili skin par circular motion mein massage kijiye, phir achhe se dho lijiye.', 'Uske baad sunscreen lagaiye.'],
      judge: 'Brand page ke hisaab se farak dikhne ke liye 3 se 4 mahine tak regular use kijiye.',
      good: ['Pehle patch test kijiye: haath ya kohni ke andar ki taraf thoda lagakar 12 se 24 ghante rehne dijiye.', 'Shuru mein hafte mein 2 se 3 baar use kijiye. Skin ko suit kare to badha sakte hain.', 'Exfoliate karne ke baad din mein SPF 30+ sunscreen lagaiye.']
    },
    roll: {
      forShort: 'Underarm ki smell control karne aur pigmentation kam karne mein madad karta hai.',
      how: ['Saaf underarm skin par seedha lagaiye.', 'Barabar roll kijiye aur kapde pehenne se pehle poori tarah sukhne dijiye.', 'Best results ke liye roz use kijiye.', 'Brand page ke hisaab se waxing ke 6 se 12 ghante baad hi lagaiye.'],
      judge: 'Brand page ke hisaab se lagbhag 3 mahine mein farak dikhna chahiye. Results alag ho sakte hain.',
      good: ['Kati-phati ya irritated skin par mat lagaiye.', 'Pehle patch test kijiye: haath ya kohni ke andar ki taraf thoda lagakar 12 se 24 ghante rehne dijiye.', 'Redness, khujli ya jalan ho to use band kar dijiye.']
    },
    gum: {
      forShort: 'Biotin aur zinc wali vegetarian multivitamin gummy, baalon ki strength ke liye.',
      how: ['Kisi bhi meal ke baad roz 1 gummy lijiye.', 'Ise chaba kar khaiye. Paani ki zaroorat nahi.', '3 mahine tak routine follow kijiye.'],
      judge: 'Brand page ke hisaab se pehle mahine mein results nahi dikhte. Baalon ki strength mein farak lagbhag teesre mahine tak dikhta hai.',
      good: ['Ye ek supplement hai, turant asar wali cheez nahi.', 'Agar aap nursing kar rahi hain, to lene se pehle healthcare professional se poochhiye.', 'Agar aapko pata nahi ki ye aapko suit karegi ya nahi, to healthcare professional se poochhiye.']
    },
    serum: {
      forShort: 'Leave-in scalp serum, moderate hair fall aur patle hote baalon ke liye.',
      how: ['Sirf scalp par lagaiye, baalon ki lambai par nahi.', 'Scalp par lagbhag 2 minute massage kijiye. Der shaam ya raat ka time sabse achha rehta hai. Page ke steps mein din mein 2 baar likha hai aur FAQ mein 1 baar, isliye apne pack ke hisaab se chaliye.', 'Baal dhone se pehle mat lagaiye. Ye leave-in hai.'],
      judge: 'Brand page ke hisaab se ek mahine mein results nahi dikhte. Kam se kam 3 mahine use kijiye.',
      good: ['Agar aapko allergy hai, to pehle doctor se poochhiye.', 'Ye leave-in hai, ise dhona nahi hota.', 'Brand page ke hisaab se isme time lagta hai, isliye sabr rakhiye.']
    },
    lotion: {
      forShort: 'Halki, non-greasy lotion, mild se moderate dry skin ke liye.',
      how: ['Pump se zaroorat jitna lotion lijiye.', 'Poori body par ek barabar layer massage kijiye, jab tak skin absorb na kar le.', 'Subah aur raat dono time lagaiye.'],
      judge: 'Brand page ke hisaab se farak dikhne ke liye 3 se 4 mahine tak regular use kijiye.',
      good: ['Pehle patch test kijiye: haath ya kohni ke andar ki taraf thoda lagakar 12 se 24 ghante rehne dijiye.', 'Redness, khujli ya jalan ho to use band kar dijiye.', 'Ye mild se moderate dry skin ke liye hai. Bahut dry aur flaky skin ke liye brand ka 20% urea lotion bhi aata hai.']
    }
  };
  Object.keys(HI).forEach(function (k) { PRODUCTS[k].hi = HI[k]; });
  /* Days the brand page points to before judging (about 3 months everywhere). */
  Object.keys(PRODUCTS).forEach(function (k) { PRODUCTS[k].trialDays = 90; });

  /* Quick look (shown on hover), from the official product pages only. */
  var QUICK = {
    sa1:    { who: 'People with body acne and bumps who want a daily exfoliating wash.', fit: ['Unclogs pores and exfoliates dead skin cells.', '1% salicylic acid. Sulphate and silicone free. 375 ml.'], check: 'Patch test first. Not advised for very dry skin.' },
    aha5:   { who: 'People with tan, dark patches or rough, bumpy skin on the body.', fit: ['Lactic, glycolic and salicylic acids to exfoliate, de-tan and hydrate.', '700 ml. For the body, not the face.'], check: 'Patch test. Start 2 to 3 times a week and use SPF.' },
    roll:   { who: 'People who want underarm odour control and lighter pigmentation.', fit: ['4% lactic, 1% salicylic, 1% kojic and 1% mandelic acid.', '75 ml, Flora fragrance. Daily use.'], check: 'Patch test. Not on broken or irritated skin.' },
    gum:    { who: 'Women over 18 who want daily support for hair strength.', fit: ['Biotin, zinc and vitamins. Chew 1 a day after a meal.', '30 gummies, vegetarian. Takes about 3 months.'], check: 'If you are nursing, ask your doctor first.' },
    serum:  { who: 'Women over 18 with moderate hair fall or early thinning.', fit: ['3% Rosemary, 3% Redensyl, 2% Aminexil, 2% Anagain.', 'Leave-in, water-based, non-greasy. 25 ml.'], check: 'Scalp only. No results in month 1; give it 3 months.' },
    lotion: { who: 'People with mild to moderate dry or flaky skin on the body.', fit: ['10% urea with butters and ceramides. Lightweight, non-greasy.', '300 ml. Use morning and night.'], check: 'Patch test first. Stop if it itches or turns red.' }
  };
  Object.keys(QUICK).forEach(function (k) { PRODUCTS[k].quick = QUICK[k]; });

  /* Expectation Receipt: what customers can say they hope for (labels max 24 characters), per product. */
  var EXPECT = {
    sa1:    [['acne', 'Fewer body breakouts', 'Body pimples kam ho'], ['smooth', 'Smoother skin', 'Skin zyada smooth'], ['dead', 'Less dull, dead skin', 'Dull skin kam ho']],
    aha5:   [['detan', 'De-tanning', 'De-tan ho'], ['bright', 'Brighter skin tone', 'Skin tone nikhre'], ['smooth', 'Smoother skin', 'Skin zyada smooth'], ['hydrate', 'Hydrated skin', 'Skin hydrated rahe']],
    roll:   [['odour', 'Less underarm odour', 'Underarm ki smell kam'], ['pigment', 'Lighter pigmentation', 'Pigmentation halka ho']],
    gum:    [['fall', 'Less hair fall', 'Hair fall kam ho'], ['strong', 'Stronger hair', 'Baal strong hon']],
    serum:  [['fall', 'Less hair fall', 'Hair fall kam ho'], ['thick', 'Thicker-looking hair', 'Baal ghane dikhen'], ['roots', 'Stronger roots', 'Roots strong hon']],
    lotion: [['dry', 'Less dry, flaky skin', 'Dry skin kam ho'], ['soft', 'Softer skin', 'Skin soft ho'], ['lasting', 'Moisture that lasts', 'Nami der tak rahe']]
  };
  Object.keys(EXPECT).forEach(function (k) {
    PRODUCTS[k].expect = EXPECT[k].map(function (o) { return { id: o[0], en: o[1], hi: o[2] }; }).concat([{ id: 'other', en: 'Something else', hi: 'Kuch aur' }]);
  });
  /* When the brand page says results show: [earliest, latest] in weeks, or null when it gives no clear starting point. */
  var STATED = {
    sa1:    { weeks: [12, 12], en: 'about 3 months', hi: 'lagbhag 3 mahine' },
    aha5:   { weeks: [12, 16], en: '3 to 4 months', hi: '3 se 4 mahine' },
    roll:   { weeks: null, en: 'within about 3 months', hi: 'lagbhag 3 mahine ke andar' },
    gum:    { weeks: [12, 12], en: 'about 3 months', hi: 'lagbhag 3 mahine' },
    serum:  { weeks: [12, 12], en: 'at least 3 months', hi: 'kam se kam 3 mahine' },
    lotion: { weeks: [12, 16], en: '3 to 4 months', hi: '3 se 4 mahine' }
  };
  Object.keys(STATED).forEach(function (k) { PRODUCTS[k].stated = STATED[k]; });
  /* "When do you expect to notice a change?" buckets. upper = the longest wait (in weeks) the person is willing to expect. */
  var TIMES = [
    { id: 'w2', en: 'Within 2 weeks', hi: '2 hafte ke andar', upper: 2 },
    { id: 'w4', en: '2 to 4 weeks', hi: '2 se 4 hafte ke beech', upper: 4 },
    { id: 'm3', en: '1 to 3 months', hi: '1 se 3 mahine ke beech', upper: 13 },
    { id: 'm3p', en: 'More than 3 months', hi: '3 mahine se zyada', upper: 999 },
    { id: 'unsure', en: 'Not sure', hi: 'Pata nahi', upper: null }
  ];
  /* Compare what the customer expects with what the brand page says. */
  function timeGap(pid, tid) {
    var st = PRODUCTS[pid] && PRODUCTS[pid].stated, t = TIMES.filter(function (x) { return x.id === tid; })[0];
    if (!t || t.upper === null) return 'unsure';
    if (!st || !st.weeks) return 'unknown';
    return t.upper < st.weeks[0] ? 'longer' : 'aligned'; // "longer": they expect results sooner than the pages suggest
  }
  var CATS = [['all', 'Shop all'], ['body', 'Body care'], ['hair', 'Hair care'], ['acne', 'Acne care']];
  var ORDER = ['sa1', 'aha5', 'roll', 'lotion', 'gum', 'serum'];
  return { PRODUCTS: PRODUCTS, ORDER: ORDER, CATS: CATS, TIMES: TIMES, timeGap: timeGap, NOT_STATED: NS };
});
