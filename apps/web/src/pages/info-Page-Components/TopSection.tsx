import React from "react";
import ChartIcon from "../../assets/chart.png";
import BackButton from "../../components/BackButton";
import Rating from "../../components/Rating";
import ShareButton from "../../components/ShareButton";
import { convertMinutesToHoursAndMinutes } from "../../utils/helpers.js";
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
  return (
    <div className="sm:flex w-full justify-between items-center pr-[6px] sm:pr-[0px]">
      <div>
        <div className="capitalise text-[18px] sm:mr-[32px] sm:text-[24px] md:text-[32px] xl:text-[48px] flex items-center gap-2 sm:mb-[10px]">
          <div className="hidden sm:flex"><BackButton /></div>
          <h1 className="mr-[18px] lg:mr-0 leading-[1.2]">{title} {release ? `(${new Date(release).getFullYear()})` : ''} - Movie Info</h1>
          <div className="hidden lg:flex min-w-[50px]"><ShareButton /></div>
        </div>
        <ul className="hidden sm:flex list-disc list-inside text-[12px] sm:text-[14px] text-[#BBBBBB] gap-2 sm:gap-4 marker:text-[12px] self-end">
          <li className="list-none">{release}</li>
          {type == "movie" && runtime > 0 && (
            <li className="">{convertMinutesToHoursAndMinutes(runtime)}</li>
          )}
          <li>{language}</li>
        </ul>
      </div>

      <div className="text-[#BBBBBB] mt-[8px] sm:mt-0 uppercase flex gap-1 sm:gap-3 text-[12px] sm:text-[16px] md:tracking-[2px]">
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

        <div className="flex flex-col items-center ">
          <div>popularity</div>
          <div className="text-white flex items-center">
            <div>{popularity?.toFixed(0)}</div>
            <img className="h-[24px] sm:h-[32px]" src={ChartIcon} alt="flashmovies" />
          </div>
        </div>
      </div>
      <ul className="sm:hidden mt-[8px] list-disc list-inside flex text-[12px] sm:text-[14px] text-[#BBBBBB] gap-2 sm:gap-4 marker:text-[12px] self-end">
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
