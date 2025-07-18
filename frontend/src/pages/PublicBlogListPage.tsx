import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
  import { 
  Eye, 
  Heart, 
  Calendar, 
  FileText,
  Search,
  User,
  Users,
  ArrowRight,
  Star,
  Globe,
  PenTool,
  TrendingUp,
  BookOpen,
  Sparkles,
  ChevronRight,
  Play,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Github
} from 'lucide-react';
import { Navbar } from '../components/UI/Navbar';
import { Button } from '../components/UI/Button';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import type { BlogType } from '../types';

export const PublicBlogListPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [featuredBlogs, setFeaturedBlogs] = useState<BlogType[]>([]);
  const [recentBlogs, setRecentBlogs] = useState<BlogType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const stats = {
    totalBlogs: 500,
    totalAuthors: 150,
    totalViews: 25000,
    totalLikes: 8500
  };

  useEffect(() => {
    loadHomePageData();
  }, []);

  const loadHomePageData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load different sections of blogs
      const [featuredResponse, recentResponse] = await Promise.all([
        apiService.getAllPublicBlogs({ page: 1, limit: 3 }), // Featured blogs
        apiService.getAllPublicBlogs({ page: 1, limit: 6 }), // Recent blogs
      ]);
      
      setFeaturedBlogs(featuredResponse.blogs.slice(0, 3));
      setRecentBlogs(recentResponse.blogs);
    } catch (error) {
      console.error('Failed to load home page data:', error);
      setError('Failed to load content');
    } finally {
      setLoading(false);
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

  // Enhanced Hero Section with animations and glassmorphism
  const HeroSection = () => (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-pink-500/25 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="text-center">
          {/* Animated badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
            <span className="text-sm font-medium">Welcome to the Future of Blogging</span>
          </div>
          
          {/* Main heading with gradient text */}
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight animate-slide-up">
            <span className="block text-white">Discover</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 animate-gradient">
              Amazing Stories
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in-delay">
            Join our vibrant community of <span className="text-yellow-400 font-semibold">visionary writers</span> and 
            <span className="text-pink-400 font-semibold"> curious readers</span>. Share your thoughts, discover new perspectives, and be part of something extraordinary.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16 animate-fade-in-delay-2">
            <Button
              onClick={() => navigate('/blog')}
              className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-10 py-4 rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
            >
              <Search className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Explore All Blogs
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            {user ? (
              <Button
                onClick={() => navigate('/dashboard')}
                className="group bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 text-lg px-10 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
              >
                <PenTool className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Go to Dashboard
              </Button>
            ) : (
              <Button
                onClick={() => navigate('/register')}
                className="group bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 text-lg px-10 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
              >
                <Users className="w-5 h-5 group-hover:bounce transition-transform" />
                Join Community
              </Button>
            )}
          </div>
          
          {/* Floating stats preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { number: formatNumber(stats.totalBlogs), label: 'Stories', icon: BookOpen, color: 'from-blue-400 to-cyan-400' },
              { number: formatNumber(stats.totalAuthors), label: 'Authors', icon: Users, color: 'from-green-400 to-emerald-400' },
              { number: formatNumber(stats.totalViews), label: 'Views', icon: Eye, color: 'from-yellow-400 to-orange-400' },
              { number: formatNumber(stats.totalLikes), label: 'Likes', icon: Heart, color: 'from-pink-400 to-rose-400' }
            ].map((stat, index) => (
              <div key={index} className="group">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${stat.color} mb-4`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold mb-2">{stat.number}</div>
                  <div className="text-gray-300 text-sm font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Enhanced Featured Blogs Section with better cards
  const FeaturedBlogsSection = () => (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 mb-6">
            <Star className="w-4 h-4 mr-2 text-purple-600" />
            <span className="text-sm font-semibold text-purple-800">Featured Stories</span>
          </div>
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Hand-picked <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Masterpieces</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the most compelling stories from our talented community of writers
          </p>
        </div>
        
        {/* Featured blogs grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {featuredBlogs.map((blog, index) => (
            <div key={blog._id} className="group relative">
              <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:scale-105 border border-gray-100">
                {/* Card header with featured badge */}
                <div className="relative p-8 pb-6">
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <div className="text-white font-bold text-lg">#{index + 1}</div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 mr-2 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">Featured</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span className="text-sm">Trending</span>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 cursor-pointer hover:text-purple-600 transition-colors group-hover:text-purple-600 line-clamp-2"
                      onClick={() => handleViewBlog(blog)}>
                    {blog.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">{blog.excerpt}</p>
                  
                  {/* Author and date */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium">{blog.userId.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(blog.publishedAt)}
                    </div>
                  </div>
                  
                  {/* Stats and CTA */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        <Eye className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">{formatNumber(blog.views)}</span>
                      </div>
                      <div className="flex items-center text-red-600 bg-red-50 px-3 py-1 rounded-full">
                        <Heart className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">{formatNumber(blog.likes)}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleViewBlog(blog)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2 group"
                    >
                      Read More
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Enhanced Features Section with better icons and animations
  const FeaturesSection = () => (
    <div className="bg-white py-24 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-600 to-pink-600"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Our Platform?</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to share your ideas with the world, backed by powerful tools and an amazing community
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              icon: PenTool,
              title: "Intuitive Writing",
              description: "Advanced BlogSpace with live preview, syntax highlighting, and collaborative features",
              color: "from-blue-500 to-cyan-500",
              bgColor: "from-blue-50 to-cyan-50"
            },
            {
              icon: Globe,
              title: "Global Reach",
              description: "Share your stories with readers worldwide through our SEO-optimized platform",
              color: "from-purple-500 to-pink-500",
              bgColor: "from-purple-50 to-pink-50"
            },
            {
              icon: Users,
              title: "Thriving Community",
              description: "Connect with like-minded writers, get feedback, and build your audience organically",
              color: "from-green-500 to-emerald-500",
              bgColor: "from-green-50 to-emerald-50"
            }
          ].map((feature, index) => (
            <div key={index} className="group relative">
              <div className={`bg-gradient-to-br ${feature.bgColor} rounded-3xl p-8 h-full hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-gray-100`}>
                <div className={`bg-gradient-to-r ${feature.color} rounded-2xl w-16 h-16 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Enhanced Recent Blogs Section with improved cards
  const RecentBlogsSection = () => (
    <div className="bg-gradient-to-br from-gray-50 to-purple-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-16">
          <div className="text-center md:text-left mb-8 md:mb-0">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Stories</span>
            </h2>
            <p className="text-xl text-gray-600">Fresh content from our creative community</p>
          </div>
          <Button
            onClick={() => navigate('/blog')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-2xl text-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-3 shadow-lg"
          >
            <Search className="w-5 h-5" />
            View All Posts
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recentBlogs.map((blog, index) => (
            <div key={blog._id} className="group relative">
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:scale-105 border border-gray-100">
                {/* Card gradient top */}
                <div className={`h-2 bg-gradient-to-r ${
                  index % 3 === 0 ? 'from-blue-500 to-cyan-500' :
                  index % 3 === 1 ? 'from-purple-500 to-pink-500' :
                  'from-green-500 to-emerald-500'
                }`}></div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-gray-500">
                      <BookOpen className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Article</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatDate(blog.publishedAt)}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 cursor-pointer hover:text-purple-600 transition-colors group-hover:text-purple-600 line-clamp-2"
                      onClick={() => handleViewBlog(blog)}>
                    {blog.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {blog.excerpt}
                  </p>
                  
                  {/* Author */}
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{blog.userId.email}</span>
                  </div>
                  
                  {/* Stats and CTA */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        <Eye className="w-3 h-3 mr-1" />
                        <span className="text-xs font-medium">{formatNumber(blog.views)}</span>
                      </div>
                      <div className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded-full">
                        <Heart className="w-3 h-3 mr-1" />
                        <span className="text-xs font-medium">{formatNumber(blog.likes)}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleViewBlog(blog)}
                      className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2 group"
                    >
                      Read
                      <Play className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Enhanced Reviews Section with horizontal scrolling
  const ReviewsSection = () => {
    const reviews = [
      {
        id: 1,
        name: "Sarah Johnson",
        role: "Tech Blogger",
        avatar: "SJ",
        rating: 5,
        review: "This platform has transformed how I share my tech insights. The BlogSpace is a game-changer, and the community engagement is phenomenal!",
        bgGradient: "from-blue-500 to-cyan-500"
      },
      {
        id: 2,
        name: "Michael Chen",
        role: "Travel Writer",
        avatar: "MC",
        rating: 5,
        review: "As a travel writer, I needed a platform that could handle both text and media beautifully. This exceeds all my expectations. The global reach is incredible!",
        bgGradient: "from-purple-500 to-pink-500"
      },
      {
        id: 3,
        name: "Emily Rodriguez",
        role: "Food Blogger",
        avatar: "ER",
        rating: 5,
        review: "The engagement I get on my food blogs here is amazing. The platform's SEO features have helped me reach a much wider audience!",
        bgGradient: "from-green-500 to-emerald-500"
      },
      {
        id: 4,
        name: "David Kim",
        role: "Fiction Writer",
        avatar: "DK",
        rating: 5,
        review: "The writing experience is so smooth and distraction-free. I've published my entire short story series here with great success!",
        bgGradient: "from-yellow-500 to-orange-500"
      },
      {
        id: 5,
        name: "Lisa Thompson",
        role: "Lifestyle Blogger",
        avatar: "LT",
        rating: 5,
        review: "The analytics features help me understand my audience better. Plus, the community here is so supportive and engaging!",
        bgGradient: "from-red-500 to-pink-500"
      }
    ];

    return (
      <div className="bg-white py-24 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-blue-100 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 mb-6">
              <Star className="w-4 h-4 mr-2 text-purple-600" />
              <span className="text-sm font-semibold text-purple-800">What Our Writers Say</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Loved by <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Content Creators</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied writers who have found their voice on our platform
            </p>
          </div>

          {/* Reviews slider */}
          <div className="relative -mx-[calc((100vw-100%)/2)] w-screen">
            {/* Gradient masks for scroll effect */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10"></div>

            {/* Scrolling container */}
            <div className="overflow-hidden w-full">
              <div className="flex animate-scroll gap-6 py-8 px-8">
                {/* Double the reviews for infinite scroll effect */}
                {[...reviews, ...reviews].map((review, index) => (
                  <div
                    key={`${review.id}-${index}`}
                    className="flex-none w-[400px] bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-gray-100 p-8"
                  >
                    {/* Review header */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${review.bgGradient} flex items-center justify-center text-white font-bold text-lg`}>
                        {review.avatar}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{review.name}</h4>
                        <p className="text-sm text-gray-600">{review.role}</p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>

                    {/* Review content */}
                    <p className="text-gray-600 leading-relaxed">{review.review}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Call to Action Section
  const CallToActionSection = () => (
    <div className="relative bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 text-white py-24 overflow-hidden border-b-4 border-white">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
          <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
          <span className="text-sm font-medium">Join the Revolution</span>
        </div>
        
        <h2 className="text-6xl font-bold mb-8 leading-tight text-white">
          Ready to Share Your
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-400">
            Unique Story?
          </span>
        </h2>
        
        <p className="text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
          Join <span className="text-yellow-400 font-semibold">thousands of writers</span> who are already sharing their ideas and connecting with readers worldwide. Your voice matters.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          {user ? (
            <Button
              onClick={() => navigate('/dashboard')}
              className="group bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white text-xl px-12 py-5 rounded-2xl shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
            >
              <PenTool className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              Start Writing Now
              <Sparkles className="w-6 h-6 group-hover:bounce transition-transform" />
            </Button>
          ) : (
            <>
              <Button
                onClick={() => navigate('/register')}
                className="group bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white text-xl px-12 py-5 rounded-2xl shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
              >
                <PenTool className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                Get Started Free
                <Sparkles className="w-6 h-6 group-hover:bounce transition-transform" />
              </Button>
              <Button
                onClick={() => navigate('/login')}
                className="group bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 text-xl px-12 py-5 rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
              >
                <User className="w-6 h-6 group-hover:bounce transition-transform" />
                Sign In
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Enhanced Footer Section
  const FooterSection = () => (
    <footer className="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h3 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                BlogSpace
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed max-w-md">
                Empowering writers and readers to share stories, discover new perspectives, and build meaningful connections through the power of words.
              </p>
            </div>
            
            {/* Social Media */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold mb-4 text-gray-200">Follow Us</h4>
              <div className="flex space-x-4">
                {[
                  { icon: Twitter, href: "#", color: "hover:text-blue-400" },
                  { icon: Facebook, href: "#", color: "hover:text-blue-600" },
                  { icon: Instagram, href: "#", color: "hover:text-pink-500" },
                  { icon: Linkedin, href: "#", color: "hover:text-blue-500" },
                  { icon: Github, href: "#", color: "hover:text-gray-400" }
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className={`w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-110 ${social.color}`}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-gray-200">Quick Links</h4>
            <ul className="space-y-4">
              {[
                { label: "All Blogs", href: "/blog" },
                { label: "Featured Stories", href: "/blog?featured=true" },
                { label: "Authors", href: "/authors" },
                { label: "Categories", href: "/categories" },
                { label: "About Us", href: "/about" }
              ].map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group"
                  >
                    <ChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-gray-200">Get in Touch</h4>
            <div className="space-y-4">
              <div className="flex items-center text-gray-300">
                <Mail className="w-5 h-5 mr-3 text-purple-400" />
                <span>hello@blogspace.com</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Phone className="w-5 h-5 mr-3 text-purple-400" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center text-gray-300">
                <MapPin className="w-5 h-5 mr-3 text-purple-400" />
                <span>San Francisco, CA</span>
              </div>
            </div>
            
            {/* Newsletter */}
            <div className="mt-8">
              <h5 className="text-md font-semibold mb-3 text-gray-200">Stay Updated</h5>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-l-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-2 rounded-r-xl transition-all duration-300 transform hover:scale-105">
                  <Mail className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-white/20 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-300 mb-4 md:mb-0">
              <p>&copy; 2024 BlogSpace. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Cookie Policy", href: "/cookies" }
              ].map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );

  // Enhanced Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <Navbar onLogout={handleLogout} />
        <div className="pt-16">
          <div className="animate-pulse">
            {/* Hero skeleton */}
            <div className="bg-gradient-to-r from-purple-300 to-pink-300 h-screen mb-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/50 to-pink-400/50 animate-pulse"></div>
              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
                <div className="text-center">
                  <div className="h-16 bg-white/20 rounded-2xl mb-8 max-w-4xl mx-auto"></div>
                  <div className="h-8 bg-white/20 rounded-lg mb-8 max-w-2xl mx-auto"></div>
                  <div className="flex justify-center gap-4">
                    <div className="h-12 bg-white/20 rounded-2xl w-40"></div>
                    <div className="h-12 bg-white/20 rounded-2xl w-40"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Content skeleton */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-6"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="h-4 bg-gray-200 rounded mb-3"></div>
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-16 bg-gray-200 rounded mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
        <Navbar onLogout={handleLogout} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
          <div className="text-center">
            <div className="bg-white rounded-3xl shadow-2xl p-16 max-w-2xl mx-auto">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h2>
              <p className="text-gray-600 mb-8 text-lg">{error}</p>
              <Button 
                onClick={loadHomePageData}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-4 rounded-2xl text-lg font-medium transition-all duration-300 transform hover:scale-105"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onLogout={handleLogout} />
      
      <div className="pt-16">
        <HeroSection />
        <FeaturedBlogsSection />
        <FeaturesSection />
        <RecentBlogsSection />
        <ReviewsSection />
        <CallToActionSection />
        <FooterSection />
      </div>
      
      {/* Custom CSS for animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slide-up {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes gradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          
          .animate-fade-in { animation: fade-in 0.8s ease-out; }
          .animate-fade-in-delay { animation: fade-in 0.8s ease-out 0.3s both; }
          .animate-fade-in-delay-2 { animation: fade-in 0.8s ease-out 0.6s both; }
          .animate-slide-up { animation: slide-up 1s ease-out; }
          .animate-gradient { 
            background-size: 200% 200%;
            animation: gradient 3s ease infinite;
          }
          
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          .line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }

          .animate-scroll {
            animation: scroll 40s linear infinite;
          }
        `
      }} />
    </div>
  );
}; 