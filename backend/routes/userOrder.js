import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Products.js';
import User from '../models/Users.js';
import { verifyToken } from '../services/firebaseAdmin.js';

const router = express.Router();

// Create a new order
router.post('/create', verifyToken, async (req, res) => {
    try {
        const {
            items,
            shippingAddress,
            paymentMethod,
            totalAmount
        } = req.body;

        // Find user by Firebase UID
        const user = await User.findOne({ uid: req.user });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Validate items
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: `Product not found: ${item.productId}`
                });
            }

            // Validate variety and option
            const variety = product.varieties.find(v => v._id.toString() === item.varietyId);
            if (!variety) {
                return res.status(400).json({
                    success: false,
                    message: `Variety not found for product: ${item.productId}`
                });
            }

            const option = variety.options.find(o => o._id.toString() === item.optionId);
            if (!option) {
                return res.status(400).json({
                    success: false,
                    message: `Option not found for variety: ${item.varietyId}`
                });
            }

            // Validate quantity
            if (option.quantity < 1) {
                return res.status(400).json({
                    success: false,
                    message: `Product out of stock: ${item.productId}`
                });
            }

            // Add product details to item
            item.productName = product.productName;
            item.sellerId = product.seller_id;
            item.price = option.price;
            item.mrp = option.mrp;
            item.image = variety.images[0];
        }

        const order = new Order({
            userId: user._id, // Use MongoDB _id instead of Firebase UID
            items,
            shippingAddress,
            paymentMethod,
            totalAmount,
            paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid' // Set payment status based on payment method
        });

        await order.save();

        // Update product quantities
        for (const item of items) {
            await Product.updateOne(
                {
                    _id: item.productId,
                    'varieties._id': item.varietyId,
                    'varieties.options._id': item.optionId
                },
                {
                    $inc: {
                        'varieties.$[v].options.$[o].quantity': -1
                    }
                },
                {
                    arrayFilters: [
                        { 'v._id': item.varietyId },
                        { 'o._id': item.optionId }
                    ]
                }
            );
        }

        res.status(201).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get order details by item ID
router.get('/item/:itemId', verifyToken, async (req, res) => {
    try {
        // Find user by Firebase UID
        const user = await User.findOne({ uid: req.user });
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        const order = await Order.findOne({
            'items._id': req.params.itemId,
            userId: user._id
        })
        .populate({
            path: 'items.productId',
            select: 'productName productType',
            populate: {
                path: 'productType',
                select: 'name'
            }
        })
        .populate({
            path: 'items.sellerId',
            select: 'storeName'
        });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order item not found' });
        }

        const item = order.items.id(req.params.itemId);
        
        // Format the response with only necessary details
        const formattedOrder = {
            _id: order._id,
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
                storeName: item.sellerId?.storeName || 'Unknown Store',
                productType: item.productId?.productType?.name || 'Unknown Type'
            }
        };

        res.status(200).json({ 
            success: true, 
            order: formattedOrder
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all orders with necessary details
router.get('/orders', verifyToken, async (req, res) => {
    try {
        // Find user by Firebase UID
        const user = await User.findOne({ uid: req.user });
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        const orders = await Order.find({ userId: user._id })
            .select('items._id items.productName items.image items.price items.varietyTitle items.optionLabel items.status items.rating totalAmount createdAt paymentStatus paymentMethod shippingAddress')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Cancel an order item
router.post('/order/:orderId/item/:itemId/cancel', verifyToken, async (req, res) => {
    try {
        const { orderId, itemId } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Cancellation reason is required'
            });
        }

        // Find user by Firebase UID
        const user = await User.findOne({ uid: req.user });
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        const order = await Order.findOne({
            _id: orderId,
            userId: user._id,
            'items._id': itemId
        });

        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order or item not found' 
            });
        }

        const item = order.items.id(itemId);
        
        // Check if the order can be cancelled
        if (item.status !== 'Placed') {
            return res.status(400).json({ 
                success: false, 
                message: 'Only placed orders can be cancelled' 
            });
        }

        // Update order item status and reason
        item.status = 'Cancelled';
        item.cancellationReason = reason;
        await order.save();

        res.status(200).json({ 
            success: true, 
            message: 'Order cancelled successfully',
            order 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Request refund for an order item
router.post('/order/:orderId/item/:itemId/refund', verifyToken, async (req, res) => {
    try {
        const { orderId, itemId } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Refund reason is required'
            });
        }

        // Find user by Firebase UID
        const user = await User.findOne({ uid: req.user });
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        const order = await Order.findOne({
            _id: orderId,
            userId: user._id,
            'items._id': itemId
        });

        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order or item not found' 
            });
        }

        const item = order.items.id(itemId);
        
        // Check if the order can be refunded
        if (item.status !== 'Delivered') {
            return res.status(400).json({ 
                success: false, 
                message: 'Only delivered orders can be refunded' 
            });
        }

        // Update refund status and reason
        item.refundStatus = 'Pending';
        item.refundReason = reason;
        await order.save();

        res.status(200).json({ 
            success: true, 
            message: 'Refund request submitted successfully',
            order 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Rate an order item
router.post('/order/:orderId/item/:itemId/rate', verifyToken, async (req, res) => {
    try {
        const { orderId, itemId } = req.params;
        const { rating } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ 
                success: false, 
                message: 'Rating must be between 1 and 5' 
            });
        }

        // Find user by Firebase UID
        const user = await User.findOne({ uid: req.user });
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        const order = await Order.findOne({
            _id: orderId,
            userId: user._id,
            'items._id': itemId
        });

        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order or item not found' 
            });
        }

        const item = order.items.id(itemId);
        
        // Check if the order is delivered before allowing rating
        if (item.status !== 'Delivered') {
            return res.status(400).json({ 
                success: false, 
                message: 'Can only rate delivered items' 
            });
        }

        // Check if already rated
        if (item.rating > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Item has already been rated' 
            });
        }

        // Update order item rating
        item.rating = rating;
        await order.save();

        // Update product rating
        const product = await Product.findById(item.productId);
        if (product) {
            const newRatingCount = (product.ratingCount || 0) + 1;
            const newRating = ((product.rating || 0) * (product.ratingCount || 0) + rating) / newRatingCount;
            
            await Product.findByIdAndUpdate(item.productId, {
                rating: newRating,
                ratingCount: newRatingCount
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Rating updated successfully',
            order 
        });
    } catch (error) {
        console.error('Error updating rating:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error updating rating' 
        });
    }
});

export default router; 