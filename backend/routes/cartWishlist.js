import express from 'express';
import admin from '../config/firebase-admin.js';
import User from '../models/Users.js';
import Product from '../models/Products.js';

const router = express.Router();

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Add item to cart
router.post('/cart/add', verifyToken, async (req, res) => {
    try {
        const { product_id, variety_id, option_id } = req.body;
        const uid = req.user.uid;

        // Find user
        const user = await User.findOne({ uid });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find product to validate
        const product = await Product.findById(product_id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Add new item to cart
        user.cart.push({ product_id, variety_id, option_id });
        await user.save();
        res.json({ message: 'Item added to cart successfully' });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Error adding to cart', error: error.message });
    }
});


// Get cart items with details
router.get('/cart', verifyToken, async (req, res) => {
    try {
        const uid = req.user.uid;
        const user = await User.findOne({ uid }).populate({
            path: 'cart.product_id',
            select: 'productName varieties'
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('Raw cart items from user:', user.cart); // Debug log

        const cartItems = await Promise.all(user.cart.map(async (item) => {
            const product = item.product_id;
            const variety = product.varieties.find(v => v._id.toString() === item.variety_id.toString());
            const option = variety.options.find(o => o._id.toString() === item.option_id.toString());

            const cartItem = {
                cartItemId: item._id,
                product_id: item.product_id._id,
                variety_id: item.variety_id,
                option_id: item.option_id,
                productName: product.productName,
                variety: variety.title,
                option: option.label,
                price: option.price,
                mrp: option.mrp,
                imageUrl: variety.images[0]
            };

            console.log('Processed cart item:', cartItem); // Debug log
            return cartItem;
        }));

        console.log('Final cart items being sent:', cartItems); // Debug log
        res.json(cartItems);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Error fetching cart', error: error.message });
    }
});

// Add to wishlist
router.post('/wishlist/add', verifyToken, async (req, res) => {
    try {
        const { product_id, variety_id } = req.body;
        const uid = req.user.uid;

        const user = await User.findOne({ uid });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if already in wishlist
        const exists = user.wishlist.some(
            item => item.product_id.toString() === product_id &&
                item.variety_id.toString() === variety_id
        );

        if (exists) {
            return res.status(400).json({ message: 'Item already in wishlist' });
        }

        user.wishlist.push({ product_id, variety_id });
        await user.save();
        res.json({ message: 'Item added to wishlist successfully' });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ message: 'Error adding to wishlist', error: error.message });
    }
});

// Get wishlist items with details
router.get('/wishlist', verifyToken, async (req, res) => {
    try {
        const uid = req.user.uid;
        const user = await User.findOne({ uid }).populate({
            path: 'wishlist.product_id',
            select: 'productName varieties'
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const wishlistItems = await Promise.all(user.wishlist.map(async (item) => {
            const product = item.product_id;
            const variety = product.varieties.find(v => v._id.toString() === item.variety_id.toString());
            const option = variety.options[0]; // Get first option for display

            return {
                product_id: item.product_id._id,
                productName: product.productName,
                variety: variety.title,
                price: option.price,
                mrp: option.mrp,
                image: variety.images[0]
            };
        }));

        res.json(wishlistItems);
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ message: 'Error fetching wishlist', error: error.message });
    }
});

// Remove from wishlist
router.delete('/wishlist/remove', verifyToken, async (req, res) => {
    try {
        const { product_id, variety_id } = req.body;
        const uid = req.user.uid;

        const user = await User.findOne({ uid });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.wishlist = user.wishlist.filter(
            item => !(item.product_id.toString() === product_id &&
                item.variety_id.toString() === variety_id)
        );

        await user.save();
        res.json({ message: 'Item removed from wishlist successfully' });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ message: 'Error removing from wishlist', error: error.message });
    }
});

export default router; 