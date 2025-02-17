import React, { useState, useEffect } from "react";
import { fetchSpecific } from "../functions/Fetching.js";
import Carousel from "../carousels/classic-carousel/Carousel";
import HeroCarousel from "../carousels/hero-carousel/HeroCarousel";
import ActorCarousel from "../carousels/actor-carousel/ActorCarousel";
import Spinner from "../components/Spinner";

const Home = () => {
  const [classicCarousel, setClassicCarousel] = useState<[]>([]);
  const [tv, setTv] = useState<[]>([]);
  const [heroCarousel, setHeroCarousel] = useState<[]>([]);
  const [actors, setActors] = useState<[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const cardCount = 20;
  const heroPage = 2;
  const classicPage = 1;

  //type,movieId,search,page)

  useEffect(() => {
    setLoading(true);
    const loadHomeData = async () => {
      try {
        const [data, tv, hero, actors] = await Promise.all([
          fetchSpecific("movie", "", "/popular", null, classicPage),
          fetchSpecific("tv", "", "/popular", null, classicPage),
          fetchSpecific("movie", "", "/popular", null, heroPage),
          fetchSpecific("person", "", "/popular", null, 1),
        ]);
        if (hero && data && tv && actors) {
          setHeroCarousel(hero.results);
          setClassicCarousel(data.results);
          setTv(tv.results);
          setActors(actors.results);
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
      {loading && (
        <div className="flex w-full justify-center">
          <Spinner />
        </div>
      )}

      {!loading && (
        <>
          <HeroCarousel
            moviesHero={heroCarousel}
            cardCount={20}
            showTitle={"explore Trailers"}
          />

          <div className="mt-[42px] sm:mt-[100px]">
            <Carousel
              movies={classicCarousel}
              cardCount={20}
              showTitle={`most Popular ${cardCount} Movies`}
              type={"movie"}
            />
          </div>

          <div className="mt-[42px] sm:mt-[100px]">
            <Carousel
              movies={tv}
              cardCount={20}
              showTitle={`most Popular ${cardCount} Shows`}
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
          <div className="h-[150px]"> </div>
        </>
      )}
    </>
  );
};

export default Home;
