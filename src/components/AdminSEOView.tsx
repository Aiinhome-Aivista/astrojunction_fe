import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Save, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Share2, 
  Sparkles, 
  Image as ImageIcon, 
  Tag, 
  Compass, 
  Sun, 
  HeartHandshake, 
  Hash, 
  Calendar, 
  CreditCard, 
  BookOpen, 
  Layout, 
  ExternalLink 
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { TAB_SEO_CONFIG, DEFAULT_SEO, SEOProps } from '../config/seoConfig';

interface AdminSEOViewProps {
  theme: 'dark' | 'light';
}

interface PageMetaItem {
  id: string;
  name: string;
  icon: any;
  path: string;
}

const PAGES_LIST: PageMetaItem[] = [
  { id: 'landing', name: 'Landing Page', icon: Layout, path: '/' },
  { id: 'daily', name: 'Daily Horoscope & Panchang', icon: Sun, path: '/#daily' },
  { id: 'horoscope', name: 'Janam Kundli', icon: Compass, path: '/#horoscope' },
  { id: 'matchmaking', name: 'Kundli Milan', icon: HeartHandshake, path: '/#matchmaking' },
  { id: 'numerology', name: 'Vedic Numerology', icon: Hash, path: '/#numerology' },
  { id: 'panjika', name: 'Vedic Panjika Calendar', icon: Calendar, path: '/#panjika' },
  { id: 'consultations', name: 'Astrologer Consultations', icon: CreditCard, path: '/#consultations' },
  { id: 'counsellor', name: 'AI Daivajna Counsellor', icon: Sparkles, path: '/#counsellor' },
  { id: 'blogs', name: 'Blogs & Articles', icon: BookOpen, path: '/#blogs' },
];

export const AdminSEOView: React.FC<AdminSEOViewProps> = ({ theme }) => {
  const [selectedPageId, setSelectedPageId] = useState<string>('landing');
  const [seoData, setSeoData] = useState<Record<string, SEOProps>>(() => ({ ...TAB_SEO_CONFIG }));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load custom SEO settings from backend database
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        const data = await adminApi.getSeoConfig();
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          setSeoData((prev) => ({
            ...prev,
            ...data,
          }));
        }
      } catch (err: any) {
        console.warn('Could not load custom SEO settings, using defaults:', err);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const currentPage = seoData[selectedPageId] || TAB_SEO_CONFIG[selectedPageId] || DEFAULT_SEO;
  const pageDef = PAGES_LIST.find((p) => p.id === selectedPageId) || PAGES_LIST[0];

  const handleFieldChange = (field: keyof SEOProps, value: any) => {
    setSeoData((prev) => ({
      ...prev,
      [selectedPageId]: {
        ...(prev[selectedPageId] || TAB_SEO_CONFIG[selectedPageId] || DEFAULT_SEO),
        [field]: value,
      },
    }));
  };

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const parts = raw.split(',').map((k) => k.trim());
    handleFieldChange('keywords', parts);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await adminApi.updateSeoConfig(seoData);
      setSuccessMsg('SEO configurations saved to database successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to save SEO configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = () => {
    if (!window.confirm(`Reset SEO settings for ${pageDef.name} to system recommended defaults?`)) return;
    const defaultForPage = TAB_SEO_CONFIG[selectedPageId] || DEFAULT_SEO;
    setSeoData((prev) => ({
      ...prev,
      [selectedPageId]: { ...defaultForPage },
    }));
    setSuccessMsg(`Reset ${pageDef.name} to default values.`);
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const isDark = theme === 'dark';
  const bgCard = isDark ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-white border-[#E5E1D8]';
  const textMuted = isDark ? 'text-[#9E9A90]' : 'text-gray-500';

  const titleLength = currentPage.title.length;
  const descLength = currentPage.description.length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold tracking-wide flex items-center gap-2.5">
            <Globe className="w-6 h-6 text-[#C9A050]" />
            SEO & <span className="text-[#C9A050]">Meta Tags Management</span>
          </h2>
          <p className={`mt-1 text-xs ${textMuted}`}>
            Dynamically configure titles, search descriptions, keywords, and social preview cards for every page.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleResetToDefault}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isDark ? 'border-[#2A2A2E] text-[#9E9A90] hover:bg-[#1C1C22] hover:text-white' : 'border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
            title="Reset selected page to recommended defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Page</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold bg-[#C9A050] text-[#0D0D0F] hover:bg-[#D4AF37] transition-all shadow-md shadow-[#C9A050]/20 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving to Database...' : 'Save All Changes'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center space-x-2 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-500 text-xs animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Page Selectors Bar */}
      <div className={`p-2.5 rounded-2xl border ${bgCard} flex items-center gap-2 overflow-x-auto no-scrollbar md:flex-wrap`}>
        {PAGES_LIST.map((page) => {
          const Icon = page.icon;
          const isSelected = page.id === selectedPageId;
          return (
            <button
              key={page.id}
              onClick={() => setSelectedPageId(page.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-[#C9A050] text-[#0D0D0F] shadow-sm font-bold'
                  : isDark
                  ? 'text-[#E5E1D8] hover:bg-white/5 hover:text-[#C9A050] border border-transparent hover:border-[#2A2A2E]'
                  : 'text-gray-700 hover:bg-black/5 hover:text-[#8C6218] border border-transparent hover:border-gray-200'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{page.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Form Inputs + Live Preview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Editor (7 cols) */}
        <div className={`lg:col-span-7 rounded-2xl border p-6 space-y-5 ${bgCard}`}>
          <div className="flex items-center justify-between border-b pb-3 border-inherit">
            <h3 className="text-sm font-bold flex items-center space-x-2">
              <pageDef.icon className="w-4 h-4 text-[#C9A050]" />
              <span>Editing: {pageDef.name}</span>
            </h3>
            <span className={`text-[11px] px-2 py-0.5 rounded-full ${isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
              Key: {selectedPageId}
            </span>
          </div>

          {/* Title Tag */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className={`text-xs font-bold ${isDark ? 'text-[#C9A050]' : 'text-[#8C6218]'}`}>
                Page Title Tag
              </label>
              <span className={`text-[11px] font-mono ${titleLength > 65 ? 'text-amber-500 font-bold' : textMuted}`}>
                {titleLength} / 60 chars
              </span>
            </div>
            <input
              type="text"
              value={currentPage.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder="Enter page title..."
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition-all ${
                isDark ? 'bg-[#1C1C22] border-[#2A2A2E] text-white focus:border-[#C9A050]' : 'bg-white border-[#DFC896] text-gray-900 focus:border-[#C9A050]'
              }`}
            />
          </div>

          {/* Meta Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className={`text-xs font-bold ${isDark ? 'text-[#C9A050]' : 'text-[#8C6218]'}`}>
                Meta Description
              </label>
              <span className={`text-[11px] font-mono ${descLength > 165 ? 'text-amber-500 font-bold' : textMuted}`}>
                {descLength} / 160 chars
              </span>
            </div>
            <textarea
              rows={3}
              value={currentPage.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Enter comprehensive meta description for search engines..."
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition-all resize-y ${
                isDark ? 'bg-[#1C1C22] border-[#2A2A2E] text-white focus:border-[#C9A050]' : 'bg-white border-[#DFC896] text-gray-900 focus:border-[#C9A050]'
              }`}
            />
          </div>

          {/* Meta Keywords */}
          <div className="space-y-1.5">
            <label className={`text-xs font-bold flex items-center space-x-1.5 ${isDark ? 'text-[#C9A050]' : 'text-[#8C6218]'}`}>
              <Tag className="w-3.5 h-3.5" />
              <span>Target Keywords</span>
            </label>
            <input
              type="text"
              value={Array.isArray(currentPage.keywords) ? currentPage.keywords.join(', ') : (currentPage.keywords || '')}
              onChange={handleKeywordsChange}
              placeholder="vedic astrology, janam kundli, daily horoscope..."
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition-all ${
                isDark ? 'bg-[#1C1C22] border-[#2A2A2E] text-white focus:border-[#C9A050]' : 'bg-white border-[#DFC896] text-gray-900 focus:border-[#C9A050]'
              }`}
            />
            {Array.isArray(currentPage.keywords) && currentPage.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentPage.keywords.map((kw, i) => (
                  <span
                    key={i}
                    className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                      isDark ? 'bg-[#C9A050]/15 text-[#E8C470]' : 'bg-[#FAF2DA] text-[#8C6218] border border-[#DFC896]'
                    }`}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Social Share Image */}
          <div className="space-y-1.5">
            <label className={`text-xs font-bold flex items-center space-x-1.5 ${isDark ? 'text-[#C9A050]' : 'text-[#8C6218]'}`}>
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Social Share Preview Image</span>
            </label>
            <input
              type="text"
              value={currentPage.ogImage || ''}
              onChange={(e) => handleFieldChange('ogImage', e.target.value)}
              placeholder="/golden_zodiac_wheel.jpg or https://..."
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none transition-all ${
                isDark ? 'bg-[#1C1C22] border-[#2A2A2E] text-white focus:border-[#C9A050]' : 'bg-white border-[#DFC896] text-gray-900 focus:border-[#C9A050]'
              }`}
            />
          </div>
        </div>

        {/* Right Column: Live Interactive Previews (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Google SERP (Search Result) Preview */}
          <div className={`rounded-2xl border p-5 space-y-3 ${bgCard}`}>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#C9A050]">
              <Search className="w-3.5 h-3.5" />
              <span>Google Search Preview</span>
            </div>

            <div
              className={`p-4 rounded-xl font-sans space-y-1 border transition-colors ${
                isDark
                  ? 'bg-[#18181D] border-[#2A2A2E] text-[#e8eaed]'
                  : 'bg-white border-gray-200 text-gray-900 shadow-inner'
              }`}
            >
              <div className="flex items-center space-x-2 text-[11px]">
                <span className="w-4 h-4 rounded-full bg-[#C9A050] text-[9px] text-[#0D0D0F] flex items-center justify-center font-bold">
                  AJ
                </span>
                <span className={`truncate ${isDark ? 'text-[#9aa0a6]' : 'text-gray-600'}`}>
                  https://astrojunction.com {pageDef.path}
                </span>
              </div>
              <h4
                className={`text-base font-medium line-clamp-1 leading-snug cursor-pointer hover:underline ${
                  isDark ? 'text-[#8ab4f8]' : 'text-[#1a0dab]'
                }`}
              >
                {currentPage.title || 'Page Title'}
              </h4>
              <p className={`text-xs line-clamp-2 leading-relaxed ${isDark ? 'text-[#bdc1c6]' : 'text-[#4d5156]'}`}>
                {currentPage.description || 'Meta description will appear here in search engine results.'}
              </p>
            </div>
          </div>

          {/* 2. WhatsApp / Social Media Share Preview Card */}
          <div className={`rounded-2xl border p-5 space-y-3 ${bgCard}`}>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#C9A050]">
              <Share2 className="w-3.5 h-3.5" />
              <span>Social Share Card Preview</span>
            </div>

            <div
              className={`rounded-xl overflow-hidden border transition-colors ${
                isDark
                  ? 'border-[#2A2A2E] bg-[#18181D] shadow-lg shadow-black/40'
                  : 'border-gray-200 bg-white shadow-sm'
              }`}
            >
              <div className="aspect-[1.91/1] w-full bg-black/20 overflow-hidden relative">
                <img
                  src={currentPage.ogImage || '/golden_zodiac_wheel.jpg'}
                  alt="OG Preview"
                  className="w-full h-full object-cover"
                  onError={(e: any) => {
                    e.currentTarget.src = '/golden_zodiac_wheel.jpg';
                  }}
                />
              </div>
              <div
                className={`p-3 space-y-1 border-t transition-colors ${
                  isDark ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
                  ASTROJUNCTION.COM
                </span>
                <h5 className={`text-xs font-bold line-clamp-1 leading-tight ${isDark ? 'text-[#F0ECE1]' : 'text-gray-900'}`}>
                  {currentPage.title}
                </h5>
                <p className={`text-[11px] line-clamp-2 leading-relaxed ${isDark ? 'text-[#9E9A90]' : 'text-gray-600'}`}>
                  {currentPage.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
