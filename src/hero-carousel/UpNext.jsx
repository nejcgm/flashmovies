import React from "react";
import UpNextCard from "./UpNextCard";

const UpNext = ({ moviesHero, count, timerActive }) => {
  const movies = moviesHero?.results || [];

  const getMovies = () => {
    return [1, 2, 3].map((offset) => {
      const index = (count + offset) % movies.length;
      return movies[index] || "";
    });
  };

  const movieData = getMovies();

  return (
    <>
      <div className="ml-[12px]">
        <div className="text-[#F5C518] font-popins font-bold text-[20px] first-letter:uppercase mb-[8px]">
          Up Next
        </div>
        <div className="flex flex-col gap-4 p-4 bg-gradient-to-t from-black to-[#111111] rounded-lg">
          {movieData.map((movies, idx) => (
            <div key={idx}>
              <UpNextCard
                poster={movies.poster_path}
                title={movies.title}
                movieId={movies.id}
                voteCount={movies.vote_count}
                timerActive={timerActive}
                media={movies.media_type || "movie"}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default UpNext;
