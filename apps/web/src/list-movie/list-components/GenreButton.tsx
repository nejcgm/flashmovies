import React, { useEffect, useState, useRef } from "react";

interface GenreButtonProps {
  id: number;
  name: string;
  appendId: (id: number) => void;
  remove: (id: number) => void;
}
const GenreButton: React.FC<GenreButtonProps> = ({
  id,
  name,
  appendId,
  remove,
}) => {
  const [selected, setSelected] = useState<boolean>(false);
  const prevSelectedRef = useRef<boolean | undefined | null>();

  useEffect(() => {
    prevSelectedRef.current = selected;
  });

  const prevSelected = prevSelectedRef.current;

  useEffect(() => {
    if (selected == true && prevSelected == false) {
      appendId(id);
    } else if (prevSelected == true) {
      remove(id);
    }
  }, [selected]);
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => {
        setSelected(!selected);
      }}
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5c518] ${
        selected
          ? "bg-[#f5c518] text-black"
          : "bg-white/10 text-gray-200 hover:bg-white/15"
      }`}
    >
      {name}
    </button>
  );
};

export default GenreButton;
