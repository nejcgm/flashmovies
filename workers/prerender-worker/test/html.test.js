import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { homePage, detailPage, renderHtml } from "../src/html.js";
import { HOME_DESCRIPTION, HOME_TITLE } from "../src/copy.js";
import { homePageDescription } from "../src/list-copy.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fightClub = JSON.parse(
  readFileSync(join(__dirname, "fixtures", "tmdb-movie-550.json"), "utf8"),
);

describe("crawler HTML", () => {
  it("describes the homepage as a free movie and TV streaming site", () => {
    const page = homePage({
      canonical: "https://flashmovies.xyz/",
      siteOrigin: "https://flashmovies.xyz",
    });
    const html = renderHtml(page, "https://flashmovies.xyz");

    assert.equal(page.title, HOME_TITLE);
    assert.equal(page.description, HOME_DESCRIPTION);
    assert.match(html, /free movie and TV streaming website/i);
    assert.match(html, /browse popular and trending titles/i);
    assert.match(html, /Trending movies this week/);
    assert.match(html, /Browse shows by genre/);
    assert.match(html, /Frequently asked questions/);
    assert.match(html, /Is Flash Movies free\?/);
    assert.match(html, /"@type":"FAQPage"/);
    assert.match(html, /aria-label="Site menu"/);
    assert.doesNotMatch(html, /Affiliate Site Verification/i);
    assert.doesNotMatch(html, /<script type="module"/);
  });

  it("renders TMDB-backed HTML for /movie-info?type=movie&id=550 (Fight Club)", () => {
    const page = detailPage({
      route: { kind: "detail", pathname: "/movie-info", type: "movie", id: "550" },
      data: fightClub,
      canonical: "https://flashmovies.xyz/movie-info?type=movie&id=550",
      siteOrigin: "https://flashmovies.xyz",
    });
    const html = renderHtml(page, "https://flashmovies.xyz");

    assert.match(page.title, /Fight Club \(1999\)/);
    assert.match(page.description, /Watch Fight Club \(1999\) free on Flash Movies/i);
    assert.equal(page.canonical, "https://flashmovies.xyz/movie-info?type=movie&id=550");
    assert.match(page.image, /image\.tmdb\.org\/t\/p\/w500\/jSziioSwPVrOy9Yow3XhWIBDjq1\.jpg/);
    assert.equal(page.ogType, "video.movie");
    assert.match(html, /<title>Fight Club \(1999\) — Watch Free Online \| Flash Movies<\/title>/);
    assert.match(html, /property="og:image"/);
    assert.match(html, /name="twitter:title"/);
    assert.match(html, /"@type":"Movie"/);
    assert.match(html, /David Fincher/);
    assert.doesNotMatch(html, /Affiliate Site Verification/i);
    assert.match(html, /Watch Fight Club \(1999\) free on Flash Movies/);
  });

  it("renders TMDB-backed HTML for /full-movie?type=movie&id=550 (not a 404)", () => {
    const page = detailPage({
      route: { kind: "detail", pathname: "/full-movie", type: "movie", id: "550" },
      data: fightClub,
      canonical: "https://flashmovies.xyz/full-movie?type=movie&id=550",
      siteOrigin: "https://flashmovies.xyz",
    });
    const html = renderHtml(page, "https://flashmovies.xyz");
    assert.equal(page.status, 200);
    assert.match(page.title, /Watch Fight Club \(1999\) Free Online — Flash Movies/);
    assert.match(html, /<title>Watch Fight Club \(1999\) Free Online — Flash Movies<\/title>/);
    assert.match(html, /Fight Club \(1999\)/);
    assert.match(html, /full-movie\?type=movie/);
  });
});
