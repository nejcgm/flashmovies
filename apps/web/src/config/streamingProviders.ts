import type { StreamingProvider } from "../interfaces/config/index.ts";

const SITE_PLAYER_COLOR = "F5C518";

export const STREAMING_PROVIDERS: StreamingProvider[] = [
  {
    name: "Premium",
    url: (type: string, movieId: string) => `https://atlantic.st/embed/${type}/${movieId}`,
    isEpisodeSlugPartOfSlug: true,
    priority: 3,
    description: "Ad-free, Best Quality 👑",
    isPremium: true,
  },
  {
    name: "Premium Backup",
    url: (type: string, movieId: string) => `https://fmov.my/embed/${type}/${movieId}`,
    isEpisodeSlugPartOfSlug: true,
    params: `color=${SITE_PLAYER_COLOR}`,
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
    url: (type: string, movieId: string) => `https://stellar.rip/en/watch/embed/${type}/${movieId}`,
    isEpisodeSlugPartOfSlug: true,
    episodeSlugStyle: "hyphen",
    params: `theme=${SITE_PLAYER_COLOR}&autoPlay=true`,
    priority: 3,
    description: "Best Quality 😎"
  },
  {
    name: "Server 3",
    url: (type: string, movieId: string) => `https://vixsrc.to/${type}/${movieId}`,
    isEpisodeSlugPartOfSlug: true,
    params: `primaryColor=${SITE_PLAYER_COLOR}`,
    priority: 3,
    description: "Good Overall Quality 😎"
  },
  // {
  //   name: "Server 4",
  //   url: (type: string, movieId: string) => `https://moviesapi.club/${type}/${movieId}`,
  //   isEpisodeSlugPartOfSlug: false,
  //   params: `color=EAB308`,
  //   priority: 1,
  //   description: "Good Overall 😎"
  // },
];


//add free find them on watch-v2.autoembed.app
// url: (type: string, movieId: string) => `https://fmov.my/embed/${type}/${movieId}`,
// url: (type: string, movieId: string) => `https://atlantic.st/embed/${type}/${movieId}`,
//https://vidflix.club/player
//https://web.nxsha.app/embed