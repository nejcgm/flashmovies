import { mediaDisplayTitle } from "./text.js";
import { isBlockedTitle } from "./routes.js";
import { fetchTmdbList } from "./tmdb.js";

/** TMDB carousels mirrored from apps/web/src/pages/Home.tsx */
export const HOME_TMDB_SECTIONS = [
  { title: "Trending movies this week", type: "movie", search: "trending_week" },
  { title: "Now playing", type: "movie", search: "now_playing" },
  { title: "Top rated movies", type: "movie", search: "top_rated" },
  { title: "Trending TV this week", type: "tv", search: "trending_week" },
  { title: "Top rated TV shows", type: "tv", search: "top_rated" },
  { title: "Popular actors", type: "person", search: "popular" },
];

/**
 * @param {object} item
 * @param {"movie" | "tv" | "person"} type
 */
function titleLink(item, type) {
  return {
    href: `/movie-info?type=${type}&id=${item.id}`,
    text: mediaDisplayTitle(item),
  };
}

/**
 * @param {string} apiKey
 * @param {typeof fetch} fetchImpl
 * @param {number} [limitPerSection]
 */
export async function fetchHomeSections(apiKey, fetchImpl = fetch, limitPerSection = 10) {
  const settled = await Promise.allSettled(
    HOME_TMDB_SECTIONS.map(async (section) => {
      const result = await fetchTmdbList(section.type, section.search, apiKey, fetchImpl);
      const results = Array.isArray(result.data?.results) ? result.data.results : [];
      const links = results
        .filter((item) => !isBlockedTitle(section.type, item.id))
        .slice(0, limitPerSection)
        .map((item) => titleLink(item, section.type));
      return { title: section.title, links };
    }),
  );

  return settled
    .filter((entry) => entry.status === "fulfilled")
    .map((entry) => entry.value)
    .filter((section) => section.links.length > 0);
}
