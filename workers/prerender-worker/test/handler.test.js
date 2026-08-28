import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { handleRequest } from "../src/index.js";
import { tmdbAuthorization } from "../src/tmdb.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fightClub = JSON.parse(
  readFileSync(join(__dirname, "fixtures", "tmdb-movie-550.json"), "utf8"),
);

function tmdbListResult(items = [{ id: 550, title: "Fight Club", poster_path: "/x.jpg" }]) {
  return new Response(JSON.stringify({ results: items }), {
    headers: { "content-type": "application/json" },
  });
}

/**
 * @param {object} [options]
 * @param {typeof fetch} [options.onUnexpected]
 */
function mockTmdbFetch(options = {}) {
  const { onUnexpected } = options;
  return async (input, init = {}) => {
    const url = typeof input === "string" ? input : input.url;
    if (url.includes("api.themoviedb.org/3/movie/550")) {
      return new Response(JSON.stringify(fightClub), {
        headers: { "content-type": "application/json" },
      });
    }
    if (url.includes("api.themoviedb.org")) {
      return tmdbListResult();
    }
    if (onUnexpected) return onUnexpected(input, init);
    throw new Error(`unexpected fetch ${url}`);
  };
}

function memoryCache() {
  const store = new Map();
  return {
    async match(request) {
      const stored = store.get(request.url);
      return stored ? stored.clone() : null;
    },
    async put(request, response) {
      store.set(request.url, response);
    },
  };
}

const env = {
  SITE_ORIGIN: "https://flashmovies.xyz",
  TMDB_API_KEY: "Bearer test-token",
  CACHE_TTL_SECONDS: "21600",
  HOME_CACHE_TTL_SECONDS: "86400",
};

describe("worker request handling", () => {
  it("301s /sitemap.xml/ to /sitemap.xml without hitting origin or crawler HTML", async () => {
    const fetchImpl = async () => {
      throw new Error("trailing-slash sitemaps must not hit origin or TMDB");
    };

    const response = await handleRequest(
      new Request("https://flashmovies.xyz/sitemap.xml/", {
        headers: {
          "user-agent":
            "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        },
      }),
      env,
      {},
      { fetch: fetchImpl, cache: memoryCache() },
    );

    assert.equal(response.status, 301);
    assert.equal(response.headers.get("location"), "https://flashmovies.xyz/sitemap.xml");
    assert.equal(response.headers.get("x-flash-crawler"), null);
    assert.equal(await response.text(), "");
  });

  it("301s child sitemap trailing slashes and still bypasses canonical sitemap.xml", async () => {
    let originHits = 0;
    const fetchImpl = async (input) => {
      originHits += 1;
      const url = typeof input === "string" ? input : input.url;
      assert.match(url, /\/sitemap\.xml$/);
      return new Response("<?xml version=\"1.0\"?><sitemapindex></sitemapindex>", {
        headers: { "content-type": "application/xml" },
      });
    };

    const slash = await handleRequest(
      new Request("https://flashmovies.xyz/sitemaps/static.xml/", {
        headers: { "user-agent": "Mozilla/5.0 Chrome/120.0.0.0" },
      }),
      env,
      {},
      { fetch: fetchImpl, cache: memoryCache() },
    );
    assert.equal(slash.status, 301);
    assert.equal(slash.headers.get("location"), "https://flashmovies.xyz/sitemaps/static.xml");
    assert.equal(originHits, 0);

    const canonical = await handleRequest(
      new Request("https://flashmovies.xyz/sitemap.xml", {
        headers: {
          "user-agent":
            "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        },
      }),
      env,
      {},
      { fetch: fetchImpl, cache: memoryCache() },
    );
    assert.equal(originHits, 1);
    assert.equal(canonical.status, 200);
    assert.equal(canonical.headers.get("x-flash-crawler"), null);
    assert.match(await canonical.text(), /sitemapindex/);
  });

  it("passes human browsers through to the SPA origin unchanged", async () => {
    const originHtml = "<!doctype html><title>SPA</title><div id='root'></div>";
    let originHits = 0;
    const fetchImpl = async (input) => {
      originHits += 1;
      const url = typeof input === "string" ? input : input.url;
      assert.match(url, /flashmovies\.xyz/);
      return new Response(originHtml, {
        headers: { "content-type": "text/html" },
      });
    };

    const response = await handleRequest(
      new Request("https://flashmovies.xyz/movie-info?type=movie&id=550", {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      }),
      env,
      {},
      { fetch: fetchImpl, cache: memoryCache() },
    );

    assert.equal(originHits, 1);
    assert.equal(await response.text(), originHtml);
    assert.equal(response.headers.get("x-flash-crawler"), null);
  });

  it("sets X-Prerender on origin passthrough (loop protection)", async () => {
    let seen = null;
    const fetchImpl = async (input) => {
      seen = input;
      return new Response("spa", { headers: { "content-type": "text/html" } });
    };
    await handleRequest(
      new Request("https://flashmovies.xyz/", {
        headers: { "user-agent": "Mozilla/5.0 Chrome/120.0.0.0" },
      }),
      env,
      {},
      { fetch: fetchImpl, cache: memoryCache() },
    );
    assert.equal(seen.headers.get("X-Prerender"), "1");
    assert.doesNotMatch(seen.url, /service\.prerender\.io/);
  });

  it("does not 404 Googlebot on /full-movie (live worker bug)", async () => {
    const fetchImpl = async (input, init = {}) => {
      const url = typeof input === "string" ? input : input.url;
      assert.doesNotMatch(url, /service\.prerender\.io/);
      if (url.includes("api.themoviedb.org/3/movie/550")) {
        return new Response(JSON.stringify(fightClub), {
          headers: { "content-type": "application/json" },
        });
      }
      throw new Error(`unexpected fetch ${url}`);
    };

    const response = await handleRequest(
      new Request("https://flashmovies.xyz/full-movie?type=movie&id=550", {
        headers: {
          "user-agent":
            "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        },
      }),
      env,
      {},
      { fetch: fetchImpl, cache: memoryCache() },
    );

    const html = await response.text();
    assert.equal(response.status, 200);
    assert.notEqual(html, "Not Found");
    assert.match(html, /<title>Watch Fight Club \(1999\) Free Online — Flash Movies<\/title>/);
    assert.match(html, /rel="canonical" href="https:\/\/flashmovies\.xyz\/full-movie\?type=movie&amp;id=550"/);
  });

  it("passes X-Prerender + Googlebot through to origin instead of prerender.io", async () => {
    let originHits = 0;
    const fetchImpl = async (input) => {
      originHits += 1;
      const url = typeof input === "string" ? input : input.url;
      assert.doesNotMatch(url, /service\.prerender\.io/);
      return new Response("spa-origin", { headers: { "content-type": "text/html" } });
    };

    const response = await handleRequest(
      new Request("https://flashmovies.xyz/full-movie?type=movie&id=550", {
        headers: {
          "user-agent":
            "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
          "X-Prerender": "1",
        },
      }),
      env,
      {},
      { fetch: fetchImpl, cache: memoryCache() },
    );

    assert.equal(originHits, 1);
    assert.equal(await response.text(), "spa-origin");
    assert.equal(response.headers.get("x-flash-crawler"), null);
  });

  it("returns 404 crawler HTML for the SPA-hidden movie id", async () => {
    const response = await handleRequest(
      new Request("https://flashmovies.xyz/movie-info?type=movie&id=1439112", {
        headers: {
          "user-agent":
            "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        },
      }),
      env,
      {},
      {
        fetch: async () => {
          throw new Error("blocked titles must not hit TMDB");
        },
        cache: memoryCache(),
      },
    );
    const html = await response.text();
    assert.equal(response.status, 404);
    assert.match(html, /noindex/);
    assert.match(html, /Page not found/);
    assert.doesNotMatch(html, /application\/ld\+json.*"@type":"Movie"/);
  });

  it("caches failed list TMDB fetches for two minutes, not six hours", async () => {
    const response = await handleRequest(
      new Request(
        "https://flashmovies.xyz/list-items?type=movie&search=popular&title=popular-movies",
        {
          headers: {
            "user-agent":
              "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
          },
        },
      ),
      env,
      {},
      {
        fetch: async () => new Response("nope", { status: 503 }),
        cache: memoryCache(),
      },
    );
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "public, max-age=120");
  });

  it("HEAD cache hits do not include a body", async () => {
    const cache = memoryCache();
    const headers = {
      "user-agent":
        "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    };
    const get = await handleRequest(
      new Request("https://flashmovies.xyz/", { headers }),
      env,
      {},
      { fetch: mockTmdbFetch({ onUnexpected: () => { throw new Error("no origin"); } }), cache },
    );
    assert.ok((await get.text()).length > 0);

    const head = await handleRequest(
      new Request("https://flashmovies.xyz/", { method: "HEAD", headers }),
      env,
      {},
      { fetch: async () => { throw new Error("cache hit must not refetch"); }, cache },
    );
    assert.equal(head.status, 200);
    assert.equal(head.headers.get("x-crawler-cache"), "HIT");
    assert.equal(await head.text(), "");
  });

  it("returns TMDB-backed crawler HTML for Googlebot on a movie URL", async () => {
    const fetchImpl = async (input, init = {}) => {
      const url = typeof input === "string" ? input : input.url;
      if (url.includes("api.themoviedb.org/3/movie/550")) {
        assert.match(init.headers.authorization, /^Bearer test-token$/);
        return new Response(JSON.stringify(fightClub), {
          headers: { "content-type": "application/json" },
        });
      }
      throw new Error(`unexpected fetch ${url}`);
    };

    const response = await handleRequest(
      new Request("https://flashmovies.xyz/movie-info?type=movie&id=550", {
        headers: {
          "user-agent":
            "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        },
      }),
      env,
      {},
      { fetch: fetchImpl, cache: memoryCache() },
    );

    const html = await response.text();
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("x-flash-crawler"), "1");
    assert.match(html, /<title>Fight Club \(1999\) — Watch Free Online \| Flash Movies<\/title>/);
    assert.match(html, /property="og:title" content="Fight Club \(1999\) — Watch Free Online \| Flash Movies"/);
    assert.match(html, /application\/ld\+json/);
    assert.doesNotMatch(html, /Affiliate Site Verification/);
  });

  it("serves homepage TMDB sections and menu links to crawlers", async () => {
    const cache = memoryCache();
    const request = new Request("https://flashmovies.xyz/", {
      headers: { "user-agent": "Twitterbot/1.0" },
    });

    const first = await handleRequest(request, env, {}, {
      fetch: mockTmdbFetch({ onUnexpected: () => { throw new Error("homepage must not hit origin"); } }),
      cache,
    });
    const html = await first.text();
    assert.match(html, /Watch Free Movies/i);
    assert.match(html, /free movie and TV streaming website/i);
    assert.match(html, /Trending movies this week/);
    assert.match(html, /Fight Club/);
    assert.match(html, /Browse movies by genre/);
    assert.match(html, /aria-label="Site menu"/);
    assert.doesNotMatch(html, /Affiliate Site Verification/);
    assert.equal(first.headers.get("x-crawler-cache"), "MISS");

    const second = await handleRequest(request, env, {}, {
      fetch: async () => { throw new Error("cache hit must not refetch"); },
      cache,
    });
    assert.equal(second.headers.get("x-crawler-cache"), "HIT");
    const cachedHtml = await second.text();
    assert.match(cachedHtml, /Fight Club/);
    assert.match(cachedHtml, /Trending TV this week/);
  });

  it("serves genre-filtered discover lists to crawlers", async () => {
    let tmdbUrl = "";
    const fetchImpl = async (input) => {
      const url = typeof input === "string" ? input : input.url;
      tmdbUrl = url;
      return tmdbListResult([{ id: 603, title: "The Matrix", poster_path: "/m.jpg" }]);
    };

    const response = await handleRequest(
      new Request(
        "https://flashmovies.xyz/list-items?type=movie&search=discover&with_genres=28&title=action-movies",
        {
          headers: {
            "user-agent":
              "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
          },
        },
      ),
      env,
      {},
      { fetch: fetchImpl, cache: memoryCache() },
    );
    const html = await response.text();
    assert.match(tmdbUrl, /with_genres=28/);
    assert.match(html, /The Matrix/);
    assert.match(html, /Action Movies/i);
  });

  it("accepts VITE_API_KEY values with or without a Bearer prefix", () => {
    assert.equal(tmdbAuthorization("Bearer abc"), "Bearer abc");
    assert.equal(tmdbAuthorization("abc"), "Bearer abc");
  });
});
