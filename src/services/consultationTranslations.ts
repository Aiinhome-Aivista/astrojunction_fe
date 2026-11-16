import { formatLocalizedDigits } from './birthChartTranslations';

export { formatLocalizedDigits };

export type SupportedLanguage = 'en' | 'hi' | 'bn' | 'ta' | 'fr';

/**
 * Format price in INR with language-specific digits:
 * hi = Devanagari (₹९९)
 * bn = Bengali (₹৯৯)
 * ta, fr, en = Latin (₹99)
 */
export function formatLocalizedPrice(amount: number, lang: string = 'en'): string {
  if (amount === 0) return '0';
  const l = (lang || 'en').split('-')[0].toLowerCase();
  return formatLocalizedDigits(amount, l);
}

/**
 * Format approximate USD price:
 * e.g. 1.5 -> "~ $१.५ USD" in hi, "~ $১.৫ USD" in bn, "~ $1.5 USD" in ta/fr/en
 */
export function formatLocalizedUsdPrice(usd: number, lang: string = 'en'): string {
  const l = (lang || 'en').split('-')[0].toLowerCase();
  const formatted = formatLocalizedDigits(usd, l);
  return `~ $${formatted} USD`;
}

/**
 * Canonical Plan Codes
 */
export const PLAN_CODE_MAP: Record<string, string> = {
  daily_vedic_subscription: 'parashari_synthesis',
  birth_chart_subscription: 'parashari_synthesis',
  matchmaking_regenerate_subscription: 'matchmaking_counsel',
  roadmap_5_subscription: 'roadmap_5',
  roadmap_10_subscription: 'roadmap_10',
  roadmap_15_subscription: 'roadmap_15',
  roadmap_20_subscription: 'roadmap_20',
  roadmap_25_subscription: 'roadmap_25',
};

/**
 * Get canonical plan code from plan id or plan name
 */
export function getPlanCode(tierId: string, tierName?: string): string {
  if (tierId && PLAN_CODE_MAP[tierId]) {
    return PLAN_CODE_MAP[tierId];
  }
  const normName = (tierName || '').toLowerCase();
  if (normName.includes('25-year') || normName.includes('master life')) return 'roadmap_25';
  if (normName.includes('20-year')) return 'roadmap_20';
  if (normName.includes('15-year')) return 'roadmap_15';
  if (normName.includes('10-year')) return 'roadmap_10';
  if (normName.includes('5-year')) return 'roadmap_5';
  if (normName.includes('matchmaking') || normName.includes('synastry')) return 'matchmaking_counsel';
  if (normName.includes('parashari') || normName.includes('vedic synthesis') || normName.includes('birth chart')) return 'parashari_synthesis';
  return tierId || 'parashari_synthesis';
}

/**
 * Check if the language is Indic (Hindi, Bengali, Tamil)
 * Used to apply Font Rules (no letter-spacing, no forced uppercase, weight 600)
 */
export function isIndicLang(lang: string = 'en'): boolean {
  const l = (lang || 'en').split('-')[0].toLowerCase();
  return l === 'hi' || l === 'bn' || l === 'ta';
}

