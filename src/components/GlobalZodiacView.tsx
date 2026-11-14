import React, { useState, useEffect } from 'react';
import {
  Globe,
  Flame,
  Mountain,
  Wind,
  Droplets,
  Heart,
  Briefcase,
  Coins,
  Compass,
  Calendar,
  Layers,
  ArrowRight,
  MessageSquareText,
  CheckCircle,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Zap,
  Sparkles,
  GraduationCap,
  Building2,
  Landmark,
  Activity,
  TrendingUp,
  Users,
  Plane,
  Mail,
} from 'lucide-react';
import { DailyUpdateModal } from './DailyUpdateModal';
import { DailyUpdateInlineCard } from './DailyUpdateInlineCard';
import { ZodiacSign, calculateZodiacCompatibility, ZodiacCompatibilityResult } from '../services/zodiacData';
import { useZodiacData } from '../hooks/useZodiacData';
import { API_ENDPOINTS } from '../config/api_config';
import { api } from '../services/api';
import { sessionTracker } from '../services/sessionTracker';
import { getTranslation } from '../services/translations';
import { UserProfile } from '../types';
import {
  ZODIAC_CATEGORIES,
  getSignCategoryInsightDetails,
  getPredictionTier,
  ZodiacCategory,
  PredictionTier,
} from '../services/zodiacCategoryInsights';

function getZodiacSignId(dateStr?: string): string {
  if (!dateStr) return 'aries';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'aries';
  
  const m = date.getMonth() + 1; // 1-12
  const d = date.getDate();

  if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return 'aries';
  if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return 'taurus';
  if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) return 'gemini';
  if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) return 'cancer';
  if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return 'leo';
  if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return 'virgo';
  if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return 'libra';
  if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return 'scorpio';
  if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return 'sagittarius';
  if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return 'capricorn';
  if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return 'aquarius';
  if ((m === 2 && d >= 19) || (m === 3 && d <= 20)) return 'pisces';
  
  return 'aries';
}

/**
 * Strips markdown symbols (**, #, bullets) defensively before plain-text rendering.
 * Safely handles strings, objects, numbers, and preserves paragraph breaks.
 */
const stripMarkdownDefensively = (str?: any): string => {
  if (!str) return '';
  let text = '';
  if (typeof str === 'string') {
    text = str;
  } else if (typeof str === 'object') {
    text = (typeof str.text === 'string' && str.text)
      || (typeof str.insight === 'string' && str.insight)
      || (typeof str.forecast === 'string' && str.forecast)
      || (typeof str.content === 'string' && str.content)
      || '';
  } else {
    text = String(str);
  }
  return text
    .replace(/\*\*/g, '')
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*/g, '')
    .replace(/^[\s-•●▪▫✦★+]+\s+/gm, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

function formatWeekRange(startStr?: string, endStr?: string): string {
  if (!startStr) return '';
  try {
    const s = new Date(startStr);
    if (isNaN(s.getTime())) return String(startStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const sMonth = months[s.getUTCMonth()];
    const sDay = s.getUTCDate();
    const sYear = s.getUTCFullYear();

    if (endStr) {
      const e = new Date(endStr);
      if (!isNaN(e.getTime())) {
        const eMonth = months[e.getUTCMonth()];
        const eDay = e.getUTCDate();
        const eYear = e.getUTCFullYear();
        return `${sDay} ${sMonth} - ${eDay} ${eMonth} ${sYear}`;
      }
    }
    return `${sDay} ${sMonth} ${sYear}`;
  } catch {
    return String(startStr) + (endStr ? ` - ${String(endStr)}` : '');
  }
}

function formatMonthLabel(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  } catch {
    return String(dateStr);
  }
}

function getTodayFormatted(): string {
  try {
    const d = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}



interface GlobalZodiacViewProps {
  profile?: UserProfile;
  chartData?: any;
  language?: string;
  onAskAIForSign?: (signName: string, promptText: string) => void;
  theme?: 'light' | 'dark';
}

export const GlobalZodiacView: React.FC<GlobalZodiacViewProps> = ({
  profile,
  chartData,
  language = 'en',
  onAskAIForSign,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const { zodiacs, loading, error } = useZodiacData();

  const [selectedElement, setSelectedElement] = useState<'All' | 'Fire' | 'Earth' | 'Air' | 'Water'>('All');
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'year'>('today');
  const [zodiacSystem, setZodiacSystem] = useState<'tropical' | 'sidereal'>('tropical');
  const [selectedSignId, setSelectedSignId] = useState<string | null>(null);
  const [hasSelectedSign, setHasSelectedSign] = useState(false);
  const [vitalityMap, setVitalityMap] = useState<Record<string, number>>({});
  const [isScreenLoading, setIsScreenLoading] = useState(false);
  const deepDiveRef = React.useRef<HTMLDivElement>(null);
  
  // Compatibility state
  const [compatSignA, setCompatSignA] = useState<string>('aries');
  const [compatSignB, setCompatSignB] = useState<string>('leo');

  // Dynamic AI Forecast state
  const [dynamicZodiacData, setDynamicZodiacData] = useState<Record<string, any>>({});
  const [isFetchingForecast, setIsFetchingForecast] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isDailyUpdateModalOpen, setIsDailyUpdateModalOpen] = useState(false);
  const [isPulseExpanded, setIsPulseExpanded] = useState(false);
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [availableYears, setAvailableYears] = useState<number[]>([2026, 2027]);

  // Fetch available years for yearly outlook
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const res = await api.get<any>(`${API_ENDPOINTS.ZODIAC.HOROSCOPE_YEARS}?period=yearly`);
        const data = (res && typeof res === 'object' && 'data' in res && res.data) ? res.data : res;
        if (data && Array.isArray(data.years) && data.years.length > 0) {
          setAvailableYears(data.years);
          if (!data.years.includes(selectedYear)) {
            setSelectedYear(data.years[0]);
          }
        }
      } catch {
        // keep default [2026, 2027]
      }
    };
    fetchYears();
  }, []);

  // Check URL param ?sign=taurus on mount (optional deep link); otherwise stay empty (no sign selected)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const signParam = urlParams.get('sign')?.toLowerCase();
      if (signParam && zodiacs && zodiacs.some(z => z.id === signParam)) {
        setSelectedSignId(signParam);
        setHasSelectedSign(true);
      } else {
        setSelectedSignId(null);
        setHasSelectedSign(false);
      }
    } catch {
      setSelectedSignId(null);
      setHasSelectedSign(false);
    }
  }, [zodiacs]);

  // Fetch lightweight vitality map on mount / system change / timeframe change (ONE query returning 12 values)
  React.useEffect(() => {
    const fetchVitality = async () => {
      try {
        const periodParam = timeframe === 'today' ? 'daily' : timeframe === 'week' ? 'weekly' : timeframe === 'month' ? 'monthly' : 'yearly';
        let vUrl = `${API_ENDPOINTS.ZODIAC.HOROSCOPE_VITALITY}?system=${encodeURIComponent(zodiacSystem)}&period=${encodeURIComponent(periodParam)}`;
        if (timeframe === 'year') {
          vUrl += `&year=${selectedYear}`;
        }
        const res = await api.get<any>(vUrl);
        const data = (res && typeof res === 'object' && 'data' in res && res.data) ? res.data : res;
        if (data && data.vitality && typeof data.vitality === 'object') {
          setVitalityMap(data.vitality);
        }
      } catch {
        // Silently fall back to default per-sign vitality
      }
    };
    fetchVitality();
  }, [zodiacSystem, timeframe, selectedYear]);

  const activeSign = (zodiacs && selectedSignId) ? (zodiacs.find((s) => s.id === selectedSignId) || null) : null;

  React.useEffect(() => {
    const fetchForecast = async () => {
      if (!activeSign || !hasSelectedSign) return;
      const cacheKey = `${activeSign.id}-${timeframe}-${language}-${zodiacSystem}${timeframe === 'year' ? `-${selectedYear}` : ''}`;
      if (dynamicZodiacData[cacheKey]) return; // Already fetched

      setIsFetchingForecast(true);
      const start = Date.now();
      try {
        // 1. Fetch multi-system horoscope with all 8 categories for this sign & system
        const periodParam = timeframe === 'today' ? 'daily' : timeframe === 'week' ? 'weekly' : timeframe === 'month' ? 'monthly' : 'yearly';
        let multiSysCats: Record<string, any> = {};
        let multiSysForecast = '';
        let multiSysVitality: number | undefined = undefined;
        let isMultiSysStale = false;
        let multiSysPeriodStart = '';
        let multiSysPeriodEnd = '';
        let multiSysIngresses: any[] = [];

        try {
          let horoUrl = `${API_ENDPOINTS.ZODIAC.MULTI_SYSTEM_HOROSCOPE}?sign=${encodeURIComponent(activeSign.id)}&system=${encodeURIComponent(zodiacSystem)}&period=${encodeURIComponent(periodParam)}&category=all`;
          if (timeframe === 'year') {
            horoUrl += `&year=${selectedYear}`;
          }
          const horoRes = await api.get<any>(horoUrl);
          const horoData = (horoRes && typeof horoRes === 'object' && 'data' in horoRes && horoRes.data) ? horoRes.data : horoRes;
          const items = horoData?.items || horoData?.data?.items;
          isMultiSysStale = Boolean(horoData?.stale ?? horoData?.data?.stale);
          multiSysPeriodStart = horoData?.period_start || horoData?.data?.period_start || '';
          multiSysPeriodEnd = horoData?.period_end || horoData?.data?.period_end || '';
          multiSysIngresses = horoData?.ingresses || horoData?.data?.ingresses || [];
          if (Array.isArray(items) && items.length > 0) {
            items.forEach((it: any) => {
              if (it && it.category) {
                multiSysCats[it.category] = {
                  score: it.score,
                  text: it.text,
                  insight: it.text,
                  lucky_time: it.lucky_time,
                  remedy: it.remedy,
                  affirmation: it.affirmation,
                  tip_for_the_day: it.tip_for_the_day,
                };
                if (it.category === 'cosmic_pulse') {
                  multiSysForecast = it.text;
                  multiSysVitality = it.score;
                }
              }
            });
          }
        } catch (hErr) {
          // ignore if horoscope table item not yet populated
        }

        let mergedObj: any = null;

        // If daily, weekly, monthly, or yearly and DB items exist: use pure database items without making any live LLM request
        if ((timeframe === 'today' || timeframe === 'week' || timeframe === 'month' || timeframe === 'year') && Object.keys(multiSysCats).length > 0) {
          mergedObj = {
            sign: activeSign.name,
            timeframe,
            forecast: multiSysForecast,
            tip_for_the_day: multiSysCats['cosmic_pulse']?.tip_for_the_day,
            vitalityToday: multiSysVitality || activeSign.vitalityToday,
            isStale: isMultiSysStale,
            periodStart: multiSysPeriodStart,
            periodEnd: multiSysPeriodEnd,
            period_start: multiSysPeriodStart,
            period_end: multiSysPeriodEnd,
            ingresses: multiSysIngresses,
            affirmation: multiSysCats['cosmic_pulse']?.affirmation,
            resonantChakra: activeSign.resonantChakra,
            categoryInsights: multiSysCats,
          };
        } else {
          // Fallback only if horoscope table item is not yet populated
          const res = await api.post<any>(API_ENDPOINTS.ZODIAC.GLOBAL_FORECAST, {
            sign: activeSign.name,
            timeframe,
            language,
          });
          const forecastObj = (res && typeof res === 'object' && 'data' in res && res.data) ? res.data : res;

          mergedObj = {
            ...(typeof forecastObj === 'object' ? forecastObj : {}),
            forecast: multiSysForecast || forecastObj?.forecast || (typeof forecastObj === 'string' ? forecastObj : ''),
            tip_for_the_day: multiSysCats['cosmic_pulse']?.tip_for_the_day || forecastObj?.tip_for_the_day,
            vitalityToday: multiSysVitality || forecastObj?.vitalityToday || activeSign.vitalityToday,
            isStale: isMultiSysStale,
            periodStart: multiSysPeriodStart || forecastObj?.periodStart,
            periodEnd: multiSysPeriodEnd || forecastObj?.periodEnd,
            period_start: multiSysPeriodStart,
            period_end: multiSysPeriodEnd,
            ingresses: multiSysIngresses || forecastObj?.ingresses || [],
            categoryInsights: {
              ...(forecastObj?.categoryInsights || {}),
              ...multiSysCats,
            },
          };
        }

        setDynamicZodiacData(prev => ({ ...prev, [cacheKey]: mergedObj }));
        
        // Only track if user has explicitly interacted/selected a sign or timeframe
        if (hasSelectedSign) {
          sessionTracker.trackZodiacForecastClick({
            signName: activeSign.name,
            timeframe,
            language,
            forecast: mergedObj.forecast || 'Forecast generated',
            status: 'SUCCESS',
            executionTimeMs: Date.now() - start,
          });
        }
      } catch (error: any) {
        console.error("Failed to fetch dynamic forecast:", error);
        if (hasSelectedSign) {
          sessionTracker.trackZodiacForecastClick({
            signName: activeSign.name,
            timeframe,
            language,
            status: 'FAILURE',
            errorMessage: error?.message || 'Failed to fetch forecast',
            executionTimeMs: Date.now() - start,
          });
        }
      } finally {
        setIsFetchingForecast(false);
      }
    };

    fetchForecast();
  }, [activeSign?.id, activeSign?.name, timeframe, language, hasSelectedSign, zodiacSystem, selectedYear]);

  // Directly retrieve relevant category data from database when category is selected
  React.useEffect(() => {
    const fetchCategoryInsight = async () => {
      if (!activeSign || !hasSelectedSign || selectedCategory === 'all' || timeframe !== 'today') return;
      const cacheKey = `${activeSign.id}-${timeframe}-${language}-${zodiacSystem}${timeframe === 'year' ? `-${selectedYear}` : ''}`;
      const currentInsights = dynamicZodiacData[cacheKey]?.categoryInsights;

      if (!currentInsights || !currentInsights[selectedCategory] || typeof currentInsights[selectedCategory] !== 'object') {
        try {
          let catData: any = null;
          try {
            const hRes = await api.get<any>(
              `${API_ENDPOINTS.ZODIAC.MULTI_SYSTEM_HOROSCOPE}?sign=${encodeURIComponent(activeSign.id)}&system=${encodeURIComponent(zodiacSystem)}&period=daily&category=${encodeURIComponent(selectedCategory)}`
            );
            const hData = (hRes && typeof hRes === 'object' && 'data' in hRes && hRes.data) ? hRes.data : hRes;
            if (hData && (hData.data || hData.items)) {
              catData = hData.data || (Array.isArray(hData.items) ? hData.items[0] : null);
            }
          } catch {
            // fallback to daily-category-insight
          }

          if (!catData) {
            const res = await api.get<any>(
              `${API_ENDPOINTS.ZODIAC.DAILY_CATEGORY_INSIGHT}?sign=${encodeURIComponent(activeSign.name)}&category=${encodeURIComponent(selectedCategory)}`
            );
            catData = (res && typeof res === 'object' && 'data' in res && res.data) ? res.data : res;
          }

          if (catData) {
            setDynamicZodiacData(prev => {
              const signObj = prev[cacheKey] || {};
              const existingCats = signObj.categoryInsights || {};
              return {
                ...prev,
                [cacheKey]: {
                  ...signObj,
                  categoryInsights: {
                    ...existingCats,
                    [selectedCategory]: catData
                  }
                }
              };
            });
          }
        } catch (e) {
          console.error("Failed to fetch category insight directly from DB:", e);
        }
      }
    };

    fetchCategoryInsight();
  }, [selectedCategory, activeSign?.id, activeSign?.name, timeframe, language, zodiacSystem]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-[#C9A050]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A050] mr-3"></div>
        <span>Aligning Stars...</span>
      </div>
    );
  }
  
  if (error) {
    return <div className="text-red-500 p-4">Error loading zodiacs: {error}</div>;
  }
  
  if (!zodiacs || !zodiacs.length) return null;

  const filteredSigns = zodiacs.filter(
    (s) => selectedElement === 'All' || s.element === selectedElement
  );

  const compatResult: ZodiacCompatibilityResult = calculateZodiacCompatibility(compatSignA, compatSignB, zodiacSystem, zodiacs);

  const t = (key: string) => getTranslation(key, language);

  const activeCacheKey = activeSign ? `${activeSign.id}-${timeframe}-${language}-${zodiacSystem}${timeframe === 'year' ? `-${selectedYear}` : ''}` : '';
  const rawDynamicData = activeCacheKey ? (dynamicZodiacData[activeCacheKey] || dynamicZodiacData[`${activeSign?.id}-${timeframe}-${language}`]) : null;
  const currentDynamicData = (rawDynamicData && typeof rawDynamicData === 'object' && 'data' in rawDynamicData && rawDynamicData.data)
    ? rawDynamicData.data
    : rawDynamicData;

  const isCardLoading = isFetchingForecast && (!currentDynamicData || !currentDynamicData.categoryInsights || Object.keys(currentDynamicData.categoryInsights).length === 0);

  const getForecastText = (sign?: ZodiacSign | null) => {
    if (!sign) return '';
    if (currentDynamicData && currentDynamicData.forecast) return currentDynamicData.forecast;

    switch (timeframe) {
      case 'week':
        return sign.weeklyForecast;
      case 'month':
        return sign.monthlyForecast;
      case 'year':
        return sign.yearly2026Forecast;
      case 'today':
      default:
        return t(sign.todayForecast);
    }
  };

  const getElementBadge = (element: string) => {
    if (theme === 'light') {
      let Icon = Globe;
      if (element === 'Fire') Icon = Flame;
      if (element === 'Earth') Icon = Mountain;
      if (element === 'Air') Icon = Wind;
      if (element === 'Water') Icon = Droplets;

      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#C9A050]/10 text-[#C9A050] border border-[#C9A050]/30">
          <Icon className="w-3 h-3 text-[#C9A050]" />
          <span>{element}</span>
        </span>
      );
    }

    switch (element) {
      case 'Fire':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <Flame className="w-3 h-3 text-rose-400" />
            <span>{element}</span>
          </span>
        );
      case 'Earth':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <Mountain className="w-3 h-3 text-emerald-400" />
            <span>{element}</span>
          </span>
        );
      case 'Air':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
            <Wind className="w-3 h-3 text-sky-400" />
            <span>{element}</span>
          </span>
        );
      case 'Water':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            <Droplets className="w-3 h-3 text-indigo-400" />
            <span>{element}</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-10 animate-fade-in text-[#E5E1D8]">
      {/* Screen Middle Loader */}
      {isScreenLoading && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center z-[9999] animate-in fade-in duration-300">
          <div className="relative flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#C9A050]"></div>
            <div className="absolute text-xl font-serif text-[#C9A050] animate-pulse">✨</div>
          </div>
          <p className="mt-4 text-sm font-semibold tracking-wider text-[#C9A050] animate-pulse font-serif">
            {language === 'bn' ? 'নক্ষত্র ও কোষ্ঠী বিশ্লেষণ করা হচ্ছে...' : 'Aligning Stars & Consulting Cosmos...'}
          </p>
        </div>
      )}
      {/* Header Banner */}
      <div className="bg-[#141418] border border-[#2A2A2E] rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#C9A050]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row lg:flex-col xl:flex-row items-start md:items-center lg:items-start xl:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[#C9A050] text-[10px] sm:text-xs font-semibold uppercase tracking-widest mb-1.5">
              <Globe className="w-3.5 h-3.5 text-[#C9A050]" />
              <span>{t('zodiac.title')}</span>
            </div>
            <h1 className="astro-page-header-title">
              {t('zodiac.title')}
            </h1>
            <p className="text-xs sm:text-sm text-[#9E9A90] mt-1 max-w-3xl leading-relaxed">
              {t('zodiac.subtitle')}
            </p>
          </div>

          {/* Tropical vs Sidereal Switcher */}
          <div className="flex items-center bg-[#0D0D0F] p-1 rounded-xl border border-[#2A2A2E] text-xs self-stretch sm:self-auto justify-center">
            <button
              onClick={() => setZodiacSystem('tropical')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center space-x-1.5 ${
                zodiacSystem === 'tropical'
                  ? 'bg-[#C9A050] text-[#0D0D0F] shadow font-bold'
                  : 'text-[#9E9A90] hover:text-[#E5E1D8]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{t('zodiac.system.tropical')}</span>
            </button>
            <button
              onClick={() => setZodiacSystem('sidereal')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center space-x-1.5 ${
                zodiacSystem === 'sidereal'
                  ? 'bg-[#C9A050] text-[#0D0D0F] shadow font-bold'
                  : 'text-[#9E9A90] hover:text-[#E5E1D8]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{t('zodiac.system.sidereal')}</span>
            </button>
          </div>
        </div>

        {/* Ayanamsha Note */}
        <div className="mt-3 pt-3 border-t border-[#2A2A2E]/60 flex items-center space-x-2 text-[10px] sm:text-xs text-[#C9A050]/90">
          <Compass className="w-3 h-3 flex-shrink-0 text-[#C9A050]" />
          <span>{t('zodiac.ayanamsa_note')}</span>
        </div>
      </div>

      {/* Control Bar: Element Filter & Timeframe Selector */}
      <div className={`flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-xl shadow-sm border ${
        isDark ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-white border-[#E8E2D5]'
      }`}>
        {/* Element Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {(['All', 'Fire', 'Earth', 'Air', 'Water'] as const).map((el) => (
            <button
              key={el}
              onClick={() => setSelectedElement(el)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
                selectedElement === el
                  ? 'bg-[#C9A050] text-[#0D0D0F] shadow-sm font-bold'
                  : isDark
                    ? 'bg-[#1C1C22] text-[#9E9A90] hover:text-[#E5E1D8] border border-[#2A2A2E]'
                    : 'bg-[#FAF7F2] text-gray-700 hover:text-gray-900 border border-[#E8E2D5]'
              }`}
            >
              {el === 'Fire' && <Flame className={`w-3 h-3 ${isDark ? 'text-rose-400' : 'text-rose-600'}`} />}
              {el === 'Earth' && <Mountain className={`w-3 h-3 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />}
              {el === 'Air' && <Wind className={`w-3 h-3 ${isDark ? 'text-sky-400' : 'text-sky-600'}`} />}
              {el === 'Water' && <Droplets className={`w-3 h-3 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />}
              <span>{el === 'All' ? t('zodiac.filter.all') : el}</span>
            </button>
          ))}
        </div>

        {/* Timeframe Selector & Year Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Today's Daily Date Badge (to the left of Today's Forecast, identical height & style to Timeframe box) */}
          <div className={`flex items-center p-1 rounded-lg border text-xs shadow-xs ${
            isDark ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#FAF7F2] border-[#E8E2D5]'
          }`}>
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5 text-[#C9A050] shrink-0" />
              <span className={isDark ? 'text-[#C9A050]' : 'text-[#8D6723]'}>{getTodayFormatted()}</span>
            </div>
          </div>

          <div className={`flex items-center p-1 rounded-lg border text-xs ${
            isDark ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#FAF7F2] border-[#E8E2D5]'
          }`}>
            {(['today', 'week', 'month', 'year'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                  timeframe === tf
                    ? isDark
                      ? 'bg-[#2A2A2E] text-[#F0ECE1] font-bold shadow-xs'
                      : 'bg-white text-gray-900 font-bold shadow-xs'
                    : isDark
                      ? 'text-[#9E9A90] hover:text-[#E5E1D8]'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tf === 'year' ? (t('zodiac.timeframe.year') || 'Yearly Outlook') : t(`zodiac.timeframe.${tf}`)}
              </button>
            ))}
          </div>

          {/* Year Toggle Pills (when Yearly Outlook is active) */}
          {timeframe === 'year' && (
            <div className={`flex items-center p-1 rounded-lg border text-xs animate-in fade-in duration-150 ${
              isDark ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#FAF7F2] border-[#E8E2D5]'
            }`}>
              {availableYears.map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setSelectedYear(yr)}
                  className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer text-xs ${
                    selectedYear === yr
                      ? 'bg-[#C9A050] text-[#0D0D0F] font-bold shadow-xs'
                      : isDark
                        ? 'text-[#9E9A90] hover:text-[#E5E1D8]'
                        : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Zodiac Cards Grid - Uniform & Consistent Design for All 12 Signs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {filteredSigns.map((sign) => {
          const isSelected = Boolean(selectedSignId && sign.id === selectedSignId);
          return (
            <button
              key={sign.id}
              onClick={() => {
                setSelectedSignId(sign.id);
                setHasSelectedSign(true);
                setSelectedCategory('all'); // Always reset to Cosmic Pulse (Overall) for 100% consistent UI across all signs!
                setIsPulseExpanded(false);
                setIsCategoryExpanded(false);

                // If cached, track click immediately
                const cacheKey = `${sign.id}-${timeframe}-${language}-${zodiacSystem}`;
                const cached = dynamicZodiacData[cacheKey];
                if (cached) {
                  sessionTracker.trackZodiacForecastClick({
                    signName: sign.name,
                    timeframe,
                    language,
                    forecast: cached?.forecast || (typeof cached === 'string' ? cached : 'Forecast retrieved'),
                    status: 'SUCCESS',
                  });
                }

                setTimeout(() => {
                  if (deepDiveRef.current) {
                    const elementPosition = deepDiveRef.current.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - 90;
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth'
                    });
                  }
                }, 100);
              }}
              className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] hover:-translate-y-0.5 ${
                isSelected
                  ? isDark
                    ? 'bg-[#1C1C22] border-transparent shadow-lg shadow-[#C9A050]/20 ring-2 ring-[#C9A050]'
                    : 'bg-white border-transparent shadow-md ring-2 ring-[#C9A050]'
                  : isDark
                    ? 'bg-[#141418] border-[#2A2A2E] hover:border-[#C9A050]/50 hover:bg-[#1A1A20]'
                    : 'bg-white border-[#E8E2D5] hover:border-[#C9A050]/60 hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span 
                    className="text-2xl font-serif text-[#C9A050] group-hover:scale-105 transition duration-200"
                  >
                    {sign.symbol}&#xFE0E;
                  </span>
                  {getElementBadge(sign.element)}
                </div>

                <h3 className={`font-bold text-sm flex items-baseline space-x-1.5 ${
                  isDark ? 'text-[#F0ECE1]' : 'text-gray-900'
                }`}>
                  <span>{sign.name}</span>
                  <span className={`text-[11px] font-normal ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
                    ({sign.sanskritScript})
                  </span>
                </h3>

                <div className={`text-[11px] mt-0.5 ${
                  isDark ? 'text-[#C9A050]/90' : 'text-[#8D6723]'
                }`}>
                  {zodiacSystem === 'tropical' ? sign.tropicalDates : sign.siderealDates}
                </div>
              </div>

              <div className={`mt-3 pt-3 border-t flex items-center justify-between text-[10px] ${
                isDark ? 'border-[#2A2A2E]/60 text-[#9E9A90]' : 'border-gray-100 text-gray-500'
              }`}>
                <span>{sign.glyph}</span>
                <span className={`font-semibold ${
                  isDark ? 'text-emerald-400' : 'text-[#8D6723]'
                }`}>
                  {vitalityMap[sign.id] ?? (zodiacSystem === 'sidereal' ? Math.max(0, sign.vitalityToday - 3) : sign.vitalityToday)}% Vitality
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Sign Detailed Deep-Dive Container */}
      {hasSelectedSign && activeSign && (
        <div ref={deepDiveRef} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
          <div className={`rounded-2xl p-4 sm:p-5 shadow-xl space-y-3.5 sm:space-y-4 border ${
            isDark 
              ? 'bg-[#141418] border-[#2A2A2E]' 
              : 'bg-white border-[#E5E1D8] shadow-amber-900/5'
          }`}>
        {/* Top Highlight Info */}
        <div className={`flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-3 border-b ${
          isDark ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-[#C9A050]/15 border border-[#C9A050]/30 flex items-center justify-center text-[#C9A050] font-serif text-2xl font-bold shadow-sm astro-emoji-text">
              {activeSign.symbol}&#xFE0E;
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                  {activeSign.name} • {activeSign.sanskritName} ({activeSign.sanskritScript})
                </h2>
                {getElementBadge(activeSign.element)}
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                  isDark ? 'bg-[#2A2A2E] text-[#E5E1D8]' : 'bg-gray-100 text-gray-700'
                }`}>
                  {activeSign.modality} Modality
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-[#C9A050]/15 text-[#C9A050] font-medium border border-[#C9A050]/30">
                  {activeSign.polarity}
                </span>
              </div>
              <p className={`text-xs font-medium ${isDark ? 'text-[#9E9A90]' : 'text-gray-600'}`}>
                {activeSign.glyph} • {activeSign.motto} • Ruled by{' '}
                <span className="text-[#C9A050] font-semibold">{activeSign.ruler} ({activeSign.sanskritRuler})</span>
              </p>
              <div className="text-[11px] text-[#C9A050] mt-0.5">
                Dates: <span className="font-semibold">{zodiacSystem === 'tropical' ? `${activeSign.tropicalDates} (Western Tropical)` : `${activeSign.siderealDates} (Vedic Sidereal)`}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Dimension Energy Meter */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {[
            {
              key: 'love',
              label: t('zodiac.love_rating'),
              value: Math.min(100, Math.max(0, (currentDynamicData?.loveRating || activeSign.loveRating) + (zodiacSystem === 'sidereal' ? 2 : 0))),
              Icon: Heart,
            },
            {
              key: 'career',
              label: t('zodiac.career_rating'),
              value: Math.min(100, Math.max(0, (currentDynamicData?.careerRating || activeSign.careerRating) + (zodiacSystem === 'sidereal' ? -1 : 0))),
              Icon: Briefcase,
            },
            {
              key: 'wealth',
              label: t('zodiac.wealth_rating'),
              value: Math.min(100, Math.max(0, (currentDynamicData?.wealthRating || activeSign.wealthRating) + (zodiacSystem === 'sidereal' ? 3 : 0))),
              Icon: Coins,
            },
            {
              key: 'vitality',
              label: t('zodiac.vitality_meter'),
              value: Math.min(100, Math.max(0, (currentDynamicData?.vitalityToday || activeSign.vitalityToday) + (zodiacSystem === 'sidereal' ? -3 : 0))),
              Icon: Zap,
            }
          ]
            .sort((a, b) => b.value - a.value)
            .map((metric) => (
              <div 
                key={metric.key} 
                className={`p-2.5 sm:p-3 rounded-lg border transition-all ${
                  isDark 
                    ? 'bg-[#0D0D0F] border-[#2A2A2E]' 
                    : 'bg-[#FAF7F2] border-[#E8E1D5] shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className={`flex items-center space-x-1.5 font-medium ${isDark ? 'text-[#C5C0B6]' : 'text-gray-700'}`}>
                    <metric.Icon className={`w-3.5 h-3.5 ${isDark ? 'text-[#C9A050]' : 'text-[#8D6723]'}`} />
                    <span>{metric.label}</span>
                  </span>
                  <span className={`font-bold font-mono text-xs ${isDark ? 'text-[#C9A050]' : 'text-[#8D6723]'}`}>
                    {metric.value}%
                  </span>
                </div>
                
                {/* Full Progress Bar Container with Clear Visible Track & Fill */}
                <div 
                  className={`w-full h-1.5 rounded-full overflow-hidden ${
                    isDark 
                      ? 'bg-[#222228] border border-[#33333E]' 
                      : 'bg-[#E5DFD3] border border-[#D5CDC0]'
                  }`}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isDark ? 'bg-[#C9A050]' : 'bg-[#8D6723]'
                    }`}
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              </div>
            ))}
        </div>

        {/* Selected Timeframe Forecast Content */}
        {isCardLoading ? (
          <div className={`p-8 sm:p-12 rounded-xl border flex flex-col items-center justify-center min-h-[300px] space-y-4 text-center transition-all duration-300 animate-in fade-in ${
            isDark 
              ? 'bg-[#0D0D0F] border-[#2A2A2E]' 
              : 'bg-[#FAF7F2] border-[#E8E1D5] shadow-xs'
          }`}>
            <div className="relative flex items-center justify-center">
              <div className="absolute w-14 h-14 rounded-full border border-[#C9A050]/20 animate-ping" />
              <div className="w-12 h-12 rounded-full bg-[#C9A050]/15 flex items-center justify-center border border-[#C9A050]/40 text-[#C9A050]">
                <RefreshCw className="w-6 h-6 animate-spin text-[#C9A050]" />
              </div>
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h4 className={`text-sm sm:text-base font-bold font-serif tracking-wider ${isDark ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                CONSULTING DAIVAJNA
              </h4>
              <p className="text-xs text-[#C9A050] animate-pulse">
                Aligning celestial transits & calculating personalized insights for {activeSign.name}...
              </p>
            </div>
            {/* Shimmering placeholder bars */}
            <div className="w-full max-w-md space-y-2 pt-2 opacity-40">
              <div className={`h-2.5 rounded-full animate-pulse ${isDark ? 'bg-white/10' : 'bg-black/10'}`} style={{ width: '85%', margin: '0 auto' }} />
              <div className={`h-2.5 rounded-full animate-pulse ${isDark ? 'bg-white/10' : 'bg-black/10'}`} style={{ width: '95%', margin: '0 auto' }} />
              <div className={`h-2.5 rounded-full animate-pulse ${isDark ? 'bg-white/10' : 'bg-black/10'}`} style={{ width: '70%', margin: '0 auto' }} />
            </div>
          </div>
        ) : (
          <div className={`p-3.5 sm:p-4 rounded-xl border space-y-2.5 transition-all duration-300 animate-in fade-in ${
            isDark 
              ? 'bg-[#0D0D0F] border-[#2A2A2E]' 
              : 'bg-[#FAF7F2] border-[#E8E1D5] shadow-xs'
          }`}>
            <div className={`flex items-center justify-between border-b pb-2 ${
              isDark ? 'border-[#2A2A2E]/60' : 'border-[#E8E1D5]'
            }`}>
              <h3 className="text-sm font-bold text-[#C9A050] flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {activeSign.name} Horizon: {timeframe === 'today' ? "Today's Cosmic Pulse" : timeframe === 'week' ? 'Weekly Outlook' : timeframe === 'month' ? 'Monthly Transits' : 'Yearly Outlook'}
                </span>
              </h3>
            </div>

            {/* Category Pill Tabs & Percentage Badge Row - Fully Responsive on Mobile & Desktop */}
            {(timeframe === 'today' || timeframe === 'week' || timeframe === 'month' || timeframe === 'year') && (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 pt-1 pb-2.5">
                <div className="w-full md:w-auto flex flex-wrap items-center gap-1.5 sm:gap-2 py-1 px-0.5">
                  {ZODIAC_CATEGORIES.map((cat) => {
                    const isCatActive = selectedCategory === cat.id;
                    const CatIcon = cat.icon;
                    const details = cat.id !== 'all' ? getSignCategoryInsightDetails(
                      activeSign.id,
                      cat.id,
                      language,
                      currentDynamicData?.categoryInsights
                    ) : null;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`group px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                          isCatActive
                            ? 'bg-[#C9A050] text-[#0D0D0F] font-bold shadow-xs'
                            : isDark
                              ? 'bg-[#1C1C22] text-[#A09B90] hover:text-[#F0ECE1] border border-[#2A2A2E]'
                              : 'bg-white text-gray-700 hover:text-gray-900 border border-[#E5E0D5] shadow-xs'
                        }`}
                      >
                        <CatIcon className={`w-3.5 h-3.5 shrink-0 ${isCatActive ? 'text-[#0D0D0F]' : isDark ? 'text-[#C9A050]' : 'text-[#8D6723]'}`} />
                        <span>{cat.name}</span>
                        {details && details.tier && (
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isCatActive ? 'bg-[#0D0D0F]' : (details.tier.dotClass || 'bg-emerald-500')}`} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Score & Tier Badge on the far right */}
                <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-2 shrink-0 md:ml-auto pt-1 md:pt-0">
                  {selectedCategory === 'all' ? (
                    (() => {
                      const safeVit = typeof currentDynamicData?.vitalityToday === 'number'
                        ? currentDynamicData.vitalityToday
                        : typeof currentDynamicData?.vitalityToday === 'string' && !isNaN(Number(currentDynamicData.vitalityToday))
                        ? Number(currentDynamicData.vitalityToday)
                        : (activeSign.vitalityToday || 85);
                      const tier = getPredictionTier(safeVit);
                      return (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex items-center space-x-1.5 shadow-xs whitespace-nowrap ${tier.badgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${tier.dotClass}`} />
                          <span>{safeVit}% • {timeframe === 'year' ? 'Yearly Vitality' : timeframe === 'month' ? 'Monthly Vitality' : timeframe === 'week' ? 'Weekly Vitality' : 'Cosmic Vitality'}</span>
                        </span>
                      );
                    })()
                  ) : (
                    (() => {
                      const details = getSignCategoryInsightDetails(
                        activeSign.id,
                        selectedCategory,
                        language,
                        currentDynamicData?.categoryInsights
                      );
                      return (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex items-center space-x-1.5 shadow-xs whitespace-nowrap ${details?.tier?.badgeClass || ''}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${details?.tier?.dotClass || 'bg-emerald-500'}`} />
                          <span>{details?.score ?? 80}% • {details?.tier?.label || 'Favourable'}</span>
                        </span>
                      );
                    })()
                  )}
                </div>
              </div>
            )}

            {/* Content Body: Each category tab shows ONE paragraph of text */}
            {timeframe !== 'today' && timeframe !== 'week' && timeframe !== 'month' && timeframe !== 'year' ? (
              <div className={`text-sm leading-relaxed ${isDark ? 'text-[#E5E1D8]' : 'text-gray-800'}`}>
                <p className="whitespace-normal leading-relaxed">{stripMarkdownDefensively(getForecastText(activeSign))}</p>
              </div>
            ) : selectedCategory === 'all' ? (
              /* Cosmic Pulse Tab */
              <div className="space-y-2 animate-in fade-in duration-200 pt-1.5">
                <div className={`text-sm leading-relaxed ${isDark ? 'text-[#E5E1D8]' : 'text-gray-800'}`}>
                  <div className="space-y-2.5 text-sm leading-relaxed">
                    {stripMarkdownDefensively(
                      currentDynamicData?.categoryInsights?.['cosmic_pulse']?.text ||
                      currentDynamicData?.categoryInsights?.['cosmic_pulse']?.insight ||
                      getForecastText(activeSign)
                    ).split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).map((para, idx) => (
                      <p key={idx} className="whitespace-normal leading-relaxed">{para}</p>
                    ))}
                  </div>
                  {(() => {
                    const tip = currentDynamicData?.categoryInsights?.['cosmic_pulse']?.tip_for_the_day || currentDynamicData?.tip_for_the_day;
                    if (!tip || (typeof tip !== 'string' && typeof tip !== 'number')) return null;
                    const tipLabel = timeframe === 'year' ? 'Tip for the Year:' : timeframe === 'month' ? 'Tip for the Month:' : timeframe === 'week' ? 'Tip for the Week:' : 'Tip for the Day:';
                    return (
                      <div className="pt-2">
                        <strong className="block font-bold mb-0.5">{tipLabel}</strong>
                        <p className="whitespace-normal leading-relaxed">{stripMarkdownDefensively(tip)}</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              /* Category Tab: ONE plain-text paragraph */
              (() => {
                const details = getSignCategoryInsightDetails(
                  activeSign.id,
                  selectedCategory,
                  language,
                  currentDynamicData?.categoryInsights
                );

                return (
                  <div className="space-y-2 animate-in fade-in duration-200 pt-1.5">
                    <div className={`text-sm leading-relaxed space-y-2.5 ${isDark ? 'text-[#E5E1D8]' : 'text-gray-800'}`}>
                      {stripMarkdownDefensively(details?.insight).split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).map((para, idx) => (
                        <p key={idx} className="whitespace-normal leading-relaxed">{para}</p>
                      ))}
                    </div>
                  </div>
                );
              })()
            )}

            {/* Existing Footer (Celestial Affirmation + Resonant Chakra) and disclaimer line */}
            <div className={`pt-2 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
              isDark ? 'border-[#2A2A2E]/40 text-[#9E9A90]' : 'border-[#E8E1D5] text-gray-600'
            }`}>
              <div className="flex items-center space-x-2">
                <span className="text-[#C9A050] font-semibold">Celestial Affirmation:</span>
                <span className={`italic ${isDark ? 'text-[#E5E1D8]' : 'text-gray-800'}`}>
                  &ldquo;{typeof currentDynamicData?.affirmation === 'string' && currentDynamicData.affirmation
                    ? currentDynamicData.affirmation
                    : (currentDynamicData?.affirmation?.text || t(activeSign.affirmation))}&rdquo;
                </span>
              </div>
              <div>
                <span className="text-[#C9A050] font-semibold">Resonant Chakra:</span>{' '}
                {typeof currentDynamicData?.resonantChakra === 'string' && currentDynamicData.resonantChakra
                  ? currentDynamicData.resonantChakra
                  : (currentDynamicData?.resonantChakra?.name || activeSign.resonantChakra)}
              </div>
            </div>
          </div>
        )}

        {/* Daily Update Inline Subscription Banner */}
        <DailyUpdateInlineCard
          activeSignName={activeSign.name}
          activeSignSymbol={activeSign.symbol}
          theme={theme}
        />
      </div>
      </div>
      )}

      {/* Daily Update Subscription Modal */}
      <DailyUpdateModal
        isOpen={isDailyUpdateModalOpen}
        onClose={() => setIsDailyUpdateModalOpen(false)}
        activeSignName={activeSign?.name || ''}
        activeSignSymbol={activeSign?.symbol || ''}
        theme={theme}
      />
    </div>
  );
};
