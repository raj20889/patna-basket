const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Address = require('../models/Address');
const Product = require('../models/Product'); // Import Product model for price validation
const verifyToken = require('../middlewares/verifyToken');
const { check, validationResult } = require('express-validator');

// Create new order with validation
router.post(
  '/',
  [
    verifyToken,
    check('addressId', 'Address ID is required').not().isEmpty(),
    check('paymentMethod', 'Payment method is required').not().isEmpty(),
    check('items', 'Order items are required').isArray({ min: 1 }),
    check('items.*.productId', 'Product ID is required').not().isEmpty(),
    check('items.*.quantity', 'Quantity must be at least 1').isInt({ min: 1 })
  ],
  async (req, res) => {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { addressId, paymentMethod, items, orderNotes } = req.body;
      
      // Verify address belongs to user
      const address = await Address.findOne({ _id: addressId, userId: req.user.id });
      if (!address) {
        return res.status(404).json({ msg: 'Address not found or does not belong to user' });
      }

      // Validate products and get current prices
      const productIds = items.map(item => item.productId);
      const products = await Product.find({ _id: { $in: productIds } });
      
      if (products.length !== items.length) {
        return res.status(400).json({ msg: 'One or more products not found' });
      }

      // Map items with verified prices
      const verifiedItems = items.map(item => {
        const product = products.find(p => p._id.toString() === item.productId);
        return {
          productId: product._id,
          name: product.name,
          image: product.image,
          unit: product.unit || '1 item',
          price: product.price,
          quantity: item.quantity
        };
      });

      // Calculate totals
      const subtotal = verifiedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const deliveryFee = 40; // Could be dynamic based on address
      const total = subtotal + deliveryFee;

      // Create new order
      const newOrder = new Order({
        userId: req.user.id,
        address: {
          addressId: address._id,
          details: `${address.addressType === 'Other' ? address.customName : address.addressType}: ${address.building}, ${address.locality}`
        },
        items: verifiedItems,
        paymentMethod,
        subtotal,
        deliveryFee,
        total,
        orderNotes: orderNotes || '',
        status: paymentMethod === 'COD' ? 'confirmed' : 'pending_payment',
        paymentStatus: paymentMethod === 'COD' ? 'completed' : 'pending'
      });

      await newOrder.save();

      // In a real app, you might want to clear the user's cart here
      // await Cart.deleteMany({ userId: req.user.id });

      if (paymentMethod !== 'COD') {
        // Generate payment gateway URL
        const paymentUrl = await generatePaymentGatewayUrl(newOrder._id, total);
        return res.status(201).json({ 
          success: true,
          paymentUrl,
          orderId: newOrder._id,
          message: 'Redirect to payment gateway'
        });
      }

      // For COD orders
      res.status(201).json({
        success: true,
        orderId: newOrder._id,
        message: 'Order placed successfully',
        order: {
          id: newOrder._id,
          status: newOrder.status,
          total: newOrder.total,
          estimatedDelivery: new Date(Date.now() + 3*24*60*60*1000) // 3 days from now
        }
      });

    } catch (err) {
      console.error('Order creation error:', err);
      
      if (err.name === 'ValidationError') {
        return res.status(400).json({ 
          success: false,
          msg: 'Validation error',
          errors: Object.values(err.errors).map(val => val.message) 
        });
      }

      res.status(500).json({ 
        success: false,
        msg: 'Server error during order creation',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
);

// Get order by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Get all orders for user
router.get('/', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Mock payment gateway integration
async function generatePaymentGatewayUrl(orderId, amount) {
  // In a real implementation, this would integrate with Razorpay, Stripe, etc.
  // For development, you might want to return a mock payment URL
  if (process.env.NODE_ENV === 'development') {
    return `http://localhost:5000/api/mock-payment?orderId=${orderId}&amount=${amount}`;
  }
  
  // Production implementation would go here
  throw new Error('Payment gateway not configured');
}

module.exports = router;