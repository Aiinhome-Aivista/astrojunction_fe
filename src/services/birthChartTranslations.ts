/**
 * Vedic Birth Chart & Multi-Tradition Synthesis Translation & Formatting Helpers
 * Strictly follows Antigravity i18n rules:
 * - NO slice() on native or translated strings
 * - Exact explicit numbering systems: hi (deva), bn (beng), ta/fr/en (latn)
 * - Whole keys for ordinals (1st-12th house, 1st-12th lord, 3rd-10th drishti)
 * - Tolerant backend English to canonical ID mappings
 */

import { tVedic } from '../i18n';

export type SupportedLanguage = 'en' | 'hi' | 'bn' | 'ta' | 'fr';

/**
 * Format numbers according to language-specific numeral systems:
 * - Hindi: Devanagari numerals (०, १, २, ...)
 * - Bengali: Bengali numerals (০, ১, ২, ...)
 * - Tamil, French, English: Latin numerals (0, 1, 2, ...)
 */
export function formatLocalizedDigits(num: number | string, lang?: string): string {
  if (num === null || num === undefined || num === '') return '';
  const l = (lang || 'en').split('-')[0].toLowerCase();
  
  if (typeof num === 'string' && isNaN(Number(num))) {
    // If it's a string with digits and text (e.g. "24.91°" or "120 Years")
    return num.replace(/\d+/g, (digitMatch) => {
      const n = parseInt(digitMatch, 10);
      return formatSingleNumber(n, l);
    });
  }

  const n = typeof num === 'number' ? num : parseFloat(num);
  if (isNaN(n)) return String(num);
  return formatSingleNumber(n, l);
}

function formatSingleNumber(n: number, lang: string): string {
  try {
    if (lang === 'hi') {
      return new Intl.NumberFormat('hi-IN-u-nu-deva', { useGrouping: false }).format(n);
    }
    if (lang === 'bn') {
      return new Intl.NumberFormat('bn-BD-u-nu-beng', { useGrouping: false }).format(n);
    }
    if (lang === 'ta') {
      return new Intl.NumberFormat('ta-IN-u-nu-latn', { useGrouping: false }).format(n);
    }
    if (lang === 'fr') {
      return new Intl.NumberFormat('fr-FR', { useGrouping: false }).format(n);
    }
    return new Intl.NumberFormat('en-IN', { useGrouping: false }).format(n);
  } catch {
    return String(n);
  }
}

/**
 * Fixed 2-character (max 3) chart abbreviations per language.
 * NEVER uses string slicing.
 */
export const PLANET_ABBREVIATIONS: Record<string, Record<SupportedLanguage, string>> = {
  sun: { en: 'Su', hi: 'सू', bn: 'সূ', ta: 'சூ', fr: 'So' },
  moon: { en: 'Mo', hi: 'चं', bn: 'চং', ta: 'சந்', fr: 'Lu' }, // bn Moon marked "needs native check"
  mars: { en: 'Ma', hi: 'मं', bn: 'মং', ta: 'செ', fr: 'Ma' },
  mercury: { en: 'Me', hi: 'बु', bn: 'বু', ta: 'பு', fr: 'Me' },
  jupiter: { en: 'Ju', hi: 'गु', bn: 'গু', ta: 'குரு', fr: 'Ju' },
  venus: { en: 'Ve', hi: 'शु', bn: 'শু', ta: 'சுக்', fr: 'Ve' },
  saturn: { en: 'Sa', hi: 'श', bn: 'শ', ta: 'சனி', fr: 'Sa' },
  rahu: { en: 'Ra', hi: 'रा', bn: 'রা', ta: 'ரா', fr: 'Ra' }, // Tamil strictly within 2 chars
  ketu: { en: 'Ke', hi: 'के', bn: 'কে', ta: 'கே', fr: 'Ke' }, // Tamil strictly within 2 chars
  ascendant: { en: 'Lag', hi: 'लग्', bn: 'লগ', ta: 'லக்', fr: 'Asc' },
  uranus: { en: 'Ur', hi: 'अरु', bn: 'ইউ', ta: 'யு', fr: 'Ur' },
  neptune: { en: 'Ne', hi: 'वरु', bn: 'নেপ', ta: 'நெ', fr: 'Ne' },
  pluto: { en: 'Pl', hi: 'यम', bn: 'প্লু', ta: 'புளூ', fr: 'Pl' },
};

export function getPlanetAbbreviation(planetIdOrName: string, lang: string): string {
  const cleanId = (planetIdOrName || '').toLowerCase().trim();
  const l = (lang || 'en').split('-')[0].toLowerCase() as SupportedLanguage;
  const safeLang: SupportedLanguage = ['en', 'hi', 'bn', 'ta', 'fr'].includes(l) ? l : 'en';

  for (const [key, mapping] of Object.entries(PLANET_ABBREVIATIONS)) {
    if (cleanId === key || cleanId.includes(key)) {
      return mapping[safeLang] || mapping['en'];
    }
  }

  // Fallback map for common Sanskrit names
  if (cleanId.includes('surya')) return PLANET_ABBREVIATIONS.sun[safeLang];
  if (cleanId.includes('chandra')) return PLANET_ABBREVIATIONS.moon[safeLang];
  if (cleanId.includes('mangal')) return PLANET_ABBREVIATIONS.mars[safeLang];
  if (cleanId.includes('budh')) return PLANET_ABBREVIATIONS.mercury[safeLang];
  if (cleanId.includes('guru') || cleanId.includes('brihaspati')) return PLANET_ABBREVIATIONS.jupiter[safeLang];
  if (cleanId.includes('shukra')) return PLANET_ABBREVIATIONS.venus[safeLang];
  if (cleanId.includes('shani')) return PLANET_ABBREVIATIONS.saturn[safeLang];

  return cleanId.length > 2 ? cleanId.substring(0, 2) : cleanId;
}

/**
 * Sign abbreviations for chart displays (e.g. "Lag Lib")
 */
export const SIGN_ABBREVIATIONS: Record<string, Record<SupportedLanguage, string>> = {
  aries: { en: 'Ari', hi: 'मेष', bn: 'মেষ', ta: 'மே', fr: 'Bél' },
  taurus: { en: 'Tau', hi: 'वृष', bn: 'বৃষ', ta: 'ரிஷ', fr: 'Tau' },
  gemini: { en: 'Gem', hi: 'मिथु', bn: 'মিথু', ta: 'மிது', fr: 'Gém' },
  cancer: { en: 'Can', hi: 'कर्क', bn: 'কর্ক', ta: 'கட', fr: 'Can' },
  leo: { en: 'Leo', hi: 'सिंह', bn: 'সিংহ', ta: 'சிம்', fr: 'Lion' },
  virgo: { en: 'Vir', hi: 'कन्या', bn: 'কন্যা', ta: 'கன்', fr: 'Vier' },
  libra: { en: 'Lib', hi: 'तुला', bn: 'তুলা', ta: 'துலா', fr: 'Bal' },
  scorpio: { en: 'Sco', hi: 'वृश्चि', bn: 'বৃশ্চি', ta: 'விரு', fr: 'Sco' },
  sagittarius: { en: 'Sag', hi: 'धनु', bn: 'ধনু', ta: 'தனு', fr: 'Sag' },
  capricorn: { en: 'Cap', hi: 'मकर', bn: 'মকর', ta: 'மக', fr: 'Cap' },
  aquarius: { en: 'Aqu', hi: 'कुम्भ', bn: 'কুম্ভ', ta: 'கும்', fr: 'Ver' },
  pisces: { en: 'Pis', hi: 'मीन', bn: 'মীন', ta: 'மீன', fr: 'Pois' },
};

export function getLagnaAbbreviation(signName: string, lang: string): string {
  const l = (lang || 'en').split('-')[0].toLowerCase() as SupportedLanguage;
  const safeLang: SupportedLanguage = ['en', 'hi', 'bn', 'ta', 'fr'].includes(l) ? l : 'en';
  const cleanSign = (signName || '').toLowerCase().trim();

  let signAbbr = 'Lib';
  for (const [sKey, sMap] of Object.entries(SIGN_ABBREVIATIONS)) {
    if (cleanSign === sKey || cleanSign.includes(sKey)) {
      signAbbr = sMap[safeLang] || sMap['en'];
      break;
    }
  }

  const lagnaPrefix = PLANET_ABBREVIATIONS.ascendant[safeLang] || 'Lag';
  return `${lagnaPrefix} ${signAbbr}`;
}

/**
 * Tolerant mapping for backend English Yoga/Dosha names to canonical keys
 */
export const YOGA_CANONICAL_MAP: Record<string, string> = {
  'gajakesari': 'gajakesari',
  'budhaditya': 'budhaditya',
  'hamsa': 'hamsa',
  'ruchaka': 'ruchaka',
  'malavya': 'malavya',
  'bhadra': 'bhadra',
  'sasa': 'sasa',
  'dhana': 'dhana_yoga',
  'raja': 'raja_yoga',
  'vipreet': 'vipreet_raja',
  'chandra mangal': 'chandra_mangal',
  'amala': 'amala',
  'parivartana': 'parivartana',
  'neecha bhanga': 'neecha_bhanga',
  'pancha mahapurusha': 'pancha_mahapurusha',
};

export const DOSHA_CANONICAL_MAP: Record<string, string> = {
  'manglik': 'manglik',
  'mangal': 'manglik',
  'kuja': 'manglik',
  'kaal sarp': 'kaal_sarp',
  'kalsarp': 'kaal_sarp',
  'sade sati': 'sadesati',
  'sadesati': 'sadesati',
  'shani sade': 'sadesati',
  'pitru': 'pitru_dosha',
  'kemdrum': 'kemdrum',
  'guru chandal': 'guru_chandal',
  'gandmool': 'gandmool',
};

export function getCanonicalYogaId(rawName: string): string {
  const clean = (rawName || '').toLowerCase().trim();
  for (const [pattern, id] of Object.entries(YOGA_CANONICAL_MAP)) {
    if (clean.includes(pattern)) {
      return id;
    }
  }
  return clean.replace(/[^a-z0-9_]/g, '_');
}

export function getCanonicalDoshaId(rawName: string): string {
  const clean = (rawName || '').toLowerCase().trim();
  for (const [pattern, id] of Object.entries(DOSHA_CANONICAL_MAP)) {
    if (clean.includes(pattern)) {
      return id;
    }
  }
  return clean.replace(/[^a-z0-9_]/g, '_');
}

/**
 * Dignity code to canonical localization key mapping
 */
export function getDignityKey(rawDignity: string): string {
  const d = (rawDignity || '').toLowerCase().trim();
  if (d.includes('exalt') || d.includes('uchha') || d.includes('uccha')) return 'exalted';
  if (d.includes('debilit') || d.includes('neecha')) return 'debilitated';
  if (d.includes('moolatrikon')) return 'moolatrikona';
  if (d.includes('own') || d.includes('swakshetra')) return 'own';
  if (d.includes('friend') || d.includes('mitra')) return 'friend';
  if (d.includes('enemy') || d.includes('shatru')) return 'enemy';
  if (d.includes('neutral') || d.includes('sama')) return 'neutral';
  return 'neutral';
}

/**
 * Clean plain text from AI response and parse inline bold into structured tokens
 */
export function parseInlineBold(text: string): Array<{ isBold: boolean; text: string }> {
  if (!text) return [];
  const parts: Array<{ isBold: boolean; text: string }> = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ isBold: false, text: text.substring(lastIndex, match.index) });
    }
    parts.push({ isBold: true, text: match[1] });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({ isBold: false, text: text.substring(lastIndex) });
  }

  return parts;
}

export interface SynthesisCard {
  title: string;
  summary: string;
  bullets?: string[];
  tags?: string[];
}

export interface SynthesisSection {
  id: string;
  title: string;
  cards: SynthesisCard[];
  error?: string;
}

export interface SynthesisResponse {
  sections: SynthesisSection[];
  showingEnglishNote?: boolean;
}

/**
 * Parse strict JSON or legacy markdown format safely
 */
export function parseSynthesisOutput(raw: any, fallbackLang: string = 'en'): SynthesisResponse | null {
  if (!raw) return null;

  // If already structured object
  if (typeof raw === 'object' && Array.isArray(raw.sections)) {
    return raw as SynthesisResponse;
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    // Try JSON parsing
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && Array.isArray(parsed.sections)) {
          return parsed as SynthesisResponse;
        }
      } catch {
        // Fall back to markdown parser below
      }
    }

    // Try extracting JSON from markdown fences
    const jsonMatch = trimmed.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed && Array.isArray(parsed.sections)) {
          return parsed as SynthesisResponse;
        }
      } catch {}
    }

    // Safe parser for legacy markdown (### Section followed by - **Title**: Body)
    const sections: SynthesisSection[] = [];
    const sectionBlocks = trimmed.split(/###\s+/).filter(Boolean);

    sectionBlocks.forEach((block, idx) => {
      const lines = block.split('\n');
      const titleLine = lines[0].replace(/[*#]/g, '').trim();
      const bodyLines = lines.slice(1);
      const cards: SynthesisCard[] = [];

      let currentTitle = '';
      let currentBody: string[] = [];

      const flushCard = () => {
        if (currentTitle || currentBody.length > 0) {
          cards.push({
            title: currentTitle || `Insight ${cards.length + 1}`,
            summary: currentBody.join(' ').trim(),
            bullets: [],
          });
          currentTitle = '';
          currentBody = [];
        }
      };

      for (const line of bodyLines) {
        const bulletMatch = line.match(/^\s*[-*]\s*\*\*(.*?)\*\*[:\-—]?\s*(.*)$/);
        if (bulletMatch) {
          flushCard();
          currentTitle = bulletMatch[1].trim();
          if (bulletMatch[2]) currentBody.push(bulletMatch[2].trim());
        } else if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
          flushCard();
          currentTitle = '';
          currentBody.push(line.replace(/^[-*]\s*/, '').trim());
        } else if (line.trim()) {
          currentBody.push(line.trim());
        }
      }
      flushCard();

      sections.push({
        id: `section_${idx + 1}`,
        title: titleLine || `Section ${idx + 1}`,
        cards: cards.length > 0 ? cards : [{ title: titleLine, summary: block.trim(), bullets: [] }],
      });
    });

    if (sections.length > 0) {
      return { sections };
    }
  }

  return null;
}



// ==========================================
// VEDIC DESTINY ROADMAP MULTILINGUAL TRANSLATIONS
// ==========================================

export interface MilestoneLocaleContent {
  guidance: string;
  favorableTransits: string;
  remedialAction: string;
}

export const ROADMAP_MILESTONE_TRANSLATIONS: Record<string, Record<string, MilestoneLocaleContent>> = {
  // --- 0-1 YEAR (FREE) ---
  'ms-0-1': {
    hi: {
      guidance: 'शुभ सूर्य एवं बुध गोचर तीव्र बौद्धिक क्षमता और कार्यकुशलता को सक्रिय करता है। कौशल विकास, समयबद्ध कार्य निष्पादन और टीम में अपनी पहचान बनाने पर ध्यान दें।',
      favorableTransits: 'गोचर में सूर्य-बुध का बुधादित्य योग संरेखण',
      remedialAction: 'प्रतिदिन उगते सूर्य को अर्घ्य दें अथवा सूर्य गायत्री मंत्र का जप करें।',
    },
    bn: {
      guidance: 'শুভ রবি ও বুধের গোচর তীক্ষ্ণ বুদ্ধিবৃত্তিক সিদ্ধান্ত ও কার্যক্ষমতা বৃদ্ধি করে। পেশাগত দক্ষতা বৃদ্ধি, সময়মতো কাজ সম্পন্ন করা এবং টিমে নিজের সুনাম বৃদ্ধির দিকে নজর দিন।',
      favorableTransits: 'গোচরে রবি-বুধের বুধাদিত্য যোগ সংস্থান',
      remedialAction: 'প্রতিদিন সকালে উদীয়মান সূর্যকে অর্ঘ্য দান করুন অথবা সূর্য গায়ত্রী জপ করুন।',
    },
    ta: {
      guidance: 'சூரியன் மற்றும் புதனின் நற்பெயர்ச்சி கூர்மையான அறிவுத்திறன் மற்றும் பணித்திறனை ஊக்குவிக்கிறது. பணி இலக்குகள் மற்றும் நிறுவன நற்பெயரில் கவனம் செலுத்துங்கள்.',
      favorableTransits: 'பெயர்ச்சியில் சூரியன்-புதன் புதாதித்ய யோக சேர்க்கை',
      remedialAction: 'தினசரி காலையில் சூரிய நமஸ்காரம் செய்து சூரிய காயத்ரி மந்திரத்தை ஜபிக்கவும்.',
    },
    fr: {
      guidance: "Le transit bénéfique du Soleil et de Mercure stimule une exécution intellectuelle affûtée. Concentrez-vous sur la consolidation de vos compétences et votre visibilité professionnelle.",
      favorableTransits: "Alignement de transit Budhaditya Soleil-Mercure",
      remedialAction: "Réciter le Surya Gayatri ou offrir de l'eau au Soleil levant chaque matin.",
    },
  },
  'ms-0-2': {
    hi: {
      guidance: 'द्वितीय भाव पर शुभ दृष्टि निरंतर धन आगमन सुनिश्चित करती है। जल्दबाजी में सट्टा या जोखिम भरे निवेश से बचें तथा आपातकालीन बचत को प्राथमिकता दें।',
      favorableTransits: 'संचित धन के द्वितीय भाव पर गुरु की शुभ दृष्टि',
      remedialAction: 'बटुए में एक शुद्ध चांदी का सिक्का रखें; प्रत्येक शुक्रवार श्री सूक्त का पाठ करें।',
    },
    bn: {
      guidance: 'দ্বিতীয় ভাবে শুভ গ্রহের দৃষ্টি স্থিতিশীল অর্থ প্রবাহ নিশ্চিত করে। ঝুঁকিপূর্ণ বা ফটকা বিনিয়োগ এড়িয়ে চলুন এবং জরুরি সঞ্চয় বৃদ্ধি করুন।',
      favorableTransits: 'সঞ্চিত ধনের দ্বিতীয় ভাবে বৃহস্পতির শুভ দৃষ্টি',
      remedialAction: 'মানিব্যাগে একটি খাঁটি রূপার মুদ্রা রাখুন; প্রতি শুক্রবার শ্রী সূক্ত পাঠ করুন।',
    },
    ta: {
      guidance: '2-ஆம் இடத்தின் மீதான சுபப் பார்வை சீரான பணவரவை உறுதி செய்கிறது. ஊக வணிகத்தைத் தவிர்த்து அவசர சேமிப்பை உருவாக்குங்கள்.',
      favorableTransits: 'சேமிப்பு ஸ்தானமான 2-ஆம் வீட்டில் குருவின் பார்வை',
      remedialAction: 'பணப்பையில் ஒரு தூய வெள்ளி நாணயத்தை வைத்திருங்கள்; வெள்ளிக்கிழமை ஸ்ரீ சூக்தம் வாசிக்கவும்.',
    },
    fr: {
      guidance: "L'aspect favorable sur la 2e maison assure un flux financier régulier. Évitez les investissements spéculatifs impulsifs et privilégiez une réserve d'épargne d'urgence.",
      favorableTransits: "Aspect de Jupiter sur la 2e maison du patrimoine accumulé",
      remedialAction: "Gardez une pièce d'argent dans votre portefeuille ; récitez le Shree Suktam le vendredi.",
    },
  },
  'ms-0-3': {
    hi: {
      guidance: 'शुक्र का सौम्य गोचर सुखद संवाद, सामाजिक जुड़ाव और पारिवारिक मतभेदों को सुलझाने में सहायक होगा।',
      favorableTransits: 'शुभ केंद्र भाव में शुक्र का अनुकूल गोचर',
      remedialAction: 'शुक्र देव की कृपा हेतु प्रत्येक शुक्रवार गाय को हरा चारा खिलाएं।',
    },
    bn: {
      guidance: 'শুক্রের অনুকূল গোচর মধুর কথাবার্তা, সামাজিক সৌহার্দ্য এবং ছোটখাটো ভুল বোঝাবুঝি দূর করতে সাহায্য করবে।',
      favorableTransits: 'শুভ কেন্দ্র স্থানে শুক্রের অনুকূল গোচর',
      remedialAction: 'শুক্রের কৃপা লাভের জন্য শুক্রবার গরুকে সবুজ ঘাস খাওয়ান।',
    },
    ta: {
      guidance: 'சுக்கிரனின் அனுகூலப் பெயர்ச்சி இனிமையான உரையாடல்கள் மற்றும் குடும்பத்தில் ஒற்றுமையை ஏற்படுத்துகிறது.',
      favorableTransits: 'சுப கேந்திர ஸ்தானத்தில் சுக்கிரனின் பெயர்ச்சி',
      remedialAction: 'வெள்ளிக்கிழமைகளில் பசுவிற்கு அகத்திக்கீரை அல்லது புல் வழங்கவும்.',
    },
    fr: {
      guidance: "Le transit harmonieux de Vénus apporte des échanges agréables, un renforcement des liens et la résolution des malentendus familiaux.",
      favorableTransits: "Transit de Vénus dans une maison Kendra favorable",
      remedialAction: "Nourrir les vaches avec de l'herbe fraîche le vendredi pour obtenir les bénédictions vénusiennes.",
    },
  },
  'ms-0-4': {
    hi: {
      guidance: 'पित्त और वात ऊर्जा को संतुलित रखने के लिए नियमित नींद, पर्याप्त जल और प्रातःकालीन योगासन पर ध्यान दें।',
      favorableTransits: 'मंगल-गुरु त्रिकोण गोचर से जीवन शक्ति और आरोग्य में वृद्धि',
      remedialAction: 'प्रतिदिन प्रातः तुलसी दल युक्त गुनगुने जल का सेवन करें।',
    },
    bn: {
      guidance: 'পিত্ত ও বাত দোষের ভারসাম্য রক্ষায় নিয়মিত ঘুম, পর্যাপ্ত জলপান এবং হালকা সকালের যোগাসনে মনোযোগ দিন।',
      favorableTransits: 'মঙ্গল-বৃহস্পতির ত্রিকোণ গোচর যা জীবনীশক্তি বৃদ্ধি করে',
      remedialAction: 'প্রতিদিন সকালে তুলসী পাতা মিশ্রিত হালকা গরম জল পান করুন।',
    },
    ta: {
      guidance: 'பித்த மற்றும் வாத சமநிலையை பேண சீரான தூக்கம், நீர் அருந்துதல் மற்றும் யோகாசனங்களை மேற்கொள்ளவும்.',
      favorableTransits: 'செவ்வாய்-குரு திரிகோண பெயர்ச்சியால் உடல் ஆரோக்கியம் மேம்படும்',
      remedialAction: 'தினமும் காலையில் துளசி கலந்த வெந்நீர் அருந்தவும்.',
    },
    fr: {
      guidance: "Veillez à des cycles de sommeil réguliers, une bonne hydratation et des asanas matinaux doux pour équilibrer les énergies Pitta et Vata.",
      favorableTransits: "Trigone Mars-Jupiter renforçant l'énergie vitale",
      remedialAction: "Boire de l'eau tiède infusée aux feuilles de tulsi chaque matin.",
    },
  },
  'ms-0-5': {
    hi: {
      guidance: 'प्रतिदिन प्रातः 15 मिनट मौन ध्यान एवं जप मानसिक तनाव को शांत कर आंतरिक स्थिरता प्रदान करता है।',
      favorableTransits: 'नवम भाव में शुभ गोचर की सक्रियता',
      remedialAction: 'प्रातः काल १०८ बार ॐ नमः शिवाय का जप करें।',
    },
    bn: {
      guidance: 'প্রতিদিন সকালে ১৫ মিনিট মৌন ধ্যান ও জপ মানসিক চাপ কমিয়ে অন্তরে শান্তি ও স্থায়িত্ব প্রদান করে।',
      favorableTransits: 'নবম ভাবে শুভ গ্রহের গোচর সক্রিয়তা',
      remedialAction: 'ভোরবেলায় ১০৮ বার ওঁ নমঃ শিবায় জপ করুন।',
    },
    ta: {
      guidance: 'தினமும் 15 நிமிடங்கள் மௌன தியானம் மற்றும் மந்திர ஜபம் செய்வது மன அமைதியை தரும்.',
      favorableTransits: '9-ஆம் வீட்டின் சுபப் பெயர்ச்சி ஆசீர்வாதம்',
      remedialAction: 'அதிகாலையில் 108 முறை ஓம் நம சிவாய ஜபிக்கவும்.',
    },
    fr: {
      guidance: "Consacrer 15 minutes chaque matin à la méditation silencieuse et au japa protège l'esprit du stress quotidien.",
      favorableTransits: "Activation du transit bénéfique en 9e maison",
      remedialAction: "Chanter Om Namah Shivaya 108 fois à l'aube.",
    },
  },
  'ms-0-6': {
    hi: {
      guidance: 'परिवार के सदस्यों और बड़ों में परस्पर स्नेह और सम्मान बढ़ेगा। मांगलिक पारिवारिक आयोजनों हेतु अनुकूल समय है।',
      favorableTransits: 'चतुर्थ भाव पर चंद्र-गुरु का शुभ प्रभाव',
      remedialAction: 'गुरुवार को तुलसी के पौधे के समीप सरसों के तेल का दीपक प्रज्वलित करें।',
    },
    bn: {
      guidance: 'পরিবারের প্রবীণ সদস্য এবং আত্মীয়দের মধ্যে পারস্পরিক সম্মান ও সম্প্রীতি বজায় থাকবে। শুভ পারিবারিক অনুষ্ঠানের জন্য অনুকূল সময়।',
      favorableTransits: 'চতুর্থ ভাবে চন্দ্র-বৃহস্পতির শুভ রশ্মিপাত',
      remedialAction: 'বৃহস্পতিবার তুলসী মঞ্চের কাছে সর্ষের তেলের প্রদীপ প্রজ্বলন করুন।',
    },
    ta: {
      guidance: 'குடும்பத்தில் மூத்தவர்களின் அன்பும் மரியாதையும் அதிகரிக்கும். மங்கல நிகழ்வுகளுக்கு உகந்த காலம்.',
      favorableTransits: '4-ஆம் வீட்டில் சந்திரன்-குருவின் சுப ஒளி சேர்க்கை',
      remedialAction: 'வியாழக்கிழமைகளில் துளசி செடிக்கு நல்லெண்ணெய் அல்லது நெய் தீபம் ஏற்றவும்.',
    },
    fr: {
      guidance: "Respect mutuel et chaleur parmi les aînés et proches. Période favorable aux célébrations et réunions de famille.",
      favorableTransits: "Illumination bénéfique de la 4e maison par la Lune et Jupiter",
      remedialAction: "Allumer une lampe à l'huile de moutarde près de la plante de Tulsi le jeudi.",
    },
  },
  'ms-0-7': {
    hi: {
      guidance: 'बुध का शुभ प्रभाव स्मरण शक्ति, एकाग्रता और आगामी परीक्षाओं में सफलता को गति प्रदान करता है।',
      favorableTransits: 'बुद्धि के पंचम भाव में बुध की प्रबल स्थिति',
      remedialAction: 'प्रत्येक बुधवार मां सरस्वती को श्वेत पुष्प अर्पित करें।',
    },
    bn: {
      guidance: 'বুধের শুভ প্রভাব বিদ্যালাভ, স্মৃতিশক্তি বৃদ্ধি এবং আসন্ন পরীক্ষা বা সার্টিফিকেশনে সাফল্যে সহায়তা করবে।',
      favorableTransits: 'বিদ্যার পঞ্চম স্থানে বুধের শক্তিশালী অবস্থান',
      remedialAction: 'বুধবার দেবী সরস্বতীকে সাদা ফুল নিবেদন করুন।',
    },
    ta: {
      guidance: 'புதனின் சுப ஆற்றல் ஞாபக சக்தி, கற்றல் திறன் மற்றும் தேர்வுகளில் வெற்றியைத் தரும்.',
      favorableTransits: 'புத்தி ஸ்தானமான 5-ஆம் வீட்டில் புதனின் பலம்',
      remedialAction: 'புதன்கிழமைகளில் சரஸ்வதி தேவிக்கு வெண் மலர்கள் சாற்றி வழிபடவும்.',
    },
    fr: {
      guidance: "L'énergie favorable de Mercure améliore la mémorisation, la concentration et la réussite aux examens et certifications.",
      favorableTransits: "Mercure puissant dans la 5e maison de l'intellect",
      remedialAction: "Offrir des fleurs blanches à la déesse Saraswati le mercredi.",
    },
  },
  'ms-0-8': {
    hi: {
      guidance: 'व्यापारिक विस्तार हेतु लाभकारी क्षेत्रीय यात्राएं अथवा समीपवर्ती तीर्थ स्थलों के दर्शन का योग।',
      favorableTransits: 'तृतीयेश का शुभ गोचर छोटी और लाभकारी यात्राओं के अनुकूल',
      remedialAction: 'किसी भी यात्रा पर प्रस्थान से पूर्व एक साबुत हरी इलायची अपने पास रखें।',
    },
    bn: {
      guidance: 'ব্যবসায়িক যোগাযোগ ও নেটওয়ার্কিংয়ের জন্য ফলপ্রসূ আঞ্চলিক ভ্রমণ অথবা নিকটবর্তী তীর্থভ্রমণের শুভ যোগ।',
      favorableTransits: 'তৃতীয়পতির শুভ গোচর যা সংক্ষিপ্ত ভ্রমণের অনুকূল',
      remedialAction: 'ভ্রমণ শুরুর আগে একটি গোটা এলাচ মুখে বা সাথে রাখুন।',
    },
    ta: {
      guidance: 'தொழில் ரீதியான குறுகிய பயணங்கள் மற்றும் அருகில் உள்ள புண்ணிய ஸ்தலங்களுக்கு செல்வது பயனுள்ளதாக அமையும்.',
      favorableTransits: '3-ஆம் அதிபதியின் சுபப் பெயர்ச்சி குறுகிய பயணங்களுக்கு சாதகமானது',
      remedialAction: 'பயணம் தொடங்கும் முன் ஒரு ஏலக்காயை உடன் வைத்திருக்கவும்.',
    },
    fr: {
      guidance: "Déplacements régionaux constructifs pour le réseau professionnel ou pèlerinages vers des lieux sacrés proches.",
      favorableTransits: "Transit favorable du maître de la 3e maison propice aux courts voyages",
      remedialAction: "Emporter une cardamome entière avant d'entamer vos trajets.",
    },
  },

  // --- 0-5 YEARS ---
  'ms-1': {
    hi: {
      guidance: 'दशम भाव पर गुरु का गोचर नेतृत्व और उच्च पद प्रतिष्ठा को गति प्रदान करेगा। अप्रैल से सितंबर के मध्य नई पहलों को अंतिम रूप दें।',
      favorableTransits: 'लग्न से त्रिकोण भाव में गुरु का शुभ गोचर',
      remedialAction: 'गुरुवार को बृहस्पति बीज मंत्र का जप करें और पीली दाल दान करें।',
    },
    bn: {
      guidance: 'দশম স্থানে বৃহস্পতির গোচর প্রশাসনিক কর্তৃত্ব ও নেতৃত্বের সুযোগ আনবে। এপ্রিল থেকে সেপ্টেম্বরের মধ্যে গুরুত্বপূর্ণ চুক্তি সম্পন্ন করুন।',
      favorableTransits: 'লগ্নের ত্রিকোণে বৃহস্পতির শুভ গোচর',
      remedialAction: 'বৃহস্পতিবার বৃহস্পতি বীজ মন্ত্র জপ করুন এবং হলুদ ডাল দান করুন।',
    },
    ta: {
      guidance: '10-ஆம் வீட்டில் குரு பெயர்ச்சி தலைமை பொறுப்புகள் மற்றும் புதிய அங்கீகாரத்தை தரும். ஏப்ரல் முதல் செப்டம்பர் வரை புதிய முயற்சிகளை தொடங்கவும்.',
      favorableTransits: 'லக்னத்திற்கு திரிகோணத்தில் குரு பெயர்ச்சி',
      remedialAction: 'வியாழக்கிழமைகளில் குரு காயத்ரி ஜபித்து கொண்டைக்கடலை தானம் செய்யவும்.',
    },
    fr: {
      guidance: "Le transit de Jupiter sur votre 10e maison stimule l'autorité exécutive. Finalisez les négociations majeures entre avril et septembre.",
      favorableTransits: "Transit de Jupiter en trigone à l'Ascendant",
      remedialAction: "Réciter le mantra de Brihaspati le jeudi ; faire don de lentilles jaunes.",
    },
  },
  'ms-2': {
    hi: {
      guidance: 'द्वितीय एवं एकादश भाव पर शुभ दृष्टि धन संचय और संपत्ति विस्तार के संकेत देती है। राहुकाल के समय सट्टेबाजी से दूर रहें।',
      favorableTransits: 'एकादश भाव में शुक्र की उच्च स्थिति',
      remedialAction: 'प्रतिदिन सूर्य को जल अर्पित करें और तिजोरी में पीला रेशमी कपड़ा रखें।',
    },
    bn: {
      guidance: 'দ্বিতীয় ও একাদশ ভাবে শুভ দৃষ্টি তরল সম্পদ বৃদ্ধি ও স্থাবর সম্পত্তি অর্জনের নির্দেশ করে। ঝুঁকিপূর্ণ বিনিয়োগ এড়িয়ে চলুন।',
      favorableTransits: 'একাদশ ভাবে শুক্রের শুভ প্রভাব',
      remedialAction: 'প্রতিদিন সূর্যকে জল দিন এবং সিন্দুকে হলুদ রেশমি কাপড় রাখুন।',
    },
    ta: {
      guidance: '2 மற்றும் 11-ஆம் வீடுகளின் மீதான சுபப் பார்வை நிலையான சொத்து உருவாக்கத்திற்கு வழிவகுக்கும்.',
      favorableTransits: '11-ஆம் வீட்டில் சுக்கிரனின் உச்ச பலம்',
      remedialAction: 'சூரியனுக்கு நீர் சமர்ப்பித்து வரவு-செலவு பெட்டியில் மஞ்சள் துணி வைக்கவும்.',
    },
    fr: {
      guidance: "L'aspect favorable sur les 2e et 11e maisons indique une forte croissance de liquidités. Évitez les spéculations à court terme.",
      favorableTransits: "Vénus exaltée en 11e maison",
      remedialAction: "Offrir de l'eau au Soleil et conserver un tissu de soie jaune dans votre coffre.",
    },
  },
  'ms-3': {
    hi: {
      guidance: 'पंचम एवं सप्तम भाव पर शुभ प्रभाव आपसी समझ और प्रेम संबंधों को प्रगाढ़ बनाएगा। अविवाहित जातकों के लिए विवाह के सुंदर योग बनेंगे।',
      favorableTransits: 'सप्तम भाव में गुरु-शुक्र का शुभ संरेखण',
      remedialAction: 'शुक्रवार को सफेद मिठाई का दान करें अथवा मां लक्ष्मी की आराधना करें।',
    },
    bn: {
      guidance: 'পঞ্চম ও সপ্তম ভাবে শুভ প্রভাব পারস্পরিক বোঝাপড়া ও বৈবাহিক আনন্দ বৃদ্ধি করবে। অবিবাহিতদের জন্য শুভ বিবাহের প্রস্তাব আসবে।',
      favorableTransits: 'সপ্তম স্থানে বৃহস্পতি-শুক্রের শুভ মিলন',
      remedialAction: 'শুক্রবার সাদা মিষ্টি দান করুন এবং শ্রী লক্ষ্মীর আরাধনা করুন।',
    },
    ta: {
      guidance: '5 மற்றும் 7-ஆம் வீடுகளின் நற்பார்வை குடும்பத்தில் நல்லிணக்கத்தையும் திருமண யோகத்தையும் ஏற்படுத்தும்.',
      favorableTransits: '7-ஆம் வீட்டில் குரு-சுக்கிர சேர்க்கை',
      remedialAction: 'வெள்ளிக்கிழமைகளில் வெள்ளை இனிப்புகள் வழங்கி லட்சுமி பூஜை செய்யவும்.',
    },
    fr: {
      guidance: "Les aspects bénéfiques sur les 5e et 7e maisons renforcent la complicité amoureuse et favorisent les unions matrimoniales heureuses.",
      favorableTransits: "Alignement bénéfique Jupiter-Vénus en 7e maison",
      remedialAction: "Offrir des douceurs blanches le vendredi ou prier la déesse Lakshmi.",
    },
  },
  'ms-4': {
    hi: {
      guidance: 'आयुर्वेदिक दिनचर्या का पालन करें। नियमित योग और प्राणायाम से वात-पित्त की समस्या दूर होगी तथा मानसिक शांति मिलेगी।',
      favorableTransits: 'छठे भाव पर शुभ ग्रहों का गोचर जो रोग मुक्ति देता है',
      remedialAction: 'तांबे के पात्र में रखा जल सुबह पिएं और महामृत्युंजय मंत्र सुनें।',
    },
    bn: {
      guidance: 'আয়ুর্বেদিক দিনচর্যা অনুসরণ করুন। নিয়মিত যোগব্যায়াম শারীরিক বল ও মানসিক শান্তি বৃদ্ধি করবে।',
      favorableTransits: 'ষষ্ঠ ভাবে শুভ গ্রহের অবস্থান যা রোগ নিরাময়ে সহায়ক',
      remedialAction: 'তামার পাত্রে রাখা জল সকালে পান করুন এবং মহামৃত্যুঞ্জয় মন্ত্র জপ করুন।',
    },
    ta: {
      guidance: 'ஆயுர்வேத வழிகாட்டுதல்களைப் பின்பற்றி தினசரி உடற்பயிற்சி மற்றும் பிராணாயாமம் மேற்கொள்வது உடல் நலனைப் பாதுகாக்கும்.',
      favorableTransits: '6-ஆம் வீட்டில் சுபக் கிரகங்களின் நோய் தீர்க்கும் பார்வை',
      remedialAction: 'செப்பு பாத்திரத்தில் வைத்த நீரை அருந்தி மகா மிருத்யுஞ்சய மந்திரம் கேட்கவும்.',
    },
    fr: {
      guidance: "Alignez votre quotidien sur les principes ayurvédiques. Le yoga régulier préserve l'équilibre vital et apaise l'esprit.",
      favorableTransits: "Transits favorables apaisant la 6e maison de la santé",
      remedialAction: "Boire de l'eau conservée dans du cuivre et méditer sur le Maha Mrityunjaya.",
    },
  },
  'ms-5': {
    hi: {
      guidance: 'नियमित ध्यान और गायत्री जप से आंतरिक चेतना का विकास होगा। पवित्र तीर्थ यात्राओं और आध्यात्मिक गुरु का सानिध्य प्राप्त होगा।',
      favorableTransits: 'नवम भाव में केतु-गुरु की आध्यात्मिक युति',
      remedialAction: 'गुरुवार को पीले वस्त्र धारण करें और गुरु पादुका स्तोत्र का पाठ करें।',
    },
    bn: {
      guidance: 'নিয়মিত ধ্যান ও গায়ত্রী জপ গভীর আত্মোপলব্ধি জাগ্রত করবে। পবিত্র তীর্থদর্শন ও সদগুরুর কৃপালাভের শুভ যোগ।',
      favorableTransits: 'নবম ভাবে কেতু-বৃহস্পতির আধ্যাত্মিক সংস্থান',
      remedialAction: 'বৃহস্পতিবার হলুদ পোশাক পরিধান করুন এবং গুরু বন্দনা করুন।',
    },
    ta: {
      guidance: 'தினசரி தியானம் மற்றும் காயத்ரி ஜபம் ஆழ்ந்த ஞானத்தை விழிப்படையச் செய்யும். ஆன்மீக குருவின் வழிகாட்டல் கிடைக்கும்.',
      favorableTransits: '9-ஆம் வீட்டில் கேது-குருவின் ஆன்மீக இணைவு',
      remedialAction: 'வியாழக்கிழமைகளில் மஞ்சள் வஸ்திரம் அணிந்து குரு ஸ்தோத்திரம் படிக்கவும்.',
    },
    fr: {
      guidance: "Une pratique régulière de la méditation et du Gayatri Japa éveille une profonde sérénité spirituelle et des bénédictions sacrées.",
      favorableTransits: "Conjonction spirituelle Ketu-Jupiter en 9e maison",
      remedialAction: "Porter des vêtements jaunes le jeudi et réciter le Guru Paduka Stotram.",
    },
  },
  'ms-fam-1': {
    hi: {
      guidance: 'द्वितीय एवं चतुर्थ भाव पर शुभ प्रभाव पारिवारिक सुख, संतान की प्रगति और गृह शांति को सुदृढ़ करेगा।',
      favorableTransits: 'चतुर्थ भाव में शुभ ग्रहों की दृष्टि',
      remedialAction: 'रविवार को परिवार सहित सूर्य देव की पूजा करें।',
    },
    bn: {
      guidance: 'দ্বিতীয় ও চতুর্থ ভাবে শুভ প্রভাব পারিবারিক সুখ, সন্তানের সমৃদ্ধি ও গৃহশান্তি বৃদ্ধি করবে।',
      favorableTransits: 'চতুর্থ ভাবে শুভ গ্রহের সৌম্য দৃষ্টি',
      remedialAction: 'রবিবার পরিবারের সকলে মিলে আদিত্য হৃদয় স্তোত্র শুনুন।',
    },
    ta: {
      guidance: '2 மற்றும் 4-ஆம் வீடுகளின் நற்பார்வை குடும்ப மகிழ்ச்சி மற்றும் குழந்தைகளின் முன்னேற்றத்தை தரும்.',
      favorableTransits: '4-ஆம் வீட்டில் சுபக் கிரகங்களின் பாதுகாப்பு பார்வை',
      remedialAction: 'ஞாயிற்றுக்கிழமைகளில் குடும்பத்தோடு சூரிய வழிபாடு செய்யவும்.',
    },
    fr: {
      guidance: "Les influences bienveillantes sur les 2e et 4e maisons apportent une grande harmonie familiale et la réussite des enfants.",
      favorableTransits: "Aspects bienfaiteurs sur la 4e maison du foyer",
      remedialAction: "Faire une prière familiale le dimanche et honorer les aînés.",
    },
  },
  'ms-edu-1': {
    hi: {
      guidance: 'बुध और गुरु के गोचर से उच्च शिक्षा, शोध कार्यों और व्यावसायिक प्रमाणन में उत्कृष्ट सफलता प्राप्त होगी।',
      favorableTransits: 'पंचम भाव में बुध-गुरु का प्रबल प्रभाव',
      remedialAction: 'सरस्वती चालीसा का पाठ करें और विद्यार्थियों को पुस्तकें भेंट करें।',
    },
    bn: {
      guidance: 'বুধ ও বৃহস্পতির গোচর উচ্চশিক্ষা, গবেষণা এবং পেশাদারী পরীক্ষায় অভাবনীয় সাফল্য আনবে।',
      favorableTransits: 'পঞ্চম স্থানে বুধ-বৃহস্পতির শুভ প্রভাব',
      remedialAction: 'সরস্বতী স্তোত্র পাঠ করুন এবং শিক্ষার্থীদের খাতা-কলম উপহার দিন।',
    },
    ta: {
      guidance: 'புதன் மற்றும் குருவின் சேர்க்கை உயர்கல்வி மற்றும் தொழில்முறை தேர்வுகளில் சிறந்த வெற்றியைத் தரும்.',
      favorableTransits: '5-ஆம் வீட்டில் புதன்-குருவின் ஆற்றல்',
      remedialAction: 'சரஸ்வதி அஷ்டோத்திரம் படித்து மாணவர்களுக்கு நோட்டுப் புத்தகம் தானம் செய்யவும்.',
    },
    fr: {
      guidance: "Les transits de Mercure et Jupiter bénissent les études supérieures, la recherche et les concours professionnels.",
      favorableTransits: "Mercure et Jupiter puissants en 5e maison",
      remedialAction: "Réciter le Saraswati Stotra et offrir des fournitures d'écriture aux étudiants.",
    },
  },
  'ms-trv-1': {
    hi: {
      guidance: 'कार्यक्षेत्र के विस्तार और नए अवसरों हेतु छोटी एवं मध्यम दूरी की विदेश यात्राएं अत्यंत फलदायी सिद्ध होंगी।',
      favorableTransits: 'तृतीय एवं नवम भाव का लाभकारी गोचर',
      remedialAction: 'यात्रा से पूर्व हनुमान चालीसा का पाठ करें।',
    },
    bn: {
      guidance: 'পেশাগত সম্প্রসারণ ও নতুন যোগাযোগের জন্য দেশ-বিদেশের মাঝারি দূরত্বের যাত্রা অত্যন্ত লাভজনক হবে।',
      favorableTransits: 'তৃতীয় ও নবম ভাবের সক্রিয় গোচর সংযোগ',
      remedialAction: 'যাত্রার পূর্বে হনুমান চালিশা পাঠ করুন।',
    },
    ta: {
      guidance: 'தொழில் விரிவாக்கத்திற்காக மேற்கொள்ளும் குறுகிய மற்றும் தொலைதூரப் பயணங்கள் பெரும் வெற்றியைத் தரும்.',
      favorableTransits: '3 மற்றும் 9-ஆம் வீடுகளின் பயண அனுகூலம்',
      remedialAction: 'பயணத்தின் போது ஆஞ்சநேயர் வழிபாடு செய்து புறப்படவும்.',
    },
    fr: {
      guidance: "De remarquables opportunités de déplacements professionnels et régionaux ouvrent de nouveaux horizons fertiles.",
      favorableTransits: "Transits favorables activant les 3e et 9e maisons",
      remedialAction: "Méditer avant chaque voyage et réciter l'Hanuman Chalisa.",
    },
  },
};

export function getLocalizedMilestoneGuidance(item: any, lang?: string): string {
  if (!item) return '';
  const l = (lang || 'en').split('-')[0].toLowerCase();
  
  // If already in target Indic script, return original
  if (l === 'hi' && /[\u0900-\u097F]/.test(item.guidance || '')) return item.guidance;
  if (l === 'bn' && /[\u0980-\u09FF]/.test(item.guidance || '')) return item.guidance;
  if (l === 'ta' && /[\u0B80-\u0BFF]/.test(item.guidance || '')) return item.guidance;
  if (l === 'en') return item.guidance || '';

  const id = item.id || '';
  const dictEntry = ROADMAP_MILESTONE_TRANSLATIONS[id];
  if (dictEntry && dictEntry[l] && dictEntry[l].guidance) {
    return dictEntry[l].guidance;
  }
  
  return item.guidance || '';
}

export function getLocalizedMilestoneTransits(item: any, lang?: string): string {
  if (!item) return '';
  const l = (lang || 'en').split('-')[0].toLowerCase();
  
  if (l === 'hi' && /[\u0900-\u097F]/.test(item.favorableTransits || '')) return item.favorableTransits;
  if (l === 'bn' && /[\u0980-\u09FF]/.test(item.favorableTransits || '')) return item.favorableTransits;
  if (l === 'ta' && /[\u0B80-\u0BFF]/.test(item.favorableTransits || '')) return item.favorableTransits;
  if (l === 'en') return item.favorableTransits || '';

  const id = item.id || '';
  const dictEntry = ROADMAP_MILESTONE_TRANSLATIONS[id];
  if (dictEntry && dictEntry[l] && dictEntry[l].favorableTransits) {
    return dictEntry[l].favorableTransits;
  }
  
  return item.favorableTransits || '';
}

export function getLocalizedMilestoneRemedy(item: any, lang?: string): string {
  if (!item) return '';
  const l = (lang || 'en').split('-')[0].toLowerCase();
  
  if (l === 'hi' && /[\u0900-\u097F]/.test(item.remedialAction || '')) return item.remedialAction;
  if (l === 'bn' && /[\u0980-\u09FF]/.test(item.remedialAction || '')) return item.remedialAction;
  if (l === 'ta' && /[\u0B80-\u0BFF]/.test(item.remedialAction || '')) return item.remedialAction;
  if (l === 'en') return item.remedialAction || '';

  const id = item.id || '';
  const dictEntry = ROADMAP_MILESTONE_TRANSLATIONS[id];
  if (dictEntry && dictEntry[l] && dictEntry[l].remedialAction) {
    return dictEntry[l].remedialAction;
  }
  
  return item.remedialAction || '';
}


export function getGemstoneKey(rawGem?: string, planetId?: string): string {
  const g = (rawGem || '').toLowerCase().trim();
  const p = (planetId || '').toLowerCase().trim();

  if (g.includes('sun') || p === 'sun' || g.includes('ruby') || g.includes('manikya')) return 'ruby';
  if (g.includes('moon') || p === 'moon' || g.includes('pearl') || g.includes('moti')) return 'pearl';
  if (g.includes('mars') || p === 'mars' || g.includes('coral') || g.includes('moonga')) return 'red_coral';
  if (g.includes('mercury') || p === 'mercury' || g.includes('emerald') || g.includes('panna')) return 'emerald';
  if (g.includes('jupiter') || p === 'jupiter' || g.includes('yellow') || g.includes('pukhraj') || (g.includes('sapphire') && !g.includes('blue'))) return 'yellow_sapphire';
  if (g.includes('venus') || p === 'venus' || g.includes('diamond') || g.includes('heera') || g.includes('opal')) return 'diamond';
  if (g.includes('saturn') || p === 'saturn' || g.includes('blue') || g.includes('neelam')) return 'blue_sapphire';
  if (g.includes('rahu') || p === 'rahu' || g.includes('hessonite') || g.includes('gomed')) return 'hessonite';
  if (g.includes('ketu') || p === 'ketu' || g.includes('cat') || g.includes('lehsuniya') || g.includes('vaidurya')) return 'cats_eye';

  return 'ruby';
}
