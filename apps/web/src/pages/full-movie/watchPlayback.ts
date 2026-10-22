/** Playback fields cleared together when the watch id or type changes. */
export interface WatchPlaybackReset {
  currentProviderUrl: "";
  selectedEpisode: null;
  info: undefined;
  status: "loading" | "not_found";
}

export interface WatchEpisodeRef {
  season_number: number;
  episode_number: number;
}

const WATCH_TYPES = new Set(["movie", "tv"]);
const BLOCKED_MOVIE_ID = "1439112";

export function isWatchableTitle(
  movieId: string | null,
  type: string | null,
): boolean {
  if (!movieId || !type || !WATCH_TYPES.has(type)) return false;
  return !(movieId === BLOCKED_MOVIE_ID && type === "movie");
}

/**
 * Empty stream, no leftover episode, and a non-ready status.
 * `applyProvider` then builds the new title from season 1 episode 1.
 */
export function resetWatchPlayback(watchable: boolean): WatchPlaybackReset {
  return {
    currentProviderUrl: "",
    selectedEpisode: null,
    info: undefined,
    status: watchable ? "loading" : "not_found",
  };
}

/** Season and episode written into a provider URL. A cleared selection is 1/1. */
export function seasonEpisodeForProvider(
  selectedEpisode: WatchEpisodeRef | null,
): { season: number; episode: number } {
  return {
    season: selectedEpisode?.season_number ?? 1,
    episode: selectedEpisode?.episode_number ?? 1,
  };
}
