import React, { useCallback, useEffect, useState } from "react";
import Carousel from "../carousels/classic-carousel/Carousel";
import {
  fetchDiscoverMoviesByGenre,
  fetchDiscoverTvByGenre,
} from "../utils/fetching.js";
import { DataInfoProps } from "../utils/Interfaces";

type GenreSpotlightMedia = "movie" | "tv";

/** TMDB movie genre ids — /genre/movie/list */
const MOVIE_GENRES: readonly { id: number; label: string }[] = [
  { id: 28, label: "Action" },
  { id: 12, label: "Adventure" },
  { id: 16, label: "Animation" },
  { id: 35, label: "Comedy" },
  { id: 80, label: "Crime" },
  { id: 99, label: "Documentary" },
  { id: 18, label: "Drama" },
  { id: 27, label: "Horror" },
  { id: 878, label: "Sci-Fi" },
  { id: 53, label: "Thriller" },
];

/** TMDB TV genre ids — /genre/tv/list */
const TV_GENRES: readonly { id: number; label: string }[] = [
  { id: 10759, label: "Action & Adv." },
  { id: 16, label: "Animation" },
  { id: 35, label: "Comedy" },
  { id: 80, label: "Crime" },
  { id: 99, label: "Documentary" },
  { id: 18, label: "Drama" },
  { id: 10762, label: "Kids" },
  { id: 9648, label: "Mystery" },
  { id: 10765, label: "Sci-Fi & Fant." },
  { id: 10768, label: "War & Politics" },
];

interface GenreSpotlightCarouselProps {
  media: GenreSpotlightMedia;
}

const GenreSpotlightCarousel: React.FC<GenreSpotlightCarouselProps> = ({
  media,
}) => {
  const genreList = media === "movie" ? MOVIE_GENRES : TV_GENRES;
  const [activeId, setActiveId] = useState<number>(() => genreList[0].id);
  const [items, setItems] = useState<DataInfoProps[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (genreId: number) => {
      setLoading(true);
      try {
        const data =
          media === "movie"
            ? await fetchDiscoverMoviesByGenre(genreId, 1)
            : await fetchDiscoverTvByGenre(genreId, 1);
        setItems((data?.results as DataInfoProps[]) ?? []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [media]
  );

  useEffect(() => {
    void load(activeId);
  }, [activeId, load]);

  const activeLabel = genreList.find((g) => g.id === activeId)?.label ?? "";

  const sectionEyebrow =
    media === "movie" ? "Movie genre spotlights" : "TV genre spotlights";

  const viewAllTo =
    media === "movie"
      ? "/list-items?type=movie&search=discover&title=browse-movies-by-genre"
      : "/list-items?type=tv&search=discover&title=browse-shows-by-genre";

  return (
    <div className="mt-9 sm:mt-[64px] max-w-[1250px] mx-auto w-full">
      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 pl-0 pr-0 sm:px-0">
        {sectionEyebrow}
      </p>

      <div
        role="tablist"
        aria-label={media === "movie" ? "Choose a movie genre" : "Choose a TV genre"}
        className="flex flex-wrap gap-2 pb-4 px-2 sm:px-0 -mx-2 sm:mx-0 sm:flex-nowrap sm:overflow-x-auto sm:scrollbar-hide"
      >
        {genreList.map((g) => {
          const selected = activeId === g.id;
          return (
            <button
              key={g.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveId(g.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5c518] ${
                selected
                  ? "bg-[#f5c518] text-black"
                  : "bg-white/10 text-gray-200 hover:bg-white/15"
              }`}
            >
              {g.label}
            </button>
          );
        })}
      </div>
      {loading ? (
        <div className="pl-0 pr-0 text-gray-400 text-sm py-10 sm:px-0">Loading…</div>
      ) : (
        <Carousel
          key={`${media}-${activeId}`}
          movies={items as []}
          cardCount={20}
          showTitle={`${activeLabel} — popular ${media === "movie" ? "movies" : "TV"}`}
          type={media}
          viewAllTo={viewAllTo}
        />
      )}
    </div>
  );
};

export default GenreSpotlightCarousel;
