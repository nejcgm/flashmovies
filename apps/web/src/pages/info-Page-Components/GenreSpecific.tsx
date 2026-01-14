import React from "react";
import { Genre } from "../../utils/Interfaces.ts";

interface GenreSpecificProps {
  genres: [];
}

const GenreSpecific: React.FC<GenreSpecificProps> = ({ genres }) => {
  return (
    <>
      <div className="flex overflow-x-auto carousel scrollbar-hide w-[210px] sm:w-[350px] md:w-[550px]  gap-2 text-[11px] sm:text-[14px]">
        {genres?.map((item: Genre) => (
          <div
            key={item.id}
            className="px-3 py-1 border-white border-[1px] h-[28px] sm:h-[32px] whitespace-nowrap rounded-full"
          >
            {item.name}
          </div>
        ))}
      </div>
    </>
  );
};

export default GenreSpecific;
