import React, { useEffect, useState } from "react";
import { fetchSpecific } from "../../functions/Fetching.js";
import GenreButton from "./GenreButton";
import { Genre } from "../../functions/Interfaces.ts";

interface GenreListComponentProps {
  type: string;
  genreList: React.Dispatch<React.SetStateAction<number[]>>;
}

const GenreListComponent: React.FC<GenreListComponentProps> = ({
  type,
  genreList,
}) => {
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
      <div className="w-[100%] sm:w-[70%] flex flex-wrap gap-2">
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

export default GenreListComponent;
