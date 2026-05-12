import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchSpecific } from "../../utils/fetching.js";
import BackButton from "../../components/BackButton";
import ShareButton from "../../components/ShareButton.js";
import ProviderComponent from "./components/ProviderComponent.js";
import Meta from "../../SEO/meta.tsx";
import MovieSchema from "../../SEO/MovieSchema.tsx";
import BreadcrumbSchema from "../../SEO/BreadcrumbSchema.tsx";
import { EpisodeSelector } from "./components/EpisodeSelector.tsx";
import { DataInfoProps, Episode } from "../../utils/Interfaces.ts";
import { ProPlansPromoStrip } from "../../components/common/ProPlansPromoStrip";
import { mediaDisplayTitle, mediaYearSuffixSpaced } from "../../utils/mediaDisplayTitle";

const WatchMoviePage = () => {
  const [info, setInfo] = useState<DataInfoProps>();
  const [searchParams] = useSearchParams();
  const [currentProviderUrl, setCurrentProviderUrl] = useState("");
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const movieId = searchParams.get("id");
  const type = searchParams.get("type");
  const navigate = useNavigate();

  useEffect(() => {
    const loadInfo = async () => {
      if (!movieId || !type) return;
      if (movieId === "1439112" && type === "movie") {
        navigate("/404");
        return;
      }
      // Same path as movie-info: /movie/{id} or /tv/{id} — not .../details (invalid on TMDB).
      const data = await fetchSpecific(type, movieId, "", null, "");
      if (data) {
        setInfo(data);
      }
    };
    void loadInfo();
  }, [movieId, type, navigate]);

  const buildFullUrl = useCallback(
    (
      baseUrl: string,
      isEpisodeSlugPartOfSlug: boolean,
      season?: number,
      episode?: number,
      params?: string,
    ) => {
      let fullUrl: string;
      if (isEpisodeSlugPartOfSlug && type === "tv") {
        fullUrl = `${baseUrl}/${season ?? "1"}/${episode ?? "1"}${params ? `?${params}` : ""}`;
      } else if (type === "tv") {
        fullUrl = `${baseUrl}?season=${season ?? "1"}&episode=${episode ?? "1"}${params ? `&${params}` : ""}`;
      } else {
        fullUrl = `${baseUrl}?${params || ""}`;
      }
      return fullUrl;
    },
    [type],
  );

  const applyProvider = useCallback(
    (url: string, isEpisodeSlugPartOfSlug: boolean, params?: string) => {
      setCurrentProviderUrl(
        buildFullUrl(
          url,
          isEpisodeSlugPartOfSlug,
          selectedEpisode?.season_number,
          selectedEpisode?.episode_number,
          params,
        ),
      );
    },
    [buildFullUrl, selectedEpisode?.episode_number, selectedEpisode?.season_number],
  );

  const heading = info
    ? `${mediaDisplayTitle(info)}${mediaYearSuffixSpaced(
        info.release_date,
        info.first_air_date,
        info.birthday,
      )}`
    : "";
  const displayName = info ? mediaDisplayTitle(info) : "";

  return (
    <>
      {info && (
        <Meta
          title={`Watch ${displayName}${mediaYearSuffixSpaced(
            info.release_date,
            info.first_air_date,
            info.birthday,
          )} - Flash Movies - Watch Free`}
          description={
            info.overview
              ? `Stream ${displayName} in HD. ${info.overview.slice(0, 100)}... Watch free on Flash Movies.`
              : `Stream ${displayName} free in HD quality on Flash Movies.`
          }
          image={
            info.backdrop_path
              ? `https://image.tmdb.org/t/p/w1280${info.backdrop_path}`
              : info.poster_path
                ? `https://image.tmdb.org/t/p/w500${info.poster_path}`
                : "https://flashmovies.xyz/flash-movies-logo.png"
          }
          url={window.location.href}
          keywords={[
            displayName,
            ...(info.genres?.map((genre: { name: string }) => genre.name) || []),
            `stream ${type}`,
            `watch ${type} online`,
            `${type} free`,
            `watch ${displayName} ${type === "movie" ? "movie" : "series"}`,
            `watch ${displayName} ${type === "movie" ? "movie" : "series"} for free`,
            `watch ${displayName} ${type === "movie" ? "movie" : "series"} for free on flashmovies`,
            "free movies",
            " free series",
            "flash movies",
            "HD streaming, flashmovies, flashmovies.xyz",
          ].filter(Boolean)}
          type={type === "movie" ? "video.movie" : "video.tv_show"}
        />
      )}

      {info && (
        <BreadcrumbSchema
          items={[
            { name: "Home", url: "https://flashmovies.xyz/" },
            {
              name: type === "movie" ? "Movies" : "TV Shows",
              url: `https://flashmovies.xyz/list-items?type=${type}&search=popular&title=popular-${type}s`,
            },
            {
              name: displayName || "Content",
              url: `https://flashmovies.xyz/movie-info?type=${type}&id=${movieId}`,
            },
            {
              name: `Watch ${displayName || "Content"}`,
              url: window.location.href,
            },
          ]}
        />
      )}

      {info && (
        <MovieSchema
          title={displayName}
          description={info?.overview}
          image={info?.poster_path}
          releaseDate={info?.release_date || info?.first_air_date}
          genre={info?.genres?.map((g: { name: string }) => g.name) || []}
          rating={info?.vote_average}
          ratingCount={info?.vote_count}
          duration={info?.runtime}
          type={type === "movie" ? "movie" : "tv"}
          url={window.location.href}
        />
      )}

      <div className="mb-4 font-roboto text-white sm:mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <div className="shrink-0">
              <BackButton />
            </div>
            <h1 className="min-w-0 flex-1 text-xl font-semibold leading-snug sm:text-2xl md:text-3xl lg:text-4xl">
              <span className="text-white">{heading}</span>
              <span className="ml-2 text-sm font-normal text-gray-400 sm:ml-2 sm:text-base md:text-[0.55em] md:text-gray-400">
                — Watch on Flash Movies
              </span>
            </h1>
          </div>
          <div className="hidden shrink-0 justify-end lg:flex lg:items-center">
            <ShareButton />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1200px] space-y-4 sm:space-y-5">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black shadow-lg shadow-black/40 xl:aspect-[2/1]">
          <iframe
            className="absolute inset-0 h-full w-full border-0"
            src={currentProviderUrl}
            title={`Watch ${displayName || "video"}`}
            referrerPolicy="origin"
            allowFullScreen
          />
        </div>

        {info?.number_of_seasons ? (
          <div className="rounded-xl border border-white/[10%] bg-white/[0.03] p-3 sm:p-4">
            <EpisodeSelector
              title="Select episode"
              seasonsCount={info.number_of_seasons}
              type={type!}
              movieId={movieId!}
              onEpisodeChange={(episode) => {
                setSelectedEpisode(episode);
              }}
            />
          </div>
        ) : null}

        <ProviderComponent
          newProvider={applyProvider}
          title="Choose server"
          movieId={movieId!}
          type={type!}
          description="Switch servers if the stream buffers or fails — quality vs. stability varies by source."
          className="rounded-xl border border-white/[10%] bg-white/[0.03] p-3 sm:p-4"
        />
        <ProPlansPromoStrip className="mt-2 sm:mt-0" />
      </div>
    </>
  );
};

export default WatchMoviePage;
