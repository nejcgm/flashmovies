import assert from "node:assert/strict";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  compareSitemapFiles,
  isSitemapGuardSkip,
  runSitemapGuard,
} from "../guard-live.js";
import { syncLiveSitemaps } from "../sync-live.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, "../../..");
const tmpDirs = [];

after(() => {
  for (const dir of tmpDirs) rmSync(dir, { recursive: true, force: true });
});

function tempDir() {
  const dir = mkdtempSync(path.join(tmpdir(), "sitemap-guard-"));
  tmpDirs.push(dir);
  return dir;
}

function indexXml(children) {
  const body = children
    .map(
      (child) =>
        `  <sitemap>\n    <loc>https://flashmovies.xyz/sitemaps/${child.file}</loc>\n    <lastmod>${child.lastmod}</lastmod>\n  </sitemap>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}

function urlsetXml(urls) {
  const body = urls
    .map(
      (url) =>
        `  <url>\n    <loc>${url.loc}</loc>\n    <lastmod>${url.lastmod}</lastmod>\n  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function filesFor(indexLastmod, urls) {
  return {
    "sitemap.xml": indexXml([{ file: "static.xml", lastmod: indexLastmod }]),
    "sitemaps/static.xml": urlsetXml(urls),
  };
}

describe("sitemap deploy guard", () => {
  const home = { loc: "https://flashmovies.xyz/", lastmod: "2026-10-01" };
  const faq = {
    loc: "https://flashmovies.xyz/frequently-asked-questions",
    lastmod: "2026-10-01",
  };

  it("fails when dist max lastmod is older than live", () => {
    const result = compareSitemapFiles(
      filesFor("2026-09-02", [{ ...home, lastmod: "2026-09-02" }]),
      filesFor("2026-10-01", [home]),
    );
    assert.equal(result.ok, false);
    assert.match(result.message, /dist\/sitemap.xml: max lastmod 2026-09-02 is older than live 2026-10-01/);
    assert.match(result.message, /dist\/sitemaps\/static.xml: max lastmod 2026-09-02 is older than live 2026-10-01/);
    assert.match(result.message, /sync:sitemap-live/);
    assert.match(result.message, /SITEMAP_GUARD_SKIP=1/);
  });

  it("fails when dist has fewer URLs than live", () => {
    const result = compareSitemapFiles(filesFor("2026-10-26", [{ ...home, lastmod: "2026-10-26" }]), {
      "sitemap.xml": indexXml([{ file: "static.xml", lastmod: "2026-10-01" }]),
      "sitemaps/static.xml": urlsetXml([home, faq]),
    });
    assert.equal(result.ok, false);
    assert.match(result.message, /dist\/sitemaps\/static.xml: 1 URLs is fewer than live 2/);
    assert.match(result.message, /sync:sitemap-live/);
  });

  it("fails when a live child sitemap is missing from dist", () => {
    const live = filesFor("2026-10-01", [home]);
    const result = compareSitemapFiles({ "sitemap.xml": live["sitemap.xml"] }, live);
    assert.equal(result.ok, false);
    assert.match(result.message, /dist\/sitemaps\/static.xml: missing from dist/);
  });

  it("passes when lastmod and URL counts are equal", () => {
    const files = filesFor("2026-10-01", [home, faq]);
    const result = compareSitemapFiles(files, files);
    assert.equal(result.ok, true);
    assert.deepEqual(result.reasons, []);
  });

  it("treats a same-day timestamp as equal and a later day as newer", () => {
    const live = filesFor("2026-10-01T18:00:00Z", [{ ...home, lastmod: "2026-10-01T18:00:00Z" }]);
    const sameDay = filesFor("2026-10-01", [home]);
    assert.equal(compareSitemapFiles(sameDay, live).ok, true);

    const newer = filesFor("2026-10-02", [
      home,
      faq,
      { loc: "https://flashmovies.xyz/terms-and-conditions", lastmod: "2026-10-02" },
    ]);
    const result = compareSitemapFiles(newer, filesFor("2026-10-01", [home, faq]));
    assert.equal(result.ok, true);
    assert.deepEqual(result.reasons, []);
  });

  it("skips the live fetch when SITEMAP_GUARD_SKIP=1", async () => {
    assert.equal(isSitemapGuardSkip({ SITEMAP_GUARD_SKIP: "1" }), true);
    assert.equal(isSitemapGuardSkip({ SITEMAP_GUARD_SKIP: "yes" }), true);
    assert.equal(isSitemapGuardSkip({ SITEMAP_GUARD_SKIP: "0" }), false);
    assert.equal(isSitemapGuardSkip({}), false);

    let called = false;
    const logs = [];
    const result = await runSitemapGuard({
      env: { SITEMAP_GUARD_SKIP: "1" },
      log: (message) => logs.push(message),
      fetchImpl: async () => {
        called = true;
        throw new Error("should not fetch");
      },
    });
    assert.equal(called, false);
    assert.equal(result.ok, true);
    assert.equal(result.skipped, true);
    assert.match(logs.join("\n"), /SITEMAP_GUARD_SKIP/);
  });

  it("fails closed when the live sitemap cannot be fetched", async () => {
    const warnings = [];
    const refused = await runSitemapGuard({
      env: {},
      log: () => {},
      warn: (message) => warnings.push(message),
      fetchImpl: async () => {
        throw new Error("network down");
      },
    });
    assert.equal(refused.ok, false);
    assert.equal(refused.fetchFailed, true);
    assert.match(refused.message, /Failing closed/);
    assert.match(refused.message, /network down/);
    assert.match(refused.message, /SITEMAP_GUARD_SKIP=1/);
    assert.match(warnings.join("\n"), /Failing closed/);

    const httpFailure = await runSitemapGuard({
      env: {},
      log: () => {},
      warn: () => {},
      fetchImpl: async () => new Response("nope", { status: 503 }),
    });
    assert.equal(httpFailure.ok, false);
    assert.match(httpFailure.message, /HTTP 503/);

    const distDir = tempDir();
    mkdirSync(path.join(distDir, "sitemaps"), { recursive: true });
    const live = filesFor("2026-10-01", [home]);
    writeFileSync(path.join(distDir, "sitemap.xml"), live["sitemap.xml"]);
    writeFileSync(path.join(distDir, "sitemaps", "static.xml"), live["sitemaps/static.xml"]);
    const childFailure = await runSitemapGuard({
      env: {},
      distDir,
      log: () => {},
      warn: () => {},
      fetchImpl: async (url) => {
        if (url.endsWith("/sitemap.xml") && !url.includes("/sitemaps/")) {
          return new Response(live["sitemap.xml"]);
        }
        return new Response("missing", { status: 404 });
      },
    });
    assert.equal(childFailure.ok, false);
    assert.match(childFailure.message, /failing closed/);
    assert.match(childFailure.message, /sync:sitemap-live/);
  });

  it("wires the guard into hosting predeploy and sync into npm run deploy", () => {
    const firebase = JSON.parse(readFileSync(path.join(webRoot, "firebase.json"), "utf8"));
    assert.deepEqual(firebase.hosting.predeploy, ["node scripts/sitemap/guard-live.js"]);

    const pkg = JSON.parse(readFileSync(path.join(webRoot, "package.json"), "utf8"));
    assert.equal(pkg.scripts["sync:sitemap-live"], "node scripts/sitemap/sync-live.js");
    assert.equal(
      pkg.scripts.deploy,
      "npm run build && npm run sync:sitemap-live && firebase deploy --only hosting",
    );
    assert.equal(
      pkg.scripts["deploy:sitemap"],
      "npm run build:sitemap-index && firebase deploy --only hosting && node scripts/sitemap/notify-indexnow.js",
    );
    assert.match(pkg.scripts["test:sitemap"], /guard-live\.test\.js/);
  });
});

describe("sync:sitemap-live", () => {
  it("writes the live sitemap bytes into dist and drops stale children", async () => {
    const distDir = tempDir();
    mkdirSync(path.join(distDir, "sitemaps"), { recursive: true });
    writeFileSync(path.join(distDir, "sitemap.xml"), "<stale-index/>\n");
    writeFileSync(path.join(distDir, "sitemaps", "stale.xml"), "<stale/>\n");

    const indexBody = Buffer.from(
      `${indexXml([{ file: "static.xml", lastmod: "2026-10-01" }])}<!-- live -->\n`,
    );
    const childBody = Buffer.from(
      `${urlsetXml([{ loc: "https://flashmovies.xyz/", lastmod: "2026-10-01" }])}\n`,
    );

    const logs = [];
    const result = await syncLiveSitemaps({
      distDir,
      log: (message) => logs.push(message),
      fetchImpl: async (url) => {
        if (url.endsWith("/sitemap.xml") && !url.includes("/sitemaps/")) {
          return new Response(indexBody);
        }
        if (url.endsWith("/sitemaps/static.xml")) return new Response(childBody);
        return new Response("missing", { status: 404 });
      },
    });

    assert.equal(result.childCount, 1);
    assert.deepEqual(readFileSync(path.join(distDir, "sitemap.xml")), indexBody);
    assert.deepEqual(readFileSync(path.join(distDir, "sitemaps", "static.xml")), childBody);
    assert.equal(readFileSync(path.join(distDir, "sitemap.xml"), "utf8").includes("<!-- live -->"), true);
    assert.equal(existsSync(path.join(distDir, "sitemaps", "stale.xml")), false);
    assert.match(logs.join("\n"), /Synced live sitemap/);
  });

  it("does not replace dist when the live fetch fails", async () => {
    const distDir = tempDir();
    mkdirSync(distDir, { recursive: true });
    writeFileSync(path.join(distDir, "sitemap.xml"), "keep-me");
    await assert.rejects(
      () =>
        syncLiveSitemaps({
          distDir,
          log: () => {},
          fetchImpl: async () => new Response("down", { status: 500 }),
        }),
      /HTTP 500/,
    );
    assert.equal(readFileSync(path.join(distDir, "sitemap.xml"), "utf8"), "keep-me");
  });
});
