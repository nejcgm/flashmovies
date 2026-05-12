import axios, { AxiosResponse } from "axios";
import { DataInfoProps } from "./Interfaces.ts";
import { rankSearchResults } from "./rankSearchResults.ts";
const apiKey: string = import.meta.env.VITE_API_KEY;

export interface FetchSpecificResponse extends DataInfoProps {
  id: string;
  title: string;
  results: [];
  genres: [];
  reviews: [];
  cast: [];
  profiles: [];
  episodes: [];
}

export const fetchSpecific = async (
  type: string | number | null,
  movieId: number | string | null,
  search: string | null,
  genreList?: number[] | null,
  page?: number | string | null
): Promise<FetchSpecificResponse | null> => {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: apiKey,
    },
  };

  const langQs = "language=en-US";
  const typeStr = String(type ?? "");
  const movieIdStr =
    movieId !== null && movieId !== undefined && String(movieId) !== ""
      ? String(movieId)
      : "";
  const searchRaw = search ?? "";
  const pageNum =
    page !== "" && page !== null && page !== undefined ? Number(page) : NaN;
  const pageQs = Number.isFinite(pageNum) && pageNum > 0 ? `&page=${pageNum}` : "";

  // Genre browse — discover/movie|tv (TMDB: include_* + sort_by documented for discover only)
  if (typeStr === "discover" && movieIdStr) {
    const genresQs = genreList?.length ? `&with_genres=${genreList.join(",")}` : "";
    const discoverExtras =
      movieIdStr === "movie"
        ? "&include_adult=false&include_video=false"
        : "&include_adult=false";
    const url = `https://api.themoviedb.org/3/discover/${movieIdStr}?${langQs}${discoverExtras}${genresQs}${pageQs}&sort_by=popularity.desc`;
    const response: AxiosResponse<FetchSpecificResponse> = await axios.request({
      url,
      ...options,
    });
    return response.data ?? null;
  }

  // Standard endpoints: /movie/popular, /tv/top_rated, /movie/{id}/reviews, etc.
  // List routes only support language + page (no sort_by — avoids overriding top_rated / airing order).
  const tail = searchRaw.replace(/^\/+/, "");
  const pathSegments = [typeStr, movieIdStr];
  if (tail) pathSegments.push(tail);
  const path = pathSegments.filter(Boolean).join("/");
  const url = `https://api.themoviedb.org/3/${path}?${langQs}${pageQs}`;

  const response: AxiosResponse<FetchSpecificResponse> = await axios.request({
    url,
    ...options,
  });

  if (response && response.data) {
    return { ...response.data };
  }
  return null;
};

const tmdbRequestOptions = {
  method: "GET" as const,
  headers: {
    accept: "application/json",
    Authorization: apiKey,
  },
};

/** TMDB /3/trending/{movie|tv}/{day|week} */
export const fetchTrending = async (
  media: "movie" | "tv",
  timeWindow: "day" | "week" = "week",
  page: number | string | null = 1
): Promise<FetchSpecificResponse | null> => {
  const pageNum =
    page !== "" && page !== null && page !== undefined ? Number(page) : NaN;
  const pageQs = Number.isFinite(pageNum) && pageNum > 0 ? `&page=${pageNum}` : "";
  const url = `https://api.themoviedb.org/3/trending/${media}/${timeWindow}?language=en-US${pageQs}`;
  const response: AxiosResponse<FetchSpecificResponse> = await axios.request({
    url,
    ...tmdbRequestOptions,
  });
  return response.data ?? null;
};

/** Highest-rated popular titles with a real vote count, current calendar year only */
export const fetchThisYearHighlights = async (
  page: number | string | null = 1
): Promise<FetchSpecificResponse | null> => {
  const year = new Date().getFullYear();
  const pageNum =
    page !== "" && page !== null && page !== undefined ? Number(page) : NaN;
  const pageQs = Number.isFinite(pageNum) && pageNum > 0 ? `&page=${pageNum}` : "";
  const url = `https://api.themoviedb.org/3/discover/movie?language=en-US&include_adult=false&include_video=false&primary_release_year=${year}&vote_count.gte=200&sort_by=vote_average.desc${pageQs}`;
  const response: AxiosResponse<FetchSpecificResponse> = await axios.request({
    url,
    ...tmdbRequestOptions,
  });
  return response.data ?? null;
};

/** Single-genre discover for movie spotlights */
export const fetchDiscoverMoviesByGenre = async (
  genreId: number,
  page: number | string | null = 1
): Promise<FetchSpecificResponse | null> => {
  const pageNum =
    page !== "" && page !== null && page !== undefined ? Number(page) : NaN;
  const pageQs = Number.isFinite(pageNum) && pageNum > 0 ? `&page=${pageNum}` : "";
  const url = `https://api.themoviedb.org/3/discover/movie?language=en-US&include_adult=false&include_video=false&with_genres=${genreId}&sort_by=popularity.desc${pageQs}`;
  const response: AxiosResponse<FetchSpecificResponse> = await axios.request({
    url,
    ...tmdbRequestOptions,
  });
  return response.data ?? null;
};

/** Single-genre discover for TV spotlights (use TV genre ids from /genre/tv/list) */
export const fetchDiscoverTvByGenre = async (
  genreId: number,
  page: number | string | null = 1
): Promise<FetchSpecificResponse | null> => {
  const pageNum =
    page !== "" && page !== null && page !== undefined ? Number(page) : NaN;
  const pageQs = Number.isFinite(pageNum) && pageNum > 0 ? `&page=${pageNum}` : "";
  const url = `https://api.themoviedb.org/3/discover/tv?language=en-US&include_adult=false&with_genres=${genreId}&sort_by=popularity.desc${pageQs}`;
  const response: AxiosResponse<FetchSpecificResponse> = await axios.request({
    url,
    ...tmdbRequestOptions,
  });
  return response.data ?? null;
};

export const fetchSpecificSeason = async (
  type: string | number | null,
  movieId: number | string | null,
  season: number | string | null
): Promise<FetchSpecificResponse | null> => {
  const url = `https://api.themoviedb.org/3/${type}/${movieId}/season/${season}?language=en-US`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: apiKey,
    },
  };
  const response: AxiosResponse<FetchSpecificResponse> = await axios.request({ url, ...options });
  return response.data;
};

/** Normalized hit for header search (movies + TV only; no people). */
export interface SearchResult {
  poster_path: string | null;
  profile_path: string | null;
  title: string;
  name: string;
  id: string;
  vote_count: number;
  /** TMDB popularity (search lists) — used for ranking only. */
  popularity: number;
  release_date: string;
  first_air_date: string;
  media_type: "movie" | "tv";
}

interface TmdbMovieSearchResult {
  id: number;
  title: string;
  poster_path: string | null;
  vote_count: number;
  popularity?: number;
  release_date: string;
}

interface TmdbTvSearchResult {
  id: number;
  name: string;
  poster_path: string | null;
  vote_count: number;
  popularity?: number;
  first_air_date: string;
}

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

/** Drop posterless rows with almost no engagement so results feel relevant. */
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

  const searchQuery = `query=${encodeURIComponent(q)}&include_adult=false&language=en-US&page=1`;
  const movieUrl = `https://api.themoviedb.org/3/search/movie?${searchQuery}`;
  const tvUrl = `https://api.themoviedb.org/3/search/tv?${searchQuery}`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: apiKey,
    },
  };

  const [movieResponse, tvResponse] = await Promise.all([
    axios
      .request<{ results: TmdbMovieSearchResult[] }>({ url: movieUrl, ...options })
      .catch(() => ({ data: { results: [] as TmdbMovieSearchResult[] } })),
    axios
      .request<{ results: TmdbTvSearchResult[] }>({ url: tvUrl, ...options })
      .catch(() => ({ data: { results: [] as TmdbTvSearchResult[] } })),
  ]);

  const movies = (movieResponse.data.results || []).map(toSearchResultMovie);
  const shows = (tvResponse.data.results || []).map(toSearchResultTv);
  const merged = [...movies, ...shows];

  const ranked = rankSearchResults(q, merged);
  return filterLowSignalSearchResults(ranked);
};
