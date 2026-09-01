import { Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AuthLayout, MainLayout } from "./layout";
import { Analytics, ContentSquare } from "./SEO";
import { Spinner } from "./components";
import { lazyNamed } from "./utils/lazyNamed";

const HomePage = lazyNamed(() => import("./pages"), "HomePage");
const MovieInfoPage = lazyNamed(() => import("./pages"), "MovieInfoPage");
const WatchMoviePage = lazyNamed(() => import("./pages"), "WatchMoviePage");
const ListPage = lazyNamed(() => import("./pages"), "ListPage");
const NotFoundPage = lazyNamed(() => import("./pages"), "NotFoundPage");
const TermsAndConditionsPage = lazyNamed(
  () => import("./pages"),
  "TermsAndConditionsPage"
);
const ProPlanTermsConditionsPage = lazyNamed(
  () => import("./pages"),
  "ProPlanTermsConditionsPage"
);
const FAQPage = lazyNamed(() => import("./pages"), "FAQPage");
const LoginPage = lazyNamed(() => import("./pages"), "LoginPage");
const RegisterPage = lazyNamed(() => import("./pages"), "RegisterPage");
const LogoutPage = lazyNamed(() => import("./pages"), "LogoutPage");
const PlansPage = lazyNamed(() => import("./pages"), "PlansPage");
const RemoveProPage = lazyNamed(() => import("./pages"), "RemoveProPage");

function ListWithSearchKey() {
  const { search } = useLocation();
  return <ListPage key={search} />;
}

export function App() {
  return (
    <>
      <Analytics />
      <ContentSquare />
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <Spinner />
          </div>
        }
      >
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
            <Route path="/" element={<HomePage />} />
            <Route path="/movie-info" element={<MovieInfoPage />} />
            <Route path="/full-movie" element={<WatchMoviePage />} />
            <Route path="/list-items" element={<ListWithSearchKey />} />
            <Route
              path="/terms-and-conditions"
              element={<TermsAndConditionsPage />}
            />
            <Route
              path="/pro-plan-terms-and-conditions"
              element={<ProPlanTermsConditionsPage />}
            />
            <Route path="/frequently-asked-questions" element={<FAQPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
