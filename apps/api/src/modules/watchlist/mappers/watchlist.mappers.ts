import { WatchlistItemRow } from '../interfaces/watchlist.interfaces';

export function mapWatchlistItem(row: WatchlistItemRow) {
  const addedAt =
    row.added_at instanceof Date
      ? row.added_at.toISOString()
      : String(row.added_at);

  return {
    id: row.id,
    tmdbId: row.tmdb_id,
    mediaType: row.media_type,
    addedAt,
  };
}

export function mapWatchlistList(items: WatchlistItemRow[], type: string) {
  return {
    items: items.map(mapWatchlistItem),
    total: items.length,
    type,
  };
}

export function mapRemoveWatchlistResponse(item: WatchlistItemRow) {
  return {
    message: 'Removed from watchlist',
    item: mapWatchlistItem(item),
  };
}
