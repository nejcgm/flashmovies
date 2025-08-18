import React, { useState } from "react";
import MoreInfo from "../../dialogs/MoreInfo";
import VideoPlayer from "../../dialogs/VideoPlayer";
import Rating from "../../components/Rating";
import VoteCount from "../../components/VoteCount";
import { redirectForMovie } from '../../utils/contextAdRedirect';
import { useAdTracker } from '../../context/AdTrackerContext';
import { ClickTypeEnum } from '../../utils/types';

interface HeroCardProps {
  backdrop: string;
  poster: string;
  title: string;
  rating: number;
  movieId: string | null;
  overview: string;
  voteCount: number;
  type: string | null;
  timerActive: () => void;
}

const HeroCard: React.FC<HeroCardProps> = ({
  backdrop,
  poster,
  title,
  rating,
  movieId,
  overview,
  voteCount,
  type,
  timerActive,
}) => {
  const [displayInfo, setDisplayInfo] = useState(false);
  const [trailer, setTrailer] = useState(false);
  const { incrementClick } = useAdTracker();

  const handlePlayClick = () => {
    redirectForMovie(ClickTypeEnum.HERO_CARD, title, movieId, incrementClick);

    setTrailer(true);
    timerActive();
  };

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
          title={title}
          onCancel={() => {
            setTrailer(false);
          }}
        />
      )}

      <button
        onClick={handlePlayClick}
        className="group min-w-[100%]"
      >
        <div className={`min-w-[100%] xl:min-w-[850px] lg:min-w-[650px] `}>
          <div
            className="w-full min-w-[100%] bg-cover bg-center bg-no-repeat aspect-[16/10]"
            style={{
              backgroundImage: `url(https://image.tmdb.org/t/p/w1280${backdrop})`,
              borderRadius: "1%",
            }}
          >
            <div className="w-full h-full flex place-items-end group-hover:bg-black/10">
              <div className="w-full bg-gradient-to-t from-black to-transparent flex">
                <div className=" w-[90px] sm:w-[120px] md:w-[160px] lg:w-[130px] xl:w-[160px]">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setDisplayInfo(true);
                      timerActive();
                    }}
                    className="relative"
                  >
                    <img
                      className="rounded-lg shadow-xl w-full min-w-[80px]"
                      src={`https://image.tmdb.org/t/p/w500${poster}`}
                      alt=""
                    />
                  </div>
                </div>

                <div className="flex self-end gap-4 ml-[12px]">
                  <div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="group-hover:text-[#f5c518] text-white w-[42px] sm:w-[72px]"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      role="presentation"
                    >
                      <path d="M10.803 15.932l4.688-3.513a.498.498 0 0 0 0-.803l-4.688-3.514a.502.502 0 0 0-.803.402v7.026c0 .412.472.653.803.402z"></path>
                      <path d="M12 24C5.373 24 0 18.627 0 12S5.373 0 12 0s12 5.373 12 12-5.373 12-12 12zm0-1c6.075 0 11-4.925 11-11S18.075 1 12 1 1 5.925 1 12s4.925 11 11 11z"></path>
                    </svg>
                  </div>
                  <div className="max-w-[75%] sm:max-w-[70%] text-left">
                    <div className="text-[18px] sm:text-[24px] font-roboto text-white font-medium">
                      {title}
                    </div>
                    <div className="text-[#b3b3b3] text-[11px] leading-[14px] sm:leading-[16px] sm:text-[12px] md:text-[16px]">
                      <span className="sm:hidden">{`${overview?.slice(0, 80)}...`}</span>
                      <span className="hidden sm:block">{`${overview?.slice(0, 120)}...`}</span>
                    </div>
                    <div className="flex items-center text-[#BBBBBB] text-[12px] sm:text-[16px] gap-3">
                      <Rating rating={rating} />
                      <VoteCount voteCount={voteCount} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </button>
    </>
  );
};

export default HeroCard;
