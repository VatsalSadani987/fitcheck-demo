# FitCheck (independent concept)

A demo store plus a WhatsApp check-in that helps a customer give a new product a fair trial.
Built for the Mosaic Wellness Fellowship Builder Challenge. Not affiliated with Be.Bodywise or Mosaic Wellness.

## What is inside
- `index.html`, `css/`, `js/`: the demo store (browse, product guide, cart, checkout, browser chat, team view).
- `data/products.js`: product guides, taken from the pack photos and public listing pages. Gaps are marked "not stated".
- `lib/engine.js`: one conversation engine used by both the browser chat and WhatsApp.
- `api/whatsapp.js`: the WhatsApp webhook (Kapso). `api/event.js`, `api/stats.js`: anonymous counts for the team view.
- No phone numbers are stored. State is keyed by a salted hash and expires after 2 hours.

## Settings (Vercel > Settings > Environment Variables)
See `.env.example`. Real values are never committed to the code.
