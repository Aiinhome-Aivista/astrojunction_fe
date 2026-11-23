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
  if (!url) return '/blog_1.webp';

  let processedUrl = url;
  // If uploaded image has .png / .jpg / .jpeg, swap to .webp to save MBs
  if (processedUrl.includes('/upload/blogs_image/') && /\.(png|jpe?g)$/i.test(processedUrl)) {
    processedUrl = processedUrl.replace(/\.(png|jpe?g)$/i, '.webp');
  }

  if (processedUrl.startsWith('http://') || processedUrl.startsWith('https://') || processedUrl.startsWith('blob:') || processedUrl.startsWith('data:')) {
    return processedUrl;
  }
  // If uploaded via backend (/upload/, /uploads/, or /static/)
  if (
    processedUrl.startsWith('/upload/') || processedUrl.startsWith('upload/') ||
    processedUrl.startsWith('/uploads/') || processedUrl.startsWith('uploads/') ||
    processedUrl.startsWith('/static/') || processedUrl.startsWith('static/')
  ) {
    const base = (getApiBaseUrl() || '').replace(/\/+$/, '');
    return `${base}${processedUrl.startsWith('/') ? '' : '/'}${processedUrl}`;
  }
  // Convert standard static assets from .jpg to .webp if available
  if (processedUrl.endsWith('.jpg')) {
    const webpUrl = processedUrl.replace(/\.jpg$/, '.webp');
    return webpUrl.startsWith('/') ? webpUrl : `/${webpUrl}`;
  }
  // Local frontend assets (like /blog_1.webp)
  return processedUrl.startsWith('/') ? processedUrl : `/${processedUrl}`;
};

export const blogApi = {
  getBlogs: async (status?: string, lang?: string): Promise<BlogPost[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (lang && lang !== 'en') params.append('lang', lang);
    const qs = params.toString();
    const url = qs ? `${API_ENDPOINTS.BLOGS.LIST}?${qs}` : API_ENDPOINTS.BLOGS.LIST;
    return api.get<BlogPost[]>(url);
  },

  getBlog: async (id: string | number, lang?: string): Promise<BlogPost> => {
    const url = lang && lang !== 'en' ? `${API_ENDPOINTS.BLOGS.DETAIL(id)}?lang=${lang}` : API_ENDPOINTS.BLOGS.DETAIL(id);
    return api.get<BlogPost>(url);
  },

  getBlogBySlug: async (slug: string, lang?: string): Promise<BlogPost> => {
    const url = lang && lang !== 'en' ? `/api/blogs/slug/${slug}?lang=${lang}` : `/api/blogs/slug/${slug}`;
    return api.get<BlogPost>(url);
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
