import { useState } from "react";
import { MoreInfo, VideoPlayer } from "../../../components/dialogs";
import { InfoCta, LazyImage, Rating, VoteCount } from "../../../components";
import { WatchlistHeartButton } from "../../../components/watchlist";
import { useNavigate } from "react-router-dom";

const MoviePlaceholder = "/dark-mode-img-placeholder.png";
const PersonPlaceholder = "/dark-mode-avatar-placeholder.png";
import { triggerContextAdRedirectDirect } from '../../../utils/contextAdRedirect';
import { useAdTracker } from '../../../context/AdTrackerContext';
import { useUser } from '../../../context/UserContext';
import { ClickTypeEnum } from '../../../interfaces/analytics/index.ts';

interface ListItemProps {
  poster: string;
  title: string;
  movieId: string | null;
  voteCount: number;
  year: string;
  type: string;
  rating: number | null;
  largeScreen: boolean;
  index?: number | null | undefined;
  onCancel: () => void;
}

export function ListItem({
  poster,
  title,
  movieId,
  voteCount,
  year,
  type,
  rating,
  largeScreen,
  index,
  onCancel,
}: ListItemProps) {
  const [displayInfo, setDisplayInfo] = useState<boolean>(false);
  const [trailer, setTrailer] = useState<boolean>(false);
  const navigate = useNavigate();
  const { incrementClick } = useAdTracker();
  const { isPro } = useUser();

  const compact = !largeScreen;

  const typeTag =
    type === "movie" ? (
      <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/85 sm:px-2 sm:text-[10px]">
        Movie
      </span>
    ) : type === "tv" ? (
      <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/85 sm:px-2 sm:text-[10px]">
        TV
      </span>
    ) : type === "person" ? (
      <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/85 sm:px-2 sm:text-[10px]">
        Person
      </span>
    ) : null;

  return (
    <>
      {displayInfo && (
        <MoreInfo
          movieId={movieId}
          type={type}
          onCancel={() => {
            setDisplayInfo(false);
          }}
          onTrailer={() => {
            setTrailer(true);
          }}
        />
      )}
      {trailer && (
        <VideoPlayer
          movieId={movieId}
          type={type}
          title={title}
          onCancel={() => {
            setTrailer(false);
          }}
        />
      )}
      <div
        className={`flex ${
          compact
            ? "items-center gap-3 sm:gap-2 sm:items-stretch"
            : "gap-3"
        } ${
          largeScreen
            ? "max-h-[111px] sm:max-h-[111px] lg:max-h-[180px]"
            : "max-h-none"
        }`}
      >
        {compact ? (
          <button
            type="button"
            onClick={() => {
              triggerContextAdRedirectDirect({
                eventLabel: 'list_item_poster_click',
                movieTitle: title,
                movieId: movieId,
                clickType: ClickTypeEnum.MOVIE_CARD,
                isPro
              }, incrementClick);
              setTrailer(true);
            }}
            className="shrink-0"
          >
            <LazyImage
              className={
                type === "person"
                  ? "h-14 w-14 shrink-0 rounded-full object-cover sm:h-[100px] sm:w-[70px] sm:rounded-lg"
                  : "h-14 w-10 shrink-0 rounded-md object-cover sm:h-[100px] sm:w-[70px] sm:rounded-lg"
              }
              src={poster ? `https://image.tmdb.org/t/p/w500${poster}` : (type === 'person' ? PersonPlaceholder : MoviePlaceholder)}
              alt={`${title || 'Content'} ${type === 'person' ? 'photo' : 'poster'}`}
              placeholder={type === 'person' ? PersonPlaceholder : MoviePlaceholder}
            />
          </button>
        ) : (
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => {
                triggerContextAdRedirectDirect({
                  eventLabel: 'list_item_poster_click',
                  movieTitle: title,
                  movieId: movieId,
                  clickType: ClickTypeEnum.MOVIE_CARD,
                  isPro
                }, incrementClick);
                setTrailer(true);
              }}
            >
              <LazyImage
                className="lg:w-[120px] lg:h-[180px] w-[74px] h-[111px] rounded-lg object-cover"
                src={poster ? `https://image.tmdb.org/t/p/w500${poster}` : MoviePlaceholder}
                alt={`${title || 'Content'} poster`}
                placeholder={MoviePlaceholder}
              />
            </button>
            <WatchlistHeartButton
              tmdbId={movieId}
              mediaType={type}
              className="max-sm:hidden"
            />
          </div>
        )}

        {compact ? (
          <div
            className={`${
              type != "person" && "self-start sm:self-start"
            } flex min-w-0 flex-1 flex-col`}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="hidden h-[18px] w-[18px] shrink-0 text-white sm:block sm:h-[24px] sm:w-[24px]"
                viewBox="0 0 24 24"
                fill="currentColor"
                role="presentation"
              >
                <path d="M10.803 15.932l4.688-3.513a .498.498 0 0 0 0-.803l-4.688-3.514a .502.502 0 0 0-.803.402v7.026c0 .412.472.653.803.402z"></path>
                <path d="M12 24C5.373 24 0 18.627 0 12S5.373 0 12 0s12 5.373 12 12-5.373 12-12 12zm0-1c6.075 0 11-4.925 11-11S18.075 1 12 1 1 5.925 1 12s4.925 11 11 11z"></path>
              </svg>
              <button
                type="button"
                onClick={() => {
                  triggerContextAdRedirectDirect({
                    eventLabel: 'list_item_navigation_click',
                    movieTitle: title,
                    movieId: movieId,
                    clickType: ClickTypeEnum.MOVIE_CARD,
                    isPro
                  }, incrementClick);
                  navigate(`/movie-info/?id=${movieId}&type=${type}`);
                  onCancel();
                }}
                className="inline-flex max-w-full min-w-0 items-start gap-x-1 text-left font-roboto text-[13px] font-semibold leading-snug text-white sm:text-[15px]"
              >
                {index !== null && index !== undefined ? (
                  <span className="shrink-0">{index + 1}.</span>
                ) : null}
                <span className="line-clamp-2 min-w-0">
                  {title}
                </span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerContextAdRedirectDirect({
                  eventLabel: 'list_item_navigation_click',
                  movieTitle: title,
                  movieId: movieId,
                  clickType: ClickTypeEnum.MOVIE_CARD,
                  isPro
                }, incrementClick);
                navigate(`/movie-info/?id=${movieId}&type=${type}`);
                onCancel();
              }}
              className="mt-1 w-full text-left font-roboto"
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-[#a8a8a8] sm:gap-x-2.5 sm:text-[13px] sm:text-gray-400">
                {year ? (
                  <span className="shrink-0 tabular-nums">{year.substring(0, 4)}</span>
                ) : null}
                {voteCount > 0 ? (
                  <span className="flex shrink-0 items-center">
                    <VoteCount voteCount={voteCount} />
                  </span>
                ) : null}
                {typeTag}
                {rating ? (
                  <span className="shrink-0 text-white">
                    <Rating rating={rating} />
                  </span>
                ) : null}
              </div>
              {type != "person" && (
                <div
                  className="flex items-center gap-2 pt-1"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <WatchlistHeartButton
                    variant="inline"
                    size="sm"
                    tmdbId={movieId}
                    mediaType={type}
                    className="shrink-0"
                  />
                  <InfoCta
                    infoDisplay={() => {
                      setDisplayInfo(true);
                    }}
                    infoMessage={""}
                    className="p-1 sm:p-1"
                    iconClassName="w-[18px] sm:w-[18px]"
                  />
                </div>
              )}
            </button>
          </div>
        ) : (
        <>
          <div className="flex min-w-0 flex-1 flex-col sm:hidden">
            <div className="flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 shrink-0 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
                role="presentation"
              >
                <path d="M10.803 15.932l4.688-3.513a .498.498 0 0 0 0-.803l-4.688-3.514a .502.502 0 0 0-.803.402v7.026c0 .412.472.653.803.402z"></path>
                <path d="M12 24C5.373 24 0 18.627 0 12S5.373 0 12 0s12 5.373 12 12-5.373 12-12 12zm0-1c6.075 0 11-4.925 11-11S18.075 1 12 1 1 5.925 1 12s4.925 11 11 11z"></path>
              </svg>
              <button
                type="button"
                onClick={() => {
                  triggerContextAdRedirectDirect({
                    eventLabel: 'list_item_navigation_click',
                    movieTitle: title,
                    movieId: movieId,
                    clickType: ClickTypeEnum.MOVIE_CARD,
                    isPro
                  }, incrementClick);
                  navigate(`/movie-info/?id=${movieId}&type=${type}`);
                  onCancel();
                }}
                className="inline-flex max-w-full min-w-0 items-start gap-x-1 text-left font-roboto text-[14px] font-semibold leading-snug text-white"
              >
                {index !== null && index !== undefined ? (
                  <span className="shrink-0">{index + 1}.</span>
                ) : null}
                <span className="line-clamp-2 min-w-0">
                  {title.length > 30 ? `${title.substring(0, 30)}...` : title}
                </span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerContextAdRedirectDirect({
                  eventLabel: 'list_item_navigation_click',
                  movieTitle: title,
                  movieId: movieId,
                  clickType: ClickTypeEnum.MOVIE_CARD,
                  isPro
                }, incrementClick);
                navigate(`/movie-info/?id=${movieId}&type=${type}`);
                onCancel();
              }}
              className="mt-1 w-full text-left font-roboto"
            >
              <div className="flex gap-2 text-[12px] text-[#C0C0C0]">
                <div>{year?.substring(0, 4)}</div>
                <div className="text-white">
                  {rating && <Rating rating={rating} />}
                </div>
              </div>
              {type != "person" && (
                <div
                  className="flex items-center gap-2 self-start pt-1"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {voteCount > 0 ? (
                    <VoteCount voteCount={voteCount} />
                  ) : null}
                  <WatchlistHeartButton
                    variant="inline"
                    size="sm"
                    tmdbId={movieId}
                    mediaType={type}
                    className="shrink-0"
                  />
                  <InfoCta
                    infoDisplay={() => {
                      setDisplayInfo(true);
                    }}
                    infoMessage={""}
                  />
                </div>
              )}
            </button>
          </div>
        <button
          type="button"
          onClick={() => {
            triggerContextAdRedirectDirect({
              eventLabel: 'list_item_navigation_click',
              movieTitle: title,
              movieId: movieId,
              clickType: ClickTypeEnum.MOVIE_CARD,
              isPro
            }, incrementClick);
            navigate(`/movie-info/?id=${movieId}&type=${type}`);
            onCancel();
          }}
          className={`${
            type != "person" && "self-start sm:self-start"
          } group hidden w-full min-w-0 flex-1 sm:flex`}
        >
          <div className="font-roboto flex h-full w-full min-w-0 flex-col text-left">
            <>
                <div className="flex h-[52px] items-center gap-2 sm:h-[52px] lg:h-[48px]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 shrink-0 text-white group-hover:text-[#f5c518] sm:h-[24px] sm:w-[24px] lg:h-[32px] lg:w-[32px]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    role="presentation"
                  >
                    <path d="M10.803 15.932l4.688-3.513a .498.498 0 0 0 0-.803l-4.688-3.514a .502.502 0 0 0-.803.402v7.026c0 .412.472.653.803.402z"></path>
                    <path d="M12 24C5.373 24 0 18.627 0 12S5.373 0 12 0s12 5.373 12 12-5.373 12-12 12zm0-1c6.075 0 11-4.925 11-11S18.075 1 12 1 1 5.925 1 12s4.925 11 11 11z"></path>
                  </svg>
                  <div className="flex gap-1 text-[14px] font-semibold leading-snug text-white sm:text-[15px] lg:text-[19px]">
                    {index !== null && index !== undefined && (
                      <div>{index + 1}.</div>
                    )}
                    <div>{title}</div>
                  </div>
                </div>
                <div className="flex gap-2 text-[12px] text-[#C0C0C0] sm:text-[14px] lg:text-[16px]">
                  <div>{year?.substring(0, 4)}</div>
                  <div className="text-white">
                    {rating && <Rating rating={rating} />}
                  </div>
                </div>
                <div className="flex h-full">
                  <div className="flex w-[100px] justify-between self-end">
                    {voteCount > 0 ? (
                      <VoteCount voteCount={voteCount} />
                    ) : (
                      <div></div>
                    )}
                    {type != "person" && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className=""
                      >
                        <InfoCta
                          infoDisplay={() => {
                            setDisplayInfo(true);
                          }}
                          infoMessage={""}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </>
          </div>
        </button>
        </>
        )}
      </div>
    </>
  );
};

