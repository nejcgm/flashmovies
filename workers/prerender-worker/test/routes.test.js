import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { canonicalUrl, IGNORE_EXTENSIONS, parseRoute, shouldBypass } from "../src/routes.js";

describe("routes", () => {
  it("parses movie, TV, and person detail URLs", () => {
    const movie = parseRoute(new URL("https://flashmovies.xyz/movie-info/?id=550&type=movie"));
    assert.deepEqual(movie, {
      kind: "detail",
      pathname: "/movie-info",
      type: "movie",
      id: "550",
    });

    const tv = parseRoute(new URL("https://flashmovies.xyz/full-movie?type=tv&id=1396"));
    assert.equal(tv.kind, "detail");
    assert.equal(tv.type, "tv");
    assert.equal(tv.id, "1396");

    const person = parseRoute(new URL("https://flashmovies.xyz/movie-info?type=person&id=287"));
    assert.equal(person.kind, "detail");
    assert.equal(person.type, "person");
  });

  it("parses list and static catalog routes", () => {
    const list = parseRoute(
      new URL("https://flashmovies.xyz/list-items?type=movie&search=popular&title=popular-movies"),
    );
    assert.equal(list.kind, "list");
    assert.equal(list.listSearch, "popular");

    assert.equal(parseRoute(new URL("https://flashmovies.xyz/")).kind, "home");
    assert.equal(parseRoute(new URL("https://flashmovies.xyz/frequently-asked-questions")).kind, "faq");
    assert.equal(parseRoute(new URL("https://flashmovies.xyz/unknown-page")).kind, "not-found");
  });

  it("bypasses SPA assets and sitemaps", () => {
    assert.equal(shouldBypass(new URL("https://flashmovies.xyz/assets/index-abc.js")), true);
    assert.equal(shouldBypass(new URL("https://flashmovies.xyz/sitemap.xml")), true);
    assert.equal(shouldBypass(new URL("https://flashmovies.xyz/sitemaps/movie-info.xml")), true);
    assert.equal(shouldBypass(new URL("https://flashmovies.xyz/flash-movies-logo.png")), true);
    assert.equal(shouldBypass(new URL("https://flashmovies.xyz/movie-info?type=movie&id=550")), false);
    assert.equal(shouldBypass(new URL("https://flashmovies.xyz/full-movie?type=movie&id=550")), false);
  });

  it("reuses the live IGNORE_EXTENSIONS suffixes", () => {
    for (const ext of [".js", ".css", ".png", ".woff2", ".webp", ".xml"]) {
      assert.ok(IGNORE_EXTENSIONS.includes(ext), `missing ${ext}`);
    }
  });

  it("builds a stable canonical without _escaped_fragment_", () => {
    const url = new URL(
      "https://flashmovies.xyz/movie-info/?id=550&type=movie&_escaped_fragment_=",
    );
    assert.equal(
      canonicalUrl(url, "https://flashmovies.xyz"),
      "https://flashmovies.xyz/movie-info?type=movie&id=550",
    );
  });
});
