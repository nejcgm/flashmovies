export interface StreamingProvider {
  name: string;
  url: (type: string, movieId: string) => string;
  priority: number;
  description: string;
}

export const STREAMING_PROVIDERS: StreamingProvider[] = [
  {
    name: "VidSrc Pro",
    url: (type: string, movieId: string) => `https://vidsrc.xyz/embed/${type}/${movieId}`,
    priority: 1,
    description: "Most Stable 💪"
  },
  {
    name: "MoviesAPI Club",
    url: (type: string, movieId: string) => `https://moviesapi.club/${type}/${movieId}`,
    priority: 2,
    description: "Best Quality (1080p) 🤩"
  },
  {
    name: "111Movies",
    url: (type: string, movieId: string) => `https://111movies.com/${type}/${movieId}`,
    priority: 3,
    description: "Second best quality 🤔"
  },
  {
    name: "AutoEmbed",
    url: (type: string, movieId: string) => `https://player.autoembed.cc/embed/${type}/${movieId}?autoplay=true`,
    priority: 4,
    description: "Backup 😎"
  },
  {
    name: "videasy.net test2",
    url: (type: string, movieId: string) => `https://player.videasy.net/${type}/${movieId}?color=EAB308&overlay=true&episodeSelector=true`,
    priority: 5,
    description: "Backup 😎 Test"
  },
]; 

//https://player.autoembed.cc/embed/movie/1084242?autoplay=true&download=true
//https://test.autoembed.cc/embed/movie/1084242?autoplay=true&download=true&server=1
//https://player.videasy.net/movie/299534