import React, { useState } from "react";
import PageSelector from "./PageSelector";

const MenuButton = () => {
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <>
      {openMenu && (
        <PageSelector
          onCancel={() => {
            setOpenMenu(false);
          }}
        />
      )}
      <button
        onClick={() => {
          setOpenMenu((prev) => !prev);
        }}
        className="group flex items-center gap-1 p-0 sm:gap-3 sm:rounded-full sm:px-4 sm:py-2 sm:hover:bg-white/10"
      >
        <div className="sm:border-t-[2px] sm:border-b-[2px] border-t-[1px] border-b-[1px] border-white w-[15px] sm:w-[20px] h-[10px] sm:h-[15px] flex justify-between items-center">
          <div className="sm:h-[2px] h-[1px] w-full bg-white"></div>
        </div>
        <div className="text-white font-roboto text-[13px] sm:text-[16px]"> Menu</div>
      </button>
    </>
  );
};

export default MenuButton;
