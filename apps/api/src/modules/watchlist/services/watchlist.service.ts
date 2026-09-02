import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AddWatchlistItemDto } from '../dto/add-watchlist-item.dto';
import { ListWatchlistDto } from '../dto/list-watchlist.dto';
import { WatchlistRepository } from '../repositories/watchlist.repository';

@Injectable()
export class WatchlistService {
  private readonly logger = new Logger(WatchlistService.name);

  constructor(private readonly watchlistRepository: WatchlistRepository) {}

  async list(userId: number, query: ListWatchlistDto) {
    const type = query.type ?? 'all';
    const mediaType = type === 'all' ? undefined : type;
    const items = await this.watchlistRepository.findItems(userId, mediaType);
    return { items, type };
  }

  async add(userId: number, dto: AddWatchlistItemDto) {
    const existing = await this.watchlistRepository.findExistingItem(
      userId,
      dto.tmdbId,
      dto.mediaType,
    );

    if (existing) {
      throw new ConflictException('Item is already in your watchlist');
    }

    const item = await this.watchlistRepository.insertItem(userId, dto.tmdbId, dto.mediaType);

    await this.watchlistRepository.insertAddedEvent(
      userId,
      item.id,
      dto.tmdbId,
      dto.mediaType,
    );

    this.logger.log(
      `User ${userId} added ${dto.mediaType} ${dto.tmdbId} to watchlist`,
    );

    return item;
  }

  async remove(userId: number, itemId: number) {
    const deleted = await this.watchlistRepository.deleteItem(userId, itemId);

    if (!deleted) {
      throw new NotFoundException('Watchlist item not found');
    }

    return deleted;
  }
}
