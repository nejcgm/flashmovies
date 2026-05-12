import React, { useState } from "react";
import GenreSpecific from "./GenreSpecific";
import VideoPlayer from "../../dialogs/VideoPlayer";
import { ProPlansPromoStrip } from "../../components/common/ProPlansPromoStrip";

interface MovieSpecificDescriptionProps {
  description: string;
  movieId: string;
  type: string | null;
  poster: string;
  genres: [];
  title: string;
}
const MovieSpecificDescription: React.FC<MovieSpecificDescriptionProps> = ({
  description,
  movieId,
  type,
  poster,
  genres,
  title,
}) => {
  const [expand, setExpand] = useState(500);
  const ContentLength = description?.length;
  const [trailer, setTrailer] = useState(false);

  const posterUrl =
    poster?.length > 1
      ? `https://image.tmdb.org/t/p/w500${poster}`
      : "";

  return (
    <>
      {trailer && (
        <VideoPlayer
          movieId={movieId}
          title={title}
          type={type}
          onCancel={() => {
            setTrailer(false);
          }}
        />
      )}
      <ProPlansPromoStrip
        when={type !== "person"}
        className="mt-3 sm:mt-4 lg:hidden"
      />

      <button
        type="button"
        className="group mt-4 flex w-full items-stretch gap-3 rounded-xl border border-white/[12%] bg-gradient-to-br from-white/[6%] to-black/20 p-3 text-left outline-none ring-offset-2 transition-colors hover:border-[#f5c518]/30 hover:from-white/[10%] focus-visible:ring-2 focus-visible:ring-[#f5c518] lg:hidden"
        onClick={() => {
          setTrailer(true);
        }}
      >
        <div
          className="relative h-[104px] w-[72px] shrink-0 overflow-hidden rounded-lg bg-zinc-800 bg-cover bg-center sm:h-[118px] sm:w-[84px]"
          style={{
            backgroundImage: posterUrl ? `url(${posterUrl})` : undefined,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center bg-black/35 transition-colors group-hover:bg-black/45">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-white drop-shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:text-[#f5c518]"
              viewBox="0 0 24 24"
              fill="currentColor"
              role="presentation"
              aria-hidden
            >
              <path d="M10.803 15.932l4.688-3.513a.498.498 0 0 0 0-.803l-4.688-3.514a.502.502 0 0 0-.803.402v7.026c0 .412.472.653.803.402z" />
              <path d="M12 24C5.373 24 0 18.627 0 12S5.373 0 12 0s12 5.373 12 12-5.373 12-12 12zm0-1c6.075 0 11-4.925 11-11S18.075 1 12 1 1 5.925 1 12s4.925 11 11 11z" />
            </svg>
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 py-0.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#f5c518]">
            Trailer
          </p>
          <p className="text-base font-semibold leading-snug text-white sm:text-[17px]">
            Watch trailer
          </p>
          <p className="text-xs text-gray-400">Tap to play</p>
        </div>
      </button>

      <ProPlansPromoStrip
        when={type !== "person"}
        className="mt-4 hidden lg:block lg:mt-6"
      />

      <div className="mt-5 flex w-full flex-col gap-4 md:w-[70%] lg:mt-6">
        <div>
          <h3 className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400 lg:mb-3 lg:text-xs">
            Genres
          </h3>
          <GenreSpecific genres={genres} />
        </div>

        <div className="rounded-xl border border-white/[8%] bg-black/25 px-3 py-3 sm:px-4 sm:py-4 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400 lg:mb-2.5 lg:text-xs">
            Synopsis
          </h3>
          <div className="text-[13px] leading-relaxed text-white/90 sm:text-[15px] sm:leading-relaxed lg:mt-0 lg:text-base">
            {description?.slice(0, expand)}
            <button
              type="button"
              onClick={() => {
                setExpand((prevValue) =>
                  prevValue === 500 ? ContentLength : 500
                );
              }}
              className="ml-0.5 text-[#c9c9c9] underline-offset-2 hover:text-white hover:underline"
            >
              {ContentLength < 500
                ? " "
                : expand == 500
                  ? " Read more"
                  : " Show less"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MovieSpecificDescription;
