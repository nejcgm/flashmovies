import React, { useState } from "react";
import MoreInfo from "../../dialogs/MoreInfo";
import VideoPlayer from "../../dialogs/VideoPlayer";
import Rating from "../../components/Rating";
import InfoCta from "../../components/InfoCta";
import LazyImage from "../../components/LazyImage";
import { useNavigate } from "react-router-dom";
import { redirectForMovie } from '../../utils/contextAdRedirect';
import { useAdTracker } from '../../context/AdTrackerContext';
import { ClickTypeEnum } from '../../utils/types';

const MoviePlaceholder = "/dark-mode-img-placeholder.png";

interface MovieCardProps {
  title: string;
  image: string;
  rating: number;
  movieId: string | null;
  type: string | null;
}

const MovieCard: React.FC<MovieCardProps> = ({
  title,
  image,
  rating,
  movieId,
  type,
}) => {
  const [displayInfo, setDisplayInfo] = useState(false);
  const [trailer, setTrailer] = useState(false);
  const navigate = useNavigate();
  const { incrementClick } = useAdTracker();

  const handleCardClick = () => {
    redirectForMovie(ClickTypeEnum.MOVIE_CARD, title, movieId, incrementClick);
    navigate(`/movie-info/?id=${movieId}&type=${type}`);
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
      <div className="max-w-[200px] flex flex-col min-w-[134px] md:min-w-[180px] xl:min-w-[200px] w-full">
        <button
          onClick={handleCardClick}
          className="group relative bottom-[-7px] w-full"
        >
          <div className="relative">
            <LazyImage
              className="rounded-t-lg h-[200px] sm:h-[270px] xl:h-[300px] w-full object-cover"
              src={image ? `https://image.tmdb.org/t/p/w500${image}` : MoviePlaceholder}
              alt={`${title || 'Movie'} poster`}
              placeholder={MoviePlaceholder}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 rounded-t-lg"></div>
          </div>
        </button>

        <button
          onClick={handleCardClick}
          className="group flex flex-col flex-1 rounded-b-lg bg-[#1A1A1A] text-white text-[13px] sm:text-[16px] font-roboto px-2 py-5 hover:bg-[#2A2A2A] transition-colors duration-300"
        >
          {/*bottom section*/}
          {rating > 0 ? (
            <div className="mb-[8px]">
              <Rating rating={rating} />
            </div>
          ) : (
            <div className="mb-[12px] text-[12px]">No rating</div>
          )}
          <div className="line-clamp-2 h-[48px] mb-[4px] text-left font-medium">{title}</div>

          <div
            onClick={(e) => {
              e.stopPropagation();
              setDisplayInfo(true);
            }}
            className="self-start"
          >
            <InfoCta
              infoMessage={"More Info"}
              infoDisplay={() => setDisplayInfo(true)}
            />
          </div>
        </button>
      </div>
    </>
  );
};

export default MovieCard;
