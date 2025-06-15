import sellerOrderRoutes from './routes/sellerOrder.js';

// Routes
app.use('/api', userRoutes);
app.use('/api', productRoutes);
app.use('/api', orderRoutes);
app.use('/api/seller', sellerOrderRoutes); 