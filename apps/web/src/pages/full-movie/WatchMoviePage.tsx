import { useState, useEffect, useCallback } from "react";
import { Meta } from "../../SEO";
import { useLocation, useSearchParams } from "react-router-dom";
import { fetchSpecific, tmdbFailureKind } from "../../client/tmdb.js";
import { BackButton, DetailRetry, Spinner } from "../../components";
import { EpisodeSelector, ProviderComponent } from "./components";
import { Episode } from "../../interfaces/media/index.ts";
import type { TmdbMediaDetails } from "../../interfaces/tmdb/index.ts";
import { ProPlansPromoStrip } from "../../components/common";
import { mediaDisplayTitle, mediaYearSuffixSpaced } from "../../utils/mediaDisplayTitle";
import { NotFoundPage } from "../not-found";
import {
  NOT_FOUND_PAGE_TITLE,
  fallbackPageTitle,
  signalDetailTitle,
} from "../../utils/gaPageView.ts";
import {
  isWatchableTitle,
  resetWatchPlayback,
  seasonEpisodeForProvider,
} from "./watchPlayback.ts";

type DetailStatus = "loading" | "ready" | "not_found" | "error";

function watchDocumentTitle(info: TmdbMediaDetails): string {
  return `Watch ${mediaDisplayTitle(info)}${mediaYearSuffixSpaced(
    info.release_date,
    info.first_air_date,
    info.birthday,
  )} Free Online — Flash Movies`;
}

export function WatchMoviePage() {
  const { pathname, search } = useLocation();
  const [info, setInfo] = useState<TmdbMediaDetails>();
  const [searchParams] = useSearchParams();
  const [currentProviderUrl, setCurrentProviderUrl] = useState("");
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [status, setStatus] = useState<DetailStatus>("loading");
  const [attempt, setAttempt] = useState(0);
  const movieId = searchParams.get("id");
  const type = searchParams.get("type");
  const titleKey = `${type ?? ""}:${movieId ?? ""}`;
  const [playbackKey, setPlaybackKey] = useState(titleKey);
  if (playbackKey !== titleKey) {
    setPlaybackKey(titleKey);
    const reset = resetWatchPlayback(isWatchableTitle(movieId, type));
    setCurrentProviderUrl(reset.currentProviderUrl);
    setSelectedEpisode(reset.selectedEpisode);
    setInfo(reset.info);
    setStatus(reset.status);
  }

  useEffect(() => {
    const reset = resetWatchPlayback(isWatchableTitle(movieId, type));
    setCurrentProviderUrl(reset.currentProviderUrl);
    setSelectedEpisode(reset.selectedEpisode);
    setInfo(reset.info);

    const report = (next: DetailStatus, title: string) => {
      setStatus(next);
      signalDetailTitle(pathname, search, title);
    };

    if (!movieId || !type || !isWatchableTitle(movieId, type)) {
      report("not_found", NOT_FOUND_PAGE_TITLE);
      return;
    }

    let cancelled = false;
    setStatus(reset.status);

    const loadInfo = async () => {
      try {
        const data = await fetchSpecific(type, movieId, "", null, "");
        if (cancelled) return;
        if (!data?.id) {
          report("not_found", NOT_FOUND_PAGE_TITLE);
          return;
        }
        setInfo(data);
        setStatus("ready");
        signalDetailTitle(pathname, search, watchDocumentTitle(data));
      } catch (error) {
        if (cancelled) return;
        if (tmdbFailureKind(error) === "not_found") {
          report("not_found", NOT_FOUND_PAGE_TITLE);
          return;
        }
        report("error", fallbackPageTitle(pathname, search));
      }
    };

    void loadInfo();
    return () => {
      cancelled = true;
    };
  }, [movieId, type, pathname, search, attempt]);

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
      const { season, episode } = seasonEpisodeForProvider(selectedEpisode);
      setCurrentProviderUrl(
        buildFullUrl(url, isEpisodeSlugPartOfSlug, season, episode, params),
      );
    },
    [buildFullUrl, selectedEpisode],
  );

  if (status === "not_found") {
    return <NotFoundPage />;
  }

  const heading = info
    ? `${mediaDisplayTitle(info)}${mediaYearSuffixSpaced(
        info.release_date,
        info.first_air_date,
        info.birthday,
      )}`
    : "";
  const displayName = info ? mediaDisplayTitle(info) : "";
  const neutralTitle = fallbackPageTitle(pathname, search);

  return (
    <>
      {status === "error" && <Meta title={neutralTitle} />}
      {info && status === "ready" && (
        <Meta
          title={watchDocumentTitle(info)}
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

      {status === "loading" && (
        <div className="flex w-full justify-center">
          <Spinner />
        </div>
      )}

      {status === "error" && (
        <DetailRetry onRetry={() => setAttempt((current) => current + 1)} />
      )}

      {status === "ready" && info && (
        <>
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
            </div>
          </div>

          <div className="mx-auto w-full max-w-[1200px] space-y-4 sm:space-y-5">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black shadow-lg shadow-black/40 xl:aspect-[2/1]">
              {currentProviderUrl ? (
                <iframe
                  className="absolute inset-0 h-full w-full border-0"
                  src={currentProviderUrl}
                  title={`Watch ${displayName || "video"}`}
                  referrerPolicy="origin"
                  allowFullScreen
                />
              ) : null}
            </div>

            {info.number_of_seasons ? (
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
      )}
    </>
  );
}
