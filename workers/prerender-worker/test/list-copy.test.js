import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HOME_BODY } from "../src/copy.js";
import { homePage, listPage, renderHtml } from "../src/html.js";
import { listPageParagraphs } from "../src/list-copy.js";

function countFree(text) {
  return (text.match(/\bfree\b/gi) || []).length;
}

describe("crawler list copy", () => {
  it("keeps classic homepage title and description for search snippets", () => {
    const page = homePage({
      canonical: "https://flashmovies.xyz/",
      siteOrigin: "https://flashmovies.xyz",
      featuredSections: [
        {
          title: "Trending movies this week",
          links: [{ href: "/movie-info?type=movie&id=550", text: "Fight Club" }],
        },
      ],
    });
    const html = renderHtml(page, "https://flashmovies.xyz");

    assert.match(html, /Flash Movies — Watch Free Movies &amp; TV Shows Online/);
    assert.match(html, /free movie and TV streaming website/i);
    assert.match(html, /browse popular and trending titles/i);
    assert.match(html, /Featured on this page: Trending movies this week/i);
    assert.match(html, /Fight Club/);
  });

  it("uses moderate free wording on list pages", () => {
    const paragraphs = listPageParagraphs({
      route: {
        kind: "list",
        pathname: "/list-items",
        type: "movie",
        listSearch: "trending_week",
        listTitle: "trending-movies-this-week",
        listFilters: {
          withGenres: null,
          primaryReleaseYear: null,
          firstAirDateYear: null,
          voteAverageGte: null,
          voteAverageLte: null,
        },
      },
      listName: "Trending Movies This Week",
      results: [
        { id: 550, title: "Fight Club" },
        { id: 278, title: "The Shawshank Redemption" },
      ],
    });
    const text = paragraphs.join(" ");

    assert.ok(paragraphs.length >= 5);
    assert.ok(paragraphs.some((p) => /Trending this week/i.test(p)));
    assert.ok(paragraphs.some((p) => /Fight Club/.test(p)));
    assert.ok(paragraphs.some((p) => /watch online/i.test(p)));
    assert.ok(paragraphs.some((p) => /watch free online/i.test(p)));
    assert.ok(!/Keywords people search for/i.test(text));
    assert.ok(countFree(text) <= 3, `list copy mentions free ${countFree(text)} times`);
  });

  it("includes genre-specific copy for discover lists", () => {
    const page = listPage({
      route: {
        kind: "list",
        pathname: "/list-items",
        type: "movie",
        listSearch: "discover",
        listTitle: "action-movies",
        listFilters: {
          withGenres: "28",
          primaryReleaseYear: null,
          firstAirDateYear: null,
          voteAverageGte: null,
          voteAverageLte: null,
        },
      },
      data: { results: [{ id: 603, title: "The Matrix" }] },
      canonical:
        "https://flashmovies.xyz/list-items?type=movie&search=discover&with_genres=28&title=action-movies",
      siteOrigin: "https://flashmovies.xyz",
    });
    const html = renderHtml(page, "https://flashmovies.xyz");

    assert.match(html, /action films you can watch online/i);
    assert.match(html, /Genre focus: action/i);
    assert.match(html, /The Matrix/);
  });
});
