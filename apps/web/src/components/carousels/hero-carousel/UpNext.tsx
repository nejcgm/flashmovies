import { UpNextCard } from "./";
import type { MediaListItem } from "../../../interfaces/media/index.ts";

interface UpNextProps {
  moviesHero: MediaListItem[];
  count: number;
  timerActive: () => void;
}

export function UpNext({ moviesHero, count, timerActive }: UpNextProps) {
  const movies = moviesHero || [];

  const getMovies = (): MediaListItem[] => {
    return [1, 2, 3].map((offset) => {
      const index = (count + offset) % movies.length;
      return movies[index];
    }).filter((movie): movie is MediaListItem => movie != null);
  };

  const movieData = getMovies();

  return (
    <>
      <div className="ml-[12px]">
        <div className="text-[#F5C518] font-popins font-bold text-[20px] first-letter:uppercase mb-[8px]">
          Up Next
        </div>
        <div className="flex flex-col gap-4 p-4 bg-gradient-to-t from-black to-[#111111] rounded-lg">
          {movieData.map((movie, idx) => (
            <div key={idx}>
              <UpNextCard
                poster={movie.poster_path ?? ""}
                title={movie.title ?? movie.name ?? ""}
                movieId={String(movie.id)}
                voteCount={movie.vote_count ?? 0}
                timerActive={timerActive}
                type={movie.media_type || "movie"}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

