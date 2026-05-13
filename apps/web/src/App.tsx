import React, { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import AuthLayout from "./layout/AuthLayout";
import Analytics from "./SEO/Analytics";
import Spinner from "./components/Spinner";

// Page chunks — loaded only when the route is first visited
const Home = lazy(() => import("./pages/Home"));
const MovieInfoPage = lazy(() => import("./pages/MovieInfoPage"));
const WatchMoviePage = lazy(() => import("./pages/full-movie/WatchMoviePage"));
const List = lazy(() => import("./list-movie/List"));
const NotFound = lazy(() => import("./pages/NotFound"));
const TermsAndConditionsPage = lazy(() => import("./pages/footer-pages/TermsAndConditionsPage"));
const ProPlanTermsConditionsPage = lazy(() => import("./pages/footer-pages/ProPlanTermsConditionsPage"));
const FAQPage = lazy(() => import("./pages/footer-pages/FAQ"));
const LoginPage = lazy(() => import("./pages/auth/login"));
const RegisterPage = lazy(() => import("./pages/auth/register"));
const LogoutPage = lazy(() => import("./pages/auth/logout"));
const PlansPage = lazy(() => import("./pages/payments/plans"));
const RemoveProPage = lazy(() => import("./pages/payments/remove-pro"));

const ListWithSearchKey: React.FC = () => {
  const { search } = useLocation();
  return <List key={search} />;
};

const App: React.FC = () => {
  return (
    <>
      <Analytics />
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Spinner /></div>}>
        <Routes>
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            <Route path="/auth/logout" element={<LogoutPage />} />
          </Route>

          <Route path="/payments" element={<AuthLayout />}>
            <Route path="/payments/plans" element={<PlansPage />} />
            <Route path="/payments/remove-pro" element={<RemoveProPage />} />
          </Route>

          <Route path="/" element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/movie-info" element={<MovieInfoPage />} />
            <Route path="/full-movie" element={<WatchMoviePage />} />
            <Route path="/list-items" element={<ListWithSearchKey />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
            <Route path="/pro-plan-terms-and-conditions" element={<ProPlanTermsConditionsPage />} />
            <Route path="/frequently-asked-questions" element={<FAQPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
