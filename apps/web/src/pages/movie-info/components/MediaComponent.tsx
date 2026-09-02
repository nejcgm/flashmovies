import { useState } from "react";
import { triggerContextAdRedirectDirect } from '../../../utils/contextAdRedirect';
import { useAdTracker } from '../../../context/AdTrackerContext';
import { useUser } from '../../../context/UserContext';
import { VideoPlayer } from "../../../components/dialogs";
import { VoteCount } from "../../../components";
import { WatchlistHeartButton } from "../../../components/watchlist";
import { useNavigate } from "react-router-dom";
import { ClickTypeEnum } from "../../../interfaces/analytics/index.ts";

const MoviePlaceholder = "/dark-mode-img-placeholder.png";

interface MediaComponentProps {
  poster?: string | null;
  vote?: number;
  movieId: string | number | null;
  backdrop?: string | null;
  type: string | null;
  title?: string;
}

export function MediaComponent({
  poster,
  vote,
  movieId,
  backdrop,
  type,
  title,
}: MediaComponentProps) {
  const [trailer, setTrailer] = useState(false);
  const navigate = useNavigate();
  const { incrementClick } = useAdTracker();
  const { isPro } = useUser();

  const handleTrailerClick = () => {
    triggerContextAdRedirectDirect({
      eventLabel: 'trailer_card_click',
      movieTitle: 'Watch Trailer',
      movieId: movieId,
      clickType: ClickTypeEnum.WATCH_TRAILER,
      isPro
    }, incrementClick);
    setTrailer(true);
  };

  const handleWatchMovieClick = () => {
    triggerContextAdRedirectDirect({
      eventLabel: 'movie_card_click',
      movieTitle: 'Watch Movie',
      movieId: movieId,
      clickType: ClickTypeEnum.WATCH_MOVIE,
      forceFire: true,
      isPro
    }, incrementClick);
    navigate(`/full-movie/?id=${movieId}&type=${type}`);
  };

  return (
    <>
      {trailer && (
        <VideoPlayer
          movieId={movieId != null ? String(movieId) : null}
          type={type}
          title={title}
          onCancel={() => {
            setTrailer(false);
          }}
          baseUrl="full-movie"
        />
      )}

      <div className="mt-5 flex w-full gap-2 sm:mt-6 sm:gap-2">
        <button
          className="group hidden w-[400px] rounded-lg bg-cover bg-center bg-no-repeat text-white lg:flex"
          disabled={type == "person"}
          onClick={handleTrailerClick}
          style={{
            backgroundImage: `url(${
              (poster?.length ?? 0) > 1
                ? `https://image.tmdb.org/t/p/w500${poster}`
                : MoviePlaceholder
            })`,
          }}
        >
          {type != "person" && (
            <div className="flex w-full bg-black/20 font-roboto text-white">
              <div className="mb-[12px] ml-[12px] flex items-center gap-4 self-end capitalize">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-[42px] text-white group-hover:text-[#f5c518] sm:h-[64px]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  role="presentation"
                >
                  <path d="M10.803 15.932l4.688-3.513a .498.498 0 0 0 0-.803l-4.688-3.514a .502.502 0 0 0-.803.402v7.026c0 .412.472.653.803.402z"></path>
                  <path d="M12 24C5.373 24 0 18.627 0 12S5.373 0 12 0s12 5.373 12 12-5.373 12-12 12zm0-1c6.075 0 11-4.925 11-11S18.075 1 12 1 1 5.925 1 12s4.925 11 11 11z"></path>
                </svg>

                <div className="text-[16px] sm:text-[20px]">Play Trailer</div>
              </div>
            </div>
          )}
        </button>

        <div className="relative flex h-auto w-full flex-2">
          {type != "person" && (
            <WatchlistHeartButton
              variant="labeled"
              tmdbId={movieId != null ? String(movieId) : null}
              mediaType={type}
            />
          )}
          <button
            disabled={type == "person"}
            onClick={handleWatchMovieClick}
            className="group flex h-auto w-full"
          >
            <div
              className="aspect-[16/10] h-full max-h-[530px] min-w-[100%] w-full rounded-lg bg-cover bg-center bg-no-repeat content-end"
              style={{
                backgroundImage: `url(${
                  (backdrop?.length ?? 0) > 1
                    ? `https://image.tmdb.org/t/p/w1280${backdrop}`
                    : MoviePlaceholder
                })`,
              }}
            >
              <div className="flex h-full w-full items-center bg-black/20 p-3 text-white sm:p-4">
                {type != "person" && (
                  <div className="flex items-center gap-2 self-end lg:gap-4">
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-[42px] group-hover:text-[#f5c518] sm:h-[72px]"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        role="presentation"
                      >
                        <path d="M10.803 15.932l4.688-3.513a.498.498 0 0 0 0-.803l-4.688-3.514a.502.502 0 0 0-.803.402v7.026c0 .412.472.653.803.402z"></path>
                        <path d="M12 24C5.373 24 0 18.627 0 12S5.373 0 12 0s12 5.373 12 12-5.373 12-12 12zm0-1c6.075 0 11-4.925 11-11S18.075 1 12 1 1 5.925 1 12s4.925 11 11 11z"></path>
                      </svg>
                    </div>
                    <div className="max-w-[70%] text-left">
                      <div className="font-roboto text-[18px] capitalize sm:text-[24px]">
                        <div className="text-[16px] sm:text-[20px]">
                          Watch {type == "movie" ? "movie" : "series"}
                        </div>
                      </div>
                      <div>
                        <VoteCount textColor="white" voteCount={vote} />
                      </div>
                    </div>{" "}
                  </div>
                )}
              </div>
            </div>
          </button>
        </div>
      </div>
    </>
  );
};

