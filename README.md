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
