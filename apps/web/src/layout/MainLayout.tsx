import React from "react";
import { Outlet } from "react-router-dom";
import Frame from "./Frame";
import Search from "./search/SearchComponent";
import SkipLink from "../components/SkipLink";
import Footer from "./footer/Footer";
import ProBanner from "../components/ProBanner";
const MainLayout = () => {
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

export default MainLayout;
