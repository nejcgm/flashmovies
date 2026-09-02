import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  addWatchlistItem,
  listWatchlist,
  removeWatchlistItem,
} from "../client/watchlist";
import type {
  WatchlistItem,
  WatchlistMediaType,
} from "../interfaces/watchlist/index.ts";
import { watchlistKey } from "../utils/watchlistKey";
import { sortWatchlistByAddedAt } from "../utils/sortWatchlistByAddedAt";
import { useUser } from "./UserContext";

interface WatchlistContextValue {
  items: WatchlistItem[];
  isLoading: boolean;
  isReady: boolean;
  isInWatchlist: (tmdbId: number | string, mediaType: WatchlistMediaType) => boolean;
  addToWatchlist: (
    tmdbId: number,
    mediaType: WatchlistMediaType
  ) => Promise<void>;
  removeFromWatchlist: (
    tmdbId: number,
    mediaType: WatchlistMediaType
  ) => Promise<void>;
  toggleWatchlist: (
    tmdbId: number,
    mediaType: WatchlistMediaType
  ) => Promise<void>;
  refreshWatchlist: () => Promise<void>;
}

const WatchlistContext = createContext<WatchlistContextValue | undefined>(
  undefined
);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn, isPro, isLoading: userLoading } = useUser();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const refreshWatchlist = useCallback(async () => {
    if (!isLoggedIn || !isPro) {
      setItems([]);
      setIsReady(true);
      return;
    }

    setIsLoading(true);
    try {
      const data = await listWatchlist();
      setItems(sortWatchlistByAddedAt(data.items));
    } catch (error) {
      console.error("Failed to load watchlist:", error);
      setItems([]);
    } finally {
      setIsLoading(false);
      setIsReady(true);
    }
  }, [isLoggedIn, isPro]);

  useEffect(() => {
    if (userLoading) {
      return;
    }

    setIsReady(false);
    void refreshWatchlist();
  }, [userLoading, refreshWatchlist]);

  const isInWatchlist = useCallback(
    (tmdbId: number | string, mediaType: WatchlistMediaType) => {
      const key = watchlistKey(tmdbId, mediaType);
      return items.some(
        (item) => watchlistKey(item.tmdbId, item.mediaType) === key
      );
    },
    [items]
  );

  const addToWatchlist = useCallback(
    async (tmdbId: number, mediaType: WatchlistMediaType) => {
      const item = await addWatchlistItem({ tmdbId, mediaType });
      setItems((prev) => {
        const key = watchlistKey(tmdbId, mediaType);
        if (prev.some((entry) => watchlistKey(entry.tmdbId, entry.mediaType) === key)) {
          return prev;
        }
        return sortWatchlistByAddedAt([item, ...prev]);
      });
    },
    []
  );

  const removeFromWatchlist = useCallback(
    async (tmdbId: number, mediaType: WatchlistMediaType) => {
      const existing = items.find(
        (item) =>
          item.tmdbId === tmdbId && item.mediaType === mediaType
      );
      if (!existing) {
        return;
      }

      await removeWatchlistItem(existing.id);
      setItems((prev) =>
        prev.filter(
          (item) =>
            !(item.tmdbId === tmdbId && item.mediaType === mediaType)
        )
      );
    },
    [items]
  );

  const toggleWatchlist = useCallback(
    async (tmdbId: number, mediaType: WatchlistMediaType) => {
      if (isInWatchlist(tmdbId, mediaType)) {
        await removeFromWatchlist(tmdbId, mediaType);
        return;
      }
      await addToWatchlist(tmdbId, mediaType);
    },
    [addToWatchlist, isInWatchlist, removeFromWatchlist]
  );

  const value = useMemo(
    () => ({
      items,
      isLoading,
      isReady,
      isInWatchlist,
      addToWatchlist,
      removeFromWatchlist,
      toggleWatchlist,
      refreshWatchlist,
    }),
    [
      items,
      isLoading,
      isReady,
      isInWatchlist,
      addToWatchlist,
      removeFromWatchlist,
      toggleWatchlist,
      refreshWatchlist,
    ]
  );

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist(): WatchlistContextValue {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error("useWatchlist must be used within WatchlistProvider");
  }
  return context;
}
