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

export default i18n;

