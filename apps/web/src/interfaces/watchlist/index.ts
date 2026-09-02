export type WatchlistMediaType = "movie" | "tv";

export type WatchlistFilterType = "all" | WatchlistMediaType;

export interface WatchlistItem {
  id: number;
  tmdbId: number;
  mediaType: WatchlistMediaType;
  addedAt: string;
}

export interface WatchlistListResponse {
  items: WatchlistItem[];
  total: number;
  type: WatchlistFilterType;
}

export interface AddWatchlistItemData {
  tmdbId: number;
  mediaType: WatchlistMediaType;
}

export interface RemoveWatchlistResponse {
  message: string;
  item: WatchlistItem;
}
