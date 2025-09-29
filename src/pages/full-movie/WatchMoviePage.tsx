import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchSpecific } from "../../utils/fetching.js";
import BackButton from "../../components/BackButton";
import ShareButton from "../../components/ShareButton.js";
import ProviderComponent from "./components/ProviderComponent.js";
import Meta from "../../SEO/meta.tsx";
import MovieSchema from "../../SEO/MovieSchema.tsx";
import BreadcrumbSchema from "../../SEO/BreadcrumbSchema.tsx";
import { EpisodeSelector } from "./components/EpisodeSelector.tsx";
import { DataInfoProps, Episode } from "../../utils/Interfaces.ts";

const WatchMoviePage = () => {
  const [info, setInfo] = useState<DataInfoProps>();
  const [searchParams] = useSearchParams();
  const [currentProviderUrl, setCurrentProviderUrl] = useState("");
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const movieId = searchParams.get("id");
  const type = searchParams.get("type");
  useEffect(() => {
    const loadInfo = async () => {
      const data = await fetchSpecific(type, movieId, "details", null, "");
      if (data) {
        setInfo(data);
      }
    };
    loadInfo();
  }, [movieId, type]);

  return (
    <>
      {info && (
        <Meta
          title={`Watch ${info.title || info.name} ${
            info.release_date
              ? `(${new Date(info.release_date).getFullYear()})`
              : info.first_air_date
              ? `(${new Date(info.first_air_date).getFullYear()})`
              : ""
          } - Flash Movies - Watch Free`}
          description={
            info.overview
              ? `Stream ${info.title || info.name} in HD. ${info.overview.slice(
                  0,
                  100
                )}... Watch free on Flash Movies.`
              : `Stream ${
                  info.title || info.name
                } free in HD quality on Flash Movies.`
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
            info.title || info.name || "",
            ...(info.genres?.map((genre: { name: string }) => genre.name) ||
              []),
            `stream ${type}`,
            `watch ${type} online`,
            `${type} free`,
            `watch ${info.title || info.name || ""} ${
              type === "movie" ? "movie" : "series"
            }`,
            `watch ${info.title || info.name || ""} ${
              type === "movie" ? "movie" : "series"
            } for free`,
            `watch ${info.title || info.name || ""} ${
              type === "movie" ? "movie" : "series"
            } for free on flashmovies`,
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
              name: info.title || info.name || "Content",
              url: `https://flashmovies.xyz/movie-info?type=${type}&id=${movieId}`,
            },
            {
              name: `Watch ${info.title || info.name || "Content"}`,
              url: window.location.href,
            },
          ]}
        />
      )}

      {info && (
        <MovieSchema
          title={info?.title || info?.name || ""}
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
      <div className="flex font-roboto items-center mb-[14px] content-center text-white justify-between">
        <div className="flex gap-4 content-center sm:mb-2">
          <BackButton />
          <h1 className="text-[24px] md:text-[32px] lg:text-[48px] leading-[1.2]">
            {info?.title || info?.name}{" "}
            {info?.release_date
              ? `(${new Date(info.release_date).getFullYear()})`
              : info?.first_air_date
              ? `(${new Date(info.first_air_date).getFullYear()})`
              : ""}{" "}
            - Watch on Flash Movies
          </h1>
          <ShareButton />
        </div>
      </div>
      <div className=" w-full xl:aspect-[16/8] aspect-[16/9] max-w-[1200px] mx-auto relative">
        <iframe
          className="w-full h-full"
          src={
            currentProviderUrl +
            `?season=${selectedEpisode?.season_number}&episode=${selectedEpisode?.episode_number}`
          }
          referrerPolicy="origin"
          frameBorder="0"
          allowFullScreen
        ></iframe>

        <div className="mt-2 md:mt-4 mb-2 md:mb-4">
          {info?.number_of_seasons && (
            <EpisodeSelector
              title="Select Episode"
              seasonsCount={info?.number_of_seasons}
              type={type!}
              movieId={movieId!}
              onEpisodeChange={(episode) => {
                setSelectedEpisode(episode);
              }}
            />
          )}
        </div>

        <ProviderComponent
          newProvider={setCurrentProviderUrl}
          title="Choose Server"
          movieId={movieId!}
          type={type!}
          className="mt-[8px]"
        />
        <div className="h-[32px]"></div>
      </div>
    </>
  );
};

export default WatchMoviePage;
