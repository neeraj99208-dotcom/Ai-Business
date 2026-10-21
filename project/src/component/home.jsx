import React from 'react'
import growth from './growth.png'
import database from './database.png'
import piechart from './pie-chart2.png'
import barchart from './barchart.png'
import success from './sucess.png'
import market from './market.png'
import analyse from './analyse.png'
import score from './score.png'
import instagram from './instagram.png'
import facebook from './facebook.png'
import {Link} from 'react-router-dom'
const Landing = () => {


  return (
    <div>
      <div className="bg-[#050505] h-[90%] pt-30 flex items-center justify-center"> //
      <div className="text-center max-w-5xl px-6">

        <h1 className="text-5xl md:text-7xl font-bold leading-tight">
          <span className="bg-gradient-to-r from-white via-purple-300 to-violet-500 bg-clip-text text-transparent">
            Precision Business
          </span>
          <br />
          <span className="bg-gradient-to-r from-white via-purple-300 to-violet-500 bg-clip-text text-transparent">
            Intelligence &
          </span>
          <br />
          <span className="bg-gradient-to-r from-purple-300 to-violet-600 bg-clip-text text-transparent">
            Compliance
          </span>
        </h1>

        <p className="text-gray-400 mt-8 text-lg max-w-3xl mx-auto">
          Real-time KYB validation, global verification, and ongoing risk
          monitoring for high-stakes enterprises.
        </p>

        <Link to="/signup" className="mt-10 inline-block px-10 py-4 bg-violet-400 rounded-xl hover:bg-violet-500 transition-all duration-300">
          <span className="font-bold">Get Started</span>
        </Link>
        <button className="mt-10 px-10 py-4 text-white bg-black rounded-xl hover:bg-gray-300 hover:text-black transition shadow-[0_0_30px_rgba(168,85,247,0.5)] ml-10 scroll-smooth">
       
          <a href='#what-learn'>Learn more</a>
          
        </button>
      </div>
      
    </div>
    <div className='bg-[#050505] h-40  w-full flex flex-row flex-wrap justify-center gap-30'>
      <span className='border border-purple-500 h-20 flex gap-4 rounded hover:scale-110 transition-transform text-white mt-15  p-6'>
        <h1 className='text-lg'>Real time data</h1>
        <img src={database} alt="" className='h-9 w-9' />
      </span>
      <span className='border border-purple-500 h-20 flex gap-4 rounded hover:scale-110 transition-transform text-white mt-15  p-6'>
        <h1 className='text-lg'>Global coverage</h1>
        <img src={growth} alt="" className='h-9 w-9' />
      </span>
      <span className='border border-purple-500 h-20 flex gap-4 rounded hover:scale-110 transition-transform text-white mt-15  p-6'> {/*transition-transform is use for smooth animation*/}
        <h1 className='text-lg'>AI-Powered</h1>
        <img src={barchart} alt="" />
      </span>
    </div>
     <div className="bg-[#050505] pt-60 text-white py-10">
      <div className="flex flex-col items-center">

    <h1 className="text-6xl font-bold mb-15 text-purple-500 " id='what-learn'>
      What you will get
    </h1>

    <div className="flex gap-10 flex-wrap justify-center mb-10">
      <div className="border  border-white p-15 rounded hover:scale-110 transition-transform">
        <img src={piechart} alt="" className='h-15 w-20 ml-6 mb-5 ' />
        <h1 className='text-xl font-bold'> Market Update</h1>
      </div>

      <div className="border border-white p-15 rounded hover:scale-110 transition-transform">
        <img src={success} alt="" className='h-15 w-20 ml-14 mb-5'/>
        <h1 className='text-xl font-bold'>Probability of Success</h1>
      </div>

      <div className="border border-white p-15 rounded hover:scale-110 transition-transform">
        <img src={market} alt="" className='h-15 w-20 ml-10 mb-5'/>
        <h1 className='text-xl font-bold'>Budget in Market</h1>
      </div>

      <div className="border border-white p-15 rounded hover:scale-110 transition-transform">
         <img src={analyse} alt="" className='ml-14 mb-5'/>
        <h1 className='text-xl font-bold'>Competitor Analysis</h1>
      </div>

      <div className="border border-white p-15 rounded hover:scale-110 transition-transform">
        <img src={score} alt="" className='h-15 w-18 ml-8 mb-3' />
        <h1 className='text-xl font-bold'>Demand Score</h1>
      </div>
    </div>

  </div>
</div>
    <div className='bg-black py-30 h-full w-full'>
      <h1 className='text-gray-400 flex justify-center text-3xl '>Precious data system for institutional-grade compliance and business intelligence</h1>
      <div className='flex flex-row justify-center gap-30 mt-20'>
        <div className='text-white font-bold text-xl flex flex-col gap-10'>
          <h2 className='text-purple-600 text-2xl'>Solution</h2>
          <h3>Account Validator</h3>
          <h3>UBO Mapping</h3>
          <h3>AML Screener</h3>
        </div>
        
        <div className='text-white font-bold text-xl flex flex-col gap-10'>
            <h2 className='text-purple-600 text-2xl'>Developers</h2>
            <h3>APIs Docs</h3>
            <h3>Sandbox</h3>
            <h3>Health Status</h3>
        </div>
        <div className='text-white flex flex-col gap-10' >
          <h2 className='text-purple-600 text-2xl'> Tools</h2>
          <h3 className='font-bold text-xl'>PDF Report Generator</h3>
          <h3 className='font-bold text-xl'>Bulk Upload / Import</h3>
        </div>
        <div className='flex flex-col gap-10 '>
          <h2 className='text-purple-500 text-2xl'>Social Media</h2>
          <img src={instagram} alt="" className='h-14 w-14 hover:scale-110 transition-transform'/>
          <img src={facebook} alt=""  className='h-14 w-14 hover:scale-110 transition-transform'/>
        </div>
      </div>
      
    </div>
    </div>
  )
}

export default Landing;