import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquareText, X, Menu, Send, Bot, Lock, Compass, Hash, Milestone, ShieldAlert, Sun, Moon, Home, LayoutDashboard, Globe, Calendar, Play, BookOpen, RotateCcw, ArrowRight, Check, ChevronDown } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';
import { StarfieldBackground } from './StarfieldBackground';
import { GlobalZodiacView } from './GlobalZodiacView';
import PanjikaCalendarView from './PanjikaCalendarView';
import { ZodiacCompatibilityMatrix } from './ZodiacCompatibilityMatrix';
import { Footer } from './Footer';
import { FeaturePreviewModal, PREMIUM_FEATURES_CATALOG, PremiumFeatureDetail } from './FeaturePreviewModal';
import { BlogCarousel, BlogPage, BlogPost } from './Blogs';
import { AncientTraditionLogo } from './AncientTraditionLogo';
import { VedicRemediesSection } from './VedicRemediesSection';
import { landingChatApi } from '../services/landingChatApi';
import { sessionTracker } from '../services/sessionTracker';
import { LegalInfoPage, LegalPageView } from './LegalInfoPage';
import { setManualLanguage, SupportedLanguage } from '../i18n';

const LANGUAGE_LIST = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'hi', label: 'हिन्दी', short: 'HI' },
  { code: 'bn', label: 'বাংলা', short: 'BN' },
  { code: 'ta', label: 'தமிழ்', short: 'TA' },
  { code: 'fr', label: 'Français', short: 'FR' },
];

export function HeaderLanguageSwitcher({
  theme,
  dropUp = false,
  className = '',
}: {
  theme: 'light' | 'dark';
  dropUp?: boolean;
  className?: string;
}) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const currentLang = (i18n.language?.split('-')[0]?.toLowerCase() || 'en');
  const activeLangObj = LANGUAGE_LIST.find((l) => l.code === currentLang) || LANGUAGE_LIST[0];

  const handleSelect = (code: string) => {
    setManualLanguage(code as SupportedLanguage);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        const idx = LANGUAGE_LIST.findIndex((l) => l.code === activeLangObj.code);
        setHighlightedIndex(idx >= 0 ? idx : 0);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % LANGUAGE_LIST.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + LANGUAGE_LIST.length) % LANGUAGE_LIST.length);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < LANGUAGE_LIST.length) {
        handleSelect(LANGUAGE_LIST[highlightedIndex].code);
      }
    } else if (e.key === 'Tab') {
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef} onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center space-x-1 sm:space-x-1.5 px-2 py-1 sm:px-3 sm:py-2 rounded-full transition-all border cursor-pointer shrink-0 ${theme === 'dark'
          ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8] hover:border-[#C9A050]/50'
          : 'bg-white border-gray-200 text-gray-700 hover:border-[#C9A050]/50 shadow-sm'
          }`}
        aria-label="Change language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C9A050] shrink-0" />
        <span className="font-mono text-xs font-bold uppercase tracking-wider">
          {activeLangObj.short}
        </span>
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''
            } ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-500'}`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Language"
          className={`absolute right-0 ${dropUp ? 'bottom-full mb-2' : 'mt-2'} w-40 sm:w-44 rounded-2xl border shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl ${theme === 'dark'
            ? 'bg-[#141418]/95 border-[#2A2A2E] text-[#E5E1D8]'
            : 'bg-white/95 border-gray-200 text-gray-800 shadow-xl'
            }`}
          style={{ maxHeight: 'calc(100vh - 100px)' }}
        >
          {LANGUAGE_LIST.map((lang, idx) => {
            const isSelected = lang.code === activeLangObj.code;
            const isHighlighted = idx === highlightedIndex;
            return (
              <button
                key={lang.code}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(lang.code)}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium transition cursor-pointer text-left ${isHighlighted || isSelected
                  ? theme === 'dark'
                    ? 'bg-[#2A2A2E]/70 text-[#C9A050]'
                    : 'bg-amber-50 text-[#8C6B28]'
                  : theme === 'dark'
                    ? 'text-[#E5E1D8] hover:bg-white/5'
                    : 'text-gray-700 hover:bg-black/5'
                  }`}
              >
                <span className="font-medium text-sm">{lang.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#C9A050] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const SECTION_PATH_MAP: Record<string, string> = {
  'hero-section': '/',
  'zodiac-section': '/global-zodiac',
  'panjika-section': '/panjika',
  'remedies-section': '/remedies',
  'blog-section': '/blogs',
  'premium-section': '/premium',
};

const PATH_SECTION_MAP: Record<string, string> = {
  '/': 'hero-section',
  '/home': 'hero-section',
  '/global-zodiac': 'zodiac-section',
  '/zodiac': 'zodiac-section',
  '/panjika': 'panjika-section',
  '/remedies': 'remedies-section',
  '/blogs': 'blog-section',
  '/premium': 'premium-section',
};

interface LandingPageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onOpenDisclaimer: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  authUser?: any;
  onGoToDashboard?: () => void;
  onResetToInitial?: () => void;
}

export function LandingPage({
  onLoginClick,
  onRegisterClick,
  onOpenDisclaimer,
  theme,
  toggleTheme,
  authUser,
  onGoToDashboard,
  onResetToInitial,
}: LandingPageProps) {
  const { t, i18n } = useTranslation();
  const currentLanguage = (i18n.language?.split('-')[0]?.toLowerCase() || 'en');
  const [zodiacResetKey, setZodiacResetKey] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>(() => {
    try {
      const saved = localStorage.getItem('jyotishveda_guest_chat_messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (parsed.length === 1 && parsed[0].role === 'assistant') {
            return [{ role: 'assistant', content: t('chat.guest_greeting', 'Namaste. I am AstroJunction. How may I guide your astrological journey today?') }];
          }
          return parsed;
        }
      }
    } catch (e) { }
    return [{ role: 'assistant', content: t('chat.guest_greeting', 'Namaste. I am AstroJunction. How may I guide your astrological journey today?') }];
  });

  // Keep guest greeting in sync with current selected language
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === 'assistant') {
        return [{ role: 'assistant', content: t('chat.guest_greeting', 'Namaste. I am AstroJunction. How may I guide your astrological journey today?') }];
      }
      return prev;
    });
  }, [i18n.language, t]);

  const [input, setInput] = useState('');

  const [msgCount, setMsgCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('jyotishveda_guest_chat_count');
      if (saved) return parseInt(saved, 10) || 0;
    } catch (e) { }
    return 0;
  });

  const [isAiThinking, setIsAiThinking] = useState(false);

  const [savedDob, setSavedDob] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('jyotishveda_guest_chat_dob');
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return null;
  });

  const [selectedFeatureForPreview, setSelectedFeatureForPreview] = useState<PremiumFeatureDetail | null>(null);
  const [selectedBlogForPage, setSelectedBlogForPage] = useState<BlogPost | null>(null);
  const [currentView, setCurrentView] = useState<'landing' | 'blogs' | LegalPageView>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if ((path.startsWith('/blogs/') && path !== '/blogs') || new URLSearchParams(window.location.search).has('blog')) {
        return 'blogs';
      }
      const legalPaths: LegalPageView[] = ['about-us', 'faq', 'privacy-policy', 'cookie-policy', 'terms-and-conditions'];
      const matchedLegal = legalPaths.find(p => path === `/${p}`);
      if (matchedLegal) return matchedLegal;
    }
    return 'landing';
  });
  const chatEndRef = useRef<HTMLDivElement>(null);
  const isClickScrolling = useRef(false);
  const clickScrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const [activeSection, setActiveSection] = useState<string>('hero-section');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Track Landing Page View once when visitor arrives on landing page
  const hasTrackedLandingView = useRef(false);
  useEffect(() => {
    if (currentView === 'landing' && !hasTrackedLandingView.current) {
      hasTrackedLandingView.current = true;
      sessionTracker.trackLandingPageView();
    }
  }, [currentView]);

  // Initial mount: if user arrived directly on e.g. /global-zodiac, /panjika, /remedies, /blogs, /premium
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const path = window.location.pathname;
    const targetSection = PATH_SECTION_MAP[path];
    if (targetSection && targetSection !== 'hero-section') {
      setTimeout(() => {
        const el = document.getElementById(targetSection);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setActiveSection(targetSection);
        }
      }, 300);
    }
  }, []);

  const handleLoginClick = () => {
    sessionTracker.trackAuthGateOpen('login');
    onLoginClick();
  };

  const handleRegisterClick = () => {
    sessionTracker.trackAuthGateOpen('register');
    onRegisterClick();
  };

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/blogs/') && path !== '/blogs') {
        setCurrentView('blogs');
      } else {
        const legalPaths: LegalPageView[] = ['about-us', 'faq', 'privacy-policy', 'cookie-policy', 'terms-and-conditions'];
        const matchedLegal = legalPaths.find(p => path === `/${p}`);
        if (matchedLegal) {
          setCurrentView(matchedLegal);
        } else {
          setCurrentView('landing');
          setSelectedBlogForPage(null);
          const targetSection = PATH_SECTION_MAP[path] || 'hero-section';
          setActiveSection(targetSection);
          const el = document.getElementById(targetSection);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('jyotishveda_guest_chat_messages', JSON.stringify(messages));
      localStorage.setItem('jyotishveda_guest_chat_count', String(msgCount));
      if (savedDob) {
        localStorage.setItem('jyotishveda_guest_chat_dob', JSON.stringify(savedDob));
      } else {
        localStorage.removeItem('jyotishveda_guest_chat_dob');
      }
    } catch (e) { }
  }, [messages, msgCount, savedDob]);

  useEffect(() => {
    if (isChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAiThinking, isChatOpen]);

  const handleResetChat = () => {
    try {
      localStorage.removeItem('jyotishveda_guest_chat_messages');
      localStorage.removeItem('jyotishveda_guest_chat_count');
      localStorage.removeItem('jyotishveda_guest_chat_dob');
    } catch (e) { }
    setMessages([{ role: 'assistant', content: t('chat.guest_greeting', 'Namaste. I am AstroJunction. How may I guide your astrological journey today?') }]);
    setMsgCount(0);
    setSavedDob(null);
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const targetPath = SECTION_PATH_MAP[id] || '/';
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      window.history.pushState({ section: id }, '', targetPath);
    }

    isClickScrolling.current = true;
    if (clickScrollTimeout.current) clearTimeout(clickScrollTimeout.current);
    clickScrollTimeout.current = setTimeout(() => {
      isClickScrolling.current = false;
    }, 1000);

    if (currentView !== 'landing') {
      setCurrentView('landing');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleResetToInitial = () => {
    isClickScrolling.current = true;
    if (clickScrollTimeout.current) clearTimeout(clickScrollTimeout.current);
    clickScrollTimeout.current = setTimeout(() => {
      isClickScrolling.current = false;
    }, 1000);

    if (typeof window !== 'undefined') {
      if (window.location.pathname !== '/' || window.location.search) {
        window.history.pushState({}, '', '/');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    setCurrentView('landing');
    setSelectedBlogForPage(null);
    setSelectedFeatureForPreview(null);
    setIsChatOpen(false);
    setActiveSection('hero-section');
    setZodiacResetKey(prev => prev + 1);

    if (onResetToInitial) {
      onResetToInitial();
    }
  };

  useEffect(() => {
    if (currentView !== 'landing') return;

    let ticking = false;
    const handleScroll = () => {
      if (isClickScrolling.current) return;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (isClickScrolling.current) {
            ticking = false;
            return;
          }
          const sections = ['hero-section', 'zodiac-section', 'panjika-section', 'remedies-section', 'blog-section', 'premium-section'];
          const scrollPosition = window.scrollY + 180;

          let currentSection = 'hero-section';
          for (const section of sections) {
            const element = document.getElementById(section);
            if (element && element.offsetTop <= scrollPosition) {
              currentSection = section;
            }
          }
          setActiveSection(currentSection);

          const targetPath = SECTION_PATH_MAP[currentSection] || '/';
          if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
            window.history.replaceState({ section: currentSection }, '', targetPath);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentView]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    setInput('');

    if (msgCount >= 3) {
      setMessages(prev => [
        ...prev,
        { role: 'user', content: userText },
        { role: 'assistant', content: "Please login to unlock deep analysis and detailed celestial wisdom." }
      ]);
      return;
    }

    const updatedMessages = [...messages, { role: 'user' as const, content: userText }];
    setMessages(updatedMessages);
    setMsgCount(prev => prev + 1);
    setIsAiThinking(true);
    const chatStart = Date.now();

    try {
      const data = await landingChatApi.sendPublicMessage({
        messages: updatedMessages,
        msgCount: msgCount,
        dob: savedDob,
      });

      if (data && data.reply) {
        if (data.dob) setSavedDob(data.dob);
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        if (data.msgCount !== undefined) setMsgCount(data.msgCount);

        sessionTracker.trackGuestAIChat({
          userMessage: userText,
          aiReply: data.reply,
          msgCount: (data.msgCount !== undefined ? data.msgCount : msgCount + 1),
          status: 'SUCCESS',
          executionTimeMs: Date.now() - chatStart,
        });
      } else {
        throw new Error('API response invalid');
      }
    } catch (err: any) {
      sessionTracker.trackGuestAIChat({
        userMessage: userText,
        status: 'FAILURE',
        errorMessage: err?.message || 'Chat API error',
        executionTimeMs: Date.now() - chatStart,
      });
      // Client-side Fallback
      setTimeout(() => {
        let reply = "";

        if (msgCount >= 2) {
          reply = "Please login to unlock deep analysis and detailed celestial wisdom.";
          setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
          return;
        }

        // 1. Date Detection (Supports DD-MM-YYYY, YYYY-MM-DD, 15 Aug 1995, etc.)
        const monthsMap: Record<string, number> = {
          jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4,
          may: 5, jun: 6, june: 6, jul: 7, july: 7, aug: 8, august: 8, sep: 9, september: 9,
          oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12
        };

        let detectedD = 0, detectedM = 0, detectedY = 0;
        const lower = userText.toLowerCase();

        const matchNamed = lower.match(/(\b\d{1,2})(?:st|nd|rd|th)?[\s\-_,]+([a-z]{3,9})[\s\-_,]+(\d{4}\b)/);
        if (matchNamed) {
          detectedD = parseInt(matchNamed[1]);
          const mStr = matchNamed[2];
          detectedY = parseInt(matchNamed[3]);
          for (const [k, v] of Object.entries(monthsMap)) {
            if (mStr.startsWith(k)) {
              detectedM = v;
              break;
            }
          }
        }

        if (!detectedD) {
          const matchNum = userText.match(/(\b\d{1,2})[-/.\s](\d{1,2})[-/.\s](\d{4}\b)/);
          if (matchNum) {
            let d = parseInt(matchNum[1]);
            let m = parseInt(matchNum[2]);
            let y = parseInt(matchNum[3]);
            if (d > 12 && m <= 12) {
              detectedD = d; detectedM = m; detectedY = y;
            } else if (m > 12 && d <= 12) {
              detectedD = m; detectedM = d; detectedY = y;
            } else {
              detectedD = d; detectedM = m; detectedY = y;
            }
          }
        }

        if (!detectedD) {
          const matchIso = userText.match(/(\b\d{4})[-/.\s](\d{1,2})[-/.\s](\d{1,2}\b)/);
          if (matchIso) {
            detectedY = parseInt(matchIso[1]);
            detectedM = parseInt(matchIso[2]);
            detectedD = parseInt(matchIso[3]);
          }
        }

        if (detectedD && detectedM && detectedY) {
          const newDob = [detectedY, detectedM, detectedD];
          setSavedDob(newDob);

          const digits = `${detectedY}${detectedM < 10 ? '0' + detectedM : detectedM}${detectedD < 10 ? '0' + detectedD : detectedD}`.split('').map(Number);
          let lp = digits.reduce((a, b) => a + b, 0);
          while (lp > 9 && lp !== 11 && lp !== 22 && lp !== 33) {
            lp = String(lp).split('').map(Number).reduce((a, b) => a + b, 0);
          }

          let mulank = String(detectedD).split('').map(Number).reduce((a, b) => a + b, 0);
          while (mulank > 9) {
            mulank = String(mulank).split('').map(Number).reduce((a, b) => a + b, 0);
          }

          const signNames: [number, number, string][] = [
            [1, 20, "Makara (Capricorn)"], [2, 19, "Kumbha (Aquarius)"],
            [3, 20, "Meena (Pisces)"], [4, 20, "Mesha (Aries)"],
            [5, 21, "Vrishabha (Taurus)"], [6, 21, "Mithuna (Gemini)"],
            [7, 22, "Karka (Cancer)"], [8, 23, "Simha (Leo)"],
            [9, 23, "Kanya (Virgo)"], [10, 23, "Tula (Libra)"],
            [11, 22, "Vrishchika (Scorpio)"], [12, 21, "Dhanu (Sagittarius)"],
            [12, 31, "Makara (Capricorn)"]
          ];
          let detectedSign = "Karka (Cancer)";
          for (const [sm, sd, sname] of signNames) {
            if (detectedM < sm || (detectedM === sm && detectedD <= sd)) {
              detectedSign = sname;
              break;
            }
          }

          const traitsMap: Record<number, { planet: string; gems: string; color: string; day: string }> = {
            1: { planet: "Surya Dev (Sun)", gems: "Ruby (Manik) & Red Garnet", color: "Golden Amber & Saffron", day: "Ravivar (Sunday)" },
            2: { planet: "Chandra Dev (Moon)", gems: "Natural Pearl (Moti) & Moonstone", color: "Silvery White & Milk Cream", day: "Somvar (Monday)" },
            3: { planet: "Devaguru Brihaspati (Jupiter)", gems: "Yellow Sapphire (Pukhraj) & Citrine", color: "Golden Yellow & Saffron", day: "Guruvar (Thursday)" },
            4: { planet: "Rahu Dev", gems: "Hessonite Garnet (Gomed)", color: "Electric Blue & Charcoal", day: "Shanivar (Saturday)" },
            5: { planet: "Budha Dev (Mercury)", gems: "Emerald (Panna) & Peridot", color: "Emerald Green & Light Mint", day: "Budhvar (Wednesday)" },
            6: { planet: "Shukra Dev (Venus)", gems: "Diamond / White Zircon & Opal", color: "Diamond White & Soft Rose", day: "Shukravar (Friday)" },
            7: { planet: "Ketu Dev", gems: "Cat's Eye (Lehsuniya)", color: "Smoky Grey & Earth Brown", day: "Guruvar (Thursday)" },
            8: { planet: "Shani Dev (Saturn)", gems: "Blue Sapphire (Neelam) & Amethyst", color: "Royal Blue & Navy", day: "Shanivar (Saturday)" },
            9: { planet: "Mangal Dev (Mars)", gems: "Red Coral (Moonga) & Carnelian", color: "Bright Coral Red & Royal Saffron", day: "Mangalvar (Tuesday)" }
          };

          const t = traitsMap[mulank] || traitsMap[lp] || traitsMap[1];

          reply = `🕉️ Kalyan Ho! Detailed Janma Kundli Overview (${detectedD < 10 ? '0' + detectedD : detectedD}-${detectedM < 10 ? '0' + detectedM : detectedM}-${detectedY}):\n\n• Zodiac Sign (Janma Rashi): ${detectedSign}\n• Mulank (Root Number): ${mulank} | Life Path: ${lp}\n• Ruling Graha (Planet): ${t.planet}\n• Auspicious Gemstone: ${t.gems}\n• Auspicious Color: ${t.color}\n• Auspicious Day: ${t.day}`;
        } else {
          reply = `Ayushman Bhava! To look into your Janma Kundli and reveal the precise planetary alignments for your query, please share your Date of Birth (DD-MM-YYYY) and Birth Time.`;
        }

        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      }, 700);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleAskAIForSign = (signName: string, promptText: string) => {
    setIsChatOpen(true);
    if (msgCount >= 3) {
      setMessages(prev => [
        ...prev,
        { role: 'user', content: promptText },
        { role: 'assistant', content: "Please login to unlock deep analysis and detailed celestial wisdom." }
      ]);
      return;
    }

    const updatedMessages = [...messages, { role: 'user' as const, content: promptText }];
    setMessages(updatedMessages);
    setMsgCount(prev => prev + 1);
    setIsAiThinking(true);
    const signChatStart = Date.now();

    try {
      landingChatApi.sendPublicMessage({
        messages: updatedMessages,
        msgCount: msgCount,
        dob: savedDob,
      })
        .then(data => {
          if (data.dob) setSavedDob(data.dob);
          setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
          sessionTracker.trackGuestAISign({
            signName,
            promptText,
            aiReply: data.reply,
            status: 'SUCCESS',
            executionTimeMs: Date.now() - signChatStart,
          });
        })
        .catch((err: any) => {
          sessionTracker.trackGuestAISign({
            signName,
            promptText,
            status: 'FAILURE',
            errorMessage: err?.message || 'Chat error',
            executionTimeMs: Date.now() - signChatStart,
          });
          setMessages(prev => [...prev, { role: 'assistant', content: "Ayushman Bhava! To reveal the precise planetary alignments for your query, please share your Date of Birth (DD-MM-YYYY) and Birth Time." }]);
        })
        .finally(() => setIsAiThinking(false));
    } catch {
      setIsAiThinking(false);
    }
  };

  return (
    <div className={`min-h-screen relative font-sans flex flex-col astro-landing-page ${theme === 'dark' ? 'bg-[#0D0D0F] text-[#E5E1D8]' : 'bg-[#F0ECE1] text-[#0D0D0F]'}`}>
      {theme === 'dark' && <StarfieldBackground />}

      {/* Navigation Bar - Sticky */}
      <nav className={`sticky top-0 z-50 backdrop-blur-2xl transition-all duration-300 border-b ${theme === 'dark' ? 'bg-[#0D0D0F]/90 border-[#2A2A2E]/80 shadow-[0_4px_20px_rgba(0,0,0,0.5)]' : 'bg-[#FAF8F3]/95 border-[#E5E1D8] shadow-[0_4px_20px_rgba(0,0,0,0.06)]'}`}>
        <div className="w-full px-2 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-1 sm:gap-4">
            {/* Logo */}
            <div
              onClick={handleResetToInitial}
              className="flex items-center space-x-1 xs:space-x-1.5 sm:space-x-3 cursor-pointer group select-none shrink-0"
            >
              <AncientTraditionLogo size="md" isLight={theme === 'light'} className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 shrink-0" />
              <div className="shrink-0">
                <span className="text-xs xs:text-sm sm:text-xl font-serif font-bold tracking-wider flex items-center whitespace-nowrap">
                  ASTRO<span className="text-[#C9A050]">JUNCTION</span>
                </span>
                <p className={`hidden min-[420px]:block text-[8px] sm:text-[9px] font-bold tracking-widest uppercase mt-0.5 whitespace-nowrap ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
                  {t('header.authentic_wisdom', 'Authentic Vedic Wisdom')}
                </p>
              </div>
            </div>

            {/* Center Links (Desktop only, drawer handles mobile & tablet) */}
            <div className={`hidden xl:flex items-center space-x-0.5 lg:space-x-1 px-1 lg:px-1.5 py-1 rounded-full border backdrop-blur-md shadow-inner ${theme === 'dark' ? 'bg-[#141418]/60 border-[#2A2A2E]' : 'bg-white/60 border-gray-200/50'}`}>
              <a
                href="/"
                onClick={(e) => { e.preventDefault(); scrollToSection('hero-section'); }}
                className={`flex items-center space-x-1 px-2.5 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs lg:text-[13px] font-semibold transition-all cursor-pointer ${currentView === 'landing' && activeSection === 'hero-section'
                  ? 'text-[#0D0D0F] bg-[#C9A050] shadow-md shadow-[#C9A050]/20'
                  : theme === 'dark' ? 'text-[#9E9A90] hover:text-[#E5E1D8] hover:bg-white/5' : 'text-gray-600 hover:text-[#0D0D0F] hover:bg-black/5'
                  }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>{t('header.nav.home')}</span>
              </a>
              <a
                href="/global-zodiac"
                onClick={(e) => { e.preventDefault(); scrollToSection('zodiac-section'); }}
                className={`flex items-center space-x-1 px-2.5 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs lg:text-[13px] font-semibold transition-all cursor-pointer ${currentView === 'landing' && activeSection === 'zodiac-section'
                  ? 'text-[#0D0D0F] bg-[#C9A050] shadow-md shadow-[#C9A050]/20'
                  : theme === 'dark' ? 'text-[#9E9A90] hover:text-[#E5E1D8] hover:bg-white/5' : 'text-gray-600 hover:text-[#0D0D0F] hover:bg-black/5'
                  }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{t('header.nav.zodiac')}</span>
              </a>
              <a
                href="/panjika"
                onClick={(e) => { e.preventDefault(); scrollToSection('panjika-section'); }}
                className={`flex items-center space-x-1 px-2.5 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs lg:text-[13px] font-semibold transition-all cursor-pointer ${currentView === 'landing' && activeSection === 'panjika-section'
                  ? 'text-[#0D0D0F] bg-[#C9A050] shadow-md shadow-[#C9A050]/20'
                  : theme === 'dark' ? 'text-[#9E9A90] hover:text-[#E5E1D8] hover:bg-white/5' : 'text-gray-600 hover:text-[#0D0D0F] hover:bg-black/5'
                  }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{t('header.nav.panjika')}</span>
              </a>
              <a
                href="/remedies"
                onClick={(e) => { e.preventDefault(); scrollToSection('remedies-section'); }}
                className={`flex items-center space-x-1 px-2.5 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs lg:text-[13px] font-semibold transition-all cursor-pointer ${currentView === 'landing' && activeSection === 'remedies-section'
                  ? 'text-[#0D0D0F] bg-[#C9A050] shadow-md shadow-[#C9A050]/20'
                  : theme === 'dark' ? 'text-[#9E9A90] hover:text-[#E5E1D8] hover:bg-white/5' : 'text-gray-600 hover:text-[#0D0D0F] hover:bg-black/5'
                  }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{t('header.nav.remedies')}</span>
              </a>
              <a
                href="/blogs"
                onClick={(e) => { e.preventDefault(); scrollToSection('blog-section'); }}
                className={`flex items-center space-x-1 px-2.5 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs lg:text-[13px] font-semibold transition-all cursor-pointer ${currentView === 'landing' && activeSection === 'blog-section'
                  ? 'text-[#0D0D0F] bg-[#C9A050] shadow-md shadow-[#C9A050]/20'
                  : theme === 'dark' ? 'text-[#9E9A90] hover:text-[#E5E1D8] hover:bg-white/5' : 'text-gray-600 hover:text-[#0D0D0F] hover:bg-black/5'
                  }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{t('header.nav.blogs')}</span>
              </a>
              <a
                href="/premium"
                onClick={(e) => { e.preventDefault(); scrollToSection('premium-section'); }}
                className={`flex items-center space-x-1 px-2.5 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs lg:text-[13px] font-semibold transition-all cursor-pointer ${currentView === 'landing' && activeSection === 'premium-section'
                  ? 'text-[#0D0D0F] bg-[#C9A050] shadow-md shadow-[#C9A050]/20'
                  : theme === 'dark' ? 'text-[#9E9A90] hover:text-[#E5E1D8] hover:bg-white/5' : 'text-gray-600 hover:text-[#0D0D0F] hover:bg-black/5'
                  }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{t('header.nav.premium')}</span>
              </a>
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
              <div className="hidden sm:block shrink-0">
                <HeaderLanguageSwitcher theme={theme} />
              </div>
              <button
                onClick={toggleTheme}
                className={`p-1.5 sm:p-2 rounded-full transition-all border shrink-0 ${theme === 'dark'
                  ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8] hover:border-[#C9A050]/50'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-[#C9A050]/50 shadow-sm'
                  }`}
                title="Toggle Theme"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </button>

              {authUser ? (
                <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
                  <button
                    onClick={onGoToDashboard}
                    title="Dashboard"
                    className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer shadow-sm ${theme === 'dark'
                      ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8] hover:border-[#C9A050]/50 hover:bg-[#1A1A1E]'
                      : 'bg-[#FAF3DF] border-[#DFC896] text-[#2C2825] hover:border-[#C9A050] hover:bg-[#F5E8C8]'
                      }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-[#C9A050]" />
                    <span className="hidden sm:inline font-semibold">{t('header.dashboard')}</span>
                  </button>

                  <div className="relative flex items-center">
                    <button
                      onClick={onGoToDashboard}
                      title="User Profile Dashboard"
                      aria-label="User Profile Dashboard"
                      className={`group focus:outline-none flex items-center justify-center p-0.5 rounded-full border transition-all duration-300 shadow-sm ${theme === 'dark'
                        ? 'bg-[#17161F] border-[#C9A050]/50 hover:border-[#E2C375] hover:shadow-[0_0_15px_rgba(201,160,80,0.35)]'
                        : 'bg-[#FAF3DF] border-[#DFC896] hover:border-[#C9A050] hover:shadow-[0_2px_12px_rgba(201,160,80,0.25)]'
                        }`}
                    >
                      <div className="relative">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full p-[1.5px] bg-gradient-to-tr from-[#9B782B] via-[#E2C375] to-[#FFF3CE] shadow-sm flex items-center justify-center">
                          <div className={`w-full h-full rounded-full flex items-center justify-center font-bold text-sm select-none transition-transform group-hover:scale-95 ${theme === 'dark' ? 'bg-[#0F0E14] text-[#F0E6CD]' : 'bg-[#FFF9EA] text-[#8C6218]'
                            }`}>
                            {authUser?.user_metadata?.full_name ? authUser.user_metadata.full_name.charAt(0).toUpperCase() : authUser?.email ? authUser.email.charAt(0).toUpperCase() : 'U'}
                          </div>
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#141418]" />
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleLoginClick}
                    className={`hidden sm:block px-4 py-2 rounded-full font-bold text-xs sm:text-[13px] transition-all cursor-pointer border shadow-sm ${theme === 'dark'
                      ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8] hover:text-[#C9A050] hover:border-[#C9A050]/50'
                      : 'bg-white border-gray-200 text-[#0D0D0F] hover:text-[#8C6B28] hover:border-[#C9A050]/50'
                      }`}
                  >
                    {t('header.login')}
                  </button>
                  <button
                    onClick={handleRegisterClick}
                    className="px-2.5 py-1.5 sm:px-5 sm:py-2 rounded-full bg-gradient-to-r from-[#C9A050] to-[#8C6B28] text-white font-bold text-xs sm:text-sm hover:from-[#D4AF37] hover:to-[#A37B2F] transition-all cursor-pointer shadow-sm hover:shadow-md shrink-0 whitespace-nowrap"
                  >
                    {t('header.get_started')}
                  </button>
                </>
              )}

              {/* Mobile / Tablet Menu Button (xl:hidden) */}
              <button
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className={`xl:hidden flex items-center justify-center w-8 h-8 rounded-lg border transition cursor-pointer shrink-0 ${theme === 'dark'
                  ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8] hover:text-[#C9A050] hover:border-[#C9A050]/50'
                  : 'bg-[#FAF3DF] border-[#DFC896] text-[#2C2825] hover:text-[#C9A050] hover:border-[#C9A050]'
                  }`}
                aria-label="Toggle navigation drawer"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4 text-[#C9A050]" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile & Tablet Slide-Out Navigation Drawer for Landing Page */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in">
          <div className={`w-[82%] max-w-sm h-full border-l p-5 shadow-2xl flex flex-col justify-between overflow-y-auto font-sans ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-[#FAF5E6] border-[#DFC896] text-[#2C2825]'
            }`}>
            <div>
              {/* Drawer Header */}
              <div className={`flex items-center justify-between pb-4 border-b ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#DFC896]'}`}>
                <div
                  className="flex items-center space-x-2.5 cursor-pointer select-none"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    scrollToSection('hero-section');
                  }}
                >
                  <AncientTraditionLogo size="sm" isLight={theme === 'light'} />
                  <div>
                    <span className="text-base font-serif font-bold tracking-wider">
                      ASTRO<span className="text-[#C9A050]">JUNCTION</span>
                    </span>
                    <p className="text-[9px] font-bold tracking-widest uppercase text-[#C9A050]">
                      {t('header.authentic_wisdom', 'Authentic Vedic Wisdom')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  title="Close navigation drawer"
                  aria-label="Close navigation drawer"
                  className={`p-1.5 rounded-lg border transition cursor-pointer ${theme === 'dark' ? 'border-[#2A2A2E] text-[#9E9A90] hover:text-white' : 'border-[#DFC896] text-gray-600 hover:text-black'
                    }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Language Selector in Mobile Drawer */}
              <div className={`flex items-center justify-between px-3.5 py-2.5 my-3 rounded-xl border ${theme === 'dark' ? 'bg-[#1C1A27]/60 border-[#2A2A2E]' : 'bg-[#FAF2DE] border-[#DFC896]'
                }`}>
                <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#7A6F5D]'}`}>
                  {t('userPanel.drawer.selectLanguage', 'Language')}
                </span>
                <HeaderLanguageSwitcher theme={theme} />
              </div>

              {/* Drawer Navigation Links */}
              <div className="mt-5 space-y-1.5">
                {[
                  { id: 'hero-section', label: t('header.nav.home'), icon: Home },
                  { id: 'zodiac-section', label: t('header.nav.zodiac'), icon: Globe },
                  { id: 'panjika-section', label: t('header.nav.panjika'), icon: Calendar },
                  { id: 'remedies-section', label: t('header.nav.remedies'), icon: Compass },
                  { id: 'blog-section', label: t('header.nav.blogs'), icon: BookOpen },
                  { id: 'premium-section', label: t('header.nav.premium'), icon: Lock },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        scrollToSection(item.id);
                      }}
                      className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${isActive
                        ? 'bg-[#C9A050] text-[#0D0D0F] font-bold shadow-md'
                        : theme === 'dark'
                          ? 'text-[#9E9A90] hover:text-[#E5E1D8] hover:bg-white/5'
                          : 'text-[#5C574F] hover:text-[#1A1816] hover:bg-black/5'
                        }`}
                    >
                      <Icon className="w-4 h-4 shrink-0 text-[#C9A050]" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drawer Bottom Actions */}
            <div className={`pt-4 border-t ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#DFC896]'} space-y-2`}>
              {!authUser ? (
                <>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleRegisterClick();
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C9A050] to-[#8C6B28] text-white font-bold text-xs shadow-md text-center cursor-pointer"
                  >
                    {t('header.get_started')}
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLoginClick();
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${theme === 'dark' ? 'border-[#2A2A2E] text-[#E5E1D8]' : 'border-[#DFC896] text-[#2C2825]'
                      }`}
                  >
                    {t('header.login')}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onGoToDashboard();
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C9A050] to-[#8C6B28] text-white font-bold text-xs shadow-md text-center flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{t('header.dashboard')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 scroll-smooth">

        {/* Universal Astrologer Background (Fixed across all sections) */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div
            className={`absolute inset-0 bg-no-repeat bg-cover bg-center bg-[url('/astrologer_bg.webp')] transition-opacity duration-700 ${theme === 'dark' ? 'opacity-[0.35]' : 'opacity-[0.20]'}`}
          ></div>
          <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-transparent ${theme === 'dark' ? 'to-[#0D0D0F]/90' : 'to-[#F0ECE1]/90'}`}></div>
        </div>

        {currentView === 'blogs' ? (
          <BlogPage
            theme={theme}
            initialBlog={selectedBlogForPage}
            onBack={() => {
              setSelectedBlogForPage(null);
              setCurrentView('landing');
              if (window.location.pathname !== '/') {
                window.history.pushState({}, '', '/');
              }
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }}
          />
        ) : ['about-us', 'faq', 'privacy-policy', 'cookie-policy', 'terms-and-conditions'].includes(currentView) ? (
          <LegalInfoPage
            view={currentView as LegalPageView}
            onBack={() => {
              const returnToAuth = sessionStorage.getItem('return_to_auth');
              setCurrentView('landing');
              if (window.location.pathname !== '/') {
                window.history.pushState({}, '', '/');
              }
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              if (returnToAuth) {
                sessionStorage.removeItem('return_to_auth');
                onLoginClick();
              }
            }}
            onNavigateView={(v) => {
              setCurrentView(v);
              if (window.location.pathname !== `/${v}`) {
                window.history.pushState({}, '', `/${v}`);
              }
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }}
            theme={theme}
          />
        ) : (
          <div className="max-w-7xl mx-auto px-3 sm:px-6 relative z-10">
            <div id="hero-section" className="scroll-mt-24 min-h-[calc(100vh-5rem)] py-4 sm:py-8 lg:py-16 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-12 items-center">

              {/* Left Column: Greetings */}
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1">
                <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-[#C9A050]/20 to-transparent border border-[#C9A050]/30 text-[#C9A050] text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-2 sm:mb-6 backdrop-blur-md shadow-[0_0_15px_rgba(201,160,80,0.15)]">
                  <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span>{t('hero.badge', 'Authentic Vedic Oracle')}</span>
                </div>

                <h1 className={`astro-hero-title text-xl sm:text-5xl lg:text-6xl font-serif font-extrabold leading-tight mb-2 sm:mb-6 uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <Trans
                    i18nKey="hero.title"
                    components={{
                      brand: (
                        <span
                          className="astro-hero-brand inline-flex mt-1 sm:mt-2 items-center justify-center lg:justify-start font-extrabold whitespace-nowrap"
                          style={{ fontFamily: "'Stardom', Georgia, serif" }}
                        >
                          {"ASTRO".split("").map((char, index) => (
                            <motion.span
                              key={index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.6, delay: index * 0.08, ease: "easeOut" }}
                              className={`brand-astro inline-block font-extrabold ${theme === 'dark' ? 'text-[#F3EFE6]' : 'text-[#0D0D0F]'}`}
                              style={{
                                fontFamily: "'Stardom', Georgia, serif",
                                fontWeight: 800,
                                WebkitTextStroke: theme === 'dark' ? '0.025em #F3EFE6' : '0.03em #0D0D0F'
                              }}
                            >
                              {char}
                            </motion.span>
                          ))}
                          {"JUNCTION".split("").map((char, index) => (
                            <motion.span
                              key={`v-${index}`}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.6, delay: (index + 5) * 0.08, ease: "easeOut" }}
                              className={`brand-junction inline-block font-extrabold ${theme === 'dark' ? 'text-[#C9A050]' : 'text-[#8C6218]'}`}
                              style={{
                                fontFamily: "'Stardom', Georgia, serif",
                                fontWeight: 800,
                                WebkitTextStroke: theme === 'dark' ? '0.025em #C9A050' : '0.025em #8C6218'
                              }}
                            >
                              {char}
                            </motion.span>
                          ))}
                        </span>
                      ),
                      br: <br className="block my-0.5 sm:my-1" />,
                    }}
                  />
                </h1>

                <p className={`max-w-xl text-xs sm:text-lg lg:text-xl mb-4 sm:mb-10 leading-relaxed ${theme === 'dark' ? 'text-[#D0CBC0]' : 'text-black'}`}>
                  {t('hero.description')}
                </p>

                <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto space-y-4 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={authUser ? onGoToDashboard : handleRegisterClick}
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 sm:px-8 sm:py-4 rounded-xl bg-gradient-to-r from-[#C9A050] to-[#8C6B28] text-white font-bold text-xs sm:text-base hover:from-[#D4AF37] hover:to-[#A37B2F] transition-all cursor-pointer shadow-[0_0_20px_rgba(201,160,80,0.4)] hover:shadow-[0_0_30px_rgba(201,160,80,0.6)] hover:-translate-y-1"
                  >
                    <span>{authUser ? t('hero.cta_dashboard') : t('hero.cta_unlock')}</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Hero Spinning Zodiac Wheel */}
              <div className="relative group flex justify-center lg:justify-end order-1 lg:order-2 overflow-visible">
                <div className="absolute inset-0 bg-[#C9A050]/20 rounded-full blur-[60px] opacity-60 group-hover:opacity-100 transition-opacity duration-700 lg:translate-x-16"></div>

                {/* The wheel container */}
                <div className="relative w-36 h-36 xs:w-44 xs:h-44 sm:w-72 sm:h-72 lg:w-[480px] lg:h-[480px] flex items-center justify-center lg:translate-x-[15%]">
                  <img
                    src="/white_zodiac_wheel.webp"
                    alt="AstroJunction Zodiac Wheel"
                    width={480}
                    height={480}
                    decoding="async"
                    {...({ fetchPriority: 'high' } as any)}
                    className="w-full h-full object-cover rounded-full shadow-[0_0_60px_rgba(201,160,80,0.4)] border border-[#C9A050]/40 relative z-10 animate-[spin_60s_linear_infinite]"
                  />

                  {/* AstroJunction Premium Center Core */}
                  <div className="absolute z-20 flex flex-col items-center justify-center pointer-events-none">
                    {/* Outer glowing aura */}
                    <div className="absolute inset-0 rounded-full bg-[#C9A050]/20 blur-2xl animate-pulse"></div>

                    {/* Rotating decorative dashed ring */}
                    <div className="absolute w-14 h-14 xs:w-18 xs:h-18 sm:w-[110px] sm:h-[110px] rounded-full border-[1.5px] border-dashed border-[#C9A050]/50 animate-[spin_40s_linear_infinite_reverse]"></div>

                    {/* Core Container */}
                    <div className="relative bg-gradient-to-br from-[#1C1A14] to-[#0A0907] border-[2px] border-[#C9A050]/80 shadow-[0_0_40px_rgba(201,160,80,0.6),inset_0_0_15px_rgba(201,160,80,0.2)] rounded-full w-12 h-12 xs:w-16 xs:h-16 sm:w-24 sm:h-24 flex flex-col items-center justify-center overflow-hidden">

                      {/* Inner gold reflection / glass highlight */}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent rounded-full pointer-events-none"></div>

                      {/* Central Om Symbol with Glow */}
                      <span className="text-[#D4AF37] text-sm xs:text-base sm:text-2xl leading-none drop-shadow-[0_0_12px_rgba(201,160,80,0.9)] mb-0.5 sm:mb-1">
                        ॐ
                      </span>

                      {/* Typography */}
                      <span className="text-[#E5C170] font-serif font-bold text-[6.5px] xs:text-[7.5px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] text-center flex flex-col items-center drop-shadow-md">
                        <span>ASTRO</span>
                        <span className="font-sans text-[7px] xs:text-[8px] sm:text-[9.5px] tracking-normal mt-0.5 text-[#C9A050]">JUNCTION</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stacked Layout for Zodiac and Panjika */}
            <div className="flex flex-col gap-8 pt-6 pb-12 w-full">
              {/* Full Global Zodiac Section */}
              <div id="zodiac-section" className="scroll-mt-24 w-full text-left">
                <GlobalZodiacView
                  key={`zodiac-${zodiacResetKey}-${currentLanguage}`}
                  language={currentLanguage}
                  theme={theme}
                  onAskAIForSign={handleAskAIForSign}
                />
              </div>

              {/* Panjika & Calendar Section Below */}
              <div id="panjika-section" className="scroll-mt-24 w-full text-left flex flex-col gap-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:items-center">
                  <div className="w-full">
                    <PanjikaCalendarView key={`panjika-${zodiacResetKey}`} theme={theme} />
                  </div>
                  <div className="w-full hidden lg:flex items-center justify-center p-4">
                    <div className="relative w-full max-w-[340px] xl:max-w-[380px] aspect-square rounded-full overflow-hidden shadow-[0_0_50px_rgba(201,160,80,0.2)] border-2 border-[#C9A050]/20 group">
                      <img
                        src="/vedic_calendar_alt.webp"
                        alt="Vedic Calendar"
                        loading="lazy"
                        decoding="async"
                        width={380}
                        height={380}
                        className="w-full h-full object-cover scale-[1.02] animate-[spin_120s_linear_infinite]"
                      />
                      <div className="absolute inset-0 rounded-full shadow-[inset_0_0_40px_rgba(0,0,0,0.9)] pointer-events-none"></div>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#C9A050]/10 to-transparent mix-blend-overlay pointer-events-none"></div>
                    </div>
                  </div>
                </div>

                <ZodiacCompatibilityMatrix key={`compat-${zodiacResetKey}-${currentLanguage}`} language={currentLanguage} theme={theme} />
              </div>
            </div>

            {/* Sacred Vedic Remedies Section (4 Hardcoded Remedies) */}
            <div id="remedies-section" className="scroll-mt-24 w-full">
              <VedicRemediesSection
                theme={theme}
                onAskAI={handleAskAIForSign}
              />
            </div>

            <div id="blog-section" className="scroll-mt-24 w-full">
              <BlogCarousel
                theme={theme}
                onSelectBlog={(blog) => {
                  sessionTracker.trackBlogClick({
                    id: blog.id,
                    title: blog.title,
                    category: blog.category,
                  });
                  setSelectedBlogForPage(blog);
                  setCurrentView('blogs');
                  const slug = blog.slug || blog.id;
                  if (window.location.pathname !== `/blogs/${slug}`) {
                    window.history.pushState({ blogSlug: slug }, '', `/blogs/${slug}`);
                  }
                  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                }}
                onViewAll={() => {
                  setSelectedBlogForPage(null);
                  setCurrentView('blogs');
                  if (window.location.pathname !== '/blogs') {
                    window.history.pushState({}, '', '/blogs');
                  }
                  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                }}
              />
            </div>

            {/* Premium Features Teaser (Locked Cards) */}
            <div id="premium-section" className="scroll-mt-24 w-full pt-8 pb-16">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-serif font-bold mb-3 flex items-center justify-center space-x-2">
                  <Lock className="w-6 h-6 text-[#C9A050]" />
                  <span>{t('premium.title')}</span>
                </h2>
                <p className={`text-sm text-center mx-auto max-w-lg ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-black font-medium'}`}>
                  {t('premium.subtitle')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {PREMIUM_FEATURES_CATALOG.map((feat) => {
                  const Icon = feat.icon;
                  const getFeatTitle = (id: string, fallback: string) => {
                    if (id === 'birth-chart') return t('premium.cards.birth_chart');
                    if (id === 'numerology') return t('premium.cards.numerology');
                    if (id === 'roadmap') return t('premium.cards.roadmap');
                    if (id === 'ai-astrologer') return t('premium.cards.daivajna_pro');
                    return fallback;
                  };
                  const getFeatDesc = (id: string, fallback: string) => {
                    if (id === 'birth-chart') return t('premium.cards.birth_chart_desc');
                    if (id === 'numerology') return t('premium.cards.numerology_desc');
                    if (id === 'roadmap') return t('premium.cards.roadmap_desc');
                    if (id === 'ai-astrologer') return t('premium.cards.daivajna_pro_desc');
                    return fallback;
                  };
                  return (
                    <div
                      key={feat.id}
                      onClick={() => {
                        sessionTracker.trackFeaturePreviewClick({
                          id: feat.id,
                          title: feat.title,
                        });
                        setSelectedFeatureForPreview(feat);
                      }}
                      className={`relative overflow-hidden rounded-3xl p-6 md:p-8 text-left cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#C9A050]/20 group flex flex-col justify-between min-h-[220px] ${theme === 'dark'
                        ? 'bg-gradient-to-br from-[#1C1C22]/90 to-[#0D0D0F]/90 border border-[#2A2A2E]/80 hover:border-[#C9A050]/50'
                        : 'bg-gradient-to-br from-white/90 to-[#F9F7F1]/80 border border-[#E5E1D8]/80 hover:border-[#C9A050]/50 shadow-sm'
                        }`}
                    >
                      {/* Background Watermark Icon */}
                      <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none transform group-hover:scale-110 group-hover:-rotate-6">
                        <Icon className="w-40 h-40" />
                      </div>

                      {/* Glassmorphism Video Demo Preview Overlay on Hover */}
                      <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#0D0D0F]/80 backdrop-blur-sm p-4 text-center">
                        <div className="flex flex-col items-center transform group-hover:scale-105 transition-transform duration-300">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#C9A050] to-[#8C6B28] text-white flex items-center justify-center shadow-[0_0_20px_rgba(201,160,80,0.5)] mb-3 relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            <Play className="w-6 h-6 fill-current ml-1 relative z-10" />
                          </div>
                          <span className="text-[#F0ECE1] font-serif font-bold text-sm tracking-wide mb-1">
                            {t('premium.demo_play')}
                          </span>
                          <span className="text-xs text-[#C9A050] font-mono tracking-widest uppercase">
                            {t('premium.preview_unlock')}
                          </span>
                        </div>
                      </div>

                      <div className="relative z-10 opacity-90 group-hover:opacity-10 transition-opacity duration-300 flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${theme === 'dark' ? 'bg-[#141418] border border-[#2A2A2E]' : 'bg-white border border-[#E5E1D8]'}`}>
                            <Icon className="w-6 h-6 text-[#C9A050]" />
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-full uppercase tracking-wider border ${theme === 'dark' ? 'bg-[#141418] text-[#F5D07A] border-[#C9A050]/40 font-extrabold' : 'bg-amber-100/80 text-[#5C3A00] border-amber-300 font-extrabold'}`}>
                            Premium
                          </span>
                        </div>
                        <h3 className={`font-serif text-xl font-bold mb-2 leading-snug ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>{getFeatTitle(feat.id, feat.title)}</h3>
                        <p className={`text-sm leading-relaxed text-left ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-black font-medium'}`}>{getFeatDesc(feat.id, feat.desc)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        <Footer
          onOpenDisclaimer={onOpenDisclaimer}
          theme={theme}
          activePage={currentView}
          onNavigatePage={(page) => {
            setCurrentView(page);
            if (window.location.pathname !== `/${page}`) {
              window.history.pushState({}, '', `/${page}`);
            }
            window.scrollTo({ top: 0, behavior: 'instant' });
          }}
          setActiveTab={(_tab) => {
            if (authUser && onGoToDashboard) {
              onGoToDashboard();
            } else {
              onLoginClick();
            }
          }}
        />
      </main>

      {/* Feature 15-Second Video Preview & Details Modal */}
      <FeaturePreviewModal
        feature={selectedFeatureForPreview}
        isOpen={!!selectedFeatureForPreview}
        onClose={() => setSelectedFeatureForPreview(null)}
        onLoginClick={() => {
          setSelectedFeatureForPreview(null);
          if (authUser && onGoToDashboard) {
            onGoToDashboard();
          } else {
            onLoginClick();
          }
        }}
        onRegisterClick={() => {
          setSelectedFeatureForPreview(null);
          if (authUser && onGoToDashboard) {
            onGoToDashboard();
          } else {
            onRegisterClick();
          }
        }}
        theme={theme}
      />

      {/* Mini Chat Pop-up */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className={`mb-3 sm:mb-4 w-[calc(100vw-2rem)] sm:w-[340px] max-w-[340px] rounded-2xl shadow-2xl border flex flex-col overflow-hidden ${theme === 'dark' ? 'bg-[#141418] border-[#C9A050]/40' : 'bg-[#FFFFFF] border-[#C9A050]/40 shadow-[#C9A050]/10'}`}
            >
              <div className="bg-[#C9A050] p-3 text-[#0D0D0F] flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm">AstroJunction</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={handleResetChat}
                    title={t('chat.guest_restart', 'Restart Chat')}
                    aria-label={t('chat.guest_restart', 'Restart Chat')}
                    className="hover:bg-black/10 p-1 rounded-md transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsChatOpen(false)}
                    title={t('chat.close_chat', 'Close Chat')}
                    aria-label={t('chat.close_chat', 'Close Chat')}
                    className="hover:bg-black/10 p-1 rounded-md transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className={`h-[280px] p-3 overflow-y-auto flex flex-col space-y-3 text-xs ${theme === 'dark' ? 'bg-[#0D0D0F]' : 'bg-[#F0ECE1]/50'}`}>
                {messages
                  .filter(m => m.content.trim() !== "Please login to unlock deep analysis and detailed celestial wisdom.")
                  .map((m, i) => {
                    return (
                      <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[88%] p-2.5 rounded-xl flex items-start space-x-2 shadow-sm ${m.role === 'user'
                          ? 'bg-[#C9A050] text-[#0D0D0F] rounded-tr-sm font-medium'
                          : (theme === 'dark' ? 'bg-[#1A1A1E] text-[#E5E1D8] border border-[#2A2A2E] rounded-tl-sm' : 'bg-[#FFFFFF] text-[#0D0D0F] border border-[#E5E1D8] rounded-tl-sm')
                          }`}>
                          {m.role === 'assistant' && <Bot className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#C9A050]" />}
                          <div className="flex flex-col space-y-1.5 leading-relaxed w-full">
                            {(() => {
                              // If initial assistant greeting, always ensure it is localized to current active language
                              let rawContent = m.content;
                              if (i === 0 && m.role === 'assistant' && (
                                rawContent.includes("guide your astrological journey") ||
                                rawContent.includes("JyotishVeda") ||
                                rawContent.includes("AstroJunction") ||
                                rawContent.startsWith("Namaste") ||
                                rawContent.startsWith("नमस्ते") ||
                                rawContent.startsWith("নমস্কার") ||
                                rawContent.startsWith("வணக்கம்") ||
                                rawContent.startsWith("Namasté")
                              )) {
                                rawContent = t('chat.guest_greeting', 'Namaste. I am AstroJunction. How may I guide your astrological journey today?');
                              }

                              // Strip all asterisks (*) and any embedded login prompt from message bubble
                              let cleanContent = rawContent.replace(/\*/g, '');
                              cleanContent = cleanContent.replace(/Please login to unlock deep analysis and detailed celestial wisdom\./g, '').trim();
                              const lines = cleanContent.split('\n');

                              return (
                                <div className="flex flex-col space-y-1">
                                  {lines.map((line, idx) => {
                                    const trimmed = line.trim();
                                    if (!trimmed) return <div key={idx} className="h-0.5" />;

                                    // Bullet point lines
                                    if (trimmed.startsWith('•')) {
                                      const colonIdx = trimmed.indexOf(':');
                                      if (colonIdx !== -1) {
                                        const label = trimmed.substring(0, colonIdx + 1);
                                        const val = trimmed.substring(colonIdx + 1);
                                        return (
                                          <div key={idx} className="flex flex-wrap items-baseline gap-1 pl-1">
                                            <span className="font-semibold text-[#C9A050] dark:text-[#E5B869]">{label}</span>
                                            <span className="font-medium text-current">{val}</span>
                                          </div>
                                        );
                                      }
                                    }

                                    // Header line like Kalyan Ho! or Overview
                                    if (trimmed.includes('Kalyan Ho!') || trimmed.includes('Janma Kundli Overview')) {
                                      return (
                                        <div key={idx} className="font-semibold text-xs mb-1 text-[#C9A050] dark:text-[#E5B869]">
                                          {trimmed}
                                        </div>
                                      );
                                    }

                                    return (
                                      <div key={idx} className="leading-relaxed">
                                        {trimmed}
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {isAiThinking && (
                  <div className="flex items-center space-x-1.5 p-2 rounded-xl bg-black/5 dark:bg-white/5 text-[11px] text-[#C9A050] w-fit font-sans" style={{ lineHeight: 1.5, letterSpacing: 'normal' }}>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>{t('chat.guest_thinking', 'Consulting celestial transits...')}</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Dedicated Separate Login Gate Section */}
              {(savedDob || msgCount >= 2) && (
                <div className={`p-2.5 mx-3 my-1.5 rounded-xl border flex flex-col space-y-2 shadow-sm ${theme === 'dark'
                  ? 'bg-[#18181D] border-[#C9A050]/40 text-[#E5E1D8]'
                  : 'bg-[#FAF7F0] border-[#C9A050]/40 text-[#0D0D0F]'
                  }`}>
                  <div className="flex items-start space-x-2">
                    <Lock className="w-3.5 h-3.5 text-[#C9A050] mt-0.5 shrink-0" />
                    <p className="text-[11px] font-medium leading-relaxed font-sans" style={{ lineHeight: 1.5, letterSpacing: 'normal' }}>
                      {t('chat.guest_login_gate', 'Please login to unlock deep analysis and detailed celestial wisdom.')}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsChatOpen(false);
                      if (authUser && onGoToDashboard) {
                        onGoToDashboard();
                      } else {
                        onLoginClick();
                      }
                    }}
                    className="w-full py-1.5 px-3 rounded-lg bg-[#C9A050] hover:bg-[#D4AF37] text-[#0D0D0F] font-bold text-xs transition shadow-sm cursor-pointer flex items-center justify-center space-x-1"
                  >
                    <span>{authUser ? t('chat.guest_dashboard_btn', 'Go to Kundli Dashboard') : t('chat.guest_login_btn', 'Login To Continue')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className={`p-3 border-t flex flex-col ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-[#FFFFFF] border-[#E5E1D8]'}`}>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={msgCount >= 3 ? t('chat.guest_limit_reached', 'Message limit reached.') : t('chat.guest_ask_quick', 'Ask a quick question...')}
                    disabled={msgCount >= 3}
                    className={`flex-1 px-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:border-[#C9A050] disabled:opacity-50 ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E] text-[#F0ECE1]' : 'bg-[#F0ECE1] border-[#E5E1D8] text-[#0D0D0F]'}`}
                  />
                  <button
                    onClick={handleSend}
                    disabled={msgCount >= 3 || !input.trim()}
                    title={t('chat.send_button', 'Send message')}
                    aria-label={t('chat.send_button', 'Send message')}
                    className="p-1.5 rounded-lg bg-[#C9A050] text-[#0D0D0F] disabled:opacity-50 cursor-pointer hover:bg-[#D4AF37] transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isChatOpen && (
          <button
            onClick={() => setIsChatOpen(true)}
            title={t('userPanel.fab.title', 'Chat With Us')}
            aria-label={t('userPanel.fab.ariaLabel', 'Chat With Us')}
            className={`w-[58px] h-[58px] sm:w-[66px] sm:h-[66px] rounded-full flex flex-col items-center justify-center p-1 shadow-xl shadow-[#C9A050]/30 transition-all duration-300 cursor-pointer group hover:scale-105 active:scale-95 ${
              theme === 'dark'
                ? 'bg-[#C9A050] hover:bg-[#D4AF37] text-[#0D0D0F]'
                : 'bg-[#C9A050] hover:bg-[#B38730] text-white'
            }`}
          >
            <MessageSquareText className="w-5 h-5 sm:w-6 sm:h-6 text-current transition-transform duration-200 shrink-0 mb-0.5" />
            <span className="text-[10px] sm:text-[11.5px] font-bold leading-none text-center tracking-tight select-none px-0.5">
              {t('userPanel.fab.label', 'Chat With Us')}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
