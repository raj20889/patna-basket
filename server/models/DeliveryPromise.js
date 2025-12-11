const mongoose = require('mongoose');

const deliveryPromiseSchema = new mongoose.Schema(
  {
    deliveryTime: {
      type: Number,
      required: true,
      default: 30,
      description: 'Delivery time value (e.g., 30 for 30 minutes)'
    },
    deliveryUnit: {
      type: String,
      enum: ['minutes', 'hours'],
      required: true,
      default: 'minutes'
    },
    promiseText: {
      type: String,
      required: true,
      default: 'or FREE',
      description: 'Promise text like "or FREE", "guaranteed", "on time"'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    backgroundColor: {
      type: String,
      default: '#00A82D',
      description: 'Hex color code for banner background'
    },
    icon: {
      type: String,
      default: '🚀',
      description: 'Emoji or icon name'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('DeliveryPromise', deliveryPromiseSchema);
