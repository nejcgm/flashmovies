import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const firebasePath = path.resolve(__dirname, "../../../firebase.json");

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
      (rule) => rule.regex === "^/sitemaps/([^/]+\\.xml)/$",
    );
    assert.ok(childSlash, "missing /sitemaps/*.xml/ redirect");
    assert.equal(childSlash.destination, "/sitemaps/:1");
    assert.equal(childSlash.type, 301);
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

  it("keeps the SPA catch-all rewrite after redirects", () => {
    const rewrites = hosting.rewrites || [];
    assert.deepEqual(rewrites[rewrites.length - 1], {
      source: "**",
      destination: "/index.html",
    });
  });
});
