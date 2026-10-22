export interface AffiliateLink {
  name: string;
  url: string;
  bgColor: string;
  hoverColor: string;
  textColor: string;
  offer: string;
  commission: string;
}

export type EpisodeSlugStyle = "path" | "hyphen";

export interface StreamingProvider {
  name: string;
  url: (type: string, movieId: string) => string;
  priority: number;
  description: string;
  isEpisodeSlugPartOfSlug: boolean;
  episodeSlugStyle?: EpisodeSlugStyle;
  params?: string;
  isPremium?: boolean;
  underMaintenance?: boolean;
}
