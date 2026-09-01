import { Outlet } from "react-router-dom";
import { Frame } from "./";

export function AuthLayout() {
  return (
    <Frame>
      <div className="w-full px-4 sm:px-[32px]">
        <Outlet />
      </div>
    </Frame>
  );
}