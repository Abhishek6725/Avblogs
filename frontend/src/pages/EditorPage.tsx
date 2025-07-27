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
}; 
