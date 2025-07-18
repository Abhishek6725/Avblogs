const mongoose = require('mongoose');

const blogLikeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  blogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true
  },
  likedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure one user can like a blog only once
blogLikeSchema.index({ userId: 1, blogId: 1 }, { unique: true });

// Index for efficient queries
blogLikeSchema.index({ blogId: 1 });
blogLikeSchema.index({ userId: 1 });

module.exports = mongoose.model('BlogLike', blogLikeSchema); 