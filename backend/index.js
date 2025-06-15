import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import sellerAuthRoutes from './routes/sellerAuth.js';
import productTypesRoutes from './routes/productType.js';
import productsSellerRoutes from './routes/productsSeller.js';
import searchRoutes from './routes/search.js';
import productPageRoutes from './routes/productPage.js';
import userProfileRoutes from './routes/userProfile.js';
import userOrderRoutes from './routes/userOrder.js';
import sellerOrderRoutes from './routes/sellerOrder.js';
import homePageRoutes from './routes/homePage.js';

// Create Express app
const app = express();

// Middleware
app.use(cors({}));
app.use(express.json());

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1); 
    }
};

connectDB();

// Routes
app.get('/hello', (req, res) => {
    res.send("Hello World");
});  

app.use('/regio-store/seller-auth', sellerAuthRoutes);
app.use('/regio-store/product-types', productTypesRoutes);
app.use('/regio-store/products-seller', productsSellerRoutes);
app.use('/search', searchRoutes);
app.use('/regio-store', productPageRoutes);
app.use('/user', userProfileRoutes);
app.use('/user/order', userOrderRoutes);
app.use('/regio-store/order', sellerOrderRoutes);
app.use('/regio-store/home', homePageRoutes);
// Start the server
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
