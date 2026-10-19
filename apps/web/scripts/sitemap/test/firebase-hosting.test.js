import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { loadIndexNowKey } from "../lib/indexnow.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const firebasePath = path.resolve(__dirname, "../../../firebase.json");
const publicDir = path.resolve(__dirname, "../../../public");

describe("firebase hosting sitemap config", () => {
  const config = JSON.parse(readFileSync(firebasePath, "utf8"));
  const hosting = config.hosting;

  it("301s trailing-slash sitemap URLs before the SPA rewrite", () => {
    const redirects = hosting.redirects || [];
    assert.ok(redirects.length >= 2, "expected sitemap trailing-slash redirects");

    const indexSlash = redirects.find((rule) => rule.regex === "^/sitemap\\.xml/$");
    assert.ok(indexSlash, "missing /sitemap.xml/ redirect");
    assert.equal(indexSlash.destination, "/sitemap.xml");
    assert.equal(indexSlash.type, 301);

    const childSlash = redirects.find(
      (rule) => rule.regex === "^/sitemaps/(?P<file>[^/]+\\.xml)/$",
    );
    assert.ok(childSlash, "missing /sitemaps/*.xml/ redirect");
    assert.equal(childSlash.destination, "/sitemaps/:file");
    assert.equal(childSlash.type, 301);
    assert.match(childSlash.regex, /\(\?P<file>/);
  });

  it("applies XML Content-Type only to real sitemap files, not trailing slashes", () => {
    const xmlHeader = (hosting.headers || []).find((entry) => {
      const headers = entry.headers || [];
      return headers.some(
        (header) =>
          header.key === "Content-Type" &&
          String(header.value).includes("application/xml"),
      );
    });
    assert.ok(xmlHeader, "missing sitemap XML Content-Type header");
    assert.equal(xmlHeader.regex, "^/(sitemap\\.xml|sitemaps/[^/]+\\.xml)$");
    assert.equal(xmlHeader.source, undefined);

    const pattern = new RegExp(xmlHeader.regex);
    assert.equal(pattern.test("/sitemap.xml"), true);
    assert.equal(pattern.test("/sitemaps/static.xml"), true);
    assert.equal(pattern.test("/sitemap.xml/"), false);
    assert.equal(pattern.test("/sitemaps/static.xml/"), false);
    assert.equal(pattern.test("/sitemaps/"), false);
    assert.equal(pattern.test("/index.html"), false);
  });

  it("rewrites unknown routes to index.html but never /assets/**", () => {
    const rewrites = hosting.rewrites || [];
    const spa = rewrites.filter((rule) => rule.destination === "/index.html");
    assert.deepEqual(spa, [
      {
        source: "!/assets/**",
        destination: "/index.html",
      },
    ]);
    assert.equal(
      rewrites.some((rule) => rule.source === "**" || rule.source === "/assets/**"),
      false,
    );
  });

  it("caches HTML for an hour and hashed assets as immutable", () => {
    const headers = hosting.headers || [];
    const headerValue = (source, key) => {
      const rule = headers.find((entry) => entry.source === source);
      assert.ok(rule, `missing header rule ${source}`);
      return (rule.headers || []).find((header) => header.key === key)?.value;
    };

    assert.equal(headerValue("**/*.html", "Cache-Control"), "max-age=3600");
    assert.equal(headerValue("**/*.html", "Content-Type"), "text/html; charset=utf-8");
    assert.doesNotMatch(headerValue("**/*.html", "Cache-Control"), /immutable/);

    assert.equal(headerValue("/assets/**", "Cache-Control"), "max-age=31536000, immutable");
    assert.equal(headerValue("**/*.js", "Cache-Control"), undefined);
    assert.equal(headerValue("**/*.css", "Cache-Control"), undefined);
    assert.match(headerValue("**/*.js", "Content-Type"), /javascript/);
    assert.match(headerValue("**/*.css", "Content-Type"), /text\/css/);

    assert.equal(headerValue("404.html", "Cache-Control"), "no-store");
    assert.equal(headerValue("404.html", "Content-Type"), "text/html; charset=utf-8");
    const sources = headers.map((entry) => entry.source);
    assert.ok(sources.indexOf("404.html") > sources.indexOf("/assets/**"));
    assert.ok(sources.indexOf("404.html") > sources.indexOf("**/*.html"));
  });

  it("serves the IndexNow key file as text/plain from public/", () => {
    const { filename } = loadIndexNowKey(publicDir);
    const keyPath = path.join(publicDir, filename);
    assert.equal(existsSync(keyPath), true);

    const rule = (hosting.headers || []).find((entry) => entry.source === `/${filename}`);
    assert.ok(rule, "missing IndexNow key header");
    const contentType = (rule.headers || []).find((header) => header.key === "Content-Type");
    assert.equal(contentType?.value, "text/plain; charset=utf-8");

    const rewriteSources = (hosting.rewrites || []).map((rule) => rule.source);
    assert.equal(rewriteSources.includes(`/${filename}`), false);
    assert.equal(rewriteSources.at(-1), "!/assets/**");
  });
});
