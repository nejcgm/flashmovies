import React from "react";
import RickRoll from "../assets/rickroll.jpg";
import ChartIcon from "../assets/chart.png";
import { useNavigate, useParams } from "react-router-dom";

const ActorCard = ({ popularity, image, name, job, actorId, media }) => {
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
              className="object-cover w-full h-fulll"
              src={
                image ? `https://image.tmdb.org/t/p/w500/${image}` : RickRoll
              }
              alt=""
            />
          </div>
        </button>
        <div className="mt-[8px] flex w-full items-center">
          <div className="justify-end flex w-[55%]">
            {popularity.toFixed(0)}
          </div>
          <img src={ChartIcon} alt="" />
        </div>
        <div>{name}</div>
        <div className="text-[#BBBBBB]">{job}</div>
      </div>
    </>
  );
};

export default ActorCard;
