import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MovieInfoPage from "./pages/MovieInfoPage";
import WatchMoviePage from "./pages/full-movie/WatchMoviePage";
import List from "./list-movie/List";
import NotFound from "./pages/NotFound";
import MainLayout from "./layout/MainLayout";
import Analytics from "./SEO/Analytics";
import ExoClickPlayer from "./pages/adVideoPlayer";
import TermsAndConditionsPage from "./pages/footer-pages/TermsAndConditionsPage";
import FAQPage from "./pages/footer-pages/FAQ";
import LoginPage from "./pages/auth/login";
import RegisterPage from "./pages/auth/register";
import AuthLayout from "./layout/AuthLayout";
import PlansPage from "./pages/payments/plans";

const App: React.FC = () => {
  return (
    <>
      <Analytics />
      <Routes>
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
        </Route>
        
        <Route path="/plans" element={<AuthLayout />}>
          <Route path="/plans" element={<PlansPage />} />
        </Route>
        
        <Route path="/" element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/movie-info" element={<MovieInfoPage />} />
          <Route path="/full-movie" element={<WatchMoviePage />} />
          <Route path="/list-items" element={<List />} />
          <Route path="/ad-video-player" element={<ExoClickPlayer/>} />
          <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
          <Route path="/frequently-asked-questions" element={<FAQPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
