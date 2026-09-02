import { Type } from 'class-transformer';
import { IsIn, IsInt, Min } from 'class-validator';

export class AddWatchlistItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  tmdbId!: number;

  @IsIn(['movie', 'tv'])
  mediaType!: 'movie' | 'tv';
}
