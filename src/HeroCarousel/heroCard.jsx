import React,{useState} from 'react'
import MoreInfo from '../dialogs/moreInfo'
import VideoPlayer from '../dialogs/videoPlayer'
import Rating from '../Components/rating'
import VoteCount from '../Components/voteCount'



const HeroCard = ({backdrop,poster, title,rating,movieId,container,overview,voteCount,timerActive,media }) => {
    const [displayInfo,setDisplayInfo]=useState(false)
    const[trailer,setTrailer]=useState(false)

    
 
  return (
      <>
          {displayInfo && <MoreInfo movieId={movieId} media={media} onCancel={() => { setDisplayInfo(false) }} onTrailer={() => { setTrailer(true) }} />}
          {trailer && <VideoPlayer movieId={movieId} media={media} onCancel={() => { setTrailer(false) }} />}

          <button onClick={() => { 
            setTrailer(true),
            timerActive()}} 
          className='group min-w-[100%]'
          >

              <div className={`min-w-[100%] xl:min-w-[850px] lg:min-w-[650px] `}>

                  <div className='w-full min-w-[100%] bg-cover bg-center bg-no-repeat aspect-[16/10]'
                      style={{
                          backgroundImage: `url(https://image.tmdb.org/t/p/w1280${backdrop})`,
                      }}>
                      <div className='w-full h-full flex place-items-end group-hover:bg-black/10'>

                          <div className='w-full bg-gradient-to-t from-black to-transparent flex'>
                              <div className=' w-[90px] sm:w-[120px] md:w-[160px] lg:w-[130px] xl:w-[160px]'>
                                  <div onClick={(e) => {
                                      e.stopPropagation();
                                      setDisplayInfo(true);
                                      timerActive();
                                     }}
                                      className='relative'>
                                      <img className='rounded-lg shadow-xl w-full' src={`https://image.tmdb.org/t/p/w500${poster}`} alt="" />
                                  </div>
                              </div>

                              <div className='flex self-end gap-4 ml-[12px]'>
                                  <div>
                                      <svg width="72" height="72" xmlns="http://www.w3.org/2000/svg" className="group-hover:text-[#f5c518] text-white" viewBox="0 0 24 24" fill="currentColor" role="presentation"><path d="M10.803 15.932l4.688-3.513a.498.498 0 0 0 0-.803l-4.688-3.514a.502.502 0 0 0-.803.402v7.026c0 .412.472.653.803.402z"></path><path d="M12 24C5.373 24 0 18.627 0 12S5.373 0 12 0s12 5.373 12 12-5.373 12-12 12zm0-1c6.075 0 11-4.925 11-11S18.075 1 12 1 1 5.925 1 12s4.925 11 11 11z"></path></svg>
                                  </div>
                                  <div className='max-w-[70%] text-left'>
                                      <div className='text-[24px] font-roboto text-white'>
                                          {title}
                                      </div>
                                      <div className='text-[#b3b3b3] text-[12px] md:text-[16px]'>
                                          {`${overview?.slice(0, 100)}...`}</div>
                                      <div className='flex items-center text-[#BBBBBB] gap-3'>
                                          <Rating rating={rating} />
                                          <VoteCount voteCount={voteCount} />
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </button>

      </>
  )
}

export default HeroCard