import axios, { AxiosResponse } from "axios";
import { DataInfoProps } from "./Interfaces.ts";
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
  const url = `https://api.themoviedb.org/3/${type}/${movieId}${search}?language=en-US${
    genreList ? `&with_genres=${genreList.join(",")}` : ""
  }${page ? `&page=${page}&sort_by=popularity.desc` : ""}`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: apiKey,
    },
  };

  const response: AxiosResponse<FetchSpecificResponse> = await axios.request({
    url,
    ...options,
  });

  if (response && response.data) {
    const fetchedInfo = { ...response.data };
    return fetchedInfo;
  }
  return null;
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

export interface SearchResult {
  poster_path: string;
  profile_path: string;
  title: string;
  name: string;
  id: string;
  vote_count: number;
  release_date: string;
  first_air_date: string;
  media_type: string;
}

export const fetchSearch = async (query: string): Promise<SearchResult[]> => {
  const url = `https://api.themoviedb.org/3/search/multi?query=${query}&include_adult=false&language=en-US&page=1`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: apiKey,
    },
  };
  const response: AxiosResponse<{ results: SearchResult[] }> =
    await axios.request({ url, ...options });

  if (response && response.data) {
    const fetchedSearch = response.data.results || [];
    return fetchedSearch;
  }
  return [];
};
