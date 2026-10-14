const ProductInteractionEvent = require('../models/ProductInteractionEvent');

const recordProductEvent = async ({
  eventType,
  productId,
  productName,
  userId,
  sessionId = 'server',
  eventSource = 'order',
  quantity,
  orderId,
  eventId
}) => {
  if (!productId || !eventType) return null;

  return ProductInteractionEvent.create({
    eventType,
    productId,
    productName: productName || 'Product',
    userId,
    sessionId,
    eventSource,
    quantity,
    orderId,
    eventId: eventId || `server-${eventType}-${orderId || productId}-${Date.now()}-${Math.random().toString(36).slice(2)}`
  });
};

module.exports = { recordProductEvent };