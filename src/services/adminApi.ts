import { api } from './api';
import { API_ENDPOINTS } from '../config/api_config';

export interface DashboardStats {
  total_users: number;
  new_users_today: number;
  premium_subscribers: number;
  total_blogs: number;
}

export interface UserData {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  is_active: number;
  created_at: string;
}

export interface RevenueStats {
  total_revenue: number;
  monthly_revenue: number;
  total_successful: number;
  total_failed: number;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'pending';
  payment_method: string;
  created_at: string;
  full_name: string;
  email: string;
}

export interface AILog {
  user_id: string;
  tradition: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  module: string;
  created_at: string;
}


export interface SubscriptionPlan {
  id: string;
  plan_name: string;
  plan_type: string;
  price_inr: number;
  price_usd: number;
  description: string;
  features_json: string[];
  is_active: number;
}

export const adminApi = {
  // Existing APIs...
  getDashboardStats: async (): Promise<DashboardStats> => {
    return api.get<DashboardStats>(API_ENDPOINTS.ADMIN.DASHBOARD_STATS);
  },

  getAllUsers: async (): Promise<UserData[]> => {
    return api.get<UserData[]>(API_ENDPOINTS.ADMIN.USERS);
  },

  updateUserRole: async (userId: string, role: string): Promise<any> => {
    return api.put(API_ENDPOINTS.ADMIN.USER_ROLE(userId), { role });
  },

  updateUserStatus: async (userId: string, isActive: number): Promise<any> => {
    return api.put(API_ENDPOINTS.ADMIN.USER_STATUS(userId), { is_active: isActive });
  },

  deleteUser: async (userId: string): Promise<any> => {
    return api.delete(API_ENDPOINTS.ADMIN.USER_DELETE(userId));
  },

  getAiLogs: async (): Promise<AILog[]> => {
    return api.get<AILog[]>(API_ENDPOINTS.ADMIN.LOGS_AI);
  },

  getSystemLogs: async (): Promise<SystemLog[]> => {
    return api.get<SystemLog[]>(API_ENDPOINTS.ADMIN.LOGS_SYSTEM);
  },

  getRevenueStats: async (): Promise<RevenueStats> => {
    return api.get<RevenueStats>(API_ENDPOINTS.ADMIN.REVENUE_STATS);
  },

  getAllTransactions: async (): Promise<Transaction[]> => {
    return api.get<Transaction[]>(API_ENDPOINTS.ADMIN.REVENUE_TRANSACTIONS);
  },

  getLLMConfig: async (): Promise<LLMConfig> => {
    return api.get<LLMConfig>(API_ENDPOINTS.ADMIN.LLM_CONFIG);
  },

  updateLLMConfig: async (config: Partial<LLMConfig>): Promise<{ success: boolean; message: string; settings: LLMConfig }> => {
    return api.put(API_ENDPOINTS.ADMIN.LLM_CONFIG, config);
  },

  testLLMConnection: async (provider: string, config?: Partial<LLMConfig>): Promise<LLMTestResult> => {
    return api.post<LLMTestResult>(API_ENDPOINTS.ADMIN.LLM_TEST, { provider, config });
  },

  testAllProviders: async (): Promise<Record<string, LLMTestResult>> => {
    return api.post<Record<string, LLMTestResult>>(API_ENDPOINTS.ADMIN.LLM_TEST, { provider: 'all' });
  },

  getSeoConfig: async (): Promise<Record<string, any>> => {
    const res = await api.get<any>(API_ENDPOINTS.ADMIN.SEO_CONFIG);
    return (res as any)?.data || res;
  },

  updateSeoConfig: async (seoConfig: Record<string, any>): Promise<any> => {
    return api.put(API_ENDPOINTS.ADMIN.SEO_CONFIG, seoConfig);
  },

  // Subscription Plans
  getSubscriptionPlans: async (): Promise<SubscriptionPlan[]> => {
    const res = await api.get<any>('/api/admin/subscription-plans');
    return res?.data || res;
  },
  
  createSubscriptionPlan: async (plan: Partial<SubscriptionPlan>): Promise<any> => {
    return api.post('/api/admin/subscription-plans', plan);
  },

  updateSubscriptionPlan: async (id: string, plan: Partial<SubscriptionPlan>): Promise<any> => {
    return api.put(`/api/admin/subscription-plans/${id}`, plan);
  },

  deleteSubscriptionPlan: async (id: string): Promise<any> => {
    return api.delete(`/api/admin/subscription-plans/${id}`);
  },

  // Telemetry & Event Tracking
  getTelemetryStats: async (params?: { timeout_minutes?: number }): Promise<TelemetryStats> => {
    const q = params?.timeout_minutes ? `?timeout_minutes=${params.timeout_minutes}` : '';
    return api.get<TelemetryStats>(`${API_ENDPOINTS.ADMIN.TELEMETRY_STATS}${q}`);
  },

  getTelemetrySessions: async (params?: { page?: number; page_size?: number; search?: string; status?: string; timeout_minutes?: number }): Promise<{
    sessions: TelemetrySession[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  }> => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.page_size) q.set('page_size', String(params.page_size));
    if (params?.search) q.set('search', params.search);
    if (params?.status) q.set('status', params.status);
    if (params?.timeout_minutes) q.set('timeout_minutes', String(params.timeout_minutes));
    const queryString = q.toString() ? `?${q.toString()}` : '';
    return api.get<any>(`${API_ENDPOINTS.ADMIN.TELEMETRY_SESSIONS}${queryString}`);
  },

  getTelemetryEvents: async (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    session_id?: string;
    user_id?: string;
    category?: string;
    status?: string;
  }): Promise<{
    events: TelemetryEvent[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  }> => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.page_size) q.set('page_size', String(params.page_size));
    if (params?.search) q.set('search', params.search);
    if (params?.session_id) q.set('session_id', params.session_id);
    if (params?.user_id) q.set('user_id', params.user_id);
    if (params?.category) q.set('category', params.category);
    if (params?.status) q.set('status', params.status);
    const queryString = q.toString() ? `?${q.toString()}` : '';
    return api.get<any>(`${API_ENDPOINTS.ADMIN.TELEMETRY_EVENTS}${queryString}`);
  },

  getSessionTimeline: async (sessionId: string): Promise<SessionTimeline> => {
    return api.get<SessionTimeline>(API_ENDPOINTS.ADMIN.SESSION_TIMELINE(sessionId));
  },
};

export interface TelemetryStats {
  active_sessions_now: number;
  total_events_today: number;
  success_rate: number;
  failed_events_today: number;
  avg_latency_ms: number;
  total_all_time_events: number;
  total_all_time_sessions: number;
  category_breakdown: Array<{ event_category: string; count: number }>;
}

export interface TelemetrySession {
  id: string;
  user_id: string | null;
  user_email: string | null;
  user_name: string | null;
  ip_address: string | null;
  user_agent: string | null;
  device_type: string | null;
  started_at: string;
  last_activity_at: string;
  is_active: number;
  event_count: number;
  error_count: number;
  last_action?: string | null;
  last_status?: string | null;
}

export interface TelemetryEvent {
  id: string;
  session_id: string;
  user_id: string | null;
  user_email: string | null;
  user_name: string | null;
  device_type?: string | null;
  event_name: string;
  event_category: string;
  input_payload: string | null;
  status: 'SUCCESS' | 'FAILURE' | 'PENDING' | 'CANCELLED';
  result_summary: string | null;
  execution_time_ms: number;
  error_message: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface SessionTimeline extends TelemetrySession {
  events: TelemetryEvent[];
}


export interface LLMConfig {
  ACTIVE_LLM: 'mistral_local' | 'gemini' | 'mistral_cloud' | 'openai' | 'openrouter';
  MISTRAL_LOCAL_URL: string;
  MISTRAL_MODEL: string;
  GEMINI_API_KEY: string;
  GEMINI_MODEL: string;
  MISTRAL_CLOUD_URL: string;
  MISTRAL_CLOUD_API_KEY: string;
  OPENAI_API_KEY: string;
  OPENAI_MODEL: string;
  OPENAI_BASE_URL: string;
  OPENROUTER_API_KEY?: string;
  OPENROUTER_MODEL?: string;
  OPENROUTER_BASE_URL?: string;
  ENABLE_AUTO_FAILOVER?: string | boolean;
  FALLBACK_LLM?: 'mistral_local' | 'gemini' | 'mistral_cloud' | 'openai' | 'openrouter';
  LLM_TIMEOUT?: string | number;
  LLM_TEMPERATURE?: string | number;
  LLM_MAX_TOKENS?: string | number;
  is_configured?: {
    mistral_local?: boolean;
    gemini?: boolean;
    mistral_cloud?: boolean;
    openai?: boolean;
    openrouter?: boolean;
  };
  gemini?: { is_configured: boolean; model?: string; masked_key?: string };
  openai?: { is_configured: boolean; model?: string; masked_key?: string };
  openrouter?: { is_configured: boolean; model?: string; masked_key?: string; base_url?: string };
  mistral_cloud?: { is_configured: boolean; model?: string; masked_key?: string };
  mistral_local?: { url?: string; model?: string };
}

export interface LLMTestResult {
  provider: string;
  status: 'ok' | 'error';
  message: string;
  latency_ms: number;
}
