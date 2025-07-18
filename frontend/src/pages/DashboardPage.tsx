import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Eye, 
  Heart, 
  Share2, 
  FileText, 
  Activity
} from 'lucide-react';
import { Navbar } from '../components/UI/Navbar';
import { Button } from '../components/UI/Button';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';

interface Blog {
  _id: string;
  title: string;
  views: number;
  likes: number;
  shares: number;
  publishedAt?: string;
  status: 'draft' | 'published' | 'archived';
}

interface DashboardStats {
  totals: {
    views: number;
    uniqueViews: number;
    likes: number;
    shares: number;
  };
  blogCount: number;
  publishedCount: number;
  topBlogs: Blog[];
  recentBlogs: Blog[];
  analytics: Array<{
    date: string;
    views: number;
    likes: number;
    shares: number;
  }>;
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
}

export const DashboardPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    loadDashboardStats();
  }, [period]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiService.getDashboardAnalytics(period);
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      setError('Failed to load dashboard statistics');
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

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const StatCard = ({ title, value, icon: Icon, color, change }: {
    title: string;
    value: number;
    icon: React.ElementType;
    color: string;
    change?: number;
  }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(value)}</p>
          {change !== undefined && (
            <p className={`text-xs mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change.toFixed(1)}% from last period
            </p>
          )}
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <Navbar onLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center pt-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <Navbar onLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center pt-16">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <Activity className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadDashboardStats}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar onLogout={handleLogout} />
      
      <div className="flex-1 overflow-auto pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Monitor your blog performance and analytics</p>
              </div>
              <div className="flex items-center space-x-3">
                <select
                  value={period}
                  onChange={(e) => setPeriod(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                </select>
                <Button onClick={() => navigate('/dashboard/editor')} className="bg-blue-600 hover:bg-blue-700">
                  <FileText className="w-4 h-4 mr-2" />
                  New Post
                </Button>
                <Button onClick={() => navigate('/blog')} variant="secondary">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Search Blogs
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Views"
              value={stats?.totals.views || 0}
              icon={Eye}
              color="bg-blue-500"
            />
            <StatCard
              title="Unique Views"
              value={stats?.totals.uniqueViews || 0}
              icon={Activity}
              color="bg-green-500"
            />
            <StatCard
              title="Likes"
              value={stats?.totals.likes || 0}
              icon={Heart}
              color="bg-red-500"
            />
            <StatCard
              title="Shares"
              value={stats?.totals.shares || 0}
              icon={Share2}
              color="bg-purple-500"
            />
          </div>

          {/* Blog Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Blog Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Blogs</span>
                  <span className="font-semibold">{stats?.blogCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Published</span>
                  <span className="font-semibold text-green-600">{stats?.publishedCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Drafts</span>
                  <span className="font-semibold text-yellow-600">
                    {(stats?.blogCount || 0) - (stats?.publishedCount || 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Blogs</h3>
              <div className="space-y-3">
                {stats?.topBlogs?.slice(0, 3).map((blog, index) => (
                  <div key={blog._id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {blog.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {blog.views} views
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">#{index + 1}</span>
                  </div>
                )) || (
                  <p className="text-gray-500 text-sm">No blogs published yet</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {stats?.recentBlogs?.slice(0, 3).map((blog) => (
                  <div key={blog._id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {blog.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : 'Draft'}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      blog.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {blog.status}
                    </span>
                  </div>
                )) || (
                  <p className="text-gray-500 text-sm">No recent activity</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => navigate('/dashboard/editor')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <FileText className="w-4 h-4 mr-2" />
                Create New Post
              </Button>
              <Button 
                onClick={() => navigate('/dashboard/blogs')}
                variant="secondary"
                className="w-full"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                My Blogs
              </Button>
              <Button 
                onClick={() => navigate('/dashboard/editor')}
                variant="secondary"
                className="w-full"
              >
                <FileText className="w-4 h-4 mr-2" />
                Editor
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 