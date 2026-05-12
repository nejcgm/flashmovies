import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import ActorCard from "./ActorCard";
import ChevroneLeft from "../../components/ChevronLeft";
import ViewAllArrowIcon from "../../components/icons/ViewAllArrowIcon";
import ChevroneRight from "../../components/ChevronRight";
import { DataInfoProps } from "../../utils/Interfaces";

interface ActorCarouselProps {
  actors: DataInfoProps[];
  showTitle: string;
  cardCount: number;
  viewAllTo?: string;
}

const ActorCarousel: React.FC<ActorCarouselProps> = ({
  actors,
  showTitle,
  cardCount,
  viewAllTo,
}) => {
  const scrollContainer = useRef<HTMLDivElement>(null);
  const [showPrevButton, setShowPrevButton] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

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
  }, [actors]);

  return (
    <>
      <div className="max-w-[1250px] relative">
        <div className="mb-[16px] flex flex-wrap items-end justify-between gap-x-4 gap-y-2 pl-0 pr-0 sm:px-0">
          <div className="text-[#F5C518] font-roboto font-bold text-[24px] sm:text-[32px] first-letter:uppercase min-w-0 flex-1">
            {showTitle}
          </div>
          {viewAllTo ? (
            <Link
              to={viewAllTo}
              className="inline-flex items-center gap-1.5 shrink-0 text-sm sm:text-base lg:text-lg font-semibold text-[#f5c518] hover:text-white underline-offset-4 hover:underline"
            >
              View all
              <ViewAllArrowIcon className="h-4 w-4 shrink-0 lg:h-5 lg:w-5" />
            </Link>
          ) : null}
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

        <div className="-mx-4 sm:mx-0">
        <div
          className="carousel scrollbar-hide relative flex w-full gap-1 overflow-x-auto pl-4 pr-8 sm:gap-4 sm:pl-0 sm:pr-0"
          ref={scrollContainer}
        >
          {actors
            ?.slice(0, cardCount)
            .map((item: DataInfoProps, index: number) => (
              <ActorCard
                key={index}
                name={item.name}
                image={item.profile_path}
                popularity={item.popularity}
                job={item.known_for_department}
                actorId={item.id}
                media={"person"}
              />
            ))}
        </div>
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

export default ActorCarousel;
