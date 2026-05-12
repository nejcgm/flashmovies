import React from "react";

// Wrapper Component
interface FrameProps {
  children: React.ReactNode;
}
const Frame: React.FC<FrameProps> = ({ children }) => {
  return (
    <>
      <div className="bg-black overflow-x-hidden w-screen min-h-screen flex flex-col">
        <div className="flex h-full w-full max-w-[1314px] flex-col self-center">
          {children}
        </div>
      </div>
    </>
  );
};

export default Frame;
