import {BrowserRouter, Routes, Route} from 'react-router-dom'; 

import Navigation from './Navigation/Navigation'; 
import Home from './Home/Home'; 
import About from './About/About'; 



function App() {
  return (
    <>
      <BrowserRouter>
        <Navigation>
          <Routes>
            <Route path='/' element={<Home/>} /> 
            <Route path='/About' element={<About/>} />
          </Routes>
        </Navigation>
      </BrowserRouter>
    
    </>

    
  )
}

export default App
