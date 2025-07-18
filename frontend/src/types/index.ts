// User types
export type User = {
  _id: string;
  email: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = {
  email: string;
  password: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

// File and Folder types matching backend models
export type FileType = {
  _id: string;
  name: string;
  content: string;
  parentId: string | null;
  userId: string;
  type: 'file';
  createdAt: string;
  updatedAt: string;
};

export type FolderType = {
  _id: string;
  name: string;
  parentId: string | null;
  userId: string;
  type: 'folder';
  isOpen: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ItemType = FileType | FolderType;

export type AddItemType = {
  type: 'file' | 'folder' | null;
  parentId: string | null;
};

export type EditingItemType = {
  id: string;
  name: string;
} | null;

// API response types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type FilesAndFoldersResponse = {
  folders: FolderType[];
  files: FileType[];
};

// Error types
export type ApiError = {
  message: string;
  code?: string;
  status?: number;
};

// For backward compatibility, keep the old id field mapped to _id
// REMOVED: FileTypeCompat and FolderTypeCompat types

// Blog types
export type BlogType = {
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
  metaTitle?: string;
  metaDescription?: string;
  userId: {
    _id: string;
    email: string;
  };
  fileId: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type BlogsResponse = {
  blogs: BlogType[];
  totalPages: number;
  currentPage: number;
  total: number;
};

export type SearchResponse = {
  blogs: BlogType[];
  totalPages: number;
  currentPage: number;
  total: number;
  searchQuery: string;
  suggestions: string[];
  hasMore: boolean;
};

export type BlogInteraction = {
  type: 'view' | 'like' | 'share';
};

export type BlogInteractionResponse = 
  | { success: true; likes: number; isLiked: boolean; message: string }
  | { success: true; views: number }
  | { success: true; shares: number };

export type BlogAnalytics = {
  blog: {
    id: string;
    title: string;
    publishedAt: string;
    views: number;
    likes: number;
    shares: number;
    readTime: number;
  };
  analytics: Array<{
    date: string;
    views: number;
    uniqueViews: number;
    likes: number;
    shares: number;
    avgTimeOnPage: number;
    bounceRate: number;
    referrers: Array<{ source: string; count: number }>;
    countries: Array<{ country: string; count: number }>;
    devices: Array<{ device: string; count: number }>;
  }>;
  totals: {
    views: number;
    uniqueViews: number;
    likes: number;
    shares: number;
    avgTimeOnPage: number;
  };
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
};

export type DashboardAnalytics = {
  totals: {
    views: number;
    uniqueViews: number;
    likes: number;
    shares: number;
  };
  analytics: Array<{
    date: string;
    views: number;
    likes: number;
    shares: number;
  }>;
  topBlogs: BlogType[];
  recentBlogs: BlogType[];
  blogCount: number;
  publishedCount: number;
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
};
