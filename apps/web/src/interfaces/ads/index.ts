import type { ClickTypeEnum } from "../analytics/index.ts";

export interface ContextAdRedirectOptions {
  eventLabel: string;
  movieTitle?: string;
  movieId?: string | null;
  clickType: ClickTypeEnum;
  forceFire?: boolean;
  incrementClick: () => boolean;
  isPro?: boolean;
}
