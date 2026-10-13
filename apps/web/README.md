# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

INSTRUCTIONS TO SETUP
Create your own .env file in root 
add TMDB api Key in .env file
Example:
VITE_API_KEY =Bearer APIKEY

Crawler HTML (replaces prerender.io) lives in `workers/prerender-worker`. See that folder's README for wrangler deploy. The worker reuses this same `VITE_API_KEY`.

## Monthly sitemap deploy

Do this before or with the monthly sitemap deploy. The crawler homepage "Popular titles" block is Worker-only. Do not add it back to the SPA.

1. In Google Search Console, take the `/movie-info` URLs with the most impressions.
2. Update `workers/prerender-worker/src/popular-titles.json`. Each entry is an `id`, a `type` (`movie`, `tv`, or `person`), and a `title` for the link label. Use the TMDB display title (`title`, otherwise `name`, otherwise `original_title`). If an id stays on the list, keep the title already stored for it.
3. Bump `CACHE_KEY_VERSION` in `workers/prerender-worker/wrangler.toml` so cached crawler HTML is not reused.
4. Redeploy the Worker from `workers/prerender-worker` (`npm test`, then `npx wrangler deploy`).
5. From `apps/web`, deploy the sitemap: `npm run deploy:sitemap`.
