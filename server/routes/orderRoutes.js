const express = require('express');
const router = express.Router(); // Initialize router
const Order = require('../models/Order');
const User = require('../models/User'); // Make sure User model is imported
const mongoose = require('mongoose'); // Make sure mongoose is imported
const verifyToken = require('../middlewares/verifyToken');

// Middleware to check user role
const checkRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

// Get all orders (Admin only)
router.get('/', verifyToken, checkRole(['admin']), async (req, res) => {
  console.log('Received query parameters at start of route (All Orders):', req.query); // Debugging line
  try {
    const { page = 1, limit = 10, search, status, paymentStatus } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (paymentStatus && paymentStatus !== '') {
      query.paymentStatus = paymentStatus;
    }

    if (search) {
      const isObjectId = mongoose.Types.ObjectId.isValid(search);

      if (isObjectId) {
        query._id = search;
      } else {
        // Search for users by name or phone
        const users = await User.find({
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
          ]
        }).select('_id');

        const userIds = users.map(user => user._id);
        
        // Build a query that searches by user ID or by a partial match on the string representation of the _id
        const searchConditions = [];
        if (userIds.length > 0) {
          searchConditions.push({ userId: { $in: userIds } });
        }

        // Add regex search for _id by treating it as a string
        // This allows searching for parts of the id like '27C2CF'
        searchConditions.push({ $expr: { $regexMatch: { input: { $toString: '$_id' }, regex: search, options: 'i' } } });

        if (searchConditions.length > 0) {
          query.$or = searchConditions;
        }
      }
    }

    console.log('Final query before Order.find():', JSON.stringify(query, null, 2));

    const orders = await Order.find(query)
      .populate({
        path: 'userId',
        select: 'name phone',
        model: 'User'
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    console.log('Found orders:', orders.length); // Added for debugging

    // Count total orders for pagination
    const count = await Order.countDocuments(query);

    // Transform orders to match expected schema
    const transformedOrders = orders.map(order => ({
      _id: order._id,
      userId: order.userId,
      address: order.address,
      items: order.items,
      paymentMethod: order.paymentMethod,
      itemsTotal: order.subtotal || order.itemsTotal || 0,       // Map subtotal to itemsTotal
      deliveryCharge: order.deliveryFee || order.deliveryCharge || 0, // Map deliveryFee to deliveryCharge
      grandTotal: order.total || order.grandTotal || 0,          // Map total to grandTotal with fallback
      status: order.status,
      paymentStatus: order.paymentStatus,
      orderNotes: order.orderNotes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      __v: order.__v
    }));

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      orders: transformedOrders
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error.message 
    });
  }
});

// Get order details
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name phone')
      .populate('items.productId', 'name images');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Transform fields
    const transformedOrder = {
      ...order._doc,
      itemsTotal: order.subtotal || order.itemsTotal,
      deliveryCharge: order.deliveryFee || order.deliveryCharge,
      grandTotal: order.total || order.grandTotal
    };

    res.status(200).json({ success: true, order: transformedOrder });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Update order status
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending_payment', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Add new route to update payment status
router.put('/:id/payment-status', verifyToken, async (req, res) => {

// Add new route to update carrier and tracking number
router.put('/:id/delivery-details', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { carrier, trackingNumber } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (carrier) {
      order.carrier = carrier;
    }
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    await order.save();

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Error updating delivery details:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});
  try {
    const { paymentStatus } = req.body;
    const validPaymentStatuses = ['pending', 'paid', 'refunded']; // Define valid payment statuses

    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid payment status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;