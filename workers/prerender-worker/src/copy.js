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

/** @typedef {{ question: string, answer: string }} FaqItem */

/** @type {FaqItem[]} */
export const HOME_FAQ = [
  {
    question: "Is Flash Movies free?",
    answer:
      "Yes. Flash Movies is free to use — browse movies and TV shows, open title pages, and start watching online without a subscription. A Pro plan is optional for ad-free streaming and premium servers.",
  },
  {
    question: "How do I watch movies online on Flash Movies?",
    answer:
      "Pick a movie or TV show from the homepage lists or search, open its title page for details and cast, then use the watch link to stream in HD in your browser. No account is required for free viewing.",
  },
  {
    question: "Do I need to register to watch TV shows?",
    answer:
      "No registration is required to browse or watch free content on Flash Movies. You can create an account if you want to save preferences or upgrade to Pro.",
  },
  {
    question: "What can I watch on flashmovies.xyz?",
    answer:
      "Flash Movies offers popular and trending movies, TV series, genre lists, top-rated picks, new releases, and actor filmographies — all with full title pages and HD streaming links.",
  },
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
