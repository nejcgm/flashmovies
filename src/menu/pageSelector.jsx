import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from "react-dom";
import { useNavigate } from 'react-router-dom';
import CrossBlack from '../assets/crossBlack.png'


const PageSelector = ({ onCancel }) => {
    const navigate = useNavigate();

    const Container = useRef(null);


    useEffect(() => {
        Container.current.style.transition = "transform 0.8s ease";
        Container.current.style.transform = "translateY(-100%)";

        setTimeout(() => {
            Container.current.style.transform = "translateY(0)";
        }, 100);

    }, []);

    const handleClose = () => {
        Container.current.style.transition = "transform 0.8s ease";
        Container.current.style.transform = "translateY(-100%)";

        setTimeout(() => {
            onCancel();
        }, 800);

    };

    const mainContent = (
        <>
            <div
                className={`z-50 fixed bg-[#1F1F1F] top-0 left-0 w-full h-screen flex flex-col`}
                ref={Container}
            >
                <div className=' max-w-[1000px] mx-[64px] flex flex-col self-center w-full mt-[100px]'>

                    <div className='flex w-full justify-between items-center'>
                        <svg onClick={() => { navigate('/'), handleClose() }} className="ipc-logo drawer-logo" xmlns="http://www.w3.org/2000/svg" width="98" height="56" viewBox="0 0 64 32" version="1.1"><g fill="#F5C518"><rect x="0" y="0" width="100%" height="100%" rx="4"></rect></g><g transform="translate(8.000000, 7.000000)" fill="#000000" fill-rule="nonzero"><polygon points="0 18 5 18 5 0 0 0"></polygon><path d="M15.6725178,0 L14.5534833,8.40846934 L13.8582008,3.83502426 C13.65661,2.37009263 13.4632474,1.09175121 13.278113,0 L7,0 L7,18 L11.2416347,18 L11.2580911,6.11380679 L13.0436094,18 L16.0633571,18 L17.7583653,5.8517865 L17.7707076,18 L22,18 L22,0 L15.6725178,0 Z"></path><path d="M24,18 L24,0 L31.8045586,0 C33.5693522,0 35,1.41994415 35,3.17660424 L35,14.8233958 C35,16.5777858 33.5716617,18 31.8045586,18 L24,18 Z M29.8322479,3.2395236 C29.6339219,3.13233348 29.2545158,3.08072342 28.7026524,3.08072342 L28.7026524,14.8914865 C29.4312846,14.8914865 29.8796736,14.7604764 30.0478195,14.4865461 C30.2159654,14.2165858 30.3021941,13.486105 30.3021941,12.2871637 L30.3021941,5.3078959 C30.3021941,4.49404499 30.272014,3.97397442 30.2159654,3.74371416 C30.1599168,3.5134539 30.0348852,3.34671372 29.8322479,3.2395236 Z"></path><path d="M44.4299079,4.50685823 L44.749518,4.50685823 C46.5447098,4.50685823 48,5.91267586 48,7.64486762 L48,14.8619906 C48,16.5950653 46.5451816,18 44.749518,18 L44.4299079,18 C43.3314617,18 42.3602746,17.4736618 41.7718697,16.6682739 L41.4838962,17.7687785 L37,17.7687785 L37,0 L41.7843263,0 L41.7843263,5.78053556 C42.4024982,5.01015739 43.3551514,4.50685823 44.4299079,4.50685823 Z M43.4055679,13.2842155 L43.4055679,9.01907814 C43.4055679,8.31433946 43.3603268,7.85185468 43.2660746,7.63896485 C43.1718224,7.42607505 42.7955881,7.2893916 42.5316822,7.2893916 C42.267776,7.2893916 41.8607934,7.40047379 41.7816216,7.58767002 L41.7816216,9.01907814 L41.7816216,13.4207851 L41.7816216,14.8074788 C41.8721037,15.0130276 42.2602358,15.1274059 42.5316822,15.1274059 C42.8031285,15.1274059 43.1982131,15.0166981 43.281155,14.8074788 C43.3640968,14.5982595 43.4055679,14.0880581 43.4055679,13.2842155 Z"></path></g></svg>


                        <button onClick={() => { handleClose() }}
                            className='p-2 rounded-full  self-end bg-[#F5C518] group flex'>
                            <div className='flex items-center justify-center'>
                                <div className='absolute w-[51px] h-[51px] rounded-full bg-black/20  hidden group-hover:flex'></div>
                                <img src={CrossBlack} alt="" />
                            </div>
                        </button>

                    </div>

                    {/*movies list  */}
                    <div className='flex justify-between mt-[48px]'>
                        <div className='text-white font-roboto flex flex-col'>
                            <div className='flex gap-3'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className="text-[#F5C518] mt-[6px]" viewBox="0 0 24 24" fill="currentColor" role="presentation"><path fill="none" d="M0 0h24v24H0V0z"></path><path d="M18 4v1h-2V4c0-.55-.45-1-1-1H9c-.55 0-1 .45-1 1v1H6V4c0-.55-.45-1-1-1s-1 .45-1 1v16c0 .55.45 1 1 1s1-.45 1-1v-1h2v1c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-1h2v1c0 .55.45 1 1 1s1-.45 1-1V4c0-.55-.45-1-1-1s-1 .45-1 1zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"></path></svg>
                                <div className='flex flex-col items-start gap-3'>
                                    <div className='text-[24px] font-semibold'>Movies</div>
                                    <a href='/listratingmovie?type=movie&search=top_rated' onClick={() => { onCancel() }} className='hover:underline'>Top Rated Movies</a>
                                    <a href='/listpopularmovie?type=movie&search=popular' onClick={() => { onCancel() }} className='hover:underline'>Most Popular Movies</a>
                                    <a href='/listplayingmovie?type=movie&search=now_playing' onClick={() => { onCancel() }} className='hover:underline'>Now Playing</a>
                                    <a href='/listupcomingmovie?type=movie&search=upcoming' onClick={() => { onCancel() }} className='hover:underline'>Upcoming</a>
                                    <a href='/listgenremovie?type=movie&search=discover' onClick={() => { onCancel() }} className='hover:underline'>Browse Movies By Genre</a>
                                    <div>list</div>
                                </div>
                            </div>
                        </div>


                        <div className='text-white font-roboto flex flex-col'>
                            <div className='flex gap-3'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className="text-[#F5C518] mt-[6px]" viewBox="0 0 24 24" fill="currentColor" role="presentation"><path fill="none" d="M0 0h24v24H0V0z"></path><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v1c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-1h5c1.1 0 1.99-.9 1.99-2L23 5a2 2 0 0 0-2-2zm-1 14H4c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h16c.55 0 1 .45 1 1v10c0 .55-.45 1-1 1z"></path></svg>
                                <div className='flex flex-col items-start gap-3'>
                                    <div className='text-[24px] font-semibold'>TV Shows</div>
                                    <a href='/listratingtv?type=tv&search=top_rated' onClick={() => { onCancel() }} className='hover:underline'>Top Rated Shows</a>
                                    <a href='/listpopulartv?type=tv&search=popular' onClick={() => { onCancel() }} className='hover:underline'>Most Popular Shows</a>
                                    <a href='/listodaytv?type=tv&search=airing_today' onClick={() => { onCancel() }} className='hover:underline'>Airing Today Shows</a>
                                    <a href='/listonairtv?type=tv&search=on_the_air' onClick={() => { onCancel() }} className='hover:underline'>On The Air</a>
                                    <a href='/listgenretv?type=tv&search=discover' onClick={() => { onCancel() }} className='hover:underline'>Browse Shows By Genre</a>
                                    <div>list</div>
                                    <div>list</div>
                                </div>
                            </div>
                        </div>

                        <div className='text-white font-roboto flex flex-col'>
                            <div className='flex gap-3'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className="text-[#F5C518] mt-[6px]" viewBox="0 0 24 24" fill="currentColor" role="presentation"><path fill="none" d="M0 0h24v24H0V0z"></path><path d="M18 4v1h-2V4c0-.55-.45-1-1-1H9c-.55 0-1 .45-1 1v1H6V4c0-.55-.45-1-1-1s-1 .45-1 1v16c0 .55.45 1 1 1s1-.45 1-1v-1h2v1c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-1h2v1c0 .55.45 1 1 1s1-.45 1-1V4c0-.55-.45-1-1-1s-1 .45-1 1zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"></path></svg>
                                <div className='flex flex-col items-start gap-3'>
                                    <div className='text-[24px] font-semibold'>Celebs</div>
                                    <button className='hover:underline'>list</button>
                                    <button className='hover:underline'>list</button>
                                    <button className='hover:underline'>list</button>
                                    <div>list</div>
                                </div>
                            </div>
                        </div>


                    </div>


                </div>
            </div>
        </>
    )


    return ReactDOM.createPortal(mainContent, document.body);
}

export default PageSelector