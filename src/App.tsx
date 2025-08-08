import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MovieInfoPage from "./pages/MovieInfoPage";
import WatchMoviePage from "./pages/full-movie/WatchMoviePage";
import List from "./list-movie/List";
import NotFound from "./pages/NotFound";
import MainLayout from "./layout/MainLayout";
import Analytics from "./SEO/Analytics";

const App: React.FC = () => {
  return (
    <>
      <Analytics />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/movie-info" element={<MovieInfoPage />} />
          <Route path="/full-movie" element={<WatchMoviePage />} />
          <Route path="/list-items" element={<List />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
