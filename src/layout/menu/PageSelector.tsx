import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import CrossBlack from "../../assets/crossBlack.png";
import { redirectForNavigation } from '../../utils/contextAdRedirect';
import { useAdTracker } from '../../context/AdTrackerContext';
import { ClickTypeEnum } from "../../utils/types";

interface PageSelectorProps {
  onCancel: () => void;
}

const PageSelector: React.FC<PageSelectorProps> = ({ onCancel }) => {
  const navigate = useNavigate();
  const Container = useRef<HTMLDivElement>(null);
  const { incrementClick } = useAdTracker();

  useEffect(() => {
    if (Container.current) {
      Container.current.style.transition = "transform 0.8s ease";
      Container.current.style.transform = "translateY(-100%)";
    }
    setTimeout(() => {
      if (Container.current) {
        Container.current.style.transform = "translateY(0)";
      }
    }, 100);
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
        className={`z-50 fixed bg-[#1F1F1F] top-0 left-0 w-full h-screen flex flex-col`}
        ref={Container}
      >
        <div className=" max-w-[1000px] px-[24px] sm:mx-[64px] flex flex-col self-center w-full mt-[100px]">
          <div className="flex w-full justify-between items-center">
            <button
              onClick={() => {
                redirectForNavigation('home', ClickTypeEnum.NAVIGATION, incrementClick);
                navigate("/");
                handleClose();
              }}
            >
              <svg
                fill="#f5c518"
                className="w-[48px] sm:w-[72px] sm:h-[72px] "
                version="1.1"
                id="Capa_1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 548.291 548.291"
                xmlSpace="preserve"
                stroke="#f5c518"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <g>
                    {" "}
                    <g>
                      {" "}
                      <path d="M263.216,425.947h-0.241c-1.221,5.293-2.434,12.044-3.777,17.199l-4.882,18.924h18.175l-5.111-18.924 C265.903,437.854,264.442,431.24,263.216,425.947z"></path>{" "}
                      <path d="M472.929,131.385c-0.031-2.514-0.839-4.992-2.566-6.96L364.656,3.667c-0.031-0.029-0.062-0.044-0.084-0.07 c-0.63-0.709-1.365-1.284-2.142-1.795c-0.231-0.149-0.463-0.29-0.704-0.42c-0.672-0.37-1.376-0.667-2.121-0.888 c-0.2-0.058-0.377-0.144-0.577-0.186C358.231,0.113,357.4,0,356.561,0H96.757C84.904,0,75.255,9.644,75.255,21.502V526.79 c0,11.854,9.649,21.501,21.502,21.501h354.775c11.853,0,21.503-9.647,21.503-21.501v-394.2 C473.036,132.186,472.971,131.79,472.929,131.385z M155.403,427.396h-31.581v20.384h29.51v16.415h-29.51v35.854h-18.659v-89.188 h50.24V427.396z M220.777,500.049h-51.339v-89.188h18.659v72.247h32.681V500.049z M281.515,500.049l-6.342-22.898h-23.541 l-5.848,22.898h-19.266l25.114-89.188h24.39l25.486,89.188H281.515z M332.613,501.372c-9.386,0-18.656-2.646-23.287-5.428 l3.781-16.672c4.996,2.776,12.681,5.553,20.608,5.553c8.534,0,13.05-3.842,13.05-9.669c0-5.555-3.905-8.724-13.784-12.566 c-13.66-5.155-22.547-13.366-22.547-26.332c0-15.217,11.696-26.86,31.086-26.86c9.271,0,16.09,2.126,20.973,4.503l-4.143,16.27 c-3.28-1.717-9.144-4.226-17.196-4.226c-8.037,0-11.948,3.963-11.948,8.597c0,5.697,4.625,8.2,15.244,12.568 c14.506,5.827,21.346,14.031,21.346,26.604C365.789,488.667,355.174,501.372,332.613,501.372z M446.158,500.049h-18.542v-37.317 h-30.603v37.317h-18.667v-89.188h18.667v34.27h30.603v-34.27h18.542V500.049z M96.757,365.076V21.502H345.81v110.006 c0,5.935,4.819,10.751,10.751,10.751h94.972v222.816H96.757z"></path>{" "}
                      <path d="M280.224,154.717c-23.728,17.785-38.752,66.04-51.405,92.531c-12.659,26.489-35.977,23.339-35.977,23.339v31.212 c0,0,14.627,0.41,26.866-4.703c12.284-5.145,26.512-16.635,34.833-30.839c3.236-5.564,8.187-16.998,13.572-29.672h37.439v-32.045 h-23.749c3.659-8.136,6.966-15.029,9.477-18.958c9.107-14.224,31.653-13.858,31.653-13.858v-30.455 C322.933,141.267,303.951,136.918,280.224,154.717z"></path>{" "}
                    </g>{" "}
                  </g>{" "}
                </g>
              </svg>
            </button>

            <button
              onClick={() => {
                handleClose();
              }}
              className="p-2 rounded-full  self-end bg-[#F5C518] group flex"
            >
              <div className="flex items-center justify-center">
                <div className="absolute w-[51px] h-[51px] rounded-full bg-black/20  hidden group-hover:flex"></div>
                <img className="w-[24px] sm:w-[32px]" src={CrossBlack} alt="" />
              </div>
            </button>
          </div>

          {/*movies list  */}
          <div className="flex justify-between mt-[48px] text-[13px] sm:text-[16px] leading-[15px] sm:leading-[18px]">
            <div className="text-white font-roboto flex flex-col">
              <div className="flex gap-2 sm:gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  className="text-[#F5C518] sm:mt-[6px]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  role="presentation"
                >
                  <path fill="none" d="M0 0h24v24H0V0z"></path>
                  <path d="M18 4v1h-2V4c0-.55-.45-1-1-1H9c-.55 0-1 .45-1 1v1H6V4c0-.55-.45-1-1-1s-1 .45-1 1v16c0 .55.45 1 1 1s1-.45 1-1v-1h2v1c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-1h2v1c0 .55.45 1 1 1s1-.45 1-1V4c0-.55-.45-1-1-1s-1 .45-1 1zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"></path>
                </svg>
                <div className="flex flex-col items-start gap-3">
                  <div className="text-[18px] sm:text-[24px] leading-[20px] sm:leading-[28px] font-semibold">Movies</div>
                  <a
                    href="/list-items?type=movie&search=top_rated&title=top-rated-movies"
                    onClick={() => {
                      redirectForNavigation('home', ClickTypeEnum.NAVIGATION, incrementClick);
                      onCancel();
                    }}
                    className="hover:underline"
                  >
                    Top Rated Movies
                  </a>
                  <a
                    href="/list-items?type=movie&search=popular&title=most-popular-movies"
                    onClick={() => {
                      redirectForNavigation('popular_movies', ClickTypeEnum.MENU_LINK, incrementClick);
                      onCancel();
                    }}
                    className="hover:underline"
                  >
                    Most Popular Movies
                  </a>
                  <a
                    href="/list-items?type=movie&search=now_playing&title=now-playing-movies"
                    onClick={() => {
                      redirectForNavigation('now_playing', ClickTypeEnum.MENU_LINK, incrementClick);
                      onCancel();
                    }}
                    className="hover:underline"
                  >
                    Now Playing
                  </a>
                  <a
                    href="/list-items?type=movie&search=upcoming&title=upcoming-movies"
                    onClick={() => {
                      redirectForNavigation('upcoming', ClickTypeEnum.MENU_LINK, incrementClick);
                      onCancel();
                    }}
                    className="hover:underline"
                  >
                    Latest Releases
                  </a>
                  <a
                    href="/list-items?type=movie&search=discover&title=browse-movies-by-genre"
                    onClick={() => {
                      redirectForNavigation('browse_by_genre', ClickTypeEnum.MENU_LINK, incrementClick);
                      onCancel();
                    }}
                    className="hover:underline"
                  >
                    Browse Movies By Genre
                  </a>
                </div>
              </div>
            </div>

            <div className="text-white font-roboto flex flex-col">
              <div className="flex gap-2 sm:gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  className="text-[#F5C518] sm:mt-[6px]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  role="presentation"
                >
                  <path fill="none" d="M0 0h24v24H0V0z"></path>
                  <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v1c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-1h5c1.1 0 1.99-.9 1.99-2L23 5a2 2 0 0 0-2-2zm-1 14H4c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h16c.55 0 1 .45 1 1v10c0 .55-.45 1-1 1z"></path>
                </svg>
                <div className="flex flex-col items-start gap-3">
                  <div className="text-[18px] sm:text-[24px] leading-[20px] sm:leading-[28px] font-semibold">TV Shows</div>
                  <a
                    href="/list-items?type=tv&search=top_rated&title=top-rated-shows"
                    onClick={() => {
                      redirectForNavigation('top_rated_tv', ClickTypeEnum.MENU_LINK, incrementClick);
                      onCancel();
                    }}
                    className="hover:underline"
                  >
                    Top Rated Shows
                  </a>
                  <a
                    href="/list-items?type=tv&search=popular&title=most-popular-shows"
                    onClick={() => {
                      redirectForNavigation('popular_tv', ClickTypeEnum.MENU_LINK, incrementClick);
                      onCancel();
                    }}
                    className="hover:underline"
                  >
                    Most Popular Shows
                  </a>
                  <a
                    href="/list-items?type=tv&search=airing_today&title=airing-today-shows"
                    onClick={() => {
                      redirectForNavigation('airing_today', ClickTypeEnum.MENU_LINK, incrementClick);
                      onCancel();
                    }}
                    className="hover:underline"
                  >
                    Airing Today Shows
                  </a>
                  <a
                    href="/list-items?type=tv&search=on_the_air&title=on-the-air"
                    onClick={() => {
                      redirectForNavigation('on_air', ClickTypeEnum.MENU_LINK, incrementClick);
                      onCancel();
                    }}
                    className="hover:underline"
                  >
                    On The Air
                  </a>
                  <a
                    href="/list-items?type=tv&search=discover&title=browse-shows-by-genre"
                    onClick={() => {
                      redirectForNavigation('browse_tv_genre', ClickTypeEnum.MENU_LINK, incrementClick);
                      onCancel();
                    }}
                    className="hover:underline"
                  >
                    Browse Shows By Genre
                  </a>
                </div>
              </div>
            </div>

            <div className="text-white font-roboto flex flex-col">
              <div className="flex gap-2 sm:gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  className="text-[#F5C518] sm:mt-[6px]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  role="presentation"
                >
                  <path fill="none" d="M0 0h24v24H0V0z"></path>
                  <path d="M18 4v1h-2V4c0-.55-.45-1-1-1H9c-.55 0-1 .45-1 1v1H6V4c0-.55-.45-1-1-1s-1 .45-1 1v16c0 .55.45 1 1 1s1-.45 1-1v-1h2v1c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-1h2v1c0 .55.45 1 1 1s1-.45 1-1V4c0-.55-.45-1-1-1s-1 .45-1 1zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"></path>
                </svg>
                <div className="flex flex-col items-start gap-3">
                  <div className="text-[20px] sm:text-[24px] leading-[20px] sm:leading-[28px] font-semibold">Celebs</div>
                  <a
                    href="/list-items?type=person&search=popular&title=most-popular-actors"
                    onClick={() => {
                      redirectForNavigation('popular_actors', ClickTypeEnum.MENU_LINK, incrementClick);
                      onCancel();
                    }}
                    className="hover:underline"
                  >
                    Most Popular Actors
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return ReactDOM.createPortal(mainContent, document.body);
};

export default PageSelector;
