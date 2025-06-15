import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },

    // One order can have multiple items from multiple sellers
    items: [
        {
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                auto: true
            },
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            productName: String, // snapshot for readability
            sellerId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Seller',
                required: true
            },
            varietyId: String,
            varietyTitle: String,
            optionLabel: String,
            optionId: String,
            price: Number,
            mrp: Number,
            image: String,
            status: {
                type: String,
                enum: ['Placed', 'Shipped', 'Delivered', 'Cancelled'],
                default: 'Placed'
            },
            cancellationReason: String,
            refundStatus: {
                type: String,
                enum: ['Pending', 'Approved', 'Rejected', 'Not Applicable'],
                default: 'Not Applicable'
            },
            refundReason: String,
            refundRejectionReason: String,
            rating: {
                type: Number,
                min: 0,
                max: 5,
                default: 0
            }
        }
    ],

    // Shipping and delivery info
    shippingAddress: {
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
    },

    // Payment details
    paymentMethod: {
        type: String,
        enum: ['COD', 'UPI', 'Card'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending'
    },

    // Order-level details
    totalAmount: Number,
    
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;
