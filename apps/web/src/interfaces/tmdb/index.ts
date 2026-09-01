import type { Episode, Genre } from "../media/index.ts";

export type TmdbMediaType = "movie" | "tv";
export type TmdbResourceType = TmdbMediaType | "person" | "discover" | "genre";

export interface TmdbPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TmdbMediaSummary {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  poster_path: string | null;
  profile_path?: string | null;
  backdrop_path?: string | null;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  birthday?: string;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  media_type?: string;
  genre_ids?: number[];
  known_for_department?: string;
  original_language?: string;
}

export interface TmdbMediaDetails extends TmdbMediaSummary {
  genres?: Genre[];
  runtime?: number;
  tagline?: string;
  biography?: string;
  homepage?: string;
  imdb_id?: string;
  original_title?: string;
  number_of_seasons?: number;
  file_path?: string;
}

export type FetchSpecificResponse = TmdbMediaDetails;

export interface TmdbGenreListResponse {
  genres: Genre[];
}

export interface TmdbCastMember {
  id: number;
  name: string;
  character?: string;
  profile_path: string | null;
  order?: number;
  file_path?: string;
}

export interface TmdbCreditsResponse {
  id: number;
  cast: TmdbCastMember[];
  crew?: TmdbCastMember[];
}

export interface TmdbPersonMovieCreditsResponse {
  id: number;
  cast: TmdbMediaSummary[];
  crew?: TmdbCastMember[];
}

export interface TmdbReviewAuthor {
  username: string;
  avatar_path: string | null;
  rating: number | null;
}

export interface TmdbReview {
  author: string;
  author_details: TmdbReviewAuthor;
  content: string;
  created_at: string;
  id: string;
  updated_at: string;
  url: string;
}

export interface TmdbReviewsResponse {
  id: number;
  page: number;
  results: TmdbReview[];
  total_pages: number;
  total_results: number;
}

export interface TmdbVideo {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
}

export interface TmdbVideosResponse {
  id: number;
  results: TmdbVideo[];
}

export interface TmdbProfileImage {
  aspect_ratio: number;
  file_path: string;
  height: number;
  iso_639_1: string | null;
  vote_average: number;
  vote_count: number;
  width: number;
}

export interface TmdbImagesResponse {
  id: number;
  profiles?: TmdbProfileImage[];
  backdrops?: TmdbProfileImage[];
  posters?: TmdbProfileImage[];
}

export interface TmdbSeasonDetails {
  id: number;
  name: string;
  overview: string;
  season_number: number;
  poster_path: string | null;
  air_date: string;
  episodes: Episode[];
}

export type TmdbFetchResult =
  | TmdbPaginatedResponse<TmdbMediaSummary>
  | TmdbMediaDetails
  | TmdbGenreListResponse
  | TmdbCreditsResponse
  | TmdbPersonMovieCreditsResponse
  | TmdbReviewsResponse
  | TmdbVideosResponse
  | TmdbImagesResponse;

export interface SearchResult {
  poster_path: string | null;
  profile_path: string | null;
  title: string;
  name: string;
  id: string;
  vote_count: number;
  popularity: number;
  release_date: string;
  first_air_date: string;
  media_type: TmdbMediaType;
}

export interface TmdbMovieSearchResult {
  id: number;
  title: string;
  poster_path: string | null;
  vote_count: number;
  popularity?: number;
  release_date: string;
}

export interface TmdbTvSearchResult {
  id: number;
  name: string;
  poster_path: string | null;
  vote_count: number;
  popularity?: number;
  first_air_date: string;
}

export interface TmdbSearchMultiResponse<T> {
  results: T[];
}
