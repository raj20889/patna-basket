const mongoose = require('mongoose');

const trendingSearchSchema = new mongoose.Schema(
  {
    keyword: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    searchCount: {
      type: Number,
      default: 1,
      description: 'Number of times this keyword was searched'
    },
    lastSearchedAt: {
      type: Date,
      default: Date.now
    },
    weeklyTrend: {
      type: Number,
      default: 0,
      description: 'Percentage change in searches this week'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Index for efficient querying
trendingSearchSchema.index({ searchCount: -1 });
trendingSearchSchema.index({ lastSearchedAt: -1 });

module.exports = mongoose.model('TrendingSearch', trendingSearchSchema);
