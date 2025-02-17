import React from "react";

interface ChevroneRightProps {
  scrollToRight: () => void;
  timerActive: () => void;
  isScrolling: boolean;
}

const ChevroneRight: React.FC<ChevroneRightProps> = ({
  scrollToRight,
  timerActive,
  isScrolling,
}) => {
  return (
    <button
      className={`absolute right-1 transform top-[35%] text-white`}
      onClick={() => {
        scrollToRight();
        timerActive();
      }}
      disabled={isScrolling}
    >
      <div className="group bg-black bg-opacity-35 border-white border-[1px] rounded-lg px-3 py-5">
        <svg
          width="24"
          height="24"
          xmlns="http://www.w3.org/2000/svg"
          className="group-hover:text-[#F5C518] transition-colors duration-300"
          viewBox="0 0 24 24"
          fill="currentColor"
          role="presentation"
        >
          <path d="M5.622.631A2.153 2.153 0 0 0 5 2.147c0 .568.224 1.113.622 1.515l8.249 8.34-8.25 8.34a2.16 2.16 0 0 0-.548 2.07c.196.74.768 1.317 1.499 1.515a2.104 2.104 0 0 0 2.048-.555l9.758-9.866a2.153 2.153 0 0 0 0-3.03L8.62.61C7.812-.207 6.45-.207 5.622.63z"></path>
        </svg>
      </div>
    </button>
  );
};

export default ChevroneRight;
