import { useEffect, useRef, useState } from "react";
import { Meta } from "../../SEO";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GenreListComponent, ListItem } from "./components";
import { BackButton, Spinner } from "../../components";
import { fetchSpecific, fetchThisYearHighlights, fetchTrending } from "../../client/tmdb.ts";
import { formatTitle } from "../../utils/helpers.ts";
import { MediaListItem, MediaType } from "../../interfaces/media/index.ts";
import type { TmdbMediaType } from "../../interfaces/tmdb/index.ts";
import { mediaDisplayTitle } from "../../utils/mediaDisplayTitle";
import { useUser } from "../../context/UserContext";
import { useProUpsell } from "../../context/ProUpsellContext";

export function ListPage() {
  const [listItems, setListItems] = useState<MediaListItem[]>([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isPro, isLoading: userLoading } = useUser();
  const { openProUpsell } = useProUpsell();
  const search = searchParams.get("search");
  const type = searchParams.get("type") as MediaType;
  const title: string | null = searchParams.get("title");
  const withGenresParam = searchParams.get("with_genres");
  const isTrendingToday = search === "trending_day";

  const [counter, setCounter] = useState(1);
  const [loading, setLoading] = useState(false);
  const lastItemRef = useRef<HTMLDivElement | null>(null);
  const [genreList, setGenreList] = useState<number[]>(() => {
    if (!withGenresParam) return [];
    return withGenresParam
      .split(",")
      .map((value) => Number.parseInt(value, 10))
      .filter((id) => Number.isFinite(id) && id > 0);
  });
  const [endOfList, setEndOfList] = useState(false);

  useEffect(() => {
    if (!type || !search) {
      navigate('/', { replace: true });
      return;
    }
  }, [type, search, navigate]);

  useEffect(() => {
    if (!userLoading && isTrendingToday && !isPro) {
      openProUpsell("trending_today");
    }
  }, [userLoading, isTrendingToday, isPro, openProUpsell]);

  useEffect(() => {
    setCounter(1);
    setListItems([]);
    setEndOfList(false);
  }, [genreList]);

  useEffect(() => {
    if (isTrendingToday && (userLoading || !isPro)) {
      return;
    }

    const loadList = async () => {
      if (!type || !search) {
        return;
      }

      if (search === "discover") {
        setLoading(true);
        setEndOfList(false);
        const data = await fetchSpecific(
          "discover",
          type as TmdbMediaType,
          "",
          genreList,
          counter,
        );
        if (data && data.results.length !== 0) {
          setListItems((prevItems) => [
            ...prevItems,
            ...data.results,
          ]);
          setLoading(false);
        } else {
          setEndOfList(true);
          setLoading(false);
          return;
        }
        return;
      }

      setLoading(true);
      let data: Awaited<ReturnType<typeof fetchSpecific>> = null;

      if (search === "trending_week") {
        if (type === "movie") {
          data = await fetchTrending("movie", "week", counter);
        } else if (type === "tv") {
          data = await fetchTrending("tv", "week", counter);
        }
      } else if (search === "trending_day") {
        if (type === "movie") {
          data = await fetchTrending("movie", "day", counter);
        } else if (type === "tv") {
          data = await fetchTrending("tv", "day", counter);
        }
      } else if (search === "year_highlights" && type === "movie") {
        data = await fetchThisYearHighlights(counter);
      } else {
        data = await fetchSpecific(type, "", `/${search}`, null, counter);
      }

      if (data && data.results?.length) {
        setListItems((prevItems) => [
          ...prevItems,
          ...data.results,
        ]);
      } else if (counter > 1) {
        setEndOfList(true);
      }
      setLoading(false);
    };
    loadList();
  }, [type, search, counter, genreList, isTrendingToday, userLoading, isPro]);

  useEffect(() => {
    if (endOfList) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCounter((prev) => prev + 1);
            observer.unobserve(entry.target);
          }
        });
      },
      { root: null, threshold: 1.0 }
    );

    if (lastItemRef.current) {
      observer.observe(lastItemRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [listItems, endOfList]);

  return (
    <>
      <Meta 
        title={`${formatTitle(title)} - Flash Movies`}
        description={`Browse and watch ${formatTitle(title)} on Flash Movies. Stream ${type === 'movie' ? 'movies' : 'TV shows'} in HD for free. Discover ${formatTitle(title)} and start watching now.`}
        image={
          listItems && listItems.length > 0 && listItems[0]?.poster_path 
            ? `https://image.tmdb.org/t/p/w500${listItems[0].poster_path}` 
            : listItems && listItems.length > 0 && listItems[0]?.backdrop_path 
              ? `https://image.tmdb.org/t/p/w1280${listItems[0].backdrop_path}` 
              : "https://flashmovies.xyz/flash-movies-logo.png"
        }
      url={window.location.href}
        keywords={[
          ...(listItems.slice(0, 10).map((item) => mediaDisplayTitle(item)).filter(Boolean)),
          `${type ? "movies" : "series"} streaming`, `free ${type ? "movies" : "series"}`, `watch ${type ? "movies" : "series"} online`, formatTitle(title) || '', 'flash movies', 'flashmovies', 'flashmovies.xyz'
        ]}
        type="website"
      />

      <div className="w-full flex flex-col">
        <div className="flex flex-col w-[100%] sm:w-[70%] self-center gap-2.5 sm:gap-[18px] p-4 bg-[#101010] rounded-lg">
          <h1 className="font-roboto flex min-w-0 items-center gap-2 text-xl font-semibold leading-snug text-white sm:gap-3 sm:text-2xl md:text-3xl lg:text-4xl">
            <span className="shrink-0">
              <BackButton />
            </span>
            <span className="min-w-0">{formatTitle(title)}</span>
          </h1>

          {search == "discover" && (
            <GenreListComponent type={type} genreList={setGenreList} />
          )}

          {listItems.map((item, index) => {
            const isLastItem = index === listItems.length - 1;

            return (
              <div
                key={index}
                ref={isLastItem ? lastItemRef : null}
                className=""
              >
                <ListItem
                  index={index}
                  key={item.id}
                  poster={item.poster_path || item.profile_path || ""}
                  title={mediaDisplayTitle(item)}
                  movieId={item.id != null ? String(item.id) : null}
                  voteCount={item.vote_count ?? 0}
                  year={item.release_date || item.first_air_date || ""}
                  type={type}
                  rating={item.vote_average ?? null}
                  largeScreen={true}
                  onCancel={() => {}}
                />
              </div>
            );
          })}

          {loading && !endOfList && (
            <div className="flex w-full flex-1 justify-center">
              <Spinner />
            </div>
          )}
          {endOfList && (
            <div className="font-roboto text-[24px] text-[#F5C518] font-semibold">
              No More Results Avaliable
            </div>
          )}
        </div>
      </div>
    </>
  );
};

