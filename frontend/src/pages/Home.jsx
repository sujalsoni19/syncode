import React from 'react'
import {NavbarAuth} from "../components/NavbarAuth.jsx"
import HomeContent from '../components/HomeContent.jsx'
import { Footer } from '../components/Footer.jsx'

function Home() {
  return (
    <div className='flex w-full h-screen flex-col'>
      <NavbarAuth />
      <div className='flex-1'>
        <HomeContent />
      </div>
      <Footer />
    </div>
  )
}

export default Home
