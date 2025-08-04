import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchSpecific } from "../functions/Fetching.js";
import MediaComponent from "./info-Page-Components/MediaComponent.jsx";
import Carousel from "../carousels/classic-carousel/Carousel";
import Reviews from "./info-Page-Components/Reviews";
import ActorCarousel from "../carousels/actor-carousel/ActorCarousel";
import Spinner from "../components/Spinner";
import TopSection from "./info-Page-Components/TopSection.jsx";
import MovieSpecificDescription from "./info-Page-Components/MovieSpecificDescription.jsx";
import { DataInfoProps } from "../functions/Interfaces.ts";
import Meta from "../SEO/meta.tsx";
import MovieSchema from "../SEO/MovieSchema.tsx";

const MovieInfoPage = () => {
  const [info, setInfo] = useState<DataInfoProps>();
  const [relatedMovies, setRelatedMovies] = useState<[]>([]);
  const [credits, setCredits] = useState<DataInfoProps[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [searchParams] = useSearchParams();
  const movieId: string | null = searchParams.get("id") as string | null;
  const type: string | null = searchParams.get("type") as string | null;

  useEffect(() => {
    const loadInfoData = async () => {
      setLoading(true);
      const [dataMoreInfo, dataRelated, dataCredits] = await Promise.all([
        fetchSpecific(type, movieId, "", null, ""),
        fetchSpecific(type, movieId, "/similar", null, 1),
        fetchSpecific(type, movieId, "/credits", null, 1),
      ]);
      if (dataMoreInfo && dataRelated && dataCredits) {
        const dataInfo = { dataMoreInfo };
        setInfo(dataInfo.dataMoreInfo);
        setRelatedMovies(dataRelated.results);
        setCredits(dataCredits.cast);
        setLoading(false);
      }
    };

    const loadPersonData = async () => {
      setLoading(true);
      const [dataMoreInfo, dataKnownFor, dataImages] = await Promise.all([
        fetchSpecific(type, movieId, "", null, ""),
        fetchSpecific(type, movieId, "/movie_credits", null, 1),
        fetchSpecific(type, movieId, "/images", null, ""),
      ]);
      if (dataMoreInfo && dataKnownFor && dataImages) {
        const dataInfo = { dataMoreInfo };
        setInfo(dataInfo.dataMoreInfo);
        setRelatedMovies(dataKnownFor.cast);
        setCredits(dataImages.profiles);
        setLoading(false);
      }
    };

    if (type != "person") {
      loadInfoData();
    } else {
      loadPersonData();
    }
  }, [movieId, type]);

  return (
    <>
      <Meta 
        title={`${info?.title || info?.name} ${info?.release_date ? `(${new Date(info.release_date).getFullYear()})` : info?.first_air_date ? `(${new Date(info.first_air_date).getFullYear()})` : ''} - Watch Free on Flash Movies`}
        description={info?.overview ? `${info.overview.slice(0, 150)}... Watch ${info?.title || info?.name} free on Flash Movies.` : `Watch ${info?.title || info?.name} free on Flash Movies. Stream in HD quality.`}
        image={info?.poster_path ? `https://image.tmdb.org/t/p/w500${info.poster_path}` : info?.backdrop_path ? `https://image.tmdb.org/t/p/w1280${info.backdrop_path}` : undefined}
        url={window.location.href}
        keywords={[
          info?.title || info?.name || '',
          ...(info?.genres?.map((genre: { name: string }) => genre.name) || []),
          `${type} streaming`, `watch ${type} free`, `${type} online`, 'flash movies'
        ].filter(Boolean)}
        type={type === 'movie' ? 'video.movie' : type === 'tv' ? 'video.tv_show' : 'article'}
        publishedTime={info?.release_date || info?.first_air_date}
      />
      {info && type !== 'person' && (
        <MovieSchema
          title={info?.title || info?.name || ''}
          description={info?.overview}
          image={info?.poster_path}
          releaseDate={info?.release_date || info?.first_air_date}
          genre={info?.genres?.map((g: {name: string}) => g.name) || []}
          rating={info?.vote_average}
          ratingCount={info?.vote_count}
          duration={info?.runtime}
          type={type === 'movie' ? 'movie' : 'tv'}
          url={window.location.href}
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
              <>
                <TopSection
                  title={info.title || info.name}
                  release={
                    info.release_date || info.first_air_date || info.birthday
                  }
                  runtime={info.runtime | 0}
                  language={info.original_language || info.known_for_department}
                  rating={info.vote_average}
                  popularity={info.popularity}
                  type={type}
                />

                <MediaComponent
                  movieId={info.id}
                  poster={info.poster_path || info.profile_path}
                  backdrop={
                    info.backdrop_path || credits?.[1]?.file_path || " "
                  }
                  vote={info.vote_count}
                  type={type}
                />

                <MovieSpecificDescription
                  description={info.overview || info.biography}
                  movieId={info.id}
                  poster={info.poster_path || info.profile_path}
                  type={type}
                  genres={info.genres}
                />
              </>
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
              movies={relatedMovies || relatedMovies}
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
};

export default MovieInfoPage;
