import { api, getApiBaseUrl, getToken } from './api';
import { API_ENDPOINTS } from '../config/api_config';

export interface BlogPost {
  id: number;
  slug?: string;
  title: string;
  category: string;
  sub_category?: string;
  author: string;
  date: string;
  read_time: string;
  views: number;
  status: 'Published' | 'Draft';
  tags: string[];
  image_url: string;
  pinned: number;
  preview?: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Subcategory {
  id: number;
  name: string;
  category_id: number;
}

export const getBlogImageUrl = (url?: string): string => {
  if (!url) return '/blog_1.jpg';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  // If uploaded via backend (/upload/, /uploads/, or /static/)
  if (
    url.startsWith('/upload/') || url.startsWith('upload/') ||
    url.startsWith('/uploads/') || url.startsWith('uploads/') ||
    url.startsWith('/static/') || url.startsWith('static/')
  ) {
    const base = (getApiBaseUrl() || '').replace(/\/+$/, '');
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  }
  // Local frontend assets (like /blog_1.jpg)
  return url.startsWith('/') ? url : `/${url}`;
};

export const blogApi = {
  getBlogs: async (status?: string): Promise<BlogPost[]> => {
    const url = status ? `${API_ENDPOINTS.BLOGS.LIST}?status=${status}` : API_ENDPOINTS.BLOGS.LIST;
    return api.get<BlogPost[]>(url);
  },

  getBlog: async (id: string | number): Promise<BlogPost> => {
    return api.get<BlogPost>(API_ENDPOINTS.BLOGS.DETAIL(id));
  },

  getBlogBySlug: async (slug: string): Promise<BlogPost> => {
    return api.get<BlogPost>(`/api/blogs/slug/${slug}`);
  },

  createBlog: async (payload: any): Promise<any> => {
    return api.post(API_ENDPOINTS.BLOGS.LIST, payload);
  },

  updateBlog: async (id: string | number, payload: any): Promise<any> => {
    return api.put(API_ENDPOINTS.BLOGS.DETAIL(id), payload);
  },

  deleteBlog: async (id: string | number): Promise<any> => {
    return api.delete(API_ENDPOINTS.BLOGS.DETAIL(id));
  },

  getCategories: async (): Promise<Category[]> => {
    return api.get<Category[]>(API_ENDPOINTS.BLOGS.CATEGORIES);
  },

  createCategory: async (name: string): Promise<any> => {
    return api.post(API_ENDPOINTS.BLOGS.CATEGORIES, { name });
  },

  deleteCategory: async (id: number): Promise<any> => {
    return api.delete(API_ENDPOINTS.BLOGS.CATEGORY_DETAIL(id));
  },

  getSubcategories: async (): Promise<Subcategory[]> => {
    try {
      return await api.get<Subcategory[]>(API_ENDPOINTS.BLOGS.SUBCATEGORIES);
    } catch {
      return [];
    }
  },

  createSubcategory: async (name: string, categoryId: number): Promise<any> => {
    return api.post(API_ENDPOINTS.BLOGS.SUBCATEGORIES, { name, category_id: categoryId });
  },

  deleteSubcategory: async (id: number): Promise<any> => {
    return api.delete(API_ENDPOINTS.BLOGS.SUBCATEGORY_DETAIL(id));
  },

  uploadBlogImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const token = getToken();
    const base = (getApiBaseUrl() || '').replace(/\/+$/, '');
    const res = await fetch(`${base}/api/upload/blog-image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) throw new Error('Image upload failed');
    return res.json();
  },

  shareBlog: async (id: number): Promise<any> => {
    return api.post(`/api/blogs/${id}/share`, {});
  },
};
