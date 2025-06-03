import React from "react";
import RickRoll from "../../assets/rickroll.jpg";
import ChartIcon from "../../assets/chart.png";
import { useNavigate } from "react-router-dom";

interface ActorCardProps {
  popularity: number | null;
  image: string;
  name: string;
  job: string;
  actorId: string;
  media: string;
}

const ActorCard: React.FC<ActorCardProps> = ({
  popularity,
  image,
  name,
  job,
  actorId,
  media,
}) => {
  const navigate = useNavigate();
  
  return (
    <>
      <div className="max-w-[200px] min-w-[150px] md:min-w-[180px] xl:min-w-[200px] w-full text-white font-roboto flex flex-col items-center">
        <button
          className="group relative"
          onClick={() => {
            navigate(`/movie-info/?id=${actorId}&type=${media}`);
          }}
        >
          <div className="aspect-square overflow-hidden rounded-full">
            <div className="absolute inset-0 flex items-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <img
              className="object-cover w-[120px] sm:w-full sm:h-fulll"
              src={
                image ? `https://image.tmdb.org/t/p/w500/${image}` : RickRoll
              }
              alt=""
            />
          </div>
        </button>
        <div className="mt-[8px] flex w-full items-center">
          <div className="justify-end flex w-[54%] text-[12px] sm:text-[16px]">
            {popularity && popularity.toFixed(0)}
          </div>
          <img className="w-[24px] sm:w-[32px]" src={ChartIcon} alt="" />
        </div>
        <div className="text-[14px] sm:text-[16px]">{name}</div>
        <div className="text-[#BBBBBB] text-[12px] sm:text-[16px]">{job}</div>
      </div>
    </>
  );
};

export default ActorCard;
