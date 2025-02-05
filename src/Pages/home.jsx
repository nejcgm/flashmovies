import React, { useState, useEffect } from 'react'
import { fetchSpecific } from '../Functions/fetching';
import Carousel from '../ClassicCarousel/carousel';
import HeroCarousel from '../HeroCarousel/heroCarousel';
import ActorCarousel from '../actorCarousel/actorCarousel';
import Spiner from '../Components/spiner';

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
      const data = await fetchSpecific('movie', '', '/popular','', classicPage);
      setClassicCarousel(data);
    
      const tv = await fetchSpecific('tv', '', '/popular','', classicPage);
      setTv(tv);
    
      const hero = await fetchSpecific('movie', '', '/popular','', heroPage);
      setHeroCarousel(hero);
     
      const actors = await fetchSpecific('person', '', '/popular','', 1);
      setActors(actors);
      setLoading(false);
    };

    loadHomeData();
  }, [heroPage, classicPage]);


  return (
    <>
      {loading && <div className='flex w-full justify-center'>
        <Spiner />
      </div>
      }

      {!loading &&
        <>
          <HeroCarousel
            moviesHero={heroCarousel}
            cardCount={20}
            showTitle={'explore Trailers'}
          />

          <div className='mt-[100px]'>
            <Carousel
              movies={classicCarousel?.results}
              cardCount={20}
              showTitle={`most Popular ${cardCount} Movies`}
              media={'movie'}
            />
          </div>

          <div className='mt-[100px]'>
            <Carousel
              movies={tv.results}
              cardCount={20}
              showTitle={`most Popular ${cardCount} Shows`}
              media={'tv'}
            />
          </div>

          <div className='mt-[64px]'>
            <ActorCarousel
              showTitle={'Most Popular Actors'}
              cardCount={20}
              actors={actors?.results}
            />
          </div>
          <div className='h-[150px]'> </div>
        </>
      }
    </>
  )
}

export default Home