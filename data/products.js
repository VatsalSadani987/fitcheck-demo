/* Product data for the FitCheck demo store.
   Every detail below was checked against the official Be Bodywise product pages (bebodywise.com) on 28 Oct 2026.
   Prices are the brand's listed selling prices on that day (the website shows different prices on different pages for some items) and are shown as DEMO prices. Anything a page does not say is not claimed here. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FitProducts = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  var NS = 'Not stated on the pages we checked. Check your pack.';
  /* Product photos are stored locally in img/. */
  var CDN = 'https://i.mscwlns.co/media/misc/pdp_rcl/';
  var PRODUCTS = {
    sa1: {
      id: 'sa1', name: '1% Salicylic Acid Body Wash', short: 'Body acne and bumps', size: '375 ml', price: 399,
      img: 'img/sa-body-wash-1.jpg', tag: 'Body wash',
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
      how: ['Apply directly on clean underarm skin.', 'Roll evenly and let it dry completely before you dress.', 'Use daily for best results.', 'Wait 6 to 12 hours after waxing.'],
      judge: 'The brand page says a change should be noticeable about 3 months. Results vary.',
      judgeShort: 'A change about 3 months (brand page).',
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
      how: ['Apply on the scalp only, not on the hair strands.', 'Massage the scalp for about 2 minutes. Late evening or night is ideal. Twice a day is usual, but follow the directions on your pack.', 'Do not apply before washing your hair. It is a leave-in.'],
      judge: 'The brand page says you will not see results in one month. Use it for at least 3 months.',
      judgeShort: 'At least 3 months; not in month 1 (brand page).',
      good: ['Check with a doctor first if you have allergies.', 'It is a leave-in. You do not wash it off.', 'The brand page says there is no quick fix, so give it time.'],
      cautionShort: 'Scalp only. Check with a doctor if allergic.',
      checkinDays: 28,
      swap: []
    },
    lotion: {
      id: 'lotion', name: '10% Urea Body Lotion', short: 'Dry and flaky skin', size: '300 ml', price: 499,
      img: 'img/urea-lotion-10.jpg', tag: 'Body lotion',
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
    roll:   { weeks: null, en: 'about 3 months', hi: 'lagbhag 3 mahine' },
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
  /* Swap reasons: other products in this store, plus options listed on the official Be.Bodywise site (checked 31 Oct 2026).
     Official-site options are not sold in this demo store. They carry a link, the listed price, and a "when" list of check-in reasons. */
  var DAY = 'Listed on bebodywise.com on 31 Oct 2026. Prices and stock can change.';
  var SWAPWHY = {
    sa1: { aha5: { en: 'Pick this if you want exfoliation plus de-tanning and brightening, not only acne care. It has three acids (lactic, glycolic and salicylic), so patch test first.', hi: 'Ye tab chuniye jab aapko sirf acne care nahi, exfoliation, de-tan aur brightening bhi chahiye. Isme teen acid hain (lactic, glycolic aur salicylic), isliye pehle patch test kijiye.' } },
    aha5: { sa1: { en: 'Pick this if you mainly want acne care, or want something simpler: one active (1% salicylic acid), free of sulphates and silicones.', hi: 'Ye tab chuniye jab aapko mainly acne care chahiye, ya kuch simple chahiye: ek hi active (1% salicylic acid), sulphate aur silicone free.' } }
  };
  var SWAPEXT = {
    sa1: [
      { when: ['feel', 'results'], name: '1% Salicylic Ceramide Body Wash', size: '250 ml', price: '₹549', url: 'https://bebodywise.com/product/salicylic-ceramide-bodywash',
        en: 'Same 1% salicylic acid, with a ceramide complex and chamomile. It moisturises, strengthens the skin barrier and suits body acne with dry skin.',
        hi: 'Wahi 1% salicylic acid, saath mein ceramide complex aur chamomile. Page ke hisaab se ye skin barrier ko majboot karta hai aur dry skin ke saath body acne ke liye hai.' },
      { when: ['feel'], name: 'Triple Milk Deep Hydrating Body Wash', size: '250 ml', price: '₹499', url: 'https://bebodywise.com/product/triple-milk-deep-hydrating-bodywash-xp',
        en: 'A gentler, hydrating wash with shea, coconut and oat milk. It is for dry, dehydrated skin and is not an acne treatment.',
        hi: 'Ek halka, hydrating wash jisme shea, coconut aur oat milk hai. Ye dry, dehydrated skin ke liye hai, acne ka treatment nahi.' }
    ],
    aha5: [
      { when: ['feel', 'results'], name: '1% Salicylic Ceramide Body Wash', size: '250 ml', price: '₹549', url: 'https://bebodywise.com/product/salicylic-ceramide-bodywash',
        en: 'One exfoliating acid (1% salicylic) with a ceramide complex and chamomile. A simpler formula if three acids felt like too much.',
        hi: 'Ek hi exfoliating acid (1% salicylic) ceramide complex aur chamomile ke saath. Agar teen acid zyada lage to ye simple formula hai.' },
      { when: ['feel'], name: 'Triple Milk Deep Hydrating Body Wash', size: '250 ml', price: '₹499', url: 'https://bebodywise.com/product/triple-milk-deep-hydrating-bodywash-xp',
        en: 'If your skin felt dry after the AHA BHA wash: a hydrating wash for dry skin, with shea, coconut and oat milk. It will not de-tan.',
        hi: 'Agar AHA BHA wash ke baad skin dry lagi: dry skin ke liye hydrating wash, shea, coconut aur oat milk ke saath. Ye de-tan nahi karega.' }
    ],
    roll: [
      { when: ['smell'], name: '4% AHA BHA Underarm Roll On, Fragrance Free', size: '75 ml', price: '₹374', url: 'https://bebodywise.com/product/4-aha-bha-underarm-rollon-frag-free-75',
        en: 'Sold as the fragrance-free version, with lower acid strength (4%). For mild pigmentation. Its ingredient list still shows "Perfume", so check the pack if you avoid scent.',
        hi: 'Fragrance-free version ke roop mein listed hai, aur acid kam hai (4%). Mild pigmentation ke liye. Iski ingredient list mein "Perfume" likha hai, isliye scent se bachna ho to pack check kijiye.' },
      { when: ['smell'], name: '6% AHA BHA Underarm Roll On, Aqua', size: '75 ml', price: '₹499', url: 'https://bebodywise.com/product/6-aha-bha-underarm-roll-on-aqua-75ml',
        en: 'The same 6% roll-on in a different fragrance (Aqua instead of Flora).',
        hi: 'Wahi 6% roll-on, alag fragrance mein (Flora ki jagah Aqua).' },
      { when: ['feel', 'results'], name: '4% AHA BHA Underarm Roll On', size: '75 ml', price: 'see site', url: 'https://bebodywise.com/product/4-aha-bha-underarm-rollon-75',
        en: 'A lower-strength option (4%), listed for mild pigmentation. Not for severe pigmentation.',
        hi: 'Kam strength ka option (4%), mild pigmentation ke liye listed. Severe pigmentation ke liye nahi.' }
    ],
    lotion: [
      { when: ['results'], name: '20% Urea Lotion', size: '300 ml', price: '₹569', url: 'https://bebodywise.com/product/20-urea-lotion-xp',
        en: 'A stronger urea lotion for dry to very dry, flaky skin. Try it if the 10% was not enough, and patch test first.',
        hi: 'Dry se bahut dry, flaky skin ke liye zyada urea wala lotion. Agar 10% kaafi nahi laga to try kijiye, pehle patch test ke saath.' }
    ]
  };
  Object.keys(SWAPWHY).forEach(function (k) { PRODUCTS[k].swapWhy = SWAPWHY[k]; });
  Object.keys(SWAPEXT).forEach(function (k) { PRODUCTS[k].swapExt = SWAPEXT[k]; });

  /* Fit details from the official product pages (bebodywise.com, read 31 Oct 2026). Wording is shortened. Anything the page did not say is left out or marked.
     reviews: short excerpts of customer reviews shown on the page (first name and initial as shown there). Gemini summarises these; it is never given anything else. */
  var DETAIL = {
    sa1: {
      url: 'https://bebodywise.com/product/1-salicylic-acid-body-wash-375ml-xp',
      key: [['Salicylic acid', 'A BHA that gently exfoliates and unclogs pores.'], ['Chamomile extract', 'Soothes inflamed skin.'], ['Pentavitin', 'Gives instant hydration.']],
      full: null, free: 'Free of sulphates and silicones (brand page).',
      skin: 'Made for mild body acne and mild strawberry skin. The FAQ says all skin types can use it. Sensitive skin: patch test first.',
      scent: 'Not stated on the page.', avoid: 'Not recommended for very dry skin (brand page).',
      goodFit: ['You have mild body acne or bumpy, strawberry-like skin.', 'You want one simple daily wash.'],
      think: ['Your skin is very dry.', 'You also want de-tanning (see the 5% AHA BHA wash).'],
      rating: { avg: 4.8, count: 2234, sold: '311K' },
      reviewNote: 'Both reviews shown on the page describe a body care routine or kit, not this wash alone.',
      reviews: [{ n: 'Rina', t: 'I see reduction of my back and arm acne and my skin feels smoother now. (Used as part of a routine.)' }, { n: 'Krina S.', t: 'Their body wash and lotion together have healed my skin.' }]
    },
    aha5: {
      url: 'https://bebodywise.com/product/5-aha-bha-bodywash-700ml',
      key: [['Salicylic acid', 'Unclogs pores.'], ['Lactic acid', 'Evens skin tone.'], ['Glycolic acid', 'Exfoliates rough skin.'], ['Vitamin E (tocopheryl acetate)', 'Deeply hydrates.']],
      full: 'Aqua, Coco-Glucoside, Cocamidopropyl Betaine, Triethanolamine, Lactic Acid, 1,2-Propandiol, Glycerin, Glycolic Acid, Acrylates/C10-30 Alkyl Acrylate Crosspolymer, Aloe Barbadensis (Aloevera) Leaf Extract, Perfume, Polysorbate 20, Salicylic Acid, Phenoxyethanol (and) Ethylhexylglycerin, Erythritol, Natural Perlite Beads, Encapsulated Blue Beads, Disodium EDTA, Tocopheryl Acetate, CI 42090',
      free: null,
      skin: 'The page lists normal, dry, oily, combination and sensitive skin. Patch test first.',
      scent: 'Perfume is in the ingredient list. Sold in two scents: Aqua and Flora.', avoid: 'Made for the body. The FAQ says it may be too potent for the face.',
      goodFit: ['You want de-tanning, smoother texture and brighter-looking skin.', 'You are fine starting slowly: 2 to 3 uses a week.'],
      think: ['You want the simplest formula (it has three acids).', 'You will not use sun protection after exfoliating.'],
      rating: { avg: 4.7, count: 491, sold: '75K' },
      reviews: [{ n: 'Aditi S.', t: 'Used it for 2 months and my tan has faded and skin feels smoother.' }, { n: 'Riya M.', t: 'It has really helped with my strawberry skin after using consistently. Gentle and non-drying.' }, { n: 'Ishita J.', t: 'After a month of regular use, the tiny dark dots on my upper arms are much lighter.' }, { n: 'Neha V.', t: 'Safe to use everyday and gives results.' }]
    },
    roll: {
      url: 'https://bebodywise.com/product/6-aha-bha-underarm-roll-on-flora-75ml',
      key: [['4% lactic acid', 'Increases cell turnover to help skin texture.'], ['1% salicylic acid', 'Helps block sweat-causing bacteria.'], ['1% kojic acid', 'An antioxidant said to help reduce dark spots.'], ['1% mandelic acid', 'A micro-exfoliant said to fade surface pigmentation.'], ['Alpha arbutin and mulberry extract', 'Named as pigmentation-reducing actives.']],
      full: 'Aqua, Lactic Acid, Propylene Glycol, Butyrospermum Parkii (Shea) Butter, Glycerin, Perfume, Aqua (and) Sodium Benzoate (and) Potassium Sorbate, Kojic Acid, Mandelic Acid, Salicylic Acid, Silica, Alpha Arbutin, Morus Alba (Mulberry) Extract, PEG-40 Hydrogenated Castor Oil, Tocopheryl Acetate, Acacia Senegal Gum (and) Xanthan Gum, Polysorbate 20, Xanthan Gum, Sodium Lactate',
      free: 'Free of parabens, aluminium-based antiperspirant agents, silicones, sulfates and phthalates (brand page).',
      skin: 'The page lists normal, dry, oily, combination and sensitive skin. Patch test first.',
      scent: 'Flora fragrance. Also sold in Aqua, and a 4% version listed as fragrance-free.', avoid: 'Do not apply on broken or irritated skin. Wait 6 to 12 hours after waxing.',
      goodFit: ['You want odour control and lighter underarms in one step.', 'You can use it daily and give it about 3 months.'],
      think: ['You are sensitive to fragrance (this one is Flora scented).', 'Your skin is broken or irritated right now.'],
      rating: { avg: 4.8, count: 535, sold: '180K' },
      reviews: [{ n: 'Niyoshi S.', t: 'It keeps me odor-free and has significantly reduced underarm pigmentation.' }, { n: 'Ruta T.', t: 'Long-lasting and effective, with an amazing, refreshing fragrance.' }, { n: 'Prachi D.', t: 'Does not leave any stain on my clothes, and my body odour is gone.' }, { n: 'Priya R.', t: 'Lasts all day. Even after the gym I am still odour-free.' }]
    },
    gum: {
      url: 'https://bebodywise.com/product/biotin-hair-gummies-120',
      key: [['Biotin', 'The page says it helps hair growth.'], ['Zinc', 'The page says it is important for hair tissue growth and repair.'], ['Vitamins B12, B9, B6, D2, A, C and E', 'Multivitamin support.']],
      full: 'Chicory Root Extract, Pectin (E440), Acidity Regulator (E330), Beta-Sitosterol, Vitamin H (Biotin), Vitamin B6 (Pyridoxine HCl), Ferrous Fumarate, Grape Seed Extract, Vitamin B12 (Cyanocobalamin), Vitamin B9 (Folic acid), Vitamin D2 (Ergocalciferol), Zinc Citrate Dihydrate, Sesbania Extract, Vitamin A (Retinol Palmitate), Vitamin C (Ascorbic Acid), Vitamin E (Tocopherol Acetate), Strawberry Color, Strawberry Flavor, Guar Gum, Maize Starch',
      free: 'Page says free of gelatin and animal-derived ingredients.',
      skin: 'A supplement, so skin type does not apply. For women over 18.',
      scent: 'Strawberry flavour.', avoid: 'If you are nursing, ask a healthcare professional before use.',
      goodFit: ['You want a daily, vegetarian hair supplement.', 'You can stay consistent for about 3 months.'],
      think: ['You want a quick fix (the page says not in month 1).', 'You are nursing: ask a healthcare professional first.'],
      rating: { avg: 4.5, count: 332, sold: '71K' },
      reviewNote: 'Reviews are from the 120-gummy page. The ingredients are the same as the 30-gummy pack.',
      reviews: [{ n: 'Niharika S.', t: 'Have used this for more than 3 months now and my hair health has totally improved.' }, { n: 'Harini S.', t: 'Saw noticeable results within 3 months and plans to keep using it.' }, { n: 'Amrita S.', t: 'Within 2 months my hair fall reduced significantly.' }]
    },
    serum: {
      url: 'https://bebodywise.com/product/hair-growth-pack-30ml-xp',
      key: [['3% Rosemary', 'Aims to improve scalp circulation.'], ['3% Redensyl', 'Plant-derived; aims to reactivate dormant follicles.'], ['2% Aminexil', 'Aims to strengthen the structure around follicles.'], ['2% Anagain', 'Aims to trigger hair growth factors.']],
      full: null, free: 'Free of parabens, sulfates, phthalates and petroleum (brand page, combo pack).',
      skin: 'For the scalp. Women over 18.',
      scent: 'Not stated on the page.', avoid: 'Check with a doctor first if you have allergies. Scalp only.',
      goodFit: ['You have moderate hair fall or early thinning.', 'You can apply it regularly and wait at least 3 months.'],
      think: ['You want results in a month (the page says not in month 1).', 'You have allergies: check with a doctor first.'],
      rating: { avg: 4.7, count: 144, sold: '102K' },
      reviewNote: 'These are reviews of the serum and gummies combo pack, so they are not for the serum alone.',
      reviews: [{ n: 'Supriya D.', t: 'I am very impressed with the results.' }, { n: 'Aditi S.', t: 'Thinner hair with improved volume and reduced fall after 3 months.' }, { n: 'Simran A.', t: 'Reduced hair fall and new growth after 3 months.' }]
    },
    lotion: {
      url: 'https://bebodywise.com/product/10-urea-lotion-300ml',
      key: [['10% urea', 'Hydrates, exfoliates and softens; supports the skin barrier.'], ['3% mango seed butter', 'Nourishing; rich in antioxidants and vitamins A and E.'], ['3% kokum seed butter', 'Hydrates without feeling greasy.'], ['Ceramide complex', 'Part of the formula (listed on the page).']],
      full: 'Aqua, Urea, Glycerin, Butyrospermum Parkii (Shea) Butter, Ceteareth-20 (and) Cetostearyl Alcohol, Garcinia Indica (Kokum) Seed Butter, Mangifera Indica (Mango) Seed Butter, Butylene Glycol, Cetyl Alcohol, Cyclopentasiloxane, Dimethicone, Phenoxyethanol (and) Ethylhexylglycerin, Perfume, Tocopheryl Acetate, Stearic Acid, Zinc Oxide, Butylated Hydroxytoluene, Disodium EDTA, Imidazolidinyl Urea, Polyacrylate-13 and Polyisobutene and Polysorbate-20, Ceramide complex (Ceramide NP, AP, EOP, Phytosphingosine, Cholesterol and others)',
      free: 'Free of alcohol and parabens (brand page). Has silicones (dimethicone).',
      skin: 'Listed for mild to moderate dry skin.',
      scent: 'Perfume is in the ingredient list.', avoid: 'Patch test first. Stop if redness or irritation occurs.',
      goodFit: ['Your skin is mildly to moderately dry.', 'You want a light, non-greasy lotion with up to 48 hours of moisture.'],
      think: ['Your skin is very dry and flaky (the brand lists a 20% urea lotion).', 'You avoid fragrance or silicones.'],
      rating: { avg: 4.7, count: 1112, sold: '93K' },
      reviews: [{ n: 'Niyati J.', t: 'Repaired my dry and damaged skin.' }, { n: 'Ruta T.', t: 'Only soft skin. No dry marks after 15 hours.' }, { n: 'Prachi D.', t: 'My dry skin loves it. Deep nourishment and long-lasting moisture.' }, { n: 'Smita S.', t: 'So good. So soft and supple.' }]
    }
  };
  Object.keys(DETAIL).forEach(function (k) { PRODUCTS[k].detail = DETAIL[k]; });

  return { PRODUCTS: PRODUCTS, ORDER: ORDER, CATS: CATS, TIMES: TIMES, timeGap: timeGap, NOT_STATED: NS };
});
