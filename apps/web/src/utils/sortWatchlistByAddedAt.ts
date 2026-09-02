import type { WatchlistItem } from "../interfaces/watchlist/index.ts";

export function sortWatchlistByAddedAt(
  items: WatchlistItem[]
): WatchlistItem[] {
  return [...items].sort(
    (a, b) =>
      new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
  );
}
