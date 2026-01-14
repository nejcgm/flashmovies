import React from "react";
import { Outlet } from "react-router-dom";
import Frame from "./Frame";
import Search from "./search/SearchComponent";
import SkipLink from "../components/SkipLink";
import Footer from "./footer/Footer";
//import SimpleAdDisplay from "../components/SimpleAdDisplay";
const MainLayout = () => {
  return (
    <>
      <SkipLink />
      <Frame>
        <Search />
        <main id="main-content">
          <Outlet />
        </main>
        <Footer />
      </Frame>
      
      {/* <SimpleAdDisplay /> */}
    </>
  );
};

export default MainLayout;
