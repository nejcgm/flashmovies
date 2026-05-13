import React, { useState, useEffect } from "react";
import {
  fetchSpecific,
  fetchTrending,
  fetchThisYearHighlights,
} from "../utils/fetching.js";
import GenreSpotlightCarousel from "../components/GenreSpotlightCarousel";
import Carousel from "../carousels/classic-carousel/Carousel";
import HeroCarousel from "../carousels/hero-carousel/HeroCarousel";
import ActorCarousel from "../carousels/actor-carousel/ActorCarousel";
import Spinner from "../components/Spinner";
import Meta from "../SEO/meta.tsx";
import { useLocaleStorageList } from "../utils/toLocaleStorageList.ts";
import AffiliateLinks from "../components/AffiliateLinks.tsx";
import { ProPlansPromoStrip } from "../components/common/ProPlansPromoStrip";
import SectionDivider from "../components/SectionDivider";
import { useUser } from "../context/UserContext";

const LIST_MORE = {
  heroNowPlaying:
    "/list-items?type=movie&search=now_playing&title=now-playing-movies",
  movieTrendingWeek:
    "/list-items?type=movie&search=trending_week&title=trending-movies-this-week",
  movieTopRated: "/list-items?type=movie&search=top_rated&title=top-rated-movies",
  movieUpcoming: "/list-items?type=movie&search=upcoming&title=upcoming-movies",
  tvTrendingWeek:
    "/list-items?type=tv&search=trending_week&title=trending-tv-this-week",
  tvTopRated: "/list-items?type=tv&search=top_rated&title=top-rated-shows",
  tvOnTheAir: "/list-items?type=tv&search=on_the_air&title=on-the-air",
  actorsPopular:
    "/list-items?type=person&search=popular&title=most-popular-actors",
} as const;

const Home = () => {
  const [topRatedMovies, setTopRatedMovies] = useState<[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<[]>([]);
  const [topRatedTvShows, setTopRatedTvShows] = useState<[]>([]);
  const [onTheAirTvShows, setOnTheAirTvShows] = useState<[]>([]);
  const [heroCarousel, setHeroCarousel] = useState<[]>([]);
  const [actors, setActors] = useState<[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<[]>([]);
  const [thisYearHighlights, setThisYearHighlights] = useState<[]>([]);
  const [trendingTv, setTrendingTv] = useState<[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { isPro } = useUser();

  const heroPage = 2;
  const classicPage = 1;
  const highlightYear = new Date().getFullYear();
  const movieYearHighlightsList = `/list-items?type=movie&search=year_highlights&title=this-years-movie-highlights-${highlightYear}`;

  useEffect(() => {
    setLoading(true);
    const loadHomeData = async () => {
      try {
        const [
          hero,
          actors,
          topRatedMovies,
          upcomingMovies,
          topRatedTv,
          onTheAirTv,
          trendingMovieData,
          yearHighlightsData,
          trendingTvData,
        ] = await Promise.all([
          fetchSpecific("movie", "", "/now_playing", null, heroPage),
          fetchSpecific("person", "", "/popular", null, classicPage),
          fetchSpecific("movie", "", "/top_rated", null, classicPage),
          fetchSpecific("movie", "", "/upcoming", null, classicPage),
          fetchSpecific("tv", "", "/top_rated", null, classicPage),
          fetchSpecific("tv", "", "/on_the_air", null, classicPage),
          fetchTrending("movie", "week", classicPage),
          fetchThisYearHighlights(classicPage),
          fetchTrending("tv", "week", classicPage),
        ]);
        if (
          hero &&
          actors &&
          topRatedMovies &&
          upcomingMovies &&
          topRatedTv &&
          onTheAirTv
        ) {
          setHeroCarousel(hero.results);
          setActors(actors.results);
          setTopRatedMovies(topRatedMovies.results);
          setUpcomingMovies(upcomingMovies.results);
          setTopRatedTvShows(topRatedTv.results);
          setOnTheAirTvShows(onTheAirTv.results);
          setTrendingMovies((trendingMovieData?.results as []) ?? []);
          setThisYearHighlights((yearHighlightsData?.results as []) ?? []);
          setTrendingTv((trendingTvData?.results as []) ?? []);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, [heroPage, classicPage]);

  const [recentMovies] = useLocaleStorageList(
    `movie`,
    `recentlyViewedmovieIdStorage`,
    `recentlyViewedmovieCache`,
    20
  );
  const [recentTvShows] = useLocaleStorageList(
    `tv`,
    `recentlyViewedtvIdStorage`,
    `recentlyViewedtvCache`,
    20
  );

  return (
    <>
      <Meta />
      {loading && (
        <div className="flex w-full justify-center">
          <Spinner />
        </div>
      )}

      {!loading && (
        <>
          <div className="sr-only">
            <h1>Flash Movies - Free Movie Streaming Platform</h1>
            <p>
              Welcome to Flash Movies (flashmovies.xyz), your premier
              destination for free movie and TV show streaming. Flash Movies
              offers thousands of movies and TV series in HD quality. Stream
              popular movies, latest releases, and trending TV shows on Flash
              Movies platform completely free.
            </p>
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
            viewAllTo={LIST_MORE.heroNowPlaying}
          />

          {!isPro && (
            <div className="text-center text-xs sm:text-sm px-3 text-gray-500 mt-4 sm:mt-8">
              Ads can be a pain, but they are our only way to maintain the server.
              Your patience is highly appreciated and we hope our service can be
              worth it.
            </div>
          )}

          <SectionDivider title="Movies" icon="movie" />

          {recentMovies.length > 0 && (
            <div className="mt-9 sm:mt-[42px]">
              <Carousel
                movies={recentMovies}
                cardCount={20}
                showTitle={`Recently Viewed Movies`}
                type={"movie"}
              />
            </div>
          )}

          <div
            className={`mt-9 ${
              recentMovies.length > 0 ? "sm:mt-[64px]" : "sm:mt-[42px]"
            }`}
          >
            <Carousel
              movies={trendingMovies}
              cardCount={20}
              showTitle="Trending movies this week"
              type="movie"
              viewAllTo={LIST_MORE.movieTrendingWeek}
            />
          </div>

          <div className="mt-9 sm:mt-[64px]">
            <Carousel
              movies={thisYearHighlights}
              cardCount={20}
              showTitle={`This year's highlights (${highlightYear})`}
              type="movie"
              viewAllTo={movieYearHighlightsList}
            />
          </div>

          <div className="mt-9 sm:mt-[64px]">
            <Carousel
              movies={topRatedMovies}
              cardCount={20}
              showTitle={`Top Rated Movies`}
              type={"movie"}
              viewAllTo={LIST_MORE.movieTopRated}
            />
          </div>

          <div className="mt-9 sm:mt-[64px]">
            <Carousel
              movies={upcomingMovies}
              cardCount={20}
              showTitle={`Latest Releases`}
              type={"movie"}
              viewAllTo={LIST_MORE.movieUpcoming}
            />
          </div>

          <GenreSpotlightCarousel media="movie" />

          {!isPro && (
            <div className="mt-9 sm:mt-[64px]">
              <ProPlansPromoStrip prominent />
            </div>
          )}

          <SectionDivider title="TV Shows" icon="tv" />

          {recentTvShows.length > 0 && (
            <div className="mt-9 sm:mt-[64px]">
              <Carousel
                movies={recentTvShows}
                cardCount={20}
                showTitle={`Recently Viewed TV Shows`}
                type={"tv"}
              />
            </div>
          )}

          <div className="mt-9 sm:mt-[64px]">
            <Carousel
              movies={trendingTv}
              cardCount={20}
              showTitle="Trending TV this week"
              type="tv"
              viewAllTo={LIST_MORE.tvTrendingWeek}
            />
          </div>

          <div className="mt-9 sm:mt-[64px]">
            <Carousel
              movies={topRatedTvShows}
              cardCount={20}
              showTitle={`Top Rated TV Shows`}
              type={"tv"}
              viewAllTo={LIST_MORE.tvTopRated}
            />
          </div>

          <div className="mt-9 sm:mt-[64px]">
            <Carousel
              movies={onTheAirTvShows}
              cardCount={20}
              showTitle={`On The Air TV Shows`}
              type={"tv"}
              viewAllTo={LIST_MORE.tvOnTheAir}
            />
          </div>

          <GenreSpotlightCarousel media="tv" />

          <SectionDivider title="Popular Celebrities" icon="actor" />

          <div className="mt-9 sm:mt-[64px]">
            <ActorCarousel
              showTitle={"Most Popular Actors"}
              cardCount={20}
              actors={actors}
              viewAllTo={LIST_MORE.actorsPopular}
            />
          </div>

          {!isPro && (
            <div className="mt-9 sm:mt-[64px]">
              <AffiliateLinks
                movieTitle="Flash Movies"
                className="bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] border-2 border-[#f5c518]"
              />
            </div>
          )}

          <div className="h-[80px] sm:h-[120px]"> </div>
        </>
      )}
    </>
  );
};

export default Home;
