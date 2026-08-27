export const SITE_NAME = "Flash Movies";
export const DEFAULT_IMAGE_PATH = "/flash-movies-logo.png";

/** Reusable one-liner for static / fallback crawler pages. */
export const SITE_TAGLINE =
  "Flash Movies is a free movie and TV site — watch films and series online in HD, browse lists and genres, and open full title pages in one click.";

export const HOME_TITLE = "Flash Movies — Watch Free Movies & TV Shows Online";
export const HOME_DESCRIPTION =
  "Flash Movies (flashmovies.xyz) is a free movie and TV streaming website. Watch movies and TV shows online in HD — browse popular and trending titles, explore details and cast, and start watching with no subscription required.";

export const HOME_BODY = [
  "Flash Movies (flashmovies.xyz) is a free movie and TV streaming website.",
  "Watch movies and TV shows online in HD — browse popular and trending titles, explore details and cast, and start watching with no subscription required.",
  "Explore trending movies this week, now playing releases, top rated classics, popular TV series, and actor filmographies — all organized into simple lists and full title pages on Flash Movies.",
  "Watch movies online by genre — action, comedy, drama, horror, romance, sci-fi, animation, and more. Browse by popularity, rating, or release year, or open curated lists updated from TMDB.",
  "Stream TV shows online — trending series, on-the-air seasons, top rated picks, and genre hubs. Each show page includes an overview and links to watch episodes on flashmovies.xyz.",
  "Use the sections below to browse movies, TV, and popular actors. Find a new release, a binge-worthy series, or a classic worth watching tonight.",
];

const BLOCKED_COPY_RE = /Affiliate Site Verification/i;

/**
 * Guardrail so crawler HTML never includes the hidden affiliate stub from index.html.
 * @param {string} text
 */
export function assertsSiteCopy(text) {
  if (BLOCKED_COPY_RE.test(text)) {
    throw new Error("Crawler copy must not include affiliate verification stub text");
  }
  return text;
}
