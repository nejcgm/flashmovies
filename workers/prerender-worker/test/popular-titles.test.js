import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { popularTitleLinks, popularTitlesSection, POPULAR_TITLES } from "../src/popular-titles.js";

describe("popular titles chrome", () => {
  it("links the four movie-info URLs with plain title labels", () => {
    assert.deepEqual(
      POPULAR_TITLES.map((item) => item.id),
      [860508, 969681, 1368337, 1386315],
    );
    const links = popularTitleLinks();
    assert.equal(links.length, 4);
    assert.deepEqual(
      links.map((link) => link.href),
      [
        "/movie-info?type=movie&id=860508",
        "/movie-info?type=movie&id=969681",
        "/movie-info?type=movie&id=1368337",
        "/movie-info?type=movie&id=1386315",
      ],
    );
    assert.deepEqual(
      links.map((link) => link.text),
      ["The Whisper Man", "Spider-Man: Brand New Day", "The Odyssey", "The Runner"],
    );
    for (const link of links) {
      assert.doesNotMatch(link.text, /discover|watch free|stream online/i);
    }
    const section = popularTitlesSection();
    assert.equal(section.title, "Popular titles");
  });
});
