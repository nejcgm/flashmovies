import React, { useRef, useState, useEffect } from "react";
import HeroCard from "./HeroCard";
import ChevroneLeft from "../components/ChevronLeft";
import ChevroneRight from "../components/ChevronRight";
import UpNext from "./UpNext";

const HeroCarousel = ({ moviesHero, cardCount, showTitle }) => {
  const [count, setCount] = useState(0);
  const scrollContainer = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const countRef = useRef(count);
  const [timerActive, setTimerActive] = useState(true);

  const page = 2;

  useEffect(() => {
    countRef.current = count;
  }, [count]);

  const scrollToLeft = () => {
    const newCount = (count - 1 + cardCount) % cardCount;
    if (scrollContainer.current && scrollContainer.current.children[newCount]) {
      scrollContainer.current.children[newCount].scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }

    setTimeout(() => {
      setCount(newCount);
    }, 600);
    clearTimeout();
  };

  const scrollToRight = () => {
    const newCount = (countRef.current + 1) % cardCount;

    if (scrollContainer.current && scrollContainer.current.children[newCount]) {
      scrollContainer.current.children[newCount]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
    setTimeout(() => {
      setCount(newCount);
    }, 600);
    clearTimeout();
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
  }, [isVisible, timerActive]);

  return (
    <>
      <div className="text-[#F5C518] font-popins font-bold text-[32px] first-letter:uppercase mb-[16px]">
        {showTitle}
      </div>

      <div className="flex">
        <div className=" xl:max-w-[850px] relative lg:max-w-[650px] w-full ">
          <ChevroneLeft
            scrollToLeft={() => {
              scrollToLeft();
            }}
            timerActive={() => {
              setTimerActive(false);
            }}
            top={35}
          />

          <div
            className="flex relative overflow-hidden"
            ref={scrollContainer}
            id="carousel"
          >
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
                media={item.media_type || "movie"}
                timerActive={() => {
                  setTimerActive(false);
                }}
              />
            ))}
          </div>

          <ChevroneRight
            scrollToRight={() => {
              scrollToRight();
            }}
            timerActive={() => {
              setTimerActive(false);
            }}
            top={35}
          />
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
