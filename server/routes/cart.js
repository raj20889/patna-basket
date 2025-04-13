const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

// Add to Cart
router.post('/add', verifyToken, async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        let cart = await Cart.findOne({ userId: req.user.id });

        if (cart) {
            const itemIndex = cart.products.findIndex(p => p.productId == productId);

            if (itemIndex > -1) {
                cart.products[itemIndex].quantity += quantity;
            } else {
                cart.products.push({ productId, quantity });
            }

        } else {
            cart = new Cart({
                userId: req.user.id,
                products: [{ productId, quantity }],
            });
        }

        await cart.save();
        res.status(200).json({ msg: 'Cart Updated', cart });

    } catch (err) {
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// Get Cart
router.get('/', verifyToken, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id }).populate('products.productId');
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// Remove Product from Cart
router.put('/remove', verifyToken, async (req, res) => {
    const { productId } = req.body;

    try {
        const cart = await Cart.findOne({ userId: req.user.id });

        if (!cart) return res.status(404).json({ msg: 'Cart Not Found' });

        cart.products = cart.products.filter(p => p.productId != productId);

        await cart.save();
        res.status(200).json({ msg: 'Product Removed', cart });

    } catch (err) {
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

module.exports = router;
