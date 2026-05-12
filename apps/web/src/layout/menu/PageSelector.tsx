import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import { ProPlansPromoStrip } from "../../components/common/ProPlansPromoStrip";
import CrossBlack from "../../assets/crossBlack.png";
import { redirectForNavigation } from "../../utils/contextAdRedirect";
import { useAdTracker } from "../../context/AdTrackerContext";
import { useUser } from "../../context/UserContext";
import { ClickTypeEnum } from "../../utils/types";

interface PageSelectorProps {
  onCancel: () => void;
}

/** Full-width tap targets on small screens; compact underline hover on md+ */
const menuPrimaryLinkClass =
  "block w-full rounded-xl py-2 px-3 text-left text-[15px] leading-snug font-medium text-white/95 transition-colors hover:bg-white/[10%] active:bg-white/[16%] md:inline md:w-auto md:rounded-none md:py-0 md:px-0 md:font-normal md:text-[16px] md:leading-[18px] md:hover:bg-transparent md:hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5c518]";

const menuMutedLinkClass =
  "block w-full rounded-xl py-2 px-3 text-left text-[14px] leading-snug text-gray-400 transition-colors hover:bg-white/[8%] hover:text-white active:bg-white/[12%] md:inline md:w-auto md:rounded-none md:py-0 md:px-0 md:text-[13px] md:hover:bg-transparent md:hover:underline md:hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5c518]";

const sectionCardClass =
  "rounded-2xl border border-white/[10%] bg-[#181818]/95 p-4 shadow-md shadow-black/30 min-w-0 md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none";

const PageSelector: React.FC<PageSelectorProps> = ({ onCancel }) => {
  const navigate = useNavigate();
  const Container = useRef<HTMLDivElement>(null);
  const { incrementClick } = useAdTracker();
  const { isPro, isLoading } = useUser();
  const highlightYear = new Date().getFullYear();

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    if (Container.current) {
      Container.current.style.transition = "transform 0.8s ease";
      Container.current.style.transform = "translateY(-100%)";
    }
    const t = setTimeout(() => {
      if (Container.current) {
        Container.current.style.transform = "translateY(0)";
      }
    }, 100);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    if (Container.current) {
      Container.current.style.transition = "transform 0.8s ease";
      Container.current.style.transform = "translateY(-100%)";
    }
    setTimeout(() => {
      onCancel();
    }, 800);
  };

  const mainContent = (
    <>
      <div
        className="z-50 fixed inset-0 flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-[#1F1F1F] md:h-screen md:max-h-none md:overflow-y-auto"
        ref={Container}
      >
        <header
          className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 md:hidden"
        >
          <button
            type="button"
            aria-label="Home"
            className="-ml-2 flex min-h-[48px] min-w-[48px] items-center justify-center rounded-xl p-2 hover:bg-white/10 active:bg-white/[15%]"
            onClick={() => {
              redirectForNavigation(
                "home",
                ClickTypeEnum.NAVIGATION,
                incrementClick,
                isPro
              );
              navigate("/");
              handleClose();
            }}
          >
            <svg
              fill="#f5c518"
              className="h-10 w-10 sm:h-[72px] sm:w-[72px]"
              version="1.1"
              id="Capa_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              viewBox="0 0 548.291 548.291"
              xmlSpace="preserve"
              stroke="#f5c518"
              role="img"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <g>
                  <g>
                    <path d="M263.216,425.947h-0.241c-1.221,5.293-2.434,12.044-3.777,17.199l-4.882,18.924h18.175l-5.111-18.924 C265.903,437.854,264.442,431.24,263.216,425.947z"></path>
                    <path d="M472.929,131.385c-0.031-2.514-0.839-4.992-2.566-6.96L364.656,3.667c-0.031-0.029-0.062-0.044-0.084-0.07 c-0.63-0.709-1.365-1.284-2.142-1.795c-0.231-0.149-0.463-0.29-0.704-0.42c-0.672-0.37-1.376-0.667-2.121-0.888 c-0.2-0.058-0.377-0.144-0.577-0.186C358.231,0.113,357.4,0,356.561,0H96.757C84.904,0,75.255,9.644,75.255,21.502V526.79 c0,11.854,9.649,21.501,21.502,21.501h354.775c11.853,0,21.503-9.647,21.503-21.501v-394.2 C473.036,132.186,472.971,131.79,472.929,131.385z M155.403,427.396h-31.581v20.384h29.51v16.415h-29.51v35.854h-18.659v-89.188 h50.24V427.396z M220.777,500.049h-51.339v-89.188h18.659v72.247h32.681V500.049z M281.515,500.049l-6.342-22.898h-23.541 l-5.848,22.898h-19.266l25.114-89.188h24.39l25.486,89.188H281.515z M332.613,501.372c-9.386,0-18.656-2.646-23.287-5.428 l3.781-16.672c4.996,2.776,12.681,5.553,20.608,5.553c8.534,0,13.05-3.842,13.05-9.669c0-5.555-3.905-8.724-13.784-12.566 c-13.66-5.155-22.547-13.366-22.547-26.332c0-15.217,11.696-26.86,31.086-26.86c9.271,0,16.09,2.126,20.973,4.503l-4.143,16.27 c-3.28-1.717-9.144-4.226-17.196-4.226c-8.037,0-11.948,3.963-11.948,8.597c0,5.697,4.625,8.2,15.244,12.568 c14.506,5.827,21.346,14.031,21.346,26.604C365.789,488.667,355.174,501.372,332.613,501.372z M446.158,500.049h-18.542v-37.317 h-30.603v37.317h-18.667v-89.188h18.667v34.27h30.603v-34.27h18.542V500.049z M96.757,365.076V21.502H345.81v110.006 c0,5.935,4.819,10.751,10.751,10.751h94.972v222.816H96.757z"></path>
                    <path d="M280.224,154.717c-23.728,17.785-38.752,66.04-51.405,92.531c-12.659,26.489-35.977,23.339-35.977,23.339v31.212 c0,0,14.627,0.41,26.866-4.703c12.284-5.145,26.512-16.635,34.833-30.839c3.236-5.564,8.187-16.998,13.572-29.672h37.439v-32.045 h-23.749c3.659-8.136,6.966-15.029,9.477-18.958c9.107-14.224,31.653-13.858,31.653-13.858v-30.455 C322.933,141.267,303.951,136.918,280.224,154.717z"></path>
                  </g>
                </g>
              </g>
            </svg>
          </button>

          <button
            type="button"
            aria-label="Close menu"
            onClick={() => {
              handleClose();
            }}
            className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full bg-[#F5C518] p-2.5 transition-opacity hover:opacity-95 active:opacity-90"
          >
            <img
              className="h-6 w-6 sm:h-8 sm:w-8"
              src={CrossBlack}
              alt=""
            />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-[max(1.5rem,env(safe-area-inset-bottom))] [-webkit-overflow-scrolling:touch] md:flex md:min-h-0 md:flex-none md:flex-col md:items-center md:overflow-visible md:pb-10">
          <div className="mx-auto w-full max-w-[1000px] px-4 pt-4 sm:px-6 md:mt-[100px] md:px-6 md:pt-0 lg:px-8">
            <div className="mb-12 hidden w-full items-center justify-between md:flex">
              <button
                type="button"
                aria-label="Home"
                onClick={() => {
                  redirectForNavigation(
                    "home",
                    ClickTypeEnum.NAVIGATION,
                    incrementClick,
                    isPro
                  );
                  navigate("/");
                  handleClose();
                }}
              >
                <svg
                  fill="#f5c518"
                  className="h-[72px] w-[72px]"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  viewBox="0 0 548.291 548.291"
                  xmlSpace="preserve"
                  stroke="#f5c518"
                  role="img"
                >
                  <g strokeWidth="0"></g>
                  <g
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g>
                    <g>
                      <g>
                        <path d="M263.216,425.947h-0.241c-1.221,5.293-2.434,12.044-3.777,17.199l-4.882,18.924h18.175l-5.111-18.924 C265.903,437.854,264.442,431.24,263.216,425.947z"></path>
                        <path d="M472.929,131.385c-0.031-2.514-0.839-4.992-2.566-6.96L364.656,3.667c-0.031-0.029-0.062-0.044-0.084-0.07 c-0.63-0.709-1.365-1.284-2.142-1.795c-0.231-0.149-0.463-0.29-0.704-0.42c-0.672-0.37-1.376-0.667-2.121-0.888 c-0.2-0.058-0.377-0.144-0.577-0.186C358.231,0.113,357.4,0,356.561,0H96.757C84.904,0,75.255,9.644,75.255,21.502V526.79 c0,11.854,9.649,21.501,21.502,21.501h354.775c11.853,0,21.503-9.647,21.503-21.501v-394.2 C473.036,132.186,472.971,131.79,472.929,131.385z M155.403,427.396h-31.581v20.384h29.51v16.415h-29.51v35.854h-18.659v-89.188 h50.24V427.396z M220.777,500.049h-51.339v-89.188h18.659v72.247h32.681V500.049z M281.515,500.049l-6.342-22.898h-23.541 l-5.848,22.898h-19.266l25.114-89.188h24.39l25.486,89.188H281.515z M332.613,501.372c-9.386,0-18.656-2.646-23.287-5.428 l3.781-16.672c4.996,2.776,12.681,5.553,20.608,5.553c8.534,0,13.05-3.842,13.05-9.669c0-5.555-3.905-8.724-13.784-12.566 c-13.66-5.155-22.547-13.366-22.547-26.332c0-15.217,11.696-26.86,31.086-26.86c9.271,0,16.09,2.126,20.973,4.503l-4.143,16.27 c-3.28-1.717-9.144-4.226-17.196-4.226c-8.037,0-11.948,3.963-11.948,8.597c0,5.697,4.625,8.2,15.244,12.568 c14.506,5.827,21.346,14.031,21.346,26.604C365.789,488.667,355.174,501.372,332.613,501.372z M446.158,500.049h-18.542v-37.317 h-30.603v37.317h-18.667v-89.188h18.667v34.27h30.603v-34.27h18.542V500.049z M96.757,365.076V21.502H345.81v110.006 c0,5.935,4.819,10.751,10.751,10.751h94.972v222.816H96.757z"></path>
                        <path d="M280.224,154.717c-23.728,17.785-38.752,66.04-51.405,92.531c-12.659,26.489-35.977,23.339-35.977,23.339v31.212 c0,0,14.627,0.41,26.866-4.703c12.284-5.145,26.512-16.635,34.833-30.839c3.236-5.564,8.187-16.998,13.572-29.672h37.439v-32.045 h-23.749c3.659-8.136,6.966-15.029,9.477-18.958c9.107-14.224,31.653-13.858,31.653-13.858v-30.455 C322.933,141.267,303.951,136.918,280.224,154.717z"></path>
                      </g>
                    </g>
                  </g>
                </svg>
              </button>

              <button
                type="button"
                aria-label="Close menu"
                onClick={() => {
                  handleClose();
                }}
                className="group flex rounded-full bg-[#F5C518] p-2"
              >
                <div className="relative flex items-center justify-center">
                  <div className="absolute hidden h-[51px] w-[51px] rounded-full bg-black/20 group-hover:flex"></div>
                  <img className="w-[32px]" src={CrossBlack} alt="" />
                </div>
              </button>
            </div>

            <div className="flex w-full flex-col">
            <div className="order-2 flex flex-col gap-3 font-roboto text-[12px] sm:text-[16px] leading-[14px] sm:leading-[18px] md:order-1 md:mt-12 md:flex-row md:items-start md:justify-between md:gap-6 md:gap-y-0 lg:gap-8">
              <section className={`text-white ${sectionCardClass}`}>
                <div className="mb-3 flex gap-2 sm:gap-3 md:mb-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    className="h-6 w-6 shrink-0 text-[#F5C518] sm:mt-[6px]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    role="presentation"
                  >
                    <path fill="none" d="M0 0h24v24H0V0z"></path>
                    <path d="M18 4v1h-2V4c0-.55-.45-1-1-1H9c-.55 0-1 .45-1 1v1H6V4c0-.55-.45-1-1-1s-1 .45-1 1v16c0 .55.45 1 1 1s1-.45 1-1v-1h2v1c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-1h2v1c0 .55.45 1 1 1s1-.45 1-1V4c0-.55-.45-1-1-1s-1 .45-1 1zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"></path>
                  </svg>
                  <div className="flex min-w-0 flex-col items-start gap-0.5 md:gap-3">
                  <h2 className="text-lg font-semibold leading-tight text-[#f5c518] md:text-[17px] md:leading-[19px] md:text-white lg:text-[24px] lg:leading-[28px]">
                    Movies
                  </h2>
                  <a
                    href="/list-items?type=movie&search=trending_week&title=trending-movies-this-week"
                    onClick={() => {
                      redirectForNavigation(
                        "trending_movies_week",
                        ClickTypeEnum.MENU_LINK,
                        incrementClick,
                        isPro
                      );
                      onCancel();
                    }}
                    className={menuPrimaryLinkClass}
                  >
                    Trending this week
                  </a>
                  <a
                    href={`/list-items?type=movie&search=year_highlights&title=this-years-movie-highlights-${highlightYear}`}
                    onClick={() => {
                      redirectForNavigation(
                        "year_highlights_movies",
                        ClickTypeEnum.MENU_LINK,
                        incrementClick,
                        isPro
                      );
                      onCancel();
                    }}
                    className={menuPrimaryLinkClass}
                  >
                    {`This year's highlights (${highlightYear})`}
                  </a>
                  <a
                    href="/list-items?type=movie&search=top_rated&title=top-rated-movies"
                    onClick={() => {
                      redirectForNavigation(
                        "top_rated_movies",
                        ClickTypeEnum.MENU_LINK,
                        incrementClick,
                        isPro
                      );
                      onCancel();
                    }}
                    className={menuPrimaryLinkClass}
                  >
                    Top Rated Movies
                  </a>
                  <a
                    href="/list-items?type=movie&search=upcoming&title=upcoming-movies"
                    onClick={() => {
                      redirectForNavigation(
                        "upcoming",
                        ClickTypeEnum.MENU_LINK,
                        incrementClick,
                        isPro
                      );
                      onCancel();
                    }}
                    className={menuPrimaryLinkClass}
                  >
                    Latest Releases
                  </a>
                  <a
                    href="/list-items?type=movie&search=now_playing&title=now-playing-movies"
                    onClick={() => {
                      redirectForNavigation(
                        "now_playing",
                        ClickTypeEnum.MENU_LINK,
                        incrementClick,
                        isPro
                      );
                      onCancel();
                    }}
                    className={menuPrimaryLinkClass}
                  >
                    Now Playing
                  </a>
                  <a
                    href="/list-items?type=movie&search=popular&title=most-popular-movies"
                    onClick={() => {
                      redirectForNavigation(
                        "popular_movies",
                        ClickTypeEnum.MENU_LINK,
                        incrementClick,
                        isPro
                      );
                      onCancel();
                    }}
                    className={menuPrimaryLinkClass}
                  >
                    Most Popular Movies
                  </a>
                  <a
                    href="/list-items?type=movie&search=discover&title=browse-movies-by-genre"
                    onClick={() => {
                      redirectForNavigation(
                        "browse_by_genre",
                        ClickTypeEnum.MENU_LINK,
                        incrementClick,
                        isPro
                      );
                      onCancel();
                    }}
                    className={menuPrimaryLinkClass}
                  >
                    Browse Movies By Genre
                  </a>
                  <div className="mt-2 border-t border-white/10 pt-2 md:mt-2 md:pt-2">
                    <span className="mb-1 block px-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 md:mb-1 md:px-0">
                      More
                    </span>
                    <a
                      href="/list-items?type=movie&search=trending_day&title=trending-movies-today"
                      onClick={() => {
                        redirectForNavigation(
                          "trending_movies_day",
                          ClickTypeEnum.MENU_LINK,
                          incrementClick,
                          isPro
                        );
                        onCancel();
                      }}
                      className={menuMutedLinkClass}
                    >
                      Trending today
                    </a>
                  </div>
                </div>
              </div>
              </section>

              <section className={`text-white ${sectionCardClass}`}>
                <div className="mb-3 flex gap-2 sm:gap-3 md:mb-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    className="h-6 w-6 shrink-0 text-[#F5C518] sm:mt-[6px]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    role="presentation"
                  >
                    <path fill="none" d="M0 0h24v24H0V0z"></path>
                    <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v1c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-1h5c1.1 0 1.99-.9 1.99-2L23 5a2 2 0 0 0-2-2zm-1 14H4c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h16c.55 0 1 .45 1 1v10c0 .55-.45 1-1 1z"></path>
                  </svg>
                  <div className="flex min-w-0 flex-col items-start gap-0.5 md:gap-3">
                  <h2 className="text-lg font-semibold leading-tight text-[#f5c518] md:text-[17px] md:leading-[19px] md:text-white lg:text-[24px] lg:leading-[28px]">
                    TV Shows
                  </h2>
                  <a
                    href="/list-items?type=tv&search=trending_week&title=trending-tv-this-week"
                    onClick={() => {
                      redirectForNavigation(
                        "trending_tv_week",
                        ClickTypeEnum.MENU_LINK,
                        incrementClick,
                        isPro
                      );
                      onCancel();
                    }}
                    className={menuPrimaryLinkClass}
                  >
                    Trending this week
                  </a>
                  <a
                    href="/list-items?type=tv&search=top_rated&title=top-rated-shows"
                    onClick={() => {
                      redirectForNavigation(
                        "top_rated_tv",
                        ClickTypeEnum.MENU_LINK,
                        incrementClick,
                        isPro
                      );
                      onCancel();
                    }}
                    className={menuPrimaryLinkClass}
                  >
                    Top Rated Shows
                  </a>
                  <a
                    href="/list-items?type=tv&search=on_the_air&title=on-the-air"
                    onClick={() => {
                      redirectForNavigation(
                        "on_air",
                        ClickTypeEnum.MENU_LINK,
                        incrementClick,
                        isPro
                      );
                      onCancel();
                    }}
                    className={menuPrimaryLinkClass}
                  >
                    On The Air
                  </a>
                  <a
                    href="/list-items?type=tv&search=popular&title=most-popular-shows"
                    onClick={() => {
                      redirectForNavigation(
                        "popular_tv",
                        ClickTypeEnum.MENU_LINK,
                        incrementClick,
                        isPro
                      );
                      onCancel();
                    }}
                    className={menuPrimaryLinkClass}
                  >
                    Most Popular Shows
                  </a>
                  <a
                    href="/list-items?type=tv&search=airing_today&title=airing-today-shows"
                    onClick={() => {
                      redirectForNavigation(
                        "airing_today",
                        ClickTypeEnum.MENU_LINK,
                        incrementClick,
                        isPro
                      );
                      onCancel();
                    }}
                    className={menuPrimaryLinkClass}
                  >
                    Airing Today
                  </a>
                  <a
                    href="/list-items?type=tv&search=discover&title=browse-shows-by-genre"
                    onClick={() => {
                      redirectForNavigation(
                        "browse_tv_genre",
                        ClickTypeEnum.MENU_LINK,
                        incrementClick,
                        isPro
                      );
                      onCancel();
                    }}
                    className={menuPrimaryLinkClass}
                  >
                    Browse Shows By Genre
                  </a>
                  <div className="mt-2 border-t border-white/10 pt-2 md:mt-2 md:pt-2">
                    <span className="mb-1 block px-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 md:mb-1 md:px-0">
                      More
                    </span>
                    <a
                      href="/list-items?type=tv&search=trending_day&title=trending-tv-today"
                      onClick={() => {
                        redirectForNavigation(
                          "trending_tv_day",
                          ClickTypeEnum.MENU_LINK,
                          incrementClick,
                          isPro
                        );
                        onCancel();
                      }}
                      className={menuMutedLinkClass}
                    >
                      Trending today
                    </a>
                  </div>
                </div>
              </div>
              </section>

              <section className={`text-white ${sectionCardClass}`}>
                <div className="mb-3 flex gap-2 sm:gap-3 md:mb-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-6 w-6 shrink-0 text-[#F5C518] sm:mt-[6px]"
                    role="presentation"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  <div className="flex min-w-0 flex-col items-start gap-0.5 md:gap-3">
                  <h2 className="text-lg font-semibold leading-tight text-[#f5c518] md:text-[19px] md:leading-[19px] md:text-white lg:text-[24px] lg:leading-[28px]">
                    Celebs
                  </h2>
                  <a
                    href="/list-items?type=person&search=popular&title=most-popular-actors"
                    onClick={() => {
                      redirectForNavigation(
                        "popular_actors",
                        ClickTypeEnum.MENU_LINK,
                        incrementClick,
                        isPro
                      );
                      onCancel();
                    }}
                    className={menuPrimaryLinkClass}
                  >
                    Most Popular Actors
                  </a>
                </div>
              </div>
              </section>
            </div>

            {!isLoading && (
              <ProPlansPromoStrip
                className="order-1 mx-auto mb-5 w-full max-w-xl md:order-2 md:mb-0 md:mt-10 lg:mt-12"
                onClick={() => onCancel()}
              />
            )}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return ReactDOM.createPortal(mainContent, document.body);
};

export default PageSelector;
