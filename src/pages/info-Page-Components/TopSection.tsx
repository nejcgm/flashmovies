import React from "react";
import ChartIcon from "../../assets/chart.png";
import BackButton from "../../components/BackButton";
import Rating from "../../components/Rating";
import ShareButton from "../../components/ShareButton";
import { convertMinutesToHoursAndMinutes } from "../../functions/Functions.js";
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
    <div className="flex w-full justify-between items-center pr-[6px] sm:pr-[0px]">
      <div>
        <div className="capitalise text-[18px] sm:text-[24px] md:text-[32px] xl:text-[48px] flex items-center gap-2">
          <div className="hidden sm:flex"><BackButton /></div>
          <div>{title}</div>
          <div className="hidden sm:flex"><ShareButton /></div>
        </div>
        <ul className="list-disc list-inside flex text-[12px] sm:text-[14px] text-[#BBBBBB] gap-2 sm:gap-4 marker:text-[12px] self-end">
          <li className="list-none">{release}</li>
          {type == "movie" && runtime > 0 && (
            <li className="">{convertMinutesToHoursAndMinutes(runtime)}</li>
          )}
          <li>{language}</li>
        </ul>
      </div>

      <div className="text-[#BBBBBB] uppercase flex gap-1 sm:gap-3 text-[12px] sm:text-[16px] md:tracking-[2px]">
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
            <img className="h-[24px] sm:h-[32px]" src={ChartIcon} alt="" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopSection;
