import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  fetchSpecific,
  FetchSpecificResponse,
} from "../../functions/Fetching.js";
import BackButton from "../../components/BackButton";
import ShareButton from "../../components/ShareButton.js";
import ProviderComponent from "./components/ProviderComponent.js";
import Meta from "../../SEO/meta.tsx";
import AffiliateLinks from '../../components/AffiliateLinks';

const WatchMoviePage = () => {
  const [info, setInfo] = useState<FetchSpecificResponse>();
  const [searchParams] = useSearchParams();
  const [currentProviderUrl, setCurrentProviderUrl] = useState("");
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
      <Meta 
        title={`Watch ${info?.title || info?.name} ${info?.release_date ? `(${new Date(info.release_date).getFullYear()})` : info?.first_air_date ? `(${new Date(info.first_air_date).getFullYear()})` : ''} Free - Flash Movies`}
        description={info?.overview ? `Stream ${info?.title || info?.name} in HD. ${info.overview.slice(0, 100)}... Watch free on Flash Movies.` : `Stream ${info?.title || info?.name} free in HD quality on Flash Movies.`}
        image={
          info?.backdrop_path 
            ? `https://image.tmdb.org/t/p/w1280${info.backdrop_path}` 
            : info?.poster_path 
              ? `https://image.tmdb.org/t/p/w500${info.poster_path}` 
              : "https://flashmovies.xyz/flash-movies-logo.png"
        }
      url={window.location.href}
        keywords={[
          info?.title || info?.name || '',
          ...(info?.genres?.map((genre: { name: string }) => genre.name) || []),
          `stream ${type}`, `watch ${type} online`, `${type} free`, 'flash movies', 'HD streaming'
        ].filter(Boolean)}
        type={type === 'movie' ? 'video.movie' : 'video.tv_show'}
        publishedTime={info?.release_date || info?.first_air_date}
      />
      <div className="flex font-roboto items-center mb-[14px] content-center text-white justify-between">
        <div className="flex gap-4 content-center">
          <BackButton />
          <div className="text-[24px] md:text-[32px] lg:text-[48px]">
            {info?.title || info?.name}
          </div>
          <ShareButton />
        </div>
      </div>
      <div className=" w-full aspect-[16/9] max-w-[1200px] mx-auto relative">
        <iframe
          className="w-full h-full"
          src={currentProviderUrl}
          referrerPolicy="origin"
          frameBorder="0"
          allowFullScreen
        ></iframe>
        <ProviderComponent
          newProvider={setCurrentProviderUrl}
          title="Choose a Provider"
          movieId={movieId!}
          type={type!}
          className="mt-[8px]"
        />

        <div className="mt-6">
          <AffiliateLinks 
            movieTitle={info?.title || info?.name || 'This Movie'}
            className="bg-gradient-to-r from-[#000] to-[#111] border border-[#f5c518]"
          />
        </div>
      </div>
    </>
  );
};

export default WatchMoviePage; 