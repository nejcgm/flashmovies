import React, { useState, useEffect } from "react";
import { fetchSpecific } from "../functions/Fetching.js";
import Carousel from "../carousels/classic-carousel/Carousel";
import HeroCarousel from "../carousels/hero-carousel/HeroCarousel";
import ActorCarousel from "../carousels/actor-carousel/ActorCarousel";
import Spinner from "../components/Spinner";
import Meta from "../SEO/meta.tsx";
import AffiliateLinks from '../components/AffiliateLinks';

const Home = () => {
  const [classicCarousel, setClassicCarousel] = useState<[]>([]);
  const [tv, setTv] = useState<[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<[]>([]);
  const [topRatedTvShows, setTopRatedTvShows] = useState<[]>([]);
  const [onTheAirTvShows, setOnTheAirTvShows] = useState<[]>([]);
  const [heroCarousel, setHeroCarousel] = useState<[]>([]);
  const [actors, setActors] = useState<[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const heroPage = 2;
  const classicPage = 1;


  useEffect(() => {
    setLoading(true);
    const loadHomeData = async () => {
      try {
        const [data, tv, hero, actors, topRatedMovies, upcomingMovies, topRatedTv, onTheAirTv] = await Promise.all([
          fetchSpecific("movie", "", "/popular", null, classicPage),
          fetchSpecific("tv", "", "/popular", null, classicPage),
          fetchSpecific("movie", "", "/popular", null, heroPage),
          fetchSpecific("person", "", "/popular", null, 1),
          fetchSpecific("movie", "", "/top_rated", null, classicPage),
          fetchSpecific("movie", "", "/upcoming", null, classicPage),
          fetchSpecific("tv", "", "/top_rated", null, classicPage),
          fetchSpecific("tv", "", "/on_the_air", null, classicPage),
        ]);
        if (hero && data && tv && actors && topRatedMovies && upcomingMovies && topRatedTv && onTheAirTv) {
          setHeroCarousel(hero.results);
          setClassicCarousel(data.results);
          setTv(tv.results);
          setActors(actors.results);
          setTopRatedMovies(topRatedMovies.results);
          setUpcomingMovies(upcomingMovies.results);
          setTopRatedTvShows(topRatedTv.results);
          setOnTheAirTvShows(onTheAirTv.results);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, [heroPage, classicPage]);

  return (
    <>
      <Meta/>
      {loading && (
        <div className="flex w-full justify-center">
          <Spinner />
        </div>
      )}

      {!loading && (
        <>
          <div className="sr-only">
            <h1>Flash Movies - Free Movie Streaming Platform</h1>
            <p>Welcome to Flash Movies (flashmovies.xyz), your premier destination for free movie and TV show streaming. 
            Flash Movies offers thousands of movies and TV series in HD quality. Stream popular movies, latest releases, 
            and trending TV shows on Flash Movies platform completely free.</p>
            <h2>What you can watch on Flash Movies:</h2>
            <ul>
              <li>Latest blockbuster movies on Flash Movies</li>
              <li>Popular TV series and shows</li>
              <li>Classic movies and timeless favorites</li>
              <li>Trending content updated daily</li>
            </ul>
          </div>

          <HeroCarousel
            moviesHero={heroCarousel}
            cardCount={20}
            showTitle={"explore Trailers"}
          />

          <div className="mt-[42px] sm:mt-[64px]">
            <Carousel
              movies={classicCarousel}
              cardCount={20}
              showTitle={`most Popular Movies`}
              type={"movie"}
            />
          </div>

          <div className="mt-[24px] sm:mt-[64px]">
            <Carousel
              movies={topRatedMovies}
              cardCount={20}
              showTitle={`Top Rated Movies`}
              type={"movie"}
            />
          </div>

          <div className="mt-[24px] sm:mt-[64px]">
            <Carousel
              movies={upcomingMovies}
              cardCount={20}
              showTitle={`Latest Releases`}
              type={"movie"}
            />
          </div>

          <div className="mt-[32px] sm:mt-[64px]">
            <AffiliateLinks 
              movieTitle="Flash Movies"
              className="bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] border-2 border-[#f5c518]"
            />
          </div>

          <div className="mt-[24px] sm:mt-[64px]">
            <Carousel
              movies={tv}
              cardCount={20}
              showTitle={`most Popular TV Shows`}
              type={"tv"}
            />
          </div>

          <div className="mt-[24px] sm:mt-[64px]">
            <Carousel
              movies={topRatedTvShows}
              cardCount={20}
              showTitle={`Top Rated TV Shows`}
              type={"tv"}
            />
          </div>

          <div className="mt-[24px] sm:mt-[64px]">
            <Carousel
              movies={onTheAirTvShows}
              cardCount={20}
              showTitle={`On The Air TV Shows`}
              type={"tv"}
            />
          </div>

          <div className="mt-[32px] sm:mt-[64px]">
            <ActorCarousel
              showTitle={"Most Popular Actors"}
              cardCount={20}
              actors={actors}
            />
          </div>
          <div className="h-[80px] sm:h-[120px]"> </div>
        </>
      )}
    </>
  );
};

export default Home;
