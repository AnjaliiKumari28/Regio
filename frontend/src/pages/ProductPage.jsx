import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { FaStar } from "react-icons/fa6";
import { useParams, useNavigate } from 'react-router-dom';
import { FaTruckFast } from "react-icons/fa6";
import { TbHeartFilled, TbHeart } from "react-icons/tb";
import { BsCartPlus, BsCheck2 } from "react-icons/bs";
import axios from 'axios';
import { useAuth } from '../contexts/authContext';
import LoginPrompt from '../components/LoginPrompt';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const ProductPage = () => {
  const { p, v } = useParams();
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();
  const [product, setProduct] = useState(null);
  const [productType, setProductType] = useState(null);
  const [seller, setSeller] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState({
    product: true,
    seller: false,
    productType: false,
    similarProducts: false
  });
  const [error, setError] = useState({
    product: null,
    seller: null,
    productType: null,
    similarProducts: null
  });
  const [wishlisted, setWishlisted] = useState(false);
  const [pincode, setPincode] = useState(700040);
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedvariant, setSelectedvariant] = useState(0);
  const [selectedOption, setSelectedOption] = useState(0);
  const [optionError, setOptionError] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);

  // Fetch product data
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(prev => ({ ...prev, product: true }));
        setError(prev => ({ ...prev, product: null }));
        
        const productResponse = await axios.get(`${SERVER_URL}/regio-store/product/${p}`);
        setProduct(productResponse.data);

        // Find the index of the selected variety
        const varietyIndex = productResponse.data.varieties.findIndex(
          variety => variety._id === v
        );
        if (varietyIndex !== -1) {
          setSelectedvariant(varietyIndex);
        }

        // After product is loaded, fetch seller data
        fetchSellerData(productResponse.data.seller_id);
        
        // After product is loaded, fetch product type data
        fetchProductTypeData(productResponse.data.productType);

        // Check if item is in wishlist
        if (user && accessToken) {
          try {
            const wishlistResponse = await axios.get(`${SERVER_URL}/regio-store/wishlist`, {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            const isWishlisted = wishlistResponse.data.some(
              item => item.product_id === productResponse.data._id && 
                     item.variety_id === productResponse.data.varieties[varietyIndex]._id
            );
            setWishlisted(isWishlisted);
          } catch (error) {
            console.error('Error checking wishlist status:', error);
          }
        }

        // Fetch similar products
        fetchSimilarProducts(p);
      } catch (err) {
        console.error('Error fetching product data:', err);
        setError(prev => ({ ...prev, product: err.response?.data?.message || 'Error fetching product data' }));
      } finally {
        setLoading(prev => ({ ...prev, product: false }));
      }
    };

    fetchProductData();
  }, [p, v, user, accessToken]);

  // Fetch seller data
  const fetchSellerData = async (sellerId) => {
    try {
      setLoading(prev => ({ ...prev, seller: true }));
      setError(prev => ({ ...prev, seller: null }));
      
      const sellerResponse = await axios.get(`${SERVER_URL}/regio-store/seller/${sellerId}`);
      setSeller(sellerResponse.data);
    } catch (err) {
      console.error('Error fetching seller data:', err);
      setError(prev => ({ ...prev, seller: err.response?.data?.message || 'Error fetching seller data' }));
    } finally {
      setLoading(prev => ({ ...prev, seller: false }));
    }
  };

  // Fetch product type data
  const fetchProductTypeData = async (typeId) => {
    try {
      setLoading(prev => ({ ...prev, productType: true }));
      setError(prev => ({ ...prev, productType: null }));
      
      const typeResponse = await axios.get(`${SERVER_URL}/regio-store/product-type/${typeId}`);
      setProductType(typeResponse.data);
    } catch (err) {
      console.error('Error fetching product type data:', err);
      setError(prev => ({ ...prev, productType: err.response?.data?.message || 'Error fetching product type data' }));
    } finally {
      setLoading(prev => ({ ...prev, productType: false }));
    }
  };

  // Fetch similar products
  const fetchSimilarProducts = async (productId) => {
    try {
      setLoading(prev => ({ ...prev, similarProducts: true }));
      setError(prev => ({ ...prev, similarProducts: null }));
      
      const response = await axios.get(`${SERVER_URL}/regio-store/similar-products/${productId}`);
      setSimilarProducts(response.data);
    } catch (err) {
      console.error('Error fetching similar products:', err);
      setError(prev => ({ ...prev, similarProducts: err.response?.data?.message || 'Error fetching similar products' }));
    } finally {
      setLoading(prev => ({ ...prev, similarProducts: false }));
    }
  };

  if (loading.product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hippie-green-600"></div>
      </div>
    );
  }

  if (error.product || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">{error.product || 'Product not found'}</div>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!user || !accessToken) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      const selectedVariety = product.varieties[selectedvariant];
      const selectedOptionData = selectedVariety.options[selectedOption];
      
      await axios.post(`${SERVER_URL}/regio-store/cart/add`, {
        product_id: product._id,
        variety_id: selectedVariety._id,
        option_id: selectedOptionData._id
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      // Show success message for 5 seconds
      setCartAdded(true);
      setTimeout(() => {
        setCartAdded(false);
      }, 5000);

    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleAdddToWishList = async () => {
    if (!user || !accessToken) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      const selectedVariety = product.varieties[selectedvariant];
      
      // Use a single endpoint to toggle wishlist status
      const response = await axios.post(`${SERVER_URL}/regio-store/wishlist/add`, {
        product_id: product._id,
        variety_id: selectedVariety._id
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      // Update wishlist state based on the action returned from the server
      setWishlisted(response.data.action === 'added');
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const handleOptionSelect = (index, quantity) => {
    if (quantity === 0) {
      setOptionError('Out of Stock');
      return;
    }
    setOptionError('');
    setSelectedOption(index);
  };

  const handleProductClick = (productId, varietyId) => {
    navigate(`/product/${productId}/${varietyId}`);
  };

  // Get the selected variety
  const selectedVariety = product.varieties[selectedvariant];

  return (
    <>
      <Navbar showSearch={true} showProfile={true}/>
      <LoginPrompt isOpen={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
      <div className='w-full h-full flex flex-col md:pt-20 pt-16 pb-10'>
        {/* Product Details */}
        <div className='w-full h-full flex lg:flex-row flex-col md:gap-10 gap-5 xl:px-10 lg:px-10 md:px-10 px-5'>
          {/* Product Image */}
          <div className='lg:w-[50%] w-full lg:h-[87vh] md:h-[90vh] h-[85vh] flex lg:flex-row-reverse flex-col items-center justify-between lg:sticky top-20 md:gap-5 gap-3'>
            <img 
              className='w-full h-[90%] md:h-[80%] lg:h-full object-cover rounded-lg' 
              src={selectedVariety.images[currentImage]} 
              alt={product.productName} 
            />
            <div className='w-full lg:w-2/12 h-[25%] md:h-[25%] lg:h-full overflow-x-auto lg:overflow-y-auto'>
              <div className='w-full h-full flex lg:flex-col items-center justify-start md:gap-5 gap-5'>
                {selectedVariety.images.map((image, index) => (
                  <button 
                    key={index}
                    className={`${currentImage === index ? 'border-4 border-hippie-green-300' : ''} rounded-xl lg:w-full md:w-32 w-20 aspect-[3/4]`} 
                    onClick={() => setCurrentImage(index)}
                  >
                    <img src={image} alt="" className='w-full h-full rounded-lg object-cover' />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className='xl:w-[50%] lg:w-[60%] w-full h-full flex flex-col items-start gap-5'>
            <div className='w-full flex flex-col items-start gap-5 pb-5 border-b border-gray-500'>
              <h1 className='text-hippie-green-950 text-3xl font-semibold'>{product.productName}</h1>
              <p className='text-gray-600 italic text-md'>{product.description}</p>
              <div className='flex items-center justify-center gap-5'>
                <div className='px-3 py-1 bg-hippie-green-200 text-hippie-green-800 flex items-center justify-center gap-2 text-sm font-bold rounded-full border-2 border-hippie-green-400'>
                  <span>{product.rating}</span>
                  <FaStar />
                </div>
                <p className='font-medium text-gray-600 text-md'>({product.ratingCount}) Ratings</p>
              </div>
            </div>

            {/* Pricing */}
            <div className='flex flex-col items-start gap-2'>
              <h1 className='text-3xl font-semibold text-gray-700'>₹ {selectedVariety.options[selectedOption].price}</h1>
              <div className='flex items-center justify-center gap-2 text-gray-700 italic'>
                <span className='line-through'>₹{selectedVariety.options[selectedOption].mrp}</span>
                <span className='font-semibold text-hippie-green-600'>
                  ( - {((selectedVariety.options[selectedOption].mrp - selectedVariety.options[selectedOption].price) / selectedVariety.options[selectedOption].price * 100).toFixed(0)}% )
                </span>
              </div>
            </div>

            {/* Variations */}
            <div className='w-full flex flex-col items-start gap-3'>
              <p className='text-gray-800 font-semibold text-lg'>Product Variants</p>
              <div className='w-full overflow-x-auto'>
                <div className='w-full flex items-center justify-start gap-5'>
                  {product.varieties.map((variety, index) => (
                    <div key={index} className="flex flex-col items-center gap-2">
                      <button 
                        className={`${selectedvariant === index ? 'border-4 border-hippie-green-400' : ''} rounded-2xl`} 
                        onClick={() => {
                          setSelectedvariant(index);
                          setCurrentImage(0);
                          setSelectedOption(0);
                        }}
                      >
                        <img src={variety.images[0]} className='w-16 md:h-20 aspect-[3/4] rounded-xl' alt="" />
                      </button>
                      <p className="text-sm text-gray-600 font-medium text-center">{variety.title}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className='w-full flex flex-col gap-3'>
                <p className='text-gray-800 font-semibold text-lg'>Select Option</p>
                <div className='w-full flex overflow-x-auto gap-3'>
                  {selectedVariety.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(index, option.quantity)}
                      className={`
                        px-4 py-2 rounded-lg border-2 transition-all duration-200
                        ${selectedOption === index 
                          ? 'border-hippie-green-600 bg-hippie-green-50 text-hippie-green-700' 
                          : 'border-gray-300 hover:border-hippie-green-400'
                        }
                        ${option.quantity === 0 
                          ? 'opacity-50' 
                          : 'cursor-pointer'
                        }
                        relative
                      `}
                    >
                      {option.label}
                      
                    </button>
                  ))}
                </div>
                {optionError && (
                  <p className="text-red-500 text-sm mt-1 font-semibold">{optionError}</p>
                )}
                {selectedVariety.options[selectedOption]?.quantity > 0 && 
                 selectedVariety.options[selectedOption]?.quantity <= 5 && (
                  <p className="text-red-500 text-sm mt-1 font-semibold">
                    Only {selectedVariety.options[selectedOption].quantity} items left in stock
                  </p>
                )}
              </div>

              <div className='w-full flex items-center justify-start gap-5 my-5'>
                <button 
                  onClick={handleAddToCart}
                  disabled={selectedVariety.options[selectedOption].quantity === 0 || cartAdded}
                  className={`
                    px-10 py-2 rounded-lg flex items-center justify-center gap-2 font-semibold text-lg
                    ${selectedVariety.options[selectedOption].quantity === 0 || cartAdded
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-hippie-green-600 hover:bg-hippie-green-700'
                    }
                    text-white transition-all duration-200
                  `}
                >
                  {cartAdded ? (
                    <>
                      <span>Added to Cart</span>
                      <BsCheck2 className='text-2xl' />
                    </>
                  ) : (
                    <>
                      <span>Add to Cart</span>
                      <BsCartPlus className='text-2xl' />
                    </>
                  )}
                </button>
                <button 
                  onClick={handleAdddToWishList}
                  className={`border-2 border-hippie-green-600 text-hippie-green-600 text-3xl rounded-xl p-1 
                    ${wishlisted ? 'bg-hippie-green-50' : ''} 
                    hover:bg-hippie-green-50 transition-all ease-in-out duration-200`}
                >
                  {wishlisted ? <TbHeartFilled /> : <TbHeart />}
                </button>
              </div>

              {/* Delivery */}
              <div className='w-full flex flex-col items-start gap-3 pb-5'>
                <div className='flex items-center justify-center gap-1 text-hippie-green-600 italic font-md font-semibold'>
                  <FaTruckFast className='text-xl' />
                  <span className='ml-2'>Delivery in</span>
                  <span className='font-bold'>3 days</span>
                </div>
                <div className='xl:w-1/2 lg:w-1/2 md:w-8/12 w-full flex items-center justify-center border-b-2 pb-2 border-hippie-green-600'>
                  <input 
                    type="text" 
                    placeholder='Enter your PIN Code' 
                    className='w-full bg-transparent focus:outline-none'
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                  />
                  <button className='text-hippie-green-600 font-bold'>Check</button>
                </div>
              </div>

              {/* Description */}
              <div className='w-full flex flex-col items-start gap-2 pt-5 border-t border-t-gray-500'>
                <h1 className='text-lg font-semibold text-gray-700'>Product Description</h1>
                <pre className='text-md text-gray-600' style={{ fontFamily: 'DM Sans' }}>{product.specifications}</pre>
              </div>
            </div>
          </div>
        </div>

        

        {/* Seller Information */}
        <div className='w-full h-full flex flex-col items-center justify-center gap-10 bg-hippie-green-100 xl:p-10 lg:p-10 md:p-10 p-5 mt-10'>
          <div className='w-full max-w-full'>
            <h1 className='text-3xl font-bold text-gray-800 mb-8'>About the Seller</h1>
            
            {loading.seller ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-hippie-green-600"></div>
              </div>
            ) : error.seller ? (
              <div className="text-red-500 text-center py-8">{error.seller}</div>
            ) : seller ? (
              <>
                {/* Seller Details */}
                <div className='w-full bg-white rounded-xl p-8 shadow-lg mb-10'>
                  <div className='flex flex-col items-start gap-4'>
                    <div className='flex items-center justify-between w-full flex-wrap gap-2'>
                    <h2 className='text-2xl font-semibold text-hippie-green-700'>{seller?.storeName}</h2>
                    <div className='flex items-center gap-2'>
                      <div className='px-3 py-1 bg-hippie-green-100 text-hippie-green-800 flex items-center justify-center gap-2 text-sm font-bold rounded-full'>
                        <span>{seller?.storeRating}</span>
                        <FaStar />
                      </div>
                      <p className='text-gray-600'>({seller?.ratingCount} ratings)</p>
                    </div>
                    </div>
                    <div className='flex flex-col gap-2 text-gray-700'>
                      <p className='flex items-center gap-2'>
                        <span className='font-semibold'>Seller:</span>
                        <span>{seller?.sellerName}</span>
                      </p>
                      <p className='flex items-center gap-2'>
                        <span className='font-semibold'>Location:</span>
                        <span>{seller?.city}, {seller?.state}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Seller's Products */}
                <div className='w-full'>
                  <h2 className='text-2xl font-semibold text-gray-800 mb-6'>More from this Seller</h2>
                  <div className='w-full overflow-x-auto pb-4'>
                    <div className='flex gap-6 min-w-min'>
                      {seller?.products?.map((product) => (
                        <div 
                          key={product.product_id} 
                          className='bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer min-w-[280px]'
                          onClick={() => handleProductClick(product.product_id, product.variety_id)}
                        >
                          <img 
                            src={product.imageUrl} 
                            alt={product.productName}
                            className='w-full h-48 md:h-64 object-cover'
                          />
                          <div className='p-4'>
                            <h3 className='text-lg font-semibold text-gray-800 mb-2 line-clamp-2'>{product.productName}</h3>
                            <div className='flex items-center gap-2 mb-2'>
                              <div className='px-2 py-1 bg-hippie-green-100 text-hippie-green-800 flex items-center justify-center gap-1 text-xs font-bold rounded-full'>
                                <span>{product.rating}</span>
                                <FaStar className='text-xs' />
                              </div>
                              <p className='text-sm text-gray-600'>({product.ratingCount})</p>
                            </div>
                            <div className='flex items-center gap-2'>
                              <span className='text-lg font-bold text-hippie-green-700'>₹{product.price}</span>
                              <span className='text-sm text-gray-500 line-through'>₹{product.mrp}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Similar Products */}
        <div className='w-full h-full flex flex-col items-center justify-center gap-10 xl:p-10 lg:p-10 md:p-10 p-5 mt-10'>
          <div className='w-full max-w-full'>
            <h1 className='text-3xl font-bold text-gray-800 mb-8'>Similar Products</h1>
            
            {loading.similarProducts ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-hippie-green-600"></div>
              </div>
            ) : error.similarProducts ? (
              <div className="text-red-500 text-center py-8">{error.similarProducts}</div>
            ) : similarProducts.length > 0 ? (
              <div className='w-full overflow-x-auto pb-4'>
                <div className='flex gap-6 min-w-min'>
                  {similarProducts.map((product) => (
                    <div 
                      key={product.product_id} 
                      className='bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer min-w-[280px]'
                      onClick={() => handleProductClick(product.product_id, product.variety_id)}
                    >
                      <img 
                        src={product.imageUrl} 
                        alt={product.productName}
                        className='w-full h-48 md:h-64 object-cover'
                      />
                      <div className='p-4'>
                        <h3 className='text-lg font-semibold text-gray-800 mb-2 line-clamp-2'>{product.productName}</h3>
                        <div className='flex items-center gap-2 mb-2'>
                          <div className='px-2 py-1 bg-hippie-green-100 text-hippie-green-800 flex items-center justify-center gap-1 text-xs font-bold rounded-full'>
                            <span>{product.rating}</span>
                            <FaStar className='text-xs' />
                          </div>
                          <p className='text-sm text-gray-600'>({product.ratingCount})</p>
                        </div>
                        <div className='flex items-center gap-2'>
                          <span className='text-lg font-bold text-hippie-green-700'>₹{product.price}</span>
                          <span className='text-sm text-gray-500 line-through'>₹{product.mrp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">No similar products found</div>
            )}
          </div>
        </div>

        {/* Product Type Information */}
        <div className='w-full h-full flex xl:flex-row lg:flex-row flex-col items-start justify-center gap-10 bg-hippie-green-100 xl:p-10 lg:p-10 md:p-10 p-5 mt-10'>
          {loading.productType ? (
            <div className="flex justify-center py-8 w-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-hippie-green-600"></div>
            </div>
          ) : error.productType ? (
            <div className="text-red-500 text-center py-8 w-full">{error.productType}</div>
          ) : productType ? (
            <>
              <img src={productType.image} className='xl:w-[40%] lg:w-[40%] w-full h-[40vh] lg:h-[70vh] rounded-lg object-cover' alt="" />
              <div className='xl:w-[60%] lg:w-[60%] w-full flex flex-col items-start gap-5'>
                <h1 className='text-2xl font-bold text-hippie-green-600'>{productType.name}</h1>
                <p className='text-md text-gray-600 italic'>{productType.description}</p>
                <div className='flex items-center justify-start gap-1'>
                  <p className='font-semibold text-gray-700'>Origin:</p>
                  <p className='text-hippie-green-700 italic font-semibold'>{productType.city}, {productType.state}</p>
                </div>
                <p className='text-xl font-semibold text-gray-700'>Historical Significance</p>
                <pre className='text-md font-normal text-gray-700 text-wrap' style={{ fontFamily: 'DM Sans' }}>{productType.history}</pre>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </>
  )
}

export default ProductPage