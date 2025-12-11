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

// One-time seed endpoint for production (DELETE after first use)
app.post('/admin/seed-homepage', async (req, res) => {
    try {
        const QuickSearch = require('./models/QuickSearch');
        const VirtualStore = require('./models/VirtualStore');

        // Quick Searches
        const quickSearches = [
            { keyword: 'milk', displayText: 'Milk', icon: '🥛', isActive: true, displayOrder: 1 },
            { keyword: 'bread', displayText: 'Bread', icon: '🍞', isActive: true, displayOrder: 2 },
            { keyword: 'eggs', displayText: 'Eggs', icon: '🥚', isActive: true, displayOrder: 3 },
            { keyword: 'rice', displayText: 'Rice', icon: '🍚', isActive: true, displayOrder: 4 },
            { keyword: 'atta', displayText: 'Atta', icon: '🌾', isActive: true, displayOrder: 5 },
            { keyword: 'chips', displayText: 'Chips', icon: '🥔', isActive: true, displayOrder: 6 },
            { keyword: 'cold drink', displayText: 'Cold Drinks', icon: '🥤', isActive: true, displayOrder: 7 },
            { keyword: 'biscuits', displayText: 'Biscuits', icon: '🍪', isActive: true, displayOrder: 8 },
            { keyword: 'oil', displayText: 'Oil', icon: '🛢️', isActive: true, displayOrder: 9 },
            { keyword: 'tea', displayText: 'Tea', icon: '☕', isActive: true, displayOrder: 10 }
        ];

        // Virtual Stores
        const virtualStores = [
            { storeName: 'Paan Corner', storeIcon: '🌿', storeColor: '#10b981', isActive: true, displayOrder: 1, storeBanner: '' },
            { storeName: 'Fresh Market', storeIcon: '🥬', storeColor: '#22c55e', isActive: true, displayOrder: 2, storeBanner: '' },
            { storeName: 'Beauty & Care', storeIcon: '💄', storeColor: '#ec4899', isActive: true, displayOrder: 3, storeBanner: '' },
            { storeName: 'Snack Center', storeIcon: '🍿', storeColor: '#f59e0b', isActive: true, displayOrder: 4, storeBanner: '' },
            { storeName: 'Home Essentials', storeIcon: '🏠', storeColor: '#8b5cf6', isActive: true, displayOrder: 5, storeBanner: '' },
            { storeName: 'Local Store', storeIcon: '🏪', storeColor: '#06b6d4', isActive: true, displayOrder: 6, storeBanner: '' }
        ];

        // Check if already seeded
        const existingSearches = await QuickSearch.countDocuments();
        const existingStores = await VirtualStore.countDocuments();

        if (existingSearches > 0 && existingStores > 0) {
            return res.json({ 
                message: 'Already seeded', 
                quickSearches: existingSearches, 
                virtualStores: existingStores 
            });
        }

        // Seed data
        if (existingSearches === 0) {
            await QuickSearch.insertMany(quickSearches);
        }
        if (existingStores === 0) {
            await VirtualStore.insertMany(virtualStores);
        }

        res.json({ 
            success: true, 
            message: 'Homepage data seeded successfully',
            quickSearches: quickSearches.length,
            virtualStores: virtualStores.length
        });
    } catch (err) {
        console.error('Seed error:', err);
        res.status(500).json({ error: 'Seeding failed', details: err.message });
    }
});

// Use a sensible default port for local development if PORT is not set
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log('MongoDB Connected');
        app.listen(PORT, () => console.log(`Server running on ${PORT}`));
    })
    .catch(err => console.log('MongoDB connection error:', err));