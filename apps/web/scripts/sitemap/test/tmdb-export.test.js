import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  exportDateLabel,
  exportDownloadUrl,
  movieExportRowPasses,
  personExportRowPasses,
  SITEMAP_MAX_MOVIES_DEFAULT,
  SITEMAP_MAX_PEOPLE_DEFAULT,
  SITEMAP_MAX_TV_DEFAULT,
  topIdsByPopularity,
  tvExportRowPasses,
} from "../lib/tmdb-export.js";
import { BLOCKED_MOVIE_ID } from "../lib/tmdb-ids.js";

describe("sitemap TMDB export", () => {
  it("builds export urls from utc date", () => {
    const date = new Date(Date.UTC(2026, 7, 27));
    assert.equal(exportDateLabel(date), "08_27_2026");
    assert.equal(
      exportDownloadUrl("movie", date),
      "https://files.tmdb.org/p/exports/movie_ids_08_27_2026.json.gz",
    );
  });

  it("filters movie rows", () => {
    const opts = { minPopularity: 1 };
    assert.equal(movieExportRowPasses({ id: 550, adult: false, video: false, popularity: 10 }, opts), true);
    assert.equal(movieExportRowPasses({ id: BLOCKED_MOVIE_ID, adult: false, video: false, popularity: 10 }, opts), false);
    assert.equal(movieExportRowPasses({ id: 1, adult: true, video: false, popularity: 10 }, opts), false);
    assert.equal(movieExportRowPasses({ id: 1, adult: false, video: true, popularity: 10 }, opts), false);
    assert.equal(movieExportRowPasses({ id: 1, adult: false, video: false, popularity: 0.5 }, opts), false);
  });

  it("filters tv and person rows", () => {
    const opts = { minPopularity: 1 };
    assert.equal(tvExportRowPasses({ id: 1396, popularity: 2 }, opts), true);
    assert.equal(tvExportRowPasses({ id: 1396, popularity: 0.2 }, opts), false);
    assert.equal(personExportRowPasses({ id: 31, adult: false, popularity: 5 }, opts), true);
    assert.equal(personExportRowPasses({ id: 31, adult: true, popularity: 5 }, opts), false);
  });

  it("raises catalog caps so info-only sitemaps stay near 50k locs", () => {
    assert.equal(SITEMAP_MAX_MOVIES_DEFAULT, 32000);
    assert.equal(SITEMAP_MAX_TV_DEFAULT, 10000);
    assert.equal(SITEMAP_MAX_PEOPLE_DEFAULT, 7500);

    const year = new Date().getFullYear();
    const yearPages = Math.max(0, year - 2015 + 1) * 2;
    const listAndStatic = 3 + 8 + 7 + 1 + 18 + 10 + yearPages + 6;
    const total =
      SITEMAP_MAX_MOVIES_DEFAULT +
      SITEMAP_MAX_TV_DEFAULT +
      SITEMAP_MAX_PEOPLE_DEFAULT +
      listAndStatic;
    assert.ok(
      Math.abs(total - 50000) <= 2000,
      `expected ~50k locs, got ${total}`,
    );
  });

  it("selects top ids by popularity", () => {
    assert.deepEqual(
      topIdsByPopularity(
        [
          { id: 1, popularity: 2 },
          { id: 2, popularity: 9 },
          { id: 3, popularity: 5 },
        ],
        2,
      ),
      [2, 3],
    );
  });
});
