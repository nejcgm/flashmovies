import React, { useState } from "react";
import GenreSpecific from "./GenreSpecific";
import VideoPlayer from "../../dialogs/VideoPlayer";

interface MovieSpecificDescriptionProps {
  description: string;
  movieId: string;
  type: string | null;
  poster: string;
  genres: [];
  title: string;
}
const MovieSpecificDescription: React.FC<MovieSpecificDescriptionProps> = ({
  description,
  movieId,
  type,
  poster,
  genres,
  title,
}) => {
  const [expand, setExpand] = useState(500);
  const ContentLength = description?.length;
  const [trailer, setTrailer] = useState(false);

  return (
    <>
      {trailer && (
        <VideoPlayer
          movieId={movieId}
          title={title}
          type={type}
          onCancel={() => {
            setTrailer(false);
          }}
        />
      )}
      <div className="text-[16px] sm:text-[18px] mt-[16px] text-yellow-500 lg:hidden flex font-bold">Watch Trailer</div>
      <div className="w-full flex gap-4 md:w-[70%] pr-[6px] md:pr-[0px]">
        <button
          className="flex lg:hidden flex-1  rounded-lg min-w-[120px] max-h-[180px] w-[150px]"
          onClick={() => {
            setTrailer(true);
          }}
        >
          <div
            className="flex-1  rounded-lg min-w-[120px] max-h-[180px] h-[180px] w-[150px] bg-cover bg-center"
            style={{
              backgroundImage: `url(${
                poster?.length > 1
                  ? `https://image.tmdb.org/t/p/w500${poster}`
                  : ""
              })`,
            }}
          >
            <div className="w-full h-full flex items-end align justify-start gap-1 p-2 bg-black/20
             hover:bg-black/40 group">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="group-hover:text-[#f5c518] transition-all duration-300 text-white h-[32px]"
                viewBox="0 0 24 24"
                fill="currentColor"
                role="presentation"
              >
                <path d="M10.803 15.932l4.688-3.513a .498.498 0 0 0 0-.803l-4.688-3.514a .502.502 0 0 0-.803.402v7.026c0 .412.472.653.803.402z"></path>
                <path d="M12 24C5.373 24 0 18.627 0 12S5.373 0 12 0s12 5.373 12 12-5.373 12-12 12zm0-1c6.075 0 11-4.925 11-11S18.075 1 12 1 1 5.925 1 12s4.925 11 11 11z"></path>
              </svg>
            </div>
          </div>
        </button>

        <div className="flex-col flex lg:mt-[24px]">
          <GenreSpecific genres={genres} />

          <div className="mt-[8px] lg:mt-[16px] text-[12px] sm:text-[16px]">
            {description?.slice(0, expand)}
            <button
              onClick={() => {
                setExpand((prevValue) =>
                  prevValue === 500 ? ContentLength : 500
                );
              }}
              className="text-[#BBBBBB]"
            >
              {ContentLength < 500
                ? " "
                : expand == 500
                ? " ...Read More"
                : " ...View Less"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MovieSpecificDescription;
