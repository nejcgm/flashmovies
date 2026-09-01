# prerender-worker

First-party Cloudflare Worker that replaces prerender.io for [Flash Movies](https://flashmovies.xyz).

Crawlers get a small, valid HTML document with real title, description, Open Graph, Twitter cards, canonical, and JSON-LD. Humans still receive the existing Vite/React SPA from the origin, unchanged. **No Next.js rewrite. No Cloudflare Browser Rendering / headless Chrome.**

## Live Cloudflare state (do not assume this is on the domain yet)

| Fact | Detail |
| --- | --- |
| Worker name | `prerender-worker` (production, account `d4d5dea420b3c5c51f6e9a5a85820759`) |
| Where it runs today | `prerender-worker.nejc-gjurameke.workers.dev` only |
| Zone routes on `flashmovies.xyz` | **None.** Crawler traffic to the site bypasses the worker. |
| Current script | Proxies bots to `https://service.prerender.io/${request.url}` |
| Cache | None (no KV). This rewrite uses the Cache API. |
| Loop protection | Incoming `X-Prerender` header → pass through to origin |
| Bug to drop | Any bot URL containing `/full-movie` returned a hard **404**. Those are the movie pages. This worker serves TMDB HTML for them. |

Deploy this project **over** `prerender-worker`. Do not create a second worker.

## What it does

1. Matches crawler User-Agents from the live `BOT_AGENTS` list (plus AI / scanner agents in `src/bots.js`) **or** `?_escaped_fragment_`.
2. Skips `IGNORE_EXTENSIONS` (same idea as the live worker: `.js`, `.css`, images, fonts, …) and passes those to origin.
3. Incoming `X-Prerender` → origin passthrough (loop protection). Origin subrequests set that header.
4. For crawlers only, returns first-party HTML:
   - `/movie-info` **and `/full-movie`** (movie / TV / person): TMDB details (`api.themoviedb.org`), same auth pattern as the SPA `VITE_API_KEY`.
   - Homepage and generic routes: Flash Movies as a **free movie and TV streaming website** — watch films and series online in HD. Crawler HTML does **not** include the hidden “Affiliate Site Verification” stub from `index.html`.
5. Caches crawler HTML in the Cloudflare Cache API (6 hours for detail/list pages, 24 hours for static catalog pages).
6. Does **not** call prerender.io.

## TMDB key

The web app already calls TMDB from the browser:

```
apps/web/.env   →   VITE_API_KEY=Bearer <TMDB v4 read token>
apps/web/src/client/tmdb.ts   →   Authorization: VITE_API_KEY
```

Reuse that **same string**. Do not add a new backend.

```bash
cd workers/prerender-worker
cp .dev.vars.example .dev.vars   # local wrangler dev only
npx wrangler secret put TMDB_API_KEY
# paste the exact VITE_API_KEY value (with or without the "Bearer " prefix)
```

`.dev.vars` is gitignored. Never commit the token.

## Deploy

```bash
cd workers/prerender-worker
npm install
npx wrangler login          # once per machine
npx wrangler secret put TMDB_API_KEY
npx wrangler deploy         # updates worker name `prerender-worker`
```

`wrangler deploy` publishes to `*.workers.dev`. **It does not attach a zone route.** `flashmovies.xyz` still bypasses the worker until you add one.

### After merge: attach the zone route

Dashboard → **Workers & Pages → prerender-worker → Settings → Domains & Routes → Add**:

| Route | Notes |
| --- | --- |
| `flashmovies.xyz/*` | Required. This is the missing piece. |
| `www.flashmovies.xyz/*` | Add if `www` is used. |

Set **Failure mode** to **Fail open (proceed)** so a worker error still serves the SPA.

The worker still checks User-Agent internally: crawlers get HTML, humans are `fetch()`’d to the Firebase/SPA origin. `IGNORE_EXTENSIONS` keeps `/assets/*` and other static files on origin even with a `/*` route.

Optional: uncomment the `routes` array in `wrangler.toml` and redeploy if you want the route as code.

Then cancel the prerender.io subscription. In the Worker **Variables and Secrets** settings, delete the old unused prerender secret (the one the previous script read). Do not copy that value into git, chat, or this README.

Confirm DNS for `flashmovies.xyz` stays proxied (orange cloud).

## Verify

```bash
# Human — SPA shell (empty #root, JS bundle)
curl -s "https://flashmovies.xyz/movie-info?type=movie&id=550" | head

# Googlebot — first-party HTML with Fight Club title / OG / JSON-LD
curl -s -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" \
  "https://flashmovies.xyz/movie-info?type=movie&id=550"

# /full-movie must NOT 404 for bots (that was the live worker bug)
curl -s -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" \
  "https://flashmovies.xyz/full-movie?type=movie&id=550"
```

Crawler responses include `x-flash-crawler: 1` and `x-crawler-cache: HIT|MISS`.

Checked-in TMDB samples:

- [`examples/movie-info-550.html`](examples/movie-info-550.html)
- [`examples/full-movie-550.html`](examples/full-movie-550.html)

```bash
TMDB_API_KEY="Bearer …" npm run sample
```

## Local

```bash
cd workers/prerender-worker
cp .dev.vars.example .dev.vars   # put the real VITE_API_KEY value here
npm test
npx wrangler dev
# curl -A Googlebot "http://127.0.0.1:8787/full-movie?type=movie&id=550"
```

`wrangler dev` does not need Browser Rendering. TMDB is a JSON fetch.

## Free-tier notes

| Resource | How this stays free |
| --- | --- |
| Worker requests | `/*` is required to actually intercept crawlers. `IGNORE_EXTENSIONS` + UA check keep most human asset hits as cheap origin passthrough. Cache hits still count as invocations; crawler volume is small. |
| Cache API | Used instead of KV. No KV write costs. TTL 6h / 24h. |
| CPU | String HTML + one TMDB `fetch`. No Chrome. |
| Browser Rendering | **Not used** (10 min/day cap is too small for a catalog). |

## Files

- `src/bots.js` — `BOT_AGENTS`, `_escaped_fragment_`, `X-Prerender` loop header
- `src/routes.js` — `IGNORE_EXTENSIONS`, SPA URL parsing (`/movie-info`, `/full-movie`, lists)
- `src/tmdb.js` — TMDB v3 + Bearer token (same as `VITE_API_KEY`)
- `src/html.js` — title / meta / OG / Twitter / canonical / JSON-LD
- `src/index.js` — Worker entry: bot gate, Cache API, origin passthrough
