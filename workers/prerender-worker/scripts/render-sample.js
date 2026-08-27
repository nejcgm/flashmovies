#!/usr/bin/env node
/**
 * Render sample crawler HTML for /movie-info?type=movie&id=550 (Fight Club)
 * using the live TMDB key pattern from the SPA (VITE_API_KEY / TMDB_API_KEY).
 *
 * Usage:
 *   TMDB_API_KEY="Bearer …" node scripts/render-sample.js
 *   # or the same string as apps/web/.env VITE_API_KEY
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildCrawlerPage } from "../src/index.js";
import { renderHtml } from "../src/html.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const siteOrigin = "https://flashmovies.xyz";
const movieUrl = new URL(`${siteOrigin}/movie-info?type=movie&id=550`);
const watchUrl = new URL(`${siteOrigin}/full-movie?type=movie&id=550`);

const apiKey = process.env.TMDB_API_KEY || process.env.VITE_API_KEY;
if (!apiKey) {
  console.error("Set TMDB_API_KEY or VITE_API_KEY (same value as apps/web VITE_API_KEY).");
  process.exit(1);
}

const outDir = join(__dirname, "..", "examples");
mkdirSync(outDir, { recursive: true });

async function writeSample(url, filename) {
  const page = await buildCrawlerPage(url, {
    SITE_ORIGIN: siteOrigin,
    TMDB_API_KEY: apiKey,
  });
  const html = renderHtml(page, siteOrigin);
  const outFile = join(outDir, filename);
  writeFileSync(outFile, html);
  console.log(`Wrote ${outFile}`);
  console.log(`title: ${page.title}`);
  console.log(`canonical: ${page.canonical}`);
  console.log(`status: ${page.status}`);
}

await writeSample(movieUrl, "movie-info-550.html");
await writeSample(watchUrl, "full-movie-550.html");
