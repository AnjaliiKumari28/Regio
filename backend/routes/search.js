import express from 'express';
import Product from '../models/Products.js';
import ProductType from '../models/ProductType.js';
const router = express.Router();

// Search products by category
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const skip = (page - 1) * limit;

        // Build the query
        const query = {
            productCategory: category,
            isActive: true
        };

        // Execute the query with pagination and select only required fields
        const products = await Product.find(query)
            .select('_id productName varieties rating ratingCount productType isActive')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('productType', 'name')

        // Get total count for pagination
        const total = await Product.countDocuments(query);

        res.json({
            products,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalProducts: total
        });

    } catch (error) {
        console.error('Error searching products by category:', error);
        res.status(500).json({ message: 'Error searching products', error: error.message });
    }
});

// Search products by product type
router.get('/type/:productType', async (req, res) => {
    try {
        const { productType } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const skip = (page - 1) * limit;

        // Build the query
        const query = {
            productType: productType,
            isActive: true
        };

        // Execute the query with pagination and select only required fields
        const products = await Product.find(query)
            .select('_id productName varieties rating ratingCount productType seller_id productCategory isActive')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('productType', 'name')
            .populate('seller_id', 'name');

        // Get total count for pagination
        const total = await Product.countDocuments(query);

        res.json({
            products,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalProducts: total
        });

    } catch (error) {
        console.error('Error searching products by type:', error);
        res.status(500).json({ message: 'Error searching products', error: error.message });
    }
});

// Combined search (both category and product type)
router.get('/category/:category/type/:productType', async (req, res) => {
    try {
        const { category, productType } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const skip = (page - 1) * limit;

        // Build the query
        const query = {
            productCategory: category,
            productType: productType,
            isActive: true
        };

        // Execute the query with pagination and select only required fields
        const products = await Product.find(query)
            .select('_id productName varieties rating ratingCount productType seller_id productCategory isActive')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('productType', 'name')
            .populate('seller_id', 'name');

        // Get total count for pagination
        const total = await Product.countDocuments(query);

        res.json({
            products,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalProducts: total
        });

    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ message: 'Error searching products', error: error.message });
    }
});

// Search products by query using Atlas Search
router.get('/query/:searchQuery', async (req, res) => {
    try {
        const { searchQuery } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        // Decode the search query
        const decodedQuery = decodeURIComponent(searchQuery);

        // Create the Atlas Search aggregation pipeline
        const pipeline = [
            {
                $search: {
                    index: "product_search",
                    compound: {
                        should: [
                            {
                                text: {
                                    query: decodedQuery,
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
                                autocomplete: {
                                    query: decodedQuery,
                                    path: "productName", // Only one path allowed
                                    tokenOrder: "sequential",
                                    fuzzy: {
                                        maxEdits: 1, // Reduce for performance
                                        prefixLength: 2
                                    },
                                    score: { boost: { value: 2 } }
                                }
                            }
                        ],
                        minimumShouldMatch: 1
                    }
                }
            },
            {
                $match: {
                    isActive: true
                }
            },
            {
                $facet: {
                    products: [
                        { $skip: skip },
                        { $limit: parseInt(limit) },
                        {
                            $project: {
                                _id: 1,
                                productName: 1,
                                description: 1,
                                productTypeName: 1,
                                productCategory: 1,
                                varieties: 1,
                                rating: 1,
                                ratingCount: 1,
                                score: { $meta: "searchScore" }
                            }
                        }
                    ],
                    total: [
                        { $count: "count" }
                    ]
                }
            }
        ];


        const result = await Product.aggregate(pipeline);
        const products = result[0].products;
        const total = result[0].total[0]?.count || 0;

        res.json({
            products,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalProducts: total
        });

    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ message: 'Error searching products', error: error.message });
    }
});

// Recommend products based on multiple past queries
router.post('/recommendations', async (req, res) => {
    try {
        const { queries } = req.body;

        if (!Array.isArray(queries) || queries.length === 0) {
            return res.status(400).json({ message: 'Query array is required' });
        }

        // Assign boost value based on query index (earlier = higher boost)
        const boostedQueries = queries.slice(0, 10).map((query, index) => {
            const boostValue = 10 - index; // Index 0 = boost 10, Index 9 = boost 1

            return [
                {
                    text: {
                        query,
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
                        score: { boost: { value: boostValue * 2 } }
                    }
                },
                {
                    autocomplete: {
                        query,
                        path: "productName",
                        tokenOrder: "sequential",
                        fuzzy: {
                            maxEdits: 1,
                            prefixLength: 2
                        },
                        score: { boost: { value: boostValue } }
                    }
                }
            ];
        }).flat();

        const pipeline = [
            {
                $search: {
                    index: "product_search",
                    compound: {
                        should: boostedQueries,
                        minimumShouldMatch: 1
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
                    productTypeName: 1,
                    productCategory: 1,
                    varieties: 1,
                    rating: 1,
                    ratingCount: 1,
                    score: { $meta: "searchScore" }
                }
            }
        ];

        const results = await Product.aggregate(pipeline);

        res.json({
            recommended: results,
            total: results.length
        });

    } catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).json({ message: 'Error getting recommendations', error: error.message });
    }
});

router.get('/suggestions', async (req, res) => {
    try {
        const query = req.query.q;
        console.log(query)
        if (!query || query.trim().length === 0) {
            return res.status(400).json({ message: 'Query parameter "q" is required.' });
        }

        const pipeline = [
            {
                $search: {
                    index: 'suggestions',
                    compound: {
                        should: [
                            {
                                autocomplete: {
                                    query: query,
                                    path: 'name',
                                    fuzzy: {
                                        maxEdits: 1,
                                        prefixLength: 1
                                    }
                                }
                            },
                            {
                                autocomplete: {
                                    query: query,
                                    path: 'description',
                                    fuzzy: {
                                        maxEdits: 1,
                                        prefixLength: 1
                                    }
                                }
                            }
                        ],
                        minimumShouldMatch: 1
                    }
                }

            },
            { $limit: 10 },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    image: 1
                }
            }
        ];

        const results = await ProductType.aggregate(pipeline);
        res.json({ suggestions: results });

    } catch (error) {
        console.error('Product type suggestion error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

export default router;
