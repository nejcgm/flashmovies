import React,{useState,useEffect} from 'react'
import Rating from '../Components/rating'
import VideoPlayer from '../dialogs/videoPlayer'
import VoteCount from '../Components/voteCount'
import ShareIcon from '../assets/shareIcon.png'
import { useSearchParams, useNavigate, useParams } from 'react-router-dom'
import ChartIcon from '../assets/chart.png'

const HeaderInfo = ({description,release,title,poster,rating,runtime,language,vote,movieId,genres,backdrop,popularity,type}) => {
  const[trailer,setTrailer]=useState(false)
  const urlToCopy = window.location.href;
  const navigate = useNavigate();


  const convertMinutesToHoursAndMinutes=(minutes)=> {
    const hours = (minutes / 60) | 0; 
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
  
  return (
    <>
      {trailer && <VideoPlayer movieId={movieId} media={type} onCancel={() => { setTrailer(false) }} />}

      <div className='font-roboto text-white'>
        <div className='flex w-full justify-between items-center'>
          <div>
          <div className='capitalise text-[32px] xl:text-[48px] flex items-center gap-4'>
            <div>{title}</div> <button onClick={()=>{navigator.clipboard.writeText(urlToCopy)}}>
              <img src={ShareIcon} alt="" />
              </button>
              </div>
          <ul className='list-disc list-inside flex text-[14px] text-[#BBBBBB] gap-4 marker:text-[12px] self-end'>
            <li className='list-none'>{release}</li>
            <li className=''>{convertMinutesToHoursAndMinutes(runtime)}</li>
            <li>{language}</li>
          </ul>
          </div>

          <div className='text-[#BBBBBB] uppercase flex gap-3'>
            <div className='flex flex-col items-center '>
            <div className='tracking-[2px]'>imdb rating</div>
            <div className='flex text-white'><Rating rating={rating} /><span className='text-[#BBBBBB]'>/10</span></div>
            </div>

            <div className='flex flex-col items-center '>
              <div>popularity</div>
              <div className='text-white flex items-center'>
                <div>{(popularity)?.toFixed(0)}</div>
                <img src={ChartIcon} alt="" />
                </div>
            </div>
          </div>
        </div>


        <div className='flex w-full mt-[24px] gap-2'>
          <div onClick={()=>{navigate(`/fullmovie/?id=${movieId}&type=${type}`)}}>
            <img className='hidden lg:flex w-full flex-1  rounded-lg w-[72px]' src={`https://image.tmdb.org/t/p/w500${poster}`} alt="poster" />
          </div>


          <button
            onClick={() => {
              setTrailer(true)
            }}
            className='flex-2 flex w-full group h-full'>
            <div className='w-full h-full min-w-[100%] max-h-[530px] rounded-lg bg-cover bg-center bg-no-repeat aspect-[16/10] content-end p-4'
              style={{
                backgroundImage: `url(https://image.tmdb.org/t/p/w1280${backdrop})`,
              }}>
              <div className='flex items-center gap-4 ml-[12px]'>
                <div>
                  <svg width="72" height="72" xmlns="http://www.w3.org/2000/svg" className="group-hover:text-[#f5c518] text-white" viewBox="0 0 24 24" fill="currentColor" role="presentation"><path d="M10.803 15.932l4.688-3.513a.498.498 0 0 0 0-.803l-4.688-3.514a.502.502 0 0 0-.803.402v7.026c0 .412.472.653.803.402z"></path><path d="M12 24C5.373 24 0 18.627 0 12S5.373 0 12 0s12 5.373 12 12-5.373 12-12 12zm0-1c6.075 0 11-4.925 11-11S18.075 1 12 1 1 5.925 1 12s4.925 11 11 11z"></path></svg>
                </div>
                <div className='max-w-[70%] text-left'>
                  <div className='text-[24px] font-roboto text-white capitalize'>
                    play trailer
                  </div>
                  <div className='flex items-center text-[#BBBBBB] gap-3'>
                    <VoteCount voteCount={vote} />
                  </div>
                </div>
              </div>
            </div>
          </button>
        </div>
      
      <div className='w-full flex gap-4 md:w-[70%] mt-[24px]'>

      <div className='flex lg:hidden'>
          <img onClick={()=>{navigate(`/fullmovie/?id=${movieId}&type=${type}`)}} className=' w-full flex-1  rounded-lg min-w-[120px] w-[150px]' src={`https://image.tmdb.org/t/p/w500${poster}`} alt="poster" />
        </div>
              <div className='flex-col'>
        <div className='flex overflow-scroll gap-4 text-[14px]'>
          {genres?.map((item) => (
            <div key={item.id}
              className='px-3 py-1 border-white border-[1px] rounded-full'
            >
              {item.name}
            </div>
          ))}
          
        </div>        
        <div className='mt-[8px] lg:mt-[16px]'>{description}</div>
        </div>
        </div>
      </div>
    </>
  )
}

export default HeaderInfo