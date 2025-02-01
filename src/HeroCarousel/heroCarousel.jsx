import React ,{useRef,useState,useEffect} from 'react'
import HeroCard from './heroCard'
import ChevroneLeft from '../Components/chevroneLeft';
import ChevroneRight from '../Components/chevroneRight';
import UpNext from './upNext';



const HeroCarousel = ({moviesHero,cardCount,showTitle}) => {
const [count, setCount] = useState(0);
const scrollContainer = useRef(null)
const [isVisible, setIsVisible] = useState(false);
const countRef = useRef(count);
const [timerActive,setTimerActive]= useState(true)

const page = 2;




/*const getMovies = () => {
  const movies = moviesHero?.results || [];
    return [-1, 0, 1].map((offset) => {
      const index = (count + offset + cardCount) % cardCount; // Handles wrapping around
      return movies[index] || '';
    });
  };

  const movieData = getMovies();

  const scrollToItem = (index) => {
    const container = scrollContainer.current;

    if (container) {
      const cardWidth = container.clientWidth; // Each card is full width
      const scrollPosition = index * cardWidth;

      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      });
    }
  };

  const scrollToLeft = () => {
    const newCount = (count - 1 + cardCount) % cardCount;
    setCount(newCount);
  };

  const scrollToRight = () => {
    const newCount = (count + 1) % cardCount;
    setCount(newCount);
  };

  useEffect(() => {
    scrollToItem(1); // Center on the second item
  }, [count]);

*/

const scrollToLeft = () => {

  //const newCount = Math.max(count - 1, 0);
  const newCount =(count - 1 + cardCount) % cardCount
  if (scrollContainer.current && scrollContainer.current.children[newCount]) {
    scrollContainer.current.children[newCount].scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    });
  }

  setTimeout(() => {
    setCount(newCount);
  }, 600)
  clearTimeout();
};

useEffect(() => {
  countRef.current = count;
}, [count]);


const scrollToRight = () => {
  //const newCount = countRef.current + 1
  
  const newCount = (countRef.current + 1)  % cardCount;

  if (scrollContainer.current && scrollContainer.current.children[newCount]) {
    scrollContainer.current.children[newCount]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    });
  }
    setTimeout(() => {
      setCount(newCount);
    }, 600)
    clearTimeout();
  };  

  /*
  const scrollToRight = () => {
  const container = scrollContainer.current;

  if (container) {
    // Calculate the new index for the next card
    const newCount = (count + 1) % movies.length;

    // Calculate the new scroll position
    const newScrollPosition = newCount * container.clientWidth;

    // Scroll to the new position
    container.scrollTo({
      left: newScrollPosition,
      behavior: 'smooth',
    });

    // Update the count after scrolling
    setTimeout(() => {
      setCount(newCount);
    }, 600); // Duration matches scroll animation
  }
};

  */

useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      setIsVisible(entry.isIntersecting); 
      setTimerActive(true);
    },
    { threshold: 0.8 }
  );

  const element = document.getElementById('carousel');
  if (element) {
    observer.observe(element);
  }

  return () => {
    if (element) {
      observer.unobserve(element);
    }
  };
}, []);

useEffect(()=>{
  let timer;

  if (isVisible && timerActive) {
    timer = setInterval(() => {
    scrollToRight();
    }, 5000); 
  } else {
   
    clearInterval(timer);
  }
  return () => {
    if (timer) {
      clearInterval(timer);
    }
  };
  
},[isVisible, timerActive])

//const poster = "/d8Ryb8AunYAuycVKDp5HpdWPKgC.jpg";



//console.log(scrollContainer);
/*useEffect(()=>{},[])
const getMovies = () => {
  return [-1, 0, 1].map((offset) => {
    const index = (count + offset + movies.length) % movies.length;
    return movies[index] || '';
  });
};
*/

  return (
    <>
      <div className='text-[#F5C518] font-popins font-bold text-[32px] first-letter:uppercase mb-[16px]'>{showTitle}</div>

      <div className='flex'>
        <div className=' xl:max-w-[850px] relative lg:max-w-[650px] w-full '>

          <ChevroneLeft
            scrollToLeft={() => { scrollToLeft() }}
            timerActive={() => { setTimerActive(false) }}
            top={35}
          />

          <div className='flex relative overflow-hidden'
            ref={scrollContainer}
            id='carousel'>
           {moviesHero.results?.slice(0, cardCount).map((item, index) => ( 
           

              <HeroCard
                key={index}
                backdrop={item.backdrop_path}
                poster={item.poster_path}
                title={item.title}
                overview={item.overview}
                rating={item.vote_average}
                movieId={item.id}
                voteCount={item.vote_count}
                media={item.media_type || 'movie'}
                timerActive={() => { setTimerActive(false) }}
              />
            ))}
          </div>

          <ChevroneRight
            scrollToRight={() => { scrollToRight() }}
            timerActive={() => { setTimerActive(false) }}
            top={35}
          />

        </div>
        <div className='hidden lg:flex flex-col w-full'>
          <UpNext
            moviesHero={moviesHero}
            count={count}
            timerActive={() => { setTimerActive(false) }}
          />
        </div>
      </div>
    </>
  )
}

export default HeroCarousel