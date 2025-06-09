import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    mrp: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    }
}, { _id: true });

const varietySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    options: [optionSchema], // S, M, L etc.
    images: [{
        type: String,
        required: true
    }]
}, { _id: true });



const productSchema = new mongoose.Schema({
    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true
    },
    productName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    specifications: {
        type: String,
        required: true,
        trim: true
    },
    productType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductType',
        required: true
    },
    productTypeName: {
        type: String,
        required: true,
    },
    productCategory: {
        type: String,
        required: true,
        enum: ['Clothing', 'Accessories', 'Foods', 'HandiCrafts']
    },
    varieties: [varietySchema],
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    ratingCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

const Product = mongoose.model('Product', productSchema);

export default Product;
