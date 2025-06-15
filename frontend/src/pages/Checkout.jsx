import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/authContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { FaMapMarkerAlt, FaRupeeSign, FaCheckCircle } from 'react-icons/fa';
import { FiPlus } from 'react-icons/fi';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Dropdown from '../components/CustomDropdown';
import PaymentPopup from '../components/PaymentPopup';

const Checkout = () => {
    const { user, accessToken } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [stateCity, setStateCity] = useState([]);
    const [stateList, setStateList] = useState([]);
    const [cityList, setCityList] = useState([]);
    const [selectedState, setSelectedState] = useState(null);
    const [showPayment, setShowPayment] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Get cart data from location state
    const { cartItems, totalMRP, totalPrice, totalDiscount } = location.state || {};

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (!location.state?.cartItems) {
            navigate('/cart');
            return;
        }
        fetchUserDetails();
        fetchStateData();
    }, [user, location.state]);

    useEffect(() => {
        if (selectedState) {
            const tempList = stateCity.find((item) => selectedState === item.state)?.districts;
            setCityList(tempList || []);
        }
    }, [selectedState]);

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
                await axios.post(
                    `${import.meta.env.VITE_SERVER_URL}/user/address`,
                    values,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    }
                );
                fetchUserDetails();
                setShowAddressForm(false);
                formik.resetForm();
            } catch (error) {
                setError('Error saving address');
                console.error('Error:', error);
            }
        }
    });

    useEffect(() => {
        console.log(cartItems)
    },[cartItems])

    const handlePaymentSuccess = async (paymentMethod) => {
        try {
            // Prepare order items from cart items
            const orderItems = cartItems.map(item => ({
                productId: item.product_id,
                varietyId: item.variety_id,
                optionId: item.option_id,
                varietyTitle: item.variety,
                optionLabel: item.option,
                productName: item.productName,
                price: item.price,
                mrp: item.mrp,
                image: item.imageUrl
            }));

            // Prepare order data
            const orderData = {
                items: orderItems,
                shippingAddress: selectedAddress,
                paymentMethod: paymentMethod,
                totalAmount: totalPrice
            };

            // Create order
            const response = await axios.post(
                `${import.meta.env.VITE_SERVER_URL}/user/order/create`,
                orderData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );

            if (response.data.success) {
                // Show success popup
                setShowSuccess(true);
                setShowPayment(false);

                // Navigate to profile page after 5 seconds
                setTimeout(() => {
                    navigate('/profile');
                }, 5000);
            }
        } catch (error) {
            console.error('Error creating order:', error);
            setError('Failed to create order. Please try again.');
            setShowPayment(false);
        }
    };

    // Add console logs for API testing
    useEffect(() => {
        if (cartItems) {
            console.log('Cart Items:', cartItems);
            console.log('Total MRP:', totalMRP);
            console.log('Total Price:', totalPrice);
            console.log('Total Discount:', totalDiscount);
        }
    }, [cartItems, totalMRP, totalPrice, totalDiscount]);

    useEffect(() => {
        if (selectedAddress) {
            console.log('Selected Address:', selectedAddress);
        }
    }, [selectedAddress]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hippie-green-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <Navbar />
            <div className="w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 pt-16 sm:pt-20">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-[60fr_40fr] gap-8">
                        {/* Left Column: Address Selection */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery Address</h2>
                                
                                <div className="max-h-[300px] overflow-y-auto pr-2">
                                    {userDetails?.addresses?.length > 0 ? (
                                        <div className="space-y-4">
                                            {userDetails.addresses.map((address) => (
                                                <div
                                                    key={address._id}
                                                    className={`border rounded-xl p-4 cursor-pointer transition-all ${
                                                        selectedAddress?._id === address._id
                                                            ? 'border-hippie-green-500 bg-hippie-green-50'
                                                            : 'border-gray-200 hover:border-hippie-green-300'
                                                    }`}
                                                    onClick={() => setSelectedAddress(address)}
                                                >
                                                    <p className="font-bold text-gray-900">{address.label}</p>
                                                    <p className="text-gray-700 mt-1">{address.lane}</p>
                                                    <p className="text-gray-600">{`${address.city}, ${address.state} - ${address.pinCode}`}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                            <FaMapMarkerAlt className="mx-auto h-12 w-12 text-gray-400" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No addresses</h3>
                                            <p className="mt-1 text-sm text-gray-500">Add an address to continue</p>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => setShowAddressForm(true)}
                                    className="mt-4 flex items-center gap-2 text-sm text-white bg-hippie-green-600 hover:bg-hippie-green-700 px-4 py-2 rounded-lg transition-colors"
                                >
                                    <FiPlus className="text-lg" /> Add New Address
                                </button>
                            </div>

                            {/* Order Summary */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
                                <div className="space-y-4">
                                    {cartItems?.map((item) => (
                                        <div key={item.cartItemId} className="flex items-center gap-4">
                                            <div className="h-20 w-20 rounded-lg bg-gray-100 flex items-center justify-center">
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.productName}
                                                    className="h-16 w-16 object-contain"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900">{item.productName}</h3>
                                                <p className="text-sm text-gray-600">{item.variety}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-gray-900">
                                                    <FaRupeeSign className="inline-block h-3 w-3" />
                                                    {item.price}
                                                </p>
                                                <p className="text-sm text-gray-500 line-through">
                                                    <FaRupeeSign className="inline-block h-3 w-3" />
                                                    {item.mrp}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Payment Summary */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 h-fit">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Summary</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Total MRP</span>
                                    <span><FaRupeeSign className="inline-block h-3 w-3" />{totalMRP}</span>
                                </div>
                                <div className="flex justify-between text-green-600">
                                    <span>Total Discount</span>
                                    <span>-<FaRupeeSign className="inline-block h-3 w-3" />{totalDiscount}</span>
                                </div>
                                <div className="border-t pt-3">
                                    <div className="flex justify-between font-bold text-gray-900">
                                        <span>Total Amount</span>
                                        <span><FaRupeeSign className="inline-block h-3 w-3" />{totalPrice}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowPayment(true)}
                                    disabled={!selectedAddress}
                                    className={`w-full py-3 rounded-lg font-medium transition-all ${
                                        selectedAddress
                                            ? 'bg-hippie-green-600 text-white hover:bg-hippie-green-700'
                                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    Pay <FaRupeeSign className="inline-block h-3 w-3" />{totalPrice}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Address Modal */}
            {showAddressForm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-2xl font-bold">Add New Address</h3>
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
                                    Save Address
                                </button>
                                <button
                                    type="button"
                                    className="flex-1 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-all font-medium"
                                    onClick={() => {
                                        setShowAddressForm(false);
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

            {/* Add PaymentPopup */}
            {showPayment && (
                <PaymentPopup
                    amount={totalPrice}
                    onClose={() => setShowPayment(false)}
                    onSuccess={handlePaymentSuccess}
                />
            )}

            {/* Success Popup */}
            {showSuccess && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-8 text-center transform transition-all duration-300 ease-in-out">
                        <div className="mb-6">
                            <FaCheckCircle className="mx-auto h-20 w-20 text-green-500 animate-bounce" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Order Placed Successfully!</h3>
                        <p className="text-gray-600 mb-6 text-lg">
                            Your order has been placed successfully. The product will be delivered within 3-5 business days.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-gray-500">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                            <p className="text-sm">Redirecting to profile page...</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout; 