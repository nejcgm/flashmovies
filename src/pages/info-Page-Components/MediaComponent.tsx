import React, { useState } from "react";
import VideoPlayer from "../../dialogs/VideoPlayer";
import VoteCount from "../../components/VoteCount";
import { useNavigate } from "react-router-dom";
import RickRoll from "../../assets/rickroll.jpg";

interface HeaderInfoProps {
  poster: string;
  vote: number;
  movieId: string | null;
  backdrop: string;
  type: string | null;
}
const HeaderInfo: React.FC<HeaderInfoProps> = ({
  poster,
  vote,
  movieId,
  backdrop,
  type,
}) => {
  const [trailer, setTrailer] = useState(false);
  const navigate = useNavigate();
  return (
    <>
      {trailer && (
        <VideoPlayer
          movieId={movieId}
          type={type}
          onCancel={() => {
            setTrailer(false);
          }}
        />
      )}

      <div className="flex w-full mt-[24px] gap-2 pr-[6px] sm:pr-[0px]">
        <button
         className="hidden lg:flex w-[400px] group bg-no-repeat rounded-lg bg-cover bg-center text-white"
          disabled={type == "person"}
          onClick={() => {
            navigate(`/full-movie/?id=${movieId}&type=${type}`);
          }}
          style={{
            backgroundImage: `url(${
              poster.length > 1
                ? `https://image.tmdb.org/t/p/w500${poster}`
                : RickRoll
            })`,
          }}
        >
          <div className=" flex  font-roboto text-white capitalize items-end gap-4 ml-[12px] mb-[12px]">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="group-hover:text-[#f5c518] text-white h-[42px] sm:h-[64px]"
                viewBox="0 0 24 24"
                fill="currentColor"
                role="presentation"
              >
                <path d="M10.803 15.932l4.688-3.513a.498.498 0 0 0 0-.803l-4.688-3.514a.502.502 0 0 0-.803.402v7.026c0 .412.472.653.803.402z"></path>
                <path d="M12 24C5.373 24 0 18.627 0 12S5.373 0 12 0s12 5.373 12 12-5.373 12-12 12zm0-1c6.075 0 11-4.925 11-11S18.075 1 12 1 1 5.925 1 12s4.925 11 11 11z"></path>
              </svg>
            
            <div className="text-[16px] sm:text-[20px]">Watch {type == "movie" ? "movie" : "series"}</div>
            </div>
          </div>
        </button>

        <button
          disabled={type == "person"}
          onClick={() => {
            setTrailer(true);
          }}
          className="flex-2 flex w-full group h-auto"
        >
          <div
            className="w-full h-full min-w-[100%] max-h-[530px] rounded-lg bg-cover bg-center bg-no-repeat aspect-[16/10] content-end p-4"
            style={{
              backgroundImage: `url(${
                backdrop.length > 1
                  ? `https://image.tmdb.org/t/p/w1280${backdrop}`
                  : RickRoll
              })`,
            }}
          >
            <div className="flex items-center gap-4 ml-[12px]">
              {type != "person" && (
                <>
                  <div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="group-hover:text-[#f5c518] text-white h-[42px] sm:h-[72px]"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      role="presentation"
                    >
                      <path d="M10.803 15.932l4.688-3.513a.498.498 0 0 0 0-.803l-4.688-3.514a.502.502 0 0 0-.803.402v7.026c0 .412.472.653.803.402z"></path>
                      <path d="M12 24C5.373 24 0 18.627 0 12S5.373 0 12 0s12 5.373 12 12-5.373 12-12 12zm0-1c6.075 0 11-4.925 11-11S18.075 1 12 1 1 5.925 1 12s4.925 11 11 11z"></path>
                    </svg>
                  </div>
                  <div className="max-w-[70%] text-left">
                    <div className="text-[18px] sm:text-[24px] font-roboto text-white capitalize">
                      play trailer
                    </div>
                    <div className="flex items-center text-[#BBBBBB] gap-3">
                      <VoteCount voteCount={vote} />
                    </div>
                  </div>{" "}
                </>
              )}
            </div>
          </div>
        </button>
      </div>
    </>
  );
};

export default HeaderInfo;
