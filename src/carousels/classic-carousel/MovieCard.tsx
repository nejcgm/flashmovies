import React, { useState } from "react";
import MoreInfo from "../../dialogs/MoreInfo";
import VideoPlayer from "../../dialogs/VideoPlayer";
import Rating from "../../components/Rating";
import InfoCta from "../../components/InfoCta";
import LazyImage from "../../components/LazyImage";
const MoviePlaceholder = "/dark-mode-img-placeholder.png";
import { useNavigate } from "react-router-dom";

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
      <div className="max-w-[200px] flex flex-col min-w-[134px] md:min-w-[180px] xl:min-w-[200px] w-full">
        <button
          onClick={() => {
            navigate(`/movie-info/?id=${movieId}&type=${type}`);
          }}
          className="group relative bottom-[-7px]"
        >
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <LazyImage
            className="rounded-t-lg h-[200px] sm:h-[270px] xl:h-[300px] w-full object-cover"
            src={image ? `https://image.tmdb.org/t/p/w500${image}` : MoviePlaceholder}
            alt={`${title || 'Movie'} poster`}
            placeholder={MoviePlaceholder}
          />
        </button>

        <div className="flex flex-col flex-1 rounded-b-lg bg-[#1A1A1A] text-white text-[12px] sm:text-[16px] font-roboto px-2 py-5 ">
          {/*bottom section*/}
          {rating > 0 ? (
            <div className="mb-[8px]">
              <Rating rating={rating} />
            </div>
          ) : (
            <div className="mb-[12px] text-[12px]">No rating</div>
          )}
          <div className="line-clamp-2 h-[48px] mb-[4px]">{title}</div>

          
          <InfoCta
            infoMessage={"More Info"}
            infoDisplay={() => setDisplayInfo(true)}
          />
        </div>
      </div>
    </>
  );
};

export default MovieCard;
