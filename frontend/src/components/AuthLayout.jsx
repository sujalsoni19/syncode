import React from 'react'
import {NavbarAuth} from "./NavbarAuth.jsx"
import { Footer } from './Footer.jsx'
import { Outlet } from 'react-router'

function AuthLayout() {
  return (
    <div className='flex w-full h-screen flex-col'>
      <NavbarAuth />
      <div className=' flex justify-center items-center flex-1'>
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}

export default AuthLayout
