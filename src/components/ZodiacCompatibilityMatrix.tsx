import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, ChevronDown } from 'lucide-react';
import { getTranslation } from '../services/translations';
import { ZodiacCompatibilityResult } from '../services/zodiacData';
import { useZodiacData } from '../hooks/useZodiacData';
import { api } from '../services/api';
import { API_ENDPOINTS } from '../config/api_config';
import { sessionTracker } from '../services/sessionTracker';

const CustomZodiacSelect = ({ value, onChange, theme, label, zodiacs }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!zodiacs || !zodiacs.length) {
    return <div className="text-center p-4 text-[#C9A050]">Loading...</div>;
  }
  const selectedSign = zodiacs.find((s: any) => s.id === value) || zodiacs[0];
    
  const dropdownRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {label && <label className={`text-xs block mb-1 ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-black font-semibold'}`}>{label}</label>}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-[42px] flex items-center justify-between border px-3 rounded-xl text-xs font-semibold focus:outline-none transition-colors ${
          theme === 'dark' 
            ? 'bg-[#1C1C22] border-[#2A2A2E] text-[#F0ECE1] hover:border-[#C9A050]' 
            : 'bg-[#FFFFFF] border-[#E5E1D8] text-[#2A2A2E] hover:border-[#C9A050]'
        } ${isOpen ? 'border-[#C9A050] ring-1 ring-[#C9A050]/50' : ''}`}
      >
        <div className="flex items-center space-x-2 min-w-0 mr-1">
          <span className="text-lg text-[#C9A050] astro-emoji-text flex-shrink-0">
            {selectedSign.symbol}&#xFE0E;
          </span>
          <span className="truncate whitespace-nowrap">{selectedSign.name} ({selectedSign.sanskritName})</span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 opacity-70 flex-shrink-0" />
      </button>

      {isOpen && (
        <div className={`absolute z-50 w-full mt-1 border rounded-lg shadow-xl max-h-60 overflow-y-auto scrollbar-thin ${
          theme === 'dark'
            ? 'bg-[#1C1C22] border-[#2A2A2E]'
            : 'bg-[#FFFFFF] border-[#E5E1D8] shadow-black/5'
        }`}>
          {zodiacs.map((s) => (
            <div
              key={s.id}
              onClick={() => {
                onChange(s.id);
                setIsOpen(false);
              }}
              className={`flex items-center space-x-2 px-3 py-2 cursor-pointer transition-colors text-xs font-semibold ${
                value === s.id 
                  ? (theme === 'dark' ? 'bg-[#C9A050]/20 text-[#C9A050]' : 'bg-[#C9A050]/10 text-[#94691E]') 
                  : (theme === 'dark' ? 'text-[#F0ECE1] hover:bg-[#2A2A2E]' : 'text-[#2A2A2E] hover:bg-[#FAF8F2]')
              }`}
            >
              <span className={`text-lg astro-emoji-text ${value === s.id ? '' : 'text-[#C9A050]'}`}>
                {s.symbol}&#xFE0E;
              </span>
              <span>{s.name} ({s.sanskritName})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface ZodiacCompatibilityMatrixProps {
  language?: string;
  theme?: 'light' | 'dark';
  zodiacSystem?: 'tropical' | 'sidereal';
}

export const ZodiacCompatibilityMatrix: React.FC<ZodiacCompatibilityMatrixProps> = ({
  language = 'en',
  theme = 'dark',
  zodiacSystem = 'tropical'
}) => {
  const { t: i18nT } = useTranslation();
  const t = (key: string): string => {
    try {
      const res = i18nT(key);
      if (typeof res === 'string' && res !== key) return res;
    } catch {
      // fallback
    }
    return getTranslation(key, language);
  };
  const isDark = theme === 'dark';

  const [compatSignA, setCompatSignA] = useState('aries');
  const [compatSignB, setCompatSignB] = useState('gemini');
  const [isCompatLoading, setIsCompatLoading] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [compatResult, setCompatResult] = useState<ZodiacCompatibilityResult | null>(null);
  const compatResultRef = useRef<HTMLDivElement>(null);
  const { zodiacs, loading } = useZodiacData();

  if (loading || !zodiacs || zodiacs.length === 0) {
    return <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A050]"></div></div>;
  }

  const handleAnalyze = async () => {
    setIsCompatLoading(true);
    setHasAnalyzed(false);
    
    const start = Date.now();
    try {
      const response = await api.post<any>(API_ENDPOINTS.ZODIAC.COMPATIBILITY, {
        signA: compatSignA,
        signB: compatSignB,
        system: zodiacSystem,
        language: language
      });

      const signAObj = zodiacs.find((s: any) => s.id === compatSignA) || zodiacs[0];
      const signBObj = zodiacs.find((s: any) => s.id === compatSignB) || zodiacs[0];

      setCompatResult({
        ...response,
        signA: signAObj,
        signB: signBObj
      });
      setHasAnalyzed(true);

      sessionTracker.trackCompatibilityCheck({
        signA: compatSignA,
        signB: compatSignB,
        system: zodiacSystem,
        result: response,
        status: 'SUCCESS',
        executionTimeMs: Date.now() - start,
      });
    } catch (error: any) {
      console.error("Compatibility analysis failed", error);
      sessionTracker.trackCompatibilityCheck({
        signA: compatSignA,
        signB: compatSignB,
        system: zodiacSystem,
        status: 'FAILURE',
        errorMessage: error?.message || 'Compatibility check failed',
        executionTimeMs: Date.now() - start,
      });
    } finally {
      setIsCompatLoading(false);
    }
  };

  return (
    <div className={`mt-6 rounded-[2rem] overflow-hidden border shadow-xl flex flex-col lg:flex-row transition-all min-h-[420px] lg:min-h-[460px] ${isDark ? 'bg-[#141418]/95 border-[#2A2A2E] shadow-black/40' : 'bg-[#FFFFFF]/95 border-[#E5E1D8] shadow-amber-900/5'}`}>
      
      {/* Artwork Side */}
      <div className="w-full lg:w-[35%] xl:w-[40%] relative min-h-[250px] lg:min-h-full flex-shrink-0 border-b lg:border-b-0 lg:border-r border-[#E5E1D8] dark:border-[#2A2A2E]">
        <img 
          src="/zodiac_compatibility_art.jpg" 
          alt="Zodiac Compatibility" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
        />
        <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.6)] pointer-events-none"></div>
      </div>

      {/* Content Side */}
      <div className="w-full lg:w-[65%] xl:w-[60%] p-6 lg:p-8 flex flex-col justify-center space-y-6">
        <div className={`pb-4 border-b space-y-3.5 ${isDark ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}>
          <div>
            <h3 className={`text-base font-bold flex items-center space-x-2 ${isDark ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
              <Heart className="w-4 h-4 text-[#C9A050]" />
              <span>{t('compat.title')}</span>
            </h3>
            <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${isDark ? 'text-[#9E9A90]' : 'text-black'}`}>
              {t('compat.subtitle')}
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-3 text-xs">
            <div className="w-full sm:w-[180px]">
              <CustomZodiacSelect
                value={compatSignA}
                onChange={(val: string) => {
                  setCompatSignA(val);
                  setHasAnalyzed(false);
                }}
                theme={theme}
                label={t('compat.primary_sign')}
                zodiacs={zodiacs}
              />
            </div>

            <div className="w-full sm:w-[180px]">
              <CustomZodiacSelect
                value={compatSignB}
                onChange={(val: string) => {
                  setCompatSignB(val);
                  setHasAnalyzed(false);
                }}
                theme={theme}
                label={t('compat.partner_sign')}
                zodiacs={zodiacs}
              />
            </div>
            
            <div className="w-full sm:w-[180px]">
              <label className="text-[11px] block mb-1 opacity-0 select-none pointer-events-none hidden sm:block">&nbsp;</label>
              <button
                onClick={handleAnalyze}
                className={`w-full h-[42px] px-5 rounded-xl font-bold text-sm transition shadow-sm flex items-center justify-center cursor-pointer ${isDark ? 'bg-[#C9A050] text-[#141418] hover:bg-[#D4AF60]' : 'bg-[#C9A050] text-white hover:bg-[#B88E40]'}`}
              >
                <span>{t('compat.btn_analyze')}</span>
              </button>
            </div>
          </div>
        </div>

      {/* Explanatory Guide: Displayed Before Analysis */}
      {!hasAnalyzed && !isCompatLoading && (
        <div className="space-y-4 animate-in fade-in duration-500">
          <div className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed ${
            isDark ? 'bg-[#1C1C22]/60 border-[#2A2A2E] text-[#D0CBC0]' : 'bg-[#FAF8F2] border-[#E8E1D5] text-black'
          }`}>
            <p className="mb-2 font-medium">
              <strong className="text-[#C9A050] font-semibold">{t('compat.how_it_works_title')}</strong> {t('compat.how_it_works_desc')}
            </p>
            <p className="text-xs leading-relaxed opacity-90">
              It evaluates cross-sign affinity by measuring core celestial dimensions:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={`p-3.5 rounded-xl border ${
              isDark ? 'bg-[#18181D] border-[#2A2A2E]' : 'bg-[#FFFFFF] border-[#E8E1D5] shadow-xs'
            }`}>
              <div className="flex items-center space-x-2 text-xs font-bold text-[#C9A050] mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A050]"></span>
                <span>{t('compat.element_synergy')}</span>
              </div>
              <p className={`text-[11px] sm:text-xs leading-relaxed ${isDark ? 'text-[#9E9A90]' : 'text-black font-medium'}`}>
                {t('compat.element_synergy_desc')}
              </p>
            </div>

            <div className={`p-3.5 rounded-xl border ${
              isDark ? 'bg-[#18181D] border-[#2A2A2E]' : 'bg-[#FFFFFF] border-[#E8E1D5] shadow-xs'
            }`}>
              <div className="flex items-center space-x-2 text-xs font-bold text-[#C9A050] mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A050]"></span>
                <span>{t('compat.romance_title', t('compat.romance'))}</span>
              </div>
              <p className={`text-[11px] sm:text-xs leading-relaxed ${isDark ? 'text-[#9E9A90]' : 'text-black font-medium'}`}>
                {t('compat.romance_desc')}
              </p>
            </div>

            <div className={`p-3.5 rounded-xl border ${
              isDark ? 'bg-[#18181D] border-[#2A2A2E]' : 'bg-[#FFFFFF] border-[#E8E1D5] shadow-xs'
            }`}>
              <div className="flex items-center space-x-2 text-xs font-bold text-[#C9A050] mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A050]"></span>
                <span>{t('compat.remedial')}</span>
              </div>
              <p className={`text-[11px] sm:text-xs leading-relaxed ${isDark ? 'text-[#9E9A90]' : 'text-black font-medium'}`}>
                {t('compat.remedial_desc')}
              </p>
            </div>
          </div>

          <div className={`p-2.5 rounded-lg border text-center text-xs font-semibold ${
            isDark ? 'bg-[#C9A050]/10 border-[#C9A050]/30 text-[#C9A050]' : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            {t('compat.select_signs_hint')}
          </div>
        </div>
      )}

      {/* Compatibility Breakdown Card */}
      {isCompatLoading && (
        <div className={`flex flex-col items-center justify-center p-8 sm:p-12 rounded-xl border text-center animate-pulse w-full ${isDark ? 'bg-[#1C1C22] border-[#2A2A2E]' : 'bg-[#FAF8F2] border-[#E5E1D8]'}`}>
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-[#C9A050] mb-4"></div>
          <p className="text-xs sm:text-sm font-semibold tracking-wider text-[#C9A050] animate-pulse font-serif">
            {t('compat.btn_analyzing')}
          </p>
        </div>
      )}

      {hasAnalyzed && !isCompatLoading && compatResult && (
        <div ref={compatResultRef} className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 items-stretch">
        {/* Score circle */}
        <div className={`flex flex-col items-center justify-center p-4 sm:p-6 rounded-xl border text-center h-full ${isDark ? 'bg-[#1C1C22] border-[#2A2A2E]' : 'bg-[#FFFFFF] border-[#E5E1D8]'}`}>
          <div className="w-20 h-20 rounded-full border-4 border-[#C9A050] flex flex-col items-center justify-center shadow-lg shadow-[#C9A050]/20 mb-3">
            <span className={`text-xl font-bold ${isDark ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>{compatResult.overallScore}%</span>
            <span className={`text-xs uppercase tracking-wider ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>{t('compat.overall_score')}</span>
          </div>
          <div className="text-xs font-bold text-[#C9A050]">
            {compatResult.signA.name} + {compatResult.signB.name}
          </div>
          <div className={`text-xs mt-0.5 ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
            {compatResult.signA.element} & {compatResult.signB.element}
          </div>
        </div>

        {/* Analysis details */}
        <div className={`flex flex-col justify-center space-y-2 sm:space-y-3 text-xs ${isDark ? 'text-[#E5E1D8]' : 'text-gray-700'}`}>
          <div className={`p-3 rounded-lg border ${isDark ? 'bg-[#1C1C22] border-[#2A2A2E]/80' : 'bg-[#FFFFFF] border-[#E5E1D8]'}`}>
            <span className="font-semibold text-[#C9A050] block mb-0.5">{t('compat.element_synergy')}:</span>
            <span className={`${isDark ? 'text-[#9E9A90]' : 'text-black font-medium'}`}>{compatResult.elementSynergy}</span>
          </div>

          <div className={`p-3 rounded-lg border ${isDark ? 'bg-[#1C1C22] border-[#2A2A2E]/80' : 'bg-[#FFFFFF] border-[#E5E1D8]'}`}>
            <span className="font-semibold text-[#C9A050] block mb-0.5">{t('compat.romance')}:</span>
            <span className={`${isDark ? 'text-[#9E9A90]' : 'text-black font-medium'}`}>{compatResult.romanceAnalysis}</span>
          </div>

          <div className={`p-3 rounded-lg border ${isDark ? 'bg-[#1C1C22] border-[#2A2A2E]/80' : 'bg-[#FFFFFF] border-[#E5E1D8]'}`}>
            <span className="font-semibold text-[#C9A050] block mb-0.5">{t('compat.remedial')}:</span>
            <span className={`${isDark ? 'text-[#9E9A90]' : 'text-black font-medium'}`}>{compatResult.remedialAdvice}</span>
          </div>
        </div>
      </div>
      )}
      </div>
    </div>
  );
};
