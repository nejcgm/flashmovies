import React from "react";
import Home from "./pages/Home";
import MovieInfoPage from "./pages/MovieInfoPage";
import MainLayout from "./layout/MainLayout";
import { Routes, Route } from "react-router-dom";
import Iframe from "./pages/full-movie/Iframe";
import List from "./list-movie/List";
import NotFound from "./pages/NotFound";

const App: React.FC = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/movie-info" element={<MovieInfoPage />} />
          <Route path="/full-movie" element={<Iframe />} />
          <Route path="/list-items" element={<List />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
