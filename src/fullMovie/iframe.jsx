import React from 'react'
import { useState,useEffect } from 'react'
import { useSearchParams, useNavigate, useParams,Link } from 'react-router-dom'
import { fetchSpecific } from '../Functions/fetching';
import ArrowBack from '../assets/arrowback2.png'
import BackButton from '../Components/backButton';


const Iframe = () => {
  const navigate = useNavigate();
  const [info, setInfo] = useState([]);
  const [searchParams] = useSearchParams();
  const movieId = searchParams.get('id');
  const type = searchParams.get('type');

  useEffect(() => {
    const loadInfo = async () => {
        const data = await fetchSpecific(type,movieId,'details','','');
        setInfo(data);
    };
    loadInfo();
  }, [movieId,type]);

  return (
    <>
    <div className='flex gap-4 items-center  mb-[24px]'>
    <BackButton/>
      <div className='font-roboto font-medium text-[48px] text-white'>{info?.title || info.name}</div>
    </div>
    <div className=' w-full aspect-[16/9]'>
        <iframe className='w-full h-full' src={`https://vidsrc.pm/embed/${type}/${movieId}`} referrerpolicy="origin" frameborder="0"
        allowFullScreen
        >
        </iframe>
    </div>
    </>
  )
}

export default Iframe