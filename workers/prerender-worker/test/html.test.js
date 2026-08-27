import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { homePage, detailPage, renderHtml } from "../src/html.js";
import { HOME_DESCRIPTION, HOME_TITLE } from "../src/copy.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fightClub = JSON.parse(
  readFileSync(join(__dirname, "fixtures", "tmdb-movie-550.json"), "utf8"),
);

describe("crawler HTML", () => {
  it("describes the homepage as a discovery catalog, not a streaming site", () => {
    const page = homePage({
      canonical: "https://flashmovies.xyz/",
      siteOrigin: "https://flashmovies.xyz",
    });
    const html = renderHtml(page, "https://flashmovies.xyz");

    assert.equal(page.title, HOME_TITLE);
    assert.equal(page.description, HOME_DESCRIPTION);
    assert.match(html, /<link rel="canonical" href="https:\/\/flashmovies\.xyz\/">/);
    assert.match(html, /property="og:title"/);
    assert.match(html, /name="twitter:card"/);
    assert.match(html, /application\/ld\+json/);
    assert.doesNotMatch(html, /Affiliate Site Verification/i);
    assert.doesNotMatch(html, /Free Movie Streaming/i);
    assert.doesNotMatch(html, /watch latest movies in HD for free/i);
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
    assert.match(page.description, /ticking-time-bomb insomniac/i);
    assert.equal(page.canonical, "https://flashmovies.xyz/movie-info?type=movie&id=550");
    assert.match(page.image, /image\.tmdb\.org\/t\/p\/w500\/jSziioSwPVrOy9Yow3XhWIBDjq1\.jpg/);
    assert.equal(page.ogType, "video.movie");
    assert.match(html, /<title>Fight Club \(1999\) — Flash Movies<\/title>/);
    assert.match(html, /property="og:image"/);
    assert.match(html, /name="twitter:title"/);
    assert.match(html, /"@type":"Movie"/);
    assert.match(html, /David Fincher/);
    assert.doesNotMatch(html, /Affiliate Site Verification/i);
    assert.doesNotMatch(html, /Watch Free/i);
    assert.doesNotMatch(html, /stream in HD/i);
  });
});
