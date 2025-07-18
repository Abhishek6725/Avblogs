import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { 
  Eye, 
  Heart, 
  Share2, 
  Calendar, 
  Clock,
  FileText,
  Filter,
  Search,
  User,
  Tag,
  SlidersHorizontal
} from 'lucide-react';
import { Navbar } from '../components/UI/Navbar';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { apiService } from '../services/api';
import type { BlogType } from '../types';

export const BlogListPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [blogs, setBlogs] = useState<BlogType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'publishedAt' | 'views' | 'likes'>('publishedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Check if this is the "My Blogs" page
  const isMyBlogs = location.pathname === '/dashboard/blogs';

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Initialize search term from URL query parameter
  useEffect(() => {
    const querySearch = searchParams.get('search');
    if (querySearch) {
      setSearchTerm(querySearch);
    }
  }, [searchParams]);

  // Trigger search when debouncedSearchTerm, currentPage, sortBy, or sortOrder changes
  useEffect(() => {
    setCurrentPage(1);
    loadBlogs();
  }, [debouncedSearchTerm, selectedTags, sortBy, sortOrder]);

  useEffect(() => {
    loadBlogs();
  }, [currentPage]);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      
      if (isMyBlogs) {
        // For "My Blogs" page, use getUserBlogs API
        console.log('📝 BLOG LIST: Using getUserBlogs API (My Blogs page)');
        response = await apiService.getUserBlogs();
      } else if (debouncedSearchTerm && debouncedSearchTerm.trim()) {
        // Use the new search API when there's a search term
        console.log('🔍 BLOG LIST: Using searchBlogs API with term:', debouncedSearchTerm);
        response = await apiService.searchBlogs({
          q: debouncedSearchTerm,
          page: currentPage,
          limit: 12,
          tags: selectedTags.length > 0 ? selectedTags.join(',') : undefined,
          sortBy: sortBy === 'publishedAt' ? 'date' : sortBy,
          sortOrder,
          includeOwn: !!user // Include user's own blogs if authenticated
        });
      } else {
        // Use the existing API for regular browsing
        console.log('📝 BLOG LIST: Using getAllPublicBlogs API (no search term)');
        response = await apiService.getAllPublicBlogs({
          page: currentPage,
          limit: 12,
          tags: selectedTags.length > 0 ? selectedTags.join(',') : undefined
        });
      }
      
      setBlogs(response.blogs);
      setTotalPages(response.totalPages);
      setTotal(response.total);
      
      // Extract available tags from all blogs
      const allTags = response.blogs.flatMap(blog => blog.tags);
      const uniqueTags = [...new Set(allTags)];
      setAvailableTags(uniqueTags);
    } catch (error) {
      console.error('Failed to load blogs:', error);
      setError('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };



  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
    setSortBy('publishedAt');
    setSortOrder('desc');
    setCurrentPage(1);
    loadBlogs();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const handleViewBlog = (blog: BlogType) => {
    navigate(`/blog/${blog.slug}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const BlogCard = ({ blog }: { blog: BlogType }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600"
              onClick={() => handleViewBlog(blog)}>
            {blog.title}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{blog.excerpt}</p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              {blog.userId.email}
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(blog.publishedAt)}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {blog.readTime} min read
            </div>
            {isMyBlogs && (
              <span className={`px-2 py-1 text-xs rounded-full ${
                blog.status === 'published' 
                  ? 'bg-green-100 text-green-800' 
                  : blog.status === 'draft'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {blog.status}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center text-blue-600">
              <Eye className="w-4 h-4 mr-1" />
              {formatNumber(blog.views)}
            </div>
            <div className="flex items-center text-red-600">
              <Heart className="w-4 h-4 mr-1" />
              {formatNumber(blog.likes)}
            </div>
            <div className="flex items-center text-purple-600">
              <Share2 className="w-4 h-4 mr-1" />
              {formatNumber(blog.shares)}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          {isMyBlogs ? (
            <div className="flex space-x-2">
              <Button
                onClick={() => navigate(`/dashboard/editor?file=${blog.fileId._id}`)}
                variant="secondary"
                size="sm"
              >
                Edit
              </Button>
              <Button
                onClick={() => handleViewBlog(blog)}
                variant="secondary"
                size="sm"
              >
                View
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => handleViewBlog(blog)}
              variant="secondary"
              size="sm"
            >
              Read More
            </Button>
          )}
        </div>
      </div>
      
      {blog.tags && blog.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {blog.tags.map((tag, index) => (
            <span
              key={index}
              className={`px-2 py-1 text-xs rounded-full cursor-pointer transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              }`}
              onClick={() => handleTagToggle(tag)}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar onLogout={handleLogout} />
      
      <div className="flex-1 overflow-auto pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isMyBlogs ? 'My Blogs' : 'Search & Filter Blogs'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {isMyBlogs 
                    ? 'Manage and view your published and draft blog posts' 
                    : 'Find the perfect blog posts with advanced search and filtering'
                  }
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {isMyBlogs ? (
                  <>
                    <Button onClick={() => navigate('/dashboard/editor')} className="bg-blue-600 hover:bg-blue-700">
                      <FileText className="w-4 h-4 mr-2" />
                      New Post
                    </Button>
                    <Button onClick={() => navigate('/dashboard')} variant="secondary">
                      Dashboard
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={() => navigate('/')} variant="secondary">
                      <FileText className="w-4 h-4 mr-2" />
                      Back to Home
                    </Button>
                    {user && (
                      <Button onClick={() => navigate('/dashboard')} variant="secondary">
                        Dashboard
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          {!isMyBlogs && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search blogs by title, content, or author... (searches automatically)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 w-full text-lg"
                  />
                  {searchTerm && searchTerm !== debouncedSearchTerm && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
              </div>

            {/* Filter Controls */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'publishedAt' | 'views' | 'likes')}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="publishedAt">Date Published</option>
                  <option value="views">Views</option>
                  <option value="likes">Likes</option>
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
              
              <div className="flex-1"></div>
              
              <Button
                onClick={clearFilters}
                variant="secondary"
                size="sm"
                className="flex items-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>

            {/* Tag Filter */}
            {availableTags.length > 0 && (
              <div>
                <div className="flex items-center mb-3">
                  <Tag className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filter by tags:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableTags.slice(0, 20).map((tag) => (
                    <span
                      key={tag}
                      className={`px-3 py-1 text-sm rounded-full cursor-pointer transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => handleTagToggle(tag)}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          )}

          {/* Results Summary */}
          <div className="mb-6">
            <p className="text-gray-600">
              Found {total} blog{total !== 1 ? 's' : ''} 
              {debouncedSearchTerm && <span> matching "<strong>{debouncedSearchTerm}</strong>"</span>}
              {selectedTags.length > 0 && (
                <span> with tags: {selectedTags.map(tag => `#${tag}`).join(', ')}</span>
              )}
            </p>
          </div>

          {/* Blog Grid with Loading State */}
          {error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-red-500 mb-4">
                  <FileText className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={loadBlogs} variant="secondary">
                  Try Again
                </Button>
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading blogs...</p>
              </div>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search terms or filters</p>
              <Button onClick={clearFilters} variant="secondary">
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {blogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !loading && (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  variant="secondary"
                  size="sm"
                >
                  Previous
                </Button>
                
                <div className="flex space-x-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const page = i + Math.max(1, currentPage - 2);
                    return (
                      <Button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        variant={currentPage === page ? "primary" : "ghost"}
                        size="sm"
                        className="min-w-[40px]"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  variant="secondary"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 