const express = require('express');
const router = express.Router();

const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const verifyToken = require('../middlewares/verifyToken');

router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalOrders,
      totalProducts,
      totalUsers,
      deliveredOrders,
      cancelledOrders,
      todayOrders,
      orderStatusStats,
      paymentMethodStats,
      topProducts,
      monthlyRevenue,
      revenueTotals,
      todayRevenueTotals,
    ] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments(),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'cancelled' }),
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $group: { _id: '$paymentMethod', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Order.aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.name',
            count: { $sum: '$items.quantity' },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 7 },
      ]),
      Order.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            total: {
              $sum: {
                $ifNull: ['$total', { $ifNull: ['$grandTotal', 0] }],
              },
            },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
      ]),
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: {
                $ifNull: ['$total', { $ifNull: ['$grandTotal', 0] }],
              },
            },
          },
        },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfToday } } },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: {
                $ifNull: ['$total', { $ifNull: ['$grandTotal', 0] }],
              },
            },
          },
        },
      ]),
    ]);

    const statusMap = orderStatusStats.reduce((acc, item) => {
      acc[item._id || 'unknown'] = item.count;
      return acc;
    }, {});

    const monthlyOrders = monthlyRevenue.map((entry) => ({
      _id: `${entry._id.month}/${entry._id.year}`,
      total: entry.total,
    }));

    return res.json({
      totalRevenue: Math.round(revenueTotals?.[0]?.totalRevenue || 0),
      totalOrders,
      totalProducts,
      totalUsers,
      todayRevenue: Math.round(todayRevenueTotals?.[0]?.totalRevenue || 0),
      todayOrders,
      deliveredOrders,
      cancelledOrders,
      orderStatusStats: statusMap,
      paymentMethodStats,
      topProducts,
      monthlyOrders,
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    return res.status(500).json({ message: 'Failed to load dashboard analytics' });
  }
});

module.exports = router;