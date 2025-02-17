import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import GenreSpecific from "./GenreSpecific";

interface MovieSpecificDescriptionProps {
  description: string;
  movieId: string;
  type: string | null;
  poster: string;
  genres: [];
}
const MovieSpecificDescription: React.FC<MovieSpecificDescriptionProps> = ({
  description,
  movieId,
  type,
  poster,
  genres,
}) => {
  const [expand, setExpand] = useState(500);
  const ContentLength = description?.length;
  const navigate = useNavigate();

  return (
    <>
      <div className="w-full flex gap-4 md:w-[70%] mt-[24px] pr-[6px] md:pr-[0px]">
        <div className="flex lg:hidden">
          <img
            onClick={() => {
              navigate(`/fullmovie/?id=${movieId}&type=${type}`);
            }}
            className=" flex-1  rounded-lg min-w-[120px] max-h-[180px] w-[150px]"
            src={`https://image.tmdb.org/t/p/w500${poster}`}
            alt="poster"
          />
        </div>

        <div className="flex-col flex">
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
