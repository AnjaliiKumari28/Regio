import express from 'express';
import jwt from 'jsonwebtoken';
import Product from '../models/Products.js';
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
        req.seller = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: `Invalid token ${error}` });
    }
};

// Get all products of a seller
router.get('/my-products', verifyToken, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const products = await Product.find({ seller_id: req.seller.id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .populate({
                path: 'productType',
                select: 'state city'
            })
            .limit(parseInt(limit));

        const total = await Product.countDocuments({ seller_id: req.seller.seller_id });

        res.json({
            products,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalProducts: total
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
});

// Add a new product
router.post('/add-product', verifyToken, async (req, res) => {
    try {
        console.log('Received request body:', JSON.stringify(req.body, null, 2));
        
        const {
            productName,
            description,
            specifications,
            productType,
            productTypeName,
            productCategory,
            varieties
        } = req.body;

        // Validate required fields
        if (!productName || !description || !specifications || !productType || !productTypeName || !productCategory || !varieties) {
            console.log('Missing required fields:', {
                productName: !!productName,
                description: !!description,
                specifications: !!specifications,
                productType: !!productType,
                productTypeName: !!productTypeName,
                productCategory: !!productCategory,
                varieties: !!varieties
            });
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate varieties
        if (!Array.isArray(varieties) || varieties.length === 0) {
            console.log('Invalid varieties:', varieties);
            return res.status(400).json({ message: 'At least one variety is required' });
        }

        // Validate each variety
        for (const variety of varieties) {
            if (!variety.title || !variety.options || !variety.images) {
                console.log('Invalid variety structure:', variety);
                return res.status(400).json({ message: 'Each variety must have title, options and images' });
            }
            
            // Validate options
            if (!Array.isArray(variety.options) || variety.options.length === 0) {
                console.log('Invalid options array:', variety.options);
                return res.status(400).json({ message: 'Each variety must have at least one option' });
            }

            for (const option of variety.options) {
                console.log('Validating option:', option);
                if (option.label === undefined || option.label === null || 
                    option.price === undefined || option.price === null || 
                    option.mrp === undefined || option.mrp === null || 
                    option.quantity === undefined || option.quantity === null) {
                    console.log('Missing option fields:', {
                        label: option.label !== undefined && option.label !== null,
                        price: option.price !== undefined && option.price !== null,
                        mrp: option.mrp !== undefined && option.mrp !== null,
                        quantity: option.quantity !== undefined && option.quantity !== null
                    });
                    return res.status(400).json({ message: 'Each option must have label, price, mrp, and quantity' });
                }
                if (option.price < 0 || option.mrp < 0 || option.quantity < 0) {
                    return res.status(400).json({ message: 'Price, MRP, and quantity must be non-negative' });
                }
                if (option.price > option.mrp) {
                    return res.status(400).json({ message: 'Price cannot be greater than MRP' });
                }
            }

            // Validate images
            if (!Array.isArray(variety.images) || variety.images.length === 0) {
                console.log('Invalid images array:', variety.images);
                return res.status(400).json({ message: 'Each variety must have at least one image' });
            }
        }

        // Generate random rating and rating count
        const rating = (Math.random() * 2 + 3).toFixed(1); // Random rating between 3.0 and 5.0
        const ratingCount = Math.floor(Math.random() * 99000) + 1000; // Random count between 1000 and 100000

        // Create new product
        const newProduct = new Product({
            seller_id: req.seller.id,
            productName,
            description,
            specifications,
            productType,
            productTypeName,
            productCategory,
            varieties,
            rating,
            ratingCount
        });

        await newProduct.save();

        res.status(201).json({
            message: 'Product added successfully',
        });

    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ message: 'Error adding product', error: error.message });
    }
});

// Update a product
router.put('/update-product/:productId', verifyToken, async (req, res) => {
    try {
        const { productId } = req.params;
        const {
            productName,
            description,
            specifications,
            productTypeName,
            varieties,
            isActive
        } = req.body;

        // Find the product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if the seller owns this product
        if (product.seller_id.toString() !== req.seller.id) {
            return res.status(403).json({ message: 'Not authorized to update this product' });
        }

        // Validate varieties if provided
        if (varieties) {
            if (!Array.isArray(varieties) || varieties.length === 0) {
                return res.status(400).json({ message: 'At least one variety is required' });
            }

            for (const variety of varieties) {
                if (!variety.title || !variety.options || !variety.images) {
                    return res.status(400).json({ message: 'Each variety must have title, options and images' });
                }

                if (!Array.isArray(variety.options) || variety.options.length === 0) {
                    return res.status(400).json({ message: 'Each variety must have at least one option' });
                }

                for (const option of variety.options) {
                    if (option.label === undefined || option.label === null || 
                        option.price === undefined || option.price === null || 
                        option.mrp === undefined || option.mrp === null || 
                        option.quantity === undefined || option.quantity === null) {
                        return res.status(400).json({ message: 'Each option must have label, price, mrp, and quantity' });
                    }
                    if (option.price < 0 || option.mrp < 0 || option.quantity < 0) {
                        return res.status(400).json({ message: 'Price, MRP, and quantity must be non-negative' });
                    }
                    if (option.price > option.mrp) {
                        return res.status(400).json({ message: 'Price cannot be greater than MRP' });
                    }
                }

                if (!Array.isArray(variety.images) || variety.images.length === 0) {
                    return res.status(400).json({ message: 'Each variety must have at least one image' });
                }
            }
        }

        // Update only allowed fields
        const updateFields = {
            productName,
            description,
            specifications,
            productTypeName,
            isActive,
            varieties
        };

        await Product.findByIdAndUpdate(
            productId,
            { $set: updateFields },
            { new: true }
        );

        res.json({
            message: 'Product updated successfully',
        });

    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
});

// Get a single product by ID
router.get('/get-product/:productId', verifyToken, async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId)
            .populate({
                path: 'productType',
                select: 'state city'
            });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if the product belongs to the seller
        if (product.seller_id.toString() !== req.seller.id) {
            return res.status(403).json({ message: 'Not authorized to view this product' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
});

export default router;
