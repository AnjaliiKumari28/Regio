import express from 'express';
import Product from '../models/Products.js';
import ProductType from '../models/ProductType.js';
import User from '../models/Users.js';
import { verifyToken } from '../services/firebaseAdmin.js';
import mongoose from 'mongoose';

const router = express.Router();

// Get the Seller model
const Seller = mongoose.model('Seller');

// Get product details by ID
router.get('/product/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        
        const product = await Product.findById(productId)

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
});

// Get product type details by ID
router.get('/product-type/:typeId', async (req, res) => {
    try {
        const { typeId } = req.params;
        
        const productType = await ProductType.findById(typeId);

        if (!productType) {
            return res.status(404).json({ message: 'Product type not found' });
        }

        res.json(productType);
    } catch (error) {
        console.error('Error fetching product type:', error);
        res.status(500).json({ message: 'Error fetching product type', error: error.message });
    }
});

// Add item to cart
router.post('/cart/add', verifyToken, async (req, res) => {
    try {
        const { product_id, variety_id, option_id } = req.body;
        const uid = req.user;

        // Validate product exists
        const product = await Product.findById(product_id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Find variety and validate
        const variety = product.varieties.id(variety_id);
        if (!variety) {
            return res.status(404).json({ message: 'Variety not found' });
        }

        // Find option and validate
        const option = variety.options.id(option_id);
        if (!option) {
            return res.status(404).json({ message: 'Option not found' });
        }

        // Add to cart using findOneAndUpdate
        const result = await User.findOneAndUpdate(
            { uid },
            { $push: { cart: { product_id, variety_id, option_id } } },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Item added to cart successfully' });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Error adding to cart', error: error.message });
    }
});

// Delete item from cart using cart item ID
router.delete('/cart/remove/:cartItemId', verifyToken, async (req, res) => {
    try {
        const { cartItemId } = req.params;
        const uid = req.user;

        const result = await User.findOneAndUpdate(
            { uid },
            { $pull: { cart: { _id: cartItemId } } },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Item removed from cart successfully' });
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ message: 'Error removing from cart', error: error.message });
    }
});

// Get cart items with details
router.get('/cart', verifyToken, async (req, res) => {
    try {
        const uid = req.user;

        const user = await User.findOne({ uid }).populate({
            path: 'cart.product_id',
            select: 'productName varieties'
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const cartItems = await Promise.all(user.cart.map(async (item) => {
            const product = item.product_id;
            const variety = product.varieties.id(item.variety_id);
            const option = variety.options.id(item.option_id);

            return {
                cartItemId: item._id,
                product_id: product._id,
                variety_id: variety._id,
                option_id: option._id,
                productName: product.productName,
                imageUrl: variety.images[0],
                variety: variety.title,
                option: option.label,
                price: option.price,
                mrp: option.mrp
            };
        }));

        res.json(cartItems);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Error fetching cart', error: error.message });
    }
});

// Add item to wishlist
router.post('/wishlist/add', verifyToken, async (req, res) => {
    try {
        const { product_id, variety_id } = req.body;
        const uid = req.user;

        // Validate product exists
        const product = await Product.findById(product_id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Find variety and validate
        const variety = product.varieties.id(variety_id);
        if (!variety) {
            return res.status(404).json({ message: 'Variety not found' });
        }

        // Add to wishlist
        const user = await User.findOne({ uid });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if item already exists in wishlist
        const existingItemIndex = user.wishlist.findIndex(
            item => item.product_id.toString() === product_id && 
                   item.variety_id.toString() === variety_id
        );

        if (existingItemIndex !== -1) {
            // Remove item if it exists
            user.wishlist.splice(existingItemIndex, 1);
            await user.save();
            return res.json({ message: 'Item removed from wishlist successfully', action: 'removed' });
        }

        // Add new item if it doesn't exist
        user.wishlist.push({ product_id, variety_id });
        await user.save();

        res.json({ message: 'Item added to wishlist successfully', action: 'added' });
    } catch (error) {
        console.error('Error updating wishlist:', error);
        res.status(500).json({ message: 'Error updating wishlist', error: error.message });
    }
});

// Delete item from wishlist using product_id and variety_id
router.delete('/wishlist/remove', verifyToken, async (req, res) => {
    try {
        const { product_id, variety_id } = req.body;
        const uid = req.user;

        const user = await User.findOne({ uid });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const wishlistItemIndex = user.wishlist.findIndex(
            item => item.product_id.toString() === product_id && 
                   item.variety_id.toString() === variety_id
        );

        if (wishlistItemIndex === -1) {
            return res.status(404).json({ message: 'Wishlist item not found' });
        }

        user.wishlist.splice(wishlistItemIndex, 1);
        await user.save();

        res.json({ message: 'Item removed from wishlist successfully' });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ message: 'Error removing from wishlist', error: error.message });
    }
});

// Get wishlist items with details
router.get('/wishlist', verifyToken, async (req, res) => {
    try {
        const uid = req.user;

        const user = await User.findOne({ uid }).populate({
            path: 'wishlist.product_id',
            select: 'productName varieties rating ratingCount'
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const wishlistItems = await Promise.all(user.wishlist.map(async (item) => {
            const product = item.product_id;
            const variety = product.varieties.id(item.variety_id);
            // Get the first option's price and mrp
            const option = variety.options[0];

            return {
                wishlistItemId: item._id,
                product_id: product._id,
                productName: product.productName,
                imageUrl: variety.images[0],
                variety: variety.title,
                variety_id: variety._id,
                price: option.price,
                mrp: option.mrp,
                rating: product.rating,
                ratingCount: product.ratingCount
            };
        }));

        res.json(wishlistItems);
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ message: 'Error fetching wishlist', error: error.message });
    }
});

// Get seller details and their products
router.get('/seller/:sellerId', async (req, res) => {
    try {
        const { sellerId } = req.params;

        // Get seller details
        const seller = await Seller.findById(sellerId);
        if (!seller) {
            return res.status(404).json({ message: 'Seller not found' });
        }

        // Get seller's products (max 10)
        const sellerProducts = await Product.find({ 
            seller_id: sellerId,
            isActive: true 
        }).limit(10);

        // Format seller products with flattened variety details
        const formattedProducts = sellerProducts.map(product => {
            const firstVariety = product.varieties[0];
            const firstOption = firstVariety?.options[0];
            
            return {
                product_id: product._id,
                productName: product.productName,
                imageUrl: firstVariety?.images[0] || null,
                rating: product.rating,
                ratingCount: product.ratingCount,
                price: firstOption?.price || null,
                mrp: firstOption?.mrp || null
            };
        });

        // Format seller details
        const sellerDetails = {
            storeName: seller.storeName,
            sellerName: seller.fullname,
            state: seller.state,
            city: seller.city,
            storeRating: seller.storeRating,
            ratingCount: seller.ratingCount,
            products: formattedProducts
        };

        res.json(sellerDetails);
    } catch (error) {
        console.error('Error fetching seller details:', error);
        res.status(500).json({ message: 'Error fetching seller details', error: error.message });
    }
});

// Get similar products
router.get('/similar-products/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        
        // Get the current product to find its name and description
        const currentProduct = await Product.findById(productId);
        if (!currentProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // Create the Atlas Search aggregation pipeline
        const pipeline = [
            {
                $search: {
                    index: "product_search",
                    compound: {
                        should: [
                            {
                                text: {
                                    query: currentProduct.productName,
                                    path: [
                                        "productName",
                                        "description",
                                        "productTypeName",
                                        "productCategory",
                                        "varieties.title",
                                        "varieties.options.label"
                                    ],
                                    fuzzy: {
                                        maxEdits: 2,
                                        prefixLength: 2,
                                        maxExpansions: 50
                                    },
                                    score: { boost: { value: 3 } }
                                }
                            },
                            {
                                text: {
                                    query: currentProduct.description,
                                    path: [
                                        "productName",
                                        "description",
                                        "productTypeName",
                                        "productCategory"
                                    ],
                                    fuzzy: {
                                        maxEdits: 2,
                                        prefixLength: 2,
                                        maxExpansions: 50
                                    },
                                    score: { boost: { value: 2 } }
                                }
                            }
                        ],
                        minimumShouldMatch: 1,
                        mustNot: [
                            {
                                text: {
                                    query: currentProduct._id.toString(),
                                    path: "_id"
                                }
                            }
                        ]
                    }
                }
            },
            {
                $match: {
                    isActive: true
                }
            },
            {
                $limit: 30
            },
            {
                $project: {
                    _id: 1,
                    productName: 1,
                    description: 1,
                    rating: 1,
                    ratingCount: 1,
                    varieties: 1,
                    score: { $meta: "searchScore" }
                }
            }
        ];

        // Add product type matching if it exists
        if (currentProduct.productTypeName) {
            pipeline[0].$search.compound.should.push({
                text: {
                    query: currentProduct.productTypeName,
                    path: "productTypeName",
                    score: { boost: { value: 2 } }
                }
            });
        }

        const similarProducts = await Product.aggregate(pipeline);
        

        // Format products with flattened variety details
        const formattedProducts = similarProducts.map(product => {
            const firstVariety = product.varieties[0];
            const firstOption = firstVariety?.options[0];
            
            return {
                product_id: product._id,
                variety_id: firstVariety?._id,
                productName: product.productName,
                imageUrl: firstVariety?.images[0] || null,
                rating: product.rating,
                ratingCount: product.ratingCount,
                price: firstOption?.price || null,
                mrp: firstOption?.mrp || null,
                similarityScore: product.score
            };
        });

        // Sort by similarity score
        formattedProducts.sort((a, b) => b.similarityScore - a.similarityScore);

        res.json(formattedProducts);
    } catch (error) {
        console.error('Error fetching similar products:', error);
        res.status(500).json({ message: 'Error fetching similar products', error: error.message });
    }
});

// Get products from same state based on product type
router.get('/same-state-products/:productTypeId', async (req, res) => {
    try {
        const { productTypeId } = req.params;

        // First get the product type to find its state
        const productType = await ProductType.findById(productTypeId);
        if (!productType) {
            return res.status(404).json({ message: 'Product type not found' });
        }

        const state = productType.state;

        // Find other product types from the same state
        const sameStateProductTypes = await ProductType.find({ 
            state: state,
            _id: { $ne: productTypeId } // Exclude the current product type
        }).limit(20);

        // Get all product IDs from these product types
        const productTypeIds = sameStateProductTypes.map(pt => pt._id);

        // Find products with these product types
        const products = await Product.find({
            productType: { $in: productTypeIds },
            isActive: true
        }).populate('productType', 'name state city');

        // Format the response
        const formattedProducts = products.map(product => {
            const firstVariety = product.varieties[0];
            const firstOption = firstVariety?.options[0];
            
            return {
                product_id: product._id,
                productName: product.productName,
                imageUrl: firstVariety?.images[0] || null,
                rating: product.rating,
                ratingCount: product.ratingCount,
                price: firstOption?.price || null,
                mrp: firstOption?.mrp || null,
                state: product.productType.state,
                city: product.productType.city,
                productTypeName: product.productType.name
            };
        });

        res.json({
            state: state,
            products: formattedProducts
        });

    } catch (error) {
        console.error('Error fetching same state products:', error);
        res.status(500).json({ 
            message: 'Error fetching same state products', 
            error: error.message 
        });
    }
});

// Get products from same category
router.get('/same-category-products/:productId', async (req, res) => {
    try {
        const { productId } = req.params;

        // First get the product to find its category
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const category = product.productCategory;

        // Find other products from the same category
        const sameCategoryProducts = await Product.find({ 
            productCategory: category,
            _id: { $ne: productId }, // Exclude the current product
            isActive: true
        }).limit(20);

        // Format the response
        const formattedProducts = sameCategoryProducts.map(product => {
            const firstVariety = product.varieties[0];
            const firstOption = firstVariety?.options[0];
            
            return {
                product_id: product._id,
                productName: product.productName,
                imageUrl: firstVariety?.images[0] || null,
                rating: product.rating,
                ratingCount: product.ratingCount,
                price: firstOption?.price || null,
                mrp: firstOption?.mrp || null,
                category: product.productCategory,
                productTypeName: product.productTypeName
            };
        });

        res.json({
            category: category,
            products: formattedProducts
        });

    } catch (error) {
        console.error('Error fetching same category products:', error);
        res.status(500).json({ 
            message: 'Error fetching same category products', 
            error: error.message 
        });
    }
});

export default router;
