const mongoose = require('mongoose');

const shelfSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    icon: { type: String, default: '🛒' },
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
  },
  { _id: false }
);

const virtualStoreSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      description: 'Store name like "Paan Corner", "Beauty Store"'
    },
    storeIcon: {
      type: String,
      required: true,
      description: 'Emoji or small icon image URL'
    },
    storeBanner: {
      type: String,
      default: '',
      description: 'Large banner image URL for store page'
    },
    storeDescription: {
      type: String,
      default: '',
      description: 'Brief description of the store'
    },
    storeColor: {
      type: String,
      default: '#00A82D',
      description: 'Brand color for the store (hex code)'
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
      }
    ],
    subcategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory'
      }
    ],
    featuredProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
    ],
    shelves: [shelfSchema],
    famousFor: [String],
    displayOrder: {
      type: Number,
      default: 0,
      description: 'Position in store list'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    storeType: {
      type: String,
      enum: ['physical', 'virtual', 'partner'],
      default: 'virtual',
      description: 'Type of store'
    },
    visitCount: {
      type: Number,
      default: 0,
      description: 'Analytics: number of store visits'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('VirtualStore', virtualStoreSchema);
