import {BrowserRouter, Routes, Route, useNavigate, useLocation} from 'react-router-dom';
import { useEffect } from 'react';
import Navigation from './Navigation'
import Intro from '../Intro/Intro';
import Home from '../Home/Home';
import About from '../About/About';
import Gallery from '../Gallery/Gallery'; 

const AppRoutes = () => {
    const navigate = useNavigate()
    const location = useLocation() 


    useEffect(()=>{
      //check if this is a fresh page load (not a navigation within the app)
      const hasVisited = sessionStorage.getItem('hasVisited'); 

      if(!hasVisited && location.pathname !== '/'){
        //First load and not on intro page - redirect to intro 
        navigate('/'); 
      }

      // Mark as visited for this session 
      sessionStorage.setItem('hasVisited', 'true'); 
    }, [])


  

  return (
    
      <Routes>
        <Route path='/' element={<Intro/>} />
        <Route path='/home' element={<><Navigation /><Home/></>} />
        <Route path='/about' element={<><Navigation /><About/></>} />
        <Route path='/gallery' element={<><Navigation /><Gallery/></>} />
      </Routes>
  )
}

export default AppRoutes; 