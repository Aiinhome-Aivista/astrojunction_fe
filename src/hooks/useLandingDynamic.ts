import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { API_ENDPOINTS } from '../config/api_config';

export interface HoroscopeItem {
  category: string;
  text: string;
  score: number;
  lucky_time?: string;
  remedy?: string;
  affirmation?: string;
  tip_for_the_day?: string;
  generated_at?: string;
  translated?: boolean;
}

export interface HoroscopeApiResponse {
  status: string;
  sign: string;
  system: string;
  period: string;
  period_start: string;
  period_end: string;
  lang?: string;
  translated?: boolean;
  items: HoroscopeItem[];
  stale?: boolean;
  ingresses?: any[];
}

export interface UseLandingDynamicParams {
  sign?: string | null;
  system?: 'tropical' | 'sidereal' | string;
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'today' | 'week' | 'month' | 'year' | string;
  year?: number;
  enabled?: boolean;
}

export interface UseLandingDynamicResult {
  items: HoroscopeItem[];
  loading: boolean;
  translating: boolean;
  translated: boolean;
  stale: boolean;
  periodStart: string;
  periodEnd: string;
  ingresses: any[];
  error: string | null;
  retry: () => void;
}

// Module-level in-memory cache keyed by sign|system|period|year|lang
const dynamicCache = new Map<string, HoroscopeApiResponse>();

function normalizePeriod(p?: string): string {
  if (!p) return 'daily';
  const l = p.toLowerCase().trim();
  if (l === 'today') return 'daily';
  if (l === 'week') return 'weekly';
  if (l === 'month') return 'monthly';
  if (l === 'year') return 'yearly';
  return l;
}

function normalizeLang(raw?: string): 'en' | 'hi' | 'bn' | 'ta' | 'fr' {
  if (!raw) return 'en';
  const prefix = raw.split('-')[0].toLowerCase().trim();
  if (['hi', 'bn', 'ta', 'fr'].includes(prefix)) {
    return prefix as 'hi' | 'bn' | 'ta' | 'fr';
  }
  return 'en';
}

export function useLandingDynamic({
  sign,
  system = 'tropical',
  period = 'daily',
  year,
  enabled = true,
}: UseLandingDynamicParams): UseLandingDynamicResult {
  const { i18n } = useTranslation();
  const currentLang = normalizeLang(i18n.language);

  const normPeriod = normalizePeriod(period);
  const normSystem = (system || 'tropical').toLowerCase().trim();
  const normSign = (sign || '').toLowerCase().trim();

  const [items, setItems] = useState<HoroscopeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [translating, setTranslating] = useState<boolean>(false);
  const [translated, setTranslated] = useState<boolean>(true);
  const [stale, setStale] = useState<boolean>(false);
  const [periodStart, setPeriodStart] = useState<string>('');
  const [periodEnd, setPeriodEnd] = useState<string>('');
  const [ingresses, setIngresses] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [retryTick, setRetryTick] = useState<number>(0);

  const retry = useCallback(() => {
    setRetryTick((prev) => prev + 1);
  }, []);

  const activeAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // If disabled or no sign is selected, do nothing (no API call)
    if (!enabled || !normSign) {
      return;
    }

    // Cancel any previous in-flight request on language or sign change
    if (activeAbortRef.current) {
      activeAbortRef.current.abort();
    }
    const abortCtrl = new AbortController();
    activeAbortRef.current = abortCtrl;

    // 60-second timeout
    const timeoutId = setTimeout(() => {
      abortCtrl.abort();
    }, 60000);

    const targetCacheKey = `${normSign}|${normSystem}|${normPeriod}|${normPeriod === 'yearly' ? year || '' : ''}|${currentLang}`;
    const enCacheKey = `${normSign}|${normSystem}|${normPeriod}|${normPeriod === 'yearly' ? year || '' : ''}|en`;

    const buildUrl = (targetLanguage: string) => {
      let url = `${API_ENDPOINTS.ZODIAC.MULTI_SYSTEM_HOROSCOPE}?sign=${encodeURIComponent(normSign)}&system=${encodeURIComponent(normSystem)}&period=${encodeURIComponent(normPeriod)}&category=all&lang=${targetLanguage}`;
      if (normPeriod === 'yearly' && year) {
        url += `&year=${year}`;
      }
      return url;
    };

    const fetchHoroscopeData = async () => {
      setError(null);

      // CASE 1: Language is English
      if (currentLang === 'en') {
        const cachedEn = dynamicCache.get(enCacheKey);
        if (cachedEn) {
          setItems(cachedEn.items || []);
          setPeriodStart(cachedEn.period_start || '');
          setPeriodEnd(cachedEn.period_end || '');
          setIngresses(cachedEn.ingresses || []);
          setStale(Boolean(cachedEn.stale));
          setTranslated(true);
          setTranslating(false);
          setLoading(false);
          return;
        }

        setLoading(true);
        setTranslating(false);

        try {
          const res = await api.get<any>(buildUrl('en'), { signal: abortCtrl.signal });
          const data: HoroscopeApiResponse = (res && typeof res === 'object' && 'data' in res && res.data) ? res.data : res;

          if (abortCtrl.signal.aborted) return;

          if (data && Array.isArray(data.items)) {
            dynamicCache.set(enCacheKey, data);
            setItems(data.items);
            setPeriodStart(data.period_start || '');
            setPeriodEnd(data.period_end || '');
            setIngresses(data.ingresses || []);
            setStale(Boolean(data.stale));
            setTranslated(true);
          }
        } catch (err: any) {
          if (abortCtrl.signal.aborted) return;
          console.error('[useLandingDynamic] English horoscope fetch error:', err);
          setError(err?.message || 'Failed to fetch horoscope data');
        } finally {
          if (!abortCtrl.signal.aborted) {
            setLoading(false);
            setTranslating(false);
          }
        }
        return;
      }

      // CASE 2: Non-English language (hi, bn, ta, fr)
      // Check if target translation is already cached
      const cachedTarget = dynamicCache.get(targetCacheKey);
      if (cachedTarget) {
        setItems(cachedTarget.items || []);
        setPeriodStart(cachedTarget.period_start || '');
        setPeriodEnd(cachedTarget.period_end || '');
        setIngresses(cachedTarget.ingresses || []);
        setStale(Boolean(cachedTarget.stale));
        setTranslated(cachedTarget.translated !== false);
        setTranslating(false);
        setLoading(false);
        return;
      }

      // Progressive strategy:
      // 1. Immediately show English if available in cache or fetch English first
      const cachedEn = dynamicCache.get(enCacheKey);
      if (cachedEn) {
        setItems(cachedEn.items || []);
        setPeriodStart(cachedEn.period_start || '');
        setPeriodEnd(cachedEn.period_end || '');
        setIngresses(cachedEn.ingresses || []);
        setStale(Boolean(cachedEn.stale));
        setLoading(false);
        setTranslating(true);
        setTranslated(false);
      } else {
        setLoading(true);
        setTranslating(true);
      }

      // Fetch English and target language progressively
      try {
        let hasDisplayedEnglish = Boolean(cachedEn);

        // If English is not yet cached, fetch English in background to display as quick preview
        if (!hasDisplayedEnglish) {
          api.get<any>(buildUrl('en'), { signal: abortCtrl.signal })
            .then((res) => {
              if (abortCtrl.signal.aborted) return;
              const data: HoroscopeApiResponse = (res && typeof res === 'object' && 'data' in res && res.data) ? res.data : res;
              if (data && Array.isArray(data.items)) {
                dynamicCache.set(enCacheKey, data);
                // Only set items if target translation hasn't arrived yet
                setItems((currentItems) => {
                  if (currentItems.length === 0 || !hasDisplayedEnglish) {
                    hasDisplayedEnglish = true;
                    setPeriodStart(data.period_start || '');
                    setPeriodEnd(data.period_end || '');
                    setIngresses(data.ingresses || []);
                    setStale(Boolean(data.stale));
                    setLoading(false);
                    return data.items;
                  }
                  return currentItems;
                });
              }
            })
            .catch(() => {
              // Ignore English preview error
            });
        }

        // Fetch target translated language
        const targetRes = await api.get<any>(buildUrl(currentLang), { signal: abortCtrl.signal });
        const targetData: HoroscopeApiResponse = (targetRes && typeof targetRes === 'object' && 'data' in targetRes && targetRes.data)
          ? targetRes.data
          : targetRes;

        if (abortCtrl.signal.aborted) return;

        if (targetData && Array.isArray(targetData.items)) {
          dynamicCache.set(targetCacheKey, targetData);
          setItems(targetData.items);
          setPeriodStart(targetData.period_start || '');
          setPeriodEnd(targetData.period_end || '');
          setIngresses(targetData.ingresses || []);
          setStale(Boolean(targetData.stale));
          setTranslated(targetData.translated !== false);
          setTranslating(false);
          setLoading(false);
        } else {
          // If translation payload is invalid, keep English items and indicate fallback
          setTranslated(false);
          setTranslating(false);
          setLoading(false);
        }
      } catch (err: any) {
        if (abortCtrl.signal.aborted) return;
        console.warn('[useLandingDynamic] Target language fetch error, falling back to English:', err);
        // If target translation fails, keep showing English with translated=false
        setTranslated(false);
        setTranslating(false);
        setLoading(false);
      }
    };

    fetchHoroscopeData();

    return () => {
      clearTimeout(timeoutId);
      abortCtrl.abort();
    };
  }, [normSign, normSystem, normPeriod, year, currentLang, enabled, retryTick]);

  return {
    items,
    loading,
    translating,
    translated,
    stale,
    periodStart,
    periodEnd,
    ingresses,
    error,
    retry,
  };
}

