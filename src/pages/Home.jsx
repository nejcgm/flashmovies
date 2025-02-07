import React, { useState, useEffect } from "react";
import { fetchSpecific } from "../functions/Fetching.js";
import Carousel from "../classic-carousel/Carousel";
import HeroCarousel from "../hero-carousel/HeroCarousel";
import ActorCarousel from "../actor-carousel/ActorCarousel";
import Spinner from "../components/Spinner";

const Home = () => {
  const [classicCarousel, setClassicCarousel] = useState([]);
  const [tv, setTv] = useState([]);
  const [heroCarousel, setHeroCarousel] = useState([]);
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(false);

  const cardCount = 20;
  const heroPage = 2;
  const classicPage = 1;

  //type,movieId,search,page)

  useEffect(() => {
    setLoading(true);
    const loadHomeData = async () => {
      try {
        const [data, tv, hero, actors] = await Promise.all([
          fetchSpecific("movie", "", "/popular", "", classicPage),
          fetchSpecific("tv", "", "/popular", "", classicPage),
          fetchSpecific("movie", "", "/popular", "", heroPage),
          fetchSpecific("person", "", "/popular", "", 1)
        ]);

        setClassicCarousel(data);
        setTv(tv);
        setHeroCarousel(hero);
        setActors(actors);
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

          <div className="mt-[100px]">
            <Carousel
              movies={classicCarousel?.results}
              cardCount={20}
              showTitle={`most Popular ${cardCount} Movies`}
              media={"movie"}
            />
          </div>

          <div className="mt-[100px]">
            <Carousel
              movies={tv.results}
              cardCount={20}
              showTitle={`most Popular ${cardCount} Shows`}
              media={"tv"}
            />
          </div>

          <div className="mt-[64px]">
            <ActorCarousel
              showTitle={"Most Popular Actors"}
              cardCount={20}
              actors={actors?.results}
            />
          </div>
          <div className="h-[150px]"> </div>
        </>
      )}
    </>
  );
};

export default Home;
