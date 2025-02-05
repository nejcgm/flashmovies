import React,{useEffect,useState} from 'react'
import RickRoll from '../assets/rickroll.jpg'
import Rating from '../Components/rating'

const ReviewCard = ({avatar, username, userRating, timestamp, content}) => {
    const ContentLength = content.length;
    const [expand,setExpand] = useState(250);

  return (
    <>
    <div className='flex px-6 py-4 pr-[32px] rounded-lg gap-3  bg-[#101010]'>
        <div>
            <img className='rounded-full h-[48px] w-[48px] lg:h-[70px] lg:w-[70px] ' src={avatar ? `https://image.tmdb.org/t/p/w200/${avatar}` : RickRoll} alt="" />
        </div>
        <div className='flex flex-1 flex-col font-roboto text-white'>
        <div className='flex gap-4 items-center'>
        <div >{(timestamp).split('T' ,1)}
        </div>
        <Rating rating={userRating}/>
        </div>
        <div className='text-[28px] text-[#F5C518]'>{username}</div>
        <div className=''>{(content).slice(0,expand)}
            <button onClick={()=>{setExpand((prevValue) => (prevValue === 250 ? ContentLength : 250))}} 
            className='text-[#BBBBBB] text-[14px]'
            >
            {ContentLength < 250 ? (' ') :  expand == 250 ? (' ...Read More') : (' ...View Less')}
            </button></div>
        </div>
    </div>
    </>
  )
}

export default ReviewCard