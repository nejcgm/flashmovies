import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ProGuard } from '../../../common/guards/pro.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/authenticated-user.interface';
import { AddWatchlistItemDto } from '../dto/add-watchlist-item.dto';
import { ListWatchlistDto } from '../dto/list-watchlist.dto';
import {
  mapRemoveWatchlistResponse,
  mapWatchlistItem,
  mapWatchlistList,
} from '../mappers/watchlist.mappers';
import { WatchlistService } from '../services/watchlist.service';

@Controller('public/watchlist')
@UseGuards(JwtAuthGuard, ProGuard)
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Get()
  async list(@CurrentUser() user: AuthenticatedUser, @Query() query: ListWatchlistDto) {
    const result = await this.watchlistService.list(user.id, query);
    return mapWatchlistList(result.items, result.type);
  }

  @Post()
  async add(@CurrentUser() user: AuthenticatedUser, @Body() dto: AddWatchlistItemDto) {
    const item = await this.watchlistService.add(user.id, dto);
    return mapWatchlistItem(item);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseIntPipe) id: number) {
    const item = await this.watchlistService.remove(user.id, id);
    return mapRemoveWatchlistResponse(item);
  }
}
