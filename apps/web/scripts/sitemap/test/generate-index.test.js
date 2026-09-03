import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, describe, it } from "node:test";
import { generateSitemapIndex, pruneStaleSitemaps } from "../generate-index.js";

const tmpRoot = mkdtempSync(path.join(tmpdir(), "sitemap-generate-"));
const sitemapsDir = path.join(tmpRoot, "public", "sitemaps");

after(() => {
  rmSync(tmpRoot, { recursive: true, force: true });
});

const silent = () => {};

describe("sitemap generate-index", () => {
  it("omits /full-movie locs and prunes leftover watch sitemaps", async () => {
    mkdirSync(sitemapsDir, { recursive: true });
    writeFileSync(path.join(sitemapsDir, "movie-watch.xml"), "<urlset></urlset>\n");
    writeFileSync(path.join(sitemapsDir, "tv-watch.xml"), "<urlset></urlset>\n");
    writeFileSync(path.join(sitemapsDir, "movie-watch-002.xml"), "<urlset></urlset>\n");
    writeFileSync(path.join(sitemapsDir, "tv-watch-001.xml"), "<urlset></urlset>\n");

    const result = await generateSitemapIndex({
      webRoot: tmpRoot,
      log: silent,
      catalog: {
        source: "test",
        movieIds: [550],
        tvIds: [1396],
        personIds: [31],
      },
    });

    const files = readdirSync(sitemapsDir).sort();
    assert.ok(!files.some((file) => file.startsWith("movie-watch")));
    assert.ok(!files.some((file) => file.startsWith("tv-watch")));
    assert.ok(files.includes("movie-info.xml"));
    assert.ok(files.includes("tv-info.xml"));
    assert.ok(files.includes("celebrities.xml"));

    const indexXml = readFileSync(path.join(tmpRoot, "public", "sitemap.xml"), "utf8");
    assert.equal(indexXml.includes("movie-watch"), false);
    assert.equal(indexXml.includes("tv-watch"), false);
    assert.equal(indexXml.includes("/full-movie"), false);

    const childXml = files
      .map((file) => readFileSync(path.join(sitemapsDir, file), "utf8"))
      .join("\n");
    assert.equal(childXml.includes("/full-movie"), false);
    assert.match(childXml, /\/movie-info\?type=movie&amp;id=550/);
    assert.match(childXml, /\/movie-info\?type=tv&amp;id=1396/);
    assert.match(childXml, /\/movie-info\?type=person&amp;id=31/);

    const filenames = result.sitemapResults.map((entry) => entry.filename);
    assert.equal(filenames.includes("movie-watch.xml"), false);
    assert.equal(filenames.includes("tv-watch.xml"), false);
  });

  it("pruneStaleSitemaps deletes leftover movie-watch and tv-watch files", () => {
    const pruneDir = path.join(tmpRoot, "prune");
    mkdirSync(pruneDir, { recursive: true });
    writeFileSync(path.join(pruneDir, "movie-info.xml"), "<urlset></urlset>\n");
    writeFileSync(path.join(pruneDir, "movie-watch.xml"), "<urlset></urlset>\n");
    writeFileSync(path.join(pruneDir, "tv-watch.xml"), "<urlset></urlset>\n");
    writeFileSync(path.join(pruneDir, "tv-watch-003.xml"), "<urlset></urlset>\n");

    pruneStaleSitemaps(pruneDir, ["movie-info.xml"], silent);

    assert.deepEqual(readdirSync(pruneDir).sort(), ["movie-info.xml"]);
  });
});
