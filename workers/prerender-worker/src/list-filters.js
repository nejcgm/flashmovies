

/**
 * @typedef {object} ListFilters
 * @property {string | null} withGenres
 * @property {string | null} primaryReleaseYear
 * @property {string | null} firstAirDateYear
 * @property {string | null} voteAverageGte
 * @property {string | null} voteAverageLte
 */

const GENRE_ID_RE = /^\d+(,\d+)*$/;
const YEAR_RE = /^(19|20)\d{2}$/;
const RATING_RE = /^(10|\d(\.\d)?)$/;

/**
 * @param {string | null | undefined} value
 * @param {RegExp} pattern
 */
function validFilterValue(value, pattern) {
  if (!value) return null;
  const trimmed = String(value).trim();
  return pattern.test(trimmed) ? trimmed : null;
}

/**
 * @param {URL} url
 * @returns {ListFilters}
 */
export function parseListFilters(url) {
  return {
    withGenres: validFilterValue(url.searchParams.get("with_genres"), GENRE_ID_RE),
    primaryReleaseYear: validFilterValue(
      url.searchParams.get("primary_release_year"),
      YEAR_RE,
    ),
    firstAirDateYear: validFilterValue(
      url.searchParams.get("first_air_date_year"),
      YEAR_RE,
    ),
    voteAverageGte: validFilterValue(url.searchParams.get("vote_average.gte"), RATING_RE),
    voteAverageLte: validFilterValue(url.searchParams.get("vote_average.lte"), RATING_RE),
  };
}

export const LIST_FILTER_PARAM_ORDER = [
  "with_genres",
  "primary_release_year",
  "first_air_date_year",
  "vote_average.gte",
  "vote_average.lte",
];

/**
 * @param {ListFilters} filters
 * @returns {string}
 */
export function discoverFilterQuery(filters) {
  const parts = [];
  if (filters.withGenres) parts.push(`with_genres=${filters.withGenres}`);
  if (filters.primaryReleaseYear) {
    parts.push(`primary_release_year=${filters.primaryReleaseYear}`);
  }
  if (filters.firstAirDateYear) {
    parts.push(`first_air_date_year=${filters.firstAirDateYear}`);
  }
  if (filters.voteAverageGte) parts.push(`vote_average.gte=${filters.voteAverageGte}`);
  if (filters.voteAverageLte) parts.push(`vote_average.lte=${filters.voteAverageLte}`);
  return parts.join("&");
}
