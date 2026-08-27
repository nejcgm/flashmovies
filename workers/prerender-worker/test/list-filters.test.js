import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  discoverFilterQuery,
  parseListFilters,
} from "../src/list-filters.js";
import { tmdbListPath } from "../src/tmdb.js";

describe("list filters", () => {
  it("parses genre, year, and rating discover params", () => {
    const url = new URL(
      "https://flashmovies.xyz/list-items?type=movie&search=discover&with_genres=28&primary_release_year=2024&vote_average.gte=8&vote_average.lte=10&title=action-movies",
    );
    assert.deepEqual(parseListFilters(url), {
      withGenres: "28",
      primaryReleaseYear: "2024",
      firstAirDateYear: null,
      voteAverageGte: "8",
      voteAverageLte: "10",
    });
  });

  it("rejects invalid filter values", () => {
    const url = new URL(
      "https://flashmovies.xyz/list-items?type=movie&search=discover&with_genres=abc&primary_release_year=1800",
    );
    assert.deepEqual(parseListFilters(url), {
      withGenres: null,
      primaryReleaseYear: null,
      firstAirDateYear: null,
      voteAverageGte: null,
      voteAverageLte: null,
    });
  });

  it("builds TMDB discover paths with filters", () => {
    const filters = parseListFilters(
      new URL(
        "https://flashmovies.xyz/list-items?type=movie&search=discover&with_genres=28&title=action-movies",
      ),
    );
    const path = tmdbListPath("movie", "discover", filters);
    assert.match(path, /discover\/movie\?/);
    assert.match(path, /with_genres=28/);
    assert.match(path, /sort_by=popularity\.desc/);
    assert.equal(
      discoverFilterQuery(filters),
      "with_genres=28",
    );
  });

  it("supports TV year and rating discover filters", () => {
    const filters = {
      withGenres: null,
      primaryReleaseYear: null,
      firstAirDateYear: "2023",
      voteAverageGte: "7",
      voteAverageLte: "8",
    };
    const path = tmdbListPath("tv", "discover", filters);
    assert.match(path, /first_air_date_year=2023/);
    assert.match(path, /vote_average\.gte=7/);
    assert.match(path, /vote_average\.lte=8/);
  });
});
