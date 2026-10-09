import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { homePage, detailPage, renderHtml, similarTitleLinks, SIMILAR_TITLES_MAX } from "../src/html.js";
import { HOME_DESCRIPTION, HOME_TITLE } from "../src/copy.js";

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
    assert.equal(
      HOME_TITLE,
      "Flash Movies — Watch Free Movies & TV Shows Online",
    );
    assert.equal(page.description, HOME_DESCRIPTION);
    assert.match(html, /free movie and TV streaming website/i);
    assert.match(html, /browse popular and trending titles/i);
    assert.match(html, /Trending movies this week/);
    assert.match(html, /Browse shows by genre/);
    assert.match(html, /Frequently asked questions/);
    assert.match(html, /Is Flash Movies free\?/);
    assert.match(html, /"@type":"FAQPage"/);
    assert.match(html, /aria-label="Site menu"/);
    assert.match(html, /Popular titles/);
    assert.match(html, /movie-info\?type=movie&amp;id=860508/);
    assert.match(html, /movie-info\?type=movie&amp;id=969681/);
    assert.match(html, /movie-info\?type=movie&amp;id=1368337/);
    assert.match(html, /movie-info\?type=movie&amp;id=1386315/);
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
    assert.match(html, /Watch free online in HD on Flash Movies/);
    assert.doesNotMatch(html, /Similar titles/);
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
    assert.match(html, /<h1>Watch Fight Club \(1999\) free online<\/h1>/);
    assert.match(html, /Fight Club \(1999\)/);
    assert.match(html, /full-movie\?type=movie/);
    assert.doesNotMatch(html, /Similar titles/);
  });

  it("adds 8–12 Similar titles links on movie-info from recommendations then similar", () => {
    const recommendations = [
      { id: 550, title: "Fight Club" },
      { id: 1439112, title: "Blocked title" },
      { id: "nope", title: "Bad id" },
      { id: 100, title: "Adult pick", adult: true },
      { id: 101, media_type: "person", name: "Someone" },
      ...Array.from({ length: 10 }, (_, index) => ({
        id: 1000 + index,
        title: `Rec ${index}`,
        media_type: "movie",
      })),
    ];
    const similar = [
      { id: 1000, title: "Rec 0 again" },
      ...Array.from({ length: 8 }, (_, index) => ({
        id: 2000 + index,
        title: `Sim ${index}`,
      })),
      { id: 2999 },
    ];
    const page = detailPage({
      route: { kind: "detail", pathname: "/movie-info", type: "movie", id: "550" },
      data: { ...fightClub, recommendations: { results: recommendations }, similar: { results: similar } },
      canonical: "https://flashmovies.xyz/movie-info?type=movie&id=550",
      siteOrigin: "https://flashmovies.xyz",
    });
    const html = renderHtml(page, "https://flashmovies.xyz");
    const block = html.match(/<nav aria-label="Similar titles">[\s\S]*?<\/nav>/);
    assert.ok(block);
    const hrefs = [...block[0].matchAll(/href="([^"]+)"/g)].map((match) => match[1]);

    assert.equal(SIMILAR_TITLES_MAX, 12);
    assert.equal(hrefs.length, 12);
    assert.deepEqual(hrefs.slice(0, 10), Array.from({ length: 10 }, (_, index) =>
      `/movie-info?type=movie&amp;id=${1000 + index}`));
    assert.equal(hrefs[10], "/movie-info?type=movie&amp;id=2000");
    assert.equal(hrefs[11], "/movie-info?type=movie&amp;id=2001");
    assert.equal(block[0].includes("Fight Club"), false);
    assert.equal(block[0].includes("1439112"), false);
    assert.equal(block[0].includes("Adult pick"), false);
    assert.equal(block[0].includes("Someone"), false);
    assert.match(html, /<h2>Similar titles<\/h2>/);
    assert.match(html, /<title>Fight Club \(1999\) — Watch Free Online \| Flash Movies<\/title>/);
    assert.match(html, /Watch Fight Club free online/);
  });

  it("links TV info pages to /movie-info?type=tv and skips the current show", () => {
    const data = {
      name: "Breaking Bad",
      first_air_date: "2008-01-20",
      overview: "A chemistry teacher cooks.",
      recommendations: {
        results: Array.from({ length: 9 }, (_, index) => ({
          id: 3000 + index,
          name: `Show ${index}`,
          media_type: "tv",
        })),
      },
      similar: {
        results: [
          { id: 1396, name: "Breaking Bad" },
          { id: 4000, name: "Better Call Saul", original_name: "Better Call Saul" },
        ],
      },
    };
    const links = similarTitleLinks(data, { pathname: "/movie-info", type: "tv", id: "1396" });
    assert.equal(links.length, 10);
    assert.equal(links[0].href, "/movie-info?type=tv&id=3000");
    assert.equal(links[0].text, "Show 0");
    assert.equal(links[9].href, "/movie-info?type=tv&id=4000");
    assert.equal(links[9].text, "Better Call Saul");
    assert.equal(links.some((link) => link.href.endsWith("id=1396")), false);

    const page = detailPage({
      route: { kind: "detail", pathname: "/movie-info", type: "tv", id: "1396" },
      data,
      canonical: "https://flashmovies.xyz/movie-info?type=tv&id=1396",
      siteOrigin: "https://flashmovies.xyz",
    });
    const html = renderHtml(page, "https://flashmovies.xyz");
    assert.match(html, /<title>Breaking Bad \(2008\) — Watch Free Online \| Flash Movies<\/title>/);
    assert.match(html, /movie-info\?type=tv&amp;id=4000/);
    assert.match(html, /Better Call Saul/);
  });

  it("does not add Similar titles on /full-movie or person pages", () => {
    const data = {
      ...fightClub,
      recommendations: { results: [{ id: 807, title: "Se7en" }] },
      similar: { results: [{ id: 680, title: "Pulp Fiction" }] },
    };
    const watch = renderHtml(
      detailPage({
        route: { kind: "detail", pathname: "/full-movie", type: "movie", id: "550" },
        data,
        canonical: "https://flashmovies.xyz/full-movie?type=movie&id=550",
        siteOrigin: "https://flashmovies.xyz",
      }),
      "https://flashmovies.xyz",
    );
    assert.match(watch, /<title>Watch Fight Club \(1999\) Free Online — Flash Movies<\/title>/);
    assert.doesNotMatch(watch, /Similar titles/);
    assert.doesNotMatch(watch, /Se7en/);
    assert.equal(
      similarTitleLinks(data, { pathname: "/full-movie", type: "movie", id: "550" }).length,
      0,
    );

    const person = renderHtml(
      detailPage({
        route: { kind: "detail", pathname: "/movie-info", type: "person", id: "287" },
        data: {
          name: "Brad Pitt",
          recommendations: { results: [{ id: 807, title: "Se7en" }] },
        },
        canonical: "https://flashmovies.xyz/movie-info?type=person&id=287",
        siteOrigin: "https://flashmovies.xyz",
      }),
      "https://flashmovies.xyz",
    );
    assert.match(person, /<title>Brad Pitt — Flash Movies<\/title>/);
    assert.doesNotMatch(person, /Similar titles/);
  });
});
