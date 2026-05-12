import React from "react";
import { Genre } from "../../utils/Interfaces.ts";

interface GenreSpecificProps {
  genres: [];
}

const GenreSpecific: React.FC<GenreSpecificProps> = ({ genres }) => {
  return (
    <div
      role="list"
      aria-label="Genres"
      className="flex w-full max-w-full flex-nowrap gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] scrollbar-hide sm:flex-wrap sm:overflow-visible"
    >
      {genres?.map((item: Genre) => (
        <span
          key={item.id}
          role="listitem"
          className="inline-flex shrink-0 items-center rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-gray-200 sm:px-4 sm:py-2 sm:text-sm"
        >
          {item.name}
        </span>
      ))}
    </div>
  );
};

export default GenreSpecific;
