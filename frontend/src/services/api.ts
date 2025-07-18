import type { 
  LoginCredentials, 
  RegisterCredentials, 
  AuthResponse, 
  FileType, 
  FolderType, 
  FilesAndFoldersResponse,
  BlogType,
  BlogsResponse,
  BlogInteraction,
  BlogInteractionResponse,
  BlogAnalytics,
  DashboardAnalytics,
  SearchResponse
} from '../types';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:9000/api';

class ApiService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Load tokens from localStorage on initialization
    this.loadTokens();
  }

  private loadTokens() {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  private saveTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add authorization header if we have an access token
    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401 && data.code === 'TOKEN_EXPIRED') {
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            // Retry the original request with the new token
            headers.Authorization = `Bearer ${this.accessToken}`;
            const retryResponse = await fetch(url, {
              ...options,
              headers,
            });
            
            if (retryResponse.ok) {
              return await retryResponse.json();
            }
          }
        }
        
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.accessToken;
        localStorage.setItem('accessToken', data.accessToken);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    // If refresh fails, clear tokens
    this.clearTokens();
    return false;
  }

  // Authentication methods
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    this.saveTokens(response.accessToken, response.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));
    return response;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    this.saveTokens(response.accessToken, response.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      this.clearTokens();
    }
  }

  async logoutAll(): Promise<void> {
    try {
      await this.request('/auth/logout-all', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout all request failed:', error);
    } finally {
      this.clearTokens();
    }
  }

  // File management methods
  async getFilesAndFolders(): Promise<FilesAndFoldersResponse> {
    return await this.request<FilesAndFoldersResponse>('/files');
  }

  async createFile(name: string, parentId: string | null = null): Promise<FileType> {
    return await this.request<FileType>('/files/file', {
      method: 'POST',
      body: JSON.stringify({ name, parentId }),
    });
  }

  async createFolder(name: string, parentId: string | null = null): Promise<FolderType> {
    return await this.request<FolderType>('/files/folder', {
      method: 'POST',
      body: JSON.stringify({ name, parentId }),
    });
  }

  async updateFile(id: string, updates: Partial<FileType>): Promise<FileType> {
    return await this.request<FileType>(`/files/file/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async updateFolder(id: string, updates: Partial<FolderType>): Promise<FolderType> {
    return await this.request<FolderType>(`/files/folder/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteItem(id: string, type: 'file' | 'folder'): Promise<void> {
    await this.request(`/files/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ type }),
    });
  }

  // Blog methods
  
  // Public blog methods (no authentication required)
  async getPublicBlogBySlug(slug: string): Promise<BlogType> {
    return await this.request(`/blogs/public/${slug}`);
  }

  async getAllPublicBlogs(params: { page?: number; limit?: number; search?: string; tags?: string } = {}): Promise<BlogsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.tags) queryParams.append('tags', params.tags);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/blogs/public?${queryString}` : '/blogs/public';
    
    return await this.request(endpoint);
  }

  async searchBlogs(params: {
    q: string;
    page?: number;
    limit?: number;
    tags?: string;
    sortBy?: 'relevance' | 'date' | 'views' | 'likes';
    sortOrder?: 'asc' | 'desc';
    includeOwn?: boolean;
  }): Promise<SearchResponse> {
    const queryParams = new URLSearchParams();
    
    queryParams.append('q', params.q);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.tags) queryParams.append('tags', params.tags);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.includeOwn !== undefined) queryParams.append('includeOwn', params.includeOwn.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/blogs/search?${queryString}`;
    
    return await this.request(endpoint);
  }

  async trackBlogInteraction(blogId: string, interaction: BlogInteraction): Promise<BlogInteractionResponse> {
    return await this.request(`/blogs/public/${blogId}/track`, {
      method: 'POST',
      body: JSON.stringify(interaction),
    });
  }

  async getBlogLikeStatus(blogId: string): Promise<{ isLiked: boolean; totalLikes: number }> {
    return await this.request(`/blogs/public/${blogId}/like-status`);
  }

  // Protected blog methods (authentication required)
  async publishBlog(blogData: { 
    fileId: string; 
    title: string; 
    excerpt: string; 
    tags: string[];
    metaTitle?: string;
    metaDescription?: string;
  }): Promise<BlogType> {
    return await this.request('/blogs/publish', {
      method: 'POST',
      body: JSON.stringify(blogData),
    });
  }

  async getBlogsByFileId(fileId: string): Promise<BlogsResponse> {
    return await this.request(`/blogs?fileId=${fileId}`);
  }

  async getUserBlogs(): Promise<BlogsResponse> {
    return await this.request('/blogs');
  }

  async getBlog(id: string): Promise<BlogType> {
    return await this.request(`/blogs/${id}`);
  }

  async updateBlog(id: string, updates: Partial<BlogType>): Promise<BlogType> {
    return await this.request(`/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteBlog(id: string): Promise<void> {
    await this.request(`/blogs/${id}`, {
      method: 'DELETE',
    });
  }

  async getBlogAnalytics(id: string, days: number = 30): Promise<BlogAnalytics> {
    return await this.request(`/blogs/${id}/analytics?days=${days}`);
  }

  async getDashboardAnalytics(days: number = 30): Promise<DashboardAnalytics> {
    return await this.request(`/blogs/dashboard?days=${days}`);
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}

export const apiService = new ApiService(); 