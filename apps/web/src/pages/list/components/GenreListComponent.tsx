import { useEffect, useState } from "react";
import { fetchSpecific } from "../../../client/tmdb.js";
import { GenreButton } from "./";
import { Genre } from "../../../interfaces/media/index.ts";

interface GenreListComponentProps {
  type: string;
  genreList: React.Dispatch<React.SetStateAction<number[]>>;
}

export function GenreListComponent({
  type,
  genreList,
}: GenreListComponentProps) {
  const [genre, setGenre] = useState<Genre[]>([]);

  useEffect(() => {
    const loadGenre = async () => {
      const data = await fetchSpecific("genre", type, "/list");
      if (data != null) {
        setGenre(data.genres);
      }
    };
    loadGenre();
  }, []);

  const idAppend = (id: number) => {
    genreList((prev: number[]) => [...prev, id]);
  };

  const removeItemId = (id: number) => {
    genreList((prev: number[]) => {
      return prev.filter((item: number) => item !== id);
    });
  };

  return (
    <>
      <div
        className="flex w-full flex-wrap gap-2 px-2 pb-4 sm:px-0"
        role="group"
        aria-label="Filter by genre"
      >
        {genre?.map((item: Genre, index: number) => (
          <GenreButton
            id={item.id}
            name={item.name}
            key={index}
            appendId={(id) => {
              idAppend(id);
            }}
            remove={(id) => {
              removeItemId(id);
            }}
          />
        ))}
      </div>
    </>
  );
};

