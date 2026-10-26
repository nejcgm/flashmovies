import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, describe, it } from "node:test";
import { generateSitemapIndex, pruneStaleSitemaps } from "../generate-index.js";
import { newestLastmod, resolveUrlLastmod } from "../lib/sitemap-xml.js";

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

  it("keeps an existing URL lastmod and dates new URLs with the run date", () => {
    const previous = new Map([["/movie-info?type=movie&id=550", "2026-01-15"]]);
    assert.equal(
      resolveUrlLastmod({ path: "/movie-info?type=movie&id=550" }, previous, "2026-10-26"),
      "2026-01-15",
    );
    assert.equal(
      resolveUrlLastmod({ path: "/movie-info?type=movie&id=551" }, previous, "2026-10-26"),
      "2026-10-26",
    );
    assert.equal(
      resolveUrlLastmod(
        { path: "/movie-info?type=movie&id=550", lastmod: "2026-02-02" },
        previous,
        "2026-10-26",
      ),
      "2026-02-02",
    );
    assert.equal(newestLastmod(["2026-01-15", "2024-05-01", "2026-10-26"]), "2026-10-26");
  });

  it("sets each index lastmod from that child's newest URL", async () => {
    const root = mkdtempSync(path.join(tmpdir(), "sitemap-lastmod-"));
    try {
      const catalog = {
        source: "test",
        movieIds: [550],
        tvIds: [],
        personIds: [],
      };
      await generateSitemapIndex({
        webRoot: root,
        log: silent,
        today: "2026-10-26",
        catalog,
        previousLastmods: new Map([
          ["/", "2024-05-01"],
          ["/frequently-asked-questions", "2025-06-01"],
          ["/movie-info?type=movie&id=550", "2026-01-15"],
        ]),
      });

      const staticXml = readFileSync(path.join(root, "public", "sitemaps", "static.xml"), "utf8");
      assert.match(staticXml, /<loc>https:\/\/flashmovies\.xyz\/<\/loc>\s*<lastmod>2024-05-01<\/lastmod>/);
      assert.match(
        staticXml,
        /frequently-asked-questions<\/loc>\s*<lastmod>2025-06-01<\/lastmod>/,
      );
      assert.match(
        staticXml,
        /terms-and-conditions<\/loc>\s*<lastmod>2026-10-26<\/lastmod>/,
      );

      const movieXml = readFileSync(path.join(root, "public", "sitemaps", "movie-info.xml"), "utf8");
      assert.match(movieXml, /id=550<\/loc>\s*<lastmod>2026-01-15<\/lastmod>/);

      const indexXml = readFileSync(path.join(root, "public", "sitemap.xml"), "utf8");
      assert.match(
        indexXml,
        /sitemaps\/static\.xml<\/loc>\s*<lastmod>2026-10-26<\/lastmod>/,
      );
      assert.match(
        indexXml,
        /sitemaps\/movie-info\.xml<\/loc>\s*<lastmod>2026-01-15<\/lastmod>/,
      );

      const plainRoot = path.join(root, "plain");
      await generateSitemapIndex({
        webRoot: plainRoot,
        log: silent,
        today: "2026-10-26",
        catalog,
        previousLastmods: new Map(),
      });
      const preservedLocs = indexLocs(indexXml);
      const plainLocs = indexLocs(
        readFileSync(path.join(plainRoot, "public", "sitemap.xml"), "utf8"),
      );
      assert.deepEqual(preservedLocs, plainLocs);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("prefers live lastmod and falls back to the local sitemap", async () => {
    const root = mkdtempSync(path.join(tmpdir(), "sitemap-prev-"));
    const sitemaps = path.join(root, "public", "sitemaps");
    mkdirSync(sitemaps, { recursive: true });
    writeFileSync(
      path.join(sitemaps, "static.xml"),
      `<urlset><url><loc>https://flashmovies.xyz/</loc><lastmod>2020-01-01</lastmod></url></urlset>\n`,
    );
    const catalog = { source: "test", movieIds: [], tvIds: [], personIds: [] };
    const liveIndex =
      `<sitemapindex><sitemap><loc>https://flashmovies.xyz/sitemaps/static.xml</loc><lastmod>2026-04-04</lastmod></sitemap></sitemapindex>`;
    const liveStatic =
      `<urlset><url><loc>https://flashmovies.xyz/</loc><lastmod>2026-04-04</lastmod></url></urlset>`;

    try {
      await generateSitemapIndex({
        webRoot: root,
        log: silent,
        today: "2026-10-26",
        catalog,
        fetchLive: true,
        fetchImpl: async (url) => {
          if (url.endsWith("/sitemap.xml")) return new Response(liveIndex);
          if (url.endsWith("/sitemaps/static.xml")) return new Response(liveStatic);
          throw new Error(`unexpected ${url}`);
        },
      });
      const fromLive = readFileSync(path.join(root, "public", "sitemaps", "static.xml"), "utf8");
      assert.match(fromLive, /<loc>https:\/\/flashmovies\.xyz\/<\/loc>\s*<lastmod>2026-04-04<\/lastmod>/);
      assert.equal(fromLive.includes("2020-01-01"), false);

      writeFileSync(
        path.join(sitemaps, "static.xml"),
        `<urlset><url><loc>https://flashmovies.xyz/</loc><lastmod>2020-01-01</lastmod></url></urlset>\n`,
      );
      const logs = [];
      await generateSitemapIndex({
        webRoot: root,
        log: (message) => logs.push(message),
        today: "2026-10-26",
        catalog,
        fetchLive: true,
        fetchImpl: async () => {
          throw new Error("network down");
        },
      });
      const fromDisk = readFileSync(path.join(root, "public", "sitemaps", "static.xml"), "utf8");
      assert.match(fromDisk, /<loc>https:\/\/flashmovies\.xyz\/<\/loc>\s*<lastmod>2020-01-01<\/lastmod>/);
      assert.match(logs.join("\n"), /unavailable/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

function indexLocs(xml) {
  return [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((match) => match[1]).sort();
}
