import React, { useState } from 'react';
import { FaShoppingBag, FaTruck, FaStar, FaRegStar } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';
import axios from 'axios';

const OrderDetails = ({ 
    selectedOrder, 
    setSelectedOrder, 
    showOrderDetails, 
    setShowOrderDetails, 
    accessToken,
    onOrderUpdate 
}) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
    const [showCancelPopup, setShowCancelPopup] = useState(false);
    const [showRefundPopup, setShowRefundPopup] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [refundReason, setRefundReason] = useState('');

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
                onOrderUpdate();
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
                `${import.meta.env.VITE_SERVER_URL}/user/order/${selectedOrder._id}/item/${selectedOrder.item._id}/cancel`,
                { reason: cancelReason },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );
            if (response.data.success) {
                onOrderUpdate();
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
                `${import.meta.env.VITE_SERVER_URL}/user/order/${selectedOrder._id}/item/${selectedOrder.item._id}/refund`,
                { reason: refundReason },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );
            if (response.data.success) {
                onOrderUpdate();
                setShowRefundPopup(false);
                setShowOrderDetails(false);
                setRefundReason('');
            }
        } catch (error) {
            console.error('Error requesting refund:', error);
        }
    };

    if (!selectedOrder || !selectedOrder.item) return null;

    const showRatingSection = selectedOrder.item.status === 'Delivered';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-[95%] max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-xl sm:text-2xl font-bold">Order Details</h3>
                    <button
                        onClick={() => {
                            setShowOrderDetails(false);
                            setSelectedOrder(null);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <FiX className="text-xl" />
                    </button>
                </div>

                {orderDetailsLoading ? (
                    <div className="flex-1 flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hippie-green-600"></div>
                    </div>
                ) : (
                    <div className="overflow-y-auto flex-1 p-4 sm:p-6">
                        {/* Product Details */}
                        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                            <div className="w-full sm:w-32 h-32 rounded-lg bg-gray-50 flex items-center justify-center">
                                <img
                                    src={selectedOrder.item.image}
                                    alt={selectedOrder.item.productName}
                                    className="h-24 w-24 object-contain"
                                />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg sm:text-xl font-bold text-gray-900">{selectedOrder.item.productName}</h4>
                                <p className="text-gray-600 mt-1">
                                    {selectedOrder.item.varietyTitle} - {selectedOrder.item.optionLabel}
                                </p>
                                <div className="mt-2 space-y-1">
                                    <p className="text-gray-600">
                                        <span className="font-medium">Store:</span> {selectedOrder.item.storeName}
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-medium">Product Type:</span> {selectedOrder.item.productType}
                                    </p>
                                </div>
                                <div className="mt-4 space-y-2">
                                    <p className="text-gray-600">
                                        <span className="font-medium">Price:</span> ₹{selectedOrder.item.price}
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-medium">Status:</span>{' '}
                                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.item.status)}`}>
                                            {selectedOrder.item.status}
                                        </span>
                                    </p>
                                    {showRatingSection && (
                                        <div className="mt-4">
                                            <h4 className="font-medium text-gray-900 mb-2">
                                                {selectedOrder.item.rating > 0 ? 'Your Rating:' : 'Rate this product:'}
                                            </h4>
                                            <div className="flex items-center gap-4">
                                                {renderStars(selectedOrder.item.rating || 0, !selectedOrder.item.rating, 'text-2xl')}
                                                {!selectedOrder.item.rating && rating > 0 && (
                                                    <button
                                                        onClick={() => handleRateProduct(selectedOrder._id, selectedOrder.item._id, rating)}
                                                        className="px-4 py-2 rounded-lg font-medium bg-hippie-green-600 text-white hover:bg-hippie-green-700 transition-colors"
                                                    >
                                                        Submit Rating
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Order Information */}
                        <div className="mt-8 bg-gray-50 p-4 rounded-xl">
                            <div className="flex items-center gap-2 mb-3">
                                <FaShoppingBag className="text-hippie-green-600" />
                                <h4 className="font-medium text-gray-900">Order Information</h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <p className="text-gray-600">
                                        <span className="font-medium">Order Date:</span>
                                    </p>
                                    <p className="text-gray-900">{formatDate(selectedOrder.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">
                                        <span className="font-medium">Total Amount:</span>
                                    </p>
                                    <p className="text-gray-900">₹{selectedOrder.totalAmount}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">
                                        <span className="font-medium">Payment Method:</span>
                                    </p>
                                    <p className="text-gray-900">{selectedOrder.paymentMethod}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">
                                        <span className="font-medium">Payment Status:</span>
                                    </p>
                                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                                        selectedOrder.paymentMethod === 'COD' 
                                            ? selectedOrder.paymentStatus === 'Paid' 
                                                ? 'text-green-600 bg-green-50' 
                                                : 'text-yellow-600 bg-yellow-50'
                                            : 'text-green-600 bg-green-50'
                                    }`}>
                                        {selectedOrder.paymentMethod === 'COD' ? selectedOrder.paymentStatus : 'Paid'}
                                    </span>
                                </div>
                                {selectedOrder.item.refundStatus !== 'Not Applicable' && (
                                    <div className="sm:col-span-2">
                                        <p className="text-gray-600">
                                            <span className="font-medium">Refund Status:</span>
                                        </p>
                                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                                            selectedOrder.item.refundStatus === 'Pending' 
                                                ? 'text-yellow-600 bg-yellow-50'
                                                : 'text-green-600 bg-green-50'
                                        }`}>
                                            {selectedOrder.item.refundStatus}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Delivery Information */}
                        <div className="mt-6 bg-gray-50 p-4 rounded-xl">
                            <div className="flex items-center gap-2 mb-3">
                                <FaTruck className="text-hippie-green-600" />
                                <h4 className="font-medium text-gray-900">Delivery Information</h4>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-gray-600">
                                        <span className="font-medium">Shipping Address:</span>
                                    </p>
                                    <div className="bg-white p-3 rounded-lg mt-1">
                                        <p className="font-medium text-gray-900">{selectedOrder.shippingAddress.label}</p>
                                        <p className="text-gray-600">{selectedOrder.shippingAddress.lane}</p>
                                        <p className="text-gray-600">
                                            {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pinCode}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 space-y-3">
                            {selectedOrder.item.status === 'Placed' && (
                                <button
                                    onClick={() => setShowCancelPopup(true)}
                                    className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
                                >
                                    Cancel Order
                                </button>
                            )}

                            {selectedOrder.item.status === 'Delivered' && selectedOrder.item.refundStatus === 'Not Applicable' && (
                                <button
                                    onClick={() => setShowRefundPopup(true)}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Request Refund
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

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

export default OrderDetails; 