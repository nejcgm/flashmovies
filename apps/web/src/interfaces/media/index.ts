export enum MediaType {
  Movie = "movie",
  TV = "tv",
  Person = "person",
}

export interface Genre {
  name: string;
  id: number;
}

export interface MediaListItem {
  id: number | string;
  title?: string;
  name?: string;
  original_title?: string;
  poster_path?: string | null;
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

export interface ActorListItem {
  id: number | string;
  name: string;
  profile_path?: string | null;
  file_path?: string;
  popularity?: number;
  known_for_department?: string;
}

export interface DataInfoProps {
  id: string;
  title: string;
  name: string;
  release_date: string;
  first_air_date: string;
  birthday: string;
  runtime: number;
  original_language: string;
  known_for_department: string;
  vote_count: number;
  vote_average: number;
  popularity: number;
  poster_path: string;
  profile_path: string;
  backdrop_path: string;
  overview: string;
  biography: string;
  tagline: string;
  homepage: string;
  imdb_id: string;
  original_title: string;
  file_path: string;
  media_type: string;
  genres: Genre[];
  number_of_seasons: number;
}

export interface Episode {
  id: number;
  name: string;
  episode_number: number;
  season_number: number;
  overview: string;
  air_date: string;
}
