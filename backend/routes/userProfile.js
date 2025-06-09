import express from 'express';
import User from '../models/Users.js';
import { verifyToken } from '../services/firebaseAdmin.js';

const router = express.Router();

// Get user details using Firebase token
router.get('/me', verifyToken, async (req, res) => {
    try {
        const uid = req.user; // This comes from verifyToken middleware

        // Find user by uid, excluding cart
        const user = await User.findOne({ uid }).select('-cart');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'User details retrieved successfully',
            user
        });
    } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).json({ message: 'Error fetching user details' });
    }
});

// Register user
router.post('/register', async (req, res) => {
    try {
        const { name, email, uid } = req.body;

        // Validate required fields
        if (!uid) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { uid }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const user = new User({
            uid,
            name,
            email
        });

        // Save user
        await user.save();

        res.status(201).json({
            message: 'User registered successfully',
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: `Error registering user ${error}` });
    }
});

// Update phone number
router.put('/phone', verifyToken, async (req, res) => {
    try {
        const uid = req.user;
        const { phone } = req.body;

        const user = await User.findOneAndUpdate(
            { uid },
            { phone },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Phone number updated successfully', user });
    } catch (error) {
        console.error('Phone update error:', error);
        res.status(500).json({ message: 'Error updating phone number' });
    }
});

// Add new address
router.post('/address', verifyToken, async (req, res) => {
    try {
        const uid = req.user;
        const { label, lane, state, city, pinCode } = req.body;

        const user = await User.findOne({ uid });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.addresses.push({ label, lane, state, city, pinCode });
        await user.save();

        res.status(201).json({ message: 'Address added successfully', user });
    } catch (error) {
        console.error('Add address error:', error);
        res.status(500).json({ message: 'Error adding address' });
    }
});

// Update address
router.put('/address/:addressId', verifyToken, async (req, res) => {
    try {
        const uid = req.user;
        const { addressId } = req.params;
        const { label, lane, state, city, pinCode } = req.body;

        const user = await User.findOne({ uid });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const address = user.addresses.id(addressId);
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        address.label = label || address.label;
        address.lane = lane || address.lane;
        address.state = state || address.state;
        address.city = city || address.city;
        address.pinCode = pinCode || address.pinCode;

        await user.save();
        res.json({ message: 'Address updated successfully', user });
    } catch (error) {
        console.error('Update address error:', error);
        res.status(500).json({ message: 'Error updating address' });
    }
});

// Delete address
router.delete('/address/:addressId', verifyToken, async (req, res) => {
    try {
        const uid = req.user;
        const { addressId } = req.params;

        const user = await User.findOne({ uid });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.addresses.pull(addressId);
        await user.save();

        res.json({ message: 'Address deleted successfully', user });
    } catch (error) {
        console.error('Delete address error:', error);
        res.status(500).json({ message: 'Error deleting address' });
    }
});

// Get all addresses
router.get('/address', verifyToken, async (req, res) => {
    try {
        const uid = req.user;
        const user = await User.findOne({ uid });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ addresses: user.addresses });
    } catch (error) {
        console.error('Get addresses error:', error);
        res.status(500).json({ message: 'Error fetching addresses' });
    }
});

export default router;
