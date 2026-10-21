import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assetNeedsHeal,
  assetOrigin,
  isAssetPath,
  looksLikeHtml,
} from "../src/assets.js";
import { handleRequest } from "../src/index.js";

const env = {
  SITE_ORIGIN: "https://flashmovies.xyz",
  TMDB_API_KEY: "Bearer test-token",
  ASSET_ORIGIN: "https://moviestream-14d2b.web.app",
};

const shell = "<!doctype html>\n<html><div id=\"root\"></div></html>";
const moduleSource = "function Ot(e,t){return e.apply(t)}\n";

function memoryCache() {
  const store = new Map();
  return {
    store,
    async match(request) {
      const stored = store.get(request.url);
      return stored ? stored.clone() : null;
    },
    async put(request, response) {
      store.set(request.url, response);
    },
  };
}

function jsResponse(body = moduleSource, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "max-age=31536000, immutable",
    },
  });
}

function htmlAsScript(body = shell, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "max-age=31536000, immutable",
    },
  });
}

describe("asset response checks", () => {
  it("recognises the SPA shell and ignores JavaScript", () => {
    assert.equal(looksLikeHtml("<!doctype html><html></html>"), true);
    assert.equal(looksLikeHtml("\n<html lang=\"en\">"), true);
    assert.equal(looksLikeHtml("\uFEFF<!DOCTYPE html>"), true);
    assert.equal(looksLikeHtml(moduleSource), false);
    assert.equal(looksLikeHtml(""), false);
  });

  it("heals HTML and errors, and keeps redirects and 304s", () => {
    assert.equal(assetNeedsHeal(200, "application/javascript", shell), true);
    assert.equal(assetNeedsHeal(200, "text/html; charset=utf-8", ""), true);
    assert.equal(assetNeedsHeal(404, "text/html", ""), true);
    assert.equal(assetNeedsHeal(200, "application/javascript", moduleSource), false);
    assert.equal(assetNeedsHeal(304, "application/javascript", ""), false);
    assert.equal(assetNeedsHeal(301, "application/javascript", ""), false);
    assert.equal(isAssetPath("/assets/utils-BCn5QfZZ.js"), true);
    assert.equal(isAssetPath("/ASSETS/utils-BCn5QfZZ.js"), true);
    assert.equal(isAssetPath("/movie-info"), false);
    assert.equal(assetOrigin({}), "https://moviestream-14d2b.web.app");
    assert.equal(assetOrigin({ ASSET_ORIGIN: "http://evil.example" }), "https://moviestream-14d2b.web.app");
  });
});

describe("guarded /assets passthrough", () => {
  it("returns real JavaScript without calling Firebase again", async () => {
    const seen = [];
    const cache = memoryCache();
    const response = await handleRequest(
      new Request("https://flashmovies.xyz/assets/utils-BCn5QfZZ.js", {
        headers: { origin: "https://flashmovies.xyz" },
      }),
      env,
      {},
      {
        cache,
        fetch: async (input) => {
          const url = typeof input === "string" ? input : input.url;
          seen.push(url);
          assert.equal(input.headers.get("X-Prerender"), "1");
          return jsResponse();
        },
      },
    );

    assert.deepEqual(seen, ["https://flashmovies.xyz/assets/utils-BCn5QfZZ.js"]);
    assert.equal(response.status, 200);
    assert.equal(await response.text(), moduleSource);
    assert.equal(response.headers.get("cache-control"), "max-age=31536000, immutable");
    assert.equal(response.headers.get("x-assets-guard"), null);
    assert.equal(cache.store.size, 0);
  });

  it("serves Firebase bytes when the edge cached index.html as JavaScript", async () => {
    const seen = [];
    const cache = memoryCache();
    const response = await handleRequest(
      new Request("https://flashmovies.xyz/assets/utils-BCn5QfZZ.js", {
        headers: {
          origin: "https://flashmovies.xyz",
          "user-agent": "Mozilla/5.0 Chrome/120.0.0.0",
        },
      }),
      env,
      { waitUntil() {} },
      {
        cache,
        fetch: async (input) => {
          const url = typeof input === "string" ? input : input.url;
          seen.push(url);
          if (url.startsWith("https://moviestream-14d2b.web.app/")) {
            return jsResponse();
          }
          return htmlAsScript();
        },
      },
    );

    assert.deepEqual(seen, [
      "https://flashmovies.xyz/assets/utils-BCn5QfZZ.js",
      "https://moviestream-14d2b.web.app/assets/utils-BCn5QfZZ.js",
    ]);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "application/javascript; charset=utf-8");
    assert.equal(await response.text(), moduleSource);
    assert.equal(response.headers.get("x-flash-crawler"), null);
    assert.equal(cache.store.size, 0);
  });

  it("returns a no-store 404 when /assets is HTML on the edge and at Firebase", async () => {
    const cache = memoryCache();
    const response = await handleRequest(
      new Request("https://flashmovies.xyz/assets/missing-ZZZZZZ.js"),
      env,
      {},
      {
        cache,
        fetch: async () => htmlAsScript(),
      },
    );

    assert.equal(response.status, 404);
    assert.equal(response.headers.get("content-type"), "text/plain; charset=utf-8");
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(response.headers.get("cdn-cache-control"), "no-store");
    assert.equal(response.headers.get("x-assets-guard"), "rejected-html");
    const body = await response.text();
    assert.equal(body, "Not Found");
    assert.equal(body.includes("<"), false);
    assert.equal(cache.store.size, 0);
  });

  it("answers HEAD from the guarded GET so a cached shell is not reported as JavaScript", async () => {
    let method = "";
    const response = await handleRequest(
      new Request("https://flashmovies.xyz/assets/utils-BCn5QfZZ.js", {
        method: "HEAD",
        headers: { origin: "https://flashmovies.xyz" },
      }),
      env,
      {},
      {
        cache: memoryCache(),
        fetch: async (input) => {
          method = input.method;
          const url = typeof input === "string" ? input : input.url;
          if (url.startsWith("https://moviestream-14d2b.web.app/")) return jsResponse();
          return htmlAsScript();
        },
      },
    );

    assert.equal(method, "GET");
    assert.equal(response.status, 200);
    assert.equal(await response.text(), "");
    assert.equal(response.headers.get("content-type"), "application/javascript; charset=utf-8");
  });

  it("passes www asset redirects through", async () => {
    let fetches = 0;
    const response = await handleRequest(
      new Request("https://www.flashmovies.xyz/assets/utils-BCn5QfZZ.js"),
      env,
      {},
      {
        cache: memoryCache(),
        fetch: async () => {
          fetches += 1;
          return new Response(null, {
            status: 301,
            headers: { location: "https://flashmovies.xyz/assets/utils-BCn5QfZZ.js" },
          });
        },
      },
    );

    assert.equal(fetches, 1);
    assert.equal(response.status, 301);
    assert.equal(response.headers.get("location"), "https://flashmovies.xyz/assets/utils-BCn5QfZZ.js");
  });
});
