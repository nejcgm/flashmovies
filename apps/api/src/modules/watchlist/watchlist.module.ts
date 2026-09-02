import { Module } from '@nestjs/common';
import { ProGuard } from '../../common/guards/pro.guard';
import { UsersModule } from '../users/users.module';
import { WatchlistController } from './controllers/watchlist.controller';
import { WatchlistRepository } from './repositories/watchlist.repository';
import { WatchlistService } from './services/watchlist.service';

@Module({
  imports: [UsersModule],
  providers: [WatchlistRepository, WatchlistService, ProGuard],
  controllers: [WatchlistController],
})
export class WatchlistModule {}
