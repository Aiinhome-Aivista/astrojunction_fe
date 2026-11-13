import { api } from './api';
import { API_ENDPOINTS } from '../config/api_config';

export const zodiacApi = {
  getAll: async (): Promise<any> => {
    return api.get(API_ENDPOINTS.ZODIAC.ALL);
  },

  getGlobalForecast: async (sign?: string): Promise<any> => {
    return api.post(API_ENDPOINTS.ZODIAC.GLOBAL_FORECAST, { sign });
  },

  getCompatibility: async (sign1: string, sign2: string): Promise<any> => {
    return api.post(API_ENDPOINTS.ZODIAC.COMPATIBILITY, { sign1, sign2 });
  },

  subscribeDailyUpdate: async (payload: {
    email: string;
    zodiac_sign: string;
    preferred_categories: string[];
  }): Promise<any> => {
    return api.post(API_ENDPOINTS.ZODIAC.DAILY_UPDATE_SUBSCRIBE, payload);
  },

  getDailyCategoryInsight: async (sign: string, category: string): Promise<any> => {
    return api.get(`${API_ENDPOINTS.ZODIAC.DAILY_CATEGORY_INSIGHT}?sign=${encodeURIComponent(sign)}&category=${encodeURIComponent(category)}`);
  },

  getMultiSystemHoroscope: async (params: {
    sign: string;
    system?: string;
    period?: string;
    category?: string;
  }): Promise<any> => {
    const query = new URLSearchParams({
      sign: params.sign,
      system: params.system || 'tropical',
      period: params.period || 'daily',
      category: params.category || 'all',
    });
    return api.get(`${API_ENDPOINTS.ZODIAC.MULTI_SYSTEM_HOROSCOPE}?${query.toString()}`);
  },
};
