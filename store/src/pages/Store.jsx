import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { IoLogOutOutline, IoAddCircleOutline, IoTrashOutline } from "react-icons/io5";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const SERVER = import.meta.env.VITE_SERVER_URL;

const Store = () => {
    const [sellerDetails, setSellerDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sells, setSells] = useState([]);
    const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
    const [deletePopupData, setDeletePopupData] = useState({ isOpen: false, productId: null, productName: '' });
    const [productTypes, setProductTypes] = useState([]);
    const [selectedProductType, setSelectedProductType] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const { seller, isLoading, setSeller } = useAuth();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => {
        const fetchSellerDetails = async () => {
            try {
                const response = await axios.get(`${SERVER}/seller-auth/details`, {
                    headers: {
                        Authorization: `Bearer ${seller.token}`
                    }
                });

                setSellerDetails(response.data.seller);
            } catch (error) {
                console.error('Error fetching seller details:', error);
                setError('Failed to fetch seller details');
                if (error.response?.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        const fetchSells = async () => {
            try {
                const response = await axios.get(`${SERVER}/seller-auth/sells`, {
                    headers: {
                        Authorization: `Bearer ${seller.token}`
                    }
                });
                setSells(response.data.sells);
            } catch (error) {
                console.error('Error fetching sells:', error);
            }
        };

        if(seller && !isLoading) {
            fetchSellerDetails();
            fetchSells();
        }
    }, [seller, isLoading, navigate]);

    const fetchProductTypes = async () => {
        try {
            const response = await axios.get(`${SERVER}/product-types/product-names`);
            setProductTypes(response.data);
        } catch (error) {
            console.error('Error fetching product types:', error);
            setError('Failed to fetch product types');
        }
    };

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        setSeller(null);
        localStorage.removeItem('seller');
        navigate('/login');
    };

    const handleDeleteSell = async (productTypeId) => {
        try {
            await axios.delete(`${SERVER}/seller-auth/sells/${productTypeId}`, {
                headers: {
                    Authorization: `Bearer ${seller.token}`
                }
            });
            setSells(sells.filter(item => item._id !== productTypeId));
            setDeletePopupData({ isOpen: false, productId: null, productName: '' });
        } catch (error) {
            console.error('Error deleting sell:', error);
        }
    };

    const handleAddCategory = async () => {
        if (!selectedProductType) return;

        try {
            await axios.post(
                `${SERVER}/seller-auth/sells/add`,
                { productTypeId: selectedProductType },
                {
                    headers: {
                        Authorization: `Bearer ${seller.token}`
                    }
                }
            );
            
            const response = await axios.get(`${SERVER}/seller-auth/sells`, {
                headers: {
                    Authorization: `Bearer ${seller.token}`
                }
            });
            setSells(response.data.sells);
            setIsAddPopupOpen(false);
            setSelectedProductType(null);
            setSearchTerm('');
        } catch (error) {
            console.error('Error adding product type:', error);
            setError('Failed to add product type');
        }
    };

    const maskString = (str, visibleChars = 4) => {
        if (!str) return '';
        return str.slice(-visibleChars).padStart(str.length, '*');
    };

    const filteredProductTypes = productTypes.filter(type => 
        type.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-hippie-green-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hippie-green-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-hippie-green-50">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    if (!sellerDetails) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-hippie-green-50'>
                <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
                    <h1 className='text-xl font-semibold'>No seller details found</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-hippie-green-50">
            <div className="w-full flex items-center justify-between px-5 md:px-10 py-2 bg-hippie-green-400 shadow-lg relative">
                <Link to="/home"><img src={"/logoName.png"} className="h-10" alt="" /></Link>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/20"
                    >
                        <span className="font-medium">Logout</span>
                        <IoLogOutOutline className="text-xl" />
                    </button>
                </div>
            </div>

            <div className="pt-10 pb-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="p-6 sm:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                {/* Profile Section */}
                                <div className="md:col-span-1 flex flex-col items-center space-y-4">
                                    <div className="w-40 h-40 rounded-full bg-hippie-green-500 flex items-center justify-center text-white text-6xl font-bold">
                                        {sellerDetails.fullname.charAt(0).toUpperCase()}
                                    </div>
                                    <h1 className="text-2xl font-bold text-hippie-green-900">{sellerDetails.fullname}</h1>
                                    <p className="text-hippie-green-700">{sellerDetails.storeName}</p>
                                    <div className="flex items-center space-x-1">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <svg
                                                    key={i}
                                                    className={`w-5 h-5 ${
                                                        i < Math.floor(sellerDetails.storeRating)
                                                            ? 'text-yellow-400'
                                                            : 'text-gray-300'
                                                    }`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <span className="text-sm text-hippie-green-600">({sellerDetails.ratingCount} ratings)</span>
                                    </div>
                                </div>

                                {/* Details Section */}
                                <div className="md:col-span-3 space-y-6">
                                    {/* Contact Information */}
                                    <div>
                                        <h2 className="text-lg font-semibold text-hippie-green-900 mb-4">Contact Information</h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="flex items-center space-x-2">
                                                <svg className="w-5 h-5 text-hippie-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-hippie-green-800">{sellerDetails.email}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <svg className="w-5 h-5 text-hippie-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                <span className="text-hippie-green-800">{sellerDetails.phone}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-hippie-green-200"></div>

                                    {/* Store Information */}
                                    <div>
                                        <h2 className="text-lg font-semibold text-hippie-green-900 mb-4">Store Information</h2>
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <svg className="w-5 h-5 text-hippie-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                                <span className="text-hippie-green-800">{sellerDetails.storeName}</span>
                                            </div>
                                            {sellerDetails.storeAddress && (
                                                <div className="flex items-center space-x-2">
                                                    <svg className="w-5 h-5 text-hippie-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span className="text-hippie-green-800">{sellerDetails.storeAddress}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="border-t border-hippie-green-200"></div>

                                    {/* Address Information */}
                                    <div>
                                        <h2 className="text-lg font-semibold text-hippie-green-900 mb-4">Address</h2>
                                        <div className="space-y-1">
                                            <p className="text-hippie-green-800">{sellerDetails.address}</p>
                                            <p className="text-hippie-green-700">
                                                {sellerDetails.city}, {sellerDetails.state} - {sellerDetails.pincode}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="border-t border-hippie-green-200"></div>

                                    {/* Verification Details */}
                                    <div>
                                        <h2 className="text-lg font-semibold text-hippie-green-900 mb-4">Verification Details</h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="flex items-center space-x-2">
                                                <svg className="w-5 h-5 text-hippie-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                </svg>
                                                <span className="text-hippie-green-800">Aadhar: {maskString(sellerDetails.aadhar)}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <svg className="w-5 h-5 text-hippie-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                </svg>
                                                <span className="text-hippie-green-800">PAN: {maskString(sellerDetails.pan)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-hippie-green-200"></div>

                                    {/* Product Categories */}
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-lg font-semibold text-hippie-green-900">Product Categories</h2>
                                            <button 
                                                onClick={() => {
                                                    setIsAddPopupOpen(true);
                                                    fetchProductTypes();
                                                }}
                                                className="flex items-center gap-2 bg-hippie-green-500 hover:bg-hippie-green-600 text-white px-3 py-1 rounded-lg transition-colors"
                                            >
                                                <IoAddCircleOutline className="text-xl" />
                                                <span>Add Category</span>
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {sells.map((item) => (
                                                <div key={item._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative group">
                                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                        <button 
                                                            onClick={() => setDeletePopupData({
                                                                isOpen: true,
                                                                productId: item._id,
                                                                productName: item.name
                                                            })}
                                                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-md"
                                                        >
                                                            <IoTrashOutline />
                                                        </button>
                                                    </div>
                                                    <div className="aspect-square">
                                                        <img 
                                                            src={item.image} 
                                                            alt={item.name} 
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="p-4">
                                                        <h3 className="font-semibold text-lg text-hippie-green-800 mb-1">{item.name}</h3>
                                                        <p className="text-sm text-hippie-green-600 mb-2">{item.state}, {item.city}</p>
                                                        <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Category Popup */}
            {isAddPopupOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-hippie-green-800">Add Product Category</h2>
                            <button
                                onClick={() => {
                                    setIsAddPopupOpen(false);
                                    setSelectedProductType(null);
                                    setSearchTerm('');
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Product Type
                            </label>
                            <div className="relative">
                                <div
                                    className="flex justify-between items-center border border-hippie-green-400 rounded-lg py-2 px-3 cursor-pointer bg-hippie-green-50"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    <span>
                                        {selectedProductType
                                            ? productTypes.find(type => type._id === selectedProductType)?.name
                                            : "Select a product type"}
                                    </span>
                                    {isDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
                                </div>
                                {isDropdownOpen && (
                                    <div className="absolute left-0 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                                        <input
                                            type="text"
                                            className="w-full p-2 border-b border-gray-200 focus:outline-none"
                                            placeholder="Search..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <ul className="max-h-60 overflow-y-auto">
                                            {filteredProductTypes.map((type) => (
                                                <li
                                                    key={type._id}
                                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                                    onClick={() => {
                                                        setSelectedProductType(type._id);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                >
                                                    {type.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setIsAddPopupOpen(false);
                                    setSelectedProductType(null);
                                    setSearchTerm('');
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddCategory}
                                disabled={!selectedProductType}
                                className="px-4 py-2 bg-hippie-green-500 text-white rounded-md hover:bg-hippie-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Popup */}
            {deletePopupData.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-hippie-green-800">Confirm Deletion</h2>
                            <button
                                onClick={() => setDeletePopupData({ isOpen: false, productId: null, productName: '' })}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <p className="text-gray-700 mb-6">
                            Are you sure you want to remove <span className="font-semibold">{deletePopupData.productName}</span> from your product categories?
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeletePopupData({ isOpen: false, productId: null, productName: '' })}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteSell(deletePopupData.productId)}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Logout Confirmation Popup */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                                <IoLogOutOutline className="text-3xl text-red-500" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Confirm Logout</h3>
                                <p className="text-gray-600">Are you sure you want to logout from your account?</p>
                            </div>
                            <div className="flex gap-4 w-full">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmLogout}
                                    className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <IoLogOutOutline />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Store;