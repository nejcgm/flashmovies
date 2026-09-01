import axios, { AxiosResponse } from "axios";
import type { Genre } from "../interfaces/media/index.ts";
import type {
  SearchResult,
  TmdbCreditsResponse,
  TmdbFetchResult,
  TmdbGenreListResponse,
  TmdbImagesResponse,
  TmdbMediaDetails,
  TmdbMediaSummary,
  TmdbMediaType,
  TmdbMovieSearchResult,
  TmdbPaginatedResponse,
  TmdbPersonMovieCreditsResponse,
  TmdbResourceType,
  TmdbReviewsResponse,
  TmdbSearchMultiResponse,
  TmdbSeasonDetails,
  TmdbTvSearchResult,
  TmdbVideosResponse,
} from "../interfaces/tmdb/index.ts";
import { rankSearchResults } from "../utils/rankSearchResults.ts";

const apiKey: string = import.meta.env.VITE_API_KEY;

const tmdbRequestOptions = {
  method: "GET" as const,
  headers: {
    accept: "application/json",
    Authorization: apiKey,
  },
};

function buildPageQuery(page: number | string | null | undefined): string {
  const pageNum =
    page !== "" && page !== null && page !== undefined ? Number(page) : NaN;
  return Number.isFinite(pageNum) && pageNum > 0 ? `&page=${pageNum}` : "";
}

async function tmdbGet<T>(url: string): Promise<T | null> {
  const response: AxiosResponse<T> = await axios.request({
    url,
    ...tmdbRequestOptions,
  });
  return response.data ?? null;
}

export function fetchSpecific(
  type: "discover",
  media: TmdbMediaType,
  search: "" | string,
  genreList?: number[] | null,
  page?: number | string | null
): Promise<TmdbPaginatedResponse<TmdbMediaSummary> | null>;

export function fetchSpecific(
  type: "genre",
  media: TmdbMediaType | string,
  search: "/list",
  genreList?: null,
  page?: null
): Promise<TmdbGenreListResponse | null>;

export function fetchSpecific(
  type: TmdbResourceType | string | number | null,
  movieId: string | number | null,
  search: "/reviews",
  genreList?: null,
  page?: number | string | null
): Promise<TmdbReviewsResponse | null>;

export function fetchSpecific(
  type: TmdbResourceType | string | number | null,
  movieId: string | number | null,
  search: "/videos",
  genreList?: null,
  page?: number | string | null
): Promise<TmdbVideosResponse | null>;

export function fetchSpecific(
  type: TmdbResourceType | string | number | null,
  movieId: string | number | null,
  search: "/credits",
  genreList?: null,
  page?: number | string | null
): Promise<TmdbCreditsResponse | null>;

export function fetchSpecific(
  type: TmdbResourceType | string | number | null,
  movieId: string | number | null,
  search: "/images",
  genreList?: null,
  page?: number | string | null
): Promise<TmdbImagesResponse | null>;

export function fetchSpecific(
  type: TmdbResourceType | string | number | null,
  movieId: string | number | null,
  search: "/movie_credits",
  genreList?: null,
  page?: number | string | null
): Promise<TmdbPersonMovieCreditsResponse | null>;

export function fetchSpecific(
  type: TmdbResourceType | string | number | null,
  movieId: "" | null,
  search: `/${string}`,
  genreList?: null,
  page?: number | string | null
): Promise<TmdbPaginatedResponse<TmdbMediaSummary> | null>;

export function fetchSpecific(
  type: TmdbResourceType | string | number | null,
  movieId: string | number | null,
  search: "" | null,
  genreList?: null,
  page?: number | string | null
): Promise<TmdbMediaDetails | null>;

export function fetchSpecific(
  type: TmdbResourceType | string | number | null,
  movieId: string | number | null,
  search: `/${string}`,
  genreList?: null,
  page?: number | string | null
): Promise<TmdbPaginatedResponse<TmdbMediaSummary> | null>;

export async function fetchSpecific(
  type: string | number | null,
  movieId: number | string | null,
  search: string | null,
  genreList?: number[] | null,
  page?: number | string | null
): Promise<TmdbFetchResult | null> {
  const langQs = "language=en-US";
  const typeStr = String(type ?? "");
  const movieIdStr =
    movieId !== null && movieId !== undefined && String(movieId) !== ""
      ? String(movieId)
      : "";
  const searchRaw = search ?? "";
  const pageQs = buildPageQuery(page);

  if (typeStr === "discover" && movieIdStr) {
    const genresQs = genreList?.length
      ? `&with_genres=${genreList.join(",")}`
      : "";
    const discoverExtras =
      movieIdStr === "movie"
        ? "&include_adult=false&include_video=false"
        : "&include_adult=false";
    const url = `https://api.themoviedb.org/3/discover/${movieIdStr}?${langQs}${discoverExtras}${genresQs}${pageQs}&sort_by=popularity.desc`;
    return tmdbGet<TmdbPaginatedResponse<TmdbMediaSummary>>(url);
  }

  const tail = searchRaw.replace(/^\/+/, "");
  const pathSegments = [typeStr, movieIdStr];
  if (tail) pathSegments.push(tail);
  const path = pathSegments.filter(Boolean).join("/");
  const url = `https://api.themoviedb.org/3/${path}?${langQs}${pageQs}`;

  const data = await tmdbGet<TmdbFetchResult>(url);
  return data ? { ...data } : null;
}

export const fetchTrending = async (
  media: TmdbMediaType,
  timeWindow: "day" | "week" = "week",
  page: number | string | null = 1
): Promise<TmdbPaginatedResponse<TmdbMediaSummary> | null> => {
  const pageQs = buildPageQuery(page);
  const url = `https://api.themoviedb.org/3/trending/${media}/${timeWindow}?language=en-US${pageQs}`;
  return tmdbGet<TmdbPaginatedResponse<TmdbMediaSummary>>(url);
};

export const fetchThisYearHighlights = async (
  page: number | string | null = 1
): Promise<TmdbPaginatedResponse<TmdbMediaSummary> | null> => {
  const year = new Date().getFullYear();
  const pageQs = buildPageQuery(page);
  const url = `https://api.themoviedb.org/3/discover/movie?language=en-US&include_adult=false&include_video=false&primary_release_year=${year}&vote_count.gte=200&sort_by=vote_average.desc${pageQs}`;
  return tmdbGet<TmdbPaginatedResponse<TmdbMediaSummary>>(url);
};

export const fetchGenreList = async (
  media: TmdbMediaType
): Promise<Genre[]> => {
  const url = `https://api.themoviedb.org/3/genre/${media}/list?language=en-US`;
  const data = await tmdbGet<TmdbGenreListResponse>(url);
  return data?.genres ?? [];
};

export const fetchDiscoverByGenres = async (
  media: TmdbMediaType,
  genreIds: number[],
  page: number | string | null = 1
): Promise<TmdbPaginatedResponse<TmdbMediaSummary> | null> => {
  const pageQs = buildPageQuery(page);
  const genresQs = genreIds.length ? `&with_genres=${genreIds.join(",")}` : "";
  const movieExtras =
    media === "movie"
      ? "&include_adult=false&include_video=false"
      : "&include_adult=false";
  const url = `https://api.themoviedb.org/3/discover/${media}?language=en-US${movieExtras}${genresQs}&sort_by=popularity.desc${pageQs}`;
  return tmdbGet<TmdbPaginatedResponse<TmdbMediaSummary>>(url);
};

export const fetchSpecificSeason = async (
  type: TmdbMediaType | string,
  movieId: number | string,
  season: number | string
): Promise<TmdbSeasonDetails | null> => {
  const url = `https://api.themoviedb.org/3/${type}/${movieId}/season/${season}?language=en-US`;
  return tmdbGet<TmdbSeasonDetails>(url);
};

function toSearchResultMovie(r: TmdbMovieSearchResult): SearchResult {
  return {
    poster_path: r.poster_path,
    profile_path: null,
    title: r.title ?? "",
    name: "",
    id: String(r.id),
    vote_count: r.vote_count ?? 0,
    popularity: r.popularity ?? 0,
    release_date: r.release_date ?? "",
    first_air_date: "",
    media_type: "movie",
  };
}

function toSearchResultTv(r: TmdbTvSearchResult): SearchResult {
  return {
    poster_path: r.poster_path,
    profile_path: null,
    title: "",
    name: r.name ?? "",
    id: String(r.id),
    vote_count: r.vote_count ?? 0,
    popularity: r.popularity ?? 0,
    release_date: "",
    first_air_date: r.first_air_date ?? "",
    media_type: "tv",
  };
}

function filterLowSignalSearchResults(results: SearchResult[]): SearchResult[] {
  const filtered = results.filter((r) => {
    const hasArt = Boolean(r.poster_path || r.profile_path);
    if (hasArt) return true;
    const votes = r.vote_count ?? 0;
    const pop = r.popularity ?? 0;
    return votes >= 25 || pop >= 1.2;
  });
  if (filtered.length > 0) return filtered;
  return results;
}

export const fetchSearch = async (query: string): Promise<SearchResult[]> => {
  const q = query.trim();
  if (!q) {
    return [];
  }

  const searchQuery = `query=${encodeURIComponent(
    q
  )}&include_adult=false&language=en-US&page=1`;
  const movieUrl = `https://api.themoviedb.org/3/search/movie?${searchQuery}`;
  const tvUrl = `https://api.themoviedb.org/3/search/tv?${searchQuery}`;

  const [movieResponse, tvResponse] = await Promise.all([
    axios
      .request<TmdbSearchMultiResponse<TmdbMovieSearchResult>>({
        url: movieUrl,
        ...tmdbRequestOptions,
      })
      .catch(() => ({ data: { results: [] as TmdbMovieSearchResult[] } })),
    axios
      .request<TmdbSearchMultiResponse<TmdbTvSearchResult>>({
        url: tvUrl,
        ...tmdbRequestOptions,
      })
      .catch(() => ({ data: { results: [] as TmdbTvSearchResult[] } })),
  ]);

  const movies = (movieResponse.data.results || []).map(toSearchResultMovie);
  const shows = (tvResponse.data.results || []).map(toSearchResultTv);
  const merged = [...movies, ...shows];

  const ranked = rankSearchResults(q, merged);
  return filterLowSignalSearchResults(ranked);
};
