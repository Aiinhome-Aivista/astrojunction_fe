import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import hi from './locales/hi.json';
import bn from './locales/bn.json';
import ta from './locales/ta.json';
import fr from './locales/fr.json';

export const SUPPORTED_LANGUAGES = ['en', 'hi', 'bn', 'ta', 'fr'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export interface LanguageOption {
  code: SupportedLanguage;
  shortLabel: string;
  nativeName: string;
}

export const LANGUAGE_OPTIONS: readonly LanguageOption[] = [
  { code: 'en', shortLabel: 'EN', nativeName: 'English' },
  { code: 'hi', shortLabel: 'HI', nativeName: 'हिन्दी' },
  { code: 'bn', shortLabel: 'BN', nativeName: 'বাংলা' },
  { code: 'ta', shortLabel: 'TA', nativeName: 'தமிழ்' },
  { code: 'fr', shortLabel: 'FR', nativeName: 'Français' },
];

function getInitialLanguage(): SupportedLanguage {
  try {
    if (typeof window !== 'undefined') {
      const urlLang = new URLSearchParams(window.location.search).get('lang')?.toLowerCase();
      if (urlLang && (SUPPORTED_LANGUAGES as readonly string[]).includes(urlLang)) {
        return urlLang as SupportedLanguage;
      }
    }
  } catch {
    // window unavailable
  }

  try {
    const saved = localStorage.getItem('astrojunction_lang');
    if (saved && (SUPPORTED_LANGUAGES as readonly string[]).includes(saved)) {
      return saved as SupportedLanguage;
    }
  } catch {
    // localStorage unavailable
  }

  try {
    const browserLang = navigator.language?.split('-')[0]?.toLowerCase();
    if (browserLang && (['hi', 'bn', 'ta', 'fr'] as string[]).includes(browserLang)) {
      return browserLang as SupportedLanguage;
    }
  } catch {
    // navigator unavailable
  }

  return 'en';
}

const initialLanguage = getInitialLanguage();

if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLanguage;
  document.documentElement.setAttribute('translate', 'no');
  document.documentElement.classList.add('notranslate');
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      bn: { translation: bn },
      ta: { translation: ta },
      fr: { translation: fr },
    },
    lng: initialLanguage,
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

i18n.on('languageChanged', (lng: string) => {
  try {
    localStorage.setItem('astrojunction_lang', lng);
  } catch {
    // ignore storage error
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
    document.documentElement.setAttribute('translate', 'no');
    document.documentElement.classList.add('notranslate');
  }
});

/**
 * Internationalization Helpers with strict Latin digits (numberingSystem: "latn")
 */

export function getCurrentLang(): SupportedLanguage {
  const current = (i18n.language || 'en').split('-')[0].toLowerCase();
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(current)
    ? (current as SupportedLanguage)
    : 'en';
}

export function getNumberingSystem(lang?: string): string {
  const l = (lang || getCurrentLang()).split('-')[0].toLowerCase();
  if (l === 'hi') return 'deva';
  if (l === 'bn') return 'beng';
  return 'latn';
}

export function formatDate(
  date: Date | string | number,
  lang?: string,
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    const locale = (lang || getCurrentLang());
    const numSys = getNumberingSystem(locale);
    return new Intl.DateTimeFormat(locale, {
      numberingSystem: numSys,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    }).format(d);
  } catch {
    return String(date);
  }
}

export function formatTime(
  date: Date | string | number,
  lang?: string,
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    const locale = (lang || getCurrentLang());
    const numSys = getNumberingSystem(locale);
    return new Intl.DateTimeFormat(locale, {
      numberingSystem: numSys,
      hour: '2-digit',
      minute: '2-digit',
      ...options,
    }).format(d);
  } catch {
    return String(date);
  }
}

export function formatPanchangTime(
  timeStr: string,
  lang?: string
): string {
  if (!timeStr) return '';
  const locale = (lang || getCurrentLang());
  return timeStr.replace(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/g, (match, h, m, period) => {
    let hour = parseInt(h, 10);
    const minute = parseInt(m, 10);
    if (period) {
      if (period.toUpperCase() === 'PM' && hour < 12) hour += 12;
      if (period.toUpperCase() === 'AM' && hour === 12) hour = 0;
    }
    const d = new Date(2026, 0, 1, hour, minute);
    return formatTime(d, locale, { hour: '2-digit', minute: '2-digit', hour12: true });
  });
}

export function formatNumber(
  num: number,
  lang?: string,
  options?: Intl.NumberFormatOptions
): string {
  try {
    const locale = (lang || getCurrentLang());
    const numSys = getNumberingSystem(locale);
    return new Intl.NumberFormat(locale, {
      numberingSystem: numSys,
      ...options,
    }).format(num);
  } catch {
    return String(num);
  }
}

export function formatCurrency(
  amount: number,
  currency: string = 'INR',
  lang?: string
): string {
  try {
    const locale = (lang || getCurrentLang());
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      numberingSystem: 'latn',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

/**
 * Universal Vedic lookup helper
 * Looks up i18n key `vedic.${type}.${normalizedCode}`
 */
export function tVedic(type: string, code: string | number, fallback?: string): string {
  if (code === undefined || code === null || code === '') return fallback || '';
  const rawStr = String(code).trim().toLowerCase().replace(/[\s-]+/g, '_');
  const key = `vedic.${type}.${rawStr}`;
  const translated = i18n.t(key, { defaultValue: '' });
  if (translated && translated !== key) {
    return translated;
  }
  return fallback || String(code);
}

export default i18n;

