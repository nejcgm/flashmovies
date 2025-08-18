import React, { useState } from "react";
import VideoPlayer from "../../dialogs/VideoPlayer";
import VoteCount from "../../components/VoteCount";
import InfoCta from "../../components/InfoCta";
import MoreInfo from "../../dialogs/MoreInfo";
import LazyImage from "../../components/LazyImage";
const MoviePlaceholder = "/dark-mode-img-placeholder.png";
const PersonPlaceholder = "/dark-mode-avatar-placeholder.png";
import Rating from "../../components/Rating";
import { useNavigate } from "react-router-dom";
import { triggerContextAdRedirectDirect } from '../../utils/contextAdRedirect';
import { useAdTracker } from '../../context/AdTrackerContext';
import { ClickTypeEnum } from '../../utils/types';
//import { MediaType } from "../../functions/Interfaces.ts";

interface ListItemProps {
  poster: string;
  title: string;
  movieId: string | null;
  voteCount: number;
  year: string;
  type: string;
  rating: number | null;
  largeScreen: boolean;
  index?: number | null | undefined;
  onCancel: () => void;
}

const ListItem: React.FC<ListItemProps> = ({
  poster,
  title,
  movieId,
  voteCount,
  year,
  type,
  rating,
  largeScreen,
  index,
  onCancel,
}) => {
  const [displayInfo, setDisplayInfo] = useState<boolean>(false);
  const [trailer, setTrailer] = useState<boolean>(false);
  const navigate = useNavigate();
  const { incrementClick } = useAdTracker();

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
      <div className="flex gap-3 max-h-[90px] sm:max-h-[90px] lg:max-h-[130px]">
        <button
          onClick={() => {
            triggerContextAdRedirectDirect({
              eventLabel: 'list_item_poster_click',
              movieTitle: title,
              movieId: movieId,
              clickType: ClickTypeEnum.MOVIE_CARD
            }, incrementClick);
            setTrailer(true);
          }}
        >
          <LazyImage
            className={`${
              largeScreen
                ? "lg:w-[90px] lg:h-[130px] w-[60px] h-[90px] "
                : `sm:w-[70px] sm:h-[100px] h-[80px] w-[50px]`
            } rounded-lg object-cover`}
            src={poster ? `https://image.tmdb.org/t/p/w500${poster}` : (type === 'person' ? PersonPlaceholder : MoviePlaceholder)}
            alt={`${title || 'Content'} ${type === 'person' ? 'photo' : 'poster'}`}
            placeholder={type === 'person' ? PersonPlaceholder : MoviePlaceholder}
          />
        </button>

        <button
          onClick={() => {
            triggerContextAdRedirectDirect({
              eventLabel: 'list_item_navigation_click',
              movieTitle: title,
              movieId: movieId,
              clickType: ClickTypeEnum.MOVIE_CARD
            }, incrementClick);
            navigate(`/movie-info/?id=${movieId}&type=${type}`);
            onCancel();
          }}
          className={`${
            type != "person" && "self-start"
          } w-full flex-1 flex group`}
        >
          <div className="font-roboto text-left flex flex-col h-full">
            <div className="h-[32px] items-center flex gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="group-hover:text-[#f5c518] text-white w-[18px] sm:w-[24px] sm:h-[24px]"
                viewBox="0 0 24 24"
                fill="currentColor"
                role="presentation"
              >
                <path d="M10.803 15.932l4.688-3.513a .498.498 0 0 0 0-.803l-4.688-3.514a .502.502 0 0 0-.803.402v7.026c0 .412.472.653.803.402z"></path>
                <path d="M12 24C5.373 24 0 18.627 0 12S5.373 0 12 0s12 5.373 12 12-5.373 12-12 12zm0-1c6.075 0 11-4.925 11-11S18.075 1 12 1 1 5.925 1 12s4.925 11 11 11z"></path>
              </svg>
              <div
                className={`text-white text-[12px] sm:text-[14px] ${
                  largeScreen && "lg:text-[16px]"
                } flex gap-1 font-medium`}
              >
                {index !== null && index !== undefined && (
                  <div>{index + 1}.</div>
                )}
                <div className="sm:hidden">
                  {title.length > 30 ? `${title.substring(0, 30)}...` : title}
                </div>
                <div className="hidden sm:block">{title}</div>
              </div>
            </div>
            <div className="text-[#C0C0C0] text-[11px] sm:text-[14px] flex gap-2">
              <div>{year?.substring(0, 4)}</div>
              <div className="text-white">
                {rating && <Rating rating={rating} />}
              </div>
            </div>

            <div className="h-full flex">
              <div className="flex w-[100px] justify-between self-end">
                {voteCount > 0 ? (
                  <VoteCount voteCount={voteCount} />
                ) : (
                  <div></div>
                )}

                {type != "person" && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className=""
                  >
                    <InfoCta
                      infoDisplay={() => {
                        setDisplayInfo(true);
                      }}
                      infoMessage={""}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </button>
      </div>
    </>
  );
};

export default ListItem;
