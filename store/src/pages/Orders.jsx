import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaShoppingBag, FaTruck, FaCheckCircle, FaTimesCircle, FaRupeeSign, FaCalendarAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Orders = () => {
    const { seller, isLoading } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetails, setShowOrderDetails] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState({});
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [selectedRefundItem, setSelectedRefundItem] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    useEffect(() => {
        if (seller?.token && !isLoading) {
            fetchOrders();
        }
    }, [seller]);

    useEffect(() => {
        console.log("Orders", orders);
    }, [orders]);

    const fetchOrders = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_SERVER_URL}/order/orders`,
                {
                    headers: {
                        Authorization: `Bearer ${seller.token}`
                    }
                }
            );
            if (response.data.success) {
                setOrders(response.data.orders);
            }
        } catch (error) {
            setError('Error fetching orders');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderDetails = async (orderId, itemId) => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_SERVER_URL}/order/order/${orderId}/item/${itemId}`,
                {
                    headers: {
                        Authorization: `Bearer ${seller.token}`
                    }
                }
            );
            if (response.data.success) {
                setSelectedOrder(response.data.order);
                setShowOrderDetails(true);
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            showNotification('Failed to fetch order details. Please try again.', 'error');
        }
    };

    const handleUpdateStatus = async (orderId, itemId, newStatus) => {
        try {
            setUpdatingStatus({ [itemId]: true });
            const response = await axios.patch(
                `${import.meta.env.VITE_SERVER_URL}/order/order/${orderId}/item/${itemId}/status`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${seller.token}`
                    }
                }
            );
            if (response.data.success) {
                const order = response.data.order;
                let message = `Order status updated to ${newStatus}`;
                if (newStatus === 'Delivered' && order.paymentMethod === 'COD') {
                    message += ' and payment status updated to Paid';
                }
                showNotification(message, 'success');
                
                await fetchOrders();
                if (selectedOrder?._id === orderId) {
                    setSelectedOrder(response.data.order);
                }
            }
        } catch (error) {
            console.error('Error updating status:', error);
            showNotification(error.response?.data?.message || 'Failed to update order status. Please try again.', 'error');
        } finally {
            setUpdatingStatus({ [itemId]: false });
        }
    };

    const handleRefundAction = async (orderId, itemId, action) => {
        try {
            if (action === 'reject' && !rejectionReason) {
                showNotification('Please provide a reason for rejection', 'error');
                return;
            }

            const response = await axios.patch(
                `${import.meta.env.VITE_SERVER_URL}/order/order/${orderId}/item/${itemId}/refund`,
                { 
                    action,
                    rejectionReason: action === 'reject' ? rejectionReason : undefined
                },
                {
                    headers: {
                        Authorization: `Bearer ${seller.token}`
                    }
                }
            );

            if (response.data.success) {
                showNotification(response.data.message, 'success');
                setShowRefundModal(false);
                setRejectionReason('');
                await fetchOrders();
                if (selectedOrder?._id === orderId) {
                    setSelectedOrder(response.data.order);
                }
            }
        } catch (error) {
            console.error('Error handling refund:', error);
            showNotification(error.response?.data?.message || 'Failed to process refund request', 'error');
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

    const getRefundStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'text-yellow-600 bg-yellow-50';
            case 'Approved':
                return 'text-green-600 bg-green-50';
            case 'Rejected':
                return 'text-red-600 bg-red-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const renderRefundStatus = (order) => {
        if (order.refundStatus && order.refundStatus !== 'Not Applicable') {
            return (
                <div className="mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRefundStatusColor(order.refundStatus)}`}>
                        Refund: {order.refundStatus}
                    </span>
                    {order.refundStatus === 'Pending' && (
                        <div className="mt-2 flex gap-2">
                            <button
                                onClick={() => {
                                    setSelectedRefundItem({ orderId: order.orderId, itemId: order.itemId });
                                    setShowRefundModal(true);
                                }}
                                className="flex-1 bg-yellow-50 text-yellow-600 py-2 rounded-lg hover:bg-yellow-100 transition-colors font-medium"
                            >
                                Handle Refund
                            </button>
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    const renderRefundDetails = (item) => {
        if (item.refundStatus && item.refundStatus !== 'Not Applicable') {
            return (
                <div className="mt-4 bg-gray-50 p-4 rounded-xl">
                    <h5 className="font-medium text-gray-900 mb-2">Refund Details</h5>
                    <div className="space-y-2">
                        <p className="text-sm">
                            <span className="font-medium">Status:</span>{' '}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRefundStatusColor(item.refundStatus)}`}>
                                {item.refundStatus}
                            </span>
                        </p>
                        {item.refundReason && (
                            <p className="text-sm">
                                <span className="font-medium">Reason:</span> {item.refundReason}
                            </p>
                        )}
                        {item.refundRejectionReason && (
                            <p className="text-sm">
                                <span className="font-medium">Rejection Reason:</span> {item.refundRejectionReason}
                            </p>
                        )}
                        {item.refundStatus === 'Pending' && (
                            <div className="mt-4 flex gap-3">
                                <button
                                    onClick={() => handleRefundAction(selectedOrder._id, item._id, 'approve')}
                                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                                >
                                    Approve Refund
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedRefundItem({ orderId: selectedOrder._id, itemId: item._id });
                                        setShowRefundModal(true);
                                    }}
                                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                                >
                                    Reject Refund
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    };

    // Add this function to filter orders
    const getFilteredOrders = () => {
        if (activeFilter === 'all') return orders;
        if (activeFilter === 'refunded') {
            return orders.filter(order => 
                order.refundStatus && 
                order.refundStatus !== 'Not Applicable'
            );
        }
        return orders.filter(order => order.status === activeFilter);
    };

    // Function to show notification
    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 3000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hippie-green-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Notification Component */}
            {notification.show && (
                <div className={`fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center ${
                    notification.type === 'success' 
                        ? 'bg-green-100 border border-green-400 text-green-700' 
                        : 'bg-red-100 border border-red-400 text-red-700'
                }`}>
                    {notification.type === 'success' ? (
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    )}
                    <p>{notification.message}</p>
                </div>
            )}

            {/* Header */}
            <div className="w-full flex items-center justify-between px-5 md:px-10 py-2 bg-hippie-green-400 shadow-lg relative">
                <Link to="/home"><img src={"/logoName.png"} className="h-10" alt="" /></Link>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                    <div className="text-sm text-gray-500">
                        Total Orders: {getFilteredOrders().length}
                    </div>
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2 mb-6">
                    <button
                        onClick={() => setActiveFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activeFilter === 'all'
                                ? 'bg-hippie-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        All Orders
                    </button>
                    <button
                        onClick={() => setActiveFilter('Placed')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activeFilter === 'Placed'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Placed
                    </button>
                    <button
                        onClick={() => setActiveFilter('Shipped')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activeFilter === 'Shipped'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Shipped
                    </button>
                    <button
                        onClick={() => setActiveFilter('Delivered')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activeFilter === 'Delivered'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Delivered
                    </button>
                    <button
                        onClick={() => setActiveFilter('Cancelled')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activeFilter === 'Cancelled'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Cancelled
                    </button>
                    <button
                        onClick={() => setActiveFilter('refunded')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activeFilter === 'refunded'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Refunded
                    </button>
                </div>

                {/* Orders Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getFilteredOrders().map((order) => (
                        <div key={`${order.orderId}-${order.itemId}`} 
                             className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                            {/* Product Image */}
                            <div className="relative h-48 rounded-t-xl overflow-hidden">
                                <img
                                    src={order.image}
                                    alt={order.productName}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 right-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            {/* Product Details */}
                            <div className="p-4">
                                <h3 className="font-medium text-gray-900 text-lg mb-2">
                                    {order.productName}
                                </h3>
                                <p className="text-sm text-gray-600 mb-2">
                                    {order.varietyTitle} - {order.optionLabel}
                                </p>
                                
                                {/* Price and Date */}
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center text-gray-900">
                                        <FaRupeeSign className="h-4 w-4" />
                                        <span className="font-medium text-lg">{order.price}</span>
                                        {order.mrp > order.price && (
                                            <span className="ml-2 text-sm text-gray-500 line-through">
                                                <FaRupeeSign className="inline-block h-3 w-3" />
                                                {order.mrp}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center text-gray-500 text-sm">
                                        <FaCalendarAlt className="h-4 w-4 mr-1" />
                                        {formatDate(order.createdAt)}
                                    </div>
                                </div>

                                {/* Refund Status */}
                                {renderRefundStatus(order)}

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => fetchOrderDetails(order.orderId, order.itemId)}
                                        className="flex-1 bg-hippie-green-50 text-hippie-green-600 py-2 rounded-lg hover:bg-hippie-green-100 transition-colors font-medium"
                                    >
                                        View Details
                                    </button>
                                    {order.status === 'Placed' && (
                                        <button
                                            onClick={() => handleUpdateStatus(order.orderId, order.itemId, 'Shipped')}
                                            disabled={updatingStatus[order.itemId]}
                                            className={`flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium ${
                                                updatingStatus[order.itemId] ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                        >
                                            {updatingStatus[order.itemId] ? 'Updating...' : 'Ship'}
                                        </button>
                                    )}
                                    {order.status === 'Shipped' && (
                                        <button
                                            onClick={() => handleUpdateStatus(order.orderId, order.itemId, 'Delivered')}
                                            disabled={updatingStatus[order.itemId]}
                                            className={`flex-1 bg-green-50 text-green-600 py-2 rounded-lg hover:bg-green-100 transition-colors font-medium ${
                                                updatingStatus[order.itemId] ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                        >
                                            {updatingStatus[order.itemId] ? 'Updating...' : 'Deliver'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {orders.length === 0 && (
                    <div className="text-center py-12">
                        <FaShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by selling your products.</p>
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            {showOrderDetails && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold">Order Details</h3>
                                <button
                                    onClick={() => setShowOrderDetails(false)}
                                    className="text-2xl text-gray-400 hover:text-gray-600"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {selectedOrder.items.map((item) => (
                                <div key={item._id} className="mb-8 last:mb-0">
                                    <div className="flex items-start gap-4">
                                        <div className="h-24 w-24 rounded-lg bg-gray-100 flex items-center justify-center">
                                            <img
                                                src={item.image}
                                                alt={item.productName}
                                                className="h-20 w-20 object-contain"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{item.productName}</h4>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {item.varietyTitle} - {item.optionLabel}
                                            </p>
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
                                                    {item.status}
                                                </span>
                                                <span className="text-gray-600">
                                                    <FaRupeeSign className="inline-block h-3 w-3" />
                                                    {item.price}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Information */}
                                    <div className="mt-6 bg-gray-50 p-4 rounded-xl">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Order Date</p>
                                                <p className="font-medium">{formatDate(selectedOrder.createdAt)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Payment Method</p>
                                                <p className="font-medium">{selectedOrder.paymentMethod}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Payment Status</p>
                                                <p className="font-medium">{selectedOrder.paymentStatus}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Total Amount</p>
                                                <p className="font-medium">
                                                    <FaRupeeSign className="inline-block h-3 w-3" />
                                                    {selectedOrder.totalAmount}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Shipping Address */}
                                    <div className="mt-6 bg-gray-50 p-4 rounded-xl">
                                        <h5 className="font-medium text-gray-900 mb-2">Shipping Address</h5>
                                        <p className="text-gray-600">{selectedOrder.shippingAddress.lane}</p>
                                        <p className="text-gray-600">
                                            {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pinCode}
                                        </p>
                                    </div>

                                    {/* Refund Details */}
                                    {renderRefundDetails(item)}

                                    {/* Status Update Buttons */}
                                    <div className="mt-6 flex gap-3">
                                        {item.status === 'Placed' && (
                                            <button
                                                onClick={() => handleUpdateStatus(selectedOrder._id, item._id, 'Shipped')}
                                                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                            >
                                                Mark as Shipped
                                            </button>
                                        )}
                                        {item.status === 'Shipped' && (
                                            <button
                                                onClick={() => handleUpdateStatus(selectedOrder._id, item._id, 'Delivered')}
                                                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                                            >
                                                Mark as Delivered
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Refund Modal */}
            {showRefundModal && selectedRefundItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold">Reject Refund Request</h3>
                                <button
                                    onClick={() => {
                                        setShowRefundModal(false);
                                        setRejectionReason('');
                                    }}
                                    className="text-2xl text-gray-400 hover:text-gray-600"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for Rejection
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hippie-green-500 focus:border-hippie-green-500"
                                    rows="4"
                                    placeholder="Please provide a reason for rejecting this refund request..."
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowRefundModal(false);
                                        setRejectionReason('');
                                    }}
                                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleRefundAction(selectedRefundItem.orderId, selectedRefundItem.itemId, 'reject')}
                                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                                >
                                    Reject Refund
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;