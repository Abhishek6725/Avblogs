const Blog = require('../models/Blog');
const BlogAnalytics = require('../models/BlogAnalytics');
const BlogLike = require('../models/BlogLike');
const File = require('../models/File');

// Publish a file as a blog post
const publishBlog = async (req, res) => {
  try {
    const { fileId, title, excerpt, tags, metaTitle, metaDescription, featuredImage } = req.body;
    
    // Validate required fields
    if (!fileId || !title || title.trim() === '') {
      return res.status(400).json({ error: 'File ID and title are required' });
    }
    
    // Get the file content
    const file = await File.findOne({ _id: fileId, userId: req.user._id });
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Check if blog already exists for this file
    let blog = await Blog.findOne({ fileId, userId: req.user._id });
    
    if (blog) {
      // Update existing blog
      blog.title = title;
      blog.content = file.content;
      blog.excerpt = excerpt;
      blog.tags = tags || [];
      blog.metaTitle = metaTitle;
      blog.metaDescription = metaDescription;
      blog.featuredImage = featuredImage;
      blog.status = 'published';
      
      // Generate new slug if title changed
      if (blog.isModified('title')) {
        let baseSlug = blog.generateSlug();
        
        // Fallback to file name if slug is empty
        if (!baseSlug || baseSlug.trim() === '') {
          baseSlug = file.name.replace(/\.(md|txt)$/i, '').toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        }
        
        // Final fallback to timestamp if still empty
        if (!baseSlug || baseSlug.trim() === '') {
          baseSlug = `blog-${Date.now()}`;
        }
        
        let slug = baseSlug;
        let counter = 1;
        
        // Check for duplicate slugs and append counter if needed
        while (await Blog.findOne({ slug, _id: { $ne: blog._id } })) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
        
        blog.slug = slug;
      }
    } else {
      // Create new blog
      blog = new Blog({
        title,
        content: file.content,
        excerpt,
        tags: tags || [],
        status: 'published',
        userId: req.user._id,
        fileId,
        metaTitle,
        metaDescription,
        featuredImage
      });
      
      // Generate slug for new blog
      let baseSlug = blog.generateSlug();
      
      // Fallback to file name if slug is empty
      if (!baseSlug || baseSlug.trim() === '') {
        baseSlug = file.name.replace(/\.(md|txt)$/i, '').toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
      
      // Final fallback to timestamp if still empty
      if (!baseSlug || baseSlug.trim() === '') {
        baseSlug = `blog-${Date.now()}`;
      }
      
      let slug = baseSlug;
      let counter = 1;
      
      // Check for duplicate slugs and append counter if needed
      while (await Blog.findOne({ slug })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      blog.slug = slug;
    }
    
    await blog.save();
    
    res.status(201).json(blog);
  } catch (error) {
    console.error('Publish blog error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all blogs for a user
const getUserBlogs = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, fileId } = req.query;
    
    const query = { userId: req.user._id };
    if (status) {
      query.status = status;
    }
    if (fileId) {
      query.fileId = fileId;
    }
    
    const blogs = await Blog.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('fileId', 'name')
      .populate('userId', 'email');
    
    const total = await Blog.countDocuments(query);
    
    res.json({
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get user blogs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get a specific blog
const getBlog = async (req, res) => {
  try {
    const { id } = req.params;
    
    const blog = await Blog.findOne({ _id: id, userId: req.user._id })
      .populate('fileId', 'name');
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    res.json(blog);
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get blog by slug (for public viewing)
const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const blog = await Blog.findOne({ slug, status: 'published' })
      .populate('userId', 'email')
      .populate('fileId', 'name');
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    // Increment views
    blog.views += 1;
    await blog.save();
    
    res.json(blog);
  } catch (error) {
    console.error('Get blog by slug error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all public blogs
const getAllPublicBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, tags } = req.query;

    console.log('getAllPublicBlogs - req.query:', req.query);
    
    const query = { status: 'published' };
    
    // Add comprehensive search functionality
    if (search) {
      // If search term is provided, use MongoDB text search for better results
      query.$text = { $search: search };
    }
    
    // Add tag filtering
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }
    
    let sortOptions = {};
    if (search) {
      // Sort by relevance score when searching
      sortOptions = { score: { $meta: 'textScore' } };
    } else {
      // Default sort by published date
      sortOptions = { publishedAt: -1 };
    }
    
    // Build aggregation pipeline to include file name in search
    const aggregationPipeline = [];
    
    // Add text search as first stage if needed
    if (search && search.trim()) {
      aggregationPipeline.push({
        $match: {
          $and: [
            query,
            { $text: { $search: search } }
          ]
        }
      });
    } else {
      aggregationPipeline.push({
        $match: query
      });
    }

    // Add text score for relevance sorting
    if (search && search.trim()) {
      aggregationPipeline.push({
        $addFields: {
          textScore: { $meta: 'textScore' }
        }
      });
    }

    // Add file lookup
    aggregationPipeline.push({
      $lookup: {
        from: 'files',
        localField: 'fileId',
        foreignField: '_id',
        as: 'file'
      }
    });

    aggregationPipeline.push({
      $unwind: '$file'
    });

    // Add file name search if needed
    if (search && search.trim()) {
      aggregationPipeline.push({
        $match: {
          $or: [
            { textScore: { $exists: true } }, // Documents that matched text search
            { 'file.name': { $regex: search, $options: 'i' } } // File name matches
          ]
        }
      });
    }
    
    // Add sorting
    if (search && search.trim()) {
      aggregationPipeline.push({
        $addFields: {
          score: {
            $add: [
              { $ifNull: ['$textScore', 0] },
              {
                $cond: {
                  if: { $regexMatch: { input: '$file.name', regex: search, options: 'i' } },
                  then: 5, // Boost score for file name matches
                  else: 0
                }
              }
            ]
          }
        }
      });
      aggregationPipeline.push({ $sort: { score: -1 } });
    } else {
      aggregationPipeline.push({ $sort: { publishedAt: -1 } });
    }
    
    // Add pagination
    aggregationPipeline.push({ $skip: (page - 1) * limit });
    aggregationPipeline.push({ $limit: limit * 1 });
    
    // Add user lookup
    aggregationPipeline.push({
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    });
    
    aggregationPipeline.push({
      $unwind: '$user'
    });
    
    // Project the final result
    aggregationPipeline.push({
      $project: {
        _id: 1,
        title: 1,
        content: 1,
        slug: 1,
        excerpt: 1,
        tags: 1,
        status: 1,
        publishedAt: 1,
        views: 1,
        likes: 1,
        shares: 1,
        readTime: 1,
        metaTitle: 1,
        metaDescription: 1,
        featuredImage: 1,
        createdAt: 1,
        updatedAt: 1,
        userId: {
          _id: '$user._id',
          email: '$user.email'
        },
        fileId: {
          _id: '$file._id',
          name: '$file.name'
        }
      }
    });
    
    const blogs = await Blog.aggregate(aggregationPipeline);
    
    // Get total count for pagination - we need to use separate counting for text and file name searches
    let totalCount = 0;
    
    if (search && search.trim()) {
      // Count text search matches
      const textSearchCount = await Blog.countDocuments({
        $and: [
          query,
          { $text: { $search: search } }
        ]
      });
      
      // Count file name matches
      const fileNameCountPipeline = [
        {
          $match: query
        },
        {
          $lookup: {
            from: 'files',
            localField: 'fileId',
            foreignField: '_id',
            as: 'file'
          }
        },
        {
          $unwind: '$file'
        },
        {
          $match: {
            'file.name': { $regex: search, $options: 'i' }
          }
        },
        { $count: 'total' }
      ];
      
      const fileNameCountResult = await Blog.aggregate(fileNameCountPipeline);
      const fileNameCount = fileNameCountResult.length > 0 ? fileNameCountResult[0].total : 0;
      
      // Total is the sum of both (may have duplicates but aggregation handles it)
      totalCount = textSearchCount + fileNameCount;
    } else {
      totalCount = await Blog.countDocuments(query);
    }
    

    
    res.json({
      blogs,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      total: totalCount
    });
  } catch (error) {
    console.error('Get all public blogs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update blog
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const blog = await Blog.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      updates,
      { new: true }
    );
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    res.json(blog);
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete blog
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    
    const blog = await Blog.findOneAndDelete({ _id: id, userId: req.user._id });
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    // Delete associated analytics
    await BlogAnalytics.deleteMany({ blogId: id });
    
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get blog analytics
const getBlogAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const { days = 30 } = req.query;
    
    const blog = await Blog.findOne({ _id: id, userId: req.user._id });
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const analytics = await BlogAnalytics.find({
      blogId: id,
      date: { $gte: startDate }
    }).sort({ date: -1 });
    
    // Calculate totals
    const totals = analytics.reduce((acc, day) => ({
      views: acc.views + day.views,
      uniqueViews: acc.uniqueViews + day.uniqueViews,
      likes: acc.likes + day.likes,
      shares: acc.shares + day.shares,
      avgTimeOnPage: acc.avgTimeOnPage + day.avgTimeOnPage
    }), { views: 0, uniqueViews: 0, likes: 0, shares: 0, avgTimeOnPage: 0 });
    
    if (analytics.length > 0) {
      totals.avgTimeOnPage = totals.avgTimeOnPage / analytics.length;
    }
    
    res.json({
      blog: {
        id: blog._id,
        title: blog.title,
        publishedAt: blog.publishedAt,
        views: blog.views,
        likes: blog.likes,
        shares: blog.shares,
        readTime: blog.readTime
      },
      analytics: analytics,
      totals: totals,
      period: {
        days: days,
        startDate: startDate,
        endDate: new Date()
      }
    });
  } catch (error) {
    console.error('Get blog analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get dashboard analytics
const getDashboardAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get all user blogs
    const blogs = await Blog.find({ userId: req.user._id });
    const blogIds = blogs.map(blog => blog._id);
    
    // Get analytics for all blogs
    const analytics = await BlogAnalytics.find({
      blogId: { $in: blogIds },
      date: { $gte: startDate }
    }).sort({ date: -1 });
    
    // Calculate totals
    const totals = analytics.reduce((acc, day) => ({
      views: acc.views + day.views,
      uniqueViews: acc.uniqueViews + day.uniqueViews,
      likes: acc.likes + day.likes,
      shares: acc.shares + day.shares
    }), { views: 0, uniqueViews: 0, likes: 0, shares: 0 });
    
    // Get top performing blogs
    const topBlogs = await Blog.find({ userId: req.user._id })
      .sort({ views: -1 })
      .limit(5)
      .populate('fileId', 'name');
    
    // Get recent blogs
    const recentBlogs = await Blog.find({ userId: req.user._id })
      .sort({ publishedAt: -1 })
      .limit(5)
      .populate('fileId', 'name');
    
    res.json({
      totals,
      analytics: analytics,
      topBlogs,
      recentBlogs,
      blogCount: blogs.length,
      publishedCount: blogs.filter(b => b.status === 'published').length,
      period: {
        days: days,
        startDate: startDate,
        endDate: new Date()
      }
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Track blog interaction (like, share, etc.)
const trackInteraction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body; // 'like', 'share', 'view'
    
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    let isLiked = false;
    let likeChange = 0;
    
    // Handle like interactions with authentication check
    if (type === 'like') {
      // Check if user is authenticated
      if (!req.user || !req.user._id) {
        return res.status(401).json({ error: 'Authentication required to like posts' });
      }
      
      // Check if user has already liked this blog
      const existingLike = await BlogLike.findOne({
        userId: req.user._id,
        blogId: id
      });
      
      if (existingLike) {
        // User has already liked, so remove the like (toggle off)
        await BlogLike.deleteOne({ _id: existingLike._id });
        blog.likes = Math.max(0, blog.likes - 1); // Ensure likes don't go below 0
        likeChange = -1;
        isLiked = false;
      } else {
        // User hasn't liked yet, so add the like
        await BlogLike.create({
          userId: req.user._id,
          blogId: id
        });
        blog.likes += 1;
        likeChange = 1;
        isLiked = true;
      }
    } else if (type === 'share') {
      blog.shares += 1;
    } else if (type === 'view') {
      blog.views += 1;
    }
    
    await blog.save();
    
    // Update daily analytics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let dailyAnalytics = await BlogAnalytics.findOne({
      blogId: id,
      date: today
    });
    
    if (!dailyAnalytics) {
      dailyAnalytics = new BlogAnalytics({
        blogId: id,
        userId: blog.userId,
        date: today
      });
    }
    
    if (type === 'like' && likeChange !== 0) {
      dailyAnalytics.likes += likeChange;
    } else if (type === 'share') {
      dailyAnalytics.shares += 1;
    } else if (type === 'view') {
      dailyAnalytics.views += 1;
    }
    
    await dailyAnalytics.save();
    
    // Return appropriate response based on interaction type
    if (type === 'like') {
      res.json({ 
        success: true, 
        likes: blog.likes, 
        isLiked: isLiked,
        message: isLiked ? 'Blog liked successfully' : 'Blog unliked successfully'
      });
    } else {
      res.json({ success: true, [type]: blog[type] });
    }
  } catch (error) {
    console.error('Track interaction error:', error);
    
    // Handle duplicate key error (shouldn't happen with the check above, but just in case)
    if (error.code === 11000) {
      return res.status(400).json({ error: 'You have already liked this blog' });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
};

// Comprehensive search function
const searchBlogs = async (req, res) => {
  try {
    const { 
      q: searchQuery, 
      page = 1, 
      limit = 10, 
      tags, 
      sortBy = 'relevance',
      sortOrder = 'desc',
      includeOwn = false 
    } = req.query;

    // Validate search query
    if (!searchQuery || searchQuery.trim() === '') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const trimmedQuery = searchQuery.trim();
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit))); // Cap at 50 results per page
    const skip = (pageNum - 1) * limitNum;

    // Build base query for permissions
    const baseQuery = buildBaseQuery(req.user, includeOwn);
    
    // Add tag filtering if provided
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean);
      if (tagArray.length > 0) {
        baseQuery.tags = { $in: tagArray };
      }
    }

    // Build search aggregation pipeline
    const pipeline = buildSearchPipeline(baseQuery, trimmedQuery, sortBy, sortOrder, skip, limitNum);
    
    // Execute search
    const [searchResults, totalCount] = await Promise.all([
      Blog.aggregate(pipeline),
      getSearchCount(baseQuery, trimmedQuery)
    ]);

    // Get search suggestions
    const suggestions = await getSearchSuggestions(baseQuery, trimmedQuery);

    res.json({
      blogs: searchResults,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      total: totalCount,
      searchQuery: trimmedQuery,
      suggestions,
      hasMore: pageNum < Math.ceil(totalCount / limitNum)
    });

  } catch (error) {
    console.error('Search blogs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Helper function to build base query for permissions
const buildBaseQuery = (user, includeOwn) => {
  const query = {};
  
  if (user && includeOwn === 'true') {
    // Search in user's own blogs (all statuses) + public blogs
    query.$or = [
      { userId: user._id },
      { status: 'published' }
    ];
  } else {
    // Search only in published blogs
    query.status = 'published';
  }
  
  return query;
};

// Helper function to build search aggregation pipeline
const buildSearchPipeline = (baseQuery, searchQuery, sortBy, sortOrder, skip, limit) => {
  const pipeline = [];
  
  // Stage 1: Match base query
  pipeline.push({ $match: baseQuery });
  
  // Stage 2: Add file and user lookups
  pipeline.push({
    $lookup: {
      from: 'files',
      localField: 'fileId',
      foreignField: '_id',
      as: 'file'
    }
  });
  pipeline.push({ $unwind: '$file' });
  
  pipeline.push({
    $lookup: {
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      as: 'user'
    }
  });
  pipeline.push({ $unwind: '$user' });
  
  // Stage 3: Add search matching and scoring
  pipeline.push({
    $addFields: {
      titleMatch: {
        $cond: {
          if: { $regexMatch: { input: '$title', regex: searchQuery, options: 'i' } },
          then: 10,
          else: 0
        }
      },
      contentMatch: {
        $cond: {
          if: { $regexMatch: { input: '$content', regex: searchQuery, options: 'i' } },
          then: 3,
          else: 0
        }
      },
      excerptMatch: {
        $cond: {
          if: { $regexMatch: { input: { $ifNull: ['$excerpt', ''] }, regex: searchQuery, options: 'i' } },
          then: 6,
          else: 0
        }
      },
      tagsMatch: {
        $cond: {
          if: { 
            $gt: [
              { $size: { $filter: { input: '$tags', cond: { $regexMatch: { input: '$$this', regex: searchQuery, options: 'i' } } } } },
              0
            ]
          },
          then: 5,
          else: 0
        }
      },
      metaTitleMatch: {
        $cond: {
          if: { $regexMatch: { input: { $ifNull: ['$metaTitle', ''] }, regex: searchQuery, options: 'i' } },
          then: 8,
          else: 0
        }
      },
      metaDescriptionMatch: {
        $cond: {
          if: { $regexMatch: { input: { $ifNull: ['$metaDescription', ''] }, regex: searchQuery, options: 'i' } },
          then: 2,
          else: 0
        }
      },
      fileNameMatch: {
        $cond: {
          if: { $regexMatch: { input: '$file.name', regex: searchQuery, options: 'i' } },
          then: 5,
          else: 0
        }
      }
    }
  });
  
  // Stage 4: Calculate total score and filter results
  pipeline.push({
    $addFields: {
      score: {
        $add: ['$titleMatch', '$contentMatch', '$excerptMatch', '$tagsMatch', '$metaTitleMatch', '$metaDescriptionMatch', '$fileNameMatch']
      }
    }
  });
  
  // Stage 5: Filter out documents with no matches
  pipeline.push({
    $match: {
      score: { $gt: 0 }
    }
  });
  
  // Stage 6: Add sorting
  const sortOptions = buildSortOptions(sortBy, sortOrder);
  pipeline.push({ $sort: sortOptions });
  
  // Stage 7: Add pagination
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });
  
  // Stage 8: Project final result
  pipeline.push({
    $project: {
      _id: 1,
      title: 1,
      content: 1,
      slug: 1,
      excerpt: 1,
      tags: 1,
      status: 1,
      publishedAt: 1,
      views: 1,
      likes: 1,
      shares: 1,
      readTime: 1,
      metaTitle: 1,
      metaDescription: 1,
      featuredImage: 1,
      createdAt: 1,
      updatedAt: 1,
      score: 1,
      userId: {
        _id: '$user._id',
        email: '$user.email'
      },
      fileId: {
        _id: '$file._id',
        name: '$file.name'
      }
    }
  });
  
  return pipeline;
};

// Helper function to build sort options
const buildSortOptions = (sortBy, sortOrder) => {
  const order = sortOrder === 'desc' ? -1 : 1;
  
  switch (sortBy) {
    case 'relevance':
      return { score: -1, publishedAt: -1 };
    case 'date':
      return { publishedAt: order };
    case 'views':
      return { views: order };
    case 'likes':
      return { likes: order };
    default:
      return { score: -1, publishedAt: -1 };
  }
};

// Helper function to get search count
const getSearchCount = async (baseQuery, searchQuery) => {
  const countPipeline = [
    { $match: baseQuery },
    {
      $lookup: {
        from: 'files',
        localField: 'fileId',
        foreignField: '_id',
        as: 'file'
      }
    },
    { $unwind: '$file' },
    {
      $addFields: {
        hasMatch: {
          $or: [
            { $regexMatch: { input: '$title', regex: searchQuery, options: 'i' } },
            { $regexMatch: { input: '$content', regex: searchQuery, options: 'i' } },
            { $regexMatch: { input: { $ifNull: ['$excerpt', ''] }, regex: searchQuery, options: 'i' } },
            { 
              $gt: [
                { $size: { $filter: { input: '$tags', cond: { $regexMatch: { input: '$$this', regex: searchQuery, options: 'i' } } } } },
                0
              ]
            },
            { $regexMatch: { input: { $ifNull: ['$metaTitle', ''] }, regex: searchQuery, options: 'i' } },
            { $regexMatch: { input: { $ifNull: ['$metaDescription', ''] }, regex: searchQuery, options: 'i' } },
            { $regexMatch: { input: '$file.name', regex: searchQuery, options: 'i' } }
          ]
        }
      }
    },
    {
      $match: {
        hasMatch: true
      }
    },
    { $count: 'total' }
  ];
  
  const result = await Blog.aggregate(countPipeline);
  return result.length > 0 ? result[0].total : 0;
};

// Helper function to get search suggestions
const getSearchSuggestions = async (baseQuery, searchQuery) => {
  try {
    const suggestionsPipeline = [
      { $match: baseQuery },
      {
        $lookup: {
          from: 'files',
          localField: 'fileId',
          foreignField: '_id',
          as: 'file'
        }
      },
      { $unwind: '$file' },
      {
        $addFields: {
          hasMatch: {
            $or: [
              { $regexMatch: { input: '$title', regex: searchQuery, options: 'i' } },
              { $regexMatch: { input: '$content', regex: searchQuery, options: 'i' } },
              { $regexMatch: { input: { $ifNull: ['$excerpt', ''] }, regex: searchQuery, options: 'i' } },
              { 
                $gt: [
                  { $size: { $filter: { input: '$tags', cond: { $regexMatch: { input: '$$this', regex: searchQuery, options: 'i' } } } } },
                  0
                ]
              },
              { $regexMatch: { input: { $ifNull: ['$metaTitle', ''] }, regex: searchQuery, options: 'i' } },
              { $regexMatch: { input: { $ifNull: ['$metaDescription', ''] }, regex: searchQuery, options: 'i' } },
              { $regexMatch: { input: '$file.name', regex: searchQuery, options: 'i' } }
            ]
          }
        }
      },
      {
        $match: {
          hasMatch: true
        }
      },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { tag: '$_id', count: 1, _id: 0 } }
    ];

    const suggestions = await Blog.aggregate(suggestionsPipeline);
    return suggestions.map(s => s.tag);
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    return [];
  }
};

// Check if user has liked a blog
const getBlogLikeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.json({ isLiked: false });
    }
    
    // Check if blog exists
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    // Check if user has liked this blog
    const existingLike = await BlogLike.findOne({
      userId: req.user._id,
      blogId: id
    });
    
    res.json({ 
      isLiked: !!existingLike,
      totalLikes: blog.likes
    });
  } catch (error) {
    console.error('Get blog like status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  publishBlog,
  getUserBlogs,
  getBlog,
  getBlogBySlug,
  getAllPublicBlogs,
  updateBlog,
  deleteBlog,
  getBlogAnalytics,
  getDashboardAnalytics,
  trackInteraction,
  getBlogLikeStatus,
  searchBlogs
}; 