import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/authContext';
import LoginPrompt from '../components/LoginPrompt';
import Navbar from '../components/Navbar';
import OrderDetails from '../components/OrderDetails';
import axios from 'axios';
import { FaMapMarkerAlt, FaShoppingBag, FaRupeeSign, FaStar, FaRegStar, FaTruck, FaCreditCard } from 'react-icons/fa';
import { MdEmail, MdPhone } from 'react-icons/md';
import { FiEdit, FiTrash2, FiPlus, FiLogOut, FiX } from 'react-icons/fi';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Dropdown from '../components/CustomDropdown';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const Profile = () => {
    const { user, accessToken } = useAuth();
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [stateCity, setStateCity] = useState([]);
    const [stateList, setStateList] = useState([]);
    const [cityList, setCityList] = useState([]);
    const [selectedState, setSelectedState] = useState(null);
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetails, setShowOrderDetails] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    
    const [showCancelPopup, setShowCancelPopup] = useState(false);
    const [showRefundPopup, setShowRefundPopup] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [refundReason, setRefundReason] = useState('');
    const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            setShowLoginPrompt(true);
        } else {
            fetchUserDetails();
            fetchOrders();
        }
    }, [user]);

    useEffect(() => {
        console.log("orders", orders)
    },[orders])

    useEffect(() => {
        console.log("selectedOrder", selectedOrder)
    },[selectedOrder])

    useEffect(() => {
        const fetchStateData = async () => {
            try {
                const response = await fetch("/states-and-districts.json");
                const result = await response.json();
                setStateCity(result.states);
                setStateList(result.states.map((item) => item.state));
            } catch (error) {
                console.error("Error fetching state list:", error);
            }
        };
        fetchStateData();
    }, []);

    useEffect(() => {
        if (selectedState) {
            const tempList = stateCity.find((item) => selectedState === item.state)?.districts;
            setCityList(tempList || []);
        }
    }, [selectedState]);

    const fetchUserDetails = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/user/me`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            setUserDetails(response.data.user);
        } catch (error) {
            setError('Error fetching user details');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/user/order/orders`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            if (response.data.success) {
                const flattenedOrders = response.data.orders.flatMap(order => 
                    order.items.map(item => ({
                        orderId: order._id,
                        createdAt: order.createdAt,
                        totalAmount: order.totalAmount,
                        paymentStatus: order.paymentStatus,
                        paymentMethod: order.paymentMethod,
                        shippingAddress: order.shippingAddress,
                        item: {
                            _id: item._id,
                            productName: item.productName,
                            varietyTitle: item.varietyTitle,
                            optionLabel: item.optionLabel,
                            price: item.price,
                            image: item.image,
                            status: item.status,
                            rating: item.rating,
                            refundStatus: item.refundStatus,
                            storeName: item.storeName,
                            productType: item.productType
                        }
                    }))
                );
                setOrders(flattenedOrders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setOrdersLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${import.meta.env.VITE_SERVER_URL}/user/address/${id}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            fetchUserDetails();
        } catch (error) {
            setError('Error deleting address');
            console.error('Error:', error);
        }
    };

    const handleEdit = (address) => {
        setEditingId(address._id);
        setSelectedState(address.state);
        formik.setValues({
            label: address.label,
            lane: address.lane,
            state: address.state,
            city: address.city,
            pinCode: address.pinCode
        });
        setShowForm(true);
    };

    const validationSchema = Yup.object({
        label: Yup.string().required('Label is required'),
        lane: Yup.string().required('Address is required'),
        state: Yup.string().required('State is required'),
        city: Yup.string().required('City is required'),
        pinCode: Yup.string()
            .matches(/^[0-9]{6}$/, 'Enter a valid 6-digit pincode')
            .required('Pincode is required'),
    });

    const formik = useFormik({
        initialValues: {
            label: '',
            lane: '',
            state: '',
            city: '',
            pinCode: ''
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                if (editingId) {
                    await axios.put(
                        `${import.meta.env.VITE_SERVER_URL}/user/address/${editingId}`,
                        values,
                        {
                            headers: {
                                Authorization: `Bearer ${accessToken}`
                            }
                        }
                    );
                } else {
                    await axios.post(
                        `${import.meta.env.VITE_SERVER_URL}/user/address`,
                        values,
                        {
                            headers: {
                                Authorization: `Bearer ${accessToken}`
                            }
                        }
                    );
                }
                fetchUserDetails();
                setShowForm(false);
                setEditingId(null);
                formik.resetForm();
            } catch (error) {
                setError('Error saving address');
                console.error('Error:', error);
            }
        }
    });

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered':
                return 'text-green-600 bg-green-50';
            case 'Processing':
                return 'text-blue-600 bg-blue-50';
            case 'Shipped':
                return 'text-purple-600 bg-purple-50';
            case 'Cancelled':
                return 'text-red-600 bg-red-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const handleRateProduct = async (orderId, itemId, rating) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_SERVER_URL}/user/order/${orderId}/item/${itemId}/rate`,
                { rating },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );
            if (response.data.success) {
                setOrders(orders.map(order => 
                    order.orderId === orderId && order.item._id === itemId 
                        ? { ...order, item: { ...order.item, rating } }
                        : order
                ));
                setShowOrderDetails(false);
                setRating(0);
            }
        } catch (error) {
            console.error('Error rating product:', error);
        }
    };

    const handleCancelOrder = async () => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_SERVER_URL}/user/order/${selectedOrder.orderId}/item/${selectedOrder._id}/cancel`,
                { reason: cancelReason },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );
            if (response.data.success) {
                setOrders(orders.map(order => 
                    order._id === selectedOrder._id ? { ...order, status: 'Cancelled' } : order
                ));
                setShowCancelPopup(false);
                setShowOrderDetails(false);
                setCancelReason('');
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
        }
    };

    const handleRefundRequest = async () => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_SERVER_URL}/user/order/${selectedOrder.orderId}/item/${selectedOrder._id}/refund`,
                { reason: refundReason },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );
            if (response.data.success) {
                setOrders(orders.map(order => 
                    order._id === selectedOrder._id ? { ...order, refundStatus: 'Pending' } : order
                ));
                setShowRefundPopup(false);
                setShowOrderDetails(false);
                setRefundReason('');
            }
        } catch (error) {
            console.error('Error requesting refund:', error);
        }
    };

    const handleOrderClick = async (orderId, itemId) => {
        try {
            setOrderDetailsLoading(true);
            const response = await axios.get(
                `${import.meta.env.VITE_SERVER_URL}/user/order/item/${itemId}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );
            if (response.data.success) {
                setSelectedOrder(response.data.order);
                setShowOrderDetails(true);
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
        } finally {
            setOrderDetailsLoading(false);
        }
    };

    const renderStars = (rating, interactive = false, size = 'text-lg') => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        className={`${size} cursor-pointer ${
                            interactive
                                ? 'hover:scale-110 transition-transform'
                                : ''
                        } ${
                            star <= (interactive ? hoverRating : rating)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                        }`}
                        onClick={() => interactive && setRating(star)}
                        onMouseEnter={() => interactive && setHoverRating(star)}
                        onMouseLeave={() => interactive && setHoverRating(0)}
                    >
                        {star <= (interactive ? hoverRating : rating) ? (
                            <FaStar />
                        ) : (
                            <FaRegStar />
                        )}
                    </span>
                ))}
            </div>
        );
    };

    const renderOrders = () => {
        if (ordersLoading) {
            return (
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hippie-green-600"></div>
                </div>
            );
        }

        if (orders.length === 0) {
            return (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <FaShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Your order history will appear here.</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {orders.map((order, index) => (
                    <div
                        key={index}
                        className="border border-gray-100 p-5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => handleOrderClick(order.orderId, order.item._id)}
                    >
                        <div className="flex items-start gap-4">
                            <div className="h-20 w-20 rounded-lg bg-white flex items-center justify-center">
                                <img
                                    src={order.item.image}
                                    alt={order.item.productName}
                                    className="h-16 w-16 object-contain"
                                />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-medium text-gray-900">{order.item.productName}</h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {order.item.varietyTitle} - {order.item.optionLabel}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Ordered on {formatDate(order.createdAt)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-900">
                                            <FaRupeeSign className="inline-block h-3 w-3" />
                                            {order.item.price}
                                        </p>
                                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.item.status)}`}>
                                            {order.item.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (!user) {
        return (
            <>
                <Navbar />
                <LoginPrompt isOpen={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
            </>
        );
    }

    return (
        <div className="bg-gray-50">
            <Navbar showWishlist={true}/>
            <div className="w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 pt-16 sm:pt-20">
                {userDetails && (
                    <div className="w-full lg:h-[85vh] grid grid-cols-1 lg:grid-cols-[30fr_70fr] gap-4 sm:gap-6 md:gap-8">
                        {/* Left: Profile & Addresses */}
                        <div className="w-full h-full flex flex-col">
                            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 relative flex flex-col h-full">
                                <button 
                                    onClick={() => setShowLogoutPopup(true)} 
                                    title='Log Out' 
                                    className='absolute top-6 right-6 flex items-center justify-center gap-2 p-2.5 border-2 border-red-300 text-md bg-red-50 rounded-xl font-semibold text-red-500 hover:bg-red-100 transition-colors'
                                >
                                    <FiLogOut className='text-lg' />
                                </button>
                                
                                <div className="flex flex-col items-center gap-6">
                                    <div className="h-32 w-32 rounded-full bg-gradient-to-br from-hippie-green-100 to-hippie-green-200 flex items-center justify-center shadow-inner">
                                        <span className="text-6xl font-bold text-hippie-green-600">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="flex flex-col items-center gap-3 text-center">
                                        <h1 className="text-2xl font-bold text-gray-900">{userDetails.name}</h1>
                                        <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
                                            <MdEmail className="text-xl" />
                                            <p className="font-medium">{userDetails.email}</p>
                                        </div>
                                        {userDetails.phone ? (
                                            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                                                <MdPhone className="text-xl text-gray-700" />
                                                <p className="text-gray-700 font-medium">+91 {userDetails.phone}</p>
                                            </div>
                                        ) : (
                                            <button className="flex items-center gap-2 text-hippie-green-600 hover:text-hippie-green-700 bg-hippie-green-50 px-4 py-2 rounded-lg transition-colors">
                                                <MdPhone className="text-xl" />
                                                <span className="font-medium">Add Phone Number</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className='w-full border-t border-gray-200 mt-6'></div>

                                <div className="mt-6 flex-1 flex flex-col min-h-0">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-gray-900">Addresses</h2>
                                        <button
                                            onClick={() => {
                                                setShowForm(true);
                                                setEditingId(null);
                                            }}
                                            className="flex items-center gap-2 text-sm text-white bg-hippie-green-600 hover:bg-hippie-green-700 px-4 py-2 rounded-lg transition-colors"
                                        >
                                            <FiPlus className="text-lg" /> Add New
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto pr-2 max-h-[30vh] lg:max-h-[28vh]">
                                        <div className="flex flex-col gap-4">
                                            {userDetails.addresses?.length > 0 ? (
                                                userDetails.addresses.map((addr) => (
                                                    <div key={addr._id} className="border border-gray-100 p-5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <p className="font-bold text-lg text-gray-900">{addr.label}</p>
                                                            <div className='flex items-center gap-3'>
                                                                <button 
                                                                    onClick={() => handleEdit(addr)}
                                                                    className="p-2 text-gray-600 hover:text-hippie-green-600 hover:bg-white rounded-lg transition-colors"
                                                                >
                                                                    <FiEdit className="text-lg" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => {
                                                                        setDeleteId(addr._id);
                                                                        setShowDeletePopup(true);
                                                                    }}
                                                                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                                                                >
                                                                    <FiTrash2 className="text-lg" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <p className="text-gray-700 mb-1">{addr.lane}</p>
                                                        <p className="text-gray-600">{`${addr.city}, ${addr.state} - ${addr.pinCode}`}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                    <FaMapMarkerAlt className="mx-auto h-12 w-12 text-gray-400" />
                                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No addresses</h3>
                                                    <p className="mt-1 text-sm text-gray-500">Get started by adding a new address.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Orders */}
                        <div className="w-full h-full">
                            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 h-full flex flex-col">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Orders</h2>
                                <div className="flex-1 overflow-y-auto max-h-[calc(100vh-200px)] sm:max-h-[calc(100vh-250px)]">
                                    {renderOrders()}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Logout Confirmation Popup */}
            {showLogoutPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-2xl shadow-xl w-[90%] max-w-sm text-center">
                        <h2 className="text-2xl font-bold mb-4">Confirm Logout</h2>
                        <p className="mb-8 text-gray-600">Are you sure you want to log out?</p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 text-white px-6 py-2.5 rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                                Logout
                            </button>
                            <button
                                onClick={() => setShowLogoutPopup(false)}
                                className="border border-gray-300 px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Address Confirmation Popup */}
            {showDeletePopup && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-2xl shadow-xl w-[90%] max-w-sm text-center">
                        <h2 className="text-2xl font-bold mb-4">Delete Address</h2>
                        <p className="mb-8 text-gray-600">Are you sure you want to delete this address?</p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={async () => {
                                    await handleDelete(deleteId);
                                    setShowDeletePopup(false);
                                }}
                                className="bg-red-600 text-white px-6 py-2.5 rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => {
                                    setShowDeletePopup(false);
                                    setDeleteId(null);
                                }}
                                className="border border-gray-300 px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Address Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-2xl font-bold">
                                {editingId ? 'Edit Address' : 'Add Address'}
                            </h3>
                        </div>
                        
                        <div className="overflow-y-auto flex-1">
                            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-6 p-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
                                    <input
                                        type="text"
                                        name="label"
                                        placeholder="Label (e.g., Home)"
                                        value={formik.values.label}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-hippie-green-500 focus:border-transparent transition-all"
                                    />
                                    {formik.touched.label && formik.errors.label && (
                                        <p className="text-sm text-red-500 mt-1">{formik.errors.label}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                    <textarea
                                        name="lane"
                                        rows={3}
                                        placeholder="Full address"
                                        value={formik.values.lane}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-hippie-green-500 focus:border-transparent transition-all resize-none"
                                    />
                                    {formik.touched.lane && formik.errors.lane && (
                                        <p className="text-sm text-red-500 mt-1">{formik.errors.lane}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                                        <Dropdown
                                            options={stateList}
                                            selected={formik.values.state}
                                            onSelect={(value) => {
                                                setSelectedState(value);
                                                formik.setFieldValue("state", value);
                                            }}
                                        />
                                        {formik.touched.state && formik.errors.state && (
                                            <p className="text-sm text-red-500 mt-1">{formik.errors.state}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                        <Dropdown
                                            options={cityList}
                                            selected={formik.values.city}
                                            onSelect={(value) => formik.setFieldValue("city", value)}
                                        />
                                        {formik.touched.city && formik.errors.city && (
                                            <p className="text-sm text-red-500 mt-1">{formik.errors.city}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                                    <input
                                        type="text"
                                        name="pinCode"
                                        placeholder="Enter 6-digit pincode"
                                        value={formik.values.pinCode}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-hippie-green-500 focus:border-transparent transition-all"
                                    />
                                    {formik.touched.pinCode && formik.errors.pinCode && (
                                        <p className="text-sm text-red-500 mt-1">{formik.errors.pinCode}</p>
                                    )}
                                </div>

                                {error && <p className='text-center text-red-500 font-medium'>{error}</p>}
                            </form>
                        </div>

                        <div className="p-6 border-t border-gray-100">
                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    onClick={formik.handleSubmit}
                                    className="flex-1 bg-hippie-green-600 text-white py-3 rounded-lg hover:bg-hippie-green-700 active:scale-95 transition-all font-medium"
                                >
                                    {editingId ? 'Update' : 'Save'}
                                </button>
                                <button
                                    type="button"
                                    className="flex-1 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-all font-medium"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingId(null);
                                        formik.resetForm();
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Details Popup */}
            {showOrderDetails && (
                <OrderDetails
                    selectedOrder={selectedOrder}
                    setSelectedOrder={setSelectedOrder}
                    showOrderDetails={showOrderDetails}
                    setShowOrderDetails={setShowOrderDetails}
                    accessToken={accessToken}
                    onOrderUpdate={fetchOrders}
                />
            )}

            {/* Cancel Confirmation Popup */}
            {showCancelPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6">
                        <h3 className="text-xl font-bold mb-4">Cancel Order</h3>
                        <p className="text-gray-600 mb-4">Please provide a reason for cancellation:</p>
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Enter reason for cancellation..."
                            className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-hippie-green-500 focus:border-transparent"
                            rows={3}
                        />
                        <div className="flex gap-4">
                            <button
                                onClick={handleCancelOrder}
                                disabled={!cancelReason.trim()}
                                className={`flex-1 py-2 rounded-lg font-medium ${
                                    !cancelReason.trim()
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        : 'bg-red-600 text-white hover:bg-red-700'
                                }`}
                            >
                                Confirm Cancellation
                            </button>
                            <button
                                onClick={() => {
                                    setShowCancelPopup(false);
                                    setCancelReason('');
                                }}
                                className="flex-1 border border-gray-300 py-2 rounded-lg font-medium hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Refund Request Popup */}
            {showRefundPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6">
                        <h3 className="text-xl font-bold mb-4">Request Refund</h3>
                        <p className="text-gray-600 mb-4">Please provide a reason for refund:</p>
                        <textarea
                            value={refundReason}
                            onChange={(e) => setRefundReason(e.target.value)}
                            placeholder="Enter reason for refund..."
                            className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-hippie-green-500 focus:border-transparent"
                            rows={3}
                        />
                        <div className="flex gap-4">
                            <button
                                onClick={handleRefundRequest}
                                disabled={!refundReason.trim()}
                                className={`flex-1 py-2 rounded-lg font-medium ${
                                    !refundReason.trim()
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                Submit Request
                            </button>
                            <button
                                onClick={() => {
                                    setShowRefundPopup(false);
                                    setRefundReason('');
                                }}
                                className="flex-1 border border-gray-300 py-2 rounded-lg font-medium hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;