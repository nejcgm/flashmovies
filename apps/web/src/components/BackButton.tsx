import React from "react";

const BackButton = () => {
  return (
    <>
      <button
        onClick={() => {
          window.history.back();
        }}
        className="group"
      >
        <svg
          className="w-[32px] lg:w-[48px]"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H19v-2z"
            fill="currentColor"
            className="text-white group-hover:text-[#F5C518]"
          />
        </svg>
      </button>
    </>
  );
};

export default BackButton;
