import express from 'express';
import Order from '../models/Order.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// JWT verification middleware
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.SELLER_JWT_SECRET);
        req.seller = { _id: decoded.id };
        next();
    } catch (error) {
        return res.status(401).json({ message: `Invalid token ${error}` });
    }
};

// Get orders for a seller
router.get('/orders', verifyToken, async (req, res) => {
    try {
        const orders = await Order.aggregate([
            {
                $match: {
                    'items.sellerId': mongoose.Types.ObjectId.createFromHexString(req.seller._id)
                }
            },
            {
                $unwind: '$items'
            },
            {
                $match: {
                    'items.sellerId': mongoose.Types.ObjectId.createFromHexString(req.seller._id)
                }
            },
            {
                $project: {
                    _id: 0,
                    orderId: '$_id',
                    createdAt: 1,
                    itemId: '$items._id',
                    productName: '$items.productName',
                    varietyTitle: '$items.varietyTitle',
                    optionLabel: '$items.optionLabel',
                    price: '$items.price',
                    mrp: '$items.mrp',
                    image: '$items.image',
                    status: '$items.status'
                }
            },
            {
                $sort: { createdAt: -1 }
            }
        ]);

        res.status(200).json({ 
            success: true, 
            orders 
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching orders' 
        });
    }
});

// Get detailed order information
router.get('/order/:orderId/item/:itemId', verifyToken, async (req, res) => {
    try {
        const { orderId, itemId } = req.params;
        
        const order = await Order.aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId.createFromHexString(orderId)
                }
            },
            {
                $unwind: '$items'
            },
            {
                $match: {
                    'items.sellerId': mongoose.Types.ObjectId.createFromHexString(req.seller._id),
                    'items._id': mongoose.Types.ObjectId.createFromHexString(itemId)
                }
            },
            {
                $group: {
                    _id: '$_id',
                    createdAt: { $first: '$createdAt' },
                    userId: { $first: '$userId' },
                    shippingAddress: { $first: '$shippingAddress' },
                    paymentMethod: { $first: '$paymentMethod' },
                    paymentStatus: { $first: '$paymentStatus' },
                    totalAmount: { $first: '$totalAmount' },
                    items: { $push: '$items' }
                }
            }
        ]);

        if (!order || order.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order or item not found'
            });
        }

        res.status(200).json({
            success: true,
            order: order[0]
        });
    } catch (error) {
        console.error('Get order details error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order details'
        });
    }
});

// Update order item status by seller
router.patch('/order/:orderId/item/:itemId/status', verifyToken, async (req, res) => {
    try {
        const { orderId, itemId } = req.params;
        const { status } = req.body;

        const order = await Order.findOne({
            _id: orderId,
            'items.sellerId': mongoose.Types.ObjectId.createFromHexString(req.seller._id),
            'items._id': itemId
        });

        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order or item not found' 
            });
        }

        const item = order.items.id(itemId);
        if (!item) {
            return res.status(404).json({ 
                success: false, 
                message: 'Item not found' 
            });
        }

        // Validate status transition
        const validTransitions = {
            'Placed': ['Shipped'],
            'Shipped': ['Delivered'],
            'Delivered': [],
            'Cancelled': []
        };

        if (!validTransitions[item.status].includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: `Cannot change status from ${item.status} to ${status}` 
            });
        }

        item.status = status;

        // If status is changed to Delivered and payment method is COD, update payment status
        if (status === 'Delivered' && order.paymentMethod === 'COD') {
            order.paymentStatus = 'Paid';
        }

        await order.save();

        res.status(200).json({ 
            success: true, 
            order 
        });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error updating order status' 
        });
    }
});

// Handle refund request
router.patch('/order/:orderId/item/:itemId/refund', verifyToken, async (req, res) => {
    try {
        const { orderId, itemId } = req.params;
        const { action, rejectionReason } = req.body;

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid action. Must be either approve or reject'
            });
        }

        const order = await Order.findOne({
            _id: orderId,
            'items.sellerId': mongoose.Types.ObjectId.createFromHexString(req.seller._id),
            'items._id': itemId
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order or item not found'
            });
        }

        const item = order.items.id(itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        if (item.refundStatus !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: 'No pending refund request for this item'
            });
        }

        if (action === 'approve') {
            item.refundStatus = 'Approved';
        } else {
            if (!rejectionReason) {
                return res.status(400).json({
                    success: false,
                    message: 'Rejection reason is required'
                });
            }
            item.refundStatus = 'Rejected';
            item.refundRejectionReason = rejectionReason;
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: `Refund ${action}ed successfully`,
            order
        });
    } catch (error) {
        console.error('Handle refund error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing refund request'
        });
    }
});

export default router; 