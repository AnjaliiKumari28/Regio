import mongoose from 'mongoose';
const addressSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
        trim: true
    },
    lane: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    pinCode: {
        type: String,
        required: true,
        trim: true
    }
}, { _id: true });

const cartItemSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    variety_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    option_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    }
}, { _id: true });

const userSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    addresses: [{
        label: {
            type: String,
            required: true,
            trim: true
        },
        lane: {
            type: String,
            required: true,
            trim: true
        },
        state: {
            type: String,
            required: true,
            trim: true
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        pinCode: {
            type: String,
            required: true,
            trim: true
        }
    }],
    cart: [{
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        variety_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        option_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
    }],
    wishlist: [{
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        variety_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        }
    }]
}, { timestamps: true });

// Add a pre-save middleware to ensure uid is not null
userSchema.pre('save', function(next) {
    if (!this.uid) {
        next(new Error('User ID is required'));
    }
    next();
});

const User = mongoose.model('User', userSchema);

export default User;
