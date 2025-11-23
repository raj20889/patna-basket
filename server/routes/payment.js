const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const { RAZORPAY } = require('../config/payment');

const router = express.Router();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: RAZORPAY.KEY_ID,
  key_secret: RAZORPAY.KEY_SECRET,
});

/**
 * Create a Razorpay order for the specified order in DB
 * Body params: { orderId }
 * Returns: { success, razorpayOrderId, amount, currency, key }
 */
router.post('/razorpay/create-order', async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, msg: 'orderId is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, msg: 'Order not found' });
    }

    const amountInPaise = Math.round((order.grandTotal || order.total || 0) * 100);
    if (!amountInPaise) {
      return res.status(400).json({ success: false, msg: 'Invalid order amount' });
    }

    // Create Razorpay order
    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: String(order._id),
    });

    // Store the Razorpay order ID in our DB for later verification
    order.razorpayOrderId = rzpOrder.id;
    await order.save();

    return res.json({
      success: true,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      key: RAZORPAY.KEY_ID,
    });
  } catch (err) {
    console.error('Razorpay create-order error:', err);
    return res.status(500).json({ success: false, msg: 'Failed to create Razorpay order', error: err.message });
  }
});

/**
 * Verify Razorpay payment signature
 * Body params: { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }
 */
router.post('/razorpay/verify', async (req, res) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ success: false, msg: 'Missing required parameters' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, msg: 'Order not found' });
    }

    // Verify that razorpayOrderId matches what we stored
    if (order.razorpayOrderId !== razorpayOrderId) {
      return res.status(400).json({ success: false, msg: 'Order ID mismatch' });
    }

    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY.KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, msg: 'Invalid payment signature' });
    }

    // Payment verified
    order.paymentStatus = 'paid';
    order.status = 'confirmed';
    order.paymentMethod = 'RAZORPAY';
    order.paidAt = new Date();
    await order.save();

    return res.json({ success: true, msg: 'Payment verified successfully' });
  } catch (err) {
    console.error('Razorpay verify error:', err);
    return res.status(500).json({ success: false, msg: 'Payment verification failed', error: err.message });
  }
});

module.exports = router;

