import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../../../config/database.module';
import { WatchlistItemRow } from '../interfaces/watchlist.interfaces';

@Injectable()
export class WatchlistRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findItems(userId: number, mediaType?: string): Promise<WatchlistItemRow[]> {
    const params: Array<number | string> = [userId];
    const filters = ['user_id = $1'];

    if (mediaType) {
      params.push(mediaType);
      filters.push(`media_type = $${params.length}`);
    }

    const result = await this.pool.query<WatchlistItemRow>(
      `SELECT id, tmdb_id, media_type, added_at
       FROM watchlist_items
       WHERE ${filters.join(' AND ')}
       ORDER BY added_at DESC`,
      params,
    );
    return result.rows;
  }

  async findExistingItem(userId: number, tmdbId: number, mediaType: string): Promise<{ id: number } | null> {
    const result = await this.pool.query<{ id: number }>(
      `SELECT id
       FROM watchlist_items
       WHERE user_id = $1 AND tmdb_id = $2 AND media_type = $3`,
      [userId, tmdbId, mediaType],
    );
    return result.rows[0] ?? null;
  }

  async insertItem(userId: number, tmdbId: number, mediaType: string): Promise<WatchlistItemRow> {
    const result = await this.pool.query<WatchlistItemRow>(
      `INSERT INTO watchlist_items (user_id, tmdb_id, media_type)
       VALUES ($1, $2, $3)
       RETURNING id, tmdb_id, media_type, added_at`,
      [userId, tmdbId, mediaType],
    );
    return result.rows[0];
  }

  async insertAddedEvent(
    userId: number,
    watchlistItemId: number,
    tmdbId: number,
    mediaType: string,
  ): Promise<void> {
    await this.pool.query(
      `INSERT INTO watchlist_events (user_id, watchlist_item_id, tmdb_id, media_type, action)
       VALUES ($1, $2, $3, $4, 'added')`,
      [userId, watchlistItemId, tmdbId, mediaType],
    );
  }

  async deleteItem(userId: number, itemId: number): Promise<WatchlistItemRow | null> {
    const result = await this.pool.query<WatchlistItemRow>(
      `DELETE FROM watchlist_items
       WHERE id = $1 AND user_id = $2
       RETURNING id, tmdb_id, media_type, added_at`,
      [itemId, userId],
    );
    return result.rows[0] ?? null;
  }
}
