import { useEffect, useState } from "react";
import { Meta } from "../../SEO";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchSpecific } from "../../client/tmdb.js";
import { MediaComponent, MovieSpecificDescription, Reviews, TopSection } from "./components";
import { Carousel } from "../../components/carousels/classic-carousel";
import { ActorCarousel } from "../../components/carousels/actor-carousel";
import { Spinner } from "../../components";
import { ActorListItem, MediaListItem } from "../../interfaces/media/index.ts";
import type {
  TmdbCastMember,
  TmdbMediaDetails,
  TmdbProfileImage,
} from "../../interfaces/tmdb/index.ts";
import { useLocaleStorageList } from "../../utils/toLocaleStorageList.ts";
import { mediaDisplayTitle, mediaYearSuffixSpaced } from "../../utils/mediaDisplayTitle";

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

export function MovieInfoPage() {
  const navigate = useNavigate();
  const [info, setInfo] = useState<TmdbMediaDetails>();
  const [relatedMovies, setRelatedMovies] = useState<MediaListItem[]>([]);
  const [credits, setCredits] = useState<ActorListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [searchParams] = useSearchParams();
  const movieId: string | null = searchParams.get("id") as string | null;
  const type: string | null = searchParams.get("type") as string | null;

  useEffect(() => {
    if (movieId === "1439112" && type === "movie") {
      navigate("/404");
    }
  }, [movieId, type]);

  const [, addToLocaleStorageList] = useLocaleStorageList(
    type as string,
    `recentlyViewed${type}IdStorage`,
    `recentlyViewed${type}Cache`,
    20
  );

  useEffect(() => {
    if (movieId && type) {
      addToLocaleStorageList(type, movieId);
    }
  }, [movieId, type]);

  useEffect(() => {
    if (!movieId || !type) {
      return;
    }

    const loadInfoData = async () => {
      setLoading(true);
      const dataMoreInfo = await fetchSpecific(type, movieId, "", null, null);
      const dataRelated = await fetchSpecific(type, movieId, "/similar", null, 1);
      const dataCredits = await fetchSpecific(type, movieId, "/credits", null, 1);

      if (dataMoreInfo && dataRelated && dataCredits) {
        setInfo(dataMoreInfo);
        setRelatedMovies(dataRelated.results);
        setCredits(castToActorListItems(dataCredits.cast));
      }
      setLoading(false);
    };

    const loadPersonData = async () => {
      setLoading(true);
      const dataMoreInfo = await fetchSpecific(type, movieId, "", null, null);
      const dataKnownFor = await fetchSpecific(type, movieId, "/movie_credits", null, 1);
      const dataImages = await fetchSpecific(type, movieId, "/images", null, null);

      if (dataMoreInfo && dataKnownFor && dataImages) {
        setInfo(dataMoreInfo);
        setRelatedMovies(dataKnownFor.cast);
        setCredits(profilesToActorListItems(dataImages.profiles));
      }
      setLoading(false);
    };

    if (type !== "person") {
      if (movieId === "1439112" && type === "movie") {
        return;
      }
      void loadInfoData();
    } else {
      void loadPersonData();
    }
  }, [movieId, type]);

  return (
    <>
      {info && (
        <Meta
          title={`${mediaDisplayTitle(info)}${mediaYearSuffixSpaced(
            info.release_date,
            info.first_air_date,
            info.birthday,
          )} — Watch Free Online | Flash Movies`}
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
          url={window.location.href}
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

      {loading && (
        <div className="flex w-full justify-center">
          <Spinner />
        </div>
      )}

      {!loading && (
        <>
          <div className="font-roboto text-white">
            {info !== undefined && (
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
            )}
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

