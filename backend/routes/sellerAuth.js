import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Seller from "../models/seller.js";
import ProductType from "../models/ProductType.js";
const router = express.Router();
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.SELLER_JWT_SECRET;

// Helper to generate token
const generateToken = (sellerId) => {
    return jwt.sign({ id: sellerId }, JWT_SECRET, { expiresIn: "7d" });
};

// JWT verification middleware
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.seller = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: `Invalid token ${error}` });
    }
};

// Register
router.post("/register", async (req, res) => {
    try {
        const {
            email, password, fullname, phone, store, address,
            pincode, state, city, aadhar, pan
        } = req.body;

        if (!email || !password) return res.status(400).json({ error: "Email & Password required" });

        const existingEmail = await Seller.findOne({ email });
        if (existingEmail) return res.status(400).json({ error: "Email already registered" });

        const existingPhone = await Seller.findOne({ phone });
        if (existingPhone) return res.status(400).json({ error: "Phone number already used" });

        const existingAadhar = await Seller.findOne({ aadhar });
        if (existingAadhar) return res.status(400).json({ error: "Aadhar already registered" });

        const existingPan = await Seller.findOne({ pan });
        if (existingPan) return res.status(400).json({ error: "PAN already registered" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newSeller = new Seller({
            email,
            password: hashedPassword,
            fullname,
            phone,
            storeName: store,
            address,
            pincode,
            state,
            city,
            aadhar,
            pan,
            storeRating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
            ratingCount: Math.floor(Math.random() * (50000 - 1000 + 1)) + 1000
        });

        await newSeller.save();

        res.status(201).json({
            message: "Registration Successful. Please log in to get your token."
        });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) return res.status(400).json({ error: "All fields are required" });

        const seller = await Seller.findOne({ email });
        if (!seller) return res.status(404).json({ error: "No seller found with this email" });

        const isMatch = await bcrypt.compare(password, seller.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        const token = generateToken(seller._id);

        res.status(200).json({
            message: "Login successful",
            seller: {
                id: seller._id,
                token
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get Seller Details
router.get("/details", verifyToken, async (req, res) => {
    try {
        const seller = await Seller.findById(req.seller.id).select('-password');
        
        if (!seller) {
            return res.status(404).json({ error: "Seller not found" });
        }

        res.status(200).json({
            message: "Seller details retrieved successfully",
            seller
        });
    } catch (error) {
        console.error("Get Seller Details Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Add product type to seller's sells array
router.post("/sells/add", verifyToken, async (req, res) => {
    try {
        const { productTypeId } = req.body;

        if (!productTypeId) {
            return res.status(400).json({ error: "Product type ID is required" });
        }

        const productType = await ProductType.findById(productTypeId);
        if (!productType) {
            return res.status(404).json({ error: "Product type not found" });
        }

        const seller = await Seller.findById(req.seller.id);
        if (!seller) {
            return res.status(404).json({ error: "Seller not found" });
        }

        if (seller.sells.includes(productTypeId)) {
            return res.status(400).json({ error: "Product type already added to sells" });
        }

        seller.sells.push(productTypeId);
        await seller.save();

        res.status(200).json({
            message: "Product type added to sells successfully",
            sells: seller.sells
        });
    } catch (error) {
        console.error("Add to Sells Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get all product types in seller's sells array
router.get("/sells", verifyToken, async (req, res) => {
    try {
        const seller = await Seller.findById(req.seller.id).populate({
            path: 'sells',
            select: 'name image state city description',
            options: { sort: { createdAt: -1 } }
        });

        if (!seller) {
            return res.status(404).json({ error: "Seller not found" });
        }

        res.status(200).json({
            message: "Sells retrieved successfully",
            sells: seller.sells
        });
    } catch (error) {
        console.error("Get Sells Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Delete product type from seller's sells array
router.delete("/sells/:productTypeId", verifyToken, async (req, res) => {
    try {
        const { productTypeId } = req.params;

        const seller = await Seller.findById(req.seller.id);
        if (!seller) {
            return res.status(404).json({ error: "Seller not found" });
        }

        const index = seller.sells.indexOf(productTypeId);
        if (index === -1) {
            return res.status(404).json({ error: "Product type not found in sells" });
        }

        seller.sells.splice(index, 1);
        await seller.save();

        res.status(200).json({
            message: "Product type removed from sells successfully",
            sells: seller.sells
        });
    } catch (error) {
        console.error("Delete from Sells Error:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
