import Home from './Pages/home'
import MainLayout from './layout/mainLayout'
import MovieInfoPage from './Pages/movieInfoPage';
import { Routes, Route } from 'react-router-dom';
import Iframe from './fullMovie/iframe';
import List from './listMovie/list';
import GenreListComponent from './genreList/genreListComponent';

function App() {
  return (
    <>
    <Routes>
     <Route path="/" element={<MainLayout/>}>
     <Route path="/" element={<Home/>}/>
     <Route path="/movieinfo" element={<MovieInfoPage/>}/>
     <Route path="/fullmovie" element={<Iframe/>}/>
     
     <Route path="/listratingmovie" element={<List showTitle={'Best Rated Movies'}/>}/>
     <Route path="/listpopularmovie" element={<List showTitle={'Most Popular Movies'}/>}/>
     <Route path="/listplayingmovie" element={<List showTitle={'Now Playing Movies'}/>}/>
     <Route path="/listupcomingmovie" element={<List showTitle={'Upcoming Movies'}/>}/>

     <Route path="/listgenremovie" element={
      <>
      <List showTitle={'Search Movies By Genre'} genreList={true}/> 
      </>
      }/>

     <Route path="/listratingtv" element={<List showTitle={'Best Rated Shows'}/>}/>
     <Route path="/listpopulartv" element={<List showTitle={'Most Popular Shows'}/>}/>
     <Route path="/listodaytv" element={<List showTitle={'Airing Today'}/>}/>
     <Route path="/listonairtv" element={<List showTitle={'On The Air'}/>}/>
     <Route path="/listgenretv" element={
      <>
      <List showTitle={'Search Shows By Genre'} genreList={true}/> 
      </>
      }/>

     <Route path="/listpopularcelebs" element={<List showTitle={'Most Popular Celebs'}/>}/>

     </Route>
    </Routes>
    </>
  )
}

export default App
