
import React,{ useState } from 'react'
import MoreInfo from '../dialogs/moreInfo'
import VideoPlayer from '../dialogs/videoPlayer'
import Rating from '../Components/rating'
import InfoCta from '../Components/infoCta'
import RickRoll from '../assets/rickroll.jpg'
import { useNavigate, useParams } from 'react-router-dom'

const MovieCard = ({title,image,rating,movieId,media}) => {

const [displayInfo,setDisplayInfo]=useState(false)
const[trailer,setTrailer]=useState(false)
const navigate = useNavigate();

  return (
    <>
      {displayInfo && <MoreInfo movieId={movieId} media={media} onCancel={() => { setDisplayInfo(false) }} onTrailer={() => { setTrailer(true) }} />}
      {trailer && <VideoPlayer movieId={movieId} media={media} onCancel={() => { setTrailer(false) }} />}
      <div className='max-w-[200px] min-w-[150px] md:min-w-[180px] xl:min-w-[200px] w-full'>
        <button onClick={() => { navigate(`/movieinfo/?id=${movieId}&type=${media}`)}} className='group relative bottom-[-7px]'>
          <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
          <img className='rounded-t-lg min-h-[225px] xl:min-h-[300px]' src={image ? `https://image.tmdb.org/t/p/w500${image}` : RickRoll} alt="" />
        </button>

        <div className='flex flex-col flex-1 rounded-b-lg bg-[#1A1A1A] text-white text-[16px] font-roboto px-2 py-5 '>{/*bottom section*/}
          <div className='mb-[8px]'><Rating rating={rating} /></div>
          <div className='line-clamp-2 h-[48px] mb-[4px]'>{title}</div>

          <InfoCta
            infoMessage={'More Info'}
            infoDisplay={() => (setDisplayInfo(true))}
          />
        </div>
      </div>
    </>
  )
}

export default MovieCard