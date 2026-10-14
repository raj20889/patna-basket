const express = require('express');
const router = express.Router();

const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const ProductInteractionEvent = require('../models/ProductInteractionEvent');
const verifyToken = require('../middlewares/verifyToken');
const { randomUUID } = require('crypto');

const EVENT_TYPES = new Set([
  'PRODUCT_IMPRESSION', 'PRODUCT_CARD_CLICK', 'PRODUCT_DETAIL_VIEW', 'PRODUCT_IMAGE_CLICK',
  'ADD_TO_CART', 'REMOVE_FROM_CART', 'WISHLIST_ADD', 'WISHLIST_REMOVE', 'BUY_NOW_CLICK',
  'CHECKOUT_STARTED', 'ORDER_PLACED', 'PAYMENT_SUCCESS', 'ORDER_CANCELLED'
]);
const EVENT_SOURCES = new Set(['homepage', 'category_listing', 'search_results', 'recommendation', 'product_details', 'cart', 'checkout', 'order']);

const optionalToken = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();
  return verifyToken(req, _res, next);
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  return next();
};

const parseDateRange = (query) => {
  const end = query.end ? new Date(query.end) : new Date();
  const start = query.start ? new Date(query.start) : new Date(end.getTime() - 29 * 24 * 60 * 60 * 1000);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return null;
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const principalExpression = { $ifNull: ['$userId', '$anonymousId'] };

const normalizeEvent = async (req, event) => {
  if (!EVENT_TYPES.has(event.eventType) || !EVENT_SOURCES.has(event.eventSource || 'homepage')) {
    const error = new Error('Invalid product analytics event');
    error.status = 400;
    throw error;
  }
  if (!event.productId || !event.sessionId || (!req.user && !event.anonymousId)) {
    const error = new Error('productId, sessionId, and anonymousId are required for guest events');
    error.status = 400;
    throw error;
  }
  if (event.quantity !== undefined && (!Number.isInteger(event.quantity) || event.quantity < 1)) {
    const error = new Error('quantity must be a positive integer');
    error.status = 400;
    throw error;
  }
  const product = await Product.findById(event.productId).select('_id name');
  if (!product) {
    const error = new Error('Product not found');
    error.status = 404;
    throw error;
  }
  return {
    eventType: event.eventType,
    productId: product._id,
    productName: product.name,
    userId: req.user?.id,
    anonymousId: req.user ? undefined : String(event.anonymousId).slice(0, 100),
    sessionId: String(event.sessionId).slice(0, 100),
    eventId: String(event.eventId || randomUUID()).slice(0, 100),
    eventSource: event.eventSource || 'homepage',
    searchQuery: event.searchQuery,
    categoryContext: event.categoryContext,
    deviceCategory: ['mobile', 'tablet', 'desktop'].includes(event.deviceCategory) ? event.deviceCategory : 'unknown',
    browser: event.browser,
    referrer: event.referrer,
    quantity: event.quantity,
    orderId: event.orderId,
    occurredAt: event.occurredAt ? new Date(event.occurredAt) : new Date()
  };
};

router.post('/events', optionalToken, async (req, res) => {
  try {
    const event = await ProductInteractionEvent.create(await normalizeEvent(req, req.body));
    return res.status(201).json({ success: true, eventId: event.eventId });
  } catch (error) {
    if (error.code === 11000) return res.status(200).json({ success: true, duplicate: true });
    return res.status(error.status || 500).json({ success: false, message: error.status ? error.message : 'Failed to record product event' });
  }
});

router.post('/events/batch', optionalToken, async (req, res) => {
  try {
    if (!Array.isArray(req.body.events) || req.body.events.length > 50) return res.status(400).json({ message: 'events must contain at most 50 items' });
    const events = await Promise.all(req.body.events.map((event) => normalizeEvent(req, event)));
    const result = await ProductInteractionEvent.insertMany(events, { ordered: false });
    return res.status(201).json({ success: true, accepted: result.length });
  } catch (error) {
    if (error.code === 11000 || error.writeErrors?.every((item) => item.code === 11000)) return res.status(200).json({ success: true, duplicate: true });
    return res.status(error.status || 500).json({ success: false, message: error.status ? error.message : 'Failed to record product events' });
  }
});

router.get('/products', verifyToken, adminOnly, async (req, res) => {
  try {
    const range = parseDateRange(req.query);
    if (!range) return res.status(400).json({ message: 'Invalid date range' });
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
    const productQuery = {};
    if (req.query.search) productQuery.name = { $regex: req.query.search.trim(), $options: 'i' };
    if (req.query.category) productQuery.category = req.query.category;

    const [products, totalProducts] = await Promise.all([
      Product.find(productQuery).select('name image category').sort({ name: 1 }).lean(),
      Product.countDocuments(productQuery)
    ]);
    const productIds = products.map((product) => product._id);
    const eventStats = await ProductInteractionEvent.aggregate([
      { $match: { productId: { $in: productIds }, occurredAt: { $gte: range.start, $lte: range.end } } },
      { $group: {
        _id: '$productId',
        impressions: { $sum: { $cond: [{ $eq: ['$eventType', 'PRODUCT_IMPRESSION'] }, 1, 0] } },
        detailViews: { $sum: { $cond: [{ $eq: ['$eventType', 'PRODUCT_DETAIL_VIEW'] }, 1, 0] } },
        clicks: { $sum: { $cond: [{ $eq: ['$eventType', 'PRODUCT_CARD_CLICK'] }, 1, 0] } },
        imageNameClicks: { $sum: { $cond: [{ $in: ['$eventType', ['PRODUCT_IMAGE_CLICK', 'PRODUCT_CARD_CLICK']] }, 1, 0] } },
        addToCart: { $sum: { $cond: [{ $eq: ['$eventType', 'ADD_TO_CART'] }, 1, 0] } },
        removeFromCart: { $sum: { $cond: [{ $eq: ['$eventType', 'REMOVE_FROM_CART'] }, 1, 0] } },
        wishlist: { $sum: { $cond: [{ $in: ['$eventType', ['WISHLIST_ADD', 'WISHLIST_REMOVE']] }, 1, 0] } },
        buyNow: { $sum: { $cond: [{ $eq: ['$eventType', 'BUY_NOW_CLICK'] }, 1, 0] } },
        checkoutStarted: { $sum: { $cond: [{ $eq: ['$eventType', 'CHECKOUT_STARTED'] }, 1, 0] } },
        viewers: { $addToSet: { $cond: [{ $eq: ['$eventType', 'PRODUCT_DETAIL_VIEW'] }, principalExpression, null] } },
        adders: { $addToSet: { $cond: [{ $eq: ['$eventType', 'ADD_TO_CART'] }, principalExpression, null] } },
        guestViewers: { $addToSet: { $cond: [{ $and: [{ $eq: ['$eventType', 'PRODUCT_DETAIL_VIEW'] }, { $eq: ['$userId', null] }] }, '$anonymousId', null] } }
      } }
    ]);

    const orderStats = await Order.aggregate([
      { $match: { status: { $in: ['confirmed', 'preparing', 'shipped', 'delivered'] }, createdAt: { $gte: range.start, $lte: range.end } } },
      { $unwind: '$items' },
      { $match: { $expr: { $in: [{ $toString: '$items.productId' }, productIds.map(String)] } } },
      { $group: { _id: { $toObjectId: '$items.productId' }, orders: { $addToSet: '$_id' }, unitsSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, buyers: { $addToSet: '$userId' } } }
    ]);
    const eventMap = new Map(eventStats.map((item) => [String(item._id), item]));
    const orderMap = new Map(orderStats.map((item) => [String(item._id), item]));
    const rows = products.map((product) => {
      const event = eventMap.get(String(product._id)) || {};
      const order = orderMap.get(String(product._id)) || {};
      const uniqueViewers = (event.viewers || []).filter(Boolean).length;
      const uniqueGuests = (event.guestViewers || []).filter(Boolean).length;
      const uniqueAdders = (event.adders || []).filter(Boolean).length;
      const uniqueBuyers = (order.buyers || []).filter(Boolean).length;
      return {
        ...product,
        impressions: event.impressions || 0, detailViews: event.detailViews || 0, clicks: event.clicks || 0,
        imageNameClicks: event.imageNameClicks || 0, addToCart: event.addToCart || 0, removeFromCart: event.removeFromCart || 0,
        wishlist: event.wishlist || 0, buyNow: event.buyNow || 0, checkoutStarted: event.checkoutStarted || 0,
        orders: (order.orders || []).length, unitsSold: order.unitsSold || 0, revenue: order.revenue || 0,
        uniqueViewers, uniqueGuests, ctr: event.impressions ? (event.clicks / event.impressions) * 100 : 0,
        viewToCartRate: uniqueViewers ? (uniqueAdders / uniqueViewers) * 100 : 0,
        viewToOrderRate: uniqueViewers ? (uniqueBuyers / uniqueViewers) * 100 : 0
      };
    });
    const sortFields = { viewed: 'detailViews', clicked: 'clicks', added: 'addToCart', conversion: 'viewToOrderRate', revenue: 'revenue' };
    const sortField = sortFields[req.query.sort] || 'detailViews';
    rows.sort((a, b) => b[sortField] - a[sortField]);
    return res.json({ products: rows.slice((page - 1) * limit, page * limit), currentPage: page, totalPages: Math.ceil(totalProducts / limit), totalProducts, start: range.start, end: range.end });
  } catch (error) {
    console.error('Product analytics error:', error);
    return res.status(500).json({ message: 'Failed to load product analytics' });
  }
});

router.get('/products/:productId', verifyToken, adminOnly, async (req, res) => {
  try {
    const range = parseDateRange(req.query);
    if (!range) return res.status(400).json({ message: 'Invalid date range' });
    const product = await Product.findById(req.params.productId).select('name image category subcategory');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const match = { productId: product._id, occurredAt: { $gte: range.start, $lte: range.end } };
    const [summary, daily, devices, sources, hourly, recent, orders] = await Promise.all([
      ProductInteractionEvent.aggregate([{ $match: match }, { $group: { _id: null, impressions: { $sum: { $cond: [{ $eq: ['$eventType', 'PRODUCT_IMPRESSION'] }, 1, 0] } }, clicks: { $sum: { $cond: [{ $eq: ['$eventType', 'PRODUCT_CARD_CLICK'] }, 1, 0] } }, detailViews: { $sum: { $cond: [{ $eq: ['$eventType', 'PRODUCT_DETAIL_VIEW'] }, 1, 0] } }, addToCart: { $sum: { $cond: [{ $eq: ['$eventType', 'ADD_TO_CART'] }, 1, 0] } }, viewers: { $addToSet: principalExpression }, uniqueGuests: { $addToSet: { $cond: [{ $eq: ['$userId', null] }, '$anonymousId', null] } } } }]),
      ProductInteractionEvent.aggregate([{ $match: match }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$occurredAt' } }, views: { $sum: { $cond: [{ $eq: ['$eventType', 'PRODUCT_DETAIL_VIEW'] }, 1, 0] } }, clicks: { $sum: { $cond: [{ $eq: ['$eventType', 'PRODUCT_CARD_CLICK'] }, 1, 0] } }, impressions: { $sum: { $cond: [{ $eq: ['$eventType', 'PRODUCT_IMPRESSION'] }, 1, 0] } } } }, { $sort: { _id: 1 } }]),
      ProductInteractionEvent.aggregate([{ $match: { ...match, eventType: 'PRODUCT_DETAIL_VIEW' } }, { $group: { _id: '$deviceCategory', count: { $sum: 1 } } }]),
      ProductInteractionEvent.aggregate([{ $match: match }, { $group: { _id: '$eventSource', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      ProductInteractionEvent.aggregate([{ $match: match }, { $group: { _id: { $hour: '$occurredAt' }, count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      ProductInteractionEvent.find(match).sort({ occurredAt: -1 }).limit(50).select('-__v').lean(),
      Order.aggregate([{ $match: { status: { $in: ['confirmed', 'preparing', 'shipped', 'delivered'] }, createdAt: { $gte: range.start, $lte: range.end } } }, { $unwind: '$items' }, { $match: { $expr: { $eq: [{ $toString: '$items.productId' }, String(product._id)] } } }, { $group: { _id: null, orders: { $addToSet: '$_id' }, unitsSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } }])
    ]);
    const base = summary[0] || { impressions: 0, clicks: 0, detailViews: 0, addToCart: 0, viewers: [], uniqueGuests: [] };
    const order = orders[0] || { orders: [], unitsSold: 0, revenue: 0 };
    return res.json({ product, summary: { impressions: base.impressions, clicks: base.clicks, detailViews: base.detailViews, addToCart: base.addToCart, uniqueVisitors: base.viewers.filter(Boolean).length, uniqueGuests: base.uniqueGuests.filter(Boolean).length, ctr: base.impressions ? (base.clicks / base.impressions) * 100 : 0, orders: order.orders.length, unitsSold: order.unitsSold, revenue: order.revenue }, daily, devices, sources, hourly, recent, start: range.start, end: range.end });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load product detail analytics' });
  }
});

router.get('/user/:userId/products', verifyToken, adminOnly, async (req, res) => {
  const events = await ProductInteractionEvent.find({ userId: req.params.userId }).sort({ occurredAt: -1 }).limit(500).lean();
  return res.json({ events });
});

router.get('/guest/:anonymousId/products', verifyToken, adminOnly, async (req, res) => {
  const events = await ProductInteractionEvent.find({ anonymousId: req.params.anonymousId }).sort({ occurredAt: -1 }).limit(500).lean();
  return res.json({ events });
});

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