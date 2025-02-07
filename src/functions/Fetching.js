import axios from "axios";
const apiKey = import.meta.env.VITE_API_KEY;

export const fetchSpecific = async (type, movieId, search, genreList, page) => {
  const url = `https://api.themoviedb.org/3/${type}/${movieId}${search}?language=en-US${
    genreList && `&with_genres=${genreList.join(",")}`
  }${page && `&page=${page}&sort_by=popularity.desc`}`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: apiKey,
    },
  };

  const response = await axios.request({ url, ...options });

  if (response && response.data) {
    const fetchedInfo = { ...response.data };
    return fetchedInfo;
  }
  return null;
};

export const fetchSearch = async (query) => {
  const url = `https://api.themoviedb.org/3/search/multi?query=${query}&include_adult=false&language=en-US&page=1`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: apiKey,
    },
  };
  const response = await axios.request({ url, ...options });

  if (response && response.data) {
    const fetchedSearch = response.data.results || [];
    return fetchedSearch;
  }
  return [];
};
