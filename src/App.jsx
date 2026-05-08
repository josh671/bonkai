import {BrowserRouter, Routes, Route, useNavigate, useLocation} from 'react-router-dom';
import AppRoutes from './Navigation/AppRoutes'



function App() {
  return (
    <BrowserRouter>
      <AppRoutes/>
    </BrowserRouter>
  )
}

export default App
