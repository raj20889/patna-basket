const dns = require('dns');
// Force Node to use Google DNS for SRV resolution
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const compression = require('compression');

dotenv.config();

const app = express();

// Routes
const authRoute = require('./routes/auth');
const productRoute = require('./routes/product');
const cartRoute = require('./routes/cart');
const addressRoutes = require('./routes/addressRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userOrderRoutes = require('./routes/order');
const userRoutes = require('./routes/users');
const categoryRoute = require('./routes/category');
const subcategoryRoute = require('./routes/subcategory');
const homeSectionRoute = require('./routes/homeSection');
const bannerRoute = require('./routes/banner');
const deliveryPromiseRoute = require('./routes/deliveryPromise');
const quickSearchRoute = require('./routes/quickSearch');
const trendingSearchRoute = require('./routes/virtualStores');
const storesRoute = require('./routes/stores');
const notificationRoutes = require('./routes/notificationRoutes');
const geocodeRoute = require('./routes/geocode');

// Keep-alive service
require('./keepAlive');

// Enable compression
app.use(compression());

// CORS config
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
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.has(origin)) return callback(null, true);
      return callback(new Error('CORS policy: Origin not allowed'));
    },
    credentials: true,
  })
);

app.use(express.json());

// Routes setup
app.use('/auth', authRoute);
app.use('/products', productRoute);
app.use('/cart', cartRoute);
app.use('/addresses', addressRoutes);
app.use('/orders', orderRoutes);
app.use('/user-orders', userOrderRoutes);
app.use('/notifications', notificationRoutes);
app.use('/users', userRoutes);
app.use('/categories', categoryRoute);
app.use('/subcategories', subcategoryRoute);
app.use('/home-sections', homeSectionRoute);
app.use('/banners', bannerRoute);
app.use('/delivery-promise', deliveryPromiseRoute);
app.use('/quick-searches', quickSearchRoute);
app.use('/trending-searches', trendingSearchRoute);
app.use('/stores', storesRoute);
app.use('/geocode', geocodeRoute);

// PORT define
const PORT = process.env.PORT || 5000;

// Mongoose Connection
const connectWithRetry = () => {
  mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Fail fast if cannot connect
  })
  .then(() => {
    console.log('✅ MongoDB Connected');

    // Start server after DB connection
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // Initialize Socket.io
    const { initSocket } = require("./socket");
    const io = initSocket(server);

    io.on("connection", (socket) => {
      console.log("🟢 New WebSocket connection (Deployed):", socket.id);

      const updateStock = (productId, newStock) => {
        console.log("[Deployed] Emitting stock update:", { productId, stock: newStock });
        io.emit("stockUpdate", { productId, stock: newStock });
      };

      socket.on("lockStock", ({ productId, quantity }) => {
        console.log("[Deployed] Locking stock:", { productId, quantity });
        if (!lockedStock[productId]) lockedStock[productId] = 0;
        lockedStock[productId] += quantity;
        updateStock(productId, totalStock[productId] - lockedStock[productId]);
      });

      socket.on("releaseStock", ({ productId, quantity }) => {
        console.log("[Deployed] Releasing stock:", { productId, quantity });
        if (lockedStock[productId]) lockedStock[productId] -= quantity;
        updateStock(productId, totalStock[productId] - lockedStock[productId]);
      });

      socket.on("disconnect", () => {
        console.log("🔴 WebSocket disconnected (Deployed):", socket.id);
      });
    });

    module.exports.io = io; // Export the io instance

  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⏳ Retrying in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  });
};

// Connect to DB
connectWithRetry();