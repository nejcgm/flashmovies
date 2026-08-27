export const SITE_NAME = "Flash Movies";
export const DEFAULT_IMAGE_PATH = "/flash-movies-logo.png";

/** Reusable one-liner for static / fallback crawler pages. */
export const SITE_TAGLINE =
  "Flash Movies is a free movie and TV website — watch films and series online in HD with no subscription.";

export const HOME_TITLE = "Flash Movies — Watch Free Movies & TV Shows Online";
export const HOME_DESCRIPTION =
  "Watch free movies and TV shows online in HD on Flash Movies. Stream popular films, trending series, and new releases at no cost.";

export const HOME_BODY = [
  "Flash Movies (flashmovies.xyz) is a free movie and TV streaming website.",
  "Watch movies and TV shows online in HD — browse popular and trending titles, explore details and cast, and start watching with no subscription required.",
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

/** @deprecated Use assertsSiteCopy */
export const assertsCatalogCopy = assertsSiteCopy;
