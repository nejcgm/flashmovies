import React from "react";
import ChartIcon from "../../assets/chart.png";
import BackButton from "../../components/BackButton";
import Rating from "../../components/Rating";
import ShareButton from "../../components/ShareButton";
import { convertMinutesToHoursAndMinutes } from "../../utils/helpers.js";
import { mediaYearInParens } from "../../utils/mediaDisplayTitle";
interface TopSectionProps {
  title: string;
  release: string;
  runtime: number;
  language: string;
  rating: number;
  popularity: number;
  type: string | null;
}

const TopSection: React.FC<TopSectionProps> = ({
  title,
  release,
  runtime,
  language,
  rating,
  popularity,
  type,
}) => {
  const yearInHeading = mediaYearInParens(release);

  return (
    <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 sm:mb-2.5 sm:mr-8 sm:gap-3">
          <div className="hidden shrink-0 sm:flex">
            <BackButton />
          </div>
          <h1 className="min-w-0 flex-1 pr-1 text-xl font-semibold leading-snug text-white sm:pr-0 sm:text-2xl md:text-3xl lg:text-4xl">
            <span className="text-white">
              {title}
              {yearInHeading ? ` ${yearInHeading}` : ""}
            </span>
            <span className="ml-2 text-sm font-normal text-gray-400 sm:ml-2 sm:text-base md:text-[0.55em] md:text-gray-400">
              — Movie Info
            </span>
          </h1>
          <div className="hidden min-w-[50px] shrink-0 lg:flex">
            <ShareButton />
          </div>
        </div>
        <ul className="hidden list-inside list-disc gap-2 self-end text-[12px] text-[#BBBBBB] marker:text-[12px] sm:flex sm:gap-4 sm:text-[14px]">
          <li className="list-none">{release}</li>
          {type == "movie" && runtime > 0 && (
            <li className="">{convertMinutesToHoursAndMinutes(runtime)}</li>
          )}
          <li>{language}</li>
        </ul>
      </div>

      <div className="text-[#BBBBBB] flex shrink-0 gap-2 text-[12px] uppercase sm:mt-0 sm:gap-3 sm:text-[16px] md:tracking-[2px]">
        <div className="flex flex-col items-center">
          {type != "person" && (
            <>
              <div>imdb rating</div>
              <div className="flex text-white">
                <Rating rating={rating} />
                <span className="text-[#BBBBBB]">/10</span>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col items-center">
          <div>popularity</div>
          <div className="flex items-center text-white">
            <div>{popularity?.toFixed(0)}</div>
            <img className="h-[24px] sm:h-[32px]" src={ChartIcon} alt="flashmovies" />
          </div>
        </div>
      </div>
      <ul className="mt-0.5 flex list-inside list-disc flex-wrap gap-x-3 gap-y-0.5 self-start text-[12px] text-[#BBBBBB] marker:text-[12px] sm:hidden">
          <li className="list-none">{release}</li>
          {type == "movie" && runtime > 0 && (
            <li className="">{convertMinutesToHoursAndMinutes(runtime)}</li>
          )}
          <li>{language}</li>
        </ul>
    </div>
  );
};

export default TopSection;
