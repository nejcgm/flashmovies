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
    priority: 4,
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
    url: (type: string, movieId: string) => `https://autoembed.co/${type}/tmdb/${movieId}`,
    priority: 2,
    description: "Backup 😎"
  }
]; 