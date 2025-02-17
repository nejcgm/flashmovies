import React from "react";
import { Genre } from "../../functions/Interfaces.ts";

interface GenreSpecificProps {
  genres: [];
}

const GenreSpecific: React.FC<GenreSpecificProps> = ({ genres }) => {
  return (
    <>
      <div className="flex overflow-scroll w-[200px] sm:w-[350px] md:w-full  gap-4 text-[11px] sm:text-[14px]">
        {genres?.map((item: Genre) => (
          <div
            key={item.id}
            className="px-3 py-1 border-white border-[1px] h-[32px] whitespace-nowrap rounded-full"
          >
            {item.name}
          </div>
        ))}
      </div>
    </>
  );
};

export default GenreSpecific;
