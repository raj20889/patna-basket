const mongoose = require('mongoose');

const EVENT_TYPES = [
  'PRODUCT_IMPRESSION',
  'PRODUCT_CARD_CLICK',
  'PRODUCT_DETAIL_VIEW',
  'PRODUCT_IMAGE_CLICK',
  'ADD_TO_CART',
  'REMOVE_FROM_CART',
  'WISHLIST_ADD',
  'WISHLIST_REMOVE',
  'BUY_NOW_CLICK',
  'CHECKOUT_STARTED',
  'ORDER_PLACED',
  'PAYMENT_SUCCESS',
  'ORDER_CANCELLED'
];

const EVENT_SOURCES = ['homepage', 'category_listing', 'search_results', 'recommendation', 'product_details', 'cart', 'checkout', 'order'];

const productInteractionEventSchema = new mongoose.Schema({
  eventType: { type: String, enum: EVENT_TYPES, required: true, index: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  productName: { type: String, required: true, trim: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  anonymousId: { type: String, trim: true, maxlength: 100, index: true },
  sessionId: { type: String, required: true, trim: true, maxlength: 100, index: true },
  eventId: { type: String, required: true, unique: true, trim: true, maxlength: 100 },
  eventSource: { type: String, enum: EVENT_SOURCES, default: 'homepage', index: true },
  searchQuery: { type: String, trim: true, maxlength: 200 },
  categoryContext: { type: String, trim: true, maxlength: 100 },
  deviceCategory: { type: String, enum: ['mobile', 'tablet', 'desktop', 'unknown'], default: 'unknown', index: true },
  browser: { type: String, trim: true, maxlength: 80 },
  referrer: { type: String, trim: true, maxlength: 500 },
  quantity: { type: Number, min: 1 },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', index: true },
  occurredAt: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

productInteractionEventSchema.index({ productId: 1, occurredAt: -1 });
productInteractionEventSchema.index({ userId: 1, occurredAt: -1 });
productInteractionEventSchema.index({ anonymousId: 1, occurredAt: -1 });
productInteractionEventSchema.index({ eventType: 1, productId: 1, occurredAt: -1 });

module.exports = mongoose.model('ProductInteractionEvent', productInteractionEventSchema);