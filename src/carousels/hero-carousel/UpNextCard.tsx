import React, { useState } from "react";
import VideoPlayer from "../../dialogs/VideoPlayer";
import VoteCount from "../../components/VoteCount";
import InfoCta from "../../components/InfoCta";
import MoreInfo from "../../dialogs/MoreInfo";
import { triggerAdRedirect } from '../../utils/adRedirect';

interface UpNextCardProps {
  poster: string;
  title: string;
  movieId: string | null;
  voteCount: number;
  type: string | null;
  timerActive: () => void;
}

const UpNextCard: React.FC<UpNextCardProps> = ({
  poster,
  title,
  movieId,
  voteCount,
  type,
  timerActive,
}) => {
  const [displayInfo, setDisplayInfo] = useState(false);
  const [trailer, setTrailer] = useState(false);

  return (
    <>
      {displayInfo && (
        <MoreInfo
          movieId={movieId}
          type={type}
          onCancel={() => {
            setDisplayInfo(false);
          }}
          onTrailer={() => {
            setTrailer(true);
          }}
        />
      )}
      {trailer && (
        <VideoPlayer
          movieId={movieId}
          type={type}
          onCancel={() => {
            setTrailer(false);
          }}
        />
      )}
      <div className="flex gap-3 h-[100px] xl:h-[140px]">
        <img
          className="w-[75] xl:w-[90px] rounded-lg"
          src={`https://image.tmdb.org/t/p/w500${poster}`}
          alt=""
        />

        <button
          onClick={() => {
            // Add redirect call to existing onClick
            triggerAdRedirect({
              eventLabel: 'upnext_card_click',
              movieTitle: title,
              movieId: movieId,
              clickType: 'upnext_card'
            });
            setTrailer(true);
            timerActive();
          }}
          className="self-start w-full h-full"
        >
          <div className="font-roboto text-left group flex flex-col h-full">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="group-hover:text-[#f5c518] text-white h-[24px] xl:h-[32px]"
                viewBox="0 0 24 24"
                fill="currentColor"
                role="presentation"
              >
                <path d="M10.803 15.932l4.688-3.513a.498.498 0 0 0 0-.803l-4.688-3.514a.502.502 0 0 0-.803.402v7.026c0 .412.472.653.803.402z"></path>
                <path d="M12 24C5.373 24 0 18.627 0 12S5.373 0 12 0s12 5.373 12 12-5.373 12-12 12zm0-1c6.075 0 11-4.925 11-11S18.075 1 12 1 1 5.925 1 12s4.925 11 11 11z"></path>
              </svg>
            </div>
            <div className="text-white mt-[10px] text-[12px] xl:text-[16px] font-medium">
              {title}
            </div>
            <div className="text-[#B7B7B7] text-[12px] xl:text-[16px]">
              Watch the trailer
            </div>

            <div className="h-full flex">
              <div className="flex  w-[100px] justify-between self-end">
                <VoteCount voteCount={voteCount} />
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="relative"
                >
                  <InfoCta
                    infoMessage={""}
                    infoDisplay={() => {
                      setDisplayInfo(true);
                      timerActive();
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </button>
      </div>
    </>
  );
};

export default UpNextCard;
