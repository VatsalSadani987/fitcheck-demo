# Be.Bodywise sample idea: FitCheck

A sample idea by Vatsal Sadani (St. Xavier's College (Autonomous), Kolkata) for the Mosaic Wellness Fellowship Builder Challenge.

- `index.html`, `css/`, `js/`: the demo store, FitCheck page, browser chat and Insights dashboard (no build step).
- `data/products.js`: product guide data (from pack photos and public pages; gaps are marked "not stated").
- `lib/engine.js`: the conversation engine. The same code runs in the browser and on WhatsApp.
- `api/whatsapp.js`: Kapso webhook that replies on WhatsApp. `api/event.js`, `api/stats.js`: anonymous events and live counts.
- `api/summary.js`: optional AI summary (Gemini). `api/reset.js`: clears test data (needs ADMIN_KEY).
- `lib/store.js`: Upstash Redis storage (anonymous counters, redacted notes, short-lived chat state).

Setup: see `.env.example`. Deploy on Vercel, connect an Upstash Redis database, add the Kapso webhook
`https://<your-site>/api/whatsapp` for the event `whatsapp.message.received`, then redeploy.
No phone numbers or names are stored. Demo prices only. Not medical advice.

## Expectation Receipt and quick look (v5)
- **Quick look:** hover (or focus, or tap the "i") on a product card to see who it is for, the fit and what to check first.
- **Expectation Receipt:** on a product page or at checkout, the customer picks what they hope for and by when. It is remembered on their device. A short order code (no phone number) carries it to the WhatsApp check-in, which then asks how it compared.
- **Insights:** "Expectation vs experience" shows each product's decision. The decision comes from fixed rules in `lib/variance.js`. Gemini (`api/expectation.js`) only explains it in words.
- No new environment variables. Same Upstash and Gemini setup as before.
