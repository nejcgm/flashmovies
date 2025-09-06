export enum MediaType {
  Movie = "movie",
  TV = "tv",
  Person = "person",
}

export interface Genre {
  name: string;
  id: number;
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
  genres: [];
}
