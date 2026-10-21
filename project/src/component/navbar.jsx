
import React, { useState } from 'react'
import logo from './logo.png'
import { Link } from 'react-router-dom'

const navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="bg-blue-500 p-2 flex justify-between items-center relative">

      {/* Logo */}
      
        <img src={logo} alt="" className='ml-5 h-17 w-18'/>
      

      {/* Desktop Menu */}
      <div className="hidden md:flex gap-6 items-center">
        <Link to="/home">Home</Link>
        <Link to="/Plan">Plan</Link>
        <Link to="/dash">Dash</Link>
        <Link to='/knowledge'>Knowledge</Link>
        <Link
          to="/signup"
          className="bg-white px-3 py-2 hover:bg-black hover:text-white border border-transparent rounded-2xl"
        >
          Sign up
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden text-2xl"
      >
        ☰
      </button>

      {/* Mobile Menu */} 
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-blue-500 flex flex-col gap-5 p-5 md:hidden">
          <Link to="/home" onClick={() => setMenuOpen(false)}>
            Home
          </Link>

          <Link to="/dash" onClick={() => setMenuOpen(false)}>
            Dash
          </Link>
          <Link to='/knowledge' onClick={()=>setMenuOpen(false)}>
          knowledge
          </Link> 
          <Link to="/Plan" onClick={() => setMenuOpen(false)}>
            Plan
          </Link>

          <Link
            to="/signup"
            onClick={() => setMenuOpen(false)}
            className="bg-orange-500 px-2 py-1 hover:bg-white rounded-2xl w-fit"
          >
            Sign up
          </Link>
        </div>
      )}
    </div>
  )
}

export default navbar

