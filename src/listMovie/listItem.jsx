import React,{useState} from 'react'
import VideoPlayer from '../dialogs/videoPlayer'
import VoteCount from '../Components/voteCount'
import InfoCta from '../Components/infoCta'
import MoreInfo from '../dialogs/moreInfo'
import RickRoll from '../assets/rickroll.jpg'
import Rating from '../Components/rating'
import { useSearchParams, useNavigate } from 'react-router-dom'

const ListItem = ({poster,title,movieId,voteCount,year,media, rating,largeScreen,index,onCancel}) => {
    const [displayInfo,setDisplayInfo]=useState(false)
    const[trailer,setTrailer]=useState(false)
    const navigate = useNavigate();
    


  return (
    <>
    {displayInfo && <MoreInfo movieId={movieId} media={media} onCancel={() => { setDisplayInfo(false) }} onTrailer={() => { setTrailer(true) }} />}
    {trailer && <VideoPlayer movieId={movieId} media={media} onCancel={() => { setTrailer(false) }} />}
    <div className='flex gap-3'>

        <button onClick={()=>{setTrailer(true)}}>
            <img className={`${largeScreen ? ('lg:w-[100px] lg:h-[130px] w-[70px] h-[90px]') : (`w-[70px] h-[90px]`)} rounded-lg`} src={poster ? `https://image.tmdb.org/t/p/w500${poster}` : RickRoll}  alt="" />
        </button>

        <button onClick={() => { navigate(`/movieinfo/?id=${movieId}&type=${media}`),onCancel()}} className='self-start w-full h-full'>
            <div className='font-roboto text-left group flex flex-col h-full'>
                <div className='h-[32px] flex gap-2'>
                    <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" className="group-hover:text-[#f5c518] text-white" viewBox="0 0 24 24" fill="currentColor" role="presentation"><path d="M10.803 15.932l4.688-3.513a.498.498 0 0 0 0-.803l-4.688-3.514a.502.502 0 0 0-.803.402v7.026c0 .412.472.653.803.402z"></path><path d="M12 24C5.373 24 0 18.627 0 12S5.373 0 12 0s12 5.373 12 12-5.373 12-12 12zm0-1c6.075 0 11-4.925 11-11S18.075 1 12 1 1 5.925 1 12s4.925 11 11 11z"></path></svg>
                    <div className={`text-white text-[14px] ${largeScreen && 'lg:text-[16px]'} flex gap-1`}>
                        {index !== undefined && <div>{index+1}.</div>}
                        <div>{title}</div>
                        </div>
                </div>
                <div className='text-[#C0C0C0] text-[14px] flex gap-2'>
                    <div>{year?.substring(0,4)}</div>
                <div className='text-white'>
                        {rating && <Rating rating={rating}/>}
                        </div>
                </div>

                <div className='h-full flex'>
                    <div className='flex w-[100px] justify-between self-end'>
                        {voteCount &&
                        <VoteCount
                            voteCount={voteCount || 0}
                        />}

                        {media !='person' &&
                        <div onClick={(e) => { e.stopPropagation() }} className=''>
                            <InfoCta
                                infoDisplay={(e) => { setDisplayInfo(true) }}
                                movieId={movieId}
                            />
                        </div>}
                    </div>
                </div>
            </div>
        </button>
    </div>
</>
  )
}

export default ListItem