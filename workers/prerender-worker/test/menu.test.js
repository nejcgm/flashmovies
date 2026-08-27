import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  crawlerMenuListPaths,
  crawlerMenuSections,
  highlightYear,
} from "../src/menu.js";

describe("crawler menu", () => {
  it("mirrors all SPA menu list URLs", () => {
    const fixedDate = new Date("2026-08-27T12:00:00Z");
    const sections = crawlerMenuSections(fixedDate);
    const listPaths = crawlerMenuListPaths(fixedDate);

    assert.equal(sections.length, 4);
    assert.equal(listPaths.length, 16);
    assert.equal(highlightYear(fixedDate), 2026);

    assert.ok(
      listPaths.some((link) => link.href.includes("search=trending_week") && link.href.includes("type=movie")),
    );
    assert.ok(
      listPaths.some((link) =>
        link.href.includes(`year_highlights&title=this-years-movie-highlights-2026`),
      ),
    );
    assert.ok(listPaths.some((link) => link.href.includes("search=trending_day") && link.href.includes("type=tv")));
    assert.ok(listPaths.some((link) => link.href.includes("type=person&search=popular")));
  });

  it("includes footer static pages in the site section", () => {
    const site = crawlerMenuSections().find((section) => section.title === "Site");
    assert.ok(site);
    assert.ok(site.links.some((link) => link.href === "/frequently-asked-questions"));
    assert.ok(site.links.some((link) => link.href === "/terms-and-conditions"));
  });
});
