import React, { useState, useEffect, useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { formatDate, formatNumber, formatPanchangTime, tVedic } from '../i18n';
import {
  Sun,
  Moon,
  Clock,
  Calendar,
  AlertTriangle,
  Flame,
  Volume2,
  CheckCircle2,
  Share2,
  Shield,
  Compass,
  Zap,
  Download,
  FileText,
  Loader2,
  Bot,
  Lock,
  X,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Crown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, getToken } from '../services/api';
import { API_ENDPOINTS } from '../config/api_config';
import { UserProfile, PanchangInfo, NumerologyReport } from '../types';

const getPlanetForNumber = (num: number): string => {
  const reduced = num > 9 ? num % 9 || 9 : num;
  const planets = ['Sun', 'Moon', 'Jupiter', 'Rahu', 'Mercury', 'Venus', 'Ketu', 'Saturn', 'Mars'];
  return planets[reduced - 1] || 'Unknown';
};

interface DailyHoroscopeViewProps {
  profile: UserProfile;
  panchang: PanchangInfo;
  numerology: NumerologyReport;
  chartData: any;
  onNavigateToTab: (tab: string, tierId?: string) => void;
  theme: 'light' | 'dark';
}

interface DailyAiInsights {
  summary: string;
  career: string;
  love: string;
  health: string;
  lucky_color_desc?: string;
  showingEnglishNote?: boolean;
}

export const DailyHoroscopeView: React.FC<DailyHoroscopeViewProps> = ({
  profile,
  panchang,
  numerology,
  chartData,
  onNavigateToTab,
  theme,
}) => {
  const { t, i18n } = useTranslation();
  const [aiInsights, setAiInsights] = useState<DailyAiInsights | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Helper to load image as base64 DataURL for jsPDF canvas rendering
  const loadImageBase64 = (url: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width || 400;
          canvas.height = img.naturalHeight || img.height || 400;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
            return;
          }
        } catch {
          // Ignore canvas security errors
        }
        resolve(null);
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  };

  // Derive unique local storage key per profile, date, and language to support multilingual caching
  const getDailyStorageKey = (lang?: string) => {
    const profileId = profile?.id || profile?.fullName || 'guest';
    const dateStr = panchang?.date || new Date().toISOString().split('T')[0];
    const l = lang || i18n.language || 'en';
    return `jyotish_daily_reading_${profileId}_${dateStr}_${l}`;
  };

  const [isHistoryUnlocked, setIsHistoryUnlocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('jyotish_user_premium') === 'true' ||
        localStorage.getItem('jyotish_daily_vedic_subscription_active') === 'true'
      );
    }
    return false;
  });

  const isPremiumUser = Boolean(
    profile?.isPremium ||
    isHistoryUnlocked ||
    (typeof window !== 'undefined' && (
      localStorage.getItem('jyotish_user_premium') === 'true' ||
      localStorage.getItem('jyotish_daily_vedic_subscription_active') === 'true'
    ))
  );

  const isFetchingAiRef = useRef(false);
  const activeFetchingLangRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const isInsightCacheValidForLang = (data: any, lang: string): boolean => {
    if (!data || (!data.summary && !data.career)) return false;
    const text = String(data.summary || '') + ' ' + String(data.career || '');
    if (lang === 'fr' || lang === 'en') {
      if (/[\u0900-\u0DFF]/.test(text)) return false;
    } else if (lang === 'hi') {
      if (!/[\u0900-\u097F]/.test(text)) return false;
    } else if (lang === 'bn') {
      if (!/[\u0980-\u09FF]/.test(text)) return false;
    } else if (lang === 'ta') {
      if (!/[\u0B80-\u0BFF]/.test(text)) return false;
    }
    return true;
  };

  // Check localStorage on mount or when profile/panchang date or language changes, and auto-fetch reading
  useEffect(() => {
    let isCancelled = false;
    const currentLang = i18n.language || 'en';
    const storageKey = getDailyStorageKey(currentLang);
    let foundCache = false;

    // Check cached reading in localStorage for the current active language
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (isInsightCacheValidForLang(parsed, currentLang)) {
          if (!isCancelled) setAiInsights(parsed);
          foundCache = true;
        } else {
          localStorage.removeItem(storageKey);
        }
      }
    } catch {}

    if (!foundCache && !isCancelled) {
      setAiInsights(null);
    }

    const syncStatusAndFetch = async () => {
      let isUnlocked = isPremiumUser;
      if (!isUnlocked) {
        try {
          const token = getToken();
          if (token) {
            const res = await api.get<any>(API_ENDPOINTS.PAYMENT.HISTORY);
            const list = Array.isArray(res) ? res : (res?.data && Array.isArray(res.data) ? res.data : []);
            if (list.some((tx: any) => tx.status === 'success' && (tx.item_id === 'daily_vedic_subscription' || Number(tx.amount) === 99))) {
              isUnlocked = true;
              setIsHistoryUnlocked(true);
              localStorage.setItem('jyotish_user_premium', 'true');
              localStorage.setItem('jyotish_daily_vedic_subscription_active', 'true');
            }
          }
        } catch (err) {
          console.warn('Could not sync history in DailyHoroscopeView:', err);
        }
      }

      // Automatically generate/fetch daily reading only when real panchang is ready
      if (!isCancelled && panchang?.isRealPanchang && !foundCache) {
        fetchDailyAiReading(currentLang);
      }
    };

    syncStatusAndFetch();

    return () => {
      isCancelled = true;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [profile?.id, profile?.fullName, profile?.isPremium, isPremiumUser, isHistoryUnlocked, panchang?.date, panchang?.isRealPanchang, i18n.language]);

  const fetchDailyAiReading = async (reqLang?: string) => {
    const targetLang = reqLang || i18n.language || 'en';
    if (!panchang?.isRealPanchang) return;

    // If currently fetching for this exact language, do not re-fetch
    if (isFetchingAiRef.current && activeFetchingLangRef.current === targetLang) return;

    // Abort any ongoing fetch for another language
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    isFetchingAiRef.current = true;
    activeFetchingLangRef.current = targetLang;
    const storageKey = getDailyStorageKey(targetLang);

    // Check if already in localStorage
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (isInsightCacheValidForLang(parsed, targetLang)) {
          if ((i18n.language || 'en').startsWith(targetLang)) {
            setAiInsights(parsed);
          }
          isFetchingAiRef.current = false;
          activeFetchingLangRef.current = null;
          return;
        } else {
          localStorage.removeItem(storageKey);
        }
      }
    } catch {}

    console.log(`[DailyHoroscope] Requesting daily reading from backend for lang: [${targetLang}]...`);
    setIsLoadingAi(true);
    try {
      const data = await api.post<{
        insights: DailyAiInsights;
        auspiciousScore?: number;
        bandCode?: 'high' | 'balanced' | 'mixed' | 'low';
        sunriseAscendant?: string;
        lang?: string;
      }>(API_ENDPOINTS.INSIGHTS.DAILY_HOROSCOPE, {
        profile,
        chartData,
        panchang,
        numerology,
        lang: targetLang,
      }, { signal: controller.signal });

      if (data && data.insights) {
        if (!isInsightCacheValidForLang(data.insights, targetLang)) {
          console.warn(`[DailyHoroscope] Rejecting returned reading in mismatched script for ${targetLang}`);
        } else {
          try {
            localStorage.setItem(storageKey, JSON.stringify(data.insights));
          } catch (storageErr) {
            console.warn('Could not persist daily reading to localStorage:', storageErr);
          }
          // ONLY apply if the request was not aborted and current UI language still matches targetLang
          if (!controller.signal.aborted && (i18n.language || 'en').startsWith(targetLang)) {
            console.log('[DailyHoroscope] Daily reading applied successfully for lang:', targetLang);
            setAiInsights(data.insights);
            if (data.auspiciousScore !== undefined && panchang.auspiciousScore !== data.auspiciousScore) {
              panchang.auspiciousScore = data.auspiciousScore;
            }
            if (data.bandCode) {
              panchang.bandCode = data.bandCode;
            }
          }
        }
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        console.error('Failed to fetch daily insights:', e);
      }
    } finally {
      if (activeFetchingLangRef.current === targetLang) {
        isFetchingAiRef.current = false;
        activeFetchingLangRef.current = null;
        setIsLoadingAi(false);
      }
    }
  };

  const handleSpeech = () => {
    if (!('speechSynthesis' in window)) return;
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }
    if (!aiInsights) return;

    const langCodeMap: Record<string, string> = {
      hi: 'hi-IN',
      bn: 'bn-IN',
      ta: 'ta-IN',
      fr: 'fr-FR',
      en: 'en-IN',
    };
    const currentLang = (i18n.language || 'en').split('-')[0].toLowerCase();
    const targetLangCode = langCodeMap[currentLang] || 'en-IN';

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0 && currentLang !== 'en') {
      const hasVoice = voices.some((v) => v.lang.toLowerCase().startsWith(currentLang));
      if (!hasVoice) {
        setSpeechNotice(t('dailyInsights.actions.speechNotAvailable', 'Listening is not available in this language'));
        setTimeout(() => setSpeechNotice(null), 3500);
        return;
      }
    }

    const text = t('dailyInsights.actions.speechTemplate', {
      summary: aiInsights.summary,
      careerPrefix: t('dailyInsights.actions.careerPrefix', 'For your career:'),
      career: aiInsights.career,
      lovePrefix: t('dailyInsights.actions.lovePrefix', 'In love and harmony:'),
      love: aiInsights.love,
      healthPrefix: t('dailyInsights.actions.healthPrefix', 'For your health:'),
      health: aiInsights.health,
      defaultValue: `${aiInsights.summary}. For your career: ${aiInsights.career}. In love and harmony: ${aiInsights.love}. For your health: ${aiInsights.health}.`,
    });

    const clean = text.replace(/[#*`_>-]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = targetLangCode;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);
    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleShare = () => {
    const formattedAbhijit = formatPanchangTime(panchang.abhijitMuhurta.split('(')[0].trim(), i18n.language);
    const text = t('dailyInsights.actions.shareTemplate', {
      title: t('dailyInsights.actions.shareTitle', { name: profile.fullName }),
      tithiLabel: t('dailyInsights.panchang.tithi', 'Tithi'),
      tithi: formatTithi(panchang.tithi),
      nakshatraLabel: t('dailyInsights.panchang.nakshatra', 'Nakshatra'),
      nakshatra: formatNakshatra(panchang.nakshatra),
      abhijitLabel: t('dailyInsights.metrics.abhijitMuhurta', 'Shubh Abhijit Muhurta'),
      abhijit: formattedAbhijit,
      defaultValue: `Daily Vedic Insight for ${profile.fullName} | AstroJunction:\nTithi: ${formatTithi(panchang.tithi)} | Nakshatra: ${formatNakshatra(panchang.nakshatra)}\nAbhijit Muhurta: ${formattedAbhijit}`
    });
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const getLuckyColorDesc = (color: string) => {
    if (!color) return t('dailyInsights.metrics.colorHarmony', 'Amplifies cosmic harmony');
    const c = color.toLowerCase();
    if (c.includes('red') || c.includes('coral') || c.includes('scarlet')) return t('dailyInsights.metrics.colorVital', 'Amplifies vital energy & action');
    if (c.includes('blue') || c.includes('navy')) return t('dailyInsights.metrics.colorCalm', 'Enhances calm focus & depth');
    if (c.includes('green') || c.includes('emerald') || c.includes('pistachio')) return t('dailyInsights.metrics.colorGrowth', 'Attracts growth & prosperity');
    if (c.includes('yellow') || c.includes('gold') || c.includes('amber')) return t('dailyInsights.metrics.colorWisdom', 'Boosts wisdom & optimism');
    if (c.includes('white') || c.includes('pearl') || c.includes('silver')) return t('dailyInsights.metrics.colorPeace', 'Invokes peace & intuition');
    if (c.includes('grey') || c.includes('brown')) return t('dailyInsights.metrics.colorGround', 'Grounds spiritual energy');
    if (c.includes('black') || c.includes('violet')) return t('dailyInsights.metrics.colorProtect', 'Promotes discipline & protection');
    if (c.includes('pink') || c.includes('lilac')) return t('dailyInsights.metrics.colorCharm', 'Nurtures compassion & charm');
    return t('dailyInsights.metrics.colorHarmony', 'Amplifies cosmic harmony');
  };

  const getDailyRituals = () => {
    if (panchang.rituals) {
      return panchang.rituals;
    }
    return {
      morningTitle: t('dailyInsights.sadhana.morningTitle', 'Morning Vedic Ritual'),
      morningDesc: t('dailyInsights.sadhana.morningDesc', 'Start your day with meditation and Surya Arghya.'),
      eveningTitle: t('dailyInsights.sadhana.eveningTitle', 'Evening Vedic Ritual'),
      eveningDesc: t('dailyInsights.sadhana.eveningDesc', 'Light a diya and practice gratitude.')
    };
  };

  const getCosmicHarmony = (score: number, band?: string) => {
    const effectiveBand = band || (score >= 80 ? 'high' : score >= 60 ? 'balanced' : score >= 40 ? 'mixed' : 'low');
    const colorMap: Record<string, string> = {
      high: 'text-[#C9A050]',
      balanced: 'text-[#C9A050]',
      mixed: 'text-orange-400',
      low: 'text-rose-400',
    };
    const iconMap: Record<string, any> = {
      high: CheckCircle2,
      balanced: Sparkles,
      mixed: Compass,
      low: AlertTriangle,
    };
    return {
      band: effectiveBand,
      title: t(`dailyInsights.harmony.${effectiveBand}.title`, effectiveBand === 'high' ? 'High Pranic Vitality' : effectiveBand === 'balanced' ? 'Balanced Energy' : effectiveBand === 'mixed' ? 'Mixed Harmonics' : 'Low Vitality'),
      desc: t(`dailyInsights.harmony.${effectiveBand}.desc`, effectiveBand === 'high' ? 'Optimal for key initiatives' : effectiveBand === 'balanced' ? 'Favorable for routine tasks' : effectiveBand === 'mixed' ? 'Proceed with awareness' : 'Avoid major new beginnings'),
      color: colorMap[effectiveBand] || 'text-[#C9A050]',
      icon: iconMap[effectiveBand] || Sparkles,
    };
  };

  const getGreetingKey = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) return 'dailyInsights.greetings.morning';
    if (hour >= 12 && hour < 17) return 'dailyInsights.greetings.afternoon';
    if (hour >= 17 && hour < 20) return 'dailyInsights.greetings.evening';
    return 'dailyInsights.greetings.night';
  };

  const formatTithi = (raw: string) => {
    if (!raw) return '';
    const clean = raw.split('(')[0].trim().toLowerCase().replace(/[\s-]+/g, '_');
    const direct = tVedic('tithis', clean, '');
    if (direct) return direct;
    const parts = raw.split('(')[0].trim().split(/\s+/);
    if (parts.length >= 2) {
      const candidate = `${parts[0].toLowerCase()}_${parts.slice(1).join('_').toLowerCase()}`;
      const tCandidate = tVedic('tithis', candidate, '');
      if (tCandidate) return tCandidate;
    }
    return raw;
  };

  const formatNakshatra = (raw: string) => {
    if (!raw) return '';
    const lordMatch = raw.match(/\(Lord:\s*([^)]+)\)/i);
    const nakBase = raw.replace(/\s*\(Lord:[^)]*\)/i, '').split('(')[0].trim();
    const translatedNak = tVedic('nakshatras', nakBase, nakBase);
    if (lordMatch && lordMatch[1]) {
      const lordClean = lordMatch[1].trim();
      const translatedLord = tVedic('planets', lordClean, lordClean);
      return t('dailyInsights.panchang.nakshatraWithLord', {
        nakshatra: translatedNak,
        lordLabel: t('dailyInsights.panchang.lordLabel', 'Lord:'),
        lord: translatedLord,
        defaultValue: `${translatedNak} (${t('dailyInsights.panchang.lordLabel', 'Lord:')} ${translatedLord})`
      });
    }
    return translatedNak;
  };

  const formatYoga = (raw: string) => {
    if (!raw) return '';
    const clean = raw.split('(')[0].trim();
    return tVedic('yogas', clean, clean);
  };

  const formatKarana = (raw: string) => {
    if (!raw) return '';
    const clean = raw.split('(')[0].trim();
    return tVedic('karanas', clean, clean);
  };

  const SIGN_NAME_TO_KEY: Record<string, string> = {
    aries: 'aries', taurus: 'taurus', gemini: 'gemini', cancer: 'cancer',
    leo: 'leo', virgo: 'virgo', libra: 'libra', scorpio: 'scorpio',
    sagittarius: 'sagittarius', capricorn: 'capricorn', aquarius: 'aquarius', pisces: 'pisces',
    mesha: 'aries', vrishabha: 'taurus', mithuna: 'gemini', karka: 'cancer',
    simha: 'leo', kanya: 'virgo', tula: 'libra', vrishchika: 'scorpio', vrischika: 'scorpio',
    dhanu: 'sagittarius', makara: 'capricorn', makar: 'capricorn', kumbha: 'aquarius', meena: 'pisces',
    'मेष': 'aries', 'वृषभ': 'taurus', 'मिथुन': 'gemini', 'कर्क': 'cancer',
    'सिंह': 'leo', 'कन्या': 'virgo', 'तुला': 'libra', 'वृश्चिक': 'scorpio', 'वृश्चিক': 'scorpio',
    'धनु': 'sagittarius', 'मकर': 'capricorn', 'कुंभ': 'aquarius', 'मीन': 'pisces',
    'মেষ': 'aries', 'বৃষ': 'taurus', 'মিথুন': 'gemini', 'কর্কট': 'cancer',
    'সিংহ': 'leo', 'কন্যা': 'virgo', 'তুলা': 'libra', 'বৃশ্চিক': 'scorpio',
    'ধনু': 'sagittarius', 'মকর': 'capricorn', 'কুম্ভ': 'aquarius', 'মীন': 'pisces',
    'மேஷம்': 'aries', 'ரிஷபம்': 'taurus', 'மிதுனம்': 'gemini', 'கடகம்': 'cancer',
    'சிம்மம்': 'leo', 'கன்னி': 'virgo', 'துலாம்': 'libra', 'விருச்சிகம்': 'scorpio',
    'தனுசு': 'sagittarius', 'மகரம்': 'capricorn', 'கும்பம்': 'aquarius', 'மீனம்': 'pisces',
  };

  const formatSign = (raw: string) => {
    if (!raw) return '';
    const clean = raw.split('(')[0].trim();
    const cleanLower = clean.toLowerCase();
    const mapped = SIGN_NAME_TO_KEY[cleanLower] || SIGN_NAME_TO_KEY[raw.trim().toLowerCase()];
    if (mapped) {
      return tVedic('signs', mapped, clean);
    }
    const engMatch = raw.match(/\(([^)]+)\)/);
    if (engMatch && engMatch[1]) {
      const fromEng = tVedic('signs', engMatch[1].trim().toLowerCase(), '');
      if (fromEng) return fromEng;
    }
    return tVedic('signs', cleanLower, clean);
  };

  const formatColor = (raw: string) => {
    if (!raw) return '';
    const clean = raw.split('(')[0].trim();
    return tVedic('lucky_colors', clean, clean);
  };

  const getIntroText = (score: number) => {
    if (score >= 80) return t('dailyInsights.interpretation.fallbackIntroHigh');
    if (score >= 60) return t('dailyInsights.interpretation.fallbackIntroBalanced');
    if (score >= 40) return t('dailyInsights.interpretation.fallbackIntroMixed');
    return t('dailyInsights.interpretation.fallbackIntroLow');
  };

  const harmony = getCosmicHarmony(panchang.auspiciousScore, panchang.bandCode);

  // Comprehensive Daily Insights PDF Report Generator (Server-Side Multi-Language Engine with full Indic font shaping)
  const handleDownloadDailyReportPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      // 1. Use AI insights already loaded; if not loaded yet, attempt one fetch
      const lang = i18n.language || 'en';
      let currentAi = aiInsights;
      if (!currentAi) {
        const storageKey = getDailyStorageKey(lang);
        try {
          const cached = localStorage.getItem(storageKey);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (isInsightCacheValidForLang(parsed, lang)) {
              currentAi = parsed;
              setAiInsights(parsed);
            } else {
              localStorage.removeItem(storageKey);
            }
          }
        } catch {}
      }
      if (currentAi && !isInsightCacheValidForLang(currentAi, lang)) {
        currentAi = null;
      }
      // If still no AI content, try fetching now (PDF needs it)
      if (!currentAi && panchang?.isRealPanchang && !isFetchingAiRef.current) {
        try {
          const freshData = await api.post<{ insights: DailyAiInsights }>(
            API_ENDPOINTS.INSIGHTS.DAILY_HOROSCOPE,
            { profile, chartData, panchang, numerology, lang }
          );
          if (freshData?.insights && isInsightCacheValidForLang(freshData.insights, lang)) {
            currentAi = freshData.insights;
            setAiInsights(freshData.insights);
            try { localStorage.setItem(getDailyStorageKey(lang), JSON.stringify(freshData.insights)); } catch {}
          }
        } catch (fetchErr) {
          console.warn('Could not pre-fetch AI insights for PDF:', fetchErr);
        }
      }

      const pName = profile?.fullName || 'Seeker';
      const safeName = pName.replace(/\s+/g, '_');
      const dateStr = panchang?.date || new Date().toISOString().split('T')[0];
      const fileName = `AstroJunction_Daily_Report_${safeName}_${dateStr}_${lang}.pdf`;

      // 1. Try backend high-fidelity PDF engine first (full Indic font shaping & layout fidelity)
      await api.downloadFile(API_ENDPOINTS.INSIGHTS.GENERATE_PDF, fileName, {
        method: 'POST',
        body: JSON.stringify({
          lang,
          profile,
          panchang,
          chartData,
          numerology,
          aiInsights: currentAi,
          rituals: getDailyRituals(),
          labels: {
            'dailyInsights.header.title': t('dailyInsights.header.title', 'Daily Cosmic Insights & Vedic Panchang'),
            'dailyInsights.subtitle': t('dailyInsights.subtitle', 'Authentic Vedic Ephemeris & AI Synthesis'),
          }
        })
      });
    } catch (err) {
      console.error('Failed to generate daily insights PDF:', err);
      alert('Failed to generate PDF report. Please ensure the backend server is reachable.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Greeting, Cosmic Alignment Score & Download Button */}
      <div className={`relative overflow-hidden rounded-xl border p-6 sm:p-8 shadow-2xl ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-white border-[#E5E1D8] text-[#2A2A2E]'}`}>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#C9A050]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className={`flex items-center space-x-2 text-xs font-semibold tracking-widest text-[#C9A050] mb-2 ${['hi', 'bn', 'ta'].includes(i18n.language) ? '' : 'uppercase'}`}>
              <Compass className="w-3.5 h-3.5 text-[#C9A050]" />
              <span>
                {t(profile.horoscopeSystem === 'western' ? 'dailyInsights.transitDate.western' : 'dailyInsights.transitDate.vedic', {
                  date: formatDate(new Date(), i18n.language, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                })}
              </span>
            </div>
            <h1 className="astro-page-header-title">
              <Trans
                i18nKey={getGreetingKey()}
                values={{ name: profile.fullName }}
                components={{
                  nameHighlight: <span className="text-[#9B782B] dark:text-[#E5C170] astro-name-bold font-bold" />
                }}
              />
            </h1>
            <p className="text-sm text-[#9E9A90] mt-2 max-w-2xl leading-relaxed astro-prose-justified">
              <span>
                <Trans
                  i18nKey={profile.horoscopeSystem === 'western' ? 'dailyInsights.hero.natalIntroWestern' : 'dailyInsights.hero.natalIntroVedic'}
                  values={{
                    sign: chartData?.ascendant?.signName ? formatSign(chartData.ascendant.signName) : 'Unknown',
                    mulank: formatNumber(numerology.mulank, i18n.language),
                    planet: tVedic('planets', (numerology.mulankPlanetClean || numerology.mulankPlanet.split('(')[0]).trim(), (numerology.mulankPlanetClean || numerology.mulankPlanet.split('(')[0]).trim()),
                  }}
                  components={{
                    signHighlight: <span className={`font-semibold ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2A2A2E]'}`} />,
                    mulankHighlight: <span className="font-semibold text-[#C9A050]" />,
                  }}
                />
              </span>
              {' '}
              <span>
                {aiInsights?.summary || getIntroText(panchang.auspiciousScore)}
              </span>
            </p>
          </div>

          {/* Right Area: Alignment Score Meter & Download Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={handleDownloadDailyReportPdf}
              disabled={isGeneratingPdf || isLoadingAi || !panchang?.isRealPanchang}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border text-xs font-bold transition shadow-lg cursor-pointer ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-[#C9A050] to-[#A07828] hover:from-[#D4AF37] hover:to-[#B38730] text-[#0D0D0F] border-[#C9A050] shadow-[#C9A050]/20'
                  : 'bg-[#C9A050] hover:bg-[#B38730] text-white border-[#C9A050] shadow-[#C9A050]/20'
              } disabled:opacity-50`}
              title={t('dailyInsights.actions.pdfTooltip', 'Download daily insights as formatted PDF report')}
            >
              {(isGeneratingPdf || isLoadingAi) ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{isGeneratingPdf ? t('dailyInsights.actions.generatingPdf', 'Generating PDF...') : isLoadingAi ? t('dailyInsights.interpretation.consulting', 'Consulting Planetary Ephemeris...') : t('dailyInsights.actions.downloadPdf', 'Download Report (PDF)')}</span>
            </button>

            <div className={`flex items-center space-x-4 border rounded-xl p-4 shadow-lg ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'}`}>
              <div className="text-center">
                <div className="text-3xl font-black text-[#C9A050]">{formatNumber(panchang.auspiciousScore, i18n.language)}%</div>
                <div className="text-[9px] uppercase font-bold tracking-widest text-[#9E9A90]">{t('dailyInsights.harmony.badgeLabel', 'Cosmic Harmony')}</div>
              </div>
              <div className="h-10 w-[1px] bg-[#2A2A2E]" />
              <div className={`text-xs space-y-1 ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2A2A2E]'}`}>
                <div className={`flex items-center space-x-1.5 font-medium ${harmony.color}`}>
                  <harmony.icon className="w-3.5 h-3.5" />
                  <span>{harmony.title}</span>
                </div>
                <div className="text-[11px] text-[#9E9A90]">{harmony.desc}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Auspicious Attributes Strip */}
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
          <div className={`p-3.5 rounded-lg border ${theme === 'dark' ? 'bg-[#1A1A1E]/80 border-[#2A2A2E]' : 'bg-[#F9F7F1]/80 border-[#E5E1D8]'}`}>
            <div className="text-[9px] text-[#9E9A90] uppercase font-bold tracking-wider">{t('dailyInsights.metrics.luckyNumber', 'Lucky Number Today')}</div>
            <div className="text-xl font-bold text-[#C9A050] mt-0.5">{formatNumber(panchang.luckyData?.luckyNumber || numerology.luckyNumbers[0] || numerology.mulank, i18n.language)}</div>
            <div className="text-[11px] text-[#9E9A90]">
              {t('dailyInsights.metrics.ruledBy', {
                planet: tVedic('planets', getPlanetForNumber(panchang.luckyData?.luckyNumber || numerology.luckyNumbers[0] || numerology.mulank), getPlanetForNumber(panchang.luckyData?.luckyNumber || numerology.luckyNumbers[0] || numerology.mulank))
              })}
            </div>
          </div>

          <div className={`p-3.5 rounded-lg border ${theme === 'dark' ? 'bg-[#1A1A1E]/80 border-[#2A2A2E]' : 'bg-[#F9F7F1]/80 border-[#E5E1D8]'}`}>
            <div className="text-[9px] text-[#9E9A90] uppercase font-bold tracking-wider">{t('dailyInsights.metrics.luckyColor', 'Lucky Color & Tone')}</div>
            <div className="text-xl font-bold text-[#C9A050] mt-0.5">{formatColor(panchang.luckyData?.luckyColor || numerology.luckyColors[0] || 'Golden Saffron')}</div>
            <div className="text-[11px] text-[#9E9A90] line-clamp-1" title={aiInsights?.lucky_color_desc || getLuckyColorDesc(panchang.luckyData?.luckyColor || numerology.luckyColors[0])}>
              {aiInsights?.lucky_color_desc || getLuckyColorDesc(panchang.luckyData?.luckyColor || numerology.luckyColors[0])}
            </div>
          </div>

          <div className={`p-3.5 rounded-lg border ${theme === 'dark' ? 'bg-[#1A1A1E]/80 border-[#2A2A2E]' : 'bg-[#F9F7F1]/80 border-[#E5E1D8]'}`}>
            <div className="text-[9px] text-[#9E9A90] uppercase font-bold tracking-wider">{t('dailyInsights.metrics.abhijitMuhurta', 'Shubh Abhijit Muhurta')}</div>
            <div className={`text-sm font-bold mt-1 ${theme === 'dark' ? 'text-emerald-400' : 'text-[#C9A050]'}`}>{formatPanchangTime(panchang.abhijitMuhurta.split('(')[0].trim(), i18n.language)}</div>
            <div className="text-[11px] text-[#9E9A90]">
              {t('dailyInsights.metrics.victoryWindow', 'Victory window for tasks')}
            </div>
          </div>

          <div className={`p-3.5 rounded-lg border ${theme === 'dark' ? 'bg-[#1A1A1E]/80 border-[#2A2A2E]' : 'bg-[#F9F7F1]/80 border-[#E5E1D8]'}`}>
            <div className="text-[9px] text-[#9E9A90] uppercase font-bold tracking-wider">{t('dailyInsights.metrics.rahuKaal', 'Rahu Kaal (Avoid Starts)')}</div>
            <div className={`text-sm font-bold mt-1 ${theme === 'dark' ? 'text-rose-400' : 'text-[#C9A050]'}`}>{formatPanchangTime(panchang.rahuKaal.split('(')[0].trim(), i18n.language)}</div>
            <div className="text-[11px] text-[#9E9A90]">
              {t('dailyInsights.metrics.inauspiciousWindow', 'Inauspicious time bracket')}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Panchang Deep Dive & Daily AI Horoscope */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Daily AI Insights & Daily Ritual */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Personalized Forecast Card */}
          <div className={`border rounded-xl p-6 shadow-xl ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-white border-[#E5E1D8] text-[#2A2A2E]'}`}>
            <div className={`flex items-center justify-between pb-4 border-b mb-4 ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-[#C9A050]/15 text-[#C9A050] border border-[#C9A050]/30">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                    {t('dailyInsights.interpretation.title', 'Daily Vedic Horoscope Interpretation')}
                  </h2>
                  <p className="text-xs text-[#9E9A90]">
                    {t('dailyInsights.interpretation.subtitle', 'Personalized transit synthesis based on your specific birth chart & active dasha')}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {speechNotice && (
                  <span className="text-[11px] text-amber-500 font-medium px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20">
                    {speechNotice}
                  </span>
                )}
                {aiInsights && (
                  <>
                    <button
                      onClick={handleSpeech}
                      className={`p-2 rounded-lg border transition cursor-pointer text-xs flex items-center space-x-1 ${
                        isPlayingAudio
                          ? 'bg-[#C9A050] text-[#0D0D0F] border-[#C9A050]'
                          : 'bg-[#1A1A1E] text-[#E5E1D8] border-[#2A2A2E] hover:text-white'
                      }`}
                      title={t('dailyInsights.actions.listen', 'Listen to reading')}
                    >
                      <Volume2 className="w-4 h-4" />
                      <span className="hidden sm:inline">
                        {isPlayingAudio ? t('dailyInsights.actions.stop', 'Stop') : t('dailyInsights.actions.listen', 'Listen')}
                      </span>
                    </button>
                    <button
                      onClick={handleShare}
                      className={`p-2 rounded-lg border hover:text-white transition cursor-pointer text-xs flex items-center space-x-1 ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-[#F9F7F1] border-[#E5E1D8] text-[#2A2A2E]'}`}
                      title={t('dailyInsights.actions.share', 'Copy & Share')}
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="hidden sm:inline">
                        {isCopied ? t('dailyInsights.actions.copied', 'Copied!') : t('dailyInsights.actions.share', 'Share')}
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Reading Content */}
            {isLoadingAi ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
                <div className="w-9 h-9 border-2 border-[#C9A050] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-[#C9A050] font-sans font-semibold">
                  {t('dailyInsights.interpretation.consulting', 'Consulting Planetary Ephemeris & Vedic Model...')}
                </p>
                <p className="text-[11px] text-[#9E9A90] max-w-sm">
                  {t('dailyInsights.interpretation.calculating', 'Calculating Moon transit, Nakshatra lord aspect, and today’s Tithi vibration for your Ascendant.')}
                </p>
              </div>
            ) : aiInsights ? (
              <div className="space-y-4">
                <div className={`prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed space-y-3 whitespace-pre-line p-5 rounded-xl border font-sans astro-prose-justified ${theme === 'dark' ? 'border-[#2A2A2E] text-[#E5E1D8] bg-[#08080A]' : 'border-[#E5E1D8] text-[#2A2A2E] bg-[#F0ECE1]'}`}>
                  {aiInsights.summary}
                  {aiInsights.showingEnglishNote && (
                    <div className="text-[11px] text-[#C9A050] italic mt-2">
                      *{t('dailyInsights.interpretation.showingEnglishNote', 'Showing English version')}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className={`p-3.5 /60 rounded-lg border ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'}`}>
                    <span className="text-[9px] uppercase font-sans font-bold tracking-wider text-[#C9A050]">
                      {t('dailyInsights.interpretation.careerCommerce', 'Career & Commerce')}
                    </span>
                    <p className="text-xs font-sans text-[#9E9A90] mt-1">{aiInsights.career}</p>
                  </div>
                  <div className={`p-3.5 /60 rounded-lg border ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'}`}>
                    <span className="text-[9px] uppercase font-sans font-bold tracking-wider text-[#C9A050]">
                      {t('dailyInsights.interpretation.loveHarmony', 'Love & Harmony')}
                    </span>
                    <p className="text-xs font-sans text-[#9E9A90] mt-1">{aiInsights.love}</p>
                  </div>
                  <div className={`p-3.5 /60 rounded-lg border ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'}`}>
                    <span className="text-[9px] uppercase font-sans font-bold tracking-wider text-[#C9A050]">
                      {t('dailyInsights.interpretation.healthPrana', 'Health & Prana')}
                    </span>
                    <p className="text-xs font-sans text-[#9E9A90] mt-1">{aiInsights.health}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`p-4 rounded-xl border space-y-2 ${theme === 'dark' ? 'bg-[#1A1A1E]/80 border-[#2A2A2E]' : 'bg-[#F9F7F1]/80 border-[#E5E1D8]'}`}>
                  <div className="text-sm font-sans font-semibold text-[#C9A050] flex items-center space-x-2">
                    <Sun className="w-4 h-4 text-[#C9A050]" />
                    <span>
                      {t('dailyInsights.interpretation.dominantRhythm', {
                        tithi: formatTithi(panchang.tithi),
                        nakshatra: formatNakshatra(panchang.nakshatra),
                      })}
                    </span>
                  </div>
                  <p className={`text-xs font-sans leading-relaxed astro-prose-justified ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2A2A2E]'}`}>
                    {getIntroText(panchang.auspiciousScore)}
                    {" "}
                    {t('dailyInsights.interpretation.rahuKaalTemperament', {
                      time: formatPanchangTime(panchang.rahuKaal.split('(')[0].trim(), i18n.language),
                    })}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className={`p-3.5 /60 rounded-lg border ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'}`}>
                    <span className="text-[9px] uppercase font-sans font-bold tracking-wider text-[#C9A050]">
                      {t('dailyInsights.interpretation.careerCommerce', 'Career & Commerce')}
                    </span>
                    <p className="text-xs font-sans text-[#9E9A90] mt-1">
                      {panchang.auspiciousScore >= 80 ? "Excellent for structured negotiations, strategy decks, and leadership decisions."
                      : panchang.auspiciousScore >= 60 ? "Good for routine administrative tasks and organizing future workflows."
                      : panchang.auspiciousScore >= 40 ? "Avoid finalizing major contracts today. Focus on reviewing details instead."
                      : "Not ideal for initiating new ventures. Focus on clearing backlogs silently."}
                    </p>
                  </div>
                  <div className={`p-3.5 /60 rounded-lg border ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'}`}>
                    <span className="text-[9px] uppercase font-sans font-bold tracking-wider text-[#C9A050]">
                      {t('dailyInsights.interpretation.loveHarmony', 'Love & Harmony')}
                    </span>
                    <p className="text-xs font-sans text-[#9E9A90] mt-1">
                      {panchang.auspiciousScore >= 80 ? "Nurturing dialogue resolves past hesitations; evening hours favor quiet companionship."
                      : panchang.auspiciousScore >= 60 ? "Mutual understanding grows through patient listening and shared domestic activities."
                      : panchang.auspiciousScore >= 40 ? "Potential for minor misunderstandings. Practice clear and gentle communication."
                      : "Give space to loved ones. Solitude might be more restorative than socializing today."}
                    </p>
                  </div>
                  <div className={`p-3.5 /60 rounded-lg border ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'}`}>
                    <span className="text-[9px] uppercase font-sans font-bold tracking-wider text-[#C9A050]">
                      {t('dailyInsights.interpretation.healthPrana', 'Health & Prana')}
                    </span>
                    <p className="text-xs font-sans text-[#9E9A90] mt-1">
                      {panchang.auspiciousScore >= 80 ? "High stamina; hydrate with warm herbal infusions to balance Pitta-Vata energy."
                      : panchang.auspiciousScore >= 60 ? "Stable energy levels; gentle yoga or evening walks are highly recommended."
                      : panchang.auspiciousScore >= 40 ? "Energy may fluctuate. Ensure adequate rest and avoid heavy, rich meals."
                      : "Vitality is lower than usual. Prioritize deep rest and grounding practices."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Daily Vedic Sadhana & Upaya Card */}
          <div className={`border rounded-xl p-6 shadow-xl ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-white border-[#E5E1D8] text-[#2A2A2E]'}`}>
            <div className="flex items-center space-x-2 text-[#C9A050] font-serif font-bold text-base mb-3">
              <Flame className="w-4 h-4" />
              <span>{t('dailyInsights.sadhana.title', 'Recommended Daily Vedic Ritual (Nitya Sadhana)')}</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#1A1A1E]/80 border-[#2A2A2E]' : 'bg-[#F9F7F1]/80 border-[#E5E1D8]'}`}>
                <span className="text-[9px] uppercase font-sans font-bold text-[#C9A050] tracking-widest">
                  {t('dailyInsights.sadhana.morning', 'Morning Sadhana')}
                </span>
                <h4 className={`text-sm font-serif font-bold mt-1 ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                  {getDailyRituals().morningTitle}
                </h4>
                <p className="text-xs font-sans text-[#9E9A90] mt-1 leading-relaxed">
                  {getDailyRituals().morningDesc}
                </p>
              </div>

              <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#1A1A1E]/80 border-[#2A2A2E]' : 'bg-[#F9F7F1]/80 border-[#E5E1D8]'}`}>
                <span className="text-[9px] uppercase font-sans font-bold text-[#C9A050] tracking-widest">
                  {t('dailyInsights.sadhana.evening', 'Evening Sadhana')}
                </span>
                <h4 className={`text-sm font-serif font-bold mt-1 ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                  {getDailyRituals().eveningTitle}
                </h4>
                <p className="text-xs font-sans text-[#9E9A90] mt-1 leading-relaxed">
                  {getDailyRituals().eveningDesc}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Complete Vedic Panchang Breakdown & Fast Actions */}
        <div className="space-y-6">
          {/* Panchang Deep Dive Card */}
          <div className={`border rounded-xl p-6 shadow-xl ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-white border-[#E5E1D8] text-[#2A2A2E]'}`}>
            <div className={`flex items-center justify-between pb-3 border-b mb-4 ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-[#C9A050]" />
                <h3 className={`text-base font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                  {t('dailyInsights.panchang.title', 'Sacred Panchang Parameters')}
                </h3>
              </div>
              <span className="text-[10px] font-sans text-[#C9A050]/80 font-medium">
                {t('dailyInsights.panchang.system', 'Sidereal Vedic')}
              </span>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div className={`flex justify-between items-center py-1.5 border-b /60 ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
                <span className="text-[#9E9A90]">{t('dailyInsights.panchang.tithi', 'Tithi (Lunar Day)')}</span>
                <span className={`font-semibold text-right ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                  {formatTithi(panchang.tithi)}
                </span>
              </div>
              <div className={`flex justify-between items-center py-1.5 border-b /60 ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
                <span className="text-[#9E9A90]">{t('dailyInsights.panchang.nakshatra', 'Nakshatra (Asterism)')}</span>
                <span className={`font-semibold text-right font-serif ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                  {formatNakshatra(panchang.nakshatra)}
                </span>
              </div>
              <div className={`flex justify-between items-center py-1.5 border-b /60 ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
                <span className="text-[#9E9A90]">{t('dailyInsights.panchang.yoga', 'Vedic Yoga')}</span>
                <span className={`font-semibold text-right ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                  {formatYoga(panchang.yoga)}
                </span>
              </div>
              <div className={`flex justify-between items-center py-1.5 border-b /60 ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
                <span className="text-[#9E9A90]">{t('dailyInsights.panchang.karana', 'Karana (Half Tithi)')}</span>
                <span className={`font-semibold text-right ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                  {formatKarana(panchang.karana)}
                </span>
              </div>
              <div className={`flex justify-between items-center py-1.5 border-b /60 ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
                <span className="text-[#9E9A90]">{t('dailyInsights.panchang.sunSign', 'Sun Sign (Surya Rashi)')}</span>
                <span className={`font-semibold text-right ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                  {formatSign(panchang.solarSign)}
                </span>
              </div>
              <div className={`flex justify-between items-center py-1.5 border-b /60 ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
                <span className="text-[#9E9A90]">{t('dailyInsights.panchang.moonSign', 'Moon Sign (Chandra Rashi)')}</span>
                <span className={`font-semibold text-right font-serif ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                  {formatSign(panchang.lunarSign)}
                </span>
              </div>
              <div className={`flex justify-between items-center py-1.5 border-b /60 ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
                <span className="text-[#9E9A90]">{t('dailyInsights.panchang.sunriseSunset', 'Sunrise / Sunset')}</span>
                <span className={`font-semibold text-right ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>{formatPanchangTime(panchang.sunrise, i18n.language)} / {formatPanchangTime(panchang.sunset, i18n.language)}</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-[#9E9A90]">{t('dailyInsights.panchang.brahmaMuhurta', 'Brahma Muhurta')}</span>
                <span className={`font-semibold text-right text-xs ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                  {formatPanchangTime(panchang.brahmaMuhurta.split('(')[0].trim(), i18n.language)}
                  {' '}
                  <span className="text-[10px] font-normal text-[#9E9A90]">
                    ({t('dailyInsights.panchang.brahmaMuhurtaDesc', 'Ideal for Meditation & Sadhana')})
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Nav Cards */}
          <div className={`border rounded-xl p-5 shadow-xl space-y-3 ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-white border-[#E5E1D8] text-[#2A2A2E]'}`}>
            <h3 className="text-xs font-sans font-bold text-[#C9A050] uppercase tracking-wider leading-normal break-words pt-1">
              {t('dailyInsights.blueprint.title', 'Explore Your Vedic Blueprint')}
            </h3>
            
            <button
              onClick={() => onNavigateToTab('horoscope')}
              className={`w-full text-left p-3 rounded-lg hover:bg-[#1E1E24] border transition cursor-pointer flex items-center justify-between group ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'}`}
            >
              <div>
                <div className={`text-xs font-semibold group-hover:text-[#C9A050] transition ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                  {t('dailyInsights.blueprint.traditionsTitle', '5 Indian Ancient Traditions')}
                </div>
                <div className="text-[11px] text-[#9E9A90]">
                  {t('dailyInsights.blueprint.traditionsDesc', 'Parashari, Jaimini, Lal Kitab, KP & Nadi')}
                </div>
              </div>
              <Compass className="w-4 h-4 text-[#C9A050] group-hover:translate-x-0.5 transition" />
            </button>

            <button
              onClick={() => onNavigateToTab('counsellor')}
              className={`w-full text-left p-3 rounded-lg hover:bg-[#1E1E24] border transition cursor-pointer flex items-center justify-between group ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'}`}
            >
              <div>
                <div className={`text-xs font-semibold group-hover:text-[#C9A050] transition ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                  {t('dailyInsights.blueprint.astrologerTitle', 'Interactive Astrologer')}
                </div>
                <div className="text-[11px] text-[#9E9A90]">
                  {t('dailyInsights.blueprint.astrologerDesc', 'Counselling grounded in your exact birth chart')}
                </div>
              </div>
              <Bot className="w-4 h-4 text-[#C9A050] group-hover:translate-x-0.5 transition" />
            </button>

            <button
              onClick={() => onNavigateToTab('roadmap')}
              className={`w-full text-left p-3 rounded-lg hover:bg-[#1E1E24] border transition cursor-pointer flex items-center justify-between group ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'}`}
            >
              <div>
                <div className={`text-xs font-semibold group-hover:text-[#C9A050] transition ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                  {t('dailyInsights.blueprint.roadmapTitle', 'Personal & Career Roadmap')}
                </div>
                <div className="text-[11px] text-[#9E9A90]">
                  {t('dailyInsights.blueprint.roadmapDesc', '10-Year milestone forecasts & dasha windows')}
                </div>
              </div>
              <Zap className="w-4 h-4 text-[#C9A050] group-hover:translate-x-0.5 transition" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
