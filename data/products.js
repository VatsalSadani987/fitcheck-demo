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
  var CATS = [['all', 'Shop all'], ['body', 'Body care'], ['hair', 'Hair care'], ['acne', 'Acne care']];
  var ORDER = ['sa1', 'aha5', 'roll', 'gum', 'serum', 'spot'];
  return { PRODUCTS: PRODUCTS, ORDER: ORDER, CATS: CATS, NOT_STATED: NS };
});
