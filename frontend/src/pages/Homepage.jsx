import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';

const Homepage = () => {
  const [productTypes, setProductTypes] = useState([]);
  const [randomProducts, setRandomProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
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

  const flattenProduct = (product) => {
    return product.varieties.map(variety => {
      const firstOption = variety.options[0] || {};
      return {
        _id: `${product._id}${variety._id}`,
        productId: product._id,
        varietyId: variety._id,
        name: product.productName,
        varietyTitle: variety.title,
        images: variety.images,
        rating: product.rating,
        ratingCount: product.ratingCount,
        type: product.productTypeName,
        price: firstOption.price || 0,
        mrp: firstOption.mrp || 0,
      };
    });
  };

  const fetchRecommendationsFromHistory = async () => {
    const queries = JSON.parse(localStorage.getItem('searchHistory')) || [];

    // Don't call backend if empty
    if (!Array.isArray(queries) || queries.length === 0) return [];

    try {
      const response = await axios.post(`${SERVER_URL}/search/recommendations`, { queries });
      const flattenedProducts = response.data.recommended.flatMap(flattenProduct);
      setRecommendations(flattenedProducts);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      return [];
    }
  };
  // Function to fetch random 5 products
  const fetchRandomFive = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/regio-store/home/random-five`);
      setProductTypes(response.data.data);
    } catch (error) {
      console.error('Error fetching random five products:', error);
    }
  };

  // Function to fetch random 20 products
  const fetchRandomTwenty = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/regio-store/home/random-twenty`);
      setRandomProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching random twenty products:', error);
    }
  };

  useEffect(() => {
    const initialFetch = async () => {
      setLoading(true);
      try {
        // Fetch both random five and twenty products initially
        await Promise.all([fetchRandomFive(), fetchRandomTwenty(), fetchRecommendationsFromHistory()]);
      } catch (error) {
        console.error('Error in initial data fetch:', error);
      } finally {
        setLoading(false);
      }
    };

    initialFetch();

    // Set up interval for random five products
    const intervalId = setInterval(fetchRandomFive, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
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
      <Navbar showSearch={true} showProfile={true} showCart={true} showWishlist={true} />
      {/* Main Section */}
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
          <h2 className='text-sm md:text-lg lg:text-xl xl:text-2xl text-gray-700 font-semibold px-5' style={{ fontFamily: 'Lugrasimo', lineHeight: '2' }}>
            Crafted by Regions, Connected by Stories
          </h2>
          <button
            onClick={() => {
              document.getElementById('featured-products').scrollIntoView({ behavior: 'smooth' });
            }}
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

      {/* Categories Section */}
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

      <div className='w-full flex flex-col items-center gap-10 my-5 py-20 px-5 md:px-10'>
        <h1 className='text-3xl font-bold text-hippie-green-800' style={{ fontFamily: 'Lugrasimo' }}>Continue Shopping</h1>
        <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-8'>
          {recommendations.map((item) => (
            <div
              onClick={() => {
                navigate(`/product/${item.productId}/${item.varietyId}`);
              }}
              key={item._id}
              className='group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 cursor-pointer'
            >
              {/* Image Container */}
              <div className='relative aspect-square overflow-hidden'>
                {item.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={item.name}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${index === 0 ? 'opacity-100' : 'opacity-0'
                      }`}
                    onMouseEnter={(e) => {
                      let currentIndex = 0;
                      const totalImages = item.images.length;

                      const switchImage = () => {
                        // Hide all images
                        item.images.forEach((_, i) => {
                          const img = e.target.parentElement.children[i];
                          img.style.opacity = '0';
                        });

                        // Show current image
                        const currentImg = e.target.parentElement.children[currentIndex];
                        currentImg.style.opacity = '1';

                        // Move to next image
                        currentIndex = (currentIndex + 1) % totalImages;

                        // Schedule next switch
                        e.target.hoverInterval = setTimeout(switchImage, 1500);
                      };

                      // Start the sequence
                      e.target.hoverInterval = setTimeout(switchImage, 500);
                    }}
                    onMouseLeave={(e) => {
                      // Clear the interval
                      clearTimeout(e.target.hoverInterval);

                      // Reset to first image
                      item.images.forEach((_, i) => {
                        const img = e.target.parentElement.children[i];
                        img.style.opacity = i === 0 ? '1' : '0';
                      });
                    }}
                  />
                ))}
              </div>

              {/* Product Info */}
              <div className='p-3 sm:p-4 space-y-2'>
                <h3 className='text-sm text-gray-900 line-clamp-2 h-10 font-semibold'>
                  {item.name}
                </h3>

                <div className='flex items-center justify-between pt-2'>
                  <div className=' flex flex-col items-center gap-1'>
                    <p className='text-base sm:text-lg font-semibold text-gray-900'>₹{item.price}</p>
                    {item.mrp > item.price && (
                      <p className='text-xs text-gray-500 line-through'>₹{item.mrp}</p>
                    )}
                  </div>

                  <div className='flex flex-col items-center gap-1'>
                    <div className='flex items-center gap-1 bg-hippie-green-50 px-2 py-1 rounded-full'>
                      <span className='text-sm font-medium text-hippie-green-700'>{(item.rating).toFixed(1)}</span>
                      <FaStar className='text-yellow-400 text-sm' />
                    </div>
                    <span className='text-xs text-gray-500'>({item.ratingCount})</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Random Products Section */}
      <div id="featured-products" className='w-full flex flex-col items-center gap-10 my-5 py-20 px-5 md:px-10'>
        <h1 className='text-3xl font-bold text-hippie-green-800' style={{ fontFamily: 'Lugrasimo' }}>FEATURED PRODUCTS</h1>
        <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {randomProducts.map((product, index) => (
            <div
              key={index}
              onClick={() => navigate(`/search/type/${product._id}`)}
              className='bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer'
            >
              <div className='relative h-48 overflow-hidden'>
                <div className='absolute top-2 left-2 z-10'>
                  <div className='bg-hippie-green-100 px-3 py-1 rounded-full'>
                    <p className='text-sm text-hippie-green-800 font-medium'>
                      {product.category}
                    </p>
                  </div>
                </div>
                <img
                  src={product.image}
                  alt={product.name}
                  className='w-full h-full object-cover transform hover:scale-110 transition-transform duration-300'
                />
              </div>
              <div className='p-4 gap-2 flex flex-col justify-between'>
                <h3 className='text-lg font-semibold text-gray-800 line-clamp-1'>{product.name}</h3>
                <div className='inline-block italic font-semibold py-1 rounded-full'>
                  <p className='text-sm text-blue-700 font-medium'>
                    {product.city}, {product.state}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Homepage;
