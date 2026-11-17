import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import html2canvas from 'html2canvas';
import {
  HeartHandshake,
  Sparkles,
  Download,
  Printer,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Dna,
  Heart,
  Compass,
  Star,
  Calendar,
  Clock,
  MapPin,
  User,
  RefreshCw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Layers,
  Award,
  Zap,
  Info,
  Sliders,
  CloudUpload,
  Loader2,
  X,
  Trash2,
  ArrowRight,
  Crown,
  Lock,
  Bookmark,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { UserProfile, AshtaKootaMilanResult, KootaItem } from '../types';
import { VedicDatePicker } from './VedicDatePicker';
import { VedicTimePicker } from './VedicTimePicker';
import { calculateKundliMilan, PRESET_MATCHMAKING_COUPLES, calculateVedicChart, calculateNumerology, getLagnaGemstones } from '../services/astroEngine';
import { MatchReportSummary, MatchReportFull, saveMatchReport, listMatchReports, fetchMatchReport, getMatchReportPdfUrl, calculateMatchReportBackend } from '../services/matchmakingApi';
import { API_ENDPOINTS } from '../config/api_config';
import { ApiError, api } from '../services/api';
import { getTranslation } from '../services/translations';
import {
  formatLocalizedDigits,
  getLocalizedKootaName,
  getLocalizedKootaArea,
  getLocalizedKootaDescription,
  getLocalizedKootaValue,
  getLocalizedVerdict,
  getLocalizedStatus,
  getLocalizedSeverity,
  getLocalizedSynastryAspect,
  getLocalizedSynastryVerdict,
  getLocalizedRemedy,
  getLocalizedMuhuratAdvice,
  getLocalizedRashi,
  getLocalizedNakshatra,
  getLocalizedPlanet,
  getLocalizedGemPurpose,
  getLocalizedElement,
  getLocalizedElementalSynergy,
  getLocalizedNumerologyDescription,
  getLocalizedNadi,
  getLocalizedNadiReason,
  getLocalizedNadiRemedy,
  getLocalizedBhakootReason,
  getLocalizedBhakootRemedy,
  getLocalizedManglikExplanation,
  getLocalizedSynastryAspectPlanets,
} from '../services/matchmakingTranslations';
import { getGemstoneKey } from '../services/birthChartTranslations';

interface MatchmakingViewProps {
  currentProfile: UserProfile;
  profiles: UserProfile[];
  language?: string;
  isAuthenticated?: boolean;
  theme?: 'light' | 'dark';
  onNavigateToTab?: (tab: string, tierId?: string) => void;
}

const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    const [y, m, d] = dateStr.split('-');
    if (!y || !m || !d) return dateStr;
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

const formatDisplayTime = (timeStr: string) => {
  if (!timeStr) return '';
  try {
    const [h, m] = timeStr.split(':');
    if (h === undefined || m === undefined) return timeStr;
    let hour = parseInt(h);
    const minute = m.slice(0, 2);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute.padStart(2, '0')} ${ampm}`;
  } catch {
    return timeStr;
  }
};

const renderSafeAiText = (val: any): string => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'object') {
    if (val.description) return String(val.description);
    if (val.text) return String(val.text);
    if (val.content) return String(val.content);
    if (val.status && !val.present && !val.partner1) return String(val.status);
    if (val.note) return String(val.note);
    if (val.reason) return String(val.reason);
    if (val.present !== undefined) {
      const p1Status = val.partner1 ? ` (${val.partner1})` : '';
      const p2Status = val.partner2 ? ` (${val.partner2})` : '';
      return val.present 
        ? `Manglik Dosha Present: ${val.partner1 || val.partner2 || 'Active Kuja influence'}. Remedies recommended.`
        : `No Manglik Dosha: Both charts are clear of Kuja affliction.`;
    }
    if (val.partner1 && val.partner2) {
      return `${val.partner1}. ${val.partner2}.`;
    }
    // If it's a koota breakdown object like { varna, vashya, tara... }
    if (val.varna !== undefined || val.nadi !== undefined || val.yoni !== undefined) {
      return Object.entries(val)
        .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${renderSafeAiText(v)}`)
        .join(' • ');
    }
    if (Array.isArray(val)) {
      return val.map((v) => (typeof v === 'object' ? renderSafeAiText(v) : String(v))).join(', ');
    }
    // Generic object key-value formatter
    const entries = Object.entries(val).filter(([_, v]) => v !== undefined && v !== null);
    if (entries.length > 0) {
      return entries
        .map(([k, v]) => `${k.replace(/([A-Z])/g, ' $1').trim()}: ${renderSafeAiText(v)}`)
        .join('. ');
    }
    return '';
  }
  return String(val);
};

export const MatchmakingView: React.FC<MatchmakingViewProps> = ({
  currentProfile,
  profiles,
  language = 'en',
  isAuthenticated,
  theme = 'dark',
  onNavigateToTab,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = language || i18n.language || 'en';
  const profileId = currentProfile?.id || 'default';
  const storageKey = `jyotish_matchmaking_state_${profileId}`;
  const historyKey = `jyotish_matchmaking_history_${profileId}`;

  // Dynamic templates for Partner 1 and Partner 2
  const getDefaultP1 = (): UserProfile => ({
    id: currentProfile?.id || 'p1',
    fullName: currentProfile?.fullName || '',
    gender: currentProfile?.gender || 'male',
    birthDate: currentProfile?.birthDate || '',
    birthTime: currentProfile?.birthTime || '',
    birthPlace: currentProfile?.birthPlace || '',
    latitude: currentProfile?.latitude || 0,
    longitude: currentProfile?.longitude || 0,
    timezone: currentProfile?.timezone || 5.5,
    horoscopeSystem: currentProfile?.horoscopeSystem || 'vedic',
    focusAreas: currentProfile?.focusAreas || ['relationships'],
    createdAt: new Date().toISOString(),
  });

  const getDefaultP2 = (): UserProfile => ({
    id: 'p2',
    fullName: '',
    gender: 'female',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    latitude: 0,
    longitude: 0,
    timezone: 5.5,
    horoscopeSystem: 'vedic',
    focusAreas: ['relationships'],
    createdAt: new Date().toISOString(),
  });

  // Select partner 1 and partner 2 (Clean default state on load/refresh)
  const [partner1, setPartner1] = useState<UserProfile>(getDefaultP1());
  const [partner2, setPartner2] = useState<UserProfile>(getDefaultP2());

  const [isP1Saved, setIsP1Saved] = useState<boolean>(false);
  const [isP2Saved, setIsP2Saved] = useState<boolean>(false);
  const [isCalculatingMilan, setIsCalculatingMilan] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const [matchResult, setMatchResult] = useState<AshtaKootaMilanResult | null>(null);

  const [expandedKoota, setExpandedKoota] = useState<string | null>('nadi');
  const [activeTab, setActiveTab] = useState<'kootas' | 'doshas' | 'synastry' | 'remedies' | 'ai_counsel' | 'download'>('kootas');

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSynthesis, setAiSynthesis] = useState<any | null>(null);
  const [aiSynthesisId, setAiSynthesisId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedReportId, setSavedReportId] = useState<string | null>(null);

  // Live Auto-Refresh State
  const [isAutoRefreshing, setIsAutoRefreshing] = useState<boolean>(false);
  const [lastAutoRefreshedAt, setLastAutoRefreshedAt] = useState<Date | null>(null);

  // Saved Matches History Modal & List
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isMatchmakingSubModalOpen, setIsMatchmakingSubModalOpen] = useState(false);

  const isMatchmakingSubscribed = Boolean(
    currentProfile?.isPremium ||
    (currentProfile as any)?.isMatchmakingPremium ||
    (typeof window !== 'undefined' && localStorage.getItem('jyotish_matchmaking_subscribed') === 'true')
  );
  const [savedMatches, setSavedMatches] = useState<any[]>(() => {
    try {
      const rawHist = localStorage.getItem(historyKey);
      return rawHist ? JSON.parse(rawHist) : [];
    } catch {
      return [];
    }
  });

  // When profile switches, reset to clean form and load profile history
  useEffect(() => {
    setPartner1(getDefaultP1());
    setPartner2(getDefaultP2());
    setIsP1Saved(false);
    setIsP2Saved(false);
    setMatchResult(null);
    setAiSynthesis(null);
    setLastAutoRefreshedAt(null);

    try {
      const rawHist = localStorage.getItem(historyKey);
      setSavedMatches(rawHist ? JSON.parse(rawHist) : []);
    } catch {
      setSavedMatches([]);
    }
  }, [profileId, historyKey]);

  // (Auto-refresh on typing removed to prevent unwanted API calls before clicking Generate)

  // Auto-scroll down smoothly to the Generate button when both partners are saved
  useEffect(() => {
    if (isP1Saved && isP2Saved && partner1.birthDate && partner2.birthDate && !matchResult) {
      const scrollTimer = setTimeout(() => {
        const generateSection = document.getElementById('generate-milan-section');
        if (generateSection) {
          generateSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
      return () => clearTimeout(scrollTimer);
    }
  }, [isP1Saved, isP2Saved, partner1.birthDate, partner2.birthDate, matchResult]);

  // Save calculated result to history list
  const saveToHistoryList = (result: AshtaKootaMilanResult, p1: UserProfile, p2: UserProfile) => {
    try {
      const matchId = `match_${Date.now()}`;
      const record = {
        id: matchId,
        partner1Name: p1.fullName || 'Partner 1',
        partner1BirthDate: p1.birthDate,
        partner2Name: p2.fullName || 'Partner 2',
        partner2BirthDate: p2.birthDate,
        totalScore: result.totalPoints,
        maxScore: result.maxPoints,
        percentage: result.percentage,
        verdictTitle: result.verdictTitle || (typeof result.summary === 'object' ? (result.summary as any)?.verdictTitle : undefined) || 'Kundli Milan',
        createdAt: new Date().toISOString(),
        partner1: p1,
        partner2: p2,
        result: result,
      };

      setSavedMatches((prev) => {
        // Filter out duplicate if same pair
        const filtered = prev.filter(
          (m) => !(m.partner1Name === record.partner1Name && m.partner2Name === record.partner2Name)
        );
        const updated = [record, ...filtered].slice(0, 20); // Keep latest 20
        localStorage.setItem(historyKey, JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      console.warn('Failed to save match to history:', e);
    }
  };

  // Reset / Start New Match
  const handleNewMatch = () => {
    setPartner1(getDefaultP1());
    setPartner2(getDefaultP2());
    setIsP1Saved(false);
    setIsP2Saved(false);
    setMatchResult(null);
    setAiSynthesis(null);
    setLastAutoRefreshedAt(null);
  };

  // Load a match from history into the UI with full-page cosmic loader & auto-scroll
  const handleLoadFromHistory = (item: any) => {
    if (item.partner1 && item.partner2) {
      setPartner1(item.partner1);
      setPartner2(item.partner2);
      setIsP1Saved(true);
      setIsP2Saved(true);
      setIsHistoryModalOpen(false);

      if (item.result) {
        setMatchResult(item.result);
        setTimeout(() => {
          const resultsEl = document.getElementById('kundli-milan-results');
          if (resultsEl) {
            resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      } else {
        triggerMilanCalculation(item.partner1, item.partner2);
      }
    }
  };

  // Sync server saved reports when history modal is opened
  useEffect(() => {
    if (isHistoryModalOpen && isAuthenticated) {
      listMatchReports()
        .then((serverReports) => {
          if (Array.isArray(serverReports) && serverReports.length > 0) {
            setSavedMatches((prev) => {
              const prevIds = new Set(prev.map((m) => m.id));
              const newItems = serverReports
                .filter((sr: any) => !prevIds.has(sr.id))
                .map((sr: any) => ({
                  id: sr.id,
                  partner1Name: sr.partner1Name || sr.partner1?.fullName || sr.partner1?.name || '',
                  partner1BirthDate: sr.partner1BirthDate || sr.partner1?.birthDate || '',
                  partner2Name: sr.partner2Name || sr.partner2?.fullName || sr.partner2?.name || '',
                  partner2BirthDate: sr.partner2BirthDate || sr.partner2?.birthDate || '',
                  totalScore: sr.totalScore,
                  maxScore: sr.maxScore || 36,
                  percentage: Math.round(((sr.totalScore || 0) / (sr.maxScore || 36)) * 100),
                  verdictTitle: sr.partner1ManglikStatus || sr.manglikStatus || 'Saved Match',
                  createdAt: sr.createdAt || new Date().toISOString(),
                  partner1: sr.partner1 || {
                    fullName: sr.partner1Name || '',
                    birthDate: sr.partner1BirthDate || '',
                    birthTime: '12:00',
                    birthPlace: '',
                  },
                  partner2: sr.partner2 || {
                    fullName: sr.partner2Name || '',
                    birthDate: sr.partner2BirthDate || '',
                    birthTime: '12:00',
                    birthPlace: '',
                  },
                  result: sr.result || sr.report,
                }));
              return [...newItems, ...prev];
            });
          }
        })
        .catch(() => {});
    }
  }, [isHistoryModalOpen, isAuthenticated]);

  // Delete a match record from history
  const handleDeleteFromHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedMatches.filter((m) => m.id !== id);
    setSavedMatches(updated);
    try {
      localStorage.setItem(historyKey, JSON.stringify(updated));
    } catch {}
  };

  const handleSaveMatchReport = async () => {
    if (!matchResult) return;
    setSaveState('saving');
    setSaveError(null);
    try {
      saveToHistoryList(matchResult, partner1, partner2);
      if (isAuthenticated) {
        const saved = await saveMatchReport(matchResult, partner1, partner2);
        if (saved && saved.id) {
          setSavedReportId(saved.id);
        }
      }
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 3000);
    } catch (err: any) {
      console.error('Failed to save match report to server:', err);
      setSaveState('error');
      const errorMsg = err instanceof ApiError ? err.message : (err?.message || 'Could not save report to server.');
      setSaveError(errorMsg);
    }
  };

  const printableRef = useRef<HTMLDivElement>(null);
  const calculationTimerRef = useRef<NodeJS.Timeout[]>([]);

  // Recalculate match with cosmic celestial loader animation
  const triggerMilanCalculation = (p1: UserProfile = partner1, p2: UserProfile = partner2) => {
    if (!p1.birthDate || !p2.birthDate) {
      return;
    }

    // Clear any previous running timers
    calculationTimerRef.current.forEach((timer) => clearTimeout(timer));
    calculationTimerRef.current = [];

    setIsCalculatingMilan(true);
    setLoadingStep(0);
    setMatchResult(null);

    const t1 = setTimeout(() => {
      setLoadingStep(1);
    }, 300);

    const t2 = setTimeout(() => {
      setLoadingStep(2);
    }, 600);

    const t3 = setTimeout(async () => {
      try {
        let result = calculateKundliMilan(p1, p2);
        try {
          const backendReport = await calculateMatchReportBackend(p1, p2);
          if (backendReport) {
            const rep = backendReport.report || backendReport;
            const beManglik = rep.manglik;

            // Harmonize Manglik data from Swiss Ephemeris Backend into frontend UI format
            let harmonizedManglik = result.manglik;
            if (beManglik && beManglik.partner1 && beManglik.partner2) {
              const p1Name = beManglik.partner1.name || p1.fullName;
              const p2Name = beManglik.partner2.name || p2.fullName;

              const isP1M = Boolean(
                beManglik.partner1?.fromLagna?.isManglik ??
                (beManglik.partner1?.marsHouseFromLagna && [1, 2, 4, 7, 8, 12].includes(beManglik.partner1.marsHouseFromLagna))
              );
              const isP2M = Boolean(
                beManglik.partner2?.fromLagna?.isManglik ??
                (beManglik.partner2?.marsHouseFromLagna && [1, 2, 4, 7, 8, 12].includes(beManglik.partner2.marsHouseFromLagna))
              );

              const p1House = beManglik.partner1?.fromLagna?.house || beManglik.partner1?.marsHouseFromLagna || result.manglik?.partner1?.marsHouse || 1;
              const p2House = beManglik.partner2?.fromLagna?.house || beManglik.partner2?.marsHouseFromLagna || result.manglik?.partner2?.marsHouse || 1;

              const isNeut = (isP1M && isP2M) || (!isP1M && !isP2M);

              harmonizedManglik = {
                partner1: {
                  name: p1Name,
                  isManglik: isP1M,
                  severity: isP1M ? ([7, 8].includes(p1House) ? 'High (Purna Manglik)' : 'Moderate') : 'None',
                  marsHouse: p1House,
                  cancellation: isP1M ? 'Active' : 'No Dosha',
                },
                partner2: {
                  name: p2Name,
                  isManglik: isP2M,
                  severity: isP2M ? ([7, 8].includes(p2House) ? 'High (Purna Manglik)' : 'Moderate') : 'None',
                  marsHouse: p2House,
                  cancellation: isP2M ? 'Active' : 'No Dosha',
                },
                verdict: isNeut
                  ? (isP1M && isP2M ? 'Both Partners Manglik (Perfect Mutual Neutralization)' : 'Neither Partner Manglik (Clean Planetary Axis)')
                  : 'One Partner Manglik (Requires Mars Pacification Remedy)',
                isNeutralized: isNeut,
                explanation: isNeut
                  ? 'Kuja Dosha intensity is completely neutralized between both horoscopes, ensuring marital peace and vitality.'
                  : `${isP1M ? p1Name : p2Name} has active Kuja Dosha. Performing Kumbh Vivah or Hanuman Chalisa remedies ensures full protection.`,
              };
            }

            // Harmonize Nadi Dosha from Swiss Ephemeris Backend into frontend format
            const beNadi = rep.ashtaKoota?.nadi;
            const nadiKoota = (rep.kootas || []).find((k: any) => k.id === 'nadi');
            const p1Nak = rep.partners?.partner1?.nakshatra || rep.charts?.partner1?.planetsById?.moon?.nakshatra || '';
            const p2Nak = rep.partners?.partner2?.nakshatra || rep.charts?.partner2?.planetsById?.moon?.nakshatra || '';
            
            let harmonizedNadiDosha = result.nadiDosha;
            if (beNadi || nadiKoota) {
              const p1NadiName = beNadi?.partner1Nadi || nadiKoota?.p1Value?.split(' ')[0] || 'Madhya';
              const p2NadiName = beNadi?.partner2Nadi || nadiKoota?.p2Value?.split(' ')[0] || 'Madhya';
              const hasDosha = Boolean(beNadi?.sameNadi ?? (nadiKoota?.obtainedPoints === 0));
              const isCancelled = Boolean(beNadi?.cancellationApplied);

              harmonizedNadiDosha = {
                hasDosha,
                isCancelled,
                partner1Nadi: p1Nak ? `${p1NadiName} (${p1Nak})` : p1NadiName,
                partner2Nadi: p2Nak ? `${p2NadiName} (${p2Nak})` : p2NadiName,
                reason: beNadi?.reason || nadiKoota?.details || (!hasDosha ? `Different Nadis (${p1NadiName} & ${p2NadiName}) - Harmonious Genetic Accord` : `Both share ${p1NadiName} Nadi`),
                remedy: beNadi?.note || (hasDosha && !isCancelled
                  ? 'Perform Maha Mrityunjaya Japa (108 chants), donate gold/grains, and recite Swasti Suktam on auspicious nakshatra days.'
                  : 'No specific remedy required as Nadis are naturally distinct and harmonious.'),
              };
            }

            // Harmonize Bhakoot Dosha from Swiss Ephemeris Backend into frontend format
            const beBhakoot = rep.ashtaKoota?.bhakoot;
            const bhakootKoota = (rep.kootas || []).find((k: any) => k.id === 'bhakoot');
            const p1Rashi = rep.partners?.partner1?.rashi || rep.charts?.partner1?.planetsById?.moon?.signName || '';
            const p2Rashi = rep.partners?.partner2?.rashi || rep.charts?.partner2?.planetsById?.moon?.signName || '';

            let harmonizedBhakootDosha = result.bhakootDosha;
            if (beBhakoot || bhakootKoota) {
              const hasDosha = Boolean(beBhakoot?.dosha ?? (bhakootKoota?.obtainedPoints === 0));
              const isCancelled = Boolean(beBhakoot?.cancellationApplied);
              const relation = beBhakoot?.relation || (hasDosha ? '6/8 or 2/12' : '7/7 or 1/7');

              harmonizedBhakootDosha = {
                hasDosha,
                isCancelled,
                partner1Rashi: p1Rashi || bhakootKoota?.p1Value?.split(' ')[0] || result.bhakootDosha?.partner1Rashi,
                partner2Rashi: p2Rashi || bhakootKoota?.p2Value?.split(' ')[0] || result.bhakootDosha?.partner2Rashi,
                rashiDistance: relation,
                reason: beBhakoot?.note || bhakootKoota?.details || (hasDosha ? (isCancelled ? 'Cancelled by common/friendly lordship' : `${relation} placement`) : 'Auspicious Rashi Disposition'),
                remedy: hasDosha && !isCancelled
                  ? 'Perform Vishnu Sahasranama chanting, offer sweets to cows on Thursdays, and cultivate mutual patience.'
                  : 'Auspicious Rashi disposition. No specific remedy required.',
              };
            }

            result = {
              ...result,
              totalPoints: rep.totalPoints ?? rep.totalScore ?? backendReport.totalScore ?? result.totalPoints,
              maxPoints: rep.maxPoints ?? rep.maxScore ?? backendReport.maxScore ?? 36,
              percentage: rep.percentage ?? (rep.summary?.percentage) ?? result.percentage,
              verdictTitle: rep.verdictTitle ?? (rep.summary?.verdictTitle) ?? result.verdictTitle,
              summary: typeof rep.summary === 'string' ? rep.summary : (rep.summary?.description ?? result.summary),
              manglik: harmonizedManglik,
              nadiDosha: harmonizedNadiDosha,
              bhakootDosha: harmonizedBhakootDosha,
              kootas: rep.kootas || result.kootas,
              ashtaKoota: rep.ashtaKoota || (result as any).ashtaKoota,
              partner1ManglikStatus: backendReport.partner1ManglikStatus || rep.manglik?.status?.partner1,
              partner2ManglikStatus: backendReport.partner2ManglikStatus || rep.manglik?.status?.partner2,
              remedies: (Array.isArray((backendReport as any).remedies) && (backendReport as any).remedies.length > 0)
                ? (backendReport as any).remedies
                : (Array.isArray(rep?.remedies) && rep.remedies.length > 0)
                ? rep.remedies
                : result.remedies,
            } as any;
          }
        } catch (apiErr) {
          console.warn('Backend API calculation fallback:', apiErr);
        }

        setMatchResult(result);
        setAiSynthesis(null);
        saveToHistoryList(result, p1, p2);

        // (AI synthesis is no longer fetched automatically in the background)

        // Smooth scroll to score hero results
        setTimeout(() => {
          const resultsEl = document.getElementById('kundli-milan-results');
          if (resultsEl) {
            resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 50);
      } catch (err) {
        console.error('Error calculating Kundli Milan:', err);
      } finally {
        setIsCalculatingMilan(false);
      }
    }, 900);

    calculationTimerRef.current = [t1, t2, t3];
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      calculationTimerRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  // Generate AI deep synthesis
  const handleGenerateAISynthesis = async (
    customResult?: AshtaKootaMilanResult | null | any,
    p1: UserProfile = partner1,
    p2: UserProfile = partner2,
    forceRefresh: boolean = false
  ) => {
    // Sanitize customResult so React SyntheticMouseEvent is never passed as matchResult
    const validResult = (customResult && typeof customResult === 'object' && 'totalPoints' in customResult)
      ? customResult
      : matchResult;

    if (!validResult || !p1.birthDate || !p2.birthDate) {
      console.warn('Cannot generate synthesis without valid matchResult and partner birthDates');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const data = await api.post<any>(API_ENDPOINTS.MATCHMAKING.SYNTHESIS, {
        partner1: p1,
        partner2: p2,
        matchResult: validResult,
        language: currentLang,
        force: forceRefresh,
      });

      if (data && (data.synthesis || data.overall_compatibility)) {
        let synth = data.synthesis || data;
        if (data.synthesisId) {
          setAiSynthesisId(data.synthesisId);
        }
        if (typeof synth === 'string') {
          try {
            synth = JSON.parse(synth);
          } catch {
            // Keep as raw string if it's pure markdown
          }
        }
        setAiSynthesis(synth);
      } else {
        throw new Error(data?.message || 'Failed to generate synthesis');
      }
    } catch (err) {
      console.error('Failed to generate Kundli Milan synthesis:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleCounselAction = (isRegenerate: boolean = false) => {
    // Both initial generation and regeneration strictly require the ₹149 subscription
    if (!isMatchmakingSubscribed) {
      setIsMatchmakingSubModalOpen(true);
      return;
    }
    handleGenerateAISynthesis(matchResult, partner1, partner2, isRegenerate);
  };



  const handleCopyAISynthesis = () => {
    if (!aiSynthesis) return;
    let textToCopy = '';
    if (typeof aiSynthesis === 'object') {
      textToCopy = `ASTROJUNCTION • RELATIONSHIP SYNTHESIS\n` +
        `Partner 1: ${partner1.fullName || 'Partner 1'} | Partner 2: ${partner2.fullName || 'Partner 2'}\n\n` +
        (aiSynthesis.overall_compatibility ? `OVERALL COMPATIBILITY:\n${renderSafeAiText(aiSynthesis.overall_compatibility)}\n\n` : '') +
        (aiSynthesis.guna_milan ? `GUNA MILAN:\n${renderSafeAiText(aiSynthesis.guna_milan)}\n\n` : '') +
        (aiSynthesis.manglik_dosha ? `MANGLIK DOSHA:\n${renderSafeAiText(aiSynthesis.manglik_dosha)}\n\n` : '') +
        (aiSynthesis.nadi_analysis ? `NADI ANALYSIS:\n${renderSafeAiText(aiSynthesis.nadi_analysis)}\n\n` : '') +
        (aiSynthesis.bhakoot_analysis ? `BHAKOOT ANALYSIS:\n${renderSafeAiText(aiSynthesis.bhakoot_analysis)}\n\n` : '') +
        (aiSynthesis.psychological_affinity ? `PSYCHOLOGICAL AFFINITY:\n${renderSafeAiText(aiSynthesis.psychological_affinity)}\n\n` : '') +
        (aiSynthesis.emotional_resonance ? `EMOTIONAL RESONANCE:\n${renderSafeAiText(aiSynthesis.emotional_resonance)}\n\n` : '') +
        (aiSynthesis.karmic_bond ? `KARMIC BOND:\n${renderSafeAiText(aiSynthesis.karmic_bond)}\n\n` : '') +
        (aiSynthesis.physical_harmonization ? `PHYSICAL HARMONIZATION:\n${renderSafeAiText(aiSynthesis.physical_harmonization)}\n\n` : '') +
        (aiSynthesis.family_and_married_life ? `FAMILY & MARRIED LIFE:\n${renderSafeAiText(aiSynthesis.family_and_married_life)}\n\n` : '') +
        (aiSynthesis.wealth_and_prosperity ? `WEALTH & PROSPERITY:\n${renderSafeAiText(aiSynthesis.wealth_and_prosperity)}\n\n` : '') +
        (Array.isArray(aiSynthesis.major_strengths) ? `MAJOR STRENGTHS:\n${aiSynthesis.major_strengths.map((s: any) => `• ${renderSafeAiText(s)}`).join('\n')}\n\n` : '') +
        (Array.isArray(aiSynthesis.major_challenges) ? `POTENTIAL CHALLENGES:\n${aiSynthesis.major_challenges.map((s: any) => `• ${renderSafeAiText(s)}`).join('\n')}\n\n` : '') +
        (Array.isArray(aiSynthesis.conflict_resolution) ? `CONFLICT RESOLUTION:\n${aiSynthesis.conflict_resolution.map((s: any) => `• ${renderSafeAiText(s)}`).join('\n')}\n\n` : '') +
        (Array.isArray(aiSynthesis.vedic_remedies) ? `VEDIC REMEDIES:\n${aiSynthesis.vedic_remedies.map((s: any) => `• ${renderSafeAiText(s)}`).join('\n')}\n\n` : '') +
        (aiSynthesis.final_assessment ? `FINAL ASSESSMENT:\n${renderSafeAiText(aiSynthesis.final_assessment)}\n` : '');
    } else {
      textToCopy = String(aiSynthesis);
    }
    navigator.clipboard.writeText(textToCopy);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadAICounselPDF = async () => {
    if (!aiSynthesis) return;
    setIsGeneratingPdf(true);

    const cleanP1 = (partner1.fullName || 'Partner1').trim().replace(/\s+/g, '_');
    const cleanP2 = (partner2.fullName || 'Partner2').trim().replace(/\s+/g, '_');
    const fileName = `Astrological_Counsel_${cleanP1}_and_${cleanP2}.pdf`;

    // Official Backend PDF Engine
    try {
      if (aiSynthesisId) {
        await api.downloadFile(API_ENDPOINTS.MATCHMAKING.AI_SYNTHESIS_PDF(aiSynthesisId), fileName);
        return;
      }
      await api.downloadFile(API_ENDPOINTS.MATCHMAKING.AI_SYNTHESIS_GENERATE_PDF, fileName, {
        method: 'POST',
        body: JSON.stringify({
          synthesisId: aiSynthesisId,
          partner1_name: partner1.fullName || 'Partner 1',
          partner2_name: partner2.fullName || 'Partner 2',
          score: matchResult?.totalPoints ?? 0,
          max_score: matchResult?.maxPoints ?? 36,
          partner1_manglik_status: (matchResult as any)?.partner1ManglikStatus,
          partner2_manglik_status: (matchResult as any)?.partner2ManglikStatus,
          synthesis: aiSynthesis,
        }),
      });
    } catch (apiErr) {
      console.error('Backend Counsel PDF endpoint error:', apiErr);
      alert('Failed to generate PDF report. Please ensure the backend server is reachable.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

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

  // Premium 2-Page Client-Side PDF Generation (direct, skipping backend plain PDF)
  const handleDownloadPDF = async () => {
    if (!matchResult) return;
    setIsGeneratingPdf(true);

    const cleanP1 = (partner1.fullName || 'Partner1').trim().replace(/\s+/g, '_');
    const cleanP2 = (partner2.fullName || 'Partner2').trim().replace(/\s+/g, '_');
    const lang = i18n.language || 'en';
    const fileName = `Kundli_Milan_${cleanP1}_and_${cleanP2}_${lang}.pdf`;

    // Official Backend PDF Engine (Unified Multi-Language Engine)
    try {
      const p1Tz = (partner1 as any).timezoneIana || 'Asia/Kolkata';
      const p2Tz = (partner2 as any).timezoneIana || 'Asia/Kolkata';

      await api.downloadFile(API_ENDPOINTS.MATCHMAKING.GENERATE_PDF, fileName, {
        method: 'POST',
        body: JSON.stringify({
          lang,
          partner1: {
            fullName: partner1.fullName || '',
            birthDate: partner1.birthDate || '',
            birthTime: partner1.birthTime || '12:00',
            birthPlace: partner1.birthPlace || '',
            latitude: partner1.latitude,
            longitude: partner1.longitude,
            timezone: p1Tz,
          },
          partner2: {
            fullName: partner2.fullName || '',
            birthDate: partner2.birthDate || '',
            birthTime: partner2.birthTime || '12:00',
            birthPlace: partner2.birthPlace || '',
            latitude: partner2.latitude,
            longitude: partner2.longitude,
            timezone: p2Tz,
          },
          matchResult,
          daivajnaSynthesis: (aiSynthesis as any)?.synthesis || (aiSynthesis as any)?.counsel || (aiSynthesis as any)?.summary || (matchResult as any)?.daivajna_synthesis || '',
          labels: {
            'kundliMilan.header.title': t('kundliMilan.title'),
            'kundliMilan.score.summary_title': t('kundliMilan.gunas_label'),
          }
        }),
      });
    } catch (apiErr) {
      console.error('Backend Kundli Milan PDF endpoint error:', apiErr);
      alert('Failed to generate PDF report. Please ensure the backend server is reachable.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Trigger browser print for certificate fallback
  const handlePrintCertificate = () => {
    handleDownloadPDF();
  };

  // Download JSON dossier
  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(matchResult, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `AstroJunction_Kundli_Milan_${partner1.fullName.replace(/\s+/g, '_')}_and_${partner2.fullName.replace(/\s+/g, '_')}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Download Text Report
  const handleDownloadTextReport = () => {
    const textContent = `===================================================================
ASTROJUNCTION • SACRED VEDIC ASHTA KOOTA MATCHMAKING DOSSIER
===================================================================
Calculated On: ${new Date(matchResult.calculatedAt).toLocaleString()}
Horoscope Tradition: Vedic Sidereal (Nirayana) & Multi-Tradition Synthesis

PARTNER 1 (Groom / Person A):
Name: ${partner1.fullName} (${partner1.gender.toUpperCase()})
Birth: ${partner1.birthDate} at ${partner1.birthTime}
Place: ${partner1.birthPlace} (Lat: ${partner1.latitude}, Long: ${partner1.longitude})

PARTNER 2 (Bride / Person B):
Name: ${partner2.fullName} (${partner2.gender.toUpperCase()})
Birth: ${partner2.birthDate} at ${partner2.birthTime}
Place: ${partner2.birthPlace} (Lat: ${partner2.latitude}, Long: ${partner2.longitude})

-------------------------------------------------------------------
MATCH SUMMARY & ASHTA KOOTA SCORE:
Total Gunas Matched: ${formatLocalizedDigits(matchResult.totalPoints, currentLang)} / 36 Points (${formatLocalizedDigits(matchResult.percentage, currentLang)}%)
Verdict: ${getLocalizedVerdict(matchResult.verdictTitle, t)}
Summary: ${matchResult.summary}

-------------------------------------------------------------------
8 KOOTAS (ASHTA KOOTA) DETAILED BREAKDOWN:
1. Varna (Work & Spiritual Ego): ${matchResult.kootas[0].obtainedPoints}/1 pt [${matchResult.kootas[0].p1Value} vs ${matchResult.kootas[0].p2Value}] - ${matchResult.kootas[0].verdict}
2. Vashya (Magnetic Dominance): ${matchResult.kootas[1].obtainedPoints}/2 pts [${matchResult.kootas[1].p1Value} vs ${matchResult.kootas[1].p2Value}] - ${matchResult.kootas[1].verdict}
3. Tara (Destiny & Longevity): ${matchResult.kootas[2].obtainedPoints}/3 pts [${matchResult.kootas[2].p1Value} vs ${matchResult.kootas[2].p2Value}] - ${matchResult.kootas[2].verdict}
4. Yoni (Physical & Intimacy): ${matchResult.kootas[3].obtainedPoints}/4 pts [${matchResult.kootas[3].p1Value} vs ${matchResult.kootas[3].p2Value}] - ${matchResult.kootas[3].verdict}
5. Graha Maitri (Mental Harmony): ${matchResult.kootas[4].obtainedPoints}/5 pts [${matchResult.kootas[4].p1Value} vs ${matchResult.kootas[4].p2Value}] - ${matchResult.kootas[4].verdict}
6. Gana (Temperament & Ego): ${matchResult.kootas[5].obtainedPoints}/6 pts [${matchResult.kootas[5].p1Value} vs ${matchResult.kootas[5].p2Value}] - ${matchResult.kootas[5].verdict}
7. Bhakoot (Emotional & Family): ${matchResult.kootas[6].obtainedPoints}/7 pts [${matchResult.kootas[6].p1Value} vs ${matchResult.kootas[6].p2Value}] - ${matchResult.kootas[6].verdict}
8. Nadi (Genetic & Progeny): ${matchResult.kootas[7].obtainedPoints}/8 pts [${matchResult.kootas[7].p1Value} vs ${matchResult.kootas[7].p2Value}] - ${matchResult.kootas[7].verdict}

-------------------------------------------------------------------
DOSHA ASSESSMENT:
Manglik (Kuja) Dosha: ${matchResult.manglik.verdict}
- ${partner1.fullName}: ${matchResult.manglik.partner1.severity} (${matchResult.manglik.partner1.cancellation})
- ${partner2.fullName}: ${matchResult.manglik.partner2.severity} (${matchResult.manglik.partner2.cancellation})
Explanation: ${matchResult.manglik.explanation}

Nadi Dosha: ${matchResult.nadiDosha?.hasDosha ? (matchResult.nadiDosha?.isCancelled ? 'Cancelled (Parihara)' : 'Active') : 'No Dosha'} (${matchResult.nadiDosha?.reason || ''})
Bhakoot Dosha: ${matchResult.bhakootDosha?.hasDosha ? (matchResult.bhakootDosha?.isCancelled ? 'Cancelled (Parihara)' : 'Active') : 'Harmonious'} (${matchResult.bhakootDosha?.reason || ''})

-------------------------------------------------------------------
NUMEROLOGY & ELEMENTAL SYNERGY:
Numerology Mulanks: ${matchResult.numerologyMilan.partner1Mulank} & ${matchResult.numerologyMilan.partner2Mulank} (Harmony Score: ${matchResult.numerologyMilan.harmonyScore}%)
Elemental Balance: ${matchResult.elementalBalance.synergy} (Score: ${matchResult.elementalBalance.score}%)

-------------------------------------------------------------------
AUSPICIOUS REMEDIES & UPAYAS:
${matchResult.remedies.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Auspicious Muhurat Guidance:
${getLocalizedMuhuratAdvice(matchResult.auspiciousMuhuratAdvice, partner1.fullName, partner2.fullName, currentLang, t)}

===================================================================
Issued by AstroJunction Daivajna Astrological Intelligence Engine
===================================================================`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Kundli_Milan_Report_${partner1.fullName}_and_${partner2.fullName}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyReport = () => {
    const summary = `${getLocalizedVerdict(matchResult.verdictTitle, t)} - ${formatLocalizedDigits(matchResult.totalPoints, currentLang)}/36 Gunas Matched (${formatLocalizedDigits(matchResult.percentage, currentLang)}%) between ${partner1.fullName} and ${partner2.fullName}. ${matchResult.summary}`;
    navigator.clipboard.writeText(summary);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  // Get score color
  const getScoreColor = (points: number, max: number) => {
    return 'text-[#C9A050] bg-[#C9A050]/15 border-[#C9A050]/30';
  };

  return (
    <div className="space-y-8 animate-fadeIn w-full">
      {/* Header Banner */}
      <div className={`${
        theme === 'dark' 
          ? 'bg-[#141418] border-[#2A2A2E]' 
          : 'bg-white border-[#E5E1D8] shadow-sm'
      } border rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A050]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#C9A050]/20 to-transparent border border-[#C9A050]/30 text-[#C9A050] text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3 backdrop-blur-md shadow-[0_0_15px_rgba(201,160,80,0.15)]">
              <HeartHandshake className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C9A050]" />
              <span>{t('kundliMilan.eyebrow')}</span>
            </div>
            <h1 className="astro-page-header-title">
              {t("kundliMilan.title")}
            </h1>
            <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} mt-2.5 max-w-2xl leading-relaxed`}>
              {t("kundliMilan.subtitle")}
            </p>
          </div>

          {/* Action Row: Saved Matches History, New Match, Direct PDF Download */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto shrink-0">
            {/* Saved Matches History Button */}
            <button
              type="button"
              onClick={() => setIsHistoryModalOpen(true)}
              className={`flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition cursor-pointer w-full sm:w-auto ${
                theme === 'dark'
                  ? 'bg-[#1A1A1E] border-[#2A2A2E] text-[#E5E1D8] hover:border-[#C9A050]/50 hover:bg-[#222228]'
                  : 'bg-[#F9F7F1] border-[#E5E1D8] text-[#2A2A2E] hover:border-[#C9A050] hover:bg-[#F0ECE1]'
              }`}
              title={t("kundliMilan.saved_matches_btn")}
            >
              <FileText className="w-4 h-4 text-[#C9A050]" />
              <span>{t("kundliMilan.saved_matches_btn")}</span>
              {savedMatches.length > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-[#C9A050]/20 text-[#C9A050]">
                  {savedMatches.length}
                </span>
              )}
            </button>

            {/* {t('kundliMilan.save_match')} Button */}
            {matchResult && (
              <button
                type="button"
                onClick={handleSaveMatchReport}
                disabled={saveState === 'saving'}
                className={`flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition cursor-pointer w-full sm:w-auto ${
                  saveState === 'saved'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                    : saveState === 'error'
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                    : theme === 'dark'
                    ? 'bg-[#1A1A1E] border-[#2A2A2E] text-[#E5E1D8] hover:border-[#C9A050]/50 hover:bg-[#222228]'
                    : 'bg-[#F9F7F1] border-[#E5E1D8] text-[#2A2A2E] hover:border-[#C9A050] hover:bg-[#F0ECE1]'
                }`}
                title={t("kundliMilan.save_match")}
              >
                {saveState === 'saving' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#C9A050]" />
                ) : saveState === 'saved' ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Bookmark className="w-4 h-4 text-[#C9A050]" />
                )}
                <span>
                  {saveState === 'saved'
                    ? t('kundliMilan.saved')
                    : saveState === 'saving'
                    ? t('kundliMilan.downloading')
                    : saveState === 'error'
                    ? 'Save Error'
                    : t('kundliMilan.save_match')}
                </span>
              </button>
            )}

            {/* Quick Action: Direct 1-Page PDF Download */}
            <button
              type="button"
              onClick={() => {
                if (isGeneratingPdf) return;
                if (!matchResult) {
                  if (partner1.birthDate && partner2.birthDate) {
                    triggerMilanCalculation(partner1, partner2);
                  } else {
                    const p1El = document.getElementById('partner-card-1');
                    p1El?.scrollIntoView({ behavior: 'smooth' });
                  }
                  return;
                }
                handleDownloadPDF();
              }}
              disabled={isGeneratingPdf}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border text-xs font-bold transition shadow-lg cursor-pointer w-full sm:w-auto ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-[#C9A050] to-[#A07828] hover:from-[#D4AF37] hover:to-[#B38730] text-[#0D0D0F] border-[#C9A050] shadow-[#C9A050]/20'
                  : 'bg-[#C9A050] hover:bg-[#B38730] text-white border-[#C9A050] shadow-[#C9A050]/20'
              } disabled:opacity-50`}
              title={t("kundliMilan.download_pdf")}
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{isGeneratingPdf ? 'Generating PDF...' : t('kundliMilan.download_pdf')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Partner 1 & Partner 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Partner 1 Card */}
        <div id="partner-card-1" className={`rounded-2xl p-6 sm:p-8 shadow-sm border ${
          theme === 'dark' 
            ? 'bg-[#141418] border-[#2A2A2E]' 
            : 'bg-white border-[#E5E1D8] shadow-sm'
        } relative flex flex-col justify-between`}>
          <div>
            <div className={`flex items-center justify-between mb-5 pb-3.5 border-b ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm border matchmaking-avatar-a shadow-sm">
                  A
                </div>
                <div>
                  <h3 className={`text-base sm:text-lg font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                    {t('kundliMilan.partner1_title')}
                  </h3>
                </div>
              </div>

              {isP1Saved && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#C9A050]/20 text-[#C9A050] border border-[#C9A050]/40 shadow-sm">
                  <Check className="w-3.5 h-3.5 text-[#C9A050] stroke-[2.5]" />
                  <span>{t("kundliMilan.saved")}</span>
                </span>
              )}
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className={`block mb-1.5 text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>{t("kundliMilan.full_name")}</label>
                <input
                  type="text"
                  disabled={isP1Saved}
                  placeholder={t("kundliMilan.p1_name_placeholder")}
                  value={partner1.fullName}
                  onChange={(e) => setPartner1({ ...partner1, fullName: e.target.value })}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm border outline-none transition ${
                    theme === 'dark'
                      ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8] placeholder:text-gray-600 focus:border-[#C9A050]'
                      : 'bg-white border-[#E5E1D8] text-[#0D0D0F] placeholder:text-[#9E9A90] focus:border-[#C9A050] focus:ring-1 focus:ring-[#C9A050]/20'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                />
              </div>

              {/* Birth Date & Time Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Birth Date */}
                <div>
                  <label className={`block mb-1.5 text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>{t("kundliMilan.date_of_birth")}</label>
                  <VedicDatePicker
                    value={partner1.birthDate}
                    onChange={(newDate) => setPartner1({ ...partner1, birthDate: newDate })}
                    disabled={isP1Saved}
                    theme={theme}
                    placeholder="DD-MM-YYYY"
                  />
                </div>

                {/* Birth Time */}
                <div>
                  <label className={`block mb-1.5 text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>{t("kundliMilan.birth_time")}</label>
                  <VedicTimePicker
                    value={partner1.birthTime}
                    onChange={(newTime) => setPartner1({ ...partner1, birthTime: newTime })}
                    disabled={isP1Saved}
                    theme={theme}
                    placeholder="HH:MM"
                  />
                </div>
              </div>

              {/* Birth City */}
              <div>
                <label className={`block mb-1.5 text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>{t("kundliMilan.birth_city")}</label>
                <input
                  type="text"
                  disabled={isP1Saved}
                  placeholder={t("kundliMilan.city_placeholder")}
                  value={partner1.birthPlace}
                  onChange={(e) => setPartner1({ ...partner1, birthPlace: e.target.value })}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm border outline-none transition ${
                    theme === 'dark'
                      ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8] placeholder:text-gray-600 focus:border-[#C9A050]'
                      : 'bg-white border-[#E5E1D8] text-[#0D0D0F] placeholder:text-[#9E9A90] focus:border-[#C9A050]'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                />
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className={`pt-4 flex items-center justify-end border-t ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'} mt-6`}>
            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={() => setIsP1Saved(false)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition shadow-sm cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-[#1A1A1E] border-[#2A2A2E] text-[#E5E1D8] hover:text-white'
                    : 'bg-[#F9F7F1] border-[#E5E1D8] text-[#2A2A2E] hover:bg-[#F0ECE1]'
                }`}
              >
                {t("kundliMilan.edit")}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (partner1.birthDate) {
                    setIsP1Saved(true);
                  }
                }}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center ${
                  isP1Saved
                    ? 'bg-[#C9A050] text-[#0D0D0F] border border-[#A67C28] shadow-[#C9A050]/25'
                    : 'bg-[#C9A050] hover:bg-[#D4AF37] text-[#0D0D0F] shadow-[#C9A050]/20 hover:scale-[1.02]'
                }`}
              >
                <span>{isP1Saved ? t("kundliMilan.saved") : t("kundliMilan.save")}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Partner 2 Card */}
        <div id="partner-card-2" className={`rounded-2xl p-6 sm:p-8 shadow-sm border ${
          theme === 'dark' 
            ? 'bg-[#141418] border-[#2A2A2E]' 
            : 'bg-white border-[#E5E1D8] shadow-sm'
        } relative flex flex-col justify-between`}>
          <div>
            <div className={`flex items-center justify-between mb-5 pb-3.5 border-b ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm border matchmaking-avatar-b shadow-sm">
                  B
                </div>
                <div>
                  <h3 className={`text-base sm:text-lg font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                    {t('kundliMilan.partner2_title')}
                  </h3>
                </div>
              </div>

              {isP2Saved && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#C9A050]/20 text-[#C9A050] border border-[#C9A050]/40 shadow-sm">
                  <Check className="w-3.5 h-3.5 text-[#C9A050] stroke-[2.5]" />
                  <span>{t("kundliMilan.saved")}</span>
                </span>
              )}
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className={`block mb-1.5 text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>{t("kundliMilan.full_name")}</label>
                <input
                  type="text"
                  disabled={isP2Saved}
                  placeholder={t("kundliMilan.p2_name_placeholder")}
                  value={partner2.fullName}
                  onChange={(e) => setPartner2({ ...partner2, fullName: e.target.value })}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm border outline-none transition ${
                    theme === 'dark'
                      ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8] placeholder:text-gray-600 focus:border-[#C9A050]'
                      : 'bg-white border-[#E5E1D8] text-[#0D0D0F] placeholder:text-[#9E9A90] focus:border-[#C9A050]'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                />
              </div>

              {/* Birth Date & Time Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Birth Date */}
                <div>
                  <label className={`block mb-1.5 text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>{t("kundliMilan.date_of_birth")}</label>
                  <VedicDatePicker
                    value={partner2.birthDate}
                    onChange={(newDate) => setPartner2({ ...partner2, birthDate: newDate })}
                    disabled={isP2Saved}
                    theme={theme}
                    placeholder="DD-MM-YYYY"
                  />
                </div>

                {/* Birth Time */}
                <div>
                  <label className={`block mb-1.5 text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>{t("kundliMilan.birth_time")}</label>
                  <VedicTimePicker
                    value={partner2.birthTime}
                    onChange={(newTime) => setPartner2({ ...partner2, birthTime: newTime })}
                    disabled={isP2Saved}
                    theme={theme}
                    placeholder="HH:MM"
                  />
                </div>
              </div>

              {/* Birth City */}
              <div>
                <label className={`block mb-1.5 text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>{t("kundliMilan.birth_city")}</label>
                <input
                  type="text"
                  disabled={isP2Saved}
                  placeholder={t("kundliMilan.city_placeholder")}
                  value={partner2.birthPlace}
                  onChange={(e) => setPartner2({ ...partner2, birthPlace: e.target.value })}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm border outline-none transition ${
                    theme === 'dark'
                      ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8] placeholder:text-gray-600 focus:border-[#C9A050]'
                      : 'bg-white border-[#E5E1D8] text-[#0D0D0F] placeholder:text-[#9E9A90] focus:border-[#C9A050]'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                />
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className={`pt-4 flex items-center justify-end border-t ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'} mt-6`}>
            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={() => setIsP2Saved(false)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition shadow-sm cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-[#1A1A1E] border-[#2A2A2E] text-[#E5E1D8] hover:text-white'
                    : 'bg-[#F9F7F1] border-[#E5E1D8] text-[#2A2A2E] hover:bg-[#F0ECE1]'
                }`}
              >
                {t("kundliMilan.edit")}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (partner2.birthDate) {
                    setIsP2Saved(true);
                  }
                }}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center ${
                  isP2Saved
                    ? 'bg-[#C9A050] text-[#0D0D0F] border border-[#A67C28] shadow-[#C9A050]/25'
                    : 'bg-[#C9A050] hover:bg-[#D4AF37] text-[#0D0D0F] shadow-[#C9A050]/20 hover:scale-[1.02]'
                }`}
              >
                <span>{isP2Saved ? t("kundliMilan.saved") : t("kundliMilan.save")}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right-Aligned Generate Action Button */}
      {partner1.birthDate && partner2.birthDate && isP1Saved && isP2Saved && (
        <div id="generate-milan-section" className="flex justify-end my-4 animate-fadeIn">
          <button
            type="button"
            onClick={() => triggerMilanCalculation(partner1, partner2)}
            disabled={isCalculatingMilan}
            className={`px-8 py-3.5 rounded-2xl font-serif font-bold text-sm sm:text-base tracking-wide shadow-xl transition-all duration-300 flex items-center space-x-2.5 cursor-pointer hover:scale-105 active:scale-95 ${
              isCalculatingMilan
                ? 'bg-[#C9A050]/60 text-[#0D0D0F] cursor-wait opacity-80'
                : 'bg-gradient-to-r from-[#C9A050] via-[#D4AF37] to-[#8C6B28] hover:from-[#D4AF37] hover:to-[#C9A050] text-[#0D0D0F] shadow-[#C9A050]/30 border border-[#B38730]'
            }`}
          >
            <Sparkles className={`w-5 h-5 text-[#0D0D0F] ${isCalculatingMilan ? 'animate-spin' : ''}`} />
            <span>
              {isCalculatingMilan
                ? t('kundliMilan.counsel.synthesizing_title', { defaultValue: 'Synthesizing Celestial Mansions...' })
                : t('kundliMilan.generate')}
            </span>
          </button>
        </div>
      )}

      {/* Full-Page Cosmic Astrological Loader Overlay */}
      <AnimatePresence>
        {isCalculatingMilan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`w-full max-w-lg ${
                theme === 'dark'
                  ? 'bg-gradient-to-b from-[#18181D] via-[#121215] to-[#0D0D0F] border-[#C9A050]/50 shadow-[0_0_50px_rgba(201,160,80,0.25)]'
                  : 'bg-white border-[#E5E1D8] shadow-2xl'
              } border rounded-3xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden`}
            >
              {/* Ambient Gold Halo Glow */}
              <div className="absolute inset-0 bg-radial from-[#C9A050]/20 via-transparent to-transparent pointer-events-none" />

              {/* Sacred Rotating Yantra / Chakra Animation */}
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 mx-auto flex items-center justify-center">
                {/* Outer dashed spinning celestial ring */}
                <div
                  className="absolute inset-0 rounded-full border-2 border-dashed border-[#C9A050]/60 animate-[spin_8s_linear_infinite]"
                />
                {/* Middle counter-spinning ring */}
                <div
                  className="absolute inset-2 rounded-full border-2 border-t-[#C9A050] border-r-[#C9A050]/40 border-b-transparent border-l-transparent animate-[spin_3s_linear_infinite_reverse]"
                />
                {/* Inner glowing core with sparkles */}
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${
                    theme === 'dark'
                      ? 'bg-gradient-to-br from-[#C9A050]/30 to-[#C9A050]/10 border-[#C9A050]/60 text-[#C9A050]'
                      : 'bg-[#F9F7F1] border-[#C9A050]/50 text-[#C9A050]'
                  } border flex items-center justify-center shadow-xl shadow-[#C9A050]/30 animate-pulse`}
                >
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-[#C9A050]" />
                </div>
              </div>

              {/* Dynamic Step Text */}
              <div className="space-y-2 relative z-10">
                <h3
                  className={`text-lg sm:text-xl font-serif font-bold ${
                    theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'
                  } tracking-wide min-h-[32px] transition-all`}
                >
                  {loadingStep === 0 && t("kundliMilan.loader_step_0")}
                    {loadingStep === 1 && t("kundliMilan.loader_step_1")}
                    {loadingStep === 2 && t("kundliMilan.loader_step_2")}
                </h3>
                <p className="text-xs sm:text-sm text-[#C9A050] font-semibold tracking-widest uppercase">
                  {t('kundliMilan.in_progress', { pct: formatLocalizedDigits(loadingStep === 0 ? 33 : loadingStep === 1 ? 66 : 99, currentLang) })}
                </p>
              </div>

              {/* Shimmering Progress Bar */}
              <div
                className={`max-w-md mx-auto w-full ${
                  theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
                } border h-3 rounded-full overflow-hidden p-0.5 shadow-inner`}
              >
                <div
                  className="h-full bg-gradient-to-r from-[#C9A050] via-[#F3E5AB] to-[#C9A050] rounded-full transition-all duration-700 ease-out shadow-sm shadow-[#C9A050]"
                  style={{ width: loadingStep === 0 ? '35%' : loadingStep === 1 ? '70%' : '100%' }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Section (Calculated when matchResult is available) */}
      {matchResult && !isCalculatingMilan && (
        <>
          <div id="kundli-milan-results" className="space-y-8 animate-fadeIn">
      {/* Main Score Hero Card */}
      <div className={`${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-[#1A1A1E] via-[#141418] to-[#0D0D0F] border-[#C9A050]/40' 
          : 'bg-white border-[#E5E1D8] shadow-sm'
      } border rounded-3xl p-6 sm:p-8 lg:p-10 relative overflow-hidden`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
          {/* Left: Overall Guna Gauge */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  className="matchmaking-circle-track"
                  strokeWidth="10"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="url(#gunaGradient)"
                  strokeWidth="10"
                  strokeDasharray={314}
                  strokeDashoffset={314 - (314 * matchResult.percentage) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="gunaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C9A050" />
                    <stop offset="100%" stopColor="#E8D5B5" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className={`text-3xl sm:text-4xl font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                  {formatLocalizedDigits(matchResult.totalPoints, currentLang)}
                </span>
                <span className="text-[10px] sm:text-xs text-[#C9A050] font-bold tracking-wider uppercase">/ {formatLocalizedDigits(36, currentLang)} {t("kundliMilan.gunas_label")}</span>
                <span className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} font-sans font-semibold`}>{formatLocalizedDigits(matchResult.percentage, currentLang)}%</span>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                <span className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#C9A050]/20 text-[#C9A050] border border-[#C9A050]/40 shadow-sm">
                  <Award className="w-3.5 h-3.5" />
                  <span>{getLocalizedVerdict(matchResult.verdictTitle || (typeof matchResult.summary === 'object' ? (matchResult.summary as any)?.verdictTitle : null) || 'Kundli Milan', t)}</span>
                </span>
                {isAutoRefreshing ? (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600 dark:text-amber-400" />
                    <span>{t("kundliMilan.auto_refreshing", { defaultValue: "Auto-refreshing..." })}</span>
                  </span>
                ) : lastAutoRefreshedAt ? (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{t("kundliMilan.live_auto_updated", { defaultValue: "Live Auto-Updated" })}</span>
                  </span>
                ) : null}
              </div>
              <h2 className={`text-xl sm:text-2xl lg:text-3xl font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                {partner1.fullName || 'Partner 1'} &amp; {partner2.fullName || 'Partner 2'}
              </h2>
              <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} mt-2.5 max-w-xl leading-relaxed`}>
                {t("kundliMilan.summary_sentence", { score: formatLocalizedDigits(matchResult.totalPoints, currentLang), pct: formatLocalizedDigits(matchResult.percentage, currentLang) })}
              </p>
            </div>
          </div>

          {/* Right: Key Compatibility Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            <div className={`p-4 sm:p-5 rounded-xl border text-center ${
              theme === 'dark' ? 'bg-[#0D0D0F]/80 border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8] shadow-sm'
            }`}>
              <div className="flex items-center justify-center text-[#C9A050] mb-1.5">
                <Flame className="w-4 h-4" />
              </div>
              <span className={`text-[10px] sm:text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#9E9A90]'} font-semibold uppercase tracking-wider block`}>{t("kundliMilan.manglik_tile")}</span>
              <span className={`text-xs sm:text-sm font-bold ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'} mt-1 block`}>
                {getLocalizedStatus(matchResult.manglik?.isNeutralized ? "Neutralized ✓" : (matchResult.manglik?.partner1?.isManglik || matchResult.manglik?.partner2?.isManglik ? "Active" : "No Dosha"), t)}
              </span>
            </div>

            <div className={`p-4 sm:p-5 rounded-xl border text-center ${
              theme === 'dark' ? 'bg-[#0D0D0F]/80 border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8] shadow-sm'
            }`}>
              <div className="flex items-center justify-center text-[#C9A050] mb-1.5">
                <Dna className="w-4 h-4" />
              </div>
              <span className={`text-[10px] sm:text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#9E9A90]'} font-semibold uppercase tracking-wider block`}>{t("kundliMilan.nadi_tile")}</span>
              <span className={`text-xs sm:text-sm font-bold ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'} mt-1 block`}>
                {t("kundliMilan.points_out_of", { obtained: formatLocalizedDigits(matchResult.kootas?.find((k) => k.id === "nadi")?.obtainedPoints ?? 0, currentLang), max: formatLocalizedDigits(8, currentLang) })}
              </span>
            </div>

            <div className={`p-4 sm:p-5 rounded-xl border text-center ${
              theme === 'dark' ? 'bg-[#0D0D0F]/80 border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8] shadow-sm'
            }`}>
              <div className="flex items-center justify-center text-[#C9A050] mb-1.5">
                <Heart className="w-4 h-4" />
              </div>
              <span className={`text-[10px] sm:text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#9E9A90]'} font-semibold uppercase tracking-wider block`}>{t("kundliMilan.bhakoot_tile")}</span>
              <span className={`text-xs sm:text-sm font-bold ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'} mt-1 block`}>
                {t("kundliMilan.points_out_of", { obtained: formatLocalizedDigits(matchResult.kootas?.find((k) => k.id === "bhakoot")?.obtainedPoints ?? 0, currentLang), max: formatLocalizedDigits(7, currentLang) })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className={`flex flex-nowrap overflow-x-auto scrollbar-none items-center justify-start sm:justify-center gap-1 sm:gap-1.5 border-b ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'} pb-3`}>
        <button
          onClick={() => setActiveTab('kootas')}
          className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-[10px] sm:text-xs font-semibold whitespace-nowrap shrink-0 transition cursor-pointer ${
            activeTab === 'kootas'
              ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/20 font-bold'
              : theme === 'dark'
              ? 'bg-[#141418] text-[#9E9A90] hover:text-[#E5E1D8] border border-[#2A2A2E]'
              : 'bg-[#F9F7F1] text-[#544B3D] hover:text-[#0D0D0F] hover:bg-[#F0ECE1] border border-[#E5E1D8]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{t("kundliMilan.tab_kootas", { score: formatLocalizedDigits(matchResult.totalPoints, currentLang) })}</span>
        </button>

        <button
          onClick={() => setActiveTab('doshas')}
          className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-[10px] sm:text-xs font-semibold whitespace-nowrap shrink-0 transition cursor-pointer ${
            activeTab === 'doshas'
              ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/20 font-bold'
              : theme === 'dark'
              ? 'bg-[#141418] text-[#9E9A90] hover:text-[#E5E1D8] border border-[#2A2A2E]'
              : 'bg-[#F9F7F1] text-[#544B3D] hover:text-[#0D0D0F] hover:bg-[#F0ECE1] border border-[#E5E1D8]'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>{t("kundliMilan.tab_doshas")}</span>
        </button>

        <button
          onClick={() => setActiveTab('synastry')}
          className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-[10px] sm:text-xs font-semibold whitespace-nowrap shrink-0 transition cursor-pointer ${
            activeTab === 'synastry'
              ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/20 font-bold'
              : theme === 'dark'
              ? 'bg-[#141418] text-[#9E9A90] hover:text-[#E5E1D8] border border-[#2A2A2E]'
              : 'bg-[#F9F7F1] text-[#544B3D] hover:text-[#0D0D0F] hover:bg-[#F0ECE1] border border-[#E5E1D8]'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>{t("kundliMilan.tab_synastry")}</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_counsel')}
          className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-[10px] sm:text-xs font-bold whitespace-nowrap shrink-0 transition-all duration-200 cursor-pointer border-2 shadow-sm ${
            activeTab === 'ai_counsel'
              ? 'bg-gradient-to-r from-[#C9A050] to-[#B38730] text-[#0D0D0F] border-[#C9A050] shadow-md shadow-[#C9A050]/30 font-bold'
              : theme === 'dark'
              ? 'bg-[#1A1812] text-[#E8C470] border-[#C9A050] hover:bg-[#252117]'
              : 'bg-[#FFFDF7] text-[#8C6218] border-[#C9A050] hover:bg-[#FAF4E4]'
          }`}
        >
          <Sparkles
            className={`w-4 h-4 shrink-0 ${
              activeTab === 'ai_counsel' ? 'text-[#0D0D0F]' : 'text-[#C9A050]'
            }`}
          />
          <span>{t("kundliMilan.tab_counsel")}</span>
          <span
            className={`text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider ml-1 shadow-xs ${
              activeTab === 'ai_counsel'
                ? 'bg-[#0D0D0F] text-[#C9A050]'
                : 'bg-[#8C6218] text-white'
            }`}
          >
            {t('kundliMilan.counsel.featured_badge', { defaultValue: 'FEATURED' })}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('remedies')}
          className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-[10px] sm:text-xs font-semibold whitespace-nowrap shrink-0 transition cursor-pointer ${
            activeTab === 'remedies'
              ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/20 font-bold'
              : theme === 'dark'
              ? 'bg-[#141418] text-[#9E9A90] hover:text-[#E5E1D8] border border-[#2A2A2E]'
              : 'bg-[#F9F7F1] text-[#544B3D] hover:text-[#0D0D0F] hover:bg-[#F0ECE1] border border-[#E5E1D8]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{t("kundliMilan.tab_remedies")}</span>
        </button>
      </div>

      {/* Tab 1: 8 Kootas Detailed Breakdown Table & Cards */}
      {activeTab === 'kootas' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className={`text-lg sm:text-xl font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
              {t("kundliMilan.matrix_title")}
            </h3>
            <span className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>
              {t("kundliMilan.score_max", { score: formatLocalizedDigits(matchResult.totalPoints, currentLang) })}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {matchResult.kootas.map((koota, index) => {
              const isExpanded = expandedKoota === koota.id;
              const badgeClass = getScoreColor(koota.obtainedPoints, koota.maxPoints);

              return (
                <div
                  key={koota.id}
                  className={`${
                    theme === 'dark'
                      ? 'bg-[#141418] border-[#2A2A2E] hover:border-[#C9A050]/40'
                      : 'bg-white border-[#E5E1D8] hover:border-[#C9A050] shadow-sm'
                  } border rounded-2xl p-5 sm:p-6 transition`}
                >
                  <div
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                    onClick={() => setExpandedKoota(isExpanded ? null : koota.id)}
                  >
                    <div className="flex items-start sm:items-center space-x-4">
                      <div className={`w-9 h-9 rounded-xl ${
                        theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
                      } border flex items-center justify-center font-bold text-xs sm:text-sm text-[#C9A050] shrink-0`}>
                        0{index + 1}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className={`text-base sm:text-lg font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                            {getLocalizedKootaName(koota.id, koota.name, currentLang, t)}
                          </h4>
                          <span className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#9E9A90]'} italic`}>({koota.sanskritName})</span>
                        </div>
                        <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} mt-0.5`}>{getLocalizedKootaArea(koota.id, koota.area, t)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Values Comparison Pill */}
                      <div className={`hidden md:flex items-center space-x-2 text-xs px-3.5 py-1.5 rounded-xl border ${
                        theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E] text-[#9E9A90]' : 'bg-[#F9F7F1] border-[#E5E1D8] text-[#544B3D]'
                      }`}>
                        <span className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}>{partner1.fullName.split(' ')[0]}: <strong className="text-[#C9A050]">{getLocalizedKootaValue(koota.id, koota.p1Value, currentLang, t)}</strong></span>
                        <span>↔</span>
                        <span className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}>{partner2.fullName.split(' ')[0]}: <strong className="text-[#C9A050]">{getLocalizedKootaValue(koota.id, koota.p2Value, currentLang, t)}</strong></span>
                      </div>

                      {/* Points Badge */}
                      <div className={`px-3.5 py-1 rounded-full text-xs font-bold border ${badgeClass}`}>
                        {t("kundliMilan.points_short", { got: formatLocalizedDigits(koota.obtainedPoints, currentLang), max: formatLocalizedDigits(koota.maxPoints, currentLang) })}
                      </div>

                      {isExpanded ? (
                        <ChevronUp className={`w-4 h-4 ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#9E9A90]'}`} />
                      ) : (
                        <ChevronDown className={`w-4 h-4 ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#9E9A90]'}`} />
                      )}
                    </div>
                  </div>

                  {/* Expanded Explanation */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`mt-4 pt-4 border-t ${
                          theme === 'dark' ? 'border-[#2A2A2E] text-[#E5E1D8]' : 'border-[#E5E1D8] text-[#2A2A2E]'
                        } text-xs sm:text-sm space-y-2.5 leading-relaxed`}
                      >
                        <p className={theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}>{getLocalizedKootaDescription(koota.id, koota.description, t)}</p>
                        <div className={`p-3.5 sm:p-4 rounded-xl border flex items-start space-x-2.5 ${
                          theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
                        }`}>
                          <Info className="w-4 h-4 text-[#C9A050] shrink-0 mt-0.5" />
                          <div>
                            <span className={`font-semibold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>{t("kundliMilan.verdict_details")} </span>
                            <span>{getLocalizedVerdict(koota.details, t, currentLang)}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Manglik & Critical Doshas */}
      {activeTab === 'doshas' && (
        <div className="space-y-6">
          {/* Manglik Analysis Card */}
          <div className={`${
            theme === 'dark' 
              ? 'bg-[#141418] border-[#2A2A2E]' 
              : 'bg-white border-[#E5E1D8] shadow-sm'
          } border rounded-2xl p-6 sm:p-8`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/30">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-lg sm:text-xl font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                  {t("kundliMilan.doshas.manglik_assessment")}
                </h3>
                <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>{t("kundliMilan.doshas.mars_placement_rule")}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
              {/* Partner 1 Manglik */}
              <div className={`p-4 sm:p-5 rounded-xl border ${
                theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
              }`}>
                <span className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#9E9A90]'} font-semibold uppercase tracking-wider block mb-1.5`}>
                  {partner1.fullName} ({t("kundliMilan.partner_a", { defaultValue: "Partner A" })})
                </span>
                <div className="flex items-center justify-between">
                  <span className={`text-xs sm:text-sm font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                    {matchResult.manglik?.partner1?.isManglik ? `${t('kundliMilan.doshas.manglik_active', { defaultValue: 'Manglik' })} (${getLocalizedSeverity(matchResult.manglik?.partner1?.severity || 'Active', t)})` : t('kundliMilan.status.non_manglik', { defaultValue: 'Non-Manglik' })}
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-lg border font-semibold ${
                    theme === 'dark' ? 'bg-[#1A1A1E] text-[#9E9A90] border-[#2A2A2E]' : 'bg-white text-[#544B3D] border-[#E5E1D8]'
                  }`}>
                    {t("kundliMilan.doshas.house_label", { house: formatLocalizedDigits(matchResult.manglik?.partner1?.marsHouse || "-", currentLang) })}
                  </span>
                </div>
                <p className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} mt-2.5`}>
                  {t("kundliMilan.status_label", { defaultValue: "Status" })}: <strong className="text-[#C9A050] font-semibold">{getLocalizedStatus(matchResult.manglik?.partner1?.cancellation || "Standard Evaluation", t)}</strong>
                </p>
              </div>

              {/* Partner 2 Manglik */}
              <div className={`p-4 sm:p-5 rounded-xl border ${
                theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
              }`}>
                <span className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#9E9A90]'} font-semibold uppercase tracking-wider block mb-1.5`}>
                  {partner2.fullName} ({t("kundliMilan.partner_b", { defaultValue: "Partner B" })})
                </span>
                <div className="flex items-center justify-between">
                  <span className={`text-xs sm:text-sm font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                    {matchResult.manglik?.partner2?.isManglik ? `${t('kundliMilan.doshas.manglik_active', { defaultValue: 'Manglik' })} (${getLocalizedSeverity(matchResult.manglik?.partner2?.severity || 'Active', t)})` : t('kundliMilan.status.non_manglik', { defaultValue: 'Non-Manglik' })}
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-lg border font-semibold ${
                    theme === 'dark' ? 'bg-[#1A1A1E] text-[#9E9A90] border-[#2A2A2E]' : 'bg-white text-[#544B3D] border-[#E5E1D8]'
                  }`}>
                    {t("kundliMilan.doshas.house_label", { house: formatLocalizedDigits(matchResult.manglik?.partner2?.marsHouse || "-", currentLang) })}
                  </span>
                </div>
                <p className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} mt-2.5`}>
                  {t("kundliMilan.status_label", { defaultValue: "Status" })}: <strong className="text-[#C9A050] font-semibold">{getLocalizedStatus(matchResult.manglik?.partner2?.cancellation || "Standard Evaluation", t)}</strong>
                </p>
              </div>
            </div>

            <div className={`p-4 sm:p-5 rounded-xl border text-xs sm:text-sm leading-relaxed ${
              matchResult.manglik?.isNeutralized
                ? theme === 'light'
                  ? 'bg-[#F9F7F1] border-[#C9A050]/40 text-[#2A2A2E]'
                  : 'bg-[#1C1A14] border-[#C9A050]/50 text-[#E8C470]'
                : theme === 'light'
                  ? 'bg-[#FFF8F6] border-rose-300 text-rose-800'
                  : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
            }`}>
              <div className={`font-bold text-sm sm:text-base mb-1.5 ${theme === 'light' ? 'text-[#C9A050]' : 'text-[#E8C470]'}`}>
                {getLocalizedStatus(matchResult.manglik?.verdict || "Manglik Analysis", t)}
              </div>
              <p className={`${theme === 'light' ? 'text-[#544B3D]' : 'text-[#9E9A90]'} astro-prose-justified`}>
                {getLocalizedManglikExplanation(matchResult.manglik?.explanation, currentLang, t)}
              </p>
            </div>
          </div>

          {/* Nadi & Bhakoot Dosha Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nadi Dosha */}
            <div className={`${
              theme === 'dark' 
                ? 'bg-[#141418] border-[#2A2A2E]' 
                : 'bg-white border-[#E5E1D8] shadow-sm'
            } border rounded-2xl p-6 sm:p-8`}>
              <div className="flex items-center space-x-3 mb-3.5">
                <Dna className="w-5 h-5 text-[#C9A050]" />
                <h4 className={`text-base sm:text-lg font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>{t("kundliMilan.doshas.nadi_exam")}</h4>
              </div>
              <div className={`space-y-2.5 text-xs sm:text-sm ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>
                <div className="flex justify-between">
                  <span>{partner1.fullName.split(' ')[0]} {t('kundliMilan.nadi_label', { defaultValue: 'Nadi' })}:</span>
                  <strong className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}>{getLocalizedNadi(matchResult.nadiDosha?.partner1Nadi, currentLang, t)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>{partner2.fullName.split(' ')[0]} {t('kundliMilan.nadi_label', { defaultValue: 'Nadi' })}:</span>
                  <strong className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}>{getLocalizedNadi(matchResult.nadiDosha?.partner2Nadi, currentLang, t)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>{t("kundliMilan.status_label", { defaultValue: "Status" })}:</span>
                  <strong className={matchResult.nadiDosha?.hasDosha && !matchResult.nadiDosha?.isCancelled ? 'text-rose-400 font-bold' : 'text-[#C9A050] font-bold'}>
                    {matchResult.nadiDosha?.hasDosha
                      ? (matchResult.nadiDosha?.isCancelled
                        ? t("kundliMilan.status.cancelled", { defaultValue: "Dosha Cancelled (Parihara) ✓" })
                        : t("kundliMilan.status.active_nadi", { defaultValue: "Active Nadi Dosha ⚠️" }))
                      : t("kundliMilan.status.no_dosha", { defaultValue: "No Dosha (Pure Harmony) ✓" })}
                  </strong>
                </div>
                <p className={`p-3.5 rounded-xl border text-xs sm:text-sm mt-3.5 leading-relaxed astro-prose-justified ${
                  theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-[#F9F7F1] border-[#E5E1D8] text-[#2A2A2E]'
                }`}>
                  {getLocalizedNadiReason(matchResult.nadiDosha?.reason, partner1.fullName, partner2.fullName, currentLang, t)}. {getLocalizedNadiRemedy(matchResult.nadiDosha?.remedy, currentLang, t)}
                </p>
              </div>
            </div>

            {/* Bhakoot Dosha */}
            <div className={`${
              theme === 'dark' 
                ? 'bg-[#141418] border-[#2A2A2E]' 
                : 'bg-white border-[#E5E1D8] shadow-sm'
            } border rounded-2xl p-6 sm:p-8`}>
              <div className="flex items-center space-x-3 mb-3.5">
                <Heart className="w-5 h-5 text-[#C9A050]" />
                <h4 className={`text-base sm:text-lg font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>{t("kundliMilan.doshas.bhakoot_exam")}</h4>
              </div>
              <div className={`space-y-2.5 text-xs sm:text-sm ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>
                <div className="flex justify-between">
                  <span>{partner1.fullName.split(' ')[0]} {t('kundliMilan.rashi_label', { defaultValue: 'Rashi' })}:</span>
                  <strong className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}>{getLocalizedRashi(matchResult.bhakootDosha?.partner1Rashi, currentLang, t)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>{partner2.fullName.split(' ')[0]} {t('kundliMilan.rashi_label', { defaultValue: 'Rashi' })}:</span>
                  <strong className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}>{getLocalizedRashi(matchResult.bhakootDosha?.partner2Rashi, currentLang, t)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>{t("kundliMilan.doshas.rashi_disparity")}</span>
                  <strong className="text-[#C9A050] font-bold">{formatLocalizedDigits(matchResult.bhakootDosha?.rashiDistance || '-', currentLang)}</strong>
                </div>
                <p className={`p-3.5 rounded-xl border text-xs sm:text-sm mt-3.5 leading-relaxed astro-prose-justified ${
                  theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-[#F9F7F1] border-[#E5E1D8] text-[#2A2A2E]'
                }`}>
                  {getLocalizedBhakootReason(matchResult.bhakootDosha?.reason, currentLang, t)}. {getLocalizedBhakootRemedy(matchResult.bhakootDosha?.remedy, currentLang, t)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Western Synastry & Elements */}
      {activeTab === 'synastry' && (
        <div className="space-y-6">
          <div className={`${
            theme === 'dark' 
              ? 'bg-[#141418] border-[#2A2A2E]' 
              : 'bg-white border-[#E5E1D8] shadow-sm'
          } border rounded-2xl p-6 sm:p-8`}>
            <h3 className={`text-lg sm:text-xl font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'} mb-2`}>
              {t("kundliMilan.synastry.title")}
            </h3>
            <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} mb-6 leading-relaxed`}>
              {t("kundliMilan.synastry.desc")}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {matchResult.synastry?.map((syn, i) => (
                <div key={i} className={`p-4 sm:p-5 rounded-xl border space-y-2.5 ${
                  theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
                }`}>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-[#C9A050] truncate">{getLocalizedSynastryAspect(syn.title, t)}</span>
                    <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full shrink-0 shadow-sm ${
                      theme === 'light'
                        ? 'bg-[#C9A050]/15 text-[#C9A050] border border-[#C9A050]/30'
                        : 'bg-[#C9A050]/20 text-[#E8C470] border border-[#C9A050]/40'
                    }`}>
                      {formatLocalizedDigits(syn.harmonyScore, currentLang)}%
                    </span>
                  </div>
                  <span className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#9E9A90]'} block`}>{getLocalizedSynastryAspectPlanets(syn.planets, currentLang, t)}</span>
                  <div className={`w-full ${theme === 'light' ? 'bg-[#E5E1D8]' : 'bg-[#1A1A1E]'} h-2 rounded-full overflow-hidden`}>
                    <div className="bg-[#C9A050] h-full rounded-full transition-all duration-500" style={{ width: `${syn.harmonyScore}%` }} />
                  </div>
                  <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2A2A2E]'} pt-1 leading-relaxed astro-prose-justified`}>{getLocalizedSynastryVerdict(syn.description, currentLang, t)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Elemental & Numerology Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`${
              theme === 'dark' 
                ? 'bg-[#141418] border-[#2A2A2E]' 
                : 'bg-white border-[#E5E1D8] shadow-sm'
            } border rounded-2xl p-6 sm:p-8`}>
              <h4 className={`text-base sm:text-lg font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'} mb-3`}>{t("kundliMilan.synastry.elemental_synergy")}</h4>
              <div className={`p-4 sm:p-5 rounded-xl border space-y-2.5 text-xs sm:text-sm ${
                theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
              }`}>
                <div className={`flex justify-between ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>
                  <span>{t("kundliMilan.synastry.elements_label", { defaultValue: "Elements:" })}</span>
                  <strong className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}>
                    {getLocalizedElement(matchResult.elementalBalance?.partner1Element, currentLang)} ↔ {getLocalizedElement(matchResult.elementalBalance?.partner2Element, currentLang)}
                  </strong>
                </div>
                <div className={`flex justify-between items-center ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>
                  <span>{t("kundliMilan.synastry.synergy_score", { defaultValue: "Synergy Score:" })}</span>
                  <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                    theme === 'light'
                      ? 'bg-[#C9A050]/15 text-[#C9A050] border border-[#C9A050]/30'
                      : 'bg-[#C9A050]/20 text-[#E8C470] border border-[#C9A050]/40'
                  }`}>
                    {formatLocalizedDigits(matchResult.elementalBalance?.score || 0, currentLang)}%
                  </span>
                </div>
                <p className={`${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2A2A2E]'} pt-1 leading-relaxed astro-prose-justified`}>{getLocalizedElementalSynergy(matchResult.elementalBalance?.synergy, currentLang)}</p>
              </div>
            </div>

            <div className={`${
              theme === 'dark' 
                ? 'bg-[#141418] border-[#2A2A2E]' 
                : 'bg-white border-[#E5E1D8] shadow-sm'
            } border rounded-2xl p-6 sm:p-8`}>
              <h4 className={`text-base sm:text-lg font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'} mb-3`}>{t("kundliMilan.synastry.numerological_alignment")}</h4>
              <div className={`p-4 sm:p-5 rounded-xl border space-y-2.5 text-xs sm:text-sm ${
                theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
              }`}>
                <div className={`flex justify-between ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>
                  <span>{t("kundliMilan.synastry.psychic_numbers", { defaultValue: "Psychic Numbers (Mulank):" })}</span>
                  <strong className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}>
                    {t("kundliMilan.synastry.mulank_label", { defaultValue: "Mulank" })} {formatLocalizedDigits(matchResult.numerologyMilan?.partner1Mulank || 0, currentLang)} ↔ {t("kundliMilan.synastry.mulank_label", { defaultValue: "Mulank" })} {formatLocalizedDigits(matchResult.numerologyMilan?.partner2Mulank || 0, currentLang)}
                  </strong>
                </div>
                <div className={`flex justify-between items-center ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>
                  <span>{t("kundliMilan.synastry.destiny_score", { defaultValue: "Destiny Harmony Score:" })}</span>
                  <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                    theme === 'light'
                      ? 'bg-[#C9A050]/15 text-[#C9A050] border border-[#C9A050]/30'
                      : 'bg-[#C9A050]/20 text-[#E8C470] border border-[#C9A050]/40'
                  }`}>
                    {formatLocalizedDigits(matchResult.numerologyMilan?.harmonyScore || 0, currentLang)}%
                  </span>
                </div>
                <p className={`${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2A2A2E]'} pt-1 leading-relaxed astro-prose-justified`}>{getLocalizedNumerologyDescription(matchResult.numerologyMilan?.description, matchResult.numerologyMilan?.partner1Mulank, matchResult.numerologyMilan?.partner2Mulank, currentLang)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: AI Astrological Counsel */}
      {activeTab === 'ai_counsel' && (
        <div className={`${
          theme === 'dark' 
            ? 'bg-[#141418] border-[#2A2A2E]' 
            : 'bg-white border-[#E5E1D8] shadow-sm'
        } border rounded-2xl p-6 sm:p-8 space-y-6`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#C9A050]/20 to-transparent border border-[#C9A050]/30 text-[#C9A050] text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-2.5 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C9A050]" />
                <span>{t('kundliMilan.counsel.eyebrow')}</span>
              </div>
              <h3 className={`text-xl sm:text-2xl font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                {t("kundliMilan.counsel.title")}
              </h3>
              <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} mt-1`}>
                {t("kundliMilan.counsel.subtitle")}
              </p>
            </div>

            <div className="flex items-center space-x-2.5 shrink-0">
              {aiSynthesis ? (
                <>
                  <button
                    onClick={handleDownloadAICounselPDF}
                    disabled={isGeneratingPdf}
                    className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition cursor-pointer disabled:opacity-50 ${
                      theme === 'dark'
                        ? 'bg-[#1C1C22] hover:bg-[#25252E] text-[#E5E1D8] border-[#3A3A42]'
                        : 'bg-[#F9F7F1] hover:bg-[#F0ECE1] text-[#2A2A2E] border-[#E5E1D8]'
                    }`}
                    title={t("kundliMilan.counsel.download_counsel_pdf")}
                  >
                    {isGeneratingPdf ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#C9A050]" />
                        <span>{t("kundliMilan.downloading")}</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 text-[#C9A050]" />
                        <span>{t("kundliMilan.download_pdf")}</span>
                      </>
                    )}
                  </button>

                  {/* Single subscription/regenerate button after generating once */}
                  {!isMatchmakingSubscribed ? (
                    <button
                      type="button"
                      onClick={() => setIsMatchmakingSubModalOpen(true)}
                      className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A050]/20 to-[#C9A050]/10 hover:from-[#C9A050]/30 hover:to-[#C9A050]/20 text-[#C9A050] border border-[#C9A050]/40 text-xs sm:text-sm font-bold transition cursor-pointer shadow-sm"
                      title="Subscribe for ₹149 to regenerate counsel"
                    >
                      <Crown className="w-3.5 h-3.5 text-[#C9A050]" />
                      <span>{t("kundliMilan.subscription_modal.badge", { defaultValue: "₹149 / Matchmaking Subscription" })}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleCounselAction(true)}
                      disabled={isGeneratingAI}
                      className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#C9A050] hover:bg-[#D4AF37] disabled:opacity-50 text-[#0D0D0F] font-bold text-xs sm:text-sm shadow-lg shadow-[#C9A050]/20 transition cursor-pointer"
                    >
                      {isGeneratingAI ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{t("kundliMilan.counsel.synthesizing_title", { defaultValue: "Synthesizing Cosmic Charts..." })}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>{t("kundliMilan.counsel.regenerate_btn")}</span>
                        </>
                      )}
                    </button>
                  )}
                </>
              ) : !isMatchmakingSubscribed ? (
                <button
                  type="button"
                  onClick={() => setIsMatchmakingSubModalOpen(true)}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A050] to-[#A07828] hover:from-[#D4AF37] hover:to-[#B38730] text-[#0D0D0F] font-bold text-xs sm:text-sm shadow-lg shadow-[#C9A050]/25 transition cursor-pointer"
                >
                  <Crown className="w-4 h-4 text-[#0D0D0F]" />
                  <span>{t("kundliMilan.subscription_modal.cta", { defaultValue: "Unlock Counsel (₹149)" })}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleCounselAction(false)}
                  disabled={isGeneratingAI}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#C9A050] hover:bg-[#D4AF37] disabled:opacity-50 text-[#0D0D0F] font-bold text-xs sm:text-sm shadow-lg shadow-[#C9A050]/20 transition cursor-pointer"
                >
                  {isGeneratingAI ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{t("kundliMilan.counsel.synthesizing_title", { defaultValue: "Synthesizing Cosmic Charts..." })}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{t("kundliMilan.counsel.regenerate_btn", { defaultValue: "Generate Full Counsel" })}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {aiSynthesis ? (
            <div className="space-y-6">
              {typeof aiSynthesis === 'object' ? (
                <div className="space-y-6 text-xs sm:text-sm astro-prose-justified">
                  {/* Overall Compatibility Hero */}
                  {aiSynthesis?.language && aiSynthesis.language !== currentLang && (
                    <div className="text-xs text-[#C9A050] bg-[#C9A050]/10 border border-[#C9A050]/20 rounded-xl p-3 mb-6 text-center font-medium">
                      {t('kundliMilan.counsel.shown_in_notice', { lang: aiSynthesis.language.toUpperCase() })}
                    </div>
                  )}
                  {aiSynthesis.overall_compatibility && (
                    <div className={`p-5 sm:p-6 rounded-2xl border ${
                      theme === 'dark' ? 'bg-[#0D0D0F] border-[#C9A050]/40' : 'bg-[#F9F7F1] border-[#E5E1D8]'
                    } space-y-2.5`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-[#C9A050] font-serif font-bold text-sm sm:text-base">
                          <Sparkles className="w-4 h-4" />
                          <span>{t("kundliMilan.counsel.overall_compatibility", { defaultValue: "Overall Astrological Compatibility" })}</span>
                        </div>
                        {typeof aiSynthesis.overall_compatibility === 'string' && aiSynthesis.overall_compatibility.length < 30 && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#C9A050]/20 text-[#C9A050] border border-[#C9A050]/40">
                            {renderSafeAiText(aiSynthesis.overall_compatibility)}
                          </span>
                        )}
                      </div>
                      <p className={`${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2A2A2E]'} leading-relaxed`}>
                        {renderSafeAiText(aiSynthesis.overall_compatibility)}
                      </p>
                    </div>
                  )}

                  {/* Core Dimensions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    {aiSynthesis.guna_milan && (
                      <div className={`p-4 sm:p-5 rounded-xl border ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'} space-y-2`}>
                        <h4 className="font-serif font-bold text-[#C9A050] text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-1.5">
                          <span>{t("kundliMilan.counsel.sec_guna_milan")}</span>
                        </h4>
                        <p className={`${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} leading-relaxed`}>
                          {renderSafeAiText(aiSynthesis.guna_milan)}
                        </p>
                      </div>
                    )}

                    {aiSynthesis.manglik_dosha && (
                      <div className={`p-4 sm:p-5 rounded-xl border ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'} space-y-2`}>
                        <h4 className="font-serif font-bold text-amber-500 text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-1.5">
                          <Flame className="w-4 h-4 text-amber-500" />
                          <span>{t("kundliMilan.counsel.sec_manglik")}</span>
                        </h4>
                        <p className={`${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} leading-relaxed`}>
                          {renderSafeAiText(aiSynthesis.manglik_dosha)}
                        </p>
                      </div>
                    )}

                    {aiSynthesis.nadi_analysis && (
                      <div className={`p-4 sm:p-5 rounded-xl border ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'} space-y-2`}>
                        <h4 className="font-serif font-bold text-purple-400 text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-1.5">
                          <Dna className="w-4 h-4 text-purple-400" />
                          <span>{t("kundliMilan.counsel.sec_nadi")}</span>
                        </h4>
                        <p className={`${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} leading-relaxed`}>
                          {renderSafeAiText(aiSynthesis.nadi_analysis)}
                        </p>
                      </div>
                    )}

                    {aiSynthesis.bhakoot_analysis && (
                      <div className={`p-4 sm:p-5 rounded-xl border ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'} space-y-2`}>
                        <h4 className="font-serif font-bold text-[#C9A050] text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-1.5">
                          <Heart className="w-4 h-4 text-[#C9A050]" />
                          <span>{t("kundliMilan.counsel.sec_bhakoot")}</span>
                        </h4>
                        <p className={`${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} leading-relaxed`}>
                          {renderSafeAiText(aiSynthesis.bhakoot_analysis)}
                        </p>
                      </div>
                    )}

                    {aiSynthesis.psychological_affinity && (
                      <div className={`p-4 sm:p-5 rounded-xl border ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'} space-y-2`}>
                        <h4 className="font-serif font-bold text-[#C9A050] text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-1.5">
                          <span>{t("kundliMilan.counsel.sec_psychological")}</span>
                        </h4>
                        <p className={`${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} leading-relaxed`}>
                          {renderSafeAiText(aiSynthesis.psychological_affinity)}
                        </p>
                      </div>
                    )}

                    {aiSynthesis.emotional_resonance && (
                      <div className={`p-4 sm:p-5 rounded-xl border ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'} space-y-2`}>
                        <h4 className="font-serif font-bold text-[#C9A050] text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-1.5">
                          <span>{t("kundliMilan.counsel.sec_emotional")}</span>
                        </h4>
                        <p className={`${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} leading-relaxed`}>
                          {renderSafeAiText(aiSynthesis.emotional_resonance)}
                        </p>
                      </div>
                    )}

                    {aiSynthesis.karmic_bond && (
                      <div className={`p-4 sm:p-5 rounded-xl border ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'} space-y-2`}>
                        <h4 className="font-serif font-bold text-[#C9A050] text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-1.5">
                          <span>{t("kundliMilan.counsel.sec_karmic")}</span>
                        </h4>
                        <p className={`${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} leading-relaxed`}>
                          {renderSafeAiText(aiSynthesis.karmic_bond)}
                        </p>
                      </div>
                    )}

                    {aiSynthesis.physical_harmonization && (
                      <div className={`p-4 sm:p-5 rounded-xl border ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'} space-y-2`}>
                        <h4 className="font-serif font-bold text-[#C9A050] text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-1.5">
                          <span>{t("kundliMilan.counsel.sec_biological")}</span>
                        </h4>
                        <p className={`${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} leading-relaxed`}>
                          {renderSafeAiText(aiSynthesis.physical_harmonization)}
                        </p>
                      </div>
                    )}

                    {aiSynthesis.family_and_married_life && (
                      <div className={`p-4 sm:p-5 rounded-xl border ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'} space-y-2`}>
                        <h4 className="font-serif font-bold text-[#C9A050] text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-1.5">
                          <span>{t("kundliMilan.counsel.sec_family")}</span>
                        </h4>
                        <p className={`${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} leading-relaxed`}>
                          {renderSafeAiText(aiSynthesis.family_and_married_life)}
                        </p>
                      </div>
                    )}

                    {aiSynthesis.wealth_and_prosperity && (
                      <div className={`p-4 sm:p-5 rounded-xl border ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'} space-y-2`}>
                        <h4 className="font-serif font-bold text-[#C9A050] text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-1.5">
                          <span>{t("kundliMilan.counsel.sec_wealth")}</span>
                        </h4>
                        <p className={`${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} leading-relaxed`}>
                          {renderSafeAiText(aiSynthesis.wealth_and_prosperity)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Strengths & Challenges Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    {Array.isArray(aiSynthesis.major_strengths) && aiSynthesis.major_strengths.length > 0 && (
                      <div className={`p-4 sm:p-5 rounded-xl border ${theme === 'dark' ? 'bg-[#0D0D0F] border-emerald-500/30' : 'bg-[#F9F7F1] border-emerald-500/30'} space-y-2.5`}>
                        <h4 className="font-serif font-bold text-emerald-500 text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>{t("kundliMilan.counsel.sec_strengths")}</span>
                        </h4>
                        <ul className="space-y-2">
                          {aiSynthesis.major_strengths.map((str: any, i: number) => (
                            <li key={i} className="flex items-start space-x-2 text-xs sm:text-sm">
                              <span className="text-emerald-500 font-bold">•</span>
                              <span className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2A2A2E]'}>{renderSafeAiText(str)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {Array.isArray(aiSynthesis.major_challenges) && aiSynthesis.major_challenges.length > 0 && (
                      <div className={`p-4 sm:p-5 rounded-xl border ${theme === 'dark' ? 'bg-[#0D0D0F] border-amber-500/30' : 'bg-[#F9F7F1] border-amber-500/30'} space-y-2.5`}>
                        <h4 className="font-serif font-bold text-amber-500 text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          <span>{t("kundliMilan.counsel.sec_challenges")}</span>
                        </h4>
                        <ul className="space-y-2">
                          {aiSynthesis.major_challenges.map((ch: any, i: number) => (
                            <li key={i} className="flex items-start space-x-2 text-xs sm:text-sm">
                              <span className="text-amber-500 font-bold">•</span>
                              <span className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2A2A2E]'}>{renderSafeAiText(ch)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Conflict Resolution & Vedic Remedies */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    {Array.isArray(aiSynthesis.conflict_resolution) && aiSynthesis.conflict_resolution.length > 0 && (
                      <div className={`p-4 sm:p-5 rounded-xl border ${theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'} space-y-2.5`}>
                        <h4 className="font-serif font-bold text-blue-400 text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-1.5">
                          <ShieldCheck className="w-4 h-4 text-blue-400" />
                          <span>{t("kundliMilan.counsel.sec_resolution")}</span>
                        </h4>
                        <ul className="space-y-2">
                          {aiSynthesis.conflict_resolution.map((cr: any, i: number) => (
                            <li key={i} className="flex items-start space-x-2 text-xs sm:text-sm">
                              <span className="text-blue-400 font-bold">•</span>
                              <span className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2A2A2E]'}>{renderSafeAiText(cr)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {Array.isArray(aiSynthesis.vedic_remedies) && aiSynthesis.vedic_remedies.length > 0 && (
                      <div className={`p-4 sm:p-5 rounded-xl border ${theme === 'dark' ? 'bg-[#0D0D0F] border-[#C9A050]/40' : 'bg-[#F9F7F1] border-[#E5E1D8]'} space-y-2.5`}>
                        <h4 className="font-serif font-bold text-[#C9A050] text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-1.5">
                          <Sparkles className="w-4 h-4 text-[#C9A050]" />
                          <span>{t("kundliMilan.counsel.sec_upayas")}</span>
                        </h4>
                        <ul className="space-y-2">
                          {aiSynthesis.vedic_remedies.map((vr: any, i: number) => (
                            <li key={i} className="flex items-start space-x-2 text-xs sm:text-sm">
                              <span className="text-[#C9A050] font-bold">•</span>
                              <span className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2A2A2E]'}>{renderSafeAiText(vr)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Final Assessment Box */}
                  {aiSynthesis.final_assessment && (
                    <div className={`p-5 sm:p-6 rounded-2xl border ${
                      theme === 'dark' ? 'bg-gradient-to-r from-[#C9A050]/15 via-[#C9A050]/5 to-transparent border-[#C9A050]/50' : 'bg-[#F9F7F1] border-[#E5E1D8]'
                    } space-y-2.5`}>
                      <h4 className="font-serif font-bold text-[#C9A050] text-sm sm:text-base flex items-center space-x-2">
                        <HeartHandshake className="w-4 h-4 text-[#C9A050]" />
                        <span>{t("kundliMilan.counsel.sec_blessing")}</span>
                      </h4>
                      <p className={`${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#2A2A2E]'} font-serif italic text-xs sm:text-sm leading-relaxed`}>
                        "{renderSafeAiText(aiSynthesis.final_assessment)}"
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className={`p-6 sm:p-8 rounded-2xl border text-xs sm:text-sm leading-relaxed space-y-4 ${
                  theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-[#F9F7F1] border-[#E5E1D8] text-[#2A2A2E]'
                }`}>
                  <div className={`prose max-w-none text-xs sm:text-sm astro-prose-justified ${theme === 'dark' ? 'prose-invert' : 'text-[#2A2A2E]'}`}>
                    <ReactMarkdown>{aiSynthesis}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ) : isGeneratingAI ? (
            <div className={`p-12 rounded-2xl border border-dashed text-center space-y-4 ${
              theme === 'dark' ? 'bg-[#0D0D0F]/60 border-[#C9A050]/40' : 'bg-[#F9F7F1] border-[#E5E1D8]'
            }`}>
              <RefreshCw className="w-8 h-8 text-[#C9A050] mx-auto animate-spin" />
              <div className="space-y-1.5">
                <h4 className={`text-base sm:text-lg font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                  {t("kundliMilan.counsel.synthesizing_title", { defaultValue: "Synthesizing Vedic Charts & Planetary Alignments..." })}
                </h4>
                <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>
                  Daivajna is analyzing Guna Milan, Doshas, and synastry dynamics for {partner1.fullName} &amp; {partner2.fullName}.
                </p>
              </div>
            </div>
          ) : !isMatchmakingSubscribed ? (
            <div className={`p-8 sm:p-10 rounded-2xl border border-dashed text-center space-y-4 ${
              theme === 'dark' ? 'bg-[#0D0D0F]/70 border-[#C9A050]/40' : 'bg-[#FAF7EE] border-[#C9A050]/50 shadow-sm'
            }`}>
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#C9A050]/25 to-[#C9A050]/5 border border-[#C9A050]/40 flex items-center justify-center text-[#C9A050] shadow-lg shadow-[#C9A050]/15">
                <Crown className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-lg mx-auto">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#C9A050]/15 text-[#C9A050] border border-[#C9A050]/30">
                  <Lock className="w-3.5 h-3.5" />
                  <span>{t("kundliMilan.subscription_modal.badge", { defaultValue: "Matchmaking Subscription Feature • ₹149" })}</span>
                </div>
                <h4 className={`text-lg sm:text-xl font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                  {t("kundliMilan.counsel.title")}
                </h4>
                <p className={`text-xs sm:text-sm font-sans ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} leading-relaxed`}>
                  {t("kundliMilan.counsel.empty_desc")}
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setIsMatchmakingSubModalOpen(true)}
                  className="inline-flex items-center space-x-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#C9A050] to-[#A07828] hover:from-[#D4AF37] hover:to-[#B38730] text-[#0D0D0F] font-bold text-xs sm:text-sm shadow-xl shadow-[#C9A050]/30 transition cursor-pointer hover:scale-[1.02] active:scale-95"
                >
                  <Crown className="w-4 h-4" />
                  <span>{t("kundliMilan.subscription_modal.cta", { defaultValue: "Subscribe for ₹149 & Generate Full Counsel" })}</span>
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-[#9E9A90] pt-1">
                <span className="flex items-center space-x-1"><ShieldCheck className="w-3.5 h-3.5 text-[#C9A050]" /><span>{t("kundliMilan.subscription_modal.feature_instant", { defaultValue: "Instant Activation" })}</span></span>
                <span>•</span>
                <span>{t("kundliMilan.subscription_modal.feature_1", { defaultValue: "Unlimited Regenerations" })}</span>
                <span>•</span>
                <span>{t("kundliMilan.subscription_modal.feature_3", { defaultValue: "High-Res PDF Dossier" })}</span>
              </div>
            </div>
          ) : (
            <div className={`p-8 sm:p-10 rounded-2xl border border-dashed text-center space-y-3.5 ${
              theme === 'dark' ? 'bg-[#0D0D0F]/60 border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
            }`}>
              <Sparkles className="w-8 h-8 text-[#C9A050] mx-auto opacity-70" />
              <p className={`text-xs sm:text-sm font-serif ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2A2A2E]'}`}>
                {t("kundliMilan.counsel.empty_desc")}
              </p>
              <div>
                <button
                  onClick={() => handleCounselAction(false)}
                  disabled={isGeneratingAI}
                  className="mt-2 inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#C9A050] hover:bg-[#D4AF37] disabled:opacity-50 text-[#0D0D0F] font-bold text-xs sm:text-sm shadow-lg shadow-[#C9A050]/20 transition cursor-pointer hover:scale-[1.02] active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{t("kundliMilan.counsel.regenerate_btn", { defaultValue: "Generate Full Counsel" })}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Remedies & Muhurat */}
      {activeTab === 'remedies' && (
        <div className="space-y-6">
          <div className={`${
            theme === 'dark' 
              ? 'bg-[#141418] border-[#2A2A2E]' 
              : 'bg-white border-[#E5E1D8] shadow-sm'
          } border rounded-2xl p-6 sm:p-8 space-y-4`}>
            <div className="flex items-center space-x-2.5 text-[#C9A050]">
              <ShieldCheck className="w-5 h-5" />
              <h3 className={`text-lg sm:text-xl font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                {t("kundliMilan.remedies.title")}
              </h3>
            </div>
            <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>
              {t("kundliMilan.remedies.subtitle")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {matchResult.remedies?.map((rem, idx) => (
                <div key={idx} className={`p-4 sm:p-5 rounded-xl border flex items-start space-x-3 text-xs sm:text-sm ${
                  theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
                }`}>
                  <span className="w-6 h-6 rounded-full bg-[#C9A050]/20 text-[#C9A050] font-bold flex items-center justify-center shrink-0 text-xs">
                    {formatLocalizedDigits(idx + 1, currentLang)}
                  </span>
                  <span className={`${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2A2A2E]'} leading-relaxed`}>{getLocalizedRemedy(rem, partner1.fullName, partner2.fullName, currentLang, t)}</span>
                </div>
              ))}
            </div>

            {Array.isArray(aiSynthesis?.vedic_remedies) && aiSynthesis.vedic_remedies.length > 0 && (
              <div className={`p-4 sm:p-5 rounded-xl border ${theme === 'dark' ? 'bg-[#0D0D0F] border-[#C9A050]/40' : 'bg-[#F9F7F1] border-[#E5E1D8]'} space-y-2.5 mt-4`}>
                <h4 className="font-serif font-bold text-[#C9A050] text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-[#C9A050]" />
                  <span>{t("kundliMilan.counsel.sec_upayas")}</span>
                </h4>
                <ul className="space-y-2">
                  {aiSynthesis.vedic_remedies.map((vr: string, i: number) => (
                    <li key={i} className="flex items-start space-x-2 text-xs sm:text-sm">
                      <span className="text-[#C9A050] font-bold">•</span>
                      <span className={theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#2A2A2E]'}>{getLocalizedRemedy(vr, partner1.fullName, partner2.fullName, currentLang, t)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Auspicious Muhurat Window Card */}
          <div className={`${
            theme === 'dark' 
              ? 'bg-[#141418] border-[#2A2A2E]' 
              : 'bg-white border-[#E5E1D8] shadow-sm'
          } border rounded-2xl p-6 sm:p-8 space-y-3`}>
            <div className="flex items-center space-x-2.5 text-amber-500">
              <Calendar className="w-5 h-5" />
              <h4 className={`text-base sm:text-lg font-serif font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                {t("kundliMilan.remedies.muhurat_title")}
              </h4>
            </div>
            <p className={`text-xs sm:text-sm leading-relaxed p-4 sm:p-5 rounded-xl border astro-prose-justified ${
              theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-[#F9F7F1] border-[#E5E1D8] text-[#2A2A2E]'
            }`}>
              {getLocalizedMuhuratAdvice(matchResult.auspiciousMuhuratAdvice, partner1.fullName, partner2.fullName, currentLang, t)}
            </p>
          </div>

          {/* Couple Favorable Gemstones Cards */}
          {(() => {
            const p1Chart = partner1.birthDate ? calculateVedicChart(partner1) : null;
            const p2Chart = partner2.birthDate ? calculateVedicChart(partner2) : null;
            const p1Gems = p1Chart?.gemstones && p1Chart.gemstones.length > 0 ? p1Chart.gemstones : getLagnaGemstones(p1Chart?.ascendant?.signIndex ?? 11);
            const p2Gems = p2Chart?.gemstones && p2Chart.gemstones.length > 0 ? p2Chart.gemstones : getLagnaGemstones(p2Chart?.ascendant?.signIndex ?? 3);

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* {t("kundliMilan.remedies.partner1_gems")} */}
                <div className={`${
                  theme === 'dark' 
                    ? 'bg-[#141418] border-[#2A2A2E]' 
                    : 'bg-white border-[#E5E1D8] shadow-sm'
                } border rounded-2xl p-6 sm:p-8 space-y-4`}>
                  <div className="flex items-center space-x-2 font-serif font-bold text-xs sm:text-sm pb-2.5 border-b border-[#E5E1D8]">
                    <Layers className="w-4 h-4 text-[#C9A050]" />
                    <span className={theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}>
                      {t("kundliMilan.remedies.partner1_gems")} • {partner1.fullName || "Partner 1"}
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {p1Gems.map((g: any, idx: number) => (
                      <div key={idx} className={`p-3.5 sm:p-4 rounded-xl border flex flex-col ${
                        theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
                      }`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-xs sm:text-sm font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>{t("vedic.gems." + getGemstoneKey(g.gem, g.planet))}</span>
                          <span className="text-[10px] sm:text-xs font-bold text-[#C9A050] uppercase tracking-wider">{getLocalizedPlanet(g.planet, t)}</span>
                        </div>
                        <span className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>{getLocalizedGemPurpose(g.purpose, t)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* {t("kundliMilan.remedies.partner2_gems")} */}
                <div className={`${
                  theme === 'dark' 
                    ? 'bg-[#141418] border-[#2A2A2E]' 
                    : 'bg-white border-[#E5E1D8] shadow-sm'
                } border rounded-2xl p-6 sm:p-8 space-y-4`}>
                  <div className="flex items-center space-x-2 font-serif font-bold text-xs sm:text-sm pb-2.5 border-b border-[#E5E1D8]">
                    <Layers className="w-4 h-4 text-[#C9A050]" />
                    <span className={theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}>
                      {t("kundliMilan.remedies.partner2_gems")} • {partner2.fullName || "Partner 2"}
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {p2Gems.map((g: any, idx: number) => (
                      <div key={idx} className={`p-3.5 sm:p-4 rounded-xl border flex flex-col ${
                        theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
                      }`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-xs sm:text-sm font-bold ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>{t("vedic.gems." + getGemstoneKey(g.gem, g.planet))}</span>
                          <span className="text-[10px] sm:text-xs font-bold text-[#C9A050] uppercase tracking-wider">{getLocalizedPlanet(g.planet, t)}</span>
                        </div>
                        <span className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>{getLocalizedGemPurpose(g.purpose, t)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      </div>

      {/* ========================================================================= */}
      {/* PRINTABLE OFFICIAL KUNDLI MILAN CERTIFICATE (Visible in Print Mode Only)  */}
      {/* ========================================================================= */}
      <div
        ref={printableRef}
        id="printable-certificate"
        className="hidden print:block bg-white text-black p-8 max-w-4xl mx-auto border-8 border-double border-[#C9A050] my-6 font-sans"
      >
        {/* Certificate Header */}
        <div className="text-center border-b-2 border-[#C9A050] pb-6 mb-6">
          <div className="text-3xl font-bold tracking-widest text-[#8C6D23] uppercase mb-1">
            🕉️ ASTROJUNCTION
          </div>
          <div className="text-sm font-semibold tracking-wider text-gray-700 uppercase">
            Vedic Kundli Milan &amp; Ashta Koota Compatibility Certificate
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Calculated in accordance with Brihat Parashara Hora Shastra &amp; Classical Jyotish Sutras
          </p>
        </div>

        {/* Partners Banner */}
        <div className="grid grid-cols-2 gap-6 my-6 p-4 bg-amber-50/50 border border-amber-200 rounded-lg">
          <div>
            <div className="text-xs uppercase tracking-wider font-bold text-[#8C6D23]">{t("kundliMilan.saved_modal.groom", { defaultValue: "Groom / Partner A" })}</div>
            <div className="text-lg font-bold text-gray-900">{partner1.fullName}</div>
            <div className="text-xs text-gray-600 mt-1">
              Born: {partner1.birthDate} at {partner1.birthTime}
            </div>
            <div className="text-xs text-gray-600">Place: {partner1.birthPlace}</div>
          </div>

          <div className="text-right">
            <div className="text-xs uppercase tracking-wider font-bold text-[#8C6D23]">{t("kundliMilan.saved_modal.bride", { defaultValue: "Bride / Partner B" })}</div>
            <div className="text-lg font-bold text-gray-900">{partner2.fullName}</div>
            <div className="text-xs text-gray-600 mt-1">
              Born: {partner2.birthDate} at {partner2.birthTime}
            </div>
            <div className="text-xs text-gray-600">Place: {partner2.birthPlace}</div>
          </div>
        </div>

        {/* Score & Verdict Banner */}
        <div className="text-center my-6 p-4 bg-amber-100/60 border-2 border-[#C9A050] rounded-lg">
          <div className="text-xs font-bold uppercase tracking-widest text-[#8C6D23]">{t("kundliMilan.saved_modal.total_score", { defaultValue: "Total Compatibility Score" })}</div>
          <div className="text-4xl font-bold text-[#8C6D23] my-1">
            {formatLocalizedDigits(matchResult.totalPoints, currentLang)} / 36 Gunas ({formatLocalizedDigits(matchResult.percentage, currentLang)}%)
          </div>
          <div className="text-sm font-bold text-gray-800 uppercase tracking-wide">
            {matchResult.verdictTitle ||
              (typeof matchResult.summary === 'object' ? (matchResult.summary as any)?.verdictTitle : null) ||
              'Kundli Milan'}
          </div>
          <p className="text-xs text-gray-700 mt-2 max-w-xl mx-auto italic">
            &ldquo;
            {t("kundliMilan.summary_sentence", { score: formatLocalizedDigits(matchResult.totalPoints, currentLang), pct: formatLocalizedDigits(matchResult.percentage, currentLang) })}
            &rdquo;
          </p>
        </div>

        {/* 8 Kootas Table */}
        <div className="my-6">
          <h4 className="text-sm font-bold text-gray-900 border-b border-gray-300 pb-2 mb-3 uppercase tracking-wide">
            Ashta Koota Points Breakdown
          </h4>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-400 bg-gray-100">
                <th className="p-2 font-bold">Koota</th>
                <th className="p-2 font-bold">Significance</th>
                <th className="p-2 font-bold">{partner1.fullName.split(' ')[0]}</th>
                <th className="p-2 font-bold">{partner2.fullName.split(' ')[0]}</th>
                <th className="p-2 font-bold text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {matchResult.kootas.map((k) => (
                <tr key={k.id} className="border-b border-gray-200">
                  <td className="p-2 font-bold">{k.name} ({k.sanskritName})</td>
                  <td className="p-2 text-gray-600">{k.area}</td>
                  <td className="p-2">{k.p1Value}</td>
                  <td className="p-2">{k.p2Value}</td>
                  <td className="p-2 font-bold text-right">{k.obtainedPoints} / {k.maxPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Dosha & Remedial Summary */}
        <div className="grid grid-cols-2 gap-4 my-6 text-xs">
          <div className="p-3 bg-gray-50 border border-gray-200 rounded">
            <strong className="block text-gray-900 mb-1">Manglik (Kuja) Dosha:</strong>
            <p className="text-gray-700">{matchResult.manglik.verdict}. {matchResult.manglik.explanation}</p>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded">
            <strong className="block text-gray-900 mb-1">Nadi &amp; Bhakoot Vitality:</strong>
            <p className="text-gray-700">Nadi: {matchResult.nadiDosha.reason}. Bhakoot: {matchResult.bhakootDosha.reason}.</p>
          </div>
        </div>

        {/* Certificate Footer / Authentication */}
        <div className="mt-8 pt-6 border-t-2 border-gray-300 flex justify-between items-end text-xs text-gray-600">
          <div>
            <div>Certificate ID: <strong className="text-gray-900">AJ-KM-{Date.now().toString(36).toUpperCase()}</strong></div>
            <div>Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div className="text-[10px] text-gray-500 mt-1">Verified via AstroJunction Mathematical AstroEngine</div>
          </div>
          <div className="text-center">
            <div className="w-36 border-b border-gray-400 mb-1 mx-auto" />
            <span className="text-[11px] font-bold text-gray-800 uppercase">Daivajna Astrological Seal</span>
          </div>
        </div>
      </div>
        </>
      )}

      {/* Saved Matches History Modal */}
      <AnimatePresence>
        {isHistoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className={`w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${
                theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-white border-[#E5E1D8]'
              }`}
            >
              {/* Modal Header */}
              <div className={`p-5 sm:p-6 border-b flex items-center justify-between ${
                theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#C9A050]/15 flex items-center justify-center text-[#C9A050]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className={`font-serif font-bold text-base sm:text-lg ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                      {t("kundliMilan.saved_modal.title")}
                    </h3>
                    <p className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>
                      {t("kundliMilan.saved_modal.history_for", { defaultValue: "History for" })} {currentProfile?.fullName || "User"} ({formatLocalizedDigits(savedMatches.length, currentLang)})
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsHistoryModalOpen(false)}
                  className={`p-1.5 rounded-lg transition ${
                    theme === 'dark' ? 'text-[#9E9A90] hover:text-[#F0ECE1] hover:bg-[#1A1A1E]' : 'text-[#544B3D] hover:text-[#0D0D0F] hover:bg-[#F0ECE1]'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body: List of Saved Matches */}
              <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-3.5">
                {savedMatches.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <HeartHandshake className="w-12 h-12 text-[#9E9A90]/40 mx-auto" />
                    <p className={`text-sm ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>
                      {t("kundliMilan.saved_modal.empty")}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]/60' : 'text-[#9E9A90]'}`}>
                      When you enter partner details and save them, your match reports will appear here.
                    </p>
                  </div>
                ) : (
                  savedMatches.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleLoadFromHistory(m)}
                      className={`p-4 sm:p-5 rounded-xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        theme === 'dark'
                          ? 'bg-[#1A1A1E] border-[#2A2A2E] hover:border-[#C9A050]/60 hover:bg-[#202026]'
                          : 'bg-[#F9F7F1] border-[#E5E1D8] hover:border-[#C9A050] hover:bg-[#F0ECE1]'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm sm:text-base text-[#C9A050]">
                            {m.partner1Name || 'Partner 1'}
                          </span>
                          <span className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>&amp;</span>
                          <span className="font-bold text-sm sm:text-base text-[#C9A050]">
                            {m.partner2Name || 'Partner 2'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="px-2.5 py-0.5 rounded-full font-bold bg-[#C9A050]/15 text-[#C9A050] border border-[#C9A050]/30">
                            {formatLocalizedDigits(m.totalScore, currentLang)} / {formatLocalizedDigits(m.maxScore || 36, currentLang)} {t("kundliMilan.gunas_label")} ({formatLocalizedDigits(m.percentage || Math.round((m.totalScore / (m.maxScore || 36)) * 100), currentLang)}%)
                          </span>
                          <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}`}>
                            {getLocalizedVerdict(m.verdictTitle || "Calculated Match", t)}
                          </span>
                        </div>

                        <div className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'} flex items-center space-x-2 pt-0.5`}>
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(m.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleLoadFromHistory(m)}
                          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#C9A050] hover:bg-[#D4AF37] text-black transition shadow-sm cursor-pointer"
                        >
                          <span>{t("kundliMilan.saved_modal.load")}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteFromHistory(m.id, e)}
                          className="p-1.5 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                          title={t("kundliMilan.saved_modal.delete")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Modal Footer */}
              <div className={`p-4 sm:p-5 border-t flex justify-between items-center ${
                theme === 'dark' ? 'border-[#2A2A2E] bg-[#101014]' : 'border-[#E5E1D8] bg-[#F9F7F1]'
              }`}>
                <span className={`text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#544B3D]'}`}>
                  Click "Load" to restore any match report directly into the UI.
                </span>
                <button
                  type="button"
                  onClick={() => setIsHistoryModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition cursor-pointer ${
                    theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-white border-[#E5E1D8] text-[#2A2A2E] hover:bg-[#F0ECE1]'
                  }`}
                >
                  {t("kundliMilan.saved_modal.close")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Matchmaking Deep Counsel & Regeneration Subscription Modal (₹149) */}
      <AnimatePresence>
        {isMatchmakingSubModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`relative w-full max-w-lg rounded-2xl p-6 sm:p-7 border shadow-2xl overflow-hidden ${
                theme === 'dark' ? 'bg-[#141418] border-[#C9A050]/50 text-[#E5E1D8]' : 'bg-white border-[#C9A050]/50 text-[#2A2A2E]'
              }`}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsMatchmakingSubModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-[#9E9A90] hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center space-y-3">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C9A050]/30 to-[#A07828]/10 border border-[#C9A050]/60 flex items-center justify-center shadow-lg shadow-[#C9A050]/20">
                    <Crown className="w-8 h-8 text-[#C9A050]" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#C9A050] text-[#0D0D0F]">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#C9A050]/15 text-[#C9A050] border border-[#C9A050]/30">
                  <Crown className="w-3.5 h-3.5" />
                  <span>{t("kundliMilan.subscription_modal.badge", { defaultValue: "Matchmaking Subscription • ₹149 Only" })}</span>
                </div>

                <h3 className={`text-xl sm:text-2xl font-serif font-bold ${
                  theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'
                }`}>
                  {t("kundliMilan.subscription_modal.title")}
                </h3>

                <p className="text-xs font-sans text-[#9E9A90] max-w-md leading-relaxed">
                  {t("kundliMilan.subscription_modal.subtitle")}
                </p>
              </div>

              {/* Feature Highlights */}
              <div className={`mt-5 p-4 rounded-xl border space-y-2.5 ${
                theme === 'dark' ? 'bg-[#1A1A1E]/80 border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
              }`}>
                <div className="text-xs font-bold text-[#C9A050] uppercase tracking-wider font-sans mb-1">
                  {t("kundliMilan.subscription_modal.unlocked_header", { defaultValue: "What is unlocked with your ₹149 Subscription:" })}
                </div>
                
                <div className="flex items-start space-x-2.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Unlimited Regenerations:</strong> Re-synthesize relationship counsel anytime with updated partner data or questions.</span>
                </div>
                
                <div className="flex items-start space-x-2.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Daivajna Karmic Synastry:</strong> Full psychological affinity, communication rhythms &amp; wealth generation timing.</span>
                </div>
                
                <div className="flex items-start space-x-2.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Marital Timing &amp; Conflict Resolution:</strong> Precise Muhurat windows and pacification of planetary frictions.</span>
                </div>

                <div className="flex items-start space-x-2.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>High-Resolution PDF Match Report:</strong> Instant export of the full comprehensive matchmaking dossier.</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => {
                    setIsMatchmakingSubModalOpen(false);
                    if (onNavigateToTab) {
                      onNavigateToTab('consultations', 'matchmaking_regenerate_subscription');
                    }
                  }}
                  className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#C9A050] to-[#A07828] hover:from-[#D4AF37] hover:to-[#B38730] text-[#0D0D0F] font-bold text-xs sm:text-sm shadow-lg shadow-[#C9A050]/25 transition cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{t("kundliMilan.subscription_modal.cta", { defaultValue: "Subscribe for ₹149 & Open Payment Gateway" })}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsMatchmakingSubModalOpen(false)}
                  className={`w-full sm:w-auto py-3.5 px-4 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                    theme === 'dark'
                      ? 'border-[#2A2A2E] text-[#9E9A90] hover:text-white hover:bg-[#1A1A1E]'
                      : 'border-[#E5E1D8] text-[#6E6A60] hover:text-black hover:bg-[#F0ECE1]'
                  }`}
                >
                  {t("kundliMilan.subscription_modal.maybe_later", { defaultValue: "Maybe Later" })}
                </button>
              </div>

              <div className="mt-4 flex items-center justify-center space-x-2 text-[11px] text-[#9E9A90]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C9A050]" />
                <span>{t("kundliMilan.subscription_modal.secure_gateway", { defaultValue: "Instant Activation • 256-bit Secure Gateway" })}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};


