# prerender-worker

First-party Cloudflare Worker that replaces [prerender.io](https://prerender.io) for [Flash Movies](https://flashmovies.xyz).

Crawlers get a small, valid HTML document with real title, description, Open Graph, Twitter cards, canonical, and JSON-LD. Humans still receive the existing Vite/React SPA from the origin, unchanged. **No Next.js rewrite. No Cloudflare Browser Rendering / headless Chrome.**

The live Cloudflare Worker is named `prerender-worker`. Deploy this project **over that worker** — do not stack a second worker.

## What it does

1. Matches crawler User-Agents (Googlebot, Bingbot, Slack, Facebook, Twitter, LinkedIn, Discord, WhatsApp, Applebot, GPTBot, Claude, Scamadviser-like scanners, and others listed in `src/bots.js`) **or** `?_escaped_fragment_`.
2. For those requests only, returns first-party HTML:
   - `/movie-info` and `/full-movie` (movie / TV / person): TMDB details (`api.themoviedb.org`), same auth pattern as the SPA `VITE_API_KEY`.
   - Homepage and generic routes: Flash Movies as a **movie and TV discovery catalog** — not “Free Movie Streaming” / “watch latest movies in HD for free”. Crawler HTML does **not** include the hidden “Affiliate Site Verification” stub from `index.html`.
3. Caches crawler HTML in the Cloudflare Cache API (6 hours for detail/list pages, 24 hours for static catalog pages) so this stays on the Workers **free** tier.
4. Non-crawlers and static assets (`/assets/*`, sitemaps, images) are passed through to the SPA origin.

## TMDB key

The web app already calls TMDB from the browser:

```
apps/web/.env   →   VITE_API_KEY=Bearer <TMDB v4 read token>
apps/web/src/utils/fetching.ts   →   Authorization: VITE_API_KEY
```

Reuse that **same string**. Do not add a new backend.

```bash
cd workers/prerender-worker
cp .dev.vars.example .dev.vars   # local wrangler dev only
npx wrangler secret put TMDB_API_KEY
# paste the exact VITE_API_KEY value (with or without the "Bearer " prefix)
```

`.dev.vars` is gitignored. Never commit the token.

## Deploy (replaces prerender.io)

```bash
cd workers/prerender-worker
npm install
npx wrangler login          # once per machine
npx wrangler secret put TMDB_API_KEY
npx wrangler deploy         # updates the existing worker named prerender-worker
```

Then in the Cloudflare dashboard:

1. **Workers & Pages → prerender-worker → Settings → Domains & Routes**  
   Keep (or add) HTML routes only so `/assets/*` never hits the worker:

   - `flashmovies.xyz/`
   - `flashmovies.xyz/movie-info*`
   - `flashmovies.xyz/full-movie*`
   - `flashmovies.xyz/list-items*`
   - `flashmovies.xyz/terms-and-conditions*`
   - `flashmovies.xyz/pro-plan-terms-and-conditions*`
   - `flashmovies.xyz/frequently-asked-questions*`
   - `flashmovies.xyz/auth*`
   - `flashmovies.xyz/payments*`
   - the same set for `www.flashmovies.xyz`

   Intent: **crawlers → this worker, users → SPA origin**. The worker still checks User-Agent; humans who hit these HTML routes are `fetch()`’d through to Firebase/origin unchanged.

2. Confirm DNS for `flashmovies.xyz` stays proxied (orange cloud) and the origin is still the existing SPA host.

3. Cancel the prerender.io subscription. This worker does not call prerender.io.

Optional: uncomment the `routes` array in `wrangler.toml` if this Cloudflare account owns the `flashmovies.xyz` zone and you prefer routes-as-code.

## Verify

```bash
# Human — SPA shell (empty #root, JS bundle)
curl -s https://flashmovies.xyz/movie-info?type=movie&id=550 | head

# Googlebot — first-party HTML with Fight Club title / OG / JSON-LD
curl -s -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" \
  "https://flashmovies.xyz/movie-info?type=movie&id=550"
```

Crawler responses include `x-flash-crawler: 1` and `x-crawler-cache: HIT|MISS`.

A checked-in sample of that movie HTML (generated from TMDB) is [`examples/movie-info-550.html`](examples/movie-info-550.html). Regenerate it with:

```bash
TMDB_API_KEY="Bearer …" npm run sample
```

## Local

```bash
cd workers/prerender-worker
cp .dev.vars.example .dev.vars   # put the real VITE_API_KEY value here
npm test
npx wrangler dev
# curl -A Googlebot "http://127.0.0.1:8787/movie-info?type=movie&id=550"
```

`wrangler dev` does not need Browser Rendering. TMDB is a JSON fetch.

## Free-tier notes

| Resource | How this stays free |
| --- | --- |
| Worker requests | Route **HTML paths only**, not `/assets/*`. Cache hits still count as Worker invocations, but crawler volume is small. |
| Cache API | Used instead of KV. No KV write costs. TTL 6h / 24h. |
| CPU | String HTML + one TMDB `fetch`. No Chrome. |
| Browser Rendering | **Not used** (10 min/day cap is too small for a catalog). |

## Files

- `src/bots.js` — crawler User-Agent list + `_escaped_fragment_`
- `src/routes.js` — SPA URL parsing (`/movie-info?type=&id=`, `/list-items`, …)
- `src/tmdb.js` — TMDB v3 + Bearer token (same as `VITE_API_KEY`)
- `src/html.js` — title / meta / OG / Twitter / canonical / JSON-LD
- `src/index.js` — Worker entry: bot gate, Cache API, origin passthrough
