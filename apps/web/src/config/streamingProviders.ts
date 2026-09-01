import type { StreamingProvider } from "../interfaces/config/index.ts";

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
  {
    name: "Server 1",
    url: (type: string, movieId: string) => `https://vsembed.ru/embed/${type}/${movieId}`,
    isEpisodeSlugPartOfSlug: false,
    params: `autonext=1`,
    priority: 2,
    description: "Most Stable 💪"
  },
  {
    name: "Server 2",
    url: (type: string, movieId: string) => `https://player.videasy.net/${type}/${movieId}`,
    isEpisodeSlugPartOfSlug: true,
    params: `color=EAB308&overlay=true&episodeSelector=true`,
    priority: 3,
    description: "Best Quality 😎"
  },
  {
    name: "Server 3",
    url: (type: string, movieId: string) => `https://111movies.com/${type}/${movieId}`,
    isEpisodeSlugPartOfSlug: true,
    params: `color=EAB308`,
    priority: 3,
    description: "Good Overall Quality 😎"
  },
  {
    name: "Server 4",
    url: (type: string, movieId: string) => `https://moviesapi.club/${type}/${movieId}`,
    isEpisodeSlugPartOfSlug: false,
    params: `color=EAB308`,
    priority: 1,
    description: "Good Overall 😎"
  },
];
