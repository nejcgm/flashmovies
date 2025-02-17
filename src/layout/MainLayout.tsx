import React from "react";
import { Outlet } from "react-router-dom";
import Frame from "./Frame";
import Search from "./search/SearchComponent";
const MainLayout = () => {
  return (
    <Frame>
      <Search />
      <Outlet />
    </Frame>
  );
};

export default MainLayout;
