interface StreamingProvider {
  name: string;
  url: (type: string, movieId: string) => string;
  priority: number;
  description: string;
  isEpisodeSlugPartOfSlug: boolean;
  params?: string;
  isPremium?: boolean;
}
//one day
//https://player2.autoembed.app/embed/${type}/${movieId}

export const STREAMING_PROVIDERS: StreamingProvider[] = [
  {
    name: "Premium",
    url: (type: string, movieId: string) => `https://player.autoembed.app/embed/${type}/${movieId}`,
    isEpisodeSlugPartOfSlug: true,
    params: `color=EAB308&autoplay=true`,
    priority: 3,
    description: "Ad-free, Best Quality 👑",
    isPremium: true,
  },
  {
    name: "Premium Backup",
    url: (type: string, movieId: string) => `https://player.autoembed.app/embed/${type}/${movieId}`,
    isEpisodeSlugPartOfSlug: true,
    params: `color=EAB308&autoplay=true`,
    priority: 3,
    description: "Ad-free, Best Quality 👑",
    isPremium: true,
  },
  //vidsrc.xyz
  {
    name: "Server 1",
    url: (type: string, movieId: string) => `https://vsembed.ru/embed/${type}/${movieId}`,
    isEpisodeSlugPartOfSlug: false,
    params: `autonext=1`,
    priority: 2,
    description: "Most Stable 💪"
  },
  //videasy.net
  {
    name: "Server 2",
    url: (type: string, movieId: string) => `https://player.videasy.net/${type}/${movieId}`,
    isEpisodeSlugPartOfSlug: true,
    params: `color=EAB308&overlay=true&episodeSelector=true`,
    priority: 3,
    description: "Best Quality 😎"
  },
  //111movies.com
  {
    name: "Server 3",
    url: (type: string, movieId: string) => `https://111movies.com/${type}/${movieId}`,
    isEpisodeSlugPartOfSlug: true,
    params: `color=EAB308`,
    priority: 3,
    description: "Good Overall Quality 😎"
  },
  //moviesapi.club
  {
    name: "Server 4",
    url: (type: string, movieId: string) => `https://moviesapi.club/${type}/${movieId}`,
    isEpisodeSlugPartOfSlug: false,
    params: `color=EAB308`,
    priority: 1,
    description: "Good Overall 😎"
  },
];