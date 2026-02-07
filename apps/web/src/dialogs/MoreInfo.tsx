import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import Cross from "../assets/gridicons_cross.png";
import Play from "../assets/play2.png";
import Homeicon from "../assets/homeIcon.png";
import Rating from "../components/Rating";
import { fetchSpecific, FetchSpecificResponse } from "../utils/fetching.ts";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { convertMinutesToHoursAndMinutes } from "../utils/helpers.ts";
import { ClickTypeEnum } from "../utils/types.ts";
import { redirectForMovie } from "../utils/contextAdRedirect.ts";
import { useAdTracker } from "../context/AdTrackerContext.tsx";
import { useUser } from "../context/UserContext.tsx";

interface MoreInfoProps {
  movieId: string | null;
  onCancel: () => void;
  onTrailer: () => void;
  type: string | null;
}

const MoreInfo: React.FC<MoreInfoProps> = ({
  movieId,
  onCancel,
  onTrailer,
  type,
}) => {
  const [info, setInfo] = useState<FetchSpecificResponse>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { incrementClick } = useAdTracker();
  const { isPro } = useUser();

  useEffect(() => {
    const loadInfo = async () => {
      setLoading(true);
      const data = await fetchSpecific(type, movieId, "", null, "");
      if (data) {
        setInfo(data);
      }
      setLoading(false);
    };
    loadInfo();
  }, [movieId]);

  const infoContent = (
    <>
      {info && (
        <>
          <div className="z-50 fixed bg-black bg-opacity-35 top-0 left-0 w-full h-screen justify-center items-center flex flex-col">
            <div className="h-auto w-[350px] sm:w-[620px] flex flex-col">
              <button
                onClick={() => {
                  onCancel();
                }}
                className="hover:bg-white/10 p-2 rounded-full mb-1 self-end"
              >
                <img className="w-[24px] sm:w-[32px]" src={Cross} alt="" />
              </button>
              <div className="bg-[#1A1A1A] p-[24px] flex flex-col rounded-md">
                {/*top card*/}
                {loading ? (
                  <div className="w-full h-[305px] flex items-center justify-center">
                    <Spinner />
                  </div>
                ) : (
                  <>
                    <div className="flex gap-3">
                      <button
                      className="flex gap-3 w-full"
                        onClick={() => {
                          navigate(`/movie-info/?id=${movieId}&type=${type}`);
                          onCancel();
                        }}
                      >
                        <img
                          className="rounded-lg w-[72px]"
                          src={`https://image.tmdb.org/t/p/w500${info.poster_path}`}
                          alt=""
                        />
                        <div className="text-white font-roboto w-full">
                          <div className="font-bold w-fill items-center flex justify-between text-[18px] sm:text-[24px]">
                            <div className="text-left">{info.title || info.name}</div>
                           
                              <img
                                className="w-[20px] sm:w-[28px]"
                                src={Homeicon}
                                alt=""
                              />
                          </div>

                          <ul className="list-disc list-inside flex text-[11px] sm:text-[14px] text-[#BBBBBB] gap-4 marker:text-[12px] ">
                            <li className="list-none">
                              {info.release_date || info.first_air_date}
                            </li>
                            {type == "movie" && (
                              <li className="">
                                {convertMinutesToHoursAndMinutes(
                                  info.runtime || 0
                                )}
                              </li>
                            )}
                            <li>{info.original_language}</li>
                          </ul>
                          <ul className="list-disc list-inside flex text-[11px] sm:text-[14px] text-[#BBBBBB] gap-2 marker:text-[12px] marker:leading-[24px]">
                            {info?.genres
                              ?.slice(0, 3)
                              .map((item: { name: string }, index: number) => (
                                <li className="first:list-none" key={index}>
                                  {item.name}
                                </li>
                              ))}
                          </ul>

                          {info.vote_average > 0 && (
                            <div className="flex text-[#BBBBBB] text-[12px] sm:text-[16px]">
                              <Rating rating={info.vote_average} />
                              /10
                            </div>
                          )}
                        </div>
                      </button>
                    </div>
                    <div className="font-roboto text-white text-[12px] sm:text-[14px] mt-[16px]">
                      {info.overview
                        ? info.overview
                        : "No description avaliable"}
                    </div>
                    <div className="font-roboto text-white text-[12px] sm:text-[14px] mt-[16px] ">
                      <span className="text-[#BBBBBB] font-semibold">
                        Tagline:{" "}
                      </span>
                      {info.tagline ? (
                        <span>{info.tagline}</span>
                      ) : (
                        "sorry, no tagline available"
                      )}
                    </div>
                    {/*trailer*/}
                    <div className="flex gap-3 font-semibold">
                      <button
                        onClick={() => {
                          navigate(`/full-movie/?id=${movieId}&type=${type}`);
                          redirectForMovie(ClickTypeEnum.MOVIE_CARD, info.title, movieId, incrementClick, isPro);
                        }}
                        className="mb-[32px] items-center gap-1 justify-center flex text-[12px] sm:text-[14px] font-robo text-[#5799F0] bg-[#2C2C2C]
                      hover:bg-[#30353D] px-3 sm:px-6 py-[6px] mt-[18px] rounded-full flex-1"
                      >
                        <div>Watch {type == "movie" ? "Movie" : "Series"}</div>
                        <img
                          className="w-[14px] sm:w-[16px] bg-[#2C2C2C]"
                          src={Play}
                          alt=""
                        />
                      </button>
                      <button 
                      onClick={() => {
                        onTrailer();
                        onCancel();
                      }}
                        className="mb-[32px] items-center gap-1 flex text-[12px] sm:text-[14px] font-robo text-[#5799F0] 
                   bg-[#2C2C2C] hover:bg-[#30353D] px-3 sm:px-6 py-[6px] mt-[18px] rounded-full flex-2"
                      >
                        Play Trailer
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );

  return ReactDOM.createPortal(infoContent, document.body);
};

export default MoreInfo;
