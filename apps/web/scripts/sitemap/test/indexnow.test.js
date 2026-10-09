import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { after, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  INDEXNOW_BATCH_LIMIT,
  INDEXNOW_ENDPOINT,
  INDEXNOW_HOST,
  batchUrls,
  collectSitemapUrls,
  extractUrlsetLocs,
  isIndexNowDryRun,
  loadIndexNowKey,
  notifyIndexNow,
  submitIndexNowBatches,
} from "../lib/indexnow.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, "../../..");
const publicDir = path.join(webRoot, "public");
const tmpRoot = mkdtempSync(path.join(tmpdir(), "indexnow-"));

after(() => {
  rmSync(tmpRoot, { recursive: true, force: true });
});

function writeUrlset(dir, filename, locs) {
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...locs.map((loc) => `  <url><loc>${loc}</loc></url>`),
    "</urlset>",
    "",
  ].join("\n");
  writeFileSync(path.join(dir, filename), body);
}

describe("IndexNow submission", () => {
  it("loads a key file whose body is exactly the key", () => {
    const loaded = loadIndexNowKey(publicDir);
    const bytes = readFileSync(path.join(publicDir, loaded.filename));
    assert.equal(bytes.toString("utf8"), loaded.key);
    assert.equal(bytes.includes(10), false);
    assert.equal(bytes.includes(13), false);
    assert.match(loaded.key, /^[a-f0-9]{32}$/);
    assert.equal(loaded.keyLocation, `https://${INDEXNOW_HOST}/${loaded.filename}`);
  });

  it("wires deploy:sitemap to notify only after hosting deploy, and copies the key into dist", () => {
    const { filename } = loadIndexNowKey(publicDir);
    const pkg = JSON.parse(readFileSync(path.join(webRoot, "package.json"), "utf8"));
    assert.equal(
      pkg.scripts["deploy:sitemap"],
      "npm run build:sitemap-index && firebase deploy --only hosting && node scripts/sitemap/notify-indexnow.js",
    );
    assert.match(pkg.scripts["sync:sitemap"], new RegExp(`cp public/${filename} dist/`));
    const readme = readFileSync(path.join(webRoot, "README.md"), "utf8");
    assert.match(readme, new RegExp(filename));
    assert.match(readme, /INDEXNOW_DRY_RUN/);
    assert.match(readme, /INDEXNOW_SKIP/);
  });

  it("decodes sitemap entities and drops off-host locs", () => {
    const sitemapsDir = path.join(tmpRoot, "decoded", "sitemaps");
    mkdirSync(sitemapsDir, { recursive: true });
    writeFileSync(path.join(tmpRoot, "decoded", "aaaaaaaaaaaaaaaa.txt"), "aaaaaaaaaaaaaaaa");
    writeUrlset(sitemapsDir, "movie-info.xml", [
      "https://flashmovies.xyz/movie-info?type=movie&amp;id=550",
      "https://example.com/elsewhere",
    ]);
    writeFileSync(
      path.join(sitemapsDir, "index-looking.xml"),
      "<sitemapindex><sitemap><loc>https://flashmovies.xyz/sitemaps/movie-info.xml</loc></sitemap></sitemapindex>\n",
    );

    const warnings = [];
    const urls = collectSitemapUrls(path.join(tmpRoot, "decoded"), (message) => {
      warnings.push(message);
    });
    assert.deepEqual(urls, ["https://flashmovies.xyz/movie-info?type=movie&id=550"]);
    assert.match(warnings.join("\n"), /skipped 1/);
    assert.deepEqual(extractUrlsetLocs("<sitemapindex><loc>https://flashmovies.xyz/sitemaps/a.xml</loc></sitemapindex>"), []);
  });

  it("batches at the IndexNow limit of 10,000", () => {
    assert.equal(INDEXNOW_BATCH_LIMIT, 10000);
    const urls = Array.from({ length: 25001 }, (_, index) => `https://flashmovies.xyz/${index}`);
    const batches = batchUrls(urls);
    assert.deepEqual(
      batches.map((batch) => batch.length),
      [10000, 10000, 5001],
    );
    assert.equal(batches.every((batch) => batch.length <= 10000), true);
  });

  it("splits the live sitemap catalog into batches of at most 10,000", () => {
    const urls = collectSitemapUrls(publicDir, () => {});
    const batches = batchUrls(urls);
    assert.ok(urls.length > INDEXNOW_BATCH_LIMIT);
    assert.equal(
      batches.reduce((sum, batch) => sum + batch.length, 0),
      urls.length,
    );
    assert.equal(batches.every((batch) => batch.length <= INDEXNOW_BATCH_LIMIT), true);
    assert.equal(batches[0].length, INDEXNOW_BATCH_LIMIT);
    assert.ok(urls.some((url) => url.includes("type=movie&id=")));
    assert.equal(urls.some((url) => url.includes("&amp;")), false);
  });

  it("POSTs host, key, keyLocation, and urlList, and keeps going after failures", async () => {
    const urls = Array.from({ length: 20001 }, (_, index) => `https://flashmovies.xyz/p/${index}`);
    const calls = [];
    const logs = [];
    const warnings = [];
    const result = await submitIndexNowBatches({
      key: "abc12345",
      urls,
      log: (message) => logs.push(message),
      warn: (message) => warnings.push(message),
      fetchImpl: async (endpoint, init) => {
        calls.push({ endpoint, init });
        if (calls.length === 1) {
          return new Response("", { status: 202 });
        }
        if (calls.length === 2) {
          throw new Error("network down");
        }
        return new Response("bad", { status: 422 });
      },
    });

    assert.equal(result.ok, false);
    assert.equal(result.submitted, 20001);
    assert.equal(calls.length, 3);
    assert.equal(calls[0].endpoint, INDEXNOW_ENDPOINT);
    assert.equal(calls[0].init.method, "POST");
    assert.equal(calls[0].init.headers["Content-Type"], "application/json; charset=utf-8");
    const payload = JSON.parse(calls[0].init.body);
    assert.equal(payload.host, INDEXNOW_HOST);
    assert.equal(payload.key, "abc12345");
    assert.equal(payload.keyLocation, `https://${INDEXNOW_HOST}/abc12345.txt`);
    assert.equal(payload.urlList.length, 10000);
    assert.equal(JSON.parse(calls[1].init.body).urlList[0], "https://flashmovies.xyz/p/10000");
    assert.equal(JSON.parse(calls[2].init.body).urlList.length, 1);
    assert.match(warnings.join("\n"), /network down/);
    assert.match(warnings.join("\n"), /HTTP 422/);
    assert.equal(logs.some((line) => line.includes("HTTP 202")), true);
  });

  it("does not call fetch on dry run or skip, and never throws when the key is missing", async () => {
    assert.equal(isIndexNowDryRun({ INDEXNOW_DRY_RUN: "1" }), true);
    assert.equal(isIndexNowDryRun({ INDEXNOW_SKIP: "yes" }), true);
    assert.equal(isIndexNowDryRun({ INDEXNOW_DRY_RUN: "0" }), false);

    let called = false;
    const logs = [];
    const dry = await notifyIndexNow({
      publicDir,
      dryRun: true,
      urls: ["https://flashmovies.xyz/", "https://flashmovies.xyz/frequently-asked-questions"],
      log: (message) => logs.push(message),
      fetchImpl: async () => {
        called = true;
        return new Response("", { status: 200 });
      },
    });
    assert.equal(called, false);
    assert.equal(dry.ok, true);
    assert.match(logs.join("\n"), /dry run/);

    const skipped = await notifyIndexNow({
      publicDir: path.join(tmpRoot, "missing"),
      env: { INDEXNOW_SKIP: "1" },
      log: () => {},
      warn: () => {},
    });
    assert.equal(skipped.ok, false);
    assert.match(skipped.error, /IndexNow key file/);
  });

  it("CLI dry run exits 0", () => {
    const result = spawnSync(process.execPath, ["scripts/sitemap/notify-indexnow.js"], {
      cwd: webRoot,
      env: { ...process.env, INDEXNOW_DRY_RUN: "1" },
      encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /IndexNow dry run: skip POST batch/);
    assert.match(result.stdout, /10000 URLs/);
  });
});
