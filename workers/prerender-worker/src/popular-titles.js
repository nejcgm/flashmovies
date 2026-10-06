/**
 * Durable homepage chrome links to /movie-info URLs that should not depend on
 * ephemeral TMDB carousel contents.
 */
export const POPULAR_TITLES = [
  { id: 860508, type: "movie", text: "The Whisper Man" },
  { id: 969681, type: "movie", text: "Spider-Man: Brand New Day" },
  { id: 1368337, type: "movie", text: "The Odyssey" },
  { id: 1386315, type: "movie", text: "The Runner" },
];

export function popularTitleLinks() {
  return POPULAR_TITLES.map(({ id, type, text }) => ({
    href: `/movie-info?type=${type}&id=${id}`,
    text,
  }));
}

export function popularTitlesSection() {
  return {
    title: "Popular titles",
    links: popularTitleLinks(),
  };
}
