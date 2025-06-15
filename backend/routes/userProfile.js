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
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        res.json({
            success: true,
            message: 'User details retrieved successfully',
            user
        });
    } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching user details' 
        });
    }
});

// Register user
router.post('/register', async (req, res) => {
    try {
        const { name, email, uid } = req.body;

        // Validate required fields
        if (!uid) {
            return res.status(400).json({ 
                success: false,
                message: 'User ID is required' 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { uid }] });
        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                message: 'User already exists' 
            });
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
            success: true,
            message: 'User registered successfully',
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false,
            message: `Error registering user ${error}` 
        });
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
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        res.json({ 
            success: true,
            message: 'Phone number updated successfully', 
            user 
        });
    } catch (error) {
        console.error('Phone update error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error updating phone number' 
        });
    }
});

// Add new address
router.post('/address', verifyToken, async (req, res) => {
    try {
        const uid = req.user;
        const { label, lane, state, city, pinCode } = req.body;

        // Validate required fields
        if (!label || !lane || !state || !city || !pinCode) {
            return res.status(400).json({
                success: false,
                message: 'All address fields are required'
            });
        }

        const user = await User.findOne({ uid });
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        user.addresses.push({ label, lane, state, city, pinCode });
        await user.save();

        res.status(201).json({ 
            success: true,
            message: 'Address added successfully', 
            user 
        });
    } catch (error) {
        console.error('Add address error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error adding address' 
        });
    }
});

// Update address
router.put('/address/:addressId', verifyToken, async (req, res) => {
    try {
        const uid = req.user;
        const { addressId } = req.params;
        const { label, lane, state, city, pinCode } = req.body;

        // Validate required fields
        if (!label || !lane || !state || !city || !pinCode) {
            return res.status(400).json({
                success: false,
                message: 'All address fields are required'
            });
        }

        const user = await User.findOne({ uid });
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        const address = user.addresses.id(addressId);
        if (!address) {
            return res.status(404).json({ 
                success: false,
                message: 'Address not found' 
            });
        }

        // Update address fields
        address.label = label;
        address.lane = lane;
        address.state = state;
        address.city = city;
        address.pinCode = pinCode;

        await user.save();
        res.json({ 
            success: true,
            message: 'Address updated successfully', 
            user 
        });
    } catch (error) {
        console.error('Update address error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error updating address' 
        });
    }
});

// Delete address
router.delete('/address/:addressId', verifyToken, async (req, res) => {
    try {
        const uid = req.user;
        const { addressId } = req.params;

        const user = await User.findOne({ uid });
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        const address = user.addresses.id(addressId);
        if (!address) {
            return res.status(404).json({ 
                success: false,
                message: 'Address not found' 
            });
        }

        user.addresses.pull(addressId);
        await user.save();

        res.json({ 
            success: true,
            message: 'Address deleted successfully', 
            user 
        });
    } catch (error) {
        console.error('Delete address error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error deleting address' 
        });
    }
});

// Get all addresses
router.get('/address', verifyToken, async (req, res) => {
    try {
        const uid = req.user;
        const user = await User.findOne({ uid });

        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        res.json({ 
            success: true,
            addresses: user.addresses 
        });
    } catch (error) {
        console.error('Get addresses error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching addresses' 
        });
    }
});

export default router;
