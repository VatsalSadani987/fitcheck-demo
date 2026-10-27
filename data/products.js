/* Product data for the FitCheck demo store.
   Every guide item comes from the pack photo or public listing pages (brand site, retailers).
   Anything the pages did not state is marked as not stated. Prices are DEMO prices. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FitProducts = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  var NS = 'Not stated on the pages we checked. Check your pack.';
  var PRODUCTS = {
    sa1: {
      id: 'sa1', name: '1% Salicylic Acid Body Wash', short: 'Body acne and bumps', size: '250 ml', price: 329,
      img: 'img/sa-body-wash-1.jpg', tag: 'Body wash',
      forShort: 'Helps prevent body acne and exfoliates dead skin cells.',
      forList: ['Pack: to prevent body acne and to exfoliate dead skin cells.', 'Listing: a cleansing body wash with 1% salicylic acid.'],
      how: ['Wet your skin.', 'Take some wash in your palm or on a loofah.', 'Massage gently in circles.', 'Rinse off.'],
      judge: 'The listing suggests regular use for up to about 3 months for best results. Results vary from person to person.',
      judgeShort: 'Regular use for up to about 3 months; results vary.',
      good: ['Do a patch test first if your skin is sensitive.', 'Meant for the body. Check your pack before using it on your face.', 'Moisturise afterwards if your skin feels dry.'],
      cautionShort: 'Patch test if your skin is sensitive. Body use.',
      checkinDays: 14,
      swap: ['aha5']
    },
    aha5: {
      id: 'aha5', name: '5% AHA BHA Exfoliating Body Wash', short: 'Exfoliate, de-tan, brighten', size: '700 ml', price: 699,
      img: 'img/aha-bha-body-wash-5.jpg', tag: 'Body wash',
      forShort: 'Exfoliates and hydrates; helps de-tan and brighten skin tone.',
      forList: ['Pack: to exfoliate and hydrate, and to de-tan and brighten skin tone.', 'Listing: lactic, glycolic and salicylic acids for exfoliation.'],
      how: ['On wet skin, take some wash in your palms or on a loofah.', 'Massage in a gentle, circular motion.', 'Rinse.'],
      judge: 'The pack and brand page point to best results in about 3 months.',
      judgeShort: 'Best results in about 3 months (pack and brand page).',
      good: ['The brand page asks you to patch test before adding it to your routine.', 'For external use only. Keep away from your eyes.', 'Store in a cool, dry place away from sunlight.'],
      cautionShort: 'Patch test first. External use only. Avoid eyes.',
      checkinDays: 14,
      swap: ['sa1']
    },
    roll: {
      id: 'roll', name: '6% AHA BHA Underarm Roll-on', short: 'Odour and underarm pigmentation', size: '75 ml', price: 499,
      img: 'img/underarm-roll-on.jpg', tag: 'Underarm care',
      forShort: 'Helps control body odour and reduce hyperpigmentation.',
      forList: ['Pack: to control body odour and reduce hyperpigmentation.'],
      how: ['Apply to your underarm skin.', 'Roll on evenly.', 'Let it dry completely before you dress.', 'Directions for this exact roll-on were not stated on the pages we checked. A sister roll-on listing says the same, so check your pack.'],
      judge: NS,
      judgeShort: 'Not stated. Check your pack.',
      good: ['Do not apply to broken or irritated skin.', 'A patch test is advisable.', 'For external use only. Not for medical use.'],
      cautionShort: 'Not on broken or irritated skin. Patch test.',
      checkinDays: 14,
      swap: []
    },
    gum: {
      id: 'gum', name: 'Hair Health Gummies', short: 'Biotin, multivitamins and zinc', size: '30 gummies', price: 499,
      img: 'img/biotin-gummies.jpg', tag: 'Supplement',
      forShort: 'A daily nutraceutical gummy to strengthen hair and control hair fall.',
      forList: ['Pack: with biotin, multivitamins and zinc, to strengthen hair and control hair fall.', 'Pack: no added sugar. Nutraceutical.'],
      how: ['Take 1 gummy a day, or as directed by your healthcare professional.', 'The listing says it can be taken in the morning or evening, after meals.', 'Do not exceed the recommended use.'],
      judge: NS,
      judgeShort: 'Not stated. Check your pack.',
      good: ['Not for medicinal use. It is not meant to diagnose, treat or cure any condition.', 'Store in a cool, dry place away from sunlight. Keep out of reach of children.', 'If you are unsure whether it suits you, ask a healthcare professional.'],
      cautionShort: 'Not for medicinal use. Do not exceed the dose.',
      checkinDays: 28,
      swap: []
    },
    serum: {
      id: 'serum', name: 'Hair Growth Serum Roll-on', short: '3% Rosemary, 3% Redensyl, 2% Aminexil, 2% Anagain', size: '25 ml', price: 569,
      img: 'img/hair-growth-serum.jpg', tag: 'Scalp care',
      forShort: 'A leave-in scalp serum for hair fall and thinning hair.',
      forList: ['Pack: with 3% Rosemary, 3% Redensyl, 2% Aminexil and 2% Anagain.', 'Listing: for hair fall, thinning hair and weak roots.'],
      how: ['Use on a clean, dry scalp.', 'Roll over the area several times until you reach the 1 ml mark on the label.', 'The listing suggests twice a day, with about 2 minutes of massage.'],
      judge: 'The listing says to use it consistently for at least 3 to 4 months to see visible differences.',
      judgeShort: 'At least 3 to 4 months of consistent use.',
      good: ['For external use only. Wash your hands if it touches them.', 'Oil can separate in high heat. Stir well before use, as the listing says.', 'Read the label before use.'],
      cautionShort: 'External use only. Read the label.',
      checkinDays: 28,
      swap: []
    },
    spot: {
      id: 'spot', name: '2% Salicylic Acid Gel', short: 'Help manage acne', size: '30 g', price: 299,
      img: 'img/spot-corrector-2.jpg', tag: 'Acne spot gel',
      forShort: 'Helps manage acne and reduce acne inflammation.',
      forList: ['Pack: to help manage acne and reduce acne inflammation.', 'Listing: 2% salicylic acid, with 1% glycolic acid and 4% niacinamide.'],
      how: ['Step-by-step directions, amount and how often were not stated on the pages we checked.', 'The listing says it can be used by day or night and leaves no residue.', 'Check the label on your pack for how to apply it.'],
      judge: 'The listing claims pimples can look better within days and acne within about a week, with marks fading in about 2 months. These are the maker’s claims and results vary.',
      judgeShort: 'Listing claims: days to a week for pimples, about 2 months for marks.',
      good: ['The listing says it suits normal, combination and oily skin, and suggests a lower strength for dry or sensitive skin.', 'Read the label and directions before use.', 'The price shown here is a demo price.'],
      cautionShort: 'Lower strength may suit dry or sensitive skin.',
      checkinDays: 7,
      swap: []
    }
  };
  /* Display helpers: a friendly short name for chat, shop categories, whether the steps are a numbered sequence. */
  var EXTRA = {
    sa1:   { nick: '1% salicylic body wash', cats: ['body', 'acne'], ordered: true,  emoji: '🧴' },
    aha5:  { nick: '5% AHA BHA body wash',   cats: ['body'],         ordered: true,  emoji: '🧴' },
    roll:  { nick: 'underarm roll-on',       cats: ['body'],         ordered: false, emoji: '💧' },
    gum:   { nick: 'hair health gummies',    cats: ['hair'],         ordered: false, emoji: '🍬' },
    serum: { nick: 'hair growth serum',      cats: ['hair'],         ordered: false, emoji: '💆' },
    spot:  { nick: '2% salicylic gel',       cats: ['acne'],         ordered: false, emoji: '🧪' }
  };
  Object.keys(EXTRA).forEach(function (k) { Object.keys(EXTRA[k]).forEach(function (f) { PRODUCTS[k][f] = EXTRA[k][f]; }); });

  /* Hinglish (Roman script) versions of the guide text, used by the chat only. Gender-neutral wording on purpose.
     Meaning is kept identical to the English text above. Please have a Hindi reader check every line before sharing. */
  var NS_HI = 'Humne jo pages dekhe, unme yeh nahi likha. Apna pack check karein.';
  var HI = {
    sa1: {
      nick: '1% salicylic body wash',
      forShort: 'Body acne se bachane mein madad karta hai aur dead skin cells ko exfoliate karta hai.',
      how: ['Skin ko geela karein.', 'Thoda wash hatheli ya loofah par lein.', 'Gol-gol ghumate hue halke haath se massage karein.', 'Dho lein.'],
      judge: 'Listing ke mutabik best results ke liye lagbhag 3 mahine tak regular use karein. Results har insaan mein alag hote hain.',
      good: ['Skin sensitive ho to pehle patch test karein.', 'Yeh body ke liye hai. Face par lagane se pehle apna pack check karein.', 'Skin dry lage to baad mein moisturiser lagayein.']
    },
    aha5: {
      nick: '5% AHA BHA body wash',
      forShort: 'Exfoliate aur hydrate karta hai; tan hatane aur skin tone brighten karne mein madad karta hai.',
      how: ['Geeli skin par thoda wash hatheli ya loofah par lein.', 'Gol-gol ghumate hue halke haath se massage karein.', 'Dho lein.'],
      judge: 'Pack aur brand page ke mutabik best results lagbhag 3 mahine mein dikhte hain.',
      good: ['Brand page routine mein shamil karne se pehle patch test karne ko kehta hai.', 'Sirf bahari use ke liye. Aankhon se door rakhein.', 'Thandi, sookhi jagah par, dhoop se door rakhein.']
    },
    roll: {
      nick: 'underarm roll-on',
      forShort: 'Body odour control karne aur hyperpigmentation kam karne mein madad karta hai.',
      how: ['Underarm ki skin par lagayein.', 'Barabar roll karein.', 'Kapde pehenne se pehle poori tarah sookhne dein.', 'Is exact roll-on ki directions humne dekhe hue pages par nahi payi. Milte-julte roll-on ki listing yahi kehti hai, isliye apna pack zaroor check karein.'],
      judge: NS_HI,
      good: ['Kati-phati ya irritated skin par na lagayein.', 'Patch test karna sahi rahega.', 'Sirf bahari use ke liye. Medical use ke liye nahi.']
    },
    gum: {
      nick: 'hair health gummies',
      forShort: 'Roz ka ek nutraceutical gummy jo baalon ko majboot karne aur hair fall control karne mein madad karta hai.',
      how: ['Roz 1 gummy lein, ya apne healthcare professional ke batane ke mutabik.', 'Listing ke mutabik ise subah ya shaam, khane ke baad le sakte hain.', 'Recommended matra se zyada na lein.'],
      judge: NS_HI,
      good: ['Yeh medicinal use ke liye nahi hai. Yeh kisi condition ko diagnose, treat ya cure karne ke liye nahi hai.', 'Thandi, sookhi jagah par, dhoop se door aur bachchon ki pahunch se bahar rakhein.', 'Pata na ho ki yeh aapke liye theek hai ya nahi, to healthcare professional se poochhein.']
    },
    serum: {
      nick: 'hair growth serum',
      forShort: 'Leave-in scalp serum, hair fall aur patle hote baalon ke liye.',
      how: ['Saaf, sookhi scalp par use karein.', 'Label par 1 ml ke nishaan tak pahunchne tak scalp par kai baar roll karein.', 'Listing din mein do baar, lagbhag 2 minute massage ke saath, suggest karti hai.'],
      judge: 'Listing kehti hai ki visible farak dekhne ke liye kam se kam 3 se 4 mahine lagataar use karein.',
      good: ['Sirf bahari use ke liye. Haath par lage to haath dho lein.', 'Zyada garmi mein tel alag ho sakta hai. Listing ke mutabik use se pehle achhe se hila lein.', 'Use se pehle label zaroor padhein.']
    },
    spot: {
      nick: '2% salicylic gel',
      forShort: 'Acne manage karne aur acne ki inflammation kam karne mein madad karta hai.',
      how: ['Step-by-step directions, matra aur kitni baar lagana hai, yeh humne dekhe hue pages par nahi payi.', 'Listing ke mutabik ise din ya raat mein use kar sakte hain aur yeh koi residue nahi chhodta.', 'Kaise lagana hai, iske liye apne pack ka label dekhein.'],
      judge: 'Listing ka dava hai ki pimples kuch din mein aur acne lagbhag ek hafte mein behtar dikh sakte hain, aur nishaan lagbhag 2 mahine mein halke padte hain. Yeh banane wale ke dave hain aur results alag ho sakte hain.',
      good: ['Listing ke mutabik yeh normal, combination aur oily skin ko suit karta hai, aur dry ya sensitive skin ke liye kam strength suggest karti hai.', 'Use se pehle label aur directions padhein.', 'Yahan dikhayi gayi price demo price hai.']
    }
  };
  Object.keys(HI).forEach(function (k) { PRODUCTS[k].hi = HI[k]; });
  /* Days the pack or listing points to before judging. Only set where a page actually says so; otherwise no progress bar is shown. */
  var TRIAL = { sa1: 90, aha5: 90, serum: 90 };
  Object.keys(TRIAL).forEach(function (k) { PRODUCTS[k].trialDays = TRIAL[k]; });

  /* Hinglish (Roman Hindi mixed with English) wording for the WhatsApp chat. Same facts as the English guide, simple words. */
  var HI = {
    sa1: {
      forShort: 'Body acne se bachne mein madad karta hai aur dead skin cells ko exfoliate karta hai.',
      how: ['Skin ko geela kijiye.', 'Hatheli ya loofah par thoda wash lijiye.', 'Gol gol ghumate hue halke haath se malish kijiye.', 'Paani se dho lijiye.'],
      judge: 'Listing ke hisaab se best results ke liye lagbhag 3 mahine tak regular use karna chahiye. Results har insaan mein alag ho sakte hain.',
      good: ['Agar skin sensitive hai to pehle patch test kijiye.', 'Ye body ke liye hai. Chehre par lagane se pehle apna pack check kijiye.', 'Skin dry lage to baad mein moisturiser lagaiye.']
    },
    aha5: {
      forShort: 'Exfoliate aur hydrate karta hai; de-tan karne aur skin tone brighten karne mein madad karta hai.',
      how: ['Geeli skin par hatheli ya loofah mein thoda wash lijiye.', 'Halke haath se gol gol malish kijiye.', 'Paani se dho lijiye.'],
      judge: 'Pack aur brand page ke hisaab se best results lagbhag 3 mahine mein dikhte hain.',
      good: ['Brand page kehta hai ki routine mein jodne se pehle patch test kijiye.', 'Sirf bahari use ke liye. Aankhon se door rakhein.', 'Thandi, sukhi jagah par, dhoop se door rakhein.']
    },
    roll: {
      forShort: 'Body odour control karne aur hyperpigmentation kam karne mein madad karta hai.',
      how: ['Underarm ki skin par lagaiye.', 'Barabar roll kijiye.', 'Kapde pehnne se pehle poori tarah sukhne dijiye.', 'Is roll-on ki exact directions humne dekhe hue pages par nahi payi. Milta-julta roll-on listing yahi kehti hai, to apna pack check kijiye.'],
      judge: 'Humne jo pages dekhe unmein ye nahi likha. Apna pack check kijiye.',
      good: ['Tooti hui ya irritated skin par na lagayein.', 'Patch test karna accha rahega.', 'Sirf bahari use ke liye. Medical use ke liye nahi.']
    },
    gum: {
      forShort: 'Roz ki nutraceutical gummy jo baalon ko strong karne aur hair fall control karne mein madad karti hai.',
      how: ['Roz 1 gummy lijiye, ya apne healthcare professional ke kehne ke hisaab se.', 'Listing ke hisaab se ise subah ya shaam, khane ke baad le sakte hain.', 'Recommended matra se zyada na lein.'],
      judge: 'Humne jo pages dekhe unmein ye nahi likha. Apna pack check kijiye.',
      good: ['Medicinal use ke liye nahi hai. Ye kisi bimari ko diagnose, treat ya cure karne ke liye nahi hai.', 'Thandi, sukhi jagah par, dhoop se door aur bachchon ki pahunch se door rakhein.', 'Pata na ho ki ye aapke liye theek hai ya nahi, to healthcare professional se poochiye.']
    },
    serum: {
      forShort: 'Leave-in scalp serum jo hair fall aur patle hote baalon ke liye hai.',
      how: ['Saaf, sukhi scalp par use kijiye.', 'Label par 1 ml ke nishan tak pahunchne tak scalp par kai baar roll kijiye.', 'Listing din mein do baar aur lagbhag 2 minute massage karne ko kehti hai.'],
      judge: 'Listing kehti hai ki fark dikhne ke liye kam se kam 3 se 4 mahine lagataar use kijiye.',
      good: ['Sirf bahari use ke liye. Haath mein lag jaye to haath dho lijiye.', 'Zyada garmi mein oil alag ho sakta hai. Listing ke hisaab se use se pehle achhe se hila lijiye.', 'Use karne se pehle label padh lijiye.']
    },
    spot: {
      forShort: 'Acne manage karne aur acne ki inflammation kam karne mein madad karta hai.',
      how: ['Step-by-step directions, kitna lagana hai aur kitni baar, ye humne dekhe hue pages par nahi payi.', 'Listing kehti hai ki ise din ya raat mein use kar sakte hain aur ye residue nahi chhodta.', 'Kaise lagana hai, iske liye apne pack ka label dekhiye.'],
      judge: 'Listing ka dawa hai ki pimples kuch dinon mein aur acne lagbhag ek hafte mein behtar dikh sakta hai, aur daag lagbhag 2 mahine mein halke hote hain. Ye banane wale ke dawe hain aur results alag ho sakte hain.',
      good: ['Listing ke hisaab se ye normal, combination aur oily skin ke liye theek hai; dry ya sensitive skin ke liye kam strength suggest karti hai.', 'Use karne se pehle label aur directions padh lijiye.', 'Yahan dikhayi gayi price demo price hai.']
    }
  };
  Object.keys(HI).forEach(function (k) { PRODUCTS[k].hi = HI[k]; });
  var CATS = [['all', 'Shop all'], ['body', 'Body care'], ['hair', 'Hair care'], ['acne', 'Acne care']];
  var ORDER = ['sa1', 'aha5', 'roll', 'gum', 'serum', 'spot'];
  return { PRODUCTS: PRODUCTS, ORDER: ORDER, CATS: CATS, NOT_STATED: NS };
});
