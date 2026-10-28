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

## WhatsApp: multi-select (what the platform allows)
WhatsApp's business API has **no poll and no multi-select**. List and button messages are single-choice only. FitCheck therefore does this:
- **Default (works now):** one list message. Tap one option, or type several in one go, like `1, 3` or `feel and smell`. The browser preview shows real tick-boxes.
- **Optional (true tick-boxes on WhatsApp):** a WhatsApp Flow. In Kapso or Meta WhatsApp Manager create a Flow, paste `docs/whatsapp-flow.json`, publish it, copy the Flow ID, and add it in Vercel as `KAPSO_FLOW_ID`, then redeploy. If the Flow fails to send, the chat falls back to the list automatically. Not tested live by the author yet.
