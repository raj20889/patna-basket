const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Address = require('../models/Address');
const Product = require('../models/Product');
const verifyToken = require('../middlewares/verifyToken');
const { check, validationResult } = require('express-validator');
const Razorpay = require('razorpay');
const { RAZORPAY } = require('../config/payment');
const { getSocket } = require("../socket"); // Import getSocket to emit WebSocket events

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: RAZORPAY.KEY_ID,
  key_secret: RAZORPAY.KEY_SECRET,
});

// Create new order with validation
router.post(
  '/',
  [
    verifyToken,
    check('addressId', 'Address ID is required').not().isEmpty(),
    check('paymentMethod', 'Payment method is required').not().isEmpty(),
    check('items', 'Order items are required').isArray({ min: 1 }),
    check('items.*.productId', 'Product ID is required').not().isEmpty(),
    check('items.*.quantity', 'Quantity must be at least 1').isInt({ min: 1 }),
    check('itemsTotal', 'Items total is required').isFloat({ min: 0 }),
    check('grandTotal', 'Grand total is required').isFloat({ min: 0 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    try {
      const {
        addressId,
        paymentMethod,
        items,
        orderNotes = '',
        tipAmount = 0,
        donationAmount = 0,
        itemsTotal,
        deliveryCharge = 0,
        handlingCharge = 2,
        grandTotal
      } = req.body;
      
      // Verify address belongs to user
      const address = await Address.findOne({ _id: addressId, userId: req.user.id });
      if (!address) {
        return res.status(404).json({ 
          success: false,
          msg: 'Address not found or does not belong to user' 
        });
      }

      // Validate products exist (but use prices from frontend for the order)
      const productIds = items.map(item => item.productId);
      const products = await Product.find({ _id: { $in: productIds } });
      
      if (products.length !== items.length) {
        return res.status(400).json({ 
          success: false,
          msg: 'One or more products not found!' 
        });
      }

      // Start a transaction for stock validation and order placement
      const session = await Product.startSession();
      session.startTransaction();

      try {
        // Update stock for each product in the order
        for (const item of items) {
          const product = await Product.findById(item.productId).session(session);
          if (!product) {
            throw new Error(`Product not found: ${item.productId}`);
          }

          // Check if stock is sufficient
          if (product.stock < item.quantity) {
            throw new Error(`Insufficient stock for product: ${product.name}`);
          }

          product.stock -= item.quantity;
          await product.save({ session });

          // Emit stock update event
          const io = require('../socket').getSocket();
          io.emit('stockUpdate', { productId: product._id, stock: product.stock });
          console.log('Stock update emitted:', { productId: product._id, stock: product.stock });
        }

        // Create new order
        const newOrder = new Order({
          userId: req.user.id,
          address: address._id,
          items: items.map(item => ({
            productId: item.productId,
            name: item.name || 'Product',
            image: item.image || null,
            variant: item.variant || '1 unit',
            price: item.price,
            quantity: item.quantity
          })),
          paymentMethod,
          itemsTotal: parseFloat(itemsTotal),
          deliveryCharge: parseFloat(deliveryCharge),
          handlingCharge: parseFloat(handlingCharge),
          tipAmount: parseFloat(tipAmount),
          donationAmount: parseFloat(donationAmount),
          grandTotal: parseFloat(grandTotal),
          orderNotes,
          status: paymentMethod === 'COD' ? 'confirmed' : 'pending_payment',
          paymentStatus: paymentMethod === 'COD' ? 'pending' : 'pending'
        });

        await newOrder.save({ session });

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ success: true, orderId: newOrder._id });
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ success: false, message: error.message });
      }
    } catch (err) {

      
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
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('address');
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // The populated data will be available in order.address.addressId
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// Get order by ID
router.get(
  '/:id',
  [
    verifyToken,
    check('id', 'Order ID is required').not().isEmpty().isMongoId()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    try {
      const order = await Order.findOne({ 
        _id: req.params.id, 
        userId: req.user.id 
      }).populate('userId', 'name email')
        .populate('address.addressId')
        .populate('items.productId', 'name images price');

      if (!order) {
        return res.status(404).json({ 
          success: false,
          msg: 'Order not found' 
        });
      }

      res.json({
        success: true,
        order: formatOrderResponse(order)
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ 
        success: false,
        msg: 'Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
);

// Get all orders for user
router.get(
  '/',
  [
    verifyToken,
    check('page', 'Page must be a positive integer').optional().isInt({ min: 1 }),
    check('limit', 'Limit must be a positive integer').optional().isInt({ min: 1 }),
    check('status', 'Invalid status value').optional().isString(),
    check('paymentStatus', 'Invalid payment status value').optional().isString()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Order validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    try {
      const { page = 1, limit = 10, status, paymentStatus } = req.query;
      const skip = (page - 1) * limit;

      const query = { userId: req.user.id };
      if (status) query.status = status;
      if (paymentStatus) {
        query.paymentStatus = paymentStatus;
        console.log('Payment status received in backend:', paymentStatus); // Added for debugging
      }

      console.log('Final query before Mongoose find:', query); // Added for debugging
      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const totalOrders = await Order.countDocuments(query);

      res.json({
        success: true,
        orders: orders.map(formatOrderResponse),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalOrders,
          pages: Math.ceil(totalOrders / limit)
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ 
        success: false,
        msg: 'Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
);

// Reintroduced the order cancellation route
router.patch(
  '/:id/cancel',
  [
    verifyToken,
    check('id', 'Order ID is required').not().isEmpty().isMongoId()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    try {
      const order = await Order.findOne({
        _id: req.params.id,
        userId: req.user.id
      });

      if (!order) {
        return res.status(404).json({ 
          success: false,
          msg: 'Order not found' 
        });
      }

      // Check if order can be cancelled
      if (!['pending_payment', 'confirmed', 'preparing'].includes(order.status)) {
        return res.status(400).json({ 
          success: false,
          msg: 'Order cannot be cancelled at this stage' 
        });
      }

      // Refund logic for prepaid orders
      if (order.paymentMethod !== 'COD') {
        try {
          const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
            amount: order.grandTotal * 100 // Amount in paise
          });
          console.log('Refund successful:', refund);
        } catch (refundError) {
          console.error('Refund failed:', refundError);
          return res.status(500).json({ 
            success: false,
            msg: 'Refund failed. Please try again later.' 
          });
        }
      }

      order.status = 'cancelled';
      order.cancelledAt = new Date();
      await order.save();

      // Emit WebSocket event
      const io = require('../socket').getSocket();
      io.emit('orderCancelled', { orderId: order._id, status: order.status });

      res.json({
        success: true,
        msg: 'Order cancelled successfully',
        order: formatOrderResponse(order)
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ 
        success: false,
        msg: 'Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
);

// Add a route for users to cancel their orders
router.put('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if the order can be cancelled
    const cancellableStatuses = ['pending_payment', 'confirmed', 'preparing'];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
    }

    // Update the order status to 'cancelled'
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    await order.save();

    res.status(200).json({ success: true, message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Helper functions
function calculateDeliveryCharge(address) {
  // Implement your delivery charge logic based on address
  // This is a simple example - adjust based on your needs
  return 0; // Flat rate for now
}

function formatAddressDetails(address) {
  return `${address.addressType === 'Other' ? address.customName : address.addressType}: ${address.building}, ${address.locality}, ${address.city} - ${address.pincode}`;
}

function formatOrderResponse(order) {
  return {
    id: order._id,
    userId: order.userId,
    address: order.address,
    items: order.items,
    paymentMethod: order.paymentMethod,
    itemsTotal: order.itemsTotal,
    deliveryCharge: order.deliveryCharge,
    handlingCharge: order.handlingCharge,
    tipAmount: order.tipAmount,
    donationAmount: order.donationAmount,
    grandTotal: order.grandTotal,
    orderNotes: order.orderNotes,
    status: order.status,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    estimatedDelivery: order.estimatedDelivery?.toISOString()
  };
}

async function generatePaymentGatewayUrl(orderId, amount) {
  // In a real implementation, this would integrate with Razorpay, Stripe, etc.
  if (process.env.NODE_ENV === 'development') {
    return `${process.env.VITE_API_BASE_URL}/mock-payment?orderId=${orderId}&amount=${amount}`;
  }
  
  // Production implementation would go here
  throw new Error('Payment gateway not configured');
}

module.exports = router;