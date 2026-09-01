export interface AffiliateLink {
  name: string;
  url: string;
  bgColor: string;
  hoverColor: string;
  textColor: string;
  offer: string;
  commission: string;
}

export interface StreamingProvider {
  name: string;
  url: (type: string, movieId: string) => string;
  priority: number;
  description: string;
  isEpisodeSlugPartOfSlug: boolean;
  params?: string;
  isPremium?: boolean;
}
