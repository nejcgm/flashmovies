import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  fetchSpecific,
  FetchSpecificResponse,
} from "../../functions/Fetching.js";
import BackButton from "../../components/BackButton";
import ShareButton from "../../components/ShareButton.js";
import ProviderButton from "./components/ProviderButton.js";
import ProviderComponent from "./components/ProviderComponent.js";

const Iframe = () => {
  const [info, setInfo] = useState<FetchSpecificResponse>();
  const [searchParams] = useSearchParams();
  const [currentProviderUrl, setCurrentProviderUrl] = useState("");
  const movieId = searchParams.get("id");
  const type = searchParams.get("type");
  const addBlockUrl = "https://chrome.google.com/webstore/detail/adblock-plus-free-ad-bloc/cfhdojbkjhnklbpkdaibdccddilifddb";

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
      <div className="flex font-roboto items-center mb-[14px] content-center text-white justify-between">
        <div className="flex gap-4 content-center">
          <BackButton />
          <div className="text-[48px]">
            {info?.title || info?.name}
          </div>
          <ShareButton />
        </div>
        <div className="flex flex-col gap-1 items-center">
          <div className="text-[22px] font-bold">Recommended Adblock</div>
          <a
            href={addBlockUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <ProviderButton provider="Download" className={"bg-gray-500"} />
          </a>
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
      </div>
    </>
  );
};

export default Iframe;
