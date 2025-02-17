import React from "react";
import ShareIcon from "../assets/shareIcon.png";

const ShareButton = () => {
  const urlToCopy = window.location.href;
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(urlToCopy);
      }}
    >
      <img className="w-[24px] lg:w-[32px]" src={ShareIcon} alt="" />
    </button>
  );
};

export default ShareButton;
