/**
 * Crawler-only homepage chrome links to /movie-info URLs.
 * Edit src/popular-titles.json monthly (id, type, title). Titles are the
 * TMDB display title stored in that file — title, else name, else
 * original_title — or the title already stored for an id that stays.
 * They are not loaded from TMDB on each request.
 */
import popularTitleEntries from "./popular-titles.json" with { type: "json" };

export const POPULAR_TITLES = popularTitleEntries.map(({ id, type, title }) => ({
  id,
  type,
  text: title,
}));

export function popularTitleLinks() {
  return POPULAR_TITLES.map(({ id, type, text }) => ({
    href: `/movie-info?type=${type}&id=${id}`,
    text,
  }));
}

export function popularTitlesSection() {
  return {
    title: "Popular titles",
    links: popularTitleLinks(),
  };
}
