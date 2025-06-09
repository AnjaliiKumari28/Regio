import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Homepage = () => {
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const categories = [
    { name: 'Clothing', image: '/clothing.png' },
    { name: 'Accessories', image: '/accessories.png' },
    { name: 'Foods', image: '/foods.png' },
    { name: 'HandiCrafts', image: '/handicrafts.png' },
  ];

  const handleCategoryClick = (categoryName) => {
    navigate(`/search/category/${categoryName}`);
  };

  useEffect(() => {
    const fetchProductTypes = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${SERVER_URL}/regio-store/product-types/product-types`);
        setProductTypes(response.data);
      } catch (error) {
        console.error('Error fetching product types:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductTypes();
  }, []);

  if (loading) {
    return (
      <div className='w-full h-screen flex items-center justify-center'>
        <div className='w-10 h-10 border-t-transparent border-b-transparent border-4 border-hippie-green-500 rounded-full animate-spin'></div>
      </div>
    );
  }

  return (
    <div className='w-full min-h-screen bg-hippie-green-50'>
      <Navbar showSearch={true} showProfile={true}/>

      <div className='w-[95vw] h-[99vh] md:h-[99vh] lg:h-[99vh] grid grid-cols-2 lg:grid-cols-3 grid-rows-10 lg:grid-rows-3 gap-2 md:gap-5 mx-auto p-2 pt-16 md:pt-20'>
        {/* Image 1 */}
        {productTypes[0] && (
          <div
            onClick={() => navigate(`/search/type/${productTypes[0]._id}`)}
            className='col-span-1 lg:col-span-1 row-span-2 lg:row-span-1 border rounded-2xl drop-shadow-2xl overflow-hidden relative group cursor-pointer'
          >
            <img src={productTypes[0].image} alt={productTypes[0].name} className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110' />
            <div className="absolute bottom-0 left-0 w-full h-[30%] bg-gradient-to-t from-black to-transparent rounded-b-2xl flex items-end p-3">
              <p className="text-white text-sm md:text-base font-semibold">{productTypes[0].name}</p>
            </div>
          </div>
        )}

        {/* Image 2 (Mobile) */}
        {productTypes[1] && (
          <div
            onClick={() => navigate(`/search/type/${productTypes[1]._id}`)}
            className='col-span-1 row-span-2 border rounded-2xl drop-shadow-2xl overflow-hidden relative group cursor-pointer inline-block lg:hidden'
          >
            <img src={productTypes[1].image} alt={productTypes[1].name} className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110' />
            <div className="absolute bottom-0 left-0 w-full h-[30%] bg-gradient-to-t from-black to-transparent rounded-b-2xl flex items-end p-3">
              <p className="text-white text-sm md:text-base font-semibold">{productTypes[1].name}</p>
            </div>
          </div>
        )}

        {/* Center Block */}
        <div className='col-span-2 lg:col-span-1 row-span-4 lg:row-span-2 bg-neutral-100 border rounded-2xl drop-shadow-2xl flex flex-col items-center justify-center gap-3 text-center p-4 border-gray-200'>
          <img src="/logoName.png" alt="Logo" className='w-1/2 lg:w-8/12 h-auto' draggable={false} />
          <h2 className='text-sm md:text-lg lg:text-2xl text-gray-700 font-semibold px-5' style={{ fontFamily: 'Lugrasimo', lineHeight: '2' }}>
            Crafted by Regions, Connected by Stories
          </h2>
          <button
            onClick={() => navigate('/products')}
            className='mt-2 px-10 py-3 bg-hippie-green-600 hover:bg-hippie-green-700 transition text-white text-sm md:text-base font-medium rounded-lg'
          >
            Explore Collections
          </button>
        </div>

        {/* Image 2 (Desktop) */}
        {productTypes[1] && (
          <div
            onClick={() => navigate(`/search/type/${productTypes[1]._id}`)}
            className='hidden lg:inline-block col-span-1 row-span-1 border rounded-2xl drop-shadow-2xl overflow-hidden relative group cursor-pointer'
          >
            <img src={productTypes[1].image} alt={productTypes[1].name} className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110' />
            <div className="absolute bottom-0 left-0 w-full h-[30%] bg-gradient-to-t from-black to-transparent rounded-b-2xl flex items-end p-3">
              <p className="text-white text-sm md:text-base font-semibold">{productTypes[1].name}</p>
            </div>
          </div>
        )}

        {/* Image 3 */}
        {productTypes[2] && (
          <div
            onClick={() => navigate(`/search/type/${productTypes[2]._id}`)}
            className='col-span-1 lg:col-span-1 row-span-2 lg:row-span-2 border rounded-2xl drop-shadow-2xl overflow-hidden relative group cursor-pointer'
          >
            <img src={productTypes[2].image} alt={productTypes[2].name} className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110' />
            <div className="absolute bottom-0 left-0 w-full h-[30%] bg-gradient-to-t from-black to-transparent rounded-b-2xl flex items-end p-3">
              <p className="text-white text-sm md:text-base font-semibold">{productTypes[2].name}</p>
            </div>
          </div>
        )}

        {/* Image 4 */}
        {productTypes[3] && (
          <div
            onClick={() => navigate(`/search/type/${productTypes[3]._id}`)}
            className='col-span-1 row-span-2 border rounded-2xl drop-shadow-2xl overflow-hidden relative group cursor-pointer'
          >
            <img src={productTypes[3].image} alt={productTypes[3].name} className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110' />
            <div className="absolute bottom-0 left-0 w-full h-[30%] bg-gradient-to-t from-black to-transparent rounded-b-2xl flex items-end p-3">
              <p className="text-white text-sm md:text-base font-semibold">{productTypes[3].name}</p>
            </div>
          </div>
        )}

        {/* Image 5 */}
        {productTypes[4] && (
          <div
            onClick={() => navigate(`/search/type/${productTypes[4]._id}`)}
            className='col-span-2 lg:col-span-1 row-span-2 lg:row-span-1 border rounded-2xl drop-shadow-2xl overflow-hidden relative group cursor-pointer'
          >
            <img src={productTypes[4].image} alt={productTypes[4].name} className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110' />
            <div className="absolute bottom-0 left-0 w-full h-[30%] bg-gradient-to-t from-black to-transparent rounded-b-2xl flex items-end p-3">
              <p className="text-white text-sm md:text-base font-semibold">{productTypes[4].name}</p>
            </div>
          </div>
        )}
      </div>

      <div className='w-full flex flex-col items-center gap-10 my-5 bg-hippie-green-400 py-20 px-5 md:px-10'>
        <h1 className='text-3xl font-bold text-white' style={{ fontFamily: 'Lugrasimo' }}>CATEGORIES</h1>
        <div className='w-full grid grid-cols-2 lg:grid-cols-4 gap-5'>
          {categories.map((cat, i) => (
            <div
              key={i}
              onClick={() => handleCategoryClick(cat.name)}
              className='group w-full h-full rounded-2xl relative overflow-hidden cursor-pointer'
            >
              <img
                src={cat.image}
                alt={cat.name}
                className='w-full h-full object-cover rounded-2xl transform duration-500 group-hover:scale-105'
              />
              <div className="absolute bottom-0 left-0 w-full h-[30%] bg-gradient-to-t from-black to-transparent rounded-b-2xl flex items-end p-4">
                <p className="w-full text-white text-lg font-semibold text-center">{cat.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Homepage;
