import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, useParams } from 'react-router-dom'
import { fetchSpecific } from '../Functions/fetching';
import HeaderInfo from '../infoPageComponents/headerInfo';
import Carousel from '../ClassicCarousel/carousel';
import Reviews from '../infoPageComponents/reviews';
import ActorCarousel from '../actorCarousel/actorCarousel';
import Spiner from '../Components/spiner';

const MovieInfoPage = () => {
const navigate = useNavigate();
const [info, setInfo] = useState([]);
const [video, setVideo] = useState([]);
const [trailer, setTrailer] = useState([])
const [relatedMovies, setRelatedMovies] = useState([]);
const [credits, setCredits] = useState([]);
const [loading, setLoading] = useState(false);

const [searchParams] = useSearchParams();
const movieId = searchParams.get('id');
const type = searchParams.get('type');


useEffect(() => {
    const loadInfoData = async () => {
        setLoading(true)
        const dataInfo = await fetchSpecific(type, movieId, '','', '');
        setInfo(dataInfo);
    
        const dataRelated = await fetchSpecific(type, movieId, '/similar','', 1);
        setRelatedMovies(dataRelated);

        const dataCredits = await fetchSpecific(type, movieId, '/credits','', 1);
        setCredits(dataCredits);
        setLoading(false)
    };

    loadInfoData();
}, [movieId, type]);

return (
    <>
        {loading && <div className='flex w-full justify-center'>
            <Spiner />
        </div>
        }

        {!loading &&
            <>
                <HeaderInfo
                    movieId={info?.id}
                    title={info?.title || info?.name}
                    release={info?.release_date || info?.first_air_date}
                    rating={info?.vote_average}
                    poster={info?.poster_path}
                    runtime={info?.runtime || ''}
                    language={info.original_language}
                    genres={info?.genres}
                    backdrop={info?.backdrop_path}
                    vote={info?.vote_count}
                    description={info.overview}
                    popularity={info?.popularity}
                    type={type}
                />

                <div className='mt-[64px]'>
                    <ActorCarousel
                        cardCount={20}
                        actors={credits?.cast}
                        showTitle={'credits'}
                    />
                </div>

                <div className='mt-[64px] pb-[64px]'>
                    <Carousel
                        movies={relatedMovies}
                        cardCount={20}
                        showTitle={`You May Also Like`}
                        media={type}
                    />
                </div>

                <div className='flex flex-col items-center'>
                    <Reviews
                        movieId={movieId}
                        type={type}
                    />

                </div>
            </>
        }
    </>
)
}

export default MovieInfoPage