import type { WatchlistMediaType } from "../interfaces/watchlist/index.ts";

export function watchlistKey(
  tmdbId: number | string,
  mediaType: WatchlistMediaType
): string {
  return `${mediaType}:${tmdbId}`;
}
