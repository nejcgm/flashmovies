import React, { useEffect, useRef, useState } from 'react';
import { fetchSpecific } from '../Functions/fetching';
import { useSearchParams } from 'react-router-dom';
import ListItem from './listItem';
import Spiner from '../Components/spiner';
import GenreListComponent from '../genreList/genreListComponent';
import { Profiler } from 'react';

const List = ({showTitle}) => {
  const [listItems, setListItems] = useState([]); 
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search');
  const type = searchParams.get('type');

  const [counter, setCounter] = useState(1);
  const [loading,setLoading] = useState(false)
  const lastItemRef = useRef();
  const firstRender = useRef(true);
  const [genreList,setGenreList] =useState([])
  const [endOfList,setEndOfList] = useState(false)

  useEffect(()=>{
    if (firstRender.current) {
      firstRender.current = false;
      return; 
    }
    setCounter(1)
    setListItems([]);
  },[genreList])

  useEffect(() => {
    const loadList = async () => {
      if (search != 'discover') {
        setLoading(true)
        const data = await fetchSpecific(type, '', search, '', counter);
        setListItems((prevItems) => [...prevItems, ...data.results]);
        setLoading(false)

      } else {
        setLoading(true)
        setEndOfList(false)
        const data = await fetchSpecific(search, type, '', genreList, counter);
        if (data.results.length !== 0) {
          setListItems((prevItems) => [...prevItems, ...data.results]);
          setLoading(false)
        }
        else {
          setEndOfList(true)
          return;
        }
      }
    };
    loadList();
  }, [type, search, counter, genreList]);
  
  
  //obserever for lazy load
  useEffect(() => {
    if(endOfList){
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCounter((prev) => prev + 1); 
            observer.unobserve(entry.target); 
          }
        });
      },
      { root: null, threshold: 1.0 } 
    );

    if (lastItemRef.current) {
      observer.observe(lastItemRef.current);
    }

    return () => {
      observer.disconnect(); 
    };
  }, [listItems,endOfList]); 
  console.log(listItems)

  return (
    <>
    <div className='w-full flex flex-col'>
    <div className="flex flex-col w-[70%] self-center gap-4 p-4 bg-[#101010] rounded-lg">
        <div className='font-roboto text-[#f5c518] text-[32px] mb-[16px] font-semibold'>{showTitle}</div>

        {search =='discover' && <GenreListComponent 
        type={type} 
        genreList={(idList)=>{setGenreList(idList)}}
        />}

      {listItems.map((item, index) => {
        const isLastItem = index === listItems.length - 1;

        return (
          <div
            key={index}
            ref={isLastItem ? lastItemRef : null} 
            className="item"
          >
            <ListItem
              index={index}
              poster={item.poster_path || item.profile_path}
              title={item.title || item.name}
              movieId={item.id}
              voteCount={item.vote_count}
              year={item.release_date || item.first_air_date}
              media={type}
              rating={item.vote_average}
              largeScreen={true}
              type={type}
            />
          </div>
        );
      })}

    {loading && !endOfList &&
      <div className='flex w-full justify-center'>
      <Spiner/>
      </div>
      }
      {endOfList && 
      <div className='font-roboto text-[24px] text-[#F5C518] font-semibold'>No More Results Avaliable</div>}
    </div>
    </div>
    </>
  );
};

export default List;

