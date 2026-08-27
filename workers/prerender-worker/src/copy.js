export const SITE_NAME = "Flash Movies";
export const DEFAULT_IMAGE_PATH = "/flash-movies-logo.png";

export const HOME_TITLE = "Flash Movies — Movie and TV Discovery Catalog";
export const HOME_DESCRIPTION =
  "Flash Movies is a movie and TV discovery catalog. Browse films, series, and people — titles, details, cast, and similar works in one place.";

export const HOME_BODY = [
  "Flash Movies (flashmovies.xyz) is a catalog for discovering movies, TV shows, and people.",
  "Explore popular and trending titles, read overviews, and browse cast and similar works. This site is a discovery catalog — it does not host or play full movies.",
];

const STREAMING_CLAIM_RE =
  /free movie streaming|watch latest movies in hd for free|stream the latest movies|watch free movies and tv shows online/i;

/**
 * Guardrail so homepage/generic copy cannot regress into streaming claims.
 * @param {string} text
 */
export function assertsCatalogCopy(text) {
  if (STREAMING_CLAIM_RE.test(text)) {
    throw new Error("Crawler copy must not imply free HD movie streaming");
  }
  return text;
}
