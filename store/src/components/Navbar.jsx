import React from 'react'
import logoName from '/logoName.png'
import { Link } from 'react-router-dom'
import { MdStorefront } from "react-icons/md";
const Navbar = () => {
    return (
        <div className='w-full flex items-center justify-between xl:px-10 lg:px-10 md:px-8 px-2 py-2 bg-hippie-green-400 shadow-lg'>
            <img src={logoName} className='xl:h-10 lg:h-10 md:h-10 h-6 relative top-1' alt="" />
                <Link className='text-lg font-semibold text-hippie-green-800 flex items-center justify-center gap-2 px-3 py-1 rounded-full border-2 border-hippie-green-700 bg-hippie-green-300'><span>Store</span><MdStorefront className='text-2xl'/></Link>
                
        </div>
    )
}

export default Navbar
