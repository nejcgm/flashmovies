import React,{useEffect,useState,useRef} from 'react'
import { fetchSpecific } from '../Functions/fetching';
import GenreButton from './genreButton';

const GenreListComponent = ({type,genreList}) => {
const [genre,setGenre] = useState([]);
  const firstRender = useRef(true);
const [idList, setIdList] = useState([]);

    useEffect(()=>{
        const loadGenre = async () => {
            const data = await fetchSpecific('genre', type, '/list', '');
            setGenre(data);
        };
        loadGenre();
    },[])

    const idAppend =(id)=>{
        setIdList(()=>[...idList, ...[id]]);
    }

    const removeItemId = (id) => {
        setIdList(idList.filter(item => item !== id));
      };

    useEffect(()=>{
        if (firstRender.current) {
            firstRender.current = false;
            return; 
          }
        genreList(idList)
    },[idList])
  return (
    <>
    <div className='w-[70%] flex flex-wrap gap-2'>
        {genre?.genres?.map((item,index)=>(
            <GenreButton
            id={item.id}
            name={item.name}
            key={index}
            callBack={(id) => { idAppend(id)}}
            remove ={(id) => {removeItemId(id)}}
            />
        ))}
    </div>
    </>
  )
}

export default GenreListComponent