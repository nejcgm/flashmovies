import React, { useRef, useState, useEffect } from "react";
import HeroCard from "./HeroCard";
import ChevroneLeft from "../../components/ChevronLeft";
import ChevroneRight from "../../components/ChevronRight";
import UpNext from "./UpNext";
import { DataInfoProps } from "../../functions/Interfaces";
import {useSwipe} from "../../functions/Hooks";

interface HeroCarouselProps {
  moviesHero: [];
  cardCount: number;
  showTitle: string;
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({
  moviesHero,
  cardCount,
  showTitle,
}) => {
  const [count, setCount] = useState(0);
  const scrollContainer = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const countRef = useRef(count);
  const [timerActive, setTimerActive] = useState(true);

  useEffect(() => {
    countRef.current = count;
  }, [count]);

  const scrollToLeft = () => {
    const newCount = (count - 1 + cardCount) % cardCount;
    if (scrollContainer.current && scrollContainer.current.children[newCount]) {
      scrollContainer.current.children[newCount].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    }

    setTimeout(() => {
      setCount(newCount);
    }, 600);
  };

  const scrollToRight = () => {
    const newCount = (countRef.current + 1) % cardCount;

    if (scrollContainer.current && scrollContainer.current.children[newCount]) {
      scrollContainer.current.children[newCount]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    }
    setTimeout(() => {
      setCount(newCount);
    }, 600);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        setTimerActive(true);
      },
      { threshold: 0.8 }
    );

    const element = document.getElementById("carousel");
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  useEffect(() => {
    let timer: number | undefined;

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
  }, [isVisible, timerActive]);

const { handleTouchStart, handleTouchEnd } = useSwipe({
  onSwipeLeft: () => { scrollToRight(); setTimerActive(false); },
  onSwipeRight: () => { scrollToLeft(); setTimerActive(false); },
  minSwipeDistance:50,
});



  return (
    <>
      <div className="text-[#F5C518] font-popins font-bold text-[24px] sm:text-[32px] first-letter:uppercase mb-[16px]">
        {showTitle}
      </div>

      <div className="flex pr-[6px] sm:pr-[0px]">
        <div className=" xl:max-w-[850px] relative lg:max-w-[650px] w-full ">

          <div className=" hidden sm:flex">
          <ChevroneLeft
            scrollToLeft={() => {
              scrollToLeft();
            }}
            timerActive={() => {
              setTimerActive(false);
            }}
            isScrolling={false}
          />
          </div>

          <div
            className="flex relative overflow-hidden"
            ref={scrollContainer}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            id="carousel"
          >
            {moviesHero
              .slice(0, cardCount)
              .map((item: DataInfoProps, index: number) => (
                
                <HeroCard
                  key={index}
                  backdrop={item.backdrop_path}
                  poster={item.poster_path}
                  title={item.title}
                  overview={item.overview}
                  rating={item.vote_average}
                  movieId={item.id}
                  voteCount={item.vote_count}
                  type={item.media_type || "movie"}
                  timerActive={() => {
                    setTimerActive(false);
                  }}
                />
              ))}
          </div>
          
          <div className="hidden sm:flex">
          <ChevroneRight
            scrollToRight={() => {
              scrollToRight();
            }}
            timerActive={() => {
              setTimerActive(false);
            }}
            isScrolling={false}
          />
          </div>

        </div>
        <div className="hidden lg:flex flex-col w-full">
          <UpNext
            moviesHero={moviesHero}
            count={count}
            timerActive={() => {
              setTimerActive(false);
            }}
          />
        </div>
      </div>
    </>
  );
};

export default HeroCarousel;
