import React from 'react'
import { assets } from '../../assets/assets'
import Image from 'next/image'
import { useAppContext } from '@/context/AppContext'

const Navbar = () => {

  const { router, signOut } = useAppContext();

  return (
    <div className='flex items-center px-4 md:px-8 py-3 justify-between border-b bg-white shadow-sm'>
      <Image onClick={()=>router.push('/')} className='w-28 lg:w-32 cursor-pointer' src={assets.logo} alt="logo" />
      <button 
        onClick={signOut} 
        className='bg-red-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm hover:bg-red-700 transition'
      >
        Logout
      </button>
    </div>
  )
}

export default Navbar;