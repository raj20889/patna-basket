const express = require('express');
const Order = require('../models/Order');
const verifyToken = require('../middlewares/verifyToken');
const router = express.Router();

// Get all orders (Admin only)
router.get('/', verifyToken, async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Query parameters
    const { status, paymentStatus, page = 1, limit = 10, search } = req.query;
    const query = {};

    // Apply filters
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    // Search functionality
    if (search) {
      // Try to find exact match for _id first
      if (mongoose.Types.ObjectId.isValid(search)) {
        query._id = search;
      } else {
        // If not a valid ObjectId, search by user name/phone
        const users = await User.find({
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
          ]
        }).select('_id');
        
        query.userId = { $in: users.map(u => u._id) };
      }
    }

    // Get orders with pagination
    const orders = await Order.find(query)
      .populate({
        path: 'userId',
        select: 'name phone',
        model: 'User'
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Count total orders for pagination
    const count = await Order.countDocuments(query);

    // Transform orders to match expected schema
    const transformedOrders = orders.map(order => ({
      _id: order._id,
      userId: order.userId,
      address: order.address,
      items: order.items,
      paymentMethod: order.paymentMethod,
      itemsTotal: order.subtotal,       // Map subtotal to itemsTotal
      deliveryCharge: order.deliveryFee, // Map deliveryFee to deliveryCharge
      grandTotal: order.total,          // Map total to grandTotal
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

module.exports = router;