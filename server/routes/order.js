const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Address = require('../models/Address');
const Product = require('../models/Product');
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
          msg: 'One or more products not found' 
        });
      }

      // Create new order with the data from frontend (but verified)
      const newOrder = new Order({
        userId: req.user.id,
        address: {
          addressId: address._id,
          details: formatAddressDetails(address)
        },
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
        status: paymentMethod === 'COD' ?  'confirmed' :  'pending_payment',
        paymentStatus: paymentMethod === 'COD' ? 'pending':'completed'  
      });

      await newOrder.save();

      // Prepare response that matches frontend expectations
      const response = {
        success: true,
        orderId: newOrder._id,
        message: paymentMethod === 'COD' ? 'Order placed successfully' : 'Redirect to payment gateway',
        order: {
          id: newOrder._id,
          status: newOrder.status,
          grandTotal: newOrder.grandTotal,
          estimatedDelivery: newOrder.estimatedDelivery
        }
      };

      if (paymentMethod !== 'COD') {
        // In a real app, generate a real payment URL
        response.paymentUrl = await generatePaymentGatewayUrl(newOrder._id, newOrder.grandTotal);
      }

      res.status(201).json(response);

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
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate({
        path: 'address.addressId',
        select: 'contactName contactPhone'
      });
    
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
    check('status', 'Invalid status value').optional().isString()
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
      const { page = 1, limit = 10, status } = req.query;
      const skip = (page - 1) * limit;

      const query = { userId: req.user.id };
      if (status) query.status = status;

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

// Cancel an order
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
      if (!['pending', 'confirmed', 'processing'].includes(order.status)) {
        return res.status(400).json({ 
          success: false,
          msg: 'Order cannot be cancelled at this stage' 
        });
      }

      order.status = 'cancelled';
      order.cancelledAt = new Date();
      await order.save();

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
    estimatedDelivery: order.estimatedDelivery?.toISOString(),
    cancelledAt: order.cancelledAt?.toISOString()
  };
}

async function generatePaymentGatewayUrl(orderId, amount) {
  // In a real implementation, this would integrate with Razorpay, Stripe, etc.
  if (process.env.NODE_ENV === 'development') {
    return `http://localhost:5000/api/mock-payment?orderId=${orderId}&amount=${amount}`;
  }
  
  // Production implementation would go here
  throw new Error('Payment gateway not configured');
}

module.exports = router;