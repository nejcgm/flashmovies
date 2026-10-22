import { useEffect, useState } from "react";
import { Meta } from "../../SEO";
import { useLocation, useSearchParams } from "react-router-dom";
import { fetchSpecific, tmdbFailureKind } from "../../client/tmdb.js";
import { MediaComponent, MovieSpecificDescription, Reviews, TopSection } from "./components";
import { Carousel } from "../../components/carousels/classic-carousel";
import { ActorCarousel } from "../../components/carousels/actor-carousel";
import { DetailRetry, Spinner } from "../../components";
import { ActorListItem, MediaListItem } from "../../interfaces/media/index.ts";
import type {
  TmdbCastMember,
  TmdbMediaDetails,
  TmdbProfileImage,
} from "../../interfaces/tmdb/index.ts";
import { useLocaleStorageList } from "../../utils/toLocaleStorageList.ts";
import { mediaDisplayTitle, mediaYearSuffixSpaced } from "../../utils/mediaDisplayTitle";
import { NotFoundPage } from "../not-found";
import {
  NOT_FOUND_PAGE_TITLE,
  fallbackPageTitle,
  signalDetailTitle,
} from "../../utils/gaPageView.ts";

const DETAIL_TYPES = new Set(["movie", "tv", "person"]);
const BLOCKED_MOVIE_ID = "1439112";

type DetailStatus = "loading" | "ready" | "not_found" | "error";

function castToActorListItems(cast: TmdbCastMember[] | undefined): ActorListItem[] {
  return (cast ?? []).map((member) => ({
    id: member.id,
    name: member.name,
    profile_path: member.profile_path,
    file_path: member.file_path,
  }));
}

function profilesToActorListItems(
  profiles: TmdbProfileImage[] | undefined,
): ActorListItem[] {
  return (profiles ?? []).map((profile, index) => ({
    id: profile.file_path || index,
    name: "",
    file_path: profile.file_path,
    profile_path: profile.file_path,
  }));
}

function isBlockedMovie(movieId: string | null, type: string | null): boolean {
  return movieId === BLOCKED_MOVIE_ID && type === "movie";
}

export function movieInfoDocumentTitle(info: TmdbMediaDetails): string {
  return `${mediaDisplayTitle(info)}${mediaYearSuffixSpaced(
    info.release_date,
    info.first_air_date,
    info.birthday,
  )} — Watch Free Online | Flash Movies`;
}

export function MovieInfoPage() {
  const { pathname, search } = useLocation();
  const [info, setInfo] = useState<TmdbMediaDetails>();
  const [relatedMovies, setRelatedMovies] = useState<MediaListItem[]>([]);
  const [credits, setCredits] = useState<ActorListItem[]>([]);
  const [status, setStatus] = useState<DetailStatus>("loading");
  const [attempt, setAttempt] = useState(0);

  const [searchParams] = useSearchParams();
  const movieId: string | null = searchParams.get("id") as string | null;
  const type: string | null = searchParams.get("type") as string | null;

  const [, addToLocaleStorageList] = useLocaleStorageList(
    type as string,
    `recentlyViewed${type}IdStorage`,
    `recentlyViewed${type}Cache`,
    20,
  );

  useEffect(() => {
    if (movieId && type && !isBlockedMovie(movieId, type)) {
      addToLocaleStorageList(type, movieId);
    }
  }, [movieId, type]);

  useEffect(() => {
    const report = (next: DetailStatus, title: string) => {
      setStatus(next);
      signalDetailTitle(pathname, search, title);
    };

    if (!movieId || !type || !DETAIL_TYPES.has(type) || isBlockedMovie(movieId, type)) {
      setInfo(undefined);
      report("not_found", NOT_FOUND_PAGE_TITLE);
      return;
    }

    let cancelled = false;
    setStatus("loading");
    setInfo(undefined);
    setRelatedMovies([]);
    setCredits([]);

    const load = async () => {
      try {
        const details = await fetchSpecific(type, movieId, "", null, null);
        if (cancelled) return;
        if (!details?.id) {
          report("not_found", NOT_FOUND_PAGE_TITLE);
          return;
        }

        setInfo(details);
        setStatus("ready");
        signalDetailTitle(pathname, search, movieInfoDocumentTitle(details));

        if (type === "person") {
          const [knownFor, images] = await Promise.all([
            fetchSpecific(type, movieId, "/movie_credits", null, 1).catch(() => null),
            fetchSpecific(type, movieId, "/images", null, null).catch(() => null),
          ]);
          if (cancelled) return;
          if (knownFor?.cast) setRelatedMovies(knownFor.cast);
          if (images?.profiles) setCredits(profilesToActorListItems(images.profiles));
          return;
        }

        const [related, creditData] = await Promise.all([
          fetchSpecific(type, movieId, "/similar", null, 1).catch(() => null),
          fetchSpecific(type, movieId, "/credits", null, 1).catch(() => null),
        ]);
        if (cancelled) return;
        if (related?.results) setRelatedMovies(related.results);
        if (creditData?.cast) setCredits(castToActorListItems(creditData.cast));
      } catch (error) {
        if (cancelled) return;
        if (tmdbFailureKind(error) === "not_found") {
          report("not_found", NOT_FOUND_PAGE_TITLE);
          return;
        }
        report("error", fallbackPageTitle(pathname, search));
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [movieId, type, pathname, search, attempt]);

  if (status === "not_found") {
    return <NotFoundPage />;
  }

  const neutralTitle = fallbackPageTitle(pathname, search);

  return (
    <>
      {status === "error" && <Meta title={neutralTitle} />}
      {info && status === "ready" && (
        <Meta
          title={movieInfoDocumentTitle(info)}
          description={
            info.overview
              ? `${info.overview.slice(0, 150)}... Watch ${mediaDisplayTitle(
                  info,
                )} free on Flash Movies.`
              : `Watch ${mediaDisplayTitle(
                  info,
                )} free on Flash Movies. Stream in HD quality.`
          }
          image={
            info.poster_path
              ? `https://image.tmdb.org/t/p/w500${info.poster_path}`
              : info.backdrop_path
              ? `https://image.tmdb.org/t/p/w1280${info.backdrop_path}`
              : "https://flashmovies.xyz/flash-movies-logo.png"
          }
          url={
            type && movieId
              ? `https://flashmovies.xyz/movie-info?type=${type}&id=${movieId}`
              : "https://flashmovies.xyz"
          }
          keywords={[
            mediaDisplayTitle(info) || "",
            ...(info.genres?.map((genre: { name: string }) => genre.name) ||
              []),
            `${type} streaming`,
            `watch ${mediaDisplayTitle(info)} free`,
            `${type} online`,
            `watch ${mediaDisplayTitle(info)} ${
              type === "movie" ? "movie" : "series"
            }`,
            `watch ${mediaDisplayTitle(info)} ${
              type === "movie" ? "movie" : "series"
            } for free`,
            `watch ${mediaDisplayTitle(info)} ${
              type === "movie" ? "movie" : "series"
            } for free on flashmovies`,
            `${mediaDisplayTitle(info)} ${
              type === "movie" ? "movie" : "series"
            } movie info`,
            "free movies",
            " free series",
            "flash movies",
            "HD streaming, flashmovies, flashmovies.xyz",
          ].filter(Boolean)}
          type={
            type === "movie"
              ? "video.movie"
              : type === "tv"
              ? "video.tv_show"
              : "article"
          }
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
          <div className="font-roboto text-white">
            <div className="flex flex-col gap-3 sm:gap-0">
              <TopSection
                title={mediaDisplayTitle(info)}
                release={
                  info.release_date || info.first_air_date || info.birthday
                }
                runtime={info.runtime ?? 0}
                language={info.original_language ?? info.known_for_department ?? ""}
                rating={info.vote_average ?? 0}
                popularity={info.popularity ?? 0}
                type={type}
              />

              <MediaComponent
                movieId={info.id}
                poster={info.poster_path || info.profile_path}
                title={mediaDisplayTitle(info)}
                backdrop={
                  info.backdrop_path || credits?.[1]?.file_path || " "
                }
                vote={info.vote_count}
                type={type}
              />

              <MovieSpecificDescription
                description={info.overview ?? info.biography ?? ""}
                movieId={info.id}
                poster={info.poster_path || info.profile_path}
                type={type}
                genres={info.genres}
                title={mediaDisplayTitle(info)}
              />
            </div>
          </div>

          {type != "person" && (
            <div className="mt-[42px] sm:mt-[64px]">
              <ActorCarousel
                cardCount={20}
                actors={credits}
                showTitle={"credits"}
              />
            </div>
          )}
          <div className="mt-[42px] pb-[42px] sm:mt-[64px] sm:pb-[64px]">
            <Carousel
              movies={relatedMovies}
              cardCount={20}
              showTitle={type != "person" ? `You May Also Like` : "Acted in"}
              type={type != "person" ? type : "movie"}
            />
          </div>
          {type != "person" && (
            <div className="flex flex-col items-center">
              <Reviews movieId={movieId} type={type} />
            </div>
          )}
        </>
      )}
    </>
  );
}
