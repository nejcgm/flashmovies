import { resolveCatalogIdsFromExports } from "./sitemap-tmdb-export.js";

/** Same hidden title the SPA and prerender worker exclude from indexable pages. */
export const BLOCKED_MOVIE_ID = 1439112;

/** Used when VITE_API_KEY / TMDB_API_KEY is not available at build time. */
export const FALLBACK_MOVIE_IDS = [
  278, 238, 240, 424, 389, 129, 155, 19404, 497, 496243, 122, 680, 372058, 13,
  429, 157336, 346, 769, 12477, 637, 550, 11216, 667257, 14537, 598, 40096,
  120, 539, 803796, 510, 696374, 311, 121, 324857, 255709, 4935, 1891, 704264,
  378064, 770156, 423, 724089, 244786, 807, 761053, 27205, 1058694, 12493,
  567, 274, 755898, 1234821, 1195631, 1241470, 1185528, 1106289, 1087192,
  1311031, 1319895, 1285247, 1155281, 1078605, 986206, 980477, 1071585, 552524,
  1307078, 1061474, 617126, 1225572, 1011477, 1100988, 1119878, 1339166, 936108,
  541671, 1393382, 1263256, 574475, 7451, 1124619, 812455, 715253, 648878,
  1188423, 1181540, 986056, 13499, 1125257, 575265, 1452176, 1365103, 1280461,
  1315986, 911430, 1175942, 1374534, 1403735, 715287,
];

export const FALLBACK_TV_IDS = [
  1396, 94605, 219246, 209867, 246, 37854, 131378, 220542, 31911, 94954,
  60059, 60625, 87108, 92685, 1429, 46298, 85077, 70785, 42705, 1398, 85937,
  240411, 42573, 62741, 72637, 95557, 13916, 95269, 65930, 89456, 31132,
  80040, 57706, 77696, 1430, 127532, 60863, 100, 259666, 82728, 119051,
  157239, 121876, 79744, 194766, 2734, 93405, 1416, 1405, 1622, 227114,
  256911, 1399, 196890, 244808, 1434, 4614, 2288, 292035, 549, 4057, 207484,
  456, 34307, 764, 1408, 279060, 207468, 1431, 65334, 46952, 60585, 1402,
  66732, 44217, 18165, 2224,
];

export const FALLBACK_PERSON_IDS = [
  2231916, 974169, 53, 1253360, 18897, 976, 2604515, 1892, 1325949, 33022,
  1836114, 11701, 1222077, 4095744, 1879666, 115440, 1466, 1903006, 64, 29523,
  934159, 4783, 556356, 936970, 3371804, 568141, 31, 3455931, 91671, 6886,
  572043, 1397778, 8783, 2189618, 3486663, 7497, 6161, 88029, 1812, 1356210,
  11678, 30613, 27740, 77335, 14984, 1253353, 21089, 18352, 4886, 10882, 4174,
  15286, 9273, 15831, 4764, 3092, 6677, 66896, 1590797, 17605, 3136, 1030513,
  8874, 9807, 23680, 57027, 11702, 202032, 51875, 2963, 418, 1772, 59254, 501,
  4095689, 8785, 1920, 3392, 3489, 221773,
];

/**
 * @param {string | undefined} raw
 */
export function tmdbAuthorization(raw) {
  const value = String(raw || "").trim();
  if (!value) return "";
  return /^bearer\s+/i.test(value) ? value : `Bearer ${value}`;
}

/**
 * @param {number[]} lists
 */
export function mergeUniqueIds(...lists) {
  const seen = new Set();
  const merged = [];
  for (const list of lists) {
    for (const id of list) {
      if (!id || id === BLOCKED_MOVIE_ID || seen.has(id)) continue;
      seen.add(id);
      merged.push(id);
    }
  }
  return merged;
}

/**
 * @param {string} endpoint TMDB path after /3/ (e.g. movie/popular)
 * @param {object} options
 * @param {string} options.auth
 * @param {typeof fetch} [options.fetchImpl]
 * @param {number} [options.pages]
 * @param {number} [options.limit]
 */
export async function fetchTmdbIds(endpoint, { auth, fetchImpl = fetch, pages = 3, limit = 50 }) {
  const ids = [];
  for (let page = 1; page <= pages && ids.length < limit; page += 1) {
    const url = `https://api.themoviedb.org/3/${endpoint}?language=en-US&page=${page}`;
    const response = await fetchImpl(url, {
      headers: {
        accept: "application/json",
        authorization: auth,
      },
    });
    if (!response.ok) {
      throw new Error(`TMDB ${endpoint} page ${page} failed: ${response.status}`);
    }
    const data = await response.json();
    for (const item of data.results || []) {
      if (!item?.id || item.id === BLOCKED_MOVIE_ID) continue;
      if (!ids.includes(item.id)) ids.push(item.id);
      if (ids.length >= limit) break;
    }
  }
  return ids;
}

/**
 * Smaller API-based catalog when exports are unavailable.
 * @param {object} options
 * @param {string} options.auth
 * @param {typeof fetch} options.fetchImpl
 */
async function resolveCatalogIdsFromApi({ auth, fetchImpl }) {
  const [
    movieTrending,
    movieNowPlaying,
    moviePopular,
    movieTopRated,
    tvTrending,
    tvPopular,
    tvTopRated,
    peoplePopular,
  ] = await Promise.all([
    fetchTmdbIds("trending/movie/week", { auth, fetchImpl, pages: 5, limit: 100 }),
    fetchTmdbIds("movie/now_playing", { auth, fetchImpl, pages: 5, limit: 100 }),
    fetchTmdbIds("movie/popular", { auth, fetchImpl, pages: 5, limit: 100 }),
    fetchTmdbIds("movie/top_rated", { auth, fetchImpl, pages: 5, limit: 100 }),
    fetchTmdbIds("trending/tv/week", { auth, fetchImpl, pages: 5, limit: 80 }),
    fetchTmdbIds("tv/popular", { auth, fetchImpl, pages: 5, limit: 80 }),
    fetchTmdbIds("tv/top_rated", { auth, fetchImpl, pages: 5, limit: 80 }),
    fetchTmdbIds("person/popular", { auth, fetchImpl, pages: 5, limit: 100 }),
  ]);

  const movieIds = mergeUniqueIds(
    movieTrending,
    movieNowPlaying,
    moviePopular,
    movieTopRated,
  );
  const tvIds = mergeUniqueIds(tvTrending, tvPopular, tvTopRated);

  if (movieIds.length < 20 || tvIds.length < 20 || peoplePopular.length < 20) {
    throw new Error("TMDB API returned too few catalog ids");
  }

  return {
    source: "api",
    movieIds,
    tvIds,
    personIds: peoplePopular,
  };
}

/**
 * Catalog ids for detail/watch sitemaps (Phase 1).
 *
 * Priority:
 * 1. TMDB daily exports (popularity-ranked, up to tens of thousands)
 * 2. TMDB list API (hundreds of ids)
 * 3. Static fallback lists
 *
 * Set SITEMAP_USE_EXPORT=0 to skip exports.
 *
 * @param {object} [options]
 * @param {string | undefined} [options.apiKey]
 * @param {typeof fetch} [options.fetchImpl]
 * @param {boolean} [options.useExport]
 */
export async function resolveSitemapCatalogIds(options = {}) {
  const fetchImpl = options.fetchImpl || fetch;
  const useExport =
    options.useExport ??
    !["0", "false", "no"].includes(String(process.env.SITEMAP_USE_EXPORT || "1").toLowerCase());

  if (useExport) {
    try {
      return await resolveCatalogIdsFromExports({ fetchImpl });
    } catch (error) {
      console.warn("⚠️  TMDB export catalog failed — trying API lists:", error.message);
    }
  }

  const auth = tmdbAuthorization(options.apiKey || process.env.VITE_API_KEY || process.env.TMDB_API_KEY);
  if (auth) {
    try {
      return await resolveCatalogIdsFromApi({ auth, fetchImpl });
    } catch (error) {
      console.warn("⚠️  TMDB API catalog failed — using fallback ids:", error.message);
    }
  }

  return {
    source: "fallback",
    movieIds: FALLBACK_MOVIE_IDS,
    tvIds: FALLBACK_TV_IDS,
    personIds: FALLBACK_PERSON_IDS,
  };
}
