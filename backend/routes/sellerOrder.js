import express from 'express';
import Order from '../models/Order.js';
import { isAuthenticated, isSeller } from '../middleware/auth.js';

const router = express.Router();

// Get orders for a seller
router.get('/orders', isAuthenticated, isSeller, async (req, res) => {
    try {
        const orders = await Order.find({
            'items.sellerId': req.user._id
        })
        .populate('userId', 'name email')
        .populate('items.productId')
        .sort({ createdAt: -1 });

        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update order item status by seller
router.patch('/order/:orderId/item/:itemId/status', isAuthenticated, isSeller, async (req, res) => {
    try {
        const { orderId, itemId } = req.params;
        const { status } = req.body;

        const order = await Order.findOne({
            _id: orderId,
            'items.sellerId': req.user._id,
            'items._id': itemId
        });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order or item not found' });
        }

        const item = order.items.id(itemId);
        item.status = status;

        await order.save();
        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router; 