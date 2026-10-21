import React from 'react'
import Dash from './component/dash'
import Navbar from './component/navbar'
import Home from './component/home'
import Signup from './component/signup'
import Login from './component/login'
import Plan from './component/Plan'
import Know from './component/knowledge'
import {Routes, Route} from 'react-router-dom'
// import {Link} from 'react-router-dom'    
const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path='/dash' element={<Dash />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/login' element={<Login />} />
        <Route path='/plan' element={<Plan />} />
        <Route path='/knowledge' element={<Know />} />
      </Routes>  
    </div>
  )
}

export default App