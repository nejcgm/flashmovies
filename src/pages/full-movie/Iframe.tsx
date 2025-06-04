import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchSpecific, FetchSpecificResponse } from "../../functions/Fetching.js";
import BackButton from "../../components/BackButton";
import ShareButton from "../../components/ShareButton.js";
import ProviderComponent from "./components/ProviderComponent.js";

const Iframe = () => {
  const [info, setInfo] = useState<FetchSpecificResponse>();
  const [searchParams] = useSearchParams();
  const movieId = searchParams.get("id");
  const type = searchParams.get("type");
  const [currentProviderUrl, setCurrentProviderUrl] = useState('');

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
      <div className="flex gap-4 items-center  mb-[24px]">
        <BackButton />
        <div className="font-roboto text-[48px] text-white">
          {info?.title || info?.name}
        </div>
        <ShareButton />
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
      />
      </div>
    </>
  );
};

export default Iframe;
