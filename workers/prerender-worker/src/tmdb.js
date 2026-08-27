const TMDB_API = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p";

/**
 * Reuse the SPA's VITE_API_KEY pattern: the env value is either a raw
 * TMDB v4 read token or already prefixed with "Bearer ".
 * @param {string | undefined} apiKey
 */
export function tmdbAuthorization(apiKey) {
  const raw = String(apiKey || "").trim();
  if (!raw) return "";
  return /^bearer\s+/i.test(raw) ? raw : `Bearer ${raw}`;
}

/**
 * @param {string | null | undefined} path
 * @param {"w500" | "w1280" | "w185"} size
 */
export function tmdbImageUrl(path, size = "w500") {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${TMDB_IMG}/${size}${path}`;
}

/**
 * @param {string} pathAndQuery path beginning after /3/
 * @param {string} apiKey
 * @param {typeof fetch} fetchImpl
 */
export async function fetchTmdb(pathAndQuery, apiKey, fetchImpl = fetch) {
  const auth = tmdbAuthorization(apiKey);
  if (!auth) {
    throw new Error("TMDB_API_KEY is not configured");
  }
  const path = pathAndQuery.replace(/^\//, "");
  const separator = path.includes("?") ? "&" : "?";
  const url = `${TMDB_API}/${path}${separator}language=en-US`;
  return fetchImpl(url, {
    method: "GET",
    headers: {
      accept: "application/json",
      authorization: auth,
    },
  });
}

/**
 * @param {Response} response
 */
async function readJsonOrNull(response) {
  if (response.status === 404) return { status: 404, data: null };
  if (!response.ok) return { status: response.status, data: null };
  return { status: response.status, data: await response.json() };
}

/**
 * @param {"movie" | "tv" | "person"} type
 * @param {string} id
 * @param {string} apiKey
 * @param {typeof fetch} fetchImpl
 */
export async function fetchTmdbDetails(type, id, apiKey, fetchImpl = fetch) {
  const query = type === "person" ? "" : "append_to_response=credits";
  const path = query ? `${type}/${id}?${query}` : `${type}/${id}`;
  const response = await fetchTmdb(path, apiKey, fetchImpl);
  return readJsonOrNull(response);
}

/**
 * Map list-items search keys to TMDB list endpoints (same idea as
 * apps/web/src/utils/fetching.ts). Returns null when there is no cheap list.
 * @param {"movie" | "tv" | "person"} type
 * @param {string} search
 */
export function tmdbListPath(type, search) {
  if (search === "trending_week") {
    if (type === "person") return null;
    return `trending/${type}/week`;
  }
  if (search === "trending_day") {
    if (type === "person") return null;
    return `trending/${type}/day`;
  }
  if (search === "year_highlights" && type === "movie") {
    const year = new Date().getFullYear();
    return `discover/movie?include_adult=false&include_video=false&primary_release_year=${year}&vote_count.gte=200&sort_by=vote_average.desc`;
  }
  if (search === "discover") {
    const extras =
      type === "movie"
        ? "include_adult=false&include_video=false"
        : "include_adult=false";
    return `discover/${type}?${extras}&sort_by=popularity.desc`;
  }
  const allowed = new Set([
    "popular",
    "top_rated",
    "upcoming",
    "now_playing",
    "on_the_air",
    "airing_today",
  ]);
  if (allowed.has(search)) {
    return `${type}/${search}`;
  }
  return null;
}

/**
 * @param {"movie" | "tv" | "person"} type
 * @param {string} search
 * @param {string} apiKey
 * @param {typeof fetch} fetchImpl
 */
export async function fetchTmdbList(type, search, apiKey, fetchImpl = fetch) {
  const path = tmdbListPath(type, search);
  if (!path) return { status: 204, data: null };
  const joiner = path.includes("?") ? "&" : "?";
  const response = await fetchTmdb(`${path}${joiner}page=1`, apiKey, fetchImpl);
  return readJsonOrNull(response);
}
