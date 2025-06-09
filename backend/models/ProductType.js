import mongoose from 'mongoose';

const productTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product type name is required'],
        trim: true,
        minlength: [3, 'Product type name must be at least 3 characters long']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true
    },
    image: {
        type: String,
        required: [true, 'Image URL is required']
    },
    state: {
        type: String,
        required: [true, 'State is required'],
        trim: true
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
    },
    history: {
        type: String,
        required: [true, 'History/Story is required'],
    },
}, );

const ProductType = mongoose.model('ProductType', productTypeSchema);

export default ProductType; 