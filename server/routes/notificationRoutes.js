const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Route to get recent pending orders for admin users
router.get('/order-notifications', async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};

    if (status && ['pending_payment', 'confirmed', 'completed'].includes(status)) {
      filter.status = status;
      console.log(`Fetching orders with status: ${status}...`);
    } else {
      // Default to confirmed if no valid status is provided
      filter.status = 'confirmed';
      console.log('No valid status provided, defaulting to fetching confirmed orders...');
    }

   const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .limit(10);
    console.log(`Fetched ${status || 'confirmed'} orders:`, orders);

    const formattedNotifications = orders.map(order => {
      let message;
      switch (order.status) {
        case 'pending_payment':
          message = `New order from ${order.customerName || 'A customer'} with total $${order.grandTotal.toFixed(2) || 'N/A'} is pending payment.`;
          break;
        case 'confirmed':
          message = `Order from ${order.customerName || 'A customer'} with total $${order.grandTotal.toFixed(2) || 'N/A'} has been confirmed.`;
          break;
        case 'completed':
          message = `Order from ${order.customerName || 'A customer'} with total $${order.grandTotal.toFixed(2) || 'N/A'} has been completed.`;
          break;
        default:
          message = `Order from ${order.customerName || 'A customer'} with total $${order.grandTotal.toFixed(2) || 'N/A'} has status ${order.status}.`;
      }

      return {
        id: order._id,
        message,
        time: order.createdAt,
        orderId: order._id
      };
    });

    console.log(`Sending formatted notifications: ${formattedNotifications.length}`);
    res.json(formattedNotifications);
  } catch (error) {
    console.error('Error in /api/notifications/order-notifications route:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;