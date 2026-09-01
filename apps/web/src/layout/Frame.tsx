import type { ReactNode } from "react";

interface FrameProps {
  children: ReactNode;
}
export function Frame({ children }: FrameProps) {
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

