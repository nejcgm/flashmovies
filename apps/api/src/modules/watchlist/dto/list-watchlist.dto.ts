import { IsIn, IsOptional } from 'class-validator';

export class ListWatchlistDto {
  @IsOptional()
  @IsIn(['all', 'movie', 'tv'])
  type?: 'all' | 'movie' | 'tv' = 'all';
}
