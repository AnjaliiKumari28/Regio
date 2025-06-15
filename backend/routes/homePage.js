import express from 'express';
import ProductType from '../models/ProductType.js';

const router = express.Router();

// Route to get 5 random product types with image and name
router.get('/random-five', async (req, res) => {
    try {
        const randomProducts = await ProductType.aggregate([
            { $sample: { size: 5 } },
            { $project: { 
                image: 1, 
                name: 1,
                _id: 1 
            }}
        ]);
        
        res.status(200).json({
            success: true,
            data: randomProducts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching random products',
            error: error.message
        });
    }
});

// Route to get up to 20 random product types with image, name, state, city, and category
router.get('/random-twenty', async (req, res) => {
    try {
        const randomProducts = await ProductType.aggregate([
            { $sample: { size: 20 } },
            { $project: { 
                image: 1, 
                name: 1,
                state: 1,
                city: 1,
                category: 1,
                _id: 1 
            }}
        ]);
        
        res.status(200).json({
            success: true,
            data: randomProducts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching random products',
            error: error.message
        });
    }
});

export default router;
