import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import popularTitleEntries from "../src/popular-titles.json" with { type: "json" };
import { popularTitleLinks, popularTitlesSection, POPULAR_TITLES } from "../src/popular-titles.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const REFRESHED_IDS = [1423191, 969681, 1101383, 1339713, 1248832, 1368337];
const REFRESHED_TITLES = [
  "Resident Evil",
  "Spider-Man: Brand New Day",
  "The End of Oak Street",
  "Obsession",
  "Digger",
  "The Odyssey",
];

describe("popular titles chrome", () => {
  it("reads the monthly JSON config (id, type, title)", () => {
    assert.deepEqual(
      popularTitleEntries.map((item) => item.id),
      REFRESHED_IDS,
    );
    assert.deepEqual(
      popularTitleEntries.map((item) => item.type),
      ["movie", "movie", "movie", "movie", "movie", "movie"],
    );
    assert.deepEqual(
      popularTitleEntries.map((item) => item.title),
      REFRESHED_TITLES,
    );
    assert.deepEqual(
      POPULAR_TITLES.map((item) => ({ id: item.id, type: item.type, text: item.text })),
      popularTitleEntries.map(({ id, type, title }) => ({ id, type, text: title })),
    );
  });

  it("links the movie-info URLs with plain title labels", () => {
    const links = popularTitleLinks();
    assert.equal(links.length, REFRESHED_IDS.length);
    assert.deepEqual(
      links.map((link) => link.href),
      REFRESHED_IDS.map((id) => `/movie-info?type=movie&id=${id}`),
    );
    assert.deepEqual(
      links.map((link) => link.text),
      REFRESHED_TITLES,
    );
    for (const link of links) {
      assert.doesNotMatch(link.text, /discover|watch free|stream online/i);
    }
    const section = popularTitlesSection();
    assert.equal(section.title, "Popular titles");
    assert.deepEqual(section.links, links);
  });

  it("bumps the worker cache key with the title refresh", () => {
    const toml = readFileSync(join(__dirname, "../wrangler.toml"), "utf8");
    assert.match(toml, /^CACHE_KEY_VERSION = "7"$/m);
  });
});
