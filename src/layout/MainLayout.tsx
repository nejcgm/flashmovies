import React from "react";
import { Outlet } from "react-router-dom";
import Frame from "./Frame";
import Search from "./search/SearchComponent";
import SkipLink from "../components/SkipLink";
const MainLayout = () => {
  return (
    <>
      <SkipLink />
      <Frame>
        <Search />
        <main id="main-content">
          <Outlet />
        </main>
      </Frame>
    </>
  );
};

export default MainLayout;
