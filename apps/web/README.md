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

## IndexNow

`npm run deploy:sitemap` builds the site, deploys Firebase Hosting, then submits the sitemap page URLs to `https://api.indexnow.org/indexnow` (`host` `flashmovies.xyz`, batches of at most 10,000). The ownership key is the static file `public/4ce3866fbd727f83e8bb47d8e4594e1d.txt`, copied into `dist/` and served as `text/plain` at `https://flashmovies.xyz/4ce3866fbd727f83e8bb47d8e4594e1d.txt`. Firebase's SPA rewrite applies only when no file exists at that path, and the prerender worker passes the key URL through to origin for every user agent.

IndexNow errors are logged and do not fail the sitemap deploy. Set `INDEXNOW_DRY_RUN=1` or `INDEXNOW_SKIP=1` to log the batches without POSTing.
