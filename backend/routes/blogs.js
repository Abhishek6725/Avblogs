const express = require('express');
const auth = require('../middleware/auth');
const {
  publishBlog,
  getUserBlogs,
  getBlog,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  getBlogAnalytics,
  getDashboardAnalytics,
  trackInteraction,
  getBlogLikeStatus,
  getAllPublicBlogs,
  searchBlogs
} = require('../controllers/blogController');

const router = express.Router();

// Public routes (no authentication required)
router.get('/public', getAllPublicBlogs);
router.get('/public/:slug', getBlogBySlug);

// Track interaction route (conditional authentication for likes)
router.post('/public/:id/track', (req, res, next) => {
  // Check if user is authenticated
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (token) {
    // If authenticated, verify the token
    auth(req, res, next);
  } else {
    // If not authenticated, just proceed (some interactions like views don't require auth)
    next();
  }
}, trackInteraction);

// Search route (can be used both authenticated and unauthenticated)
router.get('/search', (req, res, next) => {
  // Check if user is authenticated
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (token) {
    // If authenticated, verify the token
    auth(req, res, next);
  } else {
    // If not authenticated, just proceed (will search only public blogs)
    next();
  }
}, searchBlogs);

// Like status route (can be used both authenticated and unauthenticated)
router.get('/public/:id/like-status', (req, res, next) => {
  // Check if user is authenticated
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (token) {
    // If authenticated, verify the token
    auth(req, res, next);
  } else {
    // If not authenticated, just proceed (will return isLiked: false)
    next();
  }
}, getBlogLikeStatus);

// Protected routes (authentication required)
router.use(auth);

// POST /api/blogs/publish - Publish a file as a blog post
router.post('/publish', publishBlog);

// GET /api/blogs - Get all blogs for the authenticated user
router.get('/', getUserBlogs);

// GET /api/blogs/dashboard - Get dashboard analytics
router.get('/dashboard', getDashboardAnalytics);

// GET /api/blogs/:id - Get a specific blog
router.get('/:id', getBlog);

// PUT /api/blogs/:id - Update a blog
router.put('/:id', updateBlog);

// DELETE /api/blogs/:id - Delete a blog
router.delete('/:id', deleteBlog);

// GET /api/blogs/:id/analytics - Get blog analytics
router.get('/:id/analytics', getBlogAnalytics);

module.exports = router; 