import React,{useState} from 'react'
import VideoPlayer from '../dialogs/videoPlayer'
import VoteCount from '../Components/voteCount'
import InfoCta from '../Components/infoCta'
import MoreInfo from '../dialogs/moreInfo'

const UpNextCard = ({poster,title,movieId,voteCount,timerActive,media}) => {
    const [displayInfo,setDisplayInfo]=useState(false)
    const[trailer,setTrailer]=useState(false)

  return (
      <>
          {displayInfo && <MoreInfo movieId={movieId} media={media} onCancel={() => { setDisplayInfo(false) }} onTrailer={() => { setTrailer(true) }} />}
          {trailer && <VideoPlayer movieId={movieId} media={media} onCancel={() => { setTrailer(false) }} />}
          <div className='flex gap-3 h-[140px]'>
              <img className='w-[90px] rounded-lg' src={`https://image.tmdb.org/t/p/w500${poster}`} alt="" />

              <button onClick={() => { setTrailer(true), timerActive() }} className='self-start w-full h-full'>
                  <div className='font-roboto text-left group flex flex-col h-full'>
                      <div className='h-[32px]'>
                          <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg" className="group-hover:text-[#f5c518] text-white" viewBox="0 0 24 24" fill="currentColor" role="presentation"><path d="M10.803 15.932l4.688-3.513a.498.498 0 0 0 0-.803l-4.688-3.514a.502.502 0 0 0-.803.402v7.026c0 .412.472.653.803.402z"></path><path d="M12 24C5.373 24 0 18.627 0 12S5.373 0 12 0s12 5.373 12 12-5.373 12-12 12zm0-1c6.075 0 11-4.925 11-11S18.075 1 12 1 1 5.925 1 12s4.925 11 11 11z"></path></svg>
                      </div>
                      <div className='text-white mt-[10px]'>{title}</div>
                      <div className='text-[#B7B7B7] text-[16px]'>Watch the trailer</div>

                      <div className='h-full flex'>
                          <div className='flex  w-[100px] justify-between self-end'>
                              <VoteCount
                                  voteCount={voteCount}
                              />
                              <div onClick={(e) => { e.stopPropagation() }} className='relative'>
                                  <InfoCta
                                      infoDisplay={(e) => { setDisplayInfo(true), timerActive() }}
                                      movieId={movieId}
                                  />
                              </div>
                          </div>
                      </div>
                  </div>
              </button>
          </div>
      </>
  )
}

export default UpNextCard