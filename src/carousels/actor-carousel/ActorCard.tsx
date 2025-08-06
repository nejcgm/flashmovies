import React from "react";
import LazyImage from "../../components/LazyImage";
import ChartIcon from "../../assets/chart.png";
import { useNavigate } from "react-router-dom";
import { triggerAdRedirect } from '../../utils/adRedirect';

const PersonPlaceholder = "/dark-mode-avatar-placeholder.png";

interface ActorCardProps {
  popularity: number | null;
  image: string;
  name: string;
  job: string;
  actorId: string;
  media: string;
}

const ActorCard: React.FC<ActorCardProps> = ({
  popularity,
  image,
  name,
  job,
  actorId,
  media,
}) => {
  const navigate = useNavigate();
  
  const handleActorClick = () => {
    // Add redirect for actor card click
    triggerAdRedirect({
      eventLabel: 'actor_card_click',
      movieTitle: name,
      movieId: actorId,
      clickType: 'movie_card'
    });
    navigate(`/movie-info/?id=${actorId}&type=${media}`);
  };

  return (
    <>
      <button 
        className="max-w-[200px] min-w-[150px] md:min-w-[180px] xl:min-w-[200px] w-full text-white font-roboto flex flex-col items-center group transition-colors duration-300"
        onClick={handleActorClick}
      >
        <div className="relative">
          <div className="aspect-square overflow-hidden rounded-full">
            <LazyImage
              className="object-cover w-[120px] sm:w-full sm:h-full"
              src={image ? `https://image.tmdb.org/t/p/w500/${image}` : PersonPlaceholder}
              alt={`${name || 'Actor'} photo`}
              placeholder={PersonPlaceholder}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-full"></div>
          </div>
        </div>
        <div className="mt-[8px] flex w-full items-center">
          <div className="justify-end flex w-[54%] text-[12px] sm:text-[16px]">
            {popularity && popularity.toFixed(0)}
          </div>
          <img className="w-[24px] sm:w-[32px]" src={ChartIcon} alt="" />
        </div>
        <div className="text-[14px] sm:text-[16px] group-hover:text-[#f5c518] transition-colors duration-300 font-medium">{name}</div>
        <div className="text-[#BBBBBB] text-[12px] sm:text-[16px] group-hover:text-white transition-colors duration-300">{job}</div>
      </button>
    </>
  );
};

export default ActorCard;
