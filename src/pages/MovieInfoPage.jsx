import React, { useEffect, useState } from "react";
import { useSearchParams} from "react-router-dom";
import { fetchSpecific } from "../functions/Fetching.js";
import HeaderInfo from "../info-page-components/HeaderInfo";
import Carousel from "../classic-carousel/Carousel";
import Reviews from "../info-page-components/Reviews";
import ActorCarousel from "../actor-carousel/ActorCarousel";
import Spinner from "../components/Spinner";

const MovieInfoPage = () => {
  const [info, setInfo] = useState([]);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const movieId = searchParams.get("id");
  const type = searchParams.get("type");

  useEffect(() => {
    const loadInfoData = async () => {
      setLoading(true);
      const [dataInfo, dataRelated, dataCredits] = await Promise.all([
        fetchSpecific(type, movieId, "", "", ""),
        fetchSpecific(type, movieId, "/similar", "", 1),
        fetchSpecific(type, movieId, "/credits", "", 1)
      ]);
      setInfo(dataInfo);
      setRelatedMovies(dataRelated);
      setCredits(dataCredits);
      setLoading(false);
    };

    const loadPersonData = async () => {
      setLoading(true);
      const [datatPerson, dataKnownFor, dataImages] = await Promise.all([
        fetchSpecific(type, movieId, "", "", ""),
        fetchSpecific(type, movieId, "/movie_credits", "", 1),
        fetchSpecific(type, movieId, "/images", "", "")
      ]);
      setInfo(datatPerson);
      setRelatedMovies(dataKnownFor);
      setCredits(dataImages);
      setLoading(false);
    };

    if (type != "person") {
      loadInfoData();
    } else {
      loadPersonData();
    }
  }, [movieId, type]);
  console.log({ relatedMovies });

  return (
    <>
      {loading && (
        <div className="flex w-full justify-center">
          <Spinner />
        </div>
      )}

      {!loading && (
        <>
          <HeaderInfo
            movieId={info?.id}
            title={info?.title || info?.name}
            release={
              info?.release_date || info?.first_air_date || info.birthday
            }
            rating={info?.vote_average}
            poster={info?.poster_path || info.profile_path}
            runtime={info?.runtime || ""}
            language={info.original_language || info.known_for_department}
            genres={info?.genres}
            backdrop={info?.backdrop_path || credits?.profiles?.[1]?.file_path}
            vote={info?.vote_count}
            description={info.overview || info.biography}
            popularity={info?.popularity}
            type={type}
          />
          {type != "person" && (
            <div className="mt-[64px]">
              <ActorCarousel
                cardCount={20}
                actors={credits?.cast}
                showTitle={"credits"}
              />
            </div>
          )}
          <div className="mt-[64px] pb-[64px]">
            <Carousel
              movies={relatedMovies?.results || relatedMovies?.cast}
              cardCount={20}
              showTitle={type != "person" ? `You May Also Like` : "Acted in"}
              media={type != "person" ? type : "movie"}
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
