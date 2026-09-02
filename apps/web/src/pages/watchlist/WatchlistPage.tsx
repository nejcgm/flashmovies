import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fetchSpecific } from "../../client/tmdb";
import { BackButton, Spinner } from "../../components";
import { MovieCard } from "../../components/carousels/classic-carousel";
import { Meta } from "../../SEO";
import { useUser } from "../../context/UserContext";
import { useProUpsell } from "../../context/ProUpsellContext";
import { useWatchlist } from "../../context/WatchlistContext";
import type { TmdbMediaDetails } from "../../interfaces/tmdb/index.ts";
import type { WatchlistItem } from "../../interfaces/watchlist/index.ts";
import type { WatchlistFilterType } from "../../interfaces/watchlist/index.ts";
import { mediaDisplayTitle } from "../../utils/mediaDisplayTitle";
import { watchlistKey } from "../../utils/watchlistKey";
import { sortWatchlistByAddedAt } from "../../utils/sortWatchlistByAddedAt";

interface EnrichedWatchlistItem {
  watchlistItem: WatchlistItem;
  details: TmdbMediaDetails | null;
}

const FILTER_OPTIONS: Array<{ value: WatchlistFilterType; label: string }> = [
  { value: "all", label: "All" },
  { value: "movie", label: "Movies" },
  { value: "tv", label: "TV Shows" },
];

export function WatchlistPage() {
  const { isLoggedIn, isPro, isLoading: userLoading } = useUser();
  const { openProUpsell } = useProUpsell();
  const { items, isLoading: watchlistLoading, isReady } = useWatchlist();
  const [filterType, setFilterType] = useState<WatchlistFilterType>("all");
  const [enrichedItems, setEnrichedItems] = useState<EnrichedWatchlistItem[]>(
    []
  );
  const [detailsLoading, setDetailsLoading] = useState(false);
  const enrichedRef = useRef(enrichedItems);
  enrichedRef.current = enrichedItems;

  useEffect(() => {
    if (!userLoading && !isLoggedIn) {
      openProUpsell("watchlist");
    }
  }, [userLoading, isLoggedIn, openProUpsell]);

  useEffect(() => {
    if (!isReady || !isPro) {
      setEnrichedItems([]);
      return;
    }

    if (items.length === 0) {
      setEnrichedItems([]);
      return;
    }

    let cancelled = false;
    const orderedItems = sortWatchlistByAddedAt(items);
    const itemIds = new Set(orderedItems.map((item) => item.id));
    const previous = enrichedRef.current;
    const pruned = previous.filter((entry) =>
      itemIds.has(entry.watchlistItem.id)
    );
    const existingIds = new Set(pruned.map((entry) => entry.watchlistItem.id));
    const missing = orderedItems.filter((item) => !existingIds.has(item.id));

    if (pruned.length !== previous.length) {
      setEnrichedItems(pruned);
    }

    if (missing.length === 0) {
      return () => {
        cancelled = true;
      };
    }

    const isInitialLoad = pruned.length === 0;

    void (async () => {
      if (isInitialLoad) {
        setDetailsLoading(true);
      }

      try {
        const fetched = await Promise.all(
          missing.map(async (item) => ({
            watchlistItem: item,
            details: await fetchSpecific(item.mediaType, item.tmdbId, null),
          }))
        );

        if (cancelled) {
          return;
        }

        setEnrichedItems((current) => {
          const currentIds = new Set(
            current.map((entry) => entry.watchlistItem.id)
          );
          const merged = [
            ...current,
            ...fetched.filter(
              (entry) => !currentIds.has(entry.watchlistItem.id)
            ),
          ];
          return merged.sort(
            (a, b) =>
              new Date(b.watchlistItem.addedAt).getTime() -
              new Date(a.watchlistItem.addedAt).getTime()
          );
        });
      } finally {
        if (!cancelled && isInitialLoad) {
          setDetailsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [items, isPro, isReady]);

  const sortedItems = useMemo(
    () =>
      [...enrichedItems].sort(
        (a, b) =>
          new Date(b.watchlistItem.addedAt).getTime() -
          new Date(a.watchlistItem.addedAt).getTime()
      ),
    [enrichedItems]
  );

  const filteredItems = useMemo(() => {
    if (filterType === "all") {
      return sortedItems;
    }
    return sortedItems.filter(
      ({ watchlistItem }) => watchlistItem.mediaType === filterType
    );
  }, [filterType, sortedItems]);

  const filterCounts = useMemo(
    () => ({
      all: sortedItems.length,
      movie: sortedItems.filter(
        ({ watchlistItem }) => watchlistItem.mediaType === "movie"
      ).length,
      tv: sortedItems.filter(
        ({ watchlistItem }) => watchlistItem.mediaType === "tv"
      ).length,
    }),
    [sortedItems]
  );

  const emptyFilterLabel =
    filterType === "movie"
      ? "No movies in your watchlist"
      : filterType === "tv"
        ? "No TV shows in your watchlist"
        : "Your watchlist is empty";

  const pageLoading =
    userLoading ||
    watchlistLoading ||
    (isPro &&
      detailsLoading &&
      enrichedItems.length === 0 &&
      items.length > 0);

  if (userLoading || (!isLoggedIn && !userLoading)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <Meta
        title="My Watchlist - Flash Movies"
        description="Your saved movies and TV shows on Flash Movies."
        url={`${window.location.origin}/watchlist`}
        keywords={["watchlist", "saved movies", "flash movies", "flashmovies"]}
        type="website"
      />

      <div className="mx-auto flex w-full max-w-[1250px] flex-col gap-6 px-4 py-6 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <BackButton />
          <h1 className="font-roboto text-2xl font-bold text-white sm:text-3xl">
            My Watchlist
          </h1>
        </div>

        {!isPro ? (
          <div className="rounded-xl border border-[#F5C518]/30 bg-[#1A1A1A] p-6 text-center">
            <h2 className="text-xl font-semibold text-white">
              Watchlist is a Pro feature
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Save movies and TV shows to watch later with a one-time Pro upgrade.
            </p>
            <Link
              to="/payments/plans"
              className="mt-5 inline-block rounded-lg bg-[#F5C518] px-5 py-2.5 font-semibold text-black transition-colors hover:bg-yellow-600"
            >
              Get Pro
            </Link>
          </div>
        ) : pageLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Spinner />
          </div>
        ) : sortedItems.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[#1A1A1A] p-8 text-center">
            <p className="text-lg font-medium text-white">
              Your watchlist is empty
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Tap the heart on any movie or show card to save it here.
            </p>
            <Link
              to="/"
              className="mt-5 inline-block text-[#F5C518] hover:underline"
            >
              Browse titles
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <aside className="shrink-0 lg:w-52">
              <p className="mb-3 font-roboto text-xs lg:text-sm font-semibold uppercase tracking-wide text-gray-500">
                Filter
              </p>
              <nav className="flex flex-row flex-wrap gap-2 lg:flex-col">
                {FILTER_OPTIONS.map(({ value, label }) => {
                  const active = filterType === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFilterType(value)}
                      className={`gap-2 flex min-w-[88px] items-center justify-between rounded-lg px-3 py-2.5 font-roboto text-sm transition-colors lg:w-full ${
                        active
                          ? "bg-[#F5C518] font-semibold text-black"
                          : "bg-[#1A1A1A] text-white hover:bg-[#2A2A2A]"
                      }`}
                    >
                      <span className="font-medium">{label}</span>
                      <span
                        className={`tabular-nums text-xs ${
                          active ? "text-black/70" : "text-gray-500"
                        }`}
                      >
                        {filterCounts[value]}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            <div className="min-w-0 flex-1">
              {filteredItems.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-[#1A1A1A] p-8 text-center">
                  <p className="text-lg font-medium text-white">
                    {emptyFilterLabel}
                  </p>
                  {filterType !== "all" ? (
                    <button
                      type="button"
                      onClick={() => setFilterType("all")}
                      className="mt-4 text-sm text-[#F5C518] hover:underline"
                    >
                      Show all saved titles
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {filteredItems.map(({ watchlistItem, details }) => {
                    const key = watchlistKey(
                      watchlistItem.tmdbId,
                      watchlistItem.mediaType
                    );
                    const title = details
                      ? mediaDisplayTitle(details)
                      : `Title #${watchlistItem.tmdbId}`;

                    return (
                      <div
                        key={key}
                        className="w-[152px] shrink-0 md:w-[180px] xl:w-[200px]"
                      >
                        <MovieCard
                          title={title}
                          image={details?.poster_path ?? ""}
                          rating={details?.vote_average ?? 0}
                          movieId={String(watchlistItem.tmdbId)}
                          type={watchlistItem.mediaType}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
