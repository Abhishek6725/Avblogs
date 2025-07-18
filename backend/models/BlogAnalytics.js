const mongoose = require('mongoose');

const blogAnalyticsSchema = new mongoose.Schema({
  blogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Daily analytics
  date: {
    type: Date,
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  uniqueViews: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  avgTimeOnPage: {
    type: Number, // in seconds
    default: 0
  },
  bounceRate: {
    type: Number, // percentage
    default: 0
  },
  // Traffic sources
  referrers: [{
    source: String,
    count: {
      type: Number,
      default: 0
    }
  }],
  // Geographic data
  countries: [{
    country: String,
    count: {
      type: Number,
      default: 0
    }
  }],
  // Device data
  devices: [{
    device: String, // mobile, desktop, tablet
    count: {
      type: Number,
      default: 0
    }
  }]
}, {
  timestamps: true
});

// Compound index for efficient queries
blogAnalyticsSchema.index({ blogId: 1, date: 1 });
blogAnalyticsSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('BlogAnalytics', blogAnalyticsSchema); 