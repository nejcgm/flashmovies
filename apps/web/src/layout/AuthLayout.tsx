import { Outlet } from "react-router-dom";
import Frame from "./Frame";
import React from "react";

export default function AuthLayout() {
  return (
    <Frame>
      <Outlet />
    </Frame>
  );
}