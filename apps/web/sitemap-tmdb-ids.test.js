import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BLOCKED_MOVIE_ID,
  mergeUniqueIds,
  resolveSitemapCatalogIds,
  tmdbAuthorization,
} from "./sitemap-tmdb-ids.js";

describe("sitemap TMDB ids", () => {
  it("normalizes bearer tokens", () => {
    assert.equal(tmdbAuthorization("abc"), "Bearer abc");
    assert.equal(tmdbAuthorization("Bearer abc"), "Bearer abc");
  });

  it("dedupes ids and skips blocked movie", () => {
    assert.deepEqual(
      mergeUniqueIds([550, BLOCKED_MOVIE_ID, 278], [278, 603]),
      [550, 278, 603],
    );
  });

  it("falls back when no api key is configured", async () => {
    const original = process.env.VITE_API_KEY;
    const originalExport = process.env.SITEMAP_USE_EXPORT;
    delete process.env.VITE_API_KEY;
    delete process.env.TMDB_API_KEY;
    process.env.SITEMAP_USE_EXPORT = "0";
    const catalog = await resolveSitemapCatalogIds({ useExport: false });
    if (original) process.env.VITE_API_KEY = original;
    if (originalExport) process.env.SITEMAP_USE_EXPORT = originalExport;
    else delete process.env.SITEMAP_USE_EXPORT;
    assert.equal(catalog.source, "fallback");
    assert.ok(catalog.movieIds.length >= 50);
  });
});
