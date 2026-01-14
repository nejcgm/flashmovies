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
      onClick={() => {
        setSelected(!selected);
      }}
      className={`font-roboto py-[4px] px-[8px] sm:py-1 sm:px-3 border-[1px]  ${
        selected ? `border-white text-white` : `border-[#a0a0a0] text-[#a0a0a0]`
      } rounded-full text-[12px] sm:text-[14px] `}
    >
      {name}
    </button>
  );
};

export default GenreButton;
