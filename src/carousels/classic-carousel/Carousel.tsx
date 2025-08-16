import React, { useState, useRef, useEffect } from "react";
import MovieCard from "./MovieCard";
import ChevroneLeft from "../../components/ChevronLeft";
import ChevroneRight from "../../components/ChevronRight";
import { DataInfoProps } from "../../functions/Interfaces";

interface CarouserProps {
  movies: [];
  showTitle: string;
  cardCount: number;
  type: string | null;
}

const Carousel: React.FC<CarouserProps> = ({
  movies,
  showTitle,
  cardCount,
  type,
}) => {
  const scrollContainer = useRef<HTMLDivElement>(null);
  const [showPrevButton, setShowPrevButton] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const [isScrolling, setIsScrolling] = useState<boolean>(false);

  const scrollToLeft = () => {
    if (scrollContainer.current) {
      setIsScrolling(true);
      scrollContainer.current.scrollBy({
        left: -(scrollContainer.current.clientWidth - 100),
        behavior: "smooth",
      });
      setTimeout(() => {
        setIsScrolling(false);
      }, 500);
    }
  };

  const scrollToRight = () => {
    if (scrollContainer.current) {
      setIsScrolling(true);
      scrollContainer.current.scrollBy({
        left: scrollContainer.current.clientWidth - 100,
        behavior: "smooth",
      });
      setTimeout(() => {
        setIsScrolling(false);
      }, 500);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const container = scrollContainer.current;
      if (container) {
        setShowPrevButton(container.scrollLeft > 0);
        setShowNextButton(
          container.scrollLeft + container.offsetWidth < container.scrollWidth
        );
      }
    };

    const container = scrollContainer.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);

      handleScroll();
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [movies]);

  return (
    <>
      <div className="max-w-[1250px] relative">
        <div className="text-[#F5C518] font-roboto font-bold text-[24px] sm:text-[32px] first-letter:uppercase mb-[16px] ml-2 sm:ml-0">
          {showTitle}
        </div>

      <div className="hidden sm:flex">
        {showPrevButton && (
          <ChevroneLeft
            scrollToLeft={() => {
              scrollToLeft();
            }}
            timerActive={() => {}}
            isScrolling={isScrolling}
          />
        )}
        </div>

        <div
          className="flex gap-4 relative w-full overflow-x-auto scrollbar-hide"
          ref={scrollContainer}
        >
          {movies
            ?.slice(0, cardCount)
            .map((item: DataInfoProps, index: number) => (
              <MovieCard
                key={index}
                title={item.original_title || item.name}
                image={item.poster_path}
                rating={item.vote_average}
                movieId={item.id}
                type={type}
              />
            ))}
          ;
        </div>

        <div className="hidden sm:flex">
        {showNextButton && (
          <ChevroneRight
            scrollToRight={() => {
              scrollToRight();
            }}
            timerActive={() => {}}
            isScrolling={isScrolling}
          />
        )}
        </div>
        
      </div>
    </>
  );
};

export default Carousel;
