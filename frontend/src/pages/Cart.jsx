import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { FaStar } from "react-icons/fa6";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useAuth } from '../contexts/authContext';
import LoginPrompt from '../components/LoginPrompt';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const Cart = () => {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);


  useEffect(() => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    const fetchCartItems = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${SERVER_URL}/regio-store/cart`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setCartItems(response.data);
      } catch (error) {
        console.error('Error fetching cart:', error);
        setError('Failed to load cart items');
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [user, accessToken]);

  const handleRemoveClick = (cartItemId) => {
    setItemToDelete(cartItemId);
    setShowDeleteConfirm(true);
  };

  const handleRemoveConfirm = async () => {
    if (!itemToDelete) return;

    try {
      await axios.delete(`${SERVER_URL}/regio-store/cart/remove/${itemToDelete}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setCartItems(items => items.filter(item => item.cartItemId !== itemToDelete));
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout', {
      state: {
        cartItems,
        totalMRP,
        totalPrice,
        totalDiscount
      }
    });
  };

  const totalMRP = cartItems.reduce((sum, item) => sum + item.mrp, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);
  const totalDiscount = totalMRP - totalPrice;

  if (!user) {
    return (
      <>
        <Navbar showProfile={true} showWishlist={true}/>
        <LoginPrompt isOpen={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
      </>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar showProfile={true} showWishlist={true}/>
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
        <Navbar showProfile={true} showWishlist={true}/>
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
        <Navbar showProfile={true} showWishlist={true}/>
        <div className="container mx-auto px-4 pt-24 pb-16">
        <h1 className="text-2xl md:text-3xl font-bold text-hippie-green-800 mb-6 md:mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Cart Items Section */}
          <div className="lg:col-span-2">
            {cartItems.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <h2 className="text-xl text-gray-600 mb-4">Your cart is empty</h2>
                <Link 
                  to="/" 
                  className="inline-block px-6 py-2 bg-hippie-green-600 text-white rounded-lg hover:bg-hippie-green-700 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.cartItemId} className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-3 md:p-4 flex flex-col sm:flex-row gap-3 md:gap-4">
                      <div className="w-full sm:w-32 h-32 flex-shrink-0">
                        <img 
                          src={item.imageUrl} 
                          alt={item.productName}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-grow">
                        <Link 
                          to={`/product/${item.product_id}/${item.variety_id}`}
                          className="text-base md:text-lg font-semibold text-gray-800 hover:text-hippie-green-600 transition-colors"
                        >
                          {item.productName}
                        </Link>
                        <p className="text-sm text-gray-600 mt-1">Variety: {item.variety}</p>
                        <p className="text-sm text-gray-600">Option: {item.option}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="px-2 py-1 bg-hippie-green-100 text-hippie-green-800 flex items-center gap-1 text-sm font-bold rounded-full">
                            <span>4.5</span>
                            <FaStar className="text-xs" />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col items-end justify-between sm:justify-between gap-2">
                        <button
                          onClick={() => handleRemoveClick(item.cartItemId)}
                          className="text-red-500 hover:text-red-600 transition-colors p-2"
                          aria-label="Remove item"
                        >
                          <RiDeleteBin6Line className="text-xl" />
                        </button>
                        <div className="text-right">
                          <p className="text-base md:text-lg font-bold text-gray-800">₹{item.price}</p>
                          <p className="text-sm text-gray-500 line-through">₹{item.mrp}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Price Summary Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6 sticky top-24">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Price Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Total MRP</span>
                  <span>₹{totalMRP}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Total Discount</span>
                  <span>-₹{totalDiscount}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-base md:text-lg font-semibold text-gray-800">
                    <span>Total Amount</span>
                    <span>₹{totalPrice}</span>
                  </div>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full mt-4 px-4 md:px-6 py-2 md:py-3 bg-hippie-green-600 text-white rounded-lg hover:bg-hippie-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                  disabled={cartItems.length === 0}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Remove Item</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to remove this item from your cart?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setItemToDelete(null);
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
  );
};

export default Cart;
