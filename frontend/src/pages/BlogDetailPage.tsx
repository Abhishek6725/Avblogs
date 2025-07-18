import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { 
  Eye, 
  Heart, 
  Share2, 
  Calendar, 
  Clock,
  User
} from 'lucide-react';
import { Navbar } from '../components/UI/Navbar';
import { Button } from '../components/UI/Button';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';

interface Blog {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt: string;
  views: number;
  likes: number;
  shares: number;
  readTime: number;
  tags: string[];
  userId: {
    _id: string;
    email: string;
  };
}

export const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (slug) {
      loadBlog();
    }
  }, [slug, user]);

  const loadBlog = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const blogData = await apiService.getPublicBlogBySlug(slug!);
      setBlog(blogData);
      
      // Load like status if user is authenticated
      if (user && apiService.isAuthenticated()) {
        try {
          const likeStatus = await apiService.getBlogLikeStatus(blogData._id);
          setIsLiked(likeStatus.isLiked);
        } catch (error) {
          console.error('Failed to load like status:', error);
          // Don't throw error, just set isLiked to false
          setIsLiked(false);
        }
      } else {
        setIsLiked(false);
      }
    } catch (error) {
      console.error('Failed to load blog:', error);
      setError('Blog not found or failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!blog) return;
    
    // Check if user is authenticated
    if (!user || !apiService.isAuthenticated()) {
      alert('Please login to like this blog post');
      return;
    }
    
    try {
      const response = await apiService.trackBlogInteraction(blog._id, { type: 'like' });
      
      if (response.success && 'isLiked' in response) {
        setIsLiked(response.isLiked);
        setBlog(prev => prev ? { ...prev, likes: response.likes } : null);
      }
    } catch (error) {
        console.error('Failed to track like:', error);
        alert('Failed to like blog post. Please try again.');
      }
  };

  const handleShare = async () => {
    if (!blog) return;
    
    try {
      await apiService.trackBlogInteraction(blog._id, { type: 'share' });
      setBlog(prev => prev ? { ...prev, shares: prev.shares + 1 } : null);
      
      // Copy to clipboard
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      
      // You could show a toast notification here
      alert('Blog URL copied to clipboard!');
    } catch (error) {
      console.error('Failed to track share or copy to clipboard:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar 
          onLogout={handleLogout}
        />
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar 
          onLogout={handleLogout}
        />
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">{error || 'Blog not found'}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-16">
      <Navbar 
        onLogout={handleLogout}
      />
      
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Blog Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{blog.title}</h1>
          
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <User className="w-4 h-4 mr-2" />
            <span className="mr-4">{blog.userId.email}</span>
            <Calendar className="w-4 h-4 mr-2" />
            <span className="mr-4">{formatDate(blog.publishedAt)}</span>
            <Clock className="w-4 h-4 mr-2" />
            <span>{blog.readTime} min read</span>
          </div>
          {/* Tags */}
          {blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {blog.tags.map(tag => (
                <span 
                  key={tag}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Blog Stats */}
          <div className="flex items-center gap-6 text-sm text-gray-600 border-t pt-4">
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              <span>{formatNumber(blog.views)} views</span>
            </div>
            <div className="flex items-center">
              <Heart className="w-4 h-4 mr-1" />
              <span>{formatNumber(blog.likes)} likes</span>
            </div>
            <div className="flex items-center">
              <Share2 className="w-4 h-4 mr-1" />
              <span>{formatNumber(blog.shares)} shares</span>
            </div>
          </div>
        </div>

        {/* Blog Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 prose-code:text-pink-600 prose-code:bg-gray-100 prose-pre:bg-gray-900 prose-pre:text-gray-100">
            <ReactMarkdown>{blog.content}</ReactMarkdown>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleLike}
                variant={isLiked ? "primary" : "secondary"}
                className="flex items-center gap-2"
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked ? 'Liked' : 'Like'}
              </Button>
              <Button
                onClick={handleShare}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
            
            <div className="text-sm text-gray-500">
              Published on {formatDate(blog.publishedAt)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 