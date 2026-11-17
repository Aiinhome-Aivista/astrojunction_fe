import React, { useState, useEffect } from 'react';
import {
  Hash,
  Sparkles,
  Grid,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  Layers,
  ArrowRight,
  RefreshCw,
  Sliders,
  Shield,
  Flame,
  CloudUpload,
  Loader2,
  Download,
  FileText,
} from 'lucide-react';
import { UserProfile, NumerologyReport } from '../types';
import { CHALDEAN_VALUES, reduceToSingleDigit } from '../services/astroEngine';
import { saveNumerologyReport } from '../services/numerologyApi';
import { ApiError, api } from '../services/api';
import { API_ENDPOINTS } from '../config/api_config';
import { useTranslation } from 'react-i18next';
import {
  formatLocalizedDigits,
  formatLocalizedDate,
  getLocalizedPlanetTitle,
  getLocalizedTrait,
  getLocalizedMission,
  getLocalizedDays,
  getLocalizedColors,
  getLocalizedPlaneName,
  getLocalizedPlaneMeaning,
  getLocalizedPlaneStatus,
  getLocalizedRemedy,
  getLocalizedChaldeanCompatibility,
  getLocalizedChaldeanSuggestion,
} from '../services/numerologyTranslations';


interface NumerologyViewProps {
  profile: UserProfile;
  numerology: NumerologyReport;
  isAuthenticated?: boolean;
  theme?: 'light' | 'dark';
}

export const NumerologyView: React.FC<NumerologyViewProps> = ({
  profile,
  numerology,
  isAuthenticated,
  theme = 'dark',
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language?.split('-')[0]?.toLowerCase() || 'en');
  const [testName, setTestName] = useState(profile.fullName);
  
  const [backendData, setBackendData] = useState<NumerologyReport | null>(null);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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

  useEffect(() => {
    const fetchBackendData = async () => {
      setIsAiLoading(true);
      try {
        // Fetch math/calc data from backend
        const calcData = await api.post<any>('/numerology/calculate', {
          fullName: profile.fullName,
          birthDate: profile.birthDate
        });
        
        if (calcData && calcData.data) {
          setBackendData(calcData.data);
          
          // Then fetch AI insights in current language
          const missingNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => !calcData.data.loShuGrid[n]);
          const aiData = await api.post<any>(API_ENDPOINTS.NUMEROLOGY.AI_INSIGHTS, {
            mulank: calcData.data.mulank,
            bhagyank: calcData.data.bhagyank,
            namank: calcData.data.namankChaldean,
            missingNumbers,
            language: currentLang
          });
          
          if (aiData) setAiInsights(aiData);
        }
      } catch (e) {
        console.error('Failed to fetch Numerology data', e);
      } finally {
        setIsAiLoading(false);
      }
    };
    fetchBackendData();
  }, [profile.fullName, profile.birthDate, currentLang]);

  const activeNumerology = backendData || numerology;
  const [activeTab, setActiveTab] = useState<'matrix' | 'loshu' | 'name_correction' | 'remedies'>('matrix');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSaveReport = async () => {
    setSaveState('saving');
    setSaveError(null);
    try {
      await saveNumerologyReport(profile.id, activeNumerology, profile);
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2500);
    } catch (err) {
      setSaveState('error');
      setSaveError(err instanceof ApiError ? err.message : 'Could not save report');
    }
  };

  // Calculate dynamic Chaldean value for test name
  const cleanTestName = testName.toUpperCase().replace(/[^A-Z]/g, '');
  let testChaldeanSum = 0;
  for (const ch of cleanTestName) {
    testChaldeanSum += CHALDEAN_VALUES[ch] || 0;
  }
  const testChaldeanSingle = reduceToSingleDigit(testChaldeanSum);

  // Standard 3x3 Lo Shu layout positions
  // Top Row: 4, 9, 2
  // Mid Row: 3, 5, 7
  // Bot Row: 8, 1, 6
  const loShuPositions = [
    [4, 9, 2],
    [3, 5, 7],
    [8, 1, 6],
  ];

  // Comprehensive Sacred Numerology & Lo Shu Magic Grid PDF Report Generator
  const handleDownloadNumerologyPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const pName = profile?.fullName || 'Seeker';
      const safeName = pName.replace(/\s+/g, '_');
      const dateStr = profile?.birthDate || new Date().toISOString().split('T')[0];
      const lang = i18n.language || 'en';
      const fileName = `AstroJunction_Numerology_${safeName}_${dateStr}_${lang}.pdf`;

      await api.downloadFile(API_ENDPOINTS.NUMEROLOGY.GENERATE_PDF, fileName, {
        method: 'POST',
        body: JSON.stringify({
          lang,
          profile,
          activeNumerology,
          numerology: activeNumerology,
          labels: {
            'numerology.header.title': t('numerology.title'),
            'numerology.header.subtitle': t('numerology.subtitle'),
          }
        }),
      });
    } catch (err) {
      console.error('Failed to generate numerology PDF:', err);
      alert('Failed to generate PDF report. Please ensure the backend server is reachable.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#2A2A2E]">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold tracking-widest text-[#C9A050] uppercase mb-1">
              <Hash className="w-4 h-4" />
              <span>{t('numerology.eyebrow')}</span>
            </div>
            <h1 className="astro-page-header-title">
              {t('numerology.title')}
            </h1>
            <p className="text-xs text-[#9E9A90] mt-1 leading-relaxed">
              {t('numerology.subtitle')}
            </p>
          </div>

          {/* Core Numbers Badges & Download Report Action */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="text-center bg-[#1A1A1E] border border-[#C9A050]/30 px-3.5 py-2 rounded-xl">
              <div className="text-[9px] uppercase font-bold text-[#9E9A90] tracking-wider">{t('numerology.badges.mulank')}</div>
              <div className="text-xl font-bold text-[#C9A050]">{formatLocalizedDigits(activeNumerology.mulank, currentLang)}</div>
            </div>
            <div className="text-center bg-[#1A1A1E] border border-[#C9A050]/30 px-3.5 py-2 rounded-xl">
              <div className="text-[9px] uppercase font-bold text-[#9E9A90] tracking-wider">{t('numerology.badges.bhagyank')}</div>
              <div className="text-xl font-bold text-[#C9A050]">{formatLocalizedDigits(activeNumerology.bhagyank, currentLang)}</div>
            </div>
            <div className="text-center bg-[#1A1A1E] border border-[#C9A050]/30 px-3.5 py-2 rounded-xl">
              <div className="text-[9px] uppercase font-bold text-[#9E9A90] tracking-wider">{t('numerology.badges.namank')}</div>
              <div className="text-xl font-bold text-[#C9A050]">{formatLocalizedDigits(activeNumerology.namankChaldean, currentLang)}</div>
            </div>

            <button
              onClick={handleDownloadNumerologyPdf}
              disabled={isGeneratingPdf}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border text-xs font-bold transition shadow-lg cursor-pointer w-full sm:w-auto ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-[#C9A050] to-[#A07828] hover:from-[#D4AF37] hover:to-[#B38730] text-[#0D0D0F] border-[#C9A050] shadow-[#C9A050]/20'
                  : 'bg-[#C9A050] hover:bg-[#B38730] text-white border-[#C9A050] shadow-[#C9A050]/20'
              } disabled:opacity-50`}
              title={t('numerology.download_title')}
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{isGeneratingPdf ? t('numerology.generating_pdf') : t('numerology.download_btn')}</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-nowrap overflow-x-auto scrollbar-none items-center justify-start gap-1.5 sm:gap-2 pt-4">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-sans font-bold whitespace-nowrap shrink-0 transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'matrix'
                ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/20'
                : 'bg-[#1A1A1E] text-[#9E9A90] hover:text-white border border-[#2A2A2E]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span>{t('numerology.tabs.matrix')}</span>
          </button>
          <button
            onClick={() => setActiveTab('loshu')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-sans font-bold whitespace-nowrap shrink-0 transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'loshu'
                ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/20'
                : 'bg-[#1A1A1E] text-[#9E9A90] hover:text-white border border-[#2A2A2E]'
            }`}
          >
            <Grid className="w-3.5 h-3.5 shrink-0" />
            <span>{t('numerology.tabs.loshu', { count: formatLocalizedDigits(activeNumerology.loShuPlanes?.length || 8, currentLang) })}</span>
          </button>
          <button
            onClick={() => setActiveTab('name_correction')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-sans font-bold whitespace-nowrap shrink-0 transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'name_correction'
                ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/20'
                : 'bg-[#1A1A1E] text-[#9E9A90] hover:text-white border border-[#2A2A2E]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 shrink-0" />
            <span>{t('numerology.tabs.name_correction')}</span>
          </button>
          <button
            onClick={() => setActiveTab('remedies')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-sans font-bold whitespace-nowrap shrink-0 transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'remedies'
                ? 'bg-[#C9A050] text-[#0D0D0F] shadow-md shadow-[#C9A050]/20'
                : 'bg-[#1A1A1E] text-[#9E9A90] hover:text-white border border-[#2A2A2E]'
            }`}
          >
            <Flame className="w-3.5 h-3.5 shrink-0" />
            <span>{t('numerology.tabs.remedies')}</span>
          </button>
        </div>
      </div>

      {/* View 1: Mulank & Bhagyank Matrix */}
      {activeTab === 'matrix' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mulank (Psychic Number) Deep Dive */}
          <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2E]">
              <div className="flex items-center space-x-2">
                <span className="w-8 h-8 rounded-xl bg-[#C9A050]/20 text-[#C9A050] font-serif font-bold text-base flex items-center justify-center border border-[#C9A050]/30">
                  {formatLocalizedDigits(activeNumerology.mulank, currentLang)}
                </span>
                <div>
                  <h3 className="text-sm font-serif font-bold text-[#F0ECE1]">{t('numerology.matrix.mulank_card_title')}</h3>
                  <p className="text-[11px] text-[#9E9A90]">{t('numerology.matrix.mulank_sum_day', { day: formatLocalizedDigits(profile.birthDate.split('-')[2], currentLang) })}</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#C9A050]">{getLocalizedPlanetTitle(activeNumerology.mulankPlanet, activeNumerology.mulank, t)}</span>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div>
                <span className="text-[9px] uppercase font-bold text-[#9E9A90] tracking-wider">{t('numerology.matrix.psychological_drivers')}</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {(aiInsights?.mulankCharacteristics || activeNumerology.mulankCharacteristics).map((trait: string) => (
                    <span
                      key={trait}
                      className="px-2.5 py-1 rounded-lg bg-[#1A1A1E] border border-[#2A2A2E] text-[#C9A050] font-medium"
                    >
                      {getLocalizedTrait(trait, t)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-[#1A1A1E] rounded-xl border border-[#2A2A2E] space-y-1">
                <span className="text-[9px] uppercase font-bold text-[#C9A050] tracking-wider">{t('numerology.matrix.instinctive_nature')}</span>
                <p className="text-[#E5E1D8] leading-relaxed astro-prose-justified">
                  {t('numerology.matrix.instinctive_desc', { planet: getLocalizedPlanetTitle(activeNumerology.mulankPlanet, activeNumerology.mulank, t) })}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-[#1A1A1E]/60 rounded-lg border border-[#2A2A2E]">
                  <span className="text-[9px] text-[#9E9A90] block uppercase font-bold tracking-wider">{t('numerology.matrix.favorable_days')}</span>
                  <span className="font-semibold text-[#C9A050]">{getLocalizedDays(activeNumerology.luckyDays, t)}</span>
                </div>
                <div className="p-3 bg-[#1A1A1E]/60 rounded-lg border border-[#2A2A2E]">
                  <span className="text-[9px] text-[#9E9A90] block uppercase font-bold tracking-wider">{t('numerology.matrix.lucky_colors')}</span>
                  <span className="font-semibold text-[#C9A050]">{getLocalizedColors(activeNumerology.luckyColors, t)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bhagyank (Destiny Number) Deep Dive */}
          <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2E]">
              <div className="flex items-center space-x-2">
                <span className="w-8 h-8 rounded-xl bg-[#C9A050]/20 text-[#C9A050] font-serif font-bold text-base flex items-center justify-center border border-[#C9A050]/30">
                  {formatLocalizedDigits(activeNumerology.bhagyank, currentLang)}
                </span>
                <div>
                  <h3 className="text-sm font-serif font-bold text-[#F0ECE1]">{t('numerology.matrix.bhagyank_card_title')}</h3>
                  <p className="text-[11px] text-[#9E9A90]">{t('numerology.matrix.bhagyank_sum_date', { date: formatLocalizedDate(profile.birthDate, currentLang) })}</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#C9A050]">{getLocalizedPlanetTitle(activeNumerology.bhagyankPlanet, activeNumerology.bhagyank, t)}</span>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div className="p-3.5 bg-[#1A1A1E] rounded-xl border border-[#2A2A2E] space-y-1">
                <span className="text-[9px] uppercase font-bold text-[#C9A050] tracking-wider">{t('numerology.matrix.karmic_life_mission')}</span>
                <p className="text-[#E5E1D8] leading-relaxed astro-prose-justified">{getLocalizedMission(activeNumerology.bhagyankMission, activeNumerology.bhagyank, t)}</p>
              </div>

              <div className="p-3.5 bg-[#1A1A1E] rounded-xl border border-[#2A2A2E] space-y-1">
                <span className="text-[9px] uppercase font-bold text-[#C9A050] tracking-wider">{t('numerology.matrix.synergy_title')}</span>
                <p className="text-[#E5E1D8] leading-relaxed astro-prose-justified">
                  {t('numerology.matrix.synergy_desc', {
                    mulank: formatLocalizedDigits(activeNumerology.mulank, currentLang),
                    bhagyank: formatLocalizedDigits(activeNumerology.bhagyank, currentLang)
                  })}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-[#1A1A1E]/60 rounded-lg border border-[#2A2A2E]">
                  <span className="text-[9px] text-[#9E9A90] block uppercase font-bold tracking-wider">{t('numerology.matrix.friendly_numbers')}</span>
                  <span className="font-semibold text-[#C9A050]">{activeNumerology.luckyNumbers?.map(n => formatLocalizedDigits(n, currentLang)).join(', ')}</span>
                </div>
                <div className="p-3 bg-[#1A1A1E]/60 rounded-lg border border-[#2A2A2E]">
                  <span className="text-[9px] text-[#9E9A90] block uppercase font-bold tracking-wider">{t('numerology.matrix.unfavorable_numbers')}</span>
                  <span className="font-semibold text-[#C9A050]">
                    {activeNumerology.unfavorableNumbers?.length
                      ? activeNumerology.unfavorableNumbers.map(n => formatLocalizedDigits(n, currentLang)).join(', ')
                      : t('numerology.matrix.universal_friend')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 2: Lo Shu 3x3 Magic Grid */}
      {activeTab === 'loshu' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left 5 Cols: Visual Lo Shu Grid */}
          <div className="lg:col-span-5 bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl flex flex-col justify-between items-center h-full min-h-[485px]">
            <div className="w-full flex items-center justify-between pb-3 border-b border-[#2A2A2E] mb-3 text-xs">
              <span className="font-serif font-bold text-[#F0ECE1]">{t('numerology.loshu.matrix_title')}</span>
              <span className="text-[#C9A050] font-mono">{t('numerology.loshu.date_label', { date: formatLocalizedDigits(profile.birthDate.replace(/-/g, ''), currentLang) })}</span>
            </div>

            {/* 3x3 Grid */}
            <div className="w-full max-w-[320px] aspect-square grid grid-cols-3 grid-rows-3 gap-2 p-3 bg-[#08080A] rounded-2xl border border-[#C9A050]/40 shadow-inner my-auto">
              {loShuPositions.map((row) =>
                row.map((num) => {
                  const count = activeNumerology.loShuGrid[num] || 0;
                  const isPresent = count > 0;
                  return (
                    <div
                      key={num}
                      className={`rounded-xl border flex flex-col items-center justify-center p-2 transition ${
                        isPresent
                          ? 'bg-[#1A1A1E] border-[#C9A050] shadow-md shadow-[#C9A050]/10'
                          : 'bg-[#141418]/60 border-[#2A2A2E] text-[#9E9A90]'
                      }`}
                    >
                      <span className={`text-2xl font-serif font-bold ${isPresent ? 'text-[#C9A050]' : 'text-[#504E48]'}`}>
                        {formatLocalizedDigits(num, currentLang)}
                      </span>
                      <span
                        className={`text-[10px] font-sans font-bold px-1.5 py-0.5 rounded-full mt-1 ${
                          isPresent ? 'bg-[#C9A050] text-[#0D0D0F]' : 'bg-[#1A1A1E] text-[#9E9A90]'
                        }`}
                      >
                        {isPresent ? t('numerology.loshu.count_times', { count: formatLocalizedDigits(count, currentLang) }) : t('numerology.loshu.absent')}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-3 text-xs text-[#9E9A90] text-center space-y-1 font-sans">
              <p>{t('numerology.loshu.note_extracted', { date: formatLocalizedDate(profile.birthDate, currentLang) })}</p>
              <p className="text-[#C9A050]/90 font-medium">{t('numerology.loshu.note_remedy')}</p>
            </div>
          </div>

          {/* Right 7 Cols: Lo Shu Planes & Strengths with Scrollbar */}
          <div className="lg:col-span-7">
            <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl flex flex-col max-h-[485px]">
              <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2E] shrink-0 mb-3">
                <h3 className="text-base font-bold text-[#F0ECE1]">{t('numerology.loshu.planes_title')}</h3>
                <span className="text-xs text-[#C9A050] font-medium">{t('numerology.loshu.planes_count', { count: formatLocalizedDigits(activeNumerology.loShuPlanes?.length || 8, currentLang) })}</span>
              </div>

              <div className="space-y-3 font-sans overflow-y-auto pr-1.5 custom-scrollbar">
                {activeNumerology.loShuPlanes.map((plane) => (
                  <div key={plane.name} className="p-3.5 bg-[#1A1A1E] rounded-xl border border-[#2A2A2E] space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-serif font-bold text-[#F0ECE1]">{getLocalizedPlaneName(plane, currentLang, t)}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border border-transparent ${
                          plane.status !== 'Empty'
                            ? 'bg-[#C9A050]/20 text-[#C9A050]'
                            : 'bg-[#141418] text-[#9E9A90]'
                        }`}
                      >
                        {getLocalizedPlaneStatus(plane.status, plane.strength, currentLang, t)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-[#141418] rounded-full overflow-hidden border border-[#2A2A2E]">
                      <div
                        className="h-full bg-gradient-to-r from-[#C9A050] to-[#E5C158] rounded-full"
                        style={{ width: `${plane.strength}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-[#9E9A90] leading-relaxed">
                      {isAiLoading ? (
                        <span className="flex items-center text-[#C9A050] space-x-2 animate-pulse"><Sparkles className="w-3 h-3" /> <span>{t('numerology.loshu.synthesizing')}</span></span>
                      ) : (
                        (aiInsights?.planeMeanings && aiInsights.planeMeanings[plane.name]) || getLocalizedPlaneMeaning(plane.name, plane.meaning, t)
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 3: Chaldean Name Correction Simulator */}
      {activeTab === 'name_correction' && (
        <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl space-y-6">
          <div className="pb-4 border-b border-[#2A2A2E]">
            <h3 className="text-base font-serif font-bold text-[#F0ECE1] flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-[#C9A050]" />
              <span>{t('numerology.chaldean.title')}</span>
            </h3>
            <p className="text-xs font-sans text-[#9E9A90] mt-1">
              {t('numerology.chaldean.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#C9A050] mb-1">
                  {t('numerology.chaldean.input_label')}
                </label>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#1A1A1E] border border-[#2A2A2E] rounded-lg text-sm text-[#F0ECE1] focus:outline-none focus:border-[#C9A050] font-medium"
                />
              </div>

              {/* Letter breakdown */}
              <div className="p-3 bg-[#08080A] rounded-xl border border-[#2A2A2E] space-y-2">
                <span className="text-[9px] uppercase font-bold text-[#9E9A90] block tracking-wider">{t('numerology.chaldean.gematria_label')}</span>
                <div className="flex flex-wrap gap-1">
                  {cleanTestName.split('').map((char, idx) => (
                    <div key={idx} className="p-1 px-2 bg-[#1A1A1E] rounded text-center border border-[#2A2A2E]">
                      <div className="text-xs font-bold text-[#F0ECE1]">{char}</div>
                      <div className="text-[10px] font-mono text-[#C9A050]">{formatLocalizedDigits(CHALDEAN_VALUES[char] || 0, currentLang)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Output */}
            <div className="bg-[#1A1A1E] p-5 rounded-xl border border-[#2A2A2E] space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-[#9E9A90]">{t('numerology.chaldean.compound_vibration')}</span>
                <span className="text-lg font-serif font-bold text-[#C9A050] font-mono">{formatLocalizedDigits(testChaldeanSum, currentLang)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-[#9E9A90]">{t('numerology.chaldean.single_namank')}</span>
                <span className="text-2xl font-serif font-bold text-[#C9A050] font-mono">{formatLocalizedDigits(testChaldeanSingle, currentLang)}</span>
              </div>

              <div className="p-3 rounded-lg bg-[#141418] border border-[#2A2A2E] text-xs">
                <span className="font-serif font-bold text-[#C9A050] block mb-1">{t('numerology.chaldean.compatibility_title')}</span>
                <p className="text-[#9E9A90] text-[11px] leading-relaxed">
                  {getLocalizedChaldeanCompatibility(testChaldeanSingle, currentLang, t)}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-[#9E9A90] tracking-wider">{t('numerology.chaldean.recommendations_title')}</span>
                {activeNumerology.nameCorrectionSuggestions.map((sug, i) => (
                  <p key={i} className="text-[11px] text-[#9E9A90]">• {getLocalizedChaldeanSuggestion(sug, testChaldeanSingle, currentLang, t)}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 4: Numerology Remedies */}
      {activeTab === 'remedies' && (
        <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl space-y-4">
          <div className="pb-3 border-b border-[#2A2A2E]">
            <h3 className="text-base font-serif font-bold text-[#F0ECE1] flex items-center space-x-2">
              <Flame className="w-4 h-4 text-[#C9A050]" />
              <span>{t('numerology.remedies.title')}</span>
            </h3>
            <p className="text-xs font-sans text-[#9E9A90] mt-1">
              {t('numerology.remedies.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
            {(aiInsights?.remedies || activeNumerology.remedies).map((rem: string, idx: number) => (
              <div key={idx} className="p-3.5 bg-[#1A1A1E] rounded-xl border border-[#2A2A2E] flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-[#C9A050]/20 text-[#C9A050] font-serif font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-[#C9A050]/30">
                  {formatLocalizedDigits(idx + 1, currentLang)}
                </span>
                <p className="text-xs text-[#E5E1D8] leading-relaxed">
                  {(aiInsights?.remedies ? aiInsights.remedies[idx] : null) || getLocalizedRemedy(rem, idx, currentLang, t)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
