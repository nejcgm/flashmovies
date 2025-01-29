import React,{useState,useRef, useEffect} from 'react'
import MovieCard from './movieCard'
import ChevroneLeft from '../Components/chevroneLeft';
import ChevroneRight from '../Components/chevroneRight';


const Carousel = ({movies,showTitle,cardCount,scrollDistance,media}) => {
    
    const scrollContainer = useRef(null);
    const [showPrevButton, setShowPrevButton] = useState(false);
    const [showNextButton, setShowNextButton] = useState(false);
    const [isScrolling,setIsScrolling]=useState(false);

   const scrollToLeft = () => {
    setIsScrolling(true)
    scrollContainer.current.scrollBy({
      left: -(scrollContainer.current.clientWidth -100),
      behavior: 'smooth',
    });
    setTimeout(()=>{
      setIsScrolling(false)
    },500)
    clearTimeout();
  };

  const scrollToRight = () => {
    setIsScrolling(true)
    scrollContainer.current.scrollBy({
      left: (scrollContainer.current.clientWidth -100),
      behavior: 'smooth',
    });
    setTimeout(()=>{
      setIsScrolling(false)
    },500)
    clearTimeout()
  };

  useEffect(() => {
    const handleScroll = () => {
      const container = scrollContainer.current;
      if(container){

      setShowPrevButton(container.scrollLeft > 0);
      setShowNextButton(container.scrollLeft  + container.offsetWidth < container.scrollWidth )  
    }
    };
 
    const container = scrollContainer.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);

        handleScroll();
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [movies]);

  return (
    <>
      <div className='max-w-[1250px] relative'>
        <div className='text-[#F5C518] font-roboto font-bold text-[32px] first-letter:uppercase mb-[16px]'>{showTitle}</div>

        {showPrevButton &&
          <ChevroneLeft
            scrollToLeft={() => { scrollToLeft() }}
            top={35}
            isScrolling={isScrolling}
          />
        }

        <div
          className='flex gap-4 relative w-full overflow-scroll'
          ref={scrollContainer}
        >

          {movies.results?.slice(0, cardCount).map((item, index) => (

            <MovieCard
              key={index}

              title={item.original_title || item.name}
              image={item.poster_path}
              rating={item.vote_average}
              description={item.overview}
              movies={movies}
              movieId={item.id}
              media={media}

            />

          ))};
        </div>
        {showNextButton &&
          <ChevroneRight
            scrollToRight={() => { scrollToRight() }}
            top={35}
            isScrolling={isScrolling}
          />
        }

      </div>
      </>
  )
}

export default Carousel