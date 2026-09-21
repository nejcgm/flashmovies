export const POPULAR_TITLES = [
  { id: 860508, type: "movie" as const, text: "The Whisper Man" },
  { id: 969681, type: "movie" as const, text: "Spider-Man: Brand New Day" },
  { id: 1368337, type: "movie" as const, text: "The Odyssey" },
  { id: 1386315, type: "movie" as const, text: "The Runner" },
];

export function popularTitlePath(item: (typeof POPULAR_TITLES)[number]): string {
  return `/movie-info?type=${item.type}&id=${item.id}`;
}
