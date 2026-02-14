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

// PORT define FIRST
const PORT = process.env.PORT || 5000;

// Connect DB and start server
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('MongoDB Connected');

    const server = app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });

    // Socket.io setup
    const io = require("socket.io")(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    io.on("connection", (socket) => {
      console.log("New WebSocket connection:", socket.id);

      socket.on("disconnect", () => {
        console.log("WebSocket disconnected:", socket.id);
      });
    });

    app.set("io", io);
  })
  .catch(err => console.log('MongoDB connection error:', err));
