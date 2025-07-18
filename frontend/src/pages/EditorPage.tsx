import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar/Sidebar';
import { Editor } from '../components/Editor/Editor';
import { Preview } from '../components/Preview/Preview';
import { useAuth } from '../hooks/useAuth';
import { useFileSystem } from '../hooks/useFileSystem';
import { useDebounceAsyncCallback } from '../hooks/useDebounce';
import { Button, Navbar } from '../components/UI';
import { Send, Eye, Heart, Share2, BarChart3, Calendar } from 'lucide-react';
import { apiService } from '../services/api';
import type { FileType, FolderType, BlogType } from '../types';

interface BlogAnalytics {
  _id: string;
  views: number;
  likes: number;
  shares: number;
  publishedAt?: string;
}

export const EditorPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishData, setPublishData] = useState({
    title: '',
    excerpt: '',
    tags: '',
    metaTitle: '',
    metaDescription: ''
  });
  const [blogAnalytics, setBlogAnalytics] = useState<BlogAnalytics | null>(null);
  const [blogData, setBlogData] = useState<BlogType | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const {
    folders,
    files,
    currentFile,
    currentFolder,
    isLoading,
    error,
    setCurrentFile,
    setCurrentFolder,
    createFile,
    createFolder,
    updateFile,
    updateFolder,
    deleteItem,
    clearError,
  } = useFileSystem();

  // Load specific file if provided in query params
  useEffect(() => {
    const fileId = searchParams.get('file');
    if (fileId && files.length > 0) {
      const file = files.find(f => f._id === fileId);
      if (file) {
        setCurrentFile(file);
      }
    }
  }, [searchParams, files]);

  // Load blog analytics for current file
  useEffect(() => {
    // Clear previous blog data immediately when switching files
    setBlogAnalytics(null);
    setBlogData(null);
    
    if (currentFile) {
      loadBlogAnalytics();
    }
  }, [currentFile]);

  const loadBlogAnalytics = async () => {
    if (!currentFile) return;
    
    try {
      const data = await apiService.getBlogsByFileId(currentFile._id);
      if (data.blogs && data.blogs.length > 0) {
        const blog = data.blogs[0];
        setBlogAnalytics(blog);
        setBlogData(blog);
      } else {
        setBlogAnalytics(null);
        setBlogData(null);
      }
    } catch (error) {
      console.error('Failed to load blog analytics:', error);
      setBlogAnalytics(null);
      setBlogData(null);
    }
  };

  const handleOpenPublishModal = () => {
    if (blogData) {
      // Pre-populate modal with existing blog data for updates
      setPublishData({
        title: blogData.title || '',
        excerpt: blogData.excerpt || '',
        tags: blogData.tags ? blogData.tags.join(', ') : '',
        metaTitle: blogData.metaTitle || '',
        metaDescription: blogData.metaDescription || ''
      });
    } else {
      // Reset modal for new publish
      setPublishData({
        title: currentFile?.name.replace('.md', '') || '',
        excerpt: '',
        tags: '',
        metaTitle: '',
        metaDescription: ''
      });
    }
    setShowPublishModal(true);
  };

  const handlePublish = async () => {
    if (!currentFile) return;
    
    setIsPublishing(true);
    try {
      await apiService.publishBlog({
        fileId: currentFile._id,
        title: publishData.title || currentFile.name.replace('.md', ''),
        excerpt: publishData.excerpt,
        tags: publishData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        metaTitle: publishData.metaTitle,
        metaDescription: publishData.metaDescription
      });
      
      setShowPublishModal(false);
      setPublishData({
        title: '',
        excerpt: '',
        tags: '',
        metaTitle: '',
        metaDescription: ''
      });
      // Reload analytics
      loadBlogAnalytics();
      alert(blogData ? 'Blog updated successfully!' : 'Blog published successfully!');
    } catch (error) {
      console.error('Failed to publish blog:', error);
      alert(blogData ? 'Failed to update blog. Please try again.' : 'Failed to publish blog. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleFileClick = (file: FileType) => setCurrentFile(file);

  const handleFolderClick = (folder: FolderType) => setCurrentFolder(folder);

  const handleToggleFolder = async (id: string) => {
    const folder = folders.find((f) => f._id === id);
    if (folder) {
      try {
        await updateFolder(id, { isOpen: !folder.isOpen });
      } catch (error) {
        console.error('Failed to toggle folder:', error);
      }
    }
  };

  const handleDeleteItem = async (id: string, type: 'file' | 'folder') => {
    try {
      await deleteItem(id, type);
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleEditItem = async (id: string, name: string) => {
    try {
      const file = files.find((f) => f._id === id);
      if (file) {
        await updateFile(id, { name });
      } else {
        const folder = folders.find((f) => f._id === id);
        if (folder) {
          await updateFolder(id, { name });
        }
      }
    } catch (error) {
      console.error('Failed to edit item:', error);
    }
  };

  const handleAddItem = async (
    name: string,
    type: 'file' | 'folder',
    parentId: string | null,
  ) => {
    if (!name.trim()) return;

    try {
      if (type === 'file') {
        await createFile(name, parentId);
      } else {
        const newFolder = await createFolder(name, parentId);
        // Ensure the parent folder is open so the new item is visible
        if (parentId) {
          await updateFolder(parentId, { isOpen: true });
        }
        // Optionally open the newly created folder
        await updateFolder(newFolder._id, { isOpen: true });
      }
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  // Debounced version of file content saving to prevent excessive API calls
  const debouncedUpdateFile = useDebounceAsyncCallback(async (id: string, content: string) => {
    try {
      await updateFile(id, { content });
    } catch (error) {
      console.error('Failed to update file content:', error);
    }
  }, 1000); // 1 second debounce delay

  const handleContentChange = async (content: string) => {
    if (currentFile) {
      // Update UI immediately for responsive typing experience
      setCurrentFile(prevFile => prevFile ? { ...prevFile, content } : null);
      
      // Debounced save to server
      debouncedUpdateFile(currentFile._id, content);
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

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navbar */}
      <Navbar onLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex flex-1 pt-16">
        {/* Publish Modal */}
        {showPublishModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{blogData ? 'Update Blog Post' : 'Publish Blog Post'}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={publishData.title}
                    onChange={(e) => setPublishData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder={currentFile?.name.replace('.md', '') || 'Enter title'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                  <textarea
                    value={publishData.excerpt}
                    onChange={(e) => setPublishData(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Brief description of your post"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <input
                    type="text"
                    value={publishData.tags}
                    onChange={(e) => setPublishData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="Comma-separated tags"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                  <input
                    type="text"
                    value={publishData.metaTitle}
                    onChange={(e) => setPublishData(prev => ({ ...prev, metaTitle: e.target.value }))}
                    placeholder="SEO title for search engines"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                  <textarea
                    value={publishData.metaDescription}
                    onChange={(e) => setPublishData(prev => ({ ...prev, metaDescription: e.target.value }))}
                    placeholder="SEO description for search engines"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>
                <div className="flex space-x-3">
                  <Button
                    onClick={() => setShowPublishModal(false)}
                    variant="secondary"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isPublishing ? (blogData ? 'Updating...' : 'Publishing...') : (blogData ? 'Update' : 'Publish')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        <Sidebar
          folders={folders}
          files={files}
          currentFile={currentFile}
          currentFolder={currentFolder}
          onFileClick={handleFileClick}
          onFolderClick={handleFolderClick}
          onToggleFolder={handleToggleFolder}
          onDeleteItem={handleDeleteItem}
          onEditItem={handleEditItem}
          onAddItem={handleAddItem}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />

        <div className="flex-1 flex flex-col">
          {/* Top Bar with Publish Button and Analytics */}
          {currentFile && (
            <div className="bg-white border-b border-gray-200 p-4 mx-4 mt-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h2 className="text-lg font-semibold text-gray-900">{currentFile.name}</h2>
                  {blogAnalytics && (
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {blogAnalytics.views} views
                      </div>
                      <div className="flex items-center">
                        <Heart className="w-4 h-4 mr-1" />
                        {blogAnalytics.likes} likes
                      </div>
                      <div className="flex items-center">
                        <Share2 className="w-4 h-4 mr-1" />
                        {blogAnalytics.shares} shares
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {blogAnalytics.publishedAt 
                          ? new Date(blogAnalytics.publishedAt).toLocaleDateString()
                          : 'Not published'
                        }
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={() => navigate('/dashboard')}
                    variant="ghost"
                    size="sm"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button
                    onClick={handleOpenPublishModal}
                    className="bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {blogAnalytics ? 'Update' : 'Publish'}
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Error display */}
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 m-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <Button
                  onClick={clearError}
                  variant="ghost"
                  size="sm"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading...</p>
              </div>
            </div>
          )}

          {currentFile ? (
            <div className="grid grid-cols-2 gap-6 p-6 h-full">
              <Editor
                content={currentFile.content}
                onChange={handleContentChange}
                className="h-full"
              />
              <Preview content={currentFile.content} className="h-full" />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md mx-auto p-8">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Welcome to BlogSpace</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Select a file from the sidebar to start editing, or create a new markdown file to begin your writing journey.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Real-time preview as you type
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Export to PDF with one click
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    Organize files in folders
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 