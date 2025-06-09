import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IoSearch } from "react-icons/io5";
import { IoCartOutline } from "react-icons/io5";
import { HiOutlineUser } from "react-icons/hi2";
import Tooltip from './Tooltip';
import { IoMdHeartEmpty } from "react-icons/io";

const Navbar = ({ showSearch, showWishlist, showProfile }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            const encodedQuery = encodeURIComponent(searchQuery.trim());
            navigate(`/search/query/${encodedQuery}`);
            setSearchQuery('');
        }
    };

    return (
        <div className='w-full flex items-center justify-between xl:px-10 lg:px-10 md:px-8 px-4 py-2 bg-[#96BF8A] shadow-lg fixed z-50'>
            <Link to={'/'} className='flex-shrink-0'>
                <img src={'/logoName.png'} className='xl:h-10 lg:h-10 md:h-10 h-6 relative top-1 hidden md:block' alt="Regio" />
                <img src={'/logo.png'} className='xl:h-10 lg:h-10 md:h-10 h-8 block md:hidden' alt="Regio" />
            </Link>

            {showSearch && (
                <form onSubmit={handleSearch} className='w-full max-w-2xl mx-4 flex items-center justify-between bg-white xl:py-2 py-2 lg:px-5 md:px-3 px-2 rounded-full'>
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder='Search for a product' 
                        className='bg-transparent px-2 w-full focus:outline-none placeholder-hippie-green-900 text-hippie-green-950 font-medium placeholder:font-normal text-sm md:text-base' 
                    />
                    <button type="submit" className='flex-shrink-0'>
                        <IoSearch className='xl:text-2xl lg:text-2xl md:text-2xl text-xl text-hippie-green-600' />
                    </button>
                </form>
            )}

            <div className='flex items-center justify-center xl:gap-5 lg:gap-5 md:gap-3 gap-2 flex-shrink-0'>
                <Tooltip text={'Cart'}>
                    <Link to={'/cart'} className='hover:scale-110 transition-transform'>
                        <IoCartOutline className='xl:text-3xl lg:text-3xl md:text-3xl text-2xl text-hippie-green-800' />
                    </Link>
                </Tooltip>
                
                {showProfile && <Tooltip text={'Profile'}>
                    <Link to={'/profile'} className='hover:scale-110 transition-transform'>
                        <HiOutlineUser className='xl:text-3xl lg:text-3xl md:text-3xl text-2xl text-hippie-green-800' />
                    </Link>
                </Tooltip> }

                {showWishlist && (
                    <Tooltip text={'Wishlist'}>
                        <Link to={'/wishlist'} className='hover:scale-110 transition-transform'>
                            <IoMdHeartEmpty className='xl:text-3xl lg:text-3xl md:text-3xl text-2xl text-hippie-green-800' />
                        </Link>
                    </Tooltip>
                )}

            </div>
        </div>
    )
}

export default Navbar
