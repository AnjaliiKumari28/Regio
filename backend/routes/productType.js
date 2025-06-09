import express from 'express';
import ProductType from '../models/ProductType.js';

const router = express.Router();

// Get all product types with complete details
router.get('/product-types', async (req, res) => {
    try {
        const productTypes = await ProductType.find({});
        res.status(200).json(productTypes);
    } catch (error) {
        console.error('Error fetching product types:', error);
        res.status(500).json({ error: 'Failed to fetch product types' });
    }
});

// Get product names and IDs for dropdown (unprotected)
router.get('/product-names', async (req, res) => {
    try {
        const products = await ProductType.find({}, 'name _id');
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching product names:', error);
        res.status(500).json({ error: 'Failed to fetch product names' });
    }
});

// Get single product type (unprotected)
router.get('/product-types/:id', async (req, res) => {
    try {
        const productType = await ProductType.findById(req.params.id);

        if (!productType) {
            return res.status(404).json({ error: 'Product type not found' });
        }

        res.status(200).json(productType);
    } catch (error) {
        console.error('Error fetching product type:', error);
        res.status(500).json({ error: 'Failed to fetch product type' });
    }
});

// Add new product type (should be admin protected in the future)
router.post('/add-product-type', async (req, res) => {
    try {
        const { name, description, image, state, city, history, category } = req.body;

        // Validate required fields
        if (!name || !description || !image || !state || !city || !history || !category) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Create new product type
        const newProductType = new ProductType({
            name,
            description,
            image,
            state,
            city,
            history,
            category
        });

        // Save the product type
        await newProductType.save();

        res.status(201).json({
            message: 'Product type added successfully',
            productType: newProductType
        });
    } catch (error) {
        console.error('Error adding product type:', error);
        res.status(500).json({ error: 'Failed to add product type' });
    }
});

export default router; 