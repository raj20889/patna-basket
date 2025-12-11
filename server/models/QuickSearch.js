const mongoose = require('mongoose');

const quickSearchSchema = new mongoose.Schema(
  {
    keyword: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    displayText: {
      type: String,
      required: true,
      description: 'Text shown on chip (can differ from keyword)'
    },
    icon: {
      type: String,
      default: '',
      description: 'Emoji or image URL for the chip'
    },
    displayOrder: {
      type: Number,
      default: 0,
      description: 'Position in quick search list (lower = higher priority)'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    clickCount: {
      type: Number,
      default: 0,
      description: 'Analytics: total number of clicks'
    },
    linkedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
    ],
    category: {
      type: String,
      enum: ['product', 'brand', 'category'],
      default: 'product',
      description: 'Type of search for categorization'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('QuickSearch', quickSearchSchema);
