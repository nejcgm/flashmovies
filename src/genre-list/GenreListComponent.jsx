import { useEffect, useState } from "react";
import { fetchSpecific } from "../functions/Fetching.js";
import GenreButton from "./genreButton";

const GenreListComponent = ({ type, genreList }) => {
  const [genre, setGenre] = useState([]);

  useEffect(() => {
    const loadGenre = async () => {
      const data = await fetchSpecific("genre", type, "/list", "");
      setGenre(data);
    };
    loadGenre();
  }, []);

  const idAppend = (id) => {
    genreList((prev) => [...prev, ...[id]]);
  };

  const removeItemId = (id) => {
    genreList((prev) => {
      return prev.filter((item) => item !== id);
    });
  };

  return (
    <>
      <div className="w-[100%] sm:w-[70%] flex flex-wrap gap-2">
        {genre?.genres?.map((item, index) => (
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
