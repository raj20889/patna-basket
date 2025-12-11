const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const compression = require('compression');
const app = express();
const authRoute = require('./routes/auth');
const productRoute = require('./routes/product');
const cartRoute = require('./routes/cart');
const addressRoutes = require('./routes/addressRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userOrderRoutes = require('./routes/order'); // Renamed for clarity
const userRoutes = require('./routes/users');
const categoryRoute = require('./routes/category');
const subcategoryRoute = require('./routes/subcategory');
const homeSectionRoute = require('./routes/homeSection');
const bannerRoute = require('./routes/banner');
const deliveryPromiseRoute = require('./routes/deliveryPromise');
const quickSearchRoute = require('./routes/quickSearch');
const trendingSearchRoute = require('./routes/virtualStores');
const storesRoute = require('./routes/stores');

// Keep-alive service to prevent cold starts
require('./keepAlive');







dotenv.config();

// Enable gzip/brotli compression to reduce payload sizes
app.use(compression());

// Configure CORS to allow requests from your frontend's domain
// Use FRONTEND_URL env to keep deployment behavior unchanged and allow common local dev origins
const DEPLOYED_FRONTEND = process.env.FRONTEND_URL || 'https://patna-basket.vercel.app';
const DEV_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
];
const ALLOWED_ORIGINS = new Set([DEPLOYED_FRONTEND, ...DEV_ORIGINS]);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow server-to-server or CLI requests where origin is undefined
            if (!origin) return callback(null, true);
            if (ALLOWED_ORIGINS.has(origin)) return callback(null, true);
            return callback(new Error('CORS policy: Origin not allowed'));
        },
        credentials: true, // if you are sending cookies/authentication headers
    })
);

app.use(express.json());

// Routes
app.use('/auth', authRoute);
app.use('/products', productRoute);
app.use('/cart', cartRoute);
app.use('/addresses', addressRoutes);
app.use('/orders', orderRoutes); // For admin
app.use('/user-orders', userOrderRoutes);
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/notifications', notificationRoutes); // For user orders
app.use('/users', userRoutes);
app.use('/categories', categoryRoute);
app.use('/subcategories', subcategoryRoute);
app.use('/home-sections', homeSectionRoute);
app.use('/banners', bannerRoute);
app.use('/delivery-promise', deliveryPromiseRoute);
app.use('/quick-searches', quickSearchRoute);
app.use('/trending-searches', trendingSearchRoute);
app.use('/stores', storesRoute);






app.get('/', (req, res) => {
    res.send('E-Commerce API Running...');
});

// Health check endpoint for keep-alive pings
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Use a sensible default port for local development if PORT is not set
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log('MongoDB Connected');
        app.listen(PORT, () => console.log(`Server running on ${PORT}`));
    })
    .catch(err => console.log('MongoDB connection error:', err));