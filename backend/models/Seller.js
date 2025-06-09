// models/Seller.js
import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            unique: true,
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            unique: true,
            match: /^[6-9]\d{9}$/,
        },
        storeName: {
            type: String,
            required: true,
            trim: true,
        },
        storeAddress: {
            type: String,
            required: false,
        },
        storeRating: {
            type: Number,
            default: 0,
        },
        ratingCount: {
            type: Number,
            default: 0,
        },
        pincode: {
            type: String,
            required: true,
            match: /^\d{6}$/,
        },
        state: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        sells: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProductType'
        }],
        aadhar: {
            type: String,
            required: true,
            match: /^\d{12}$/,
            unique: true,
        },
        pan: {
            type: String,
            required: true,
            match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Seller = mongoose.model("Seller", sellerSchema);

export default Seller;
