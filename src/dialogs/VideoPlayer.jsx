import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactDOM from "react-dom";
import Cross from "../assets/gridicons_cross.png";
import { fetchSpecific } from "../functions/Fetching.js";

const VideoPlayer = ({ movieId, onCancel, media }) => {
  const [video, setVideo] = useState([]);
  const [trailer, setTrailer] = useState([]);

  useEffect(() => {
    const loadVideo = async () => {
      const data = await fetchSpecific(media, movieId, "/videos", "", "");
      setVideo(data);
    };
    loadVideo();
  }, [movieId]);

  useEffect(() => {
    const findTrailer = video?.results?.find((item) => item.type === "Trailer");
    setTrailer(findTrailer);
  }, [video]);
  console.log(trailer);

  const videoContent = (
    <>
      <div className="fixed z-50 bg-black bg-opacity-35 top-0 left-0 w-full h-full h-screen justify-center items-center flex flex-col">
        <div className="h-auto w-auto  flex flex-col">
          <button
            onClick={() => {
              onCancel();
            }}
            className="hover:bg-white/10 p-2 rounded-full mb-1 self-end"
          >
            <img src={Cross} alt="" />
          </button>
          <div className="bg-[#1A1A1A] p-[24px] flex flex-col rounded-md">
            <iframe
              className="lg:w-[800px] lg:h-[500px] w-[500px] h-[300px]"
              src={`https://www.youtube.com/embed/${trailer?.key}`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    </>
  );
  return ReactDOM.createPortal(videoContent, document.body);
};

export default VideoPlayer;
