const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();
const authRoute = require('./routes/auth');
const productRoute = require('./routes/product');
const cartRoute = require('./routes/cart');
const addressRoutes = require('./routes/addressRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userOrderRoutes = require('./routes/order'); // Renamed for clarity
// In your main app file (app.js/server.js)
const userRoutes = require('./routes/users');







dotenv.config();

// Configure CORS to allow requests from your frontend's domain
// Replace 'https://your-frontend-domain.com' with the actual domain of your deployed frontend
app.use(cors({
  origin: 'https://patna-basket-r0uhf6e5g-mohit-rajs-projects-8c1c79e9.vercel.app', 
  credentials: true // if you are sending cookies/authentication headers
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoute);
app.use('/api/products', productRoute);
app.use('/api/cart', cartRoute);
app.use('/api/addresses', addressRoutes);
app.use('/api/orders', orderRoutes); // For admin
app.use('/api/user-orders', userOrderRoutes);
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes); // For user orders
app.use('/api/users', userRoutes);






app.get('/', (req, res) => {
    res.send('E-Commerce API Running...');
});

const PORT = process.env.PORT;

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log('MongoDB Connected');
        app.listen(PORT, () => console.log(`Server running on ${PORT}`));
    })
    .catch(err => console.log('MongoDB connection error:', err));