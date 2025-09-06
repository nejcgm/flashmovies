import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ListItem from "./list-components/ListItem";
import Spiner from "../components/Spinner";
import GenreListComponent from "./list-components/GenreListComponent";
import BackButton from "../components/BackButton";
import { fetchSpecific } from "../utils/fetching.ts";
import { formatTitle } from "../utils/helpers.ts";
import { DataInfoProps, MediaType } from "../utils/Interfaces.ts";
import Meta from "../SEO/meta.tsx";
import ItemListSchema from '../SEO/ItemListSchema.tsx';
import BreadcrumbSchema from '../SEO/BreadcrumbSchema.tsx';
import AffiliateLinks from '../components/AffiliateLinks';

const List: React.FC = () => {
  const [listItems, setListItems] = useState<DataInfoProps[]>([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const search = searchParams.get("search");
  const type = searchParams.get("type") as MediaType;
  const title: string | null = searchParams.get("title");

  const [counter, setCounter] = useState(1);
  const [loading, setLoading] = useState(false);
  const lastItemRef = useRef<HTMLDivElement | null>(null);
  const [genreList, setGenreList] = useState<number[]>([]);
  const [endOfList, setEndOfList] = useState(false);

  useEffect(() => {
    if (!type || !search) {
      navigate('/', { replace: true });
      return;
    }
  }, [type, search, navigate]);

  useEffect(() => {
    setCounter(1);
    setListItems([]);
  }, [genreList]);

  useEffect(() => {
    const loadList = async () => {
      if (search != "discover") {
        setLoading(true);
        const data = await fetchSpecific(type, "", search, null, counter);
        if (data && data.results) {
          setListItems((prevItems: DataInfoProps[]) => [
            ...prevItems,
            ...data.results,
          ]);
        }
        setLoading(false);
      } else {
        setLoading(true);
        setEndOfList(false);
        const data = await fetchSpecific(search, type, "", genreList, counter);
        if (data && data.results.length !== 0) {
          setListItems((prevItems: DataInfoProps[]) => [
            ...prevItems,
            ...data.results,
          ]);
          setLoading(false);
        } else {
          setEndOfList(true);
          return;
        }
      }
    };
    loadList();
  }, [type, search, counter, genreList]);

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
          ...(listItems.slice(0, 10).map((item: DataInfoProps) => item.title || item.name).filter(Boolean)),
          `${type ? "movies" : "series"} streaming`, `free ${type ? "movies" : "series"}`, `watch ${type ? "movies" : "series"} online`, formatTitle(title) || '', 'flash movies', 'flashmovies', 'flashmovies.xyz'
        ]}
        type="website"
      />

      <BreadcrumbSchema 
        items={[
          { name: "Home", url: "https://flashmovies.xyz/" },
          { 
            name: type === 'movie' ? 'Movies' : type === 'tv' ? 'TV Shows' : 'People', 
            url: `https://flashmovies.xyz/list-items?type=${type}&search=popular&title=popular-${type}s` 
          },
          { 
            name: formatTitle(title) || 'Browse', 
            url: window.location.href 
          }
        ]}
      />

      <ItemListSchema 
        listName={formatTitle(title) || `${type === 'movie' ? 'Movies' : 'TV Shows'}`}
        description={`Browse and watch ${formatTitle(title)} on Flash Movies. Stream ${type === 'movie' ? 'movies' : 'TV shows'} in HD for free.`}
        url={window.location.href}
        items={listItems.slice(0, 20).map((item: DataInfoProps) => ({
          name: item.title || item.name || '',
          url: `https://flashmovies.xyz/movie-info?type=${type}&id=${item.id}`,
          image: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : undefined,
          description: item.overview?.slice(0, 150) || ''
        }))}
      />

      <div className="w-full flex flex-col">
        <div className="flex flex-col w-[100%] sm:w-[70%] self-center gap-2 sm:gap-4 p-4 bg-[#101010] rounded-lg">
          <h1 className="font-roboto text-[#f5c518] text-[24px] sm:text-[32px] mb-[18px] sm:mb-[16px] flex gap-1 sm:gap-3 font-semibold">
            <BackButton />
            {formatTitle(title)}
          </h1>

          {search == "discover" && (
            <GenreListComponent type={type} genreList={setGenreList} />
          )}

          <div className="mb-3">
            <AffiliateLinks 
              movieTitle={`${type === 'movie' ? 'Movies' : type === 'tv' ? 'TV Shows' : 'Content'}`}
              className="bg-gradient-to-r from-[#0f0f0f] to-[#1a1a1a] mx-0 px-0"
            />
          </div>

          {listItems.map((item: DataInfoProps, index: number) => {
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
                  poster={item.poster_path || item.profile_path}
                  title={item.title || item.name}
                  movieId={item.id}
                  voteCount={item.vote_count}
                  year={item.release_date || item.first_air_date}
                  type={type}
                  rating={item.vote_average}
                  largeScreen={true}
                  onCancel={() => {}}
                />
              </div>
            );
          })}

          {loading && !endOfList && (
            <div className="flex w-full flex-1 justify-center">
              <Spiner />
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

export default List;
