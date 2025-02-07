import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import Cross from "../assets/gridicons_cross.png";
import Play from "../assets/play2.png";
import Homeicon from "../assets/homeIcon.png";
import Rating from "../components/Rating";
import { fetchSpecific } from "../functions/Fetching.js";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";

const MoreInfo = ({ movieId, onCancel, onTrailer, media }) => {
  const [info, setInfo] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadInfo = async () => {
      setLoading(true);
      const data = await fetchSpecific(media, movieId, "", "", "");
      setInfo(data);
      setLoading(false);
    };
    loadInfo();
  }, [movieId]);

  const convertMinutesToHoursAndMinutes = (minutes) => {
    const hours = (minutes / 60) | 0;
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const infoContent = (
    <>
      <div className="z-50 fixed bg-black bg-opacity-35 top-0 left-0 w-full h-full h-screen justify-center items-center flex flex-col">
        <div className="h-auto w-auto sm:w-[620px] flex flex-col">
          <button
            onClick={() => {
              onCancel();
            }}
            className="hover:bg-white/10 p-2 rounded-full mb-1 self-end"
          >
            <img src={Cross} alt="" />
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
                  <a href={info.homepage} target="_blank">
                    <img
                      className="rounded-lg w-[72px]"
                      src={`https://image.tmdb.org/t/p/w500${info.poster_path}`}
                      alt=""
                    />
                  </a>

                  <div className="text-white font-roboto w-full">
                    <div className="font-bold w-fill items-center flex justify-between text-[24px]">
                      <div>{info.title || info.name}</div>
                      <button
                        onClick={() => {
                          navigate(`/movie-info/?id=${movieId}&type=${media}`),
                            onCancel();
                        }}
                      >
                        <img className="w-[28px]" src={Homeicon} alt="" />
                      </button>
                    </div>

                    <ul className="list-disc list-inside flex text-[14px] text-[#BBBBBB] gap-4 marker:text-[12px] ">
                      <li className="list-none">
                        {info.release_date || info.first_air_date}
                      </li>
                      <li className="">
                        {convertMinutesToHoursAndMinutes(info.runtime || 0)}
                      </li>
                      <li>{info.original_language}</li>
                    </ul>
                    <ul className="list-disc list-inside flex text-[14px] text-[#BBBBBB] gap-2 marker:text-[12px] marker:leading-[24px]">
                      {info?.genres?.slice(0, 3).map((item, index) => (
                        <li className="first:list-none" key={index}>
                          {item.name}
                        </li>
                      ))}
                    </ul>

                    <div className="flex text-[#BBBBBB]">
                      <Rating rating={info.vote_average} />
                      /10
                    </div>
                  </div>
                </div>
                <div className="font-roboto text-white text-[14px] mt-[16px]">
                  {info.overview}
                </div>
                <div className="font-roboto text-white text-[14px] mt-[16px] ">
                  <span className="text-[#BBBBBB] font-semibold">
                    Tagline:{" "}
                  </span>
                  <span>{info.tagline}</span>
                </div>
                {/*trailer*/}
                <div className="flex gap-3 font-semibold">
                  <button
                    onClick={() => {
                      onTrailer(), onCancel();
                    }}
                    className="mb-[32px] items-center gap-1 justify-center flex text-[14px] font-robo text-[#5799F0] bg-[#2C2C2C]
               hover:bg-[#30353D] px-6 py-[6px] mt-[18px] rounded-full flex-1"
                  >
                    <div>Play Trailer</div>
                    <img className="w-[16px] bg-[#2C2C2C]" src={Play} alt="" />
                  </button>
                  <a
                    href={`https://www.imdb.com/title/${info.imdb_id}`}
                    target="_blank"
                    className="mb-[32px] items-center gap-1 flex text-[14px] font-robo text-[#5799F0] 
              bg-[#2C2C2C] hover:bg-[#30353D] px-6 py-[6px] mt-[18px] rounded-full flex-2"
                  >
                    Check on IMDB
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return ReactDOM.createPortal(infoContent, document.body);
};

export default MoreInfo;
