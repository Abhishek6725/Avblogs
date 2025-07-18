const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  excerpt: {
    type: String,
    maxlength: 300
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: {
    type: Date
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    required: true
  },
  // Analytics fields
  views: {
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
  readTime: {
    type: Number, // estimated read time in minutes
    default: 0
  },
  // SEO fields
  metaTitle: String,
  metaDescription: String,
  featuredImage: String
}, {
  timestamps: true
});

// Index for better search performance
blogSchema.index({ slug: 1 });
blogSchema.index({ userId: 1, status: 1 });
blogSchema.index({ publishedAt: -1 });
blogSchema.index({ views: -1 });

// Text search indexes for comprehensive search
blogSchema.index({
  title: 'text',
  content: 'text',
  excerpt: 'text',
  tags: 'text',
  metaTitle: 'text',
  metaDescription: 'text'
}, {
  weights: {
    title: 10,
    metaTitle: 8,
    excerpt: 6,
    tags: 5,
    content: 3,
    metaDescription: 2
  },
  name: 'blog_text_search'
});

// Virtual for URL
blogSchema.virtual('url').get(function() {
  return `/blog/${this.slug}`;
});

// Method to generate slug from title
blogSchema.methods.generateSlug = function() {
  return this.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Method to calculate read time
blogSchema.methods.calculateReadTime = function() {
  const wordsPerMinute = 200;
  const words = this.content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

// Pre-save middleware
blogSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.generateSlug();
  }
  
  if (this.isModified('content')) {
    this.readTime = this.calculateReadTime();
  }
  
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

module.exports = mongoose.model('Blog', blogSchema); 