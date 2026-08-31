import React, { useCallback, useEffect, useMemo, useState } from "react";
import Carousel from "../carousels/classic-carousel/Carousel";
import { fetchDiscoverByGenres, fetchGenreList } from "../utils/fetching.js";
import { DataInfoProps } from "../utils/Interfaces";

type GenreSpotlightMedia = "movie" | "tv";

interface GenreTab {
  id: number;
  label: string;
}

interface GenreSpotlightCarouselProps {
  media: GenreSpotlightMedia;
}

function toggleGenreId(selected: number[], id: number): number[] {
  return selected.includes(id)
    ? selected.filter((genreId) => genreId !== id)
    : [...selected, id];
}

const GenreSpotlightCarousel: React.FC<GenreSpotlightCarouselProps> = ({
  media,
}) => {
  const [genreList, setGenreList] = useState<GenreTab[]>([]);
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);
  const [genresLoading, setGenresLoading] = useState(true);
  const [items, setItems] = useState<DataInfoProps[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  const selectedKey = useMemo(() => {
    if (!selectedGenreIds.length) return "all";
    return [...selectedGenreIds].sort((a, b) => a - b).join(",");
  }, [selectedGenreIds]);

  useEffect(() => {
    let cancelled = false;

    const loadGenres = async () => {
      setGenresLoading(true);
      setGenreList([]);
      setSelectedGenreIds([]);
      setItems([]);

      try {
        const genres = await fetchGenreList(media);
        if (cancelled) return;

        const tabs = genres.map((genre) => ({
          id: genre.id,
          label: genre.name,
        }));
        setGenreList(tabs);
        setSelectedGenreIds(tabs[0] ? [tabs[0].id] : []);
      } catch {
        if (!cancelled) {
          setGenreList([]);
          setSelectedGenreIds([]);
        }
      } finally {
        if (!cancelled) setGenresLoading(false);
      }
    };

    void loadGenres();
    return () => {
      cancelled = true;
    };
  }, [media]);

  const load = useCallback(
    async (genreIds: number[]) => {
      setItemsLoading(true);
      try {
        const data = await fetchDiscoverByGenres(media, genreIds, 1);
        setItems((data?.results as DataInfoProps[]) ?? []);
      } catch {
        setItems([]);
      } finally {
        setItemsLoading(false);
      }
    },
    [media]
  );

  useEffect(() => {
    const genreIds = selectedKey === "all"
      ? []
      : selectedKey.split(",").map((value) => Number.parseInt(value, 10));
    void load(genreIds);
  }, [selectedKey, load]);

  const selectedLabels = genreList
    .filter((genre) => selectedGenreIds.includes(genre.id))
    .map((genre) => genre.label);

  const sectionEyebrow =
    media === "movie" ? "Movie genre spotlights" : "TV genre spotlights";

  const carouselTitle =
    selectedLabels.length > 0
      ? `${selectedLabels.join(" & ")} — popular ${media === "movie" ? "movies" : "TV"}`
      : `Popular ${media === "movie" ? "movies" : "TV"}`;

  const viewAllTo =
    selectedGenreIds.length > 0
      ? `/list-items?type=${media}&search=discover&with_genres=${selectedGenreIds.join(",")}&title=${encodeURIComponent(
          `${selectedLabels.join(" & ")} ${media === "movie" ? "movies" : "shows"}`
        )}`
      : media === "movie"
        ? "/list-items?type=movie&search=discover&title=browse-movies-by-genre"
        : "/list-items?type=tv&search=discover&title=browse-shows-by-genre";

  return (
    <div className="mt-9 sm:mt-[64px] max-w-[1250px] mx-auto w-full">
      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 pl-0 pr-0 sm:px-0">
        {sectionEyebrow}
      </p>

      {genresLoading ? (
        <div className="pl-0 pr-0 text-gray-400 text-sm py-4 sm:px-0">Loading genres…</div>
      ) : genreList.length === 0 ? (
        <div className="pl-0 pr-0 text-gray-400 text-sm py-4 sm:px-0">Genres unavailable.</div>
      ) : (
        <div
          role="group"
          aria-label={
            media === "movie"
              ? "Filter spotlight movies by genre"
              : "Filter spotlight TV by genre"
          }
          className="flex flex-wrap gap-2 pb-4 px-2 sm:px-0 -mx-2 sm:mx-0 sm:flex-nowrap sm:overflow-x-auto sm:scrollbar-hide"
        >
          {genreList.map((genre) => {
            const selected = selectedGenreIds.includes(genre.id);
            return (
              <button
                key={genre.id}
                type="button"
                aria-pressed={selected}
                onClick={() =>
                  setSelectedGenreIds((prev) => toggleGenreId(prev, genre.id))
                }
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5c518] ${
                  selected
                    ? "bg-[#f5c518] text-black"
                    : "bg-white/10 text-gray-200 hover:bg-white/15"
                }`}
              >
                {genre.label}
              </button>
            );
          })}
        </div>
      )}

      {itemsLoading ? (
        <div className="pl-0 pr-0 text-gray-400 text-sm py-10 sm:px-0">Loading…</div>
      ) : (
        <Carousel
          key={`${media}-${selectedKey}`}
          movies={items as []}
          cardCount={20}
          showTitle={carouselTitle}
          type={media}
          viewAllTo={viewAllTo}
        />
      )}
    </div>
  );
};

export default GenreSpotlightCarousel;
