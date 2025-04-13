const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

// Place Order
router.post('/place', verifyToken, async (req, res) => {
    const { address, deliveryType, deliveryCharge } = req.body;

    try {
        const cart = await Cart.findOne({ userId: req.user.id });

        if (!cart || cart.products.length === 0) {
            return res.status(400).json({ msg: 'Cart is empty' });
        }

        const newOrder = new Order({
            userId: req.user.id,
            products: cart.products,
            address,
            deliveryType,
            deliveryCharge,
            status: 'Pending'
        });

        await newOrder.save();
        await Cart.findOneAndDelete({ userId: req.user.id });

        // Socket Emit for Admin
        req.io.emit('orderPlaced', newOrder);

        res.status(201).json({ msg: 'Order Placed', order: newOrder });

    } catch (err) {
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// Get My Orders
router.get('/my', verifyToken, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// Admin - Get All Orders
router.get('/all', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access Denied' });

    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});
