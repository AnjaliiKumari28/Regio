import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/authContext';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaStar } from "react-icons/fa6";
import { TbHeartFilled } from "react-icons/tb";
import Navbar from '../components/Navbar';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const WishList = () => {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user || !accessToken) return;

      try {
        setLoading(true);
        const response = await axios.get(`${SERVER_URL}/regio-store/wishlist`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setWishlistItems(response.data);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        setError('Failed to load wishlist items');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user, accessToken]);

  const handleRemoveClick = (productId, varietyId) => {
    setItemToRemove({ productId, varietyId });
    setShowRemoveConfirm(true);
  };

  useEffect(() => console.log(itemToRemove), [itemToRemove]); 
  useEffect(() => console.log(wishlistItems), [wishlistItems]);

  const handleRemoveConfirm = async () => {
    if (!itemToRemove) return;

    try {
      await axios.post(`${SERVER_URL}/regio-store/wishlist/add`, {
        product_id: itemToRemove.productId,
        variety_id: itemToRemove.varietyId
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      // Update local state
      setWishlistItems(items => 
        items.filter(item => 
          !(item.product_id === itemToRemove.productId && item.variety_id === itemToRemove.varietyId)
        )
      );
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    } finally {
      setShowRemoveConfirm(false);
      setItemToRemove(null);
    }
  };

  const handleProductClick = (productId, varietyId) => {
    navigate(`/product/${productId}/${varietyId}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar showSearch={true} showProfile={true} />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-700">Please login to view your wishlist</h2>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar showSearch={true} showProfile={true} />
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hippie-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar showSearch={true} showProfile={true} />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center text-red-500">
            <h2 className="text-2xl font-semibold">{error}</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showSearch={true} showProfile={true} />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <h1 className="text-3xl font-bold text-hippie-green-800 mb-8">My Wishlist</h1>
        
        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl text-gray-600">Your wishlist is empty</h2>
            <Link 
              to="/" 
              className="inline-block mt-4 px-6 py-2 bg-hippie-green-600 text-white rounded-lg hover:bg-hippie-green-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {wishlistItems.map((item) => (
              <div 
                key={`${item.product_id}-${item.variety_id}`}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative aspect-[4/5] cursor-pointer" onClick={() => handleProductClick(item.product_id, item.variety_id)}>
                  <img 
                    src={item.imageUrl} 
                    alt={item.productName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveClick(item.product_id, item.variety_id);
                      }}
                      className="p-2 bg-white rounded-full shadow-md hover:bg-hippie-green-50 transition-colors"
                    >
                      <TbHeartFilled className="text-2xl text-hippie-green-600" />
                    </button>
                  </div>
                </div>
                
                <div className="p-3">
                  <h3 
                    className="text-base font-semibold text-gray-800 mb-1 line-clamp-1 cursor-pointer hover:text-hippie-green-600 transition-colors"
                    onClick={() => handleProductClick(item.product_id, item.variety_id)}
                  >
                    {item.productName}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{item.variety}</p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-bold text-gray-800">₹{item.price}</p>
                      <p className="text-xs text-gray-500 line-through">₹{item.mrp}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="px-2 py-1 bg-hippie-green-100 text-hippie-green-800 flex items-center gap-1 text-sm font-bold rounded-full">
                        <span>{item.rating}</span>
                        <FaStar className="text-xs" />
                      </div>
                      <span className="text-xs text-gray-600">({item.ratingCount})</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Remove Confirmation Modal */}
        {showRemoveConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Remove from Wishlist</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to remove this item from your wishlist?</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setShowRemoveConfirm(false);
                    setItemToRemove(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishList;