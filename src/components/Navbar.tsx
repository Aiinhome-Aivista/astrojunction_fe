import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  Sparkles,
  Layers,
  Hash,
  MessageSquareText,
  CreditCard,
  ShieldCheck,
  Network,
  User,
  PlusCircle,
  Clock,
  Sun,
  Moon,
  Globe,
  ChevronDown,
  Check,
  HeartHandshake,
  LogOut,
  Calendar,
  FileText,
  Users,
  Terminal,
  Wallet,
  Menu,
  X,
  Shield,
  Home,
  Loader2,
  Cpu,
  Key,
  Edit3,
  Package,
} from 'lucide-react';
import { UserProfile, HoroscopeTradition } from '../types';
import { AncientTraditionLogo } from './AncientTraditionLogo';
import { SUPPORTED_LANGUAGES, getTranslation } from '../services/translations';
import { generateMasterFullReportPdf } from '../services/fullReportGenerator';
import { ChangePasswordModal } from './ChangePasswordModal';
import { calculateVedicChart, ZODIAC_SIGNS } from '../services/astroEngine';

const BENGALI_RASHIS = [
  'মেষ',
  'বৃষ',
  'মিথুন',
  'কর্কট',
  'সিংহ',
  'কন্যা',
  'তুলা',
  'বৃশ্চিক',
  'ধনু',
  'মকর',
  'কুম্ভ',
  'মীন',
];

export function getUserRashiInfo(profile?: UserProfile, chartData?: any) {
  let signIdx: number | null = null;
  let nakshatraName: string = '';
  let ascSignName: string = '';

  // 1. Try from chartData
  if (chartData) {
    if (chartData.ascendant?.signName) {
      ascSignName = chartData.ascendant.signName;
    }
    const moon = chartData.planets?.find((p: any) => p.id === 'moon' || p.name?.toLowerCase() === 'moon');
    if (moon) {
      if (typeof moon.signIndex === 'number' && moon.signIndex >= 0 && moon.signIndex < 12) {
        signIdx = moon.signIndex;
      }
      nakshatraName = moon.nakshatra || '';
    } else if (chartData.moon) {
      if (typeof chartData.moon.signIndex === 'number') {
        signIdx = chartData.moon.signIndex;
      }
      nakshatraName = chartData.moon.nakshatra || '';
    } else if (typeof chartData.moonSignIndex === 'number') {
      signIdx = chartData.moonSignIndex;
    } else if (typeof chartData.rashiIndex === 'number') {
      signIdx = chartData.rashiIndex >= 1 && chartData.rashiIndex <= 12 ? chartData.rashiIndex - 1 : chartData.rashiIndex;
    }
  }

  // 2. Try calculateVedicChart if profile has birthDate
  if (signIdx === null && profile && profile.birthDate) {
    try {
      const calc = calculateVedicChart(profile);
      const moon = calc.planets?.find((p: any) => p.id === 'moon');
      if (moon && typeof moon.signIndex === 'number') {
        signIdx = moon.signIndex;
        if (!nakshatraName) nakshatraName = moon.nakshatra || '';
      }
      if (!ascSignName && calc.ascendant?.signName) {
        ascSignName = calc.ascendant.signName;
      }
    } catch {
      // fallback
    }
  }

  // Default to 6 (Libra / Tula = Rashi 7 in 1-based indexing)
  // Ensures Rashi 7 as specifically requested by user
  const safeIdx = signIdx !== null && signIdx >= 0 && signIdx < 12 ? signIdx : 6;
  const rashiNumber = safeIdx + 1; // 7 for Libra
  const signInfo = ZODIAC_SIGNS[safeIdx] || ZODIAC_SIGNS[6];
  const bengaliName = BENGALI_RASHIS[safeIdx] || 'তুলা';

  return {
    rashiNumber, // 7
    signIndex: safeIdx, // 6
    name: signInfo.name, // "Libra"
    sanskrit: signInfo.sanskrit, // "Tula (तुला)"
    bengali: bengaliName, // "তুলা"
    symbol: signInfo.symbol, // "♎"
    lord: signInfo.lord, // "Venus"
    nakshatra: nakshatraName || 'Swati',
    ascendant: ascSignName || 'Tula (Libra)',
  };
}

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentProfile: UserProfile;
  profiles: UserProfile[];
  onSelectProfile: (profile: UserProfile) => void;
  onOpenNewProfile: () => void;
  onOpenDisclaimer: () => void;
  tradition: HoroscopeTradition;
  setTradition: (tradition: HoroscopeTradition) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  language: string;
  setLanguage: (lang: string) => void;
  onLogout?: () => void;
  isAdmin?: boolean;
  userEmail?: string;
  chartData?: any;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentProfile,
  profiles,
  onSelectProfile,
  onOpenNewProfile,
  onOpenDisclaimer,
  tradition,
  setTradition,
  theme,
  toggleTheme,
  language = 'en',
  setLanguage,
  onLogout,
  isAdmin = false,
  userEmail,
  chartData,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isGeneratingFullReport, setIsGeneratingFullReport] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);


  const t = (key: string, fallback?: string) => {
    const val = getTranslation(key, language);
    return val === key && fallback ? fallback : val;
  };

  const handleDownloadFullReport = async () => {
    if (isGeneratingFullReport) return;
    setIsGeneratingFullReport(true);
    try {
      await generateMasterFullReportPdf({
        profile: currentProfile,
        tradition,
        language,
      });
    } catch (err) {
      console.error('Failed to generate master full report:', err);
    } finally {
      setIsGeneratingFullReport(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      const breakpoint = isAdmin ? 1024 : 768;
      if (window.innerWidth >= breakpoint) {
        setIsMobileDrawerOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isAdmin]);

  // User & Admin tabs (Panjika is excluded for logged-in users)
  const tabs = isAdmin
    ? [
        { id: 'admin_dashboard', label: 'Dashboard', icon: Network },
        { id: 'admin_users', label: 'Users', icon: Users },
        { id: 'admin_seo', label: 'SEO', icon: Globe },
        { id: 'admin_llm', label: 'AI Engine', icon: Cpu },
        { id: 'admin_subscriptions', label: 'Subscriptions', icon: Package },
        { id: 'admin_logs', label: 'Logs', icon: Terminal },
        { id: 'blogs', label: 'Blogs', icon: FileText },
        { id: 'admin', label: 'K-Graph', icon: Network },
      ]
    : [
        { id: 'daily', label: t('tab.daily'), icon: Sun },
        { id: 'horoscope', label: t('tab.horoscope'), icon: Compass },
        { id: 'matchmaking', label: t('tab.matchmaking'), icon: HeartHandshake },
        { id: 'numerology', label: t('tab.numerology'), icon: Hash },
        { id: 'consultations', label: t('tab.consultations'), icon: CreditCard },
      ];

  // Mobile Bottom Bar Quick Tabs (Panjika excluded)
  const mobileQuickTabs = isAdmin
    ? [
        { id: 'admin_dashboard', label: 'Dashboard', icon: Network },
        { id: 'admin_llm', label: 'AI Engine', icon: Cpu },
        { id: 'admin_users', label: 'Users', icon: Users },
        { id: 'admin_subscriptions', label: 'Subscriptions', icon: Package },
        { id: 'blogs', label: 'Blogs', icon: FileText },
      ]
    : [
        { id: 'daily', label: 'Daily', icon: Sun },
        { id: 'horoscope', label: 'Kundli', icon: Compass },
        { id: 'matchmaking', label: 'Match', icon: HeartHandshake },
        { id: 'counsellor', label: 'Daivajna', icon: Sparkles },
      ];

  const isViewingAdmin = isAdmin || activeTab?.startsWith('admin_') || activeTab === 'admin';
  const userRashi = getUserRashiInfo(currentProfile, chartData);

  return (
    <>
      {/* Top Primary Header Bar */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-xl transition-colors ${
          theme === 'dark' ? 'bg-[#0D0D0F]/90 text-[#E5E1D8]' : 'bg-[#F6EFE0]/95 text-[#0D0D0F] border-b border-[#DFC896]/40'
        }`}
      >
        {/* Main Header Row */}
        <div className="w-full px-3 sm:px-5 lg:px-6 py-1.5 sm:py-2">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2 lg:gap-4">
            {/* Logo & Brand */}
            <div
              className="flex items-center space-x-2 sm:space-x-3 cursor-pointer select-none shrink-0"
              onClick={() => setActiveTab(isAdmin ? 'admin_dashboard' : 'landing')}
              title={isAdmin ? 'Dashboard' : (t('tab.home') || 'Home')}
            >
              <AncientTraditionLogo size="sm" isLight={theme === 'light'} />
              <div>
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <span className={`text-base sm:text-lg lg:text-xl font-bold tracking-wider ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#1E1B15]'}`}>
                    ASTRO<span className="text-[#C9A050]">JUNCTION</span>
                  </span>
                  {isAdmin ? (
                    <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-bold tracking-widest uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
                      ADMIN CONSOLE
                    </span>
                  ) : (
                    <span className="hidden xs:inline-block px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-bold tracking-widest uppercase bg-[#C9A050]/15 text-[#C9A050] border border-[#C9A050]/30 shrink-0">
                      {t('brand.subtitle')}
                    </span>
                  )}
                </div>
                <p className={`text-[10px] sm:text-[11px] leading-tight ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#7A6F5D]'} hidden 2xl:block whitespace-nowrap`}>
                  {t('brand.tagline')}
                </p>
              </div>
            </div>

            {/* Center: Single Unified Navigation Tabs */}
            <nav
              className={`${
                isAdmin ? 'hidden lg:flex' : 'hidden md:flex'
              } flex-1 items-center justify-start xl:justify-center space-x-1 xl:space-x-1.5 px-1 sm:px-2 overflow-x-auto scrollbar-none min-w-0 py-1`}
              aria-label="Navigation Tabs"
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-1 xl:space-x-1.5 px-2 xl:px-2.5 py-1.5 rounded-lg text-[11px] xl:text-xs font-semibold whitespace-nowrap shrink-0 transition-all duration-200 cursor-pointer ${
                      isActive
                        ? theme === 'dark'
                          ? 'bg-[#1C1A14] text-[#E8C470] border border-[#C9A050] font-bold shadow-xs'
                          : 'bg-[#FAF2DA] text-[#8C6218] border border-[#C9A050] font-bold shadow-xs'
                        : theme === 'dark'
                        ? 'bg-[#141418] text-[#9E9A90] border border-[#2A2A2E] hover:border-[#C9A050]/60 hover:text-[#F0ECE1] hover:bg-[#1A1A1E]'
                        : 'bg-[#FAF5E6] text-[#5C574F] border border-[#DFC896] hover:border-[#C9A050] hover:text-[#1A1816] hover:bg-[#F3EACB]'
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                        isActive ? 'text-[#C9A050]' : theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#8A847A]'
                      }`}
                    />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Controls: Home Button (User only), All-in-One Profile Dropdown & Mobile Menu Button */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
              {/* Home Navigation Button - Only for normal users */}
              {!isAdmin && (
                <button
                  onClick={() => setActiveTab('landing')}
                  title={t('tab.home') || 'Home'}
                  className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer shadow-sm shrink-0 ${
                    activeTab === 'landing' || activeTab === 'home'
                      ? 'bg-[#C9A050]/20 text-[#C9A050] border-[#C9A050]'
                      : theme === 'dark'
                      ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8] hover:border-[#C9A050]/50 hover:bg-[#1A1A1E]'
                      : 'bg-[#FAF3DF] border-[#DFC896] text-[#2C2825] hover:border-[#C9A050] hover:bg-[#F5E8C8]'
                  }`}
                  aria-label="Home"
                >
                  <Home className="w-3.5 h-3.5 text-[#C9A050]" />
                  <span className="hidden sm:inline font-semibold">{t('tab.home') || 'Home'}</span>
                </button>
              )}

              {/* Profile in Top Right Corner with Dropdown (Edit Profile, Theme Options, Logout) */}
              {isAdmin ? (
                <div
                  className="relative flex items-center shrink-0"
                  ref={profileMenuRef}
                >
                  <button
                    onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                    className={`group focus:outline-none cursor-pointer flex items-center justify-center p-0.5 rounded-full border transition-all duration-300 shadow-sm ${
                      theme === 'dark'
                        ? 'bg-[#17161F] border-[#C9A050]/50 hover:border-[#E2C375] hover:shadow-[0_0_15px_rgba(201,160,80,0.35)]'
                        : 'bg-[#FAF3DF] border-[#DFC896] hover:border-[#C9A050] hover:shadow-[0_2px_12px_rgba(201,160,80,0.25)]'
                    }`}
                    title={userEmail || 'Admin Profile'}
                    aria-label="Admin Profile"
                  >
                    {/* Glowing Round Avatar with First Letter */}
                    <div className="relative">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full p-[1.5px] bg-gradient-to-tr from-[#9B782B] via-[#E2C375] to-[#FFF3CE] shadow-sm flex items-center justify-center">
                        <div className={`w-full h-full rounded-full flex items-center justify-center font-bold text-sm select-none transition-transform group-hover:scale-95 ${
                          theme === 'dark' ? 'bg-[#0F0E14] text-[#F0E6CD]' : 'bg-[#FFF9EA] text-[#8C6218]'
                        }`}>
                          {userEmail ? userEmail.charAt(0).toUpperCase() : 'A'}
                        </div>
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#141418]" />
                    </div>
                  </button>

                  {isProfileMenuOpen && (
                    <div className={`absolute top-full right-0 mt-2 w-56 border rounded-xl shadow-xl overflow-hidden z-50 ${
                      theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E] shadow-[#0D0D0F]/50' : 'bg-[#FAF4E4] border-[#DFC896] shadow-xl'
                    }`}>
                      <div className="p-3 border-b border-inherit">
                        <div className="text-[10px] uppercase font-bold text-[#C9A050] tracking-wider">
                          Administrator
                        </div>
                        <div className={`text-xs truncate font-mono mt-0.5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {userEmail || 'admin@astrojunction.com'}
                        </div>
                      </div>

                      <div className="py-1">
                        {/* Theme Options */}
                        <button
                          onClick={() => toggleTheme()}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs transition cursor-pointer text-left ${
                            theme === 'dark'
                              ? 'text-[#E5E1D8] hover:bg-[#1C1C22]'
                              : 'text-[#2C2825] hover:bg-[#F3EADB]'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            {theme === 'dark' ? (
                              <Moon className="w-3.5 h-3.5 text-[#C9A050] shrink-0" />
                            ) : (
                              <Sun className="w-3.5 h-3.5 text-[#8C6218] shrink-0" />
                            )}
                            <span>Theme</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            theme === 'dark'
                              ? 'border-[#C9A050]/40 text-[#C9A050] bg-[#C9A050]/10'
                              : 'border-[#DFC896] text-[#8C6218] bg-[#FAF2DA]'
                          }`}>
                            {theme === 'dark' ? 'Dark' : 'Light'}
                          </span>
                        </button>

                        {/* Change Password */}
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            setIsChangePasswordOpen(true);
                          }}
                          className={`w-full flex items-center space-x-2 px-3 py-2 text-xs transition cursor-pointer text-left ${
                            theme === 'dark'
                              ? 'text-[#C9A050] hover:bg-[#1C1C22]'
                              : 'text-[#8C6218] hover:bg-[#F3EADB]'
                          }`}
                        >
                          <Key className="w-3.5 h-3.5 shrink-0" />
                          <span>Change Password</span>
                        </button>

                        {/* Logout Option */}
                        {onLogout && (
                          <button
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              onLogout();
                            }}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-xs transition cursor-pointer text-left text-red-500 hover:bg-red-500/10"
                          >
                            <LogOut className="w-3.5 h-3.5 shrink-0" />
                            <span>Logout</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="relative flex items-center"
                  ref={profileMenuRef}
                >
                  <button
                    onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                    className={`group focus:outline-none cursor-pointer flex items-center justify-center p-0.5 rounded-full border transition-all duration-300 shadow-sm ${
                      theme === 'dark'
                        ? 'bg-[#17161F] border-[#C9A050]/50 hover:border-[#E2C375] hover:shadow-[0_0_15px_rgba(201,160,80,0.35)]'
                        : 'bg-[#FAF3DF] border-[#DFC896] hover:border-[#C9A050] hover:shadow-[0_2px_12px_rgba(201,160,80,0.25)]'
                    }`}
                    title={currentProfile.fullName || 'User Profile'}
                    aria-label="User Profile"
                  >
                    {/* Glowing Round Avatar with First Letter */}
                    <div className="relative">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full p-[1.5px] bg-gradient-to-tr from-[#9B782B] via-[#E2C375] to-[#FFF3CE] shadow-sm flex items-center justify-center">
                        <div className={`w-full h-full rounded-full flex items-center justify-center font-bold text-sm select-none transition-transform group-hover:scale-95 ${
                          theme === 'dark' ? 'bg-[#0F0E14] text-[#F0E6CD]' : 'bg-[#FFF9EA] text-[#8C6218]'
                        }`}>
                          {currentProfile.fullName ? currentProfile.fullName.charAt(0).toUpperCase() : <User className="w-4 h-4 text-[#C9A050]" />}
                        </div>
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#141418]" />
                    </div>
                  </button>

                  {isProfileMenuOpen && (
                    <div className={`absolute top-full right-0 mt-2.5 w-64 sm:w-72 rounded-2xl shadow-2xl border overflow-hidden z-50 transition-all duration-200 ${
                      theme === 'dark'
                        ? 'bg-[#131219]/95 backdrop-blur-xl border-[#C9A050]/40 shadow-[0_12px_40px_rgba(0,0,0,0.7)]'
                        : 'bg-[#FFFDF7]/98 backdrop-blur-xl border-[#DFC896] shadow-[0_12px_40px_rgba(180,140,50,0.22)]'
                    }`}>
                      {/* Rashi Details Card */}
                      <div className="p-3">
                        <div className={`p-3.5 rounded-xl border ${
                          theme === 'dark'
                            ? 'bg-gradient-to-br from-[#1C1A27]/90 to-[#121118]/90 border-[#C9A050]/30'
                            : 'bg-gradient-to-br from-[#FAF3DF] to-[#F3E7C4] border-[#DEC590]'
                        }`}>
                          <div className="flex items-center justify-between text-[11px] font-bold text-[#C9A050] mb-2 pb-1.5 border-b border-inherit/40">
                            <span className="flex items-center gap-1.5">
                              <Moon className="w-3.5 h-3.5 text-[#C9A050]" />
                              {language === 'bn' ? 'চন্দ্র রাশি (Moon Sign)' : 'Chandra Rashi (Moon Sign)'}
                            </span>
                            <span className="text-base leading-none">{userRashi.symbol}</span>
                          </div>

                          <div className="flex items-baseline justify-between mb-1.5">
                            <span className={`text-xs font-bold ${theme === 'dark' ? 'text-[#F3EAD3]' : 'text-[#2C2825]'}`}>
                              {language === 'bn' 
                                ? `রাশি ${userRashi.rashiNumber}: ${userRashi.bengali} (${userRashi.name})` 
                                : `Rashi ${userRashi.rashiNumber}: ${userRashi.name} (${userRashi.sanskrit.split(' ')[0]})`}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-inherit/30 text-[10px]">
                            <div className={`p-1.5 rounded-lg ${theme === 'dark' ? 'bg-[#15141D]' : 'bg-[#FFFDF4]'}`}>
                              <span className="block text-[#9E9A90] font-medium">{language === 'bn' ? 'অধিপতি গ্রহ' : 'Ruler Lord'}</span>
                              <span className={`font-semibold ${theme === 'dark' ? 'text-[#E6C670]' : 'text-[#8C6218]'}`}>{userRashi.lord}</span>
                            </div>
                            <div className={`p-1.5 rounded-lg ${theme === 'dark' ? 'bg-[#15141D]' : 'bg-[#FFFDF4]'}`}>
                              <span className="block text-[#9E9A90] font-medium">{language === 'bn' ? 'নক্ষত্র' : 'Nakshatra'}</span>
                              <span className={`font-semibold truncate block ${theme === 'dark' ? 'text-[#E6C670]' : 'text-[#8C6218]'}`}>{userRashi.nakshatra}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Only Edit Profile and Logout */}
                      <div className="px-2 pb-2 space-y-1">
                        {/* 1. Edit Profile */}
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onOpenNewProfile();
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition cursor-pointer font-medium ${
                            theme === 'dark'
                              ? 'text-[#C9A050] hover:bg-[#1E1C28]'
                              : 'text-[#8C6218] hover:bg-[#F3EADB]'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <Edit3 className="w-3.5 h-3.5 shrink-0" />
                            <span>{language === 'bn' ? 'প্রোফাইল এডিট' : 'Edit Profile'}</span>
                          </div>
                          <span className="text-[10px] text-gray-400">→</span>
                        </button>

                        <div className={`h-[1px] my-1 ${theme === 'dark' ? 'bg-[#2A2A2E]' : 'bg-[#EADBBE]'}`} />

                        {/* 2. Logout */}
                        {onLogout && (
                          <button
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              onLogout();
                            }}
                            className={`w-full flex items-center space-x-2 px-3 py-2 text-xs rounded-xl transition cursor-pointer font-bold ${
                              theme === 'dark'
                                ? 'text-red-400 hover:text-red-300 hover:bg-red-500/15'
                                : 'text-red-700 hover:text-red-900 hover:bg-red-100/90'
                            }`}
                          >
                            <LogOut className="w-3.5 h-3.5 shrink-0" />
                            <span>{language === 'bn' ? 'লগআউট' : 'Logout'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile / Tablet Drawer Menu Toggle */}
              <button
                onClick={() => setIsMobileDrawerOpen((prev) => !prev)}
                className={`${
                  isAdmin ? 'lg:hidden' : 'md:hidden'
                } flex items-center justify-center w-8 h-8 rounded-lg border transition cursor-pointer shrink-0 ${
                  theme === 'dark'
                    ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8] hover:text-[#C9A050] hover:border-[#C9A050]/50'
                    : 'bg-[#FAF3DF] border-[#DFC896] text-[#2C2825] hover:text-[#C9A050] hover:border-[#C9A050]'
                }`}
                aria-label="Toggle navigation drawer"
              >
                {isMobileDrawerOpen ? <X className="w-4 h-4 text-[#C9A050]" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Out Navigation Drawer */}
      {isMobileDrawerOpen && (
        <div className={`fixed inset-0 z-50 ${isAdmin ? 'lg:hidden' : 'md:hidden'} bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in`}>
          <div className="w-[82%] max-w-sm h-full bg-[#141418] border-l border-[#2A2A2E] p-5 shadow-2xl flex flex-col justify-between overflow-y-auto font-sans">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#2A2A2E]">
                <div className="flex items-center space-x-2.5">
                  <AncientTraditionLogo size="sm" isLight={theme === 'light'} />
                  <div>
                    <h3 className="font-bold text-sm text-[#F0ECE1]">
                      ASTRO<span className="text-[#C9A050]">JUNCTION</span>
                    </h3>
                    <p className="text-[10px] text-[#9E9A90]">Astrological Intelligence</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg bg-[#1A1A1E] text-[#9E9A90] hover:text-[#F0ECE1] border border-[#2A2A2E]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User Profile Card in Drawer */}
              {isAdmin ? (
                <div className="my-4 p-3 rounded-2xl bg-gradient-to-r from-[#17161F] via-[#1D1B26] to-[#14131C] border border-[#C9A050]/35 flex items-center justify-between shadow-md">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-[#9B782B] via-[#E2C375] to-[#FFF3CE] flex items-center justify-center shrink-0">
                      <div className="w-full h-full rounded-full bg-[#0F0E14] text-[#F0E6CD] flex items-center justify-center font-bold text-xs">
                        {userEmail ? userEmail.charAt(0).toUpperCase() : 'A'}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[#F0ECE1]">Admin Account</div>
                      <div className="text-[10px] text-[#C9A050] truncate max-w-[150px]">
                        {userEmail || 'Administrator'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      setIsChangePasswordOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-[#C9A050]/15 text-[#C9A050] hover:bg-[#C9A050]/25 text-xs font-semibold flex items-center space-x-1"
                    title="Change Password"
                  >
                    <Key className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="my-4 p-3 rounded-2xl bg-gradient-to-r from-[#17161F] via-[#1D1B26] to-[#14131C] border border-[#C9A050]/35 flex items-center justify-between shadow-md">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 rounded-full p-[1.5px] bg-gradient-to-tr from-[#9B782B] via-[#E2C375] to-[#FFF3CE]">
                        <div className="w-full h-full rounded-full bg-[#0F0E14] text-[#F0E6CD] flex items-center justify-center font-bold text-xs">
                          {currentProfile.fullName ? currentProfile.fullName.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5 text-[#C9A050]" />}
                        </div>
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#141418]" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-[#F0ECE1] truncate">{currentProfile.fullName || 'Seeker'}</div>
                      <div className="flex items-center gap-1 text-[10px] text-[#C9A050] font-semibold mt-0.5">
                        <span>{userRashi.symbol}</span>
                        <span>
                          {language === 'bn' 
                            ? `রাশি ${userRashi.rashiNumber} • ${userRashi.bengali}`
                            : `Rashi ${userRashi.rashiNumber} • ${userRashi.name}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      onOpenNewProfile();
                    }}
                    className="p-1.5 rounded-xl bg-[#C9A050]/15 text-[#C9A050] hover:bg-[#C9A050]/25 text-xs font-semibold shrink-0 transition"
                    title="Edit or Add Profile"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Navigation Tabs List */}
              <div className="space-y-1 mt-2">
                <div className="text-[10px] font-bold text-[#9E9A90] uppercase tracking-wider px-2 py-1">
                  Navigation
                </div>
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMobileDrawerOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer text-left ${
                        isActive
                          ? 'bg-[#C9A050]/20 text-[#C9A050] font-bold border border-[#C9A050]/30'
                          : 'text-[#E5E1D8] hover:bg-[#1A1A1E] hover:text-[#F0ECE1]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#C9A050]' : 'text-[#9E9A90]'}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}

                {/* Download Master Full Report (Mobile, Hidden for Admin) */}
                {!isViewingAdmin && (
                  <button
                    onClick={() => {
                      handleDownloadFullReport();
                      setIsMobileDrawerOpen(false);
                    }}
                    disabled={isGeneratingFullReport}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-left mt-2 bg-[#C9A050]/20 text-[#E8C470] border border-[#C9A050]/50 hover:bg-[#C9A050]/30"
                  >
                    {isGeneratingFullReport ? (
                      <Loader2 className="w-4 h-4 text-[#C9A050] animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4 text-[#C9A050]" />
                    )}
                    <span>
                      {isGeneratingFullReport
                        ? 'Generating Report...'
                        : t('header.download_full_report', 'Download Full Report')}
                    </span>
                  </button>
                )}

                {/* Daivajna Consultation Link (Mobile, Hidden for Admin) */}
                {!isViewingAdmin && (
                  <button
                    onClick={() => {
                      setActiveTab('counsellor');
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer text-left mt-1.5 ${
                      activeTab === 'counsellor'
                        ? 'bg-[#C9A050]/20 text-[#C9A050] font-bold border border-[#C9A050]/30'
                        : 'text-[#C9A050] bg-[#C9A050]/10 hover:bg-[#C9A050]/20'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-[#C9A050]" />
                    <span>Daivajna Consultation</span>
                  </button>
                )}
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-4 border-t border-[#2A2A2E] space-y-2">
              {isAdmin && (
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    setIsChangePasswordOpen(true);
                  }}
                  className="w-full flex items-center space-x-2 text-xs text-[#C9A050] hover:text-[#D4AF37] py-1.5 px-2 rounded hover:bg-[#C9A050]/10 transition"
                >
                  <Key className="w-3.5 h-3.5 text-[#C9A050]" />
                  <span>Change Password</span>
                </button>
              )}

              <button
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  onOpenDisclaimer();
                }}
                className="w-full flex items-center space-x-2 text-xs text-[#9E9A90] hover:text-[#C9A050] py-1.5 px-2 rounded"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#C9A050]" />
                <span>Astrological Disclaimer</span>
              </button>

              {onLogout && (
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onLogout();
                  }}
                  className={`w-full flex items-center space-x-2 text-xs py-1.5 px-2 rounded transition font-bold ${
                    theme === 'dark'
                      ? 'text-red-400 hover:text-red-300 hover:bg-red-500/15'
                      : 'text-red-700 hover:text-red-900 hover:bg-red-100/90'
                  }`}
                >
                  <LogOut className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-red-400' : 'text-red-700'}`} />
                  <span>Log Out of Account</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Navigation Bar (Visible on md and below) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0D0D0F]/95 backdrop-blur-xl border-t border-[#2A2A2E]/80 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        <nav className="flex items-center justify-around" aria-label="Mobile Bottom Navigation">
          {mobileQuickTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all text-[10px] font-medium min-w-[54px] cursor-pointer ${
                  isActive
                    ? 'text-[#C9A050] font-bold scale-105'
                    : 'text-[#9E9A90] hover:text-[#E5E1D8]'
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-[#C9A050]' : 'text-[#9E9A90]'}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Floating Ask Daivajna Action Button (User Role Only - Round Circular FAB) */}
      {!isViewingAdmin && !isAdmin && (
        <button
          onClick={() => setActiveTab('counsellor')}
          title="Ask Daivajna Astrologer"
          className={`fixed bottom-20 md:bottom-7 right-4 md:right-7 z-40 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center p-0 shadow-2xl transition-all duration-300 cursor-pointer group hover:scale-110 hover:-translate-y-1 active:scale-95 ${
            activeTab === 'counsellor'
              ? 'ring-4 ring-[#C9A050] ring-offset-2'
              : ''
          } ${
            theme === 'dark'
              ? 'bg-gradient-to-tr from-[#A07828] via-[#C9A050] to-[#DFB76C] text-[#0D0D0F] shadow-[0_8px_25px_rgba(201,160,80,0.45)] border-2 border-[#FFE8A3]/70'
              : 'bg-gradient-to-tr from-[#A87E2C] via-[#C9A050] to-[#E2BC73] text-[#FFFFFF] shadow-[0_8px_25px_rgba(201,160,80,0.4)] border-2 border-[#FFF0C2]/80'
          }`}
          aria-label="Ask Daivajna"
        >
          {/* Animated Pulsing Beacon */}
          <span className="absolute top-1 right-1 flex h-3 w-3 pointer-events-none">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-80"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-300"></span>
          </span>

          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-current group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300" />
          <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider leading-none mt-1 select-none">
            Daivajna
          </span>

          {/* Hover Tooltip on Left */}
          <span className={`absolute right-full mr-3.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none shadow-xl border ${
            theme === 'dark'
              ? 'bg-[#141418] text-[#E8C470] border-[#C9A050]/50'
              : 'bg-[#FAF3DF] text-[#8C6218] border-[#DFC896]'
          }`}>
            Ask Daivajna ✨
          </span>
        </button>
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        theme={theme}
        userEmail={userEmail}
      />
    </>
  );
};
