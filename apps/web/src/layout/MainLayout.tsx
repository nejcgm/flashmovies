import { Outlet } from "react-router-dom";
import { Frame, SkipLink } from "./";
import { Search } from "./search";
import { ProBanner } from "../components";
import { Footer } from "./footer";

export function MainLayout() {
  return (
    <>
      <SkipLink />
      <Frame>
        <div className="w-full px-2 sm:px-[32px]">
          <Search />
        </div>
        <div className="w-full px-4 sm:px-[32px]">
          <ProBanner />
          <main id="main-content">
            <Outlet />
          </main>
          <Footer />
        </div>
      </Frame>
    </>
  );
};

