import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getApiBaseUrl } from '../services/api';

import en from './locales/en.json';
import hi from './locales/hi.json';
import bn from './locales/bn.json';
import ta from './locales/ta.json';
import fr from './locales/fr.json';

export const SUPPORTED_LANGUAGES = ['en', 'hi', 'bn', 'ta', 'fr'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const MANUAL_LANG_KEY = 'astrojunction_lang';
export const MANUAL_LANG_KEY_ALT = 'jyotish_language';
export const AUTO_LANG_KEY = 'astrojunction_lang_auto';

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

export function getUrlLanguage(): SupportedLanguage | null {
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
  return null;
}

export function getManualLanguage(): SupportedLanguage | null {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(MANUAL_LANG_KEY) || localStorage.getItem(MANUAL_LANG_KEY_ALT);
      const clean = saved?.split('-')[0]?.toLowerCase();
      if (clean && (SUPPORTED_LANGUAGES as readonly string[]).includes(clean)) {
        return clean as SupportedLanguage;
      }
    }
  } catch {
    // localStorage unavailable
  }
  return null;
}

export function getAutoLanguage(): SupportedLanguage | null {
  try {
    if (typeof localStorage !== 'undefined') {
      const auto = localStorage.getItem(AUTO_LANG_KEY);
      const clean = auto?.split('-')[0]?.toLowerCase();
      if (clean && (SUPPORTED_LANGUAGES as readonly string[]).includes(clean)) {
        return clean as SupportedLanguage;
      }
    }
  } catch {
    // localStorage unavailable
  }
  return null;
}

export function getBrowserFallbackLanguage(): SupportedLanguage {
  try {
    if (typeof navigator !== 'undefined' && navigator.language) {
      const browserLang = navigator.language.split('-')[0]?.toLowerCase();
      if (browserLang && (SUPPORTED_LANGUAGES as readonly string[]).includes(browserLang)) {
        return browserLang as SupportedLanguage;
      }
    }
  } catch {
    // navigator unavailable
  }
  return 'en';
}

/**
 * Called ONLY when the user manually changes language in a language selector.
 * Saves to manual keys ('astrojunction_lang' and 'jyotish_language').
 */
export function setManualLanguage(lng: SupportedLanguage): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(MANUAL_LANG_KEY, lng);
      localStorage.setItem(MANUAL_LANG_KEY_ALT, lng);
    }
  } catch {
    // ignore storage error
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
    document.documentElement.setAttribute('translate', 'no');
    document.documentElement.classList.add('notranslate');
  }
  i18n.changeLanguage(lng);
}

/**
 * Called ONLY by automatic resolution (geo endpoint or browser fallback).
 * Saves to auto key ('astrojunction_lang_auto') ONLY.
 * NEVER writes to manual keys ('astrojunction_lang' or 'jyotish_language').
 */
export async function setAutoLanguage(lng: SupportedLanguage): Promise<void> {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(AUTO_LANG_KEY, lng);
    }
  } catch {
    // ignore storage error
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
    document.documentElement.setAttribute('translate', 'no');
    document.documentElement.classList.add('notranslate');
  }
  await i18n.changeLanguage(lng);
}

function getInitialLanguage(): SupportedLanguage {
  const urlLang = getUrlLanguage();
  if (urlLang) return urlLang;

  const manual = getManualLanguage();
  if (manual) return manual;

  const auto = getAutoLanguage();
  if (auto) return auto;

  return 'en';
}

/**
 * Resolves language before first paint without flash of English:
 * 1. URL parameter (?lang=) takes highest priority
 * 2. User's manual selection (localStorage astrojunction_lang / jyotish_language)
 * 3. Previous auto selection (localStorage astrojunction_lang_auto) for returning visitors
 * 4. First visit: GET /geo/language with 1500ms timeout
 * 5. Fallback on geo error / timeout / "default" / "country-only": browser language or English
 */
export async function initLanguage(): Promise<SupportedLanguage> {
  // Test helper: ?first_visit=1 or ?reset_lang=1 simulates a brand-new first visit
  try {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      if (sp.has('first_visit') || sp.has('reset_lang') || sp.has('clear_lang')) {
        localStorage.removeItem(MANUAL_LANG_KEY);
        localStorage.removeItem(MANUAL_LANG_KEY_ALT);
        localStorage.removeItem(AUTO_LANG_KEY);
      }
    }
  } catch {
    // ignore
  }

  const urlLang = getUrlLanguage();
  if (urlLang) {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = urlLang;
      document.documentElement.setAttribute('translate', 'no');
      document.documentElement.classList.add('notranslate');
    }
    if (i18n.language !== urlLang) {
      await i18n.changeLanguage(urlLang);
    }
    return urlLang;
  }

  const manual = getManualLanguage();
  if (manual) {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = manual;
      document.documentElement.setAttribute('translate', 'no');
      document.documentElement.classList.add('notranslate');
    }
    if (i18n.language !== manual) {
      await i18n.changeLanguage(manual);
    }
    return manual;
  }

  const auto = getAutoLanguage();
  if (auto) {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = auto;
      document.documentElement.setAttribute('translate', 'no');
      document.documentElement.classList.add('notranslate');
    }
    if (i18n.language !== auto) {
      await i18n.changeLanguage(auto);
    }
    return auto;
  }

  // First visit only: Call /geo/language with 3000ms timeout
  let resolvedLang: SupportedLanguage | null = null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const baseUrl = getApiBaseUrl().replace(/\/+$/, '');
    const geoUrl = baseUrl ? `${baseUrl}/geo/language` : '/geo/language';

    let res: Response | null = null;
    try {
      res = await fetch(geoUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
    } catch (directErr) {
      // If direct backendUrl fetch was blocked (e.g. cross-origin/PNA in Edge/Chrome), fallback to same-origin relative proxy
      if (geoUrl !== '/geo/language') {
        try {
          res = await fetch('/geo/language', {
            method: 'GET',
            headers: { Accept: 'application/json' },
            signal: controller.signal,
          });
        } catch {
          // both failed
        }
      }
    }
    clearTimeout(timeoutId);

    if (res && res.ok) {
      const contentType = res.headers?.get ? (res.headers.get('content-type') || '') : '';
      if (contentType && !contentType.includes('json')) {
        console.warn(`[i18n] Non-JSON response from ${geoUrl}: ${contentType}`);
      } else {
        const data = await res.json();
        console.log('[i18n] /geo/language response:', data);
        if (
          data &&
          data.status === 'success' &&
          data.lang &&
          (SUPPORTED_LANGUAGES as readonly string[]).includes(data.lang) &&
          data.source !== 'default' &&
          data.source !== 'country-only'
        ) {
          resolvedLang = data.lang as SupportedLanguage;
        }
      }
    }
  } catch (err) {
    console.warn('[i18n] Failed to fetch geo language:', err);
  }

  // Browser language fallback if geo failed, timed out, or returned default / country-only
  if (!resolvedLang) {
    resolvedLang = getBrowserFallbackLanguage();
  }

  // Save auto result to AUTO key ONLY (never writes manual keys)
  await setAutoLanguage(resolvedLang);
  return resolvedLang;
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

export function toAsciiDigits(str: string): string {
  if (!str) return '';
  return str
    .replace(/[०-९]/g, d => String(d.charCodeAt(0) - 0x0966))
    .replace(/[০-৯]/g, d => String(d.charCodeAt(0) - 0x09E6))
    .replace(/[௦-௯]/g, d => String(d.charCodeAt(0) - 0x0BE6));
}

export function formatPanchangTime(
  timeStr: string,
  lang?: string
): string {
  if (!timeStr) return '';
  const locale = (lang || getCurrentLang());
  const normalized = toAsciiDigits(timeStr);
  return normalized.replace(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/g, (match, h, m, period) => {
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

