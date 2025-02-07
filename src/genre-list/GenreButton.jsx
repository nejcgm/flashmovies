import React, { useEffect, useState, useRef } from "react";

const GenreButton = ({ id, name, appendId, remove }) => {
  const [selected, setSelected] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
    if (selected) {
      appendId(id);
    } else {
      remove(id);
    }
  }, [selected]);

  return (
    <button
      onClick={() => {
        setSelected(!selected);
      }}
      className={`font-roboto py-1 px-3 border-[1px]  ${
        selected ? `border-white text-white` : `border-[#a0a0a0] text-[#a0a0a0]`
      } rounded-full text-[14px] `}
    >
      {name}
    </button>
  );
};

export default GenreButton;
