const mongoose = require('mongoose');

const HomeSectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    subcategoryFilter: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    categoryPath: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    icon: {
      type: String,
      default: '📦',
      description: 'Section icon/emoji (e.g., 🔥 for deals)'
    },
    theme: {
      type: String,
      enum: ['deals', 'fresh', 'snacks', 'essentials', 'premium', 'local'],
      default: 'essentials',
      description: 'Pre-defined theme for styling'
    },
    backgroundColor: {
      type: String,
      default: '#FFFFFF',
      description: 'Section background color (hex code)'
    },
    titleColor: {
      type: String,
      default: '#212121',
      description: 'Section title text color (hex code)'
    },
    displayOrder: {
      type: Number,
      default: 0,
      description: 'Position in homepage (lower = higher priority)'
    },
    filter: {
      type: String,
      trim: true,
      description: 'Category/subcategory filter (pipe or comma separated)'
    },
    maxProducts: {
      type: Number,
      default: 10,
      min: 5,
      max: 20,
      description: 'Maximum products to show in section'
    },
    showDiscount: {
      type: Boolean,
      default: true,
      description: 'Display discount badges on products'
    },
    sectionStyle: {
      type: String,
      enum: ['horizontal-scroll', 'grid', 'carousel'],
      default: 'horizontal-scroll',
      description: 'Layout style for products'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    image: {
      type: String,
      trim: true,
      description: 'Section header image'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('HomeSection', HomeSectionSchema);
