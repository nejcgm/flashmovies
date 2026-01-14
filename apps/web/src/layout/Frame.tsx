import React from "react";

// Wrapper Component
interface FrameProps {
  children: React.ReactNode;
}
const Frame: React.FC<FrameProps> = ({ children }) => {
  return (
    <>
      <div className="bg-black overflow-x-hidden w-screen h-screen flex flex-col">
        <div className=" h-full  flex-col self-center pl-[6px] sm:px-[32px]  w-full max-w-[1314px]">
          {children}
        </div>
      </div>
    </>
  );
};

export default Frame;
