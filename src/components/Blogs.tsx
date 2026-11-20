import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import JoditEditor from 'jodit-react';
import { 
  Plus, 
  List, 
  FileText, 
  Folder, 
  FolderOpen, 
  Tag, 
  ChevronDown, 
  Image as ImageIcon, 
  Search, 
  Edit, 
  Trash2, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  LayoutGrid,
  ArrowLeft,
  ArrowRight,
  Calendar,
  X,
  Share2,
  Check,
  Compass,
  ChevronRight,
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import { blogApi, BlogPost, Category, Subcategory, getBlogImageUrl } from '../services/blogApi';
import { SEO } from './SEO';

// Re-export type
export type { BlogPost };

// ============================================================================
// 1. CAROUSEL COMPONENT (For Landing Page)
// ============================================================================

export interface BlogCarouselProps {
  theme: 'light' | 'dark';
  onSelectBlog?: (blog: BlogPost) => void;
  onViewAll?: () => void;
}

export const CATEGORY_TRANSLATIONS: Record<string, Record<string, string>> = {
  hi: {
    'VEDIC ASTROLOGY': 'वैदिक ज्योतिष',
    'Vedic Astrology': 'वैदिक ज्योतिष',
    'ASTROLOGY': 'ज्योतिष',
    'Astrology': 'ज्योतिष',
    'NUMEROLOGY': 'अंकशास्त्र',
    'Numerology': 'अंकशास्त्र',
    'MATCHMAKING': 'कुंडली मिलान',
    'Matchmaking': 'कुंडली मिलान',
    'KUNDLI': 'कुंडली',
    'Kundli': 'कुंडली',
    'RAJ YOGA': 'राज योग',
    'Raj Yoga': 'राज योग',
    'Planetary Yogas': 'ग्रह योग',
    'Saturn Return': 'शनि साढ़े साती',
    'All': 'सभी',
  },
  bn: {
    'VEDIC ASTROLOGY': 'বৈদিক জ্যোতিষ',
    'Vedic Astrology': 'বৈদিক জ্যোতিষ',
    'ASTROLOGY': 'জ্যোতিষ',
    'Astrology': 'জ্যোতিষ',
    'NUMEROLOGY': 'সংখ্যাতত্ত্ব',
    'Numerology': 'সংখ্যাতত্ত্ব',
    'MATCHMAKING': 'কুণ্ডলী মিলন',
    'Matchmaking': 'কুণ্ডলী মিলন',
    'KUNDLI': 'কুণ্ডলী',
    'Kundli': 'কুণ্ডলী',
    'RAJ YOGA': 'রাজ যোগ',
    'Raj Yoga': 'রাজ যোগ',
    'Planetary Yogas': 'গ্রহ যোগ',
    'Saturn Return': 'শনির সাড়ে সাতি',
    'All': 'সকল',
  },
  ta: {
    'VEDIC ASTROLOGY': 'வேத ஜோதிடம்',
    'Vedic Astrology': 'வேத ஜோதிடம்',
    'ASTROLOGY': 'ஜோதிடம்',
    'Astrology': 'ஜோதிடம்',
    'NUMEROLOGY': 'எண்கணிதம்',
    'Numerology': 'எண்கணிதம்',
    'MATCHMAKING': 'திருமண பொருத்தம்',
    'Matchmaking': 'திருமண பொருத்தம்',
    'KUNDLI': 'ஜாதகம்',
    'Kundli': 'ஜாதகம்',
    'RAJ YOGA': 'ராஜ யோகம்',
    'Raj Yoga': 'ராஜ யோகம்',
    'Planetary Yogas': 'கிரக யோகங்கள்',
    'Saturn Return': 'ஏழரை சனி',
    'All': 'அனைத்து',
  },
  fr: {
    'VEDIC ASTROLOGY': 'Astrologie Védique',
    'Vedic Astrology': 'Astrologie Védique',
    'ASTROLOGY': 'Astrologie',
    'Astrology': 'Astrologie',
    'NUMEROLOGY': 'Numérologie',
    'Numerology': 'Numérologie',
    'MATCHMAKING': 'Compatibilité Amoureuse',
    'Matchmaking': 'Compatibilité Amoureuse',
    'KUNDLI': 'Thème Astral',
    'Kundli': 'Thème Astral',
    'RAJ YOGA': 'Raj Yoga',
    'Raj Yoga': 'Raj Yoga',
    'Planetary Yogas': 'Yogas Planétaires',
    'Saturn Return': 'Retour de Saturne',
    'All': 'Tous',
  },
};

export function getLocalizedCategory(cat?: string, lang: string = 'en'): string {
  if (!cat) return '';
  const normLang = (lang || 'en').split('-')[0].toLowerCase();
  const dict = CATEGORY_TRANSLATIONS[normLang];
  if (!dict) return cat;
  if (dict[cat]) return dict[cat];
  const lower = cat.toLowerCase();
  for (const [k, v] of Object.entries(dict)) {
    if (k.toLowerCase() === lower) return v;
  }
  return cat;
}

export function getDateLocale(lang: string = 'en'): string {
  const norm = (lang || 'en').split('-')[0].toLowerCase();
  switch (norm) {
    case 'hi': return 'hi-IN';
    case 'bn': return 'bn-BD';
    case 'ta': return 'ta-IN';
    case 'fr': return 'fr-FR';
    default: return 'en-US';
  }
}

export function stripHtmlTags(str?: string): string {
  if (!str) return '';
  return str
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–')
    .replace(/\s+/g, ' ')
    .trim();
}

const DEFAULT_INITIAL_BLOGS: BlogPost[] = [
  {
    id: 1,
    title: 'The Power of Raj Yogas: How Kendra and Trikona Conjunctions Unlock High Status',
    slug: 'the-power-of-raj-yogas-how-kendra-and-trikona-conjunctions-unlock-high-status',
    category: 'Astrology',
    sub_category: 'Raj Yoga',
    author: 'AstroJunction Masters',
    date: '2026-03-20',
    read_time: '5 min read',
    views: 1250,
    status: 'Published',
    tags: ['Raj Yoga', 'Kundli', 'Wealth', 'Jyotish'],
    image_url: '/blog_3.jpg',
    pinned: 1,
    preview: 'What is a Raj Yoga in Vedic Astrology? In classical Jyotish Shastra, a Raj Yoga is a celestial combination of supreme auspiciousness that bestows high status, wealth, and spiritual growth.',
    content: ''
  },
  {
    id: 2,
    title: 'Navigating Saturn Return (Shani Sade Sati): Ancient Vedic Wisdom for Karma & Transformation',
    slug: 'navigating-saturn-return-shani-sade-sati-ancient-vedic-wisdom-for-karma-and-transformation',
    category: 'Astrology',
    sub_category: 'Saturn Return',
    author: 'AstroJunction Masters',
    date: '2026-03-15',
    read_time: '6 min read',
    views: 1420,
    status: 'Published',
    tags: ['Saturn Return', 'Sade Sati', 'Shani', 'Remedies'],
    image_url: '/blog_2.jpg',
    pinned: 1,
    preview: 'Understanding the Divine Power of Saturn in Vedic Astrology: In Vedic Astrology (Jyotish Shastra), Saturn (Shani Dev) is revered not as a malefic punisher, but as the cosmic taskmaster and dispenser of justice.',
    content: ''
  },
  {
    id: 3,
    title: 'The Power of Raj Yogas: Unlocking Wealth and Prosperity in Vedic Astrology',
    slug: 'the-power-of-raj-yogas-unlocking-wealth-and-prosperity-in-vedic-astrology',
    category: 'Vedic Astrology',
    sub_category: 'Planetary Yogas',
    author: 'AstroJunction Masters',
    date: '2026-03-10',
    read_time: '5 min read',
    views: 1890,
    status: 'Published',
    tags: ['Raj Yoga', 'Wealth', 'Vedic Astrology', 'Kundli'],
    image_url: '/blog_1.jpg',
    pinned: 1,
    preview: 'Understanding Raj Yogas in Your Birth Chart: In classical Vedic Astrology, a Raj Yoga represents a celestial alignment of supreme auspiciousness that brings financial prosperity and leadership.',
    content: ''
  },
  {
    id: 4,
    title: 'Vedic Numerology & Life Path Numbers: Decoding Soul Contracts Through Sacred Vibration',
    slug: 'vedic-numerology-and-life-path-numbers-decoding-soul-contracts-through-sacred-vibration',
    category: 'Numerology',
    sub_category: 'Anka Vidya',
    author: 'AstroJunction Masters',
    date: '2026-03-05',
    read_time: '4 min read',
    views: 1100,
    status: 'Published',
    tags: ['Numerology', 'Soul Contracts', 'Life Path', 'Anka Vidya'],
    image_url: '/blog_4.jpg',
    pinned: 0,
    preview: 'The Sacred Vibration of Numbers in Vedic Numerology: According to ancient Vedic Anka Vidya, numbers are living frequencies reflecting planetary rulerships and personal destiny blueprints.',
    content: ''
  },
  {
    id: 5,
    title: 'Vedic Kundli Milan & 36 Guna Ashta Koota Compatibility Guide',
    slug: 'vedic-kundli-milan-and-36-guna-ashta-koota-compatibility-guide',
    category: 'Matchmaking',
    sub_category: 'Ashta Koota',
    author: 'AstroJunction Masters',
    date: '2026-03-01',
    read_time: '7 min read',
    views: 2300,
    status: 'Published',
    tags: ['Matchmaking', 'Kundli Milan', 'Ashta Koota', 'Guna Milan'],
    image_url: '/zodiac_compatibility_art.jpg',
    pinned: 0,
    preview: 'Decoding 36 Gunas in Vedic Ashta Koota Matchmaking: Complete breakdown of Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, and Nadi for marriage compatibility and life-long harmony.',
    content: ''
  }
];

const LOCALIZED_INITIAL_BLOGS: Record<string, BlogPost[]> = {
  bn: [
    {
      id: 1,
      title: 'রাজ যোগের শক্তি: কেন্দ্র ও ত্রিকোণ সংযোগের মাধ্যমে উচ্চ মর্যাদার দ্বার উন্মোচন',
      slug: 'the-power-of-raj-yogas-how-kendra-and-trikona-conjunctions-unlock-high-status',
      category: 'জ্যোতিষ',
      sub_category: 'রাজ যোগ',
      author: 'অ্যাস্ট্রোজংশন মাস্টার্স',
      date: '2026-03-20',
      read_time: '৫ মিনিট পাঠ',
      views: 1250,
      status: 'Published',
      tags: ['রাজ যোগ', 'কুণ্ডলী', 'ধনসম্পদ', 'জ্যোতিষ'],
      image_url: '/blog_3.jpg',
      pinned: 1,
      preview: 'বৈদিক জ্যোতিষে রাজ যোগ কী? শাস্ত্রীয় জ্যোতিষশাস্ত্রে, রাজ যোগ হলো একটি অত্যন্ত শুভ মহাজাগতিক সংযোগ যা ব্যক্তির জীবনে উচ্চ পদমর্যাদা, সম্মান এবং আধ্যাত্মিক সমৃদ্ধি নিয়ে আসে।',
      content: ''
    },
    {
      id: 2,
      title: 'শনি সাড়ে সাতি ও শনি আবর্তন: কর্ম ও রূপান্তরের প্রাচীন বৈদিক প্রজ্ঞা',
      slug: 'navigating-saturn-return-shani-sade-sati-ancient-vedic-wisdom-for-karma-and-transformation',
      category: 'জ্যোতিষ',
      sub_category: 'শনির সাড়ে সাতি',
      author: 'অ্যাস্ট্রোজংশন মাস্টার্স',
      date: '2026-03-15',
      read_time: '৬ মিনিট পাঠ',
      views: 1420,
      status: 'Published',
      tags: ['শনির সাড়ে সাতি', 'শনি', 'উপায়', 'জ্যোতিষ'],
      image_url: '/blog_2.jpg',
      pinned: 1,
      preview: 'বৈদিক জ্যোতিষে শনি দেবতার ঐশ্বরিক শক্তি: জ্যোতিষ শাস্ত্রে শনি দেবকে কোনো ক্ষতিকারক শাস্তিপ্রদানকারী হিসেবে নয়, বরং কর্মের বিচারক ও আত্মিক শোধক হিসেবে সম্মান জানানো হয়।',
      content: ''
    },
    {
      id: 3,
      title: 'রাজ যোগের শক্তি: বৈদিক জ্যোতিষে সম্পদ ও সমৃদ্ধির দ্বার উন্মোচন',
      slug: 'the-power-of-raj-yogas-unlocking-wealth-and-prosperity-in-vedic-astrology',
      category: 'বৈদিক জ্যোতিষ',
      sub_category: 'গ্রহ যোগ',
      author: 'অ্যাস্ট্রোজংশন মাস্টার্স',
      date: '2026-03-10',
      read_time: '৫ মিনিট পাঠ',
      views: 1890,
      status: 'Published',
      tags: ['রাজ যোগ', 'বৈদিক জ্যোতিষ', 'কুণ্ডলী', 'সমৃদ্ধি'],
      image_url: '/blog_1.jpg',
      pinned: 1,
      preview: 'আপনার জন্মকুণ্ডলীতে রাজ যোগের তাৎপর্য: শাস্ত্রীয় বৈদিক জ্যোতিষে, রাজ যোগ একটি অত্যন্ত শুভ মহাজাগতিক সংযোগের প্রতীক যা আর্থিক সমৃদ্ধি ও নেতৃত্ব প্রতিষ্ঠা করে।',
      content: ''
    },
    {
      id: 4,
      title: 'বৈদিক সংখ্যাতত্ত্ব ও জীবনপথের সংখ্যা: আত্মার পবিত্র সংকেত উন্মোচন',
      slug: 'vedic-numerology-and-life-path-numbers-decoding-soul-contracts-through-sacred-vibration',
      category: 'সংখ্যাতত্ত্ব',
      sub_category: 'অঙ্ক বিদ্যা',
      author: 'অ্যাস্ট্রোজংশন মাস্টার্স',
      date: '2026-03-05',
      read_time: '৪ মিনিট পাঠ',
      views: 1100,
      status: 'Published',
      tags: ['সংখ্যাতত্ত্ব', 'অঙ্ক বিদ্যা', 'ভাগ্য সংখ্যা'],
      image_url: '/blog_4.jpg',
      pinned: 0,
      preview: 'সংখ্যার জীবন্ত স্পন্দন: বৈদিক অঙ্ক বিদ্যা অনুসারে সংখ্যা নিছক হিসাব নয়, বরং প্রতিটি সংখ্যা গ্রহের তেজ ও আত্মার ভাগ্যলিপির প্রতিনিধিত্ব করে।',
      content: ''
    },
    {
      id: 5,
      title: 'বৈদিক কুণ্ডলী মিলন ও ৩৬ গুণ অষ্টকূট সামঞ্জস্য নির্দেশিকা',
      slug: 'vedic-kundli-milan-and-36-guna-ashta-koota-compatibility-guide',
      category: 'কুণ্ডলী মিলন',
      sub_category: 'অষ্টকূট',
      author: 'অ্যাস্ট্রোজংশন মাস্টার্স',
      date: '2026-03-01',
      read_time: '৭ মিনিট পাঠ',
      views: 2300,
      status: 'Published',
      tags: ['কুণ্ডলী মিলন', 'গুণ মিলন', 'অষ্টকূট', 'বিবাহ সামঞ্জস্য'],
      image_url: '/zodiac_compatibility_art.jpg',
      pinned: 0,
      preview: '৩৬ গুণের পূর্ণ বৈদিক বিশ্লেষণ: বর্ণ, বশ্য, তারা, যোনি, গ্রহ মৈত্রী, গণ, ভাকুট ও নদী—দাম্পত্য জীবনের চিরন্তন সুখ ও সামঞ্জস্যের গোপন রহস্য।',
      content: ''
    }
  ],
  hi: [
    {
      id: 1,
      title: 'राज योग की शक्ति: केंद्र और त्रिकोण के संयोजन से उच्च पद और प्रतिष्ठा',
      slug: 'the-power-of-raj-yogas-how-kendra-and-trikona-conjunctions-unlock-high-status',
      category: 'ज्योतिष',
      sub_category: 'राज योग',
      author: 'एस्ट्रोजंक्शन मास्टर्स',
      date: '2026-03-20',
      read_time: '5 मिनट पठन',
      views: 1250,
      status: 'Published',
      tags: ['राज योग', 'कुंडली', 'धन', 'ज्योतिष'],
      image_url: '/blog_3.jpg',
      pinned: 1,
      preview: 'वैदिक ज्योतिष में राज योग क्या है? शास्त्रीय ज्योतिष शास्त्र में, राज योग एक अत्यंत शुभ संयोजन है जो व्यक्ति को समाज में उच्च सम्मान और समृद्धि प्रदान करता है।',
      content: ''
    },
    {
      id: 2,
      title: 'शनि साढ़े साती एवं शनि गोचर: कर्म और परिवर्तन का प्राचीन वैदिक ज्ञान',
      slug: 'navigating-saturn-return-shani-sade-sati-ancient-vedic-wisdom-for-karma-and-transformation',
      category: 'ज्योतिष',
      sub_category: 'शनि साढ़े साती',
      author: 'एस्ट्रोजंक्शन मास्टर्स',
      date: '2026-03-15',
      read_time: '6 मिनट पठन',
      views: 1420,
      status: 'Published',
      tags: ['शनि साढ़े साती', 'शनि', 'उपाय', 'ज्योतिष'],
      image_url: '/blog_2.jpg',
      pinned: 1,
      preview: 'वैदिक ज्योतिष में शनि देव का प्रभाव: शनि देव दंडनायक नहीं बल्कि निष्पक्ष न्यायधीश हैं जो जातक को अनुशासन और आत्मिक शक्ति प्रदान करते हैं।',
      content: ''
    },
    {
      id: 3,
      title: 'राज योग की शक्ति: वैदिक ज्योतिष में धन और समृद्धि का रहस्य',
      slug: 'the-power-of-raj-yogas-unlocking-wealth-and-prosperity-in-vedic-astrology',
      category: 'वैदिक ज्योतिष',
      sub_category: 'ग्रह योग',
      author: 'एस्ट्रोजंक्शन मास्टर्स',
      date: '2026-03-10',
      read_time: '5 मिनट पठन',
      views: 1890,
      status: 'Published',
      tags: ['राज योग', 'कुंडली', 'धन', 'ज्योतिष'],
      image_url: '/blog_1.jpg',
      pinned: 1,
      preview: 'अपनी जन्म कुंडली में राज योग को समझें: शास्त्रीय वैदिक ज्योतिष में, राज योग एक अत्यंत शुभ आकाशीय संरेखण का प्रतिनिधित्व करता है जो समृद्धि लाता है।',
      content: ''
    },
    {
      id: 4,
      title: 'वैदिक अंकशास्त्र और मूलांक: दिव्य स्पंदन और आत्मा की नियति',
      slug: 'vedic-numerology-and-life-path-numbers-decoding-soul-contracts-through-sacred-vibration',
      category: 'अंकशास्त्र',
      sub_category: 'अंक विद्या',
      author: 'एस्ट्रोजंक्शन मास्टर्स',
      date: '2026-03-05',
      read_time: '4 मिनट पठन',
      views: 1100,
      status: 'Published',
      tags: ['अंकशास्त्र', 'मूलांक', 'भाग्य अंक'],
      image_url: '/blog_4.jpg',
      pinned: 0,
      preview: 'संख्याओं का दिव्य प्रभाव: वैदिक अंक शास्त्र के अनुसार प्रत्येक संख्या किसी विशिष्ट ग्रह ऊर्जा का प्रतीक है जो हमारे जीवन पथ को निर्धारित करती है।',
      content: ''
    },
    {
      id: 5,
      title: 'वैदिक कुंडली मिलान और 36 गुण अष्टकूट मार्गदर्शिका',
      slug: 'vedic-kundli-milan-and-36-guna-ashta-koota-compatibility-guide',
      category: 'कुंडली मिलान',
      sub_category: 'अष्टकूट',
      author: 'एस्ट्रोजंक्शन मास्टर्स',
      date: '2026-03-01',
      read_time: '7 मिनट पठन',
      views: 2300,
      status: 'Published',
      tags: ['कुंडली मिलान', 'गुण मिलान', 'अष्टकूट', 'विवाह'],
      image_url: '/zodiac_compatibility_art.jpg',
      pinned: 0,
      preview: '36 गुणों का संपूर्ण वैदिक विश्लेषण: वर्ण, वश्य, तारा, योनि, ग्रह मैत्री, गण, भकूट और नाड़ी—सफल और सुखद वैवाहिक जीवन का रहस्य।',
      content: ''
    }
  ],
  ta: [
    {
      id: 1,
      title: 'ராஜ யோகத்தின் சக்தி: கேந்திர மற்றும் திரிகோண இணைப்புகள் மூலம் உயர் அந்தஸ்து',
      slug: 'the-power-of-raj-yogas-how-kendra-and-trikona-conjunctions-unlock-high-status',
      category: 'ஜோதிடம்',
      sub_category: 'ராஜ யோகம்',
      author: 'ஆஸ்ட்ரோஜங்க்ஷன் மாஸ்டர்ஸ்',
      date: '2026-03-20',
      read_time: '5 நிமிட வாசிப்பு',
      views: 1250,
      status: 'Published',
      tags: ['ராஜ யோகம்', 'ஜாதகம்', 'செல்வம்', 'ஜோதிடம்'],
      image_url: '/blog_3.jpg',
      pinned: 1,
      preview: 'வேத ஜோதிடத்தில் ராஜ யோகம் என்றால் என்ன? பாரம்பரிய ஜோதிட சாஸ்திரத்தில், ராஜ யோகம் என்பது மிக உயர்ந்த மங்களகரமான அமைப்பாகும்.',
      content: ''
    },
    {
      id: 2,
      title: 'ஏழரை சனி மற்றும் சனி பெயர்ச்சி: கர்ம வினை மற்றும் மாற்றத்தின் வேத ஞானம்',
      slug: 'navigating-saturn-return-shani-sade-sati-ancient-vedic-wisdom-for-karma-and-transformation',
      category: 'ஜோதிடம்',
      sub_category: 'ஏழரை சனி',
      author: 'ஆஸ்ட்ரோஜங்க்ஷன் மாஸ்டர்ஸ்',
      date: '2026-03-15',
      read_time: '6 நிமிட வாசிப்பு',
      views: 1420,
      status: 'Published',
      tags: ['ஏழரை சனி', 'சனி', 'பரிகாரங்கள்', 'ஜோதிடம்'],
      image_url: '/blog_2.jpg',
      pinned: 1,
      preview: 'வேத ஜோதிடத்தில் சனி பகவானின் அருள்: சனி பகவான் தண்டனை வழங்குபவர் அல்ல, அவர் கர்ம வினைகளை சீராக்கும் நீதிபதி.',
      content: ''
    },
    {
      id: 3,
      title: 'ராஜ யோகத்தின் சக்தி: வேத ஜோதிடத்தில் செல்வம் மற்றும் செழிப்பைத் திறக்கும் ரகசியம்',
      slug: 'the-power-of-raj-yogas-unlocking-wealth-and-prosperity-in-vedic-astrology',
      category: 'வேத ஜோதிடம்',
      sub_category: 'கிரக யோகங்கள்',
      author: 'ஆஸ்ட்ரோஜங்க்ஷன் மாஸ்டர்ஸ்',
      date: '2026-03-10',
      read_time: '5 நிமிட வாசிப்பு',
      views: 1890,
      status: 'Published',
      tags: ['ராஜ யோகம்', 'ஜாதகம்', 'செல்வம்', 'ஜோதிடம்'],
      image_url: '/blog_1.jpg',
      pinned: 1,
      preview: 'உங்கள் ஜாதகத்தில் ராஜ யோகங்களைப் புரிந்துகொள்ளுதல்: பாரம்பரிய வேத ஜோதிடத்தில், ராஜ யோகம் என்பது மங்களகரமான அமைப்பாகும்.',
      content: ''
    },
    {
      id: 4,
      title: 'வேத எண்கணிதம் மற்றும் வாழ்க்கை எண்: ஆன்ம ஒப்பந்தங்களை அறிதல்',
      slug: 'vedic-numerology-and-life-path-numbers-decoding-soul-contracts-through-sacred-vibration',
      category: 'எண்கணிதம்',
      sub_category: 'எண் கணித சாஸ்திரம்',
      author: 'ஆஸ்ட்ரோஜங்க்ஷன் மாஸ்டர்ஸ்',
      date: '2026-03-05',
      read_time: '4 நிமிட வாசிப்பு',
      views: 1100,
      status: 'Published',
      tags: ['எண்கணிதம்', 'எண் ஜோதிடம்'],
      image_url: '/blog_4.jpg',
      pinned: 0,
      preview: 'எண்களின் புனித அதிர்வு: வேத எண்கணிதத்தின்படி எண்கள் வெறும் கணிதம் அல்ல, அவை கிரக அதிர்வுகளின் குறியீடுகள்.',
      content: ''
    },
    {
      id: 5,
      title: 'வேத ஜாதகப் பொருத்தம் மற்றும் 36 குண அஷ்டகூட வழிகாட்டி',
      slug: 'vedic-kundli-milan-and-36-guna-ashta-koota-compatibility-guide',
      category: 'திருமண பொருத்தம்',
      sub_category: 'அஷ்டகூடம்',
      author: 'ஆஸ்ட்ரோஜங்க்ஷன் மாஸ்டர்ஸ்',
      date: '2026-03-01',
      read_time: '7 நிமிட வாசிப்பு',
      views: 2300,
      status: 'Published',
      tags: ['திருமண பொருத்தம்', 'குண பொருத்தம்', 'அஷ்டகூடம்'],
      image_url: '/zodiac_compatibility_art.jpg',
      pinned: 0,
      preview: '36 குணங்களின் முழுமையான விளக்கம்: வர்ணம், வசியம், தாரா, யோனி, கிரக மைத்ரி, கணம், பகுட மற்றும் நாடி பொருத்தம்.',
      content: ''
    }
  ],
  fr: [
    {
      id: 1,
      title: 'Le Pouvoir des Raj Yogas : Comment les Conjonctions Kendra et Trikona Révèlent le Succès',
      slug: 'the-power-of-raj-yogas-how-kendra-and-trikona-conjunctions-unlock-high-status',
      category: 'Astrologie',
      sub_category: 'Raj Yoga',
      author: "Maîtres d'AstroJunction",
      date: '2026-03-20',
      read_time: '5 min de lecture',
      views: 1250,
      status: 'Published',
      tags: ['Raj Yoga', 'Kundli', 'Richesse', 'Jyotish'],
      image_url: '/blog_3.jpg',
      pinned: 1,
      preview: "Qu'est-ce qu'un Raj Yoga en Astrologie Védique ? En Jyotish classique, un Raj Yoga est un alignement céleste d'une bénédiction suprême conférant statut et élévation.",
      content: ''
    },
    {
      id: 2,
      title: 'Le Retour de Saturne (Shani Sade Sati) : Sagesse Védique pour le Karma et la Transformation',
      slug: 'navigating-saturn-return-shani-sade-sati-ancient-vedic-wisdom-for-karma-and-transformation',
      category: 'Astrologie',
      sub_category: 'Retour de Saturne',
      author: "Maîtres d'AstroJunction",
      date: '2026-03-15',
      read_time: '6 min de lecture',
      views: 1420,
      status: 'Published',
      tags: ['Saturne', 'Sade Sati', 'Karma', 'Remèdes'],
      image_url: '/blog_2.jpg',
      pinned: 1,
      preview: "Comprendre la puissance de Saturne : En astrologie védique, Shani Dev est le maître cosmique de la justice et de l'évolution de l'âme.",
      content: ''
    },
    {
      id: 3,
      title: 'Le Pouvoir des Raj Yogas : Révéler la Richesse et la Prospérité en Astrologie Védique',
      slug: 'the-power-of-raj-yogas-unlocking-wealth-and-prosperity-in-vedic-astrology',
      category: 'Astrologie Védique',
      sub_category: 'Yogas Planétaires',
      author: "Maîtres d'AstroJunction",
      date: '2026-03-10',
      read_time: '5 min de lecture',
      views: 1890,
      status: 'Published',
      tags: ['Raj Yoga', 'Richesse', 'Prospérité'],
      image_url: '/blog_1.jpg',
      pinned: 1,
      preview: "Comprendre les Raj Yogas dans votre thème natal : Dans l'astrologie védique classique, un Raj Yoga apporte abondance et accomplissement spirituel.",
      content: ''
    },
    {
      id: 4,
      title: 'Numérologie Védique & Chemin de Vie : Décoder les Vibrations Sacrées',
      slug: 'vedic-numerology-and-life-path-numbers-decoding-soul-contracts-through-sacred-vibration',
      category: 'Numérologie',
      sub_category: 'Anka Vidya',
      author: "Maîtres d'AstroJunction",
      date: '2026-03-05',
      read_time: '4 min de lecture',
      views: 1100,
      status: 'Published',
      tags: ['Numérologie', 'Chemin de Vie', 'Vibrations'],
      image_url: '/blog_4.jpg',
      pinned: 0,
      preview: "La vibration sacrée des nombres : Selon l'ancienne Anka Vidya, les nombres sont des fréquences vivantes qui révèlent notre destinée.",
      content: ''
    },
    {
      id: 5,
      title: 'Compatibilité Amoureuse Védique (Kundli Milan) & Guide des 36 Gunas Ashta Koota',
      slug: 'vedic-kundli-milan-and-36-guna-ashta-koota-compatibility-guide',
      category: 'Compatibilité Amoureuse',
      sub_category: 'Ashta Koota',
      author: "Maîtres d'AstroJunction",
      date: '2026-03-01',
      read_time: '7 min de lecture',
      views: 2300,
      status: 'Published',
      tags: ['Compatibilité', 'Kundli Milan', '36 Gunas'],
      image_url: '/zodiac_compatibility_art.jpg',
      pinned: 0,
      preview: "L'analyse complète des 36 Gunas védiques : Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot et Nadi pour l'harmonie durable.",
      content: ''
    }
  ],
  en: DEFAULT_INITIAL_BLOGS
};

export const BlogCarousel: React.FC<BlogCarouselProps> = ({ theme, onSelectBlog, onViewAll }) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language?.split('-')[0]?.toLowerCase() || 'en');
  const isDark = theme === 'dark';
  const [blogs, setBlogs] = useState<BlogPost[]>(LOCALIZED_INITIAL_BLOGS[currentLang] || DEFAULT_INITIAL_BLOGS);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await blogApi.getBlogs(undefined, currentLang);
        if (Array.isArray(data) && data.length > 0) {
          const published = data.filter((b: any) => b.status === 'Published');
          setBlogs(published.length > 0 ? (published as BlogPost[]) : (data as BlogPost[]));
        }
      } catch (err) {
        console.error('Error fetching blogs for carousel:', err);
      }
    };

    fetchBlogs();
  }, [currentLang]);

  const displayBlogs = useMemo(() => {
    if (blogs.length === 0) return [];
    if (blogs.length === 1) return [...blogs, ...blogs, ...blogs, ...blogs, ...blogs, ...blogs];
    if (blogs.length === 2) return [...blogs, ...blogs, ...blogs, ...blogs];
    if (blogs.length === 3) return [...blogs, ...blogs, ...blogs, ...blogs];
    return [...blogs, ...blogs];
  }, [blogs]);

  if (blogs.length === 0) {
    return null;
  }

  return (
    <div className="w-full pt-16 pb-12 relative z-10 overflow-hidden">
      <div className="text-center mb-10 px-4">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <h2 className={`text-4xl md:text-5xl font-serif ${isDark ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
            {t('insights.title_main')} <span className="italic font-light text-[#C9A050]">{t('insights.title_insights')}</span>
          </h2>
        </div>
        <p className={`text-sm md:text-base text-center mx-auto max-w-lg ${isDark ? 'text-[#9E9A90]' : 'text-black'}`}>
          {t('insights.subtitle')}
        </p>
      </div>

      <div 
        className="relative w-full overflow-hidden pb-8 astro-marquee-mask"
      >
        <div className="flex w-max animate-marquee gap-6 px-4 hover:pause">
          {displayBlogs.map((blog, idx) => {
            const localizedCat = getLocalizedCategory(blog.category, currentLang) || 'VEDIC ASTROLOGY';
            const tagString = Array.isArray(blog.tags) && blog.tags.length > 0
              ? blog.tags.slice(0, 2).map(tag => getLocalizedCategory(tag, currentLang) || tag).join(' • ')
              : (getLocalizedCategory(blog.sub_category, currentLang) || blog.sub_category || 'VEDIC JYOTISH');

            const rawExcerpt = stripHtmlTags(blog.preview) || stripHtmlTags(blog.content);
            const cleanExcerpt = rawExcerpt.length > 120 ? rawExcerpt.substring(0, 120) + '...' : rawExcerpt;

            return (
              <div 
                key={`${blog.id}-${idx}`}
                onClick={() => {
                  if (onSelectBlog) onSelectBlog(blog);
                  else if (onViewAll) onViewAll();
                }}
                className={`shrink-0 w-[280px] xs:w-[320px] md:w-[380px] rounded-[2rem] overflow-hidden flex flex-col cursor-pointer transition-all hover:-translate-y-2 duration-300 shadow-xl border-2 group ${
                  isDark 
                    ? 'bg-[#141418] border-[#2A2A2E] shadow-black/60 hover:border-[#C9A050]/60' 
                    : 'bg-white border-[#E2D9C8] shadow-amber-900/10 hover:border-[#C9A050]'
                }`}
              >
                <div className="relative h-[220px] w-full overflow-hidden bg-black/20">
                  <img 
                    src={getBlogImageUrl(blog.image_url)} 
                    alt={blog.title} 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/blog_1.jpg';
                    }}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {blog.pinned === 1 && (
                    <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-[#C9A050] text-[#0D0D0F] text-[10px] font-bold uppercase tracking-wider shadow-lg">
                      {t('blogs.featured', 'Featured')}
                    </span>
                  )}
                </div>
                
                <div 
                  className={`p-6 md:p-7 flex-1 flex flex-col ${isDark ? 'bg-[#141418]' : 'bg-white'}`}
                >
                  <div className="flex items-center space-x-2 mb-3 flex-wrap gap-y-1">
                    <span className={`text-[11px] font-extrabold uppercase tracking-[0.18em] ${isDark ? 'text-[#C9A050]' : 'text-[#8C6218]'}`}>
                      {localizedCat}
                    </span>
                    <span className={`text-[10px] ${isDark ? 'text-[#50505A]' : 'text-[#A0988A]'}`}>•</span>
                    <span className={`text-[11px] font-bold uppercase tracking-wider truncate max-w-[170px] ${isDark ? 'text-[#9E9A90]' : 'text-[#5A544A]'}`}>
                      {tagString}
                    </span>
                  </div>

                  <h4 className={`text-lg md:text-xl font-serif font-bold mb-3 leading-snug line-clamp-2 ${
                    isDark ? 'text-[#F0ECE1]' : 'text-[#181614] group-hover:text-[#8C6218] transition-colors'
                  }`}>
                    {blog.title}
                  </h4>
                  
                  <p className={`text-xs md:text-sm leading-relaxed line-clamp-3 mb-4 mt-auto ${
                    isDark ? 'text-[#D0CCC2] font-normal' : 'text-black font-medium'
                  }`}>
                    {cleanExcerpt}
                  </p>

                  <div className={`pt-3 border-t flex items-center justify-between text-xs font-semibold ${
                    isDark ? 'border-white/10' : 'border-[#EAE3D4]'
                  }`}>
                    <span className={`font-black uppercase tracking-wider ${
                      isDark ? 'text-[#C9A050]' : 'text-[#8C6218] group-hover:text-[#63440B]'
                    }`}>
                      {t('blogs.read_article', 'Read Article →')}
                    </span>
                    {blog.created_at && (
                      <span className={`text-[11px] font-semibold ${isDark ? 'text-gray-400' : 'text-[#7A7366]'}`}>
                        {new Date(blog.created_at).toLocaleDateString(getDateLocale(currentLang), { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. PUBLIC BLOG READER & DIRECTORY
// ============================================================================

export interface BlogPageProps {
  theme: 'light' | 'dark';
  onBack: () => void;
  initialBlog?: BlogPost | null;
}

export function BlogPage({ theme, onBack, initialBlog = null }: BlogPageProps) {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language?.split('-')[0]?.toLowerCase() || 'en');
  const isDark = theme === 'dark';
  const [blogs, setBlogs] = useState<BlogPost[]>(LOCALIZED_INITIAL_BLOGS[currentLang] || DEFAULT_INITIAL_BLOGS);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(initialBlog);
  const [copied, setCopied] = useState(false);
  const [translatingDetail, setTranslatingDetail] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (initialBlog) {
      setSelectedBlog(initialBlog);
      if (currentLang !== 'en') {
        const slug = initialBlog.slug || initialBlog.id;
        setTranslatingDetail(true);
        blogApi.getBlogBySlug(String(slug), currentLang)
          .then(detailed => {
            if (detailed && detailed.title) setSelectedBlog(detailed);
          })
          .catch(() => {})
          .finally(() => {
            setTranslatingDetail(false);
          });
      }
    }
  }, [initialBlog, currentLang]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    if (selectedBlog) {
      const slug = selectedBlog.slug || selectedBlog.id;
      const targetPath = `/blogs/${slug}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ blogSlug: slug }, '', targetPath);
      }
    } else {
      if (window.location.pathname.startsWith('/blogs/')) {
        window.history.pushState({}, '', '/blogs');
      }
    }
  }, [selectedBlog]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/blogs/')) {
        const slug = decodeURIComponent(path.replace(/^\/blogs\/?/, '').split('/')[0].split('?')[0]);
        if (slug) {
          const found = blogs.find((b: any) => b.slug === slug || String(b.id) === slug);
          if (found) {
            setSelectedBlog(found);
            return;
          }
        }
      } else if (path === '/blogs') {
        setSelectedBlog(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [blogs]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const data = await blogApi.getBlogs(undefined, currentLang);
        if (Array.isArray(data) && data.length > 0) {
          const published = data.filter((b: BlogPost) => b.status === 'Published');
          const finalBlogs = published.length > 0 ? published : data;
          setBlogs(finalBlogs);

          // Support both /blogs/<slug> and legacy ?blog=<slug>
          let slugParam = '';
          const path = window.location.pathname;
          if (path.startsWith('/blogs/')) {
            slugParam = decodeURIComponent(path.replace(/^\/blogs\/?/, '').split('/')[0].split('?')[0]);
          } else {
            const params = new URLSearchParams(window.location.search);
            slugParam = params.get('blog') || '';
          }

          if (slugParam && !initialBlog) {
            const found = finalBlogs.find((b: any) => b.slug === slugParam || String(b.id) === slugParam);
            if (found) {
              if (currentLang !== 'en') {
                try {
                  const detailed = await blogApi.getBlogBySlug(slugParam, currentLang);
                  if (detailed && detailed.title) {
                    setSelectedBlog(detailed);
                    return;
                  }
                } catch {}
              }
              setSelectedBlog(found);
            }
          } else if (selectedBlog && !initialBlog) {
            const currentSlug = selectedBlog.slug || selectedBlog.id;
            try {
              setTranslatingDetail(true);
              const detailed = await blogApi.getBlogBySlug(String(currentSlug), currentLang);
              if (detailed && detailed.title) {
                setSelectedBlog(detailed);
              }
            } catch {} finally {
              setTranslatingDetail(false);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching blogs in BlogPage:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [initialBlog, currentLang]);

  const handleShare = () => {
    if (selectedBlog) {
      const slug = selectedBlog.slug || selectedBlog.id;
      const shareUrl = `${window.location.origin}/blogs/${slug}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
      if (selectedBlog.id) {
        blogApi.shareBlog(selectedBlog.id).catch(() => {});
      }
    }
  };

  const [currentPage, setCurrentPage] = useState<number>(1);
  const BLOGS_PER_PAGE = 9;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    blogs.forEach((b) => {
      if (b.category && b.category.trim()) cats.add(b.category.trim());
    });
    // Ensure all standard categories exist so pills are always available
    const standardCategories = ['Astrology', 'Vedic Astrology', 'Numerology', 'Matchmaking'];
    standardCategories.forEach(c => cats.add(c));
    return ['All', ...Array.from(cats)];
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchCat = selectedCategory === 'All' || 
        blog.category === selectedCategory ||
        (blog.category && selectedCategory && blog.category.toLowerCase() === selectedCategory.toLowerCase()) ||
        getLocalizedCategory(blog.category, currentLang) === selectedCategory ||
        getLocalizedCategory(blog.category, currentLang) === getLocalizedCategory(selectedCategory, currentLang) ||
        (blog.sub_category && blog.sub_category.toLowerCase() === selectedCategory.toLowerCase());

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchCat;

      const titleMatch = blog.title.toLowerCase().includes(q);
      const excerptMatch = stripHtmlTags(blog.preview || blog.content).toLowerCase().includes(q);
      const catMatch = (blog.category || '').toLowerCase().includes(q);
      const tagsMatch = Array.isArray(blog.tags) && blog.tags.some(t => t.toLowerCase().includes(q));

      return matchCat && (titleMatch || excerptMatch || catMatch || tagsMatch);
    });
  }, [blogs, selectedCategory, searchQuery, currentLang]);

  const totalPages = Math.ceil(filteredBlogs.length / BLOGS_PER_PAGE);

  const paginatedBlogs = useMemo(() => {
    const startIndex = (currentPage - 1) * BLOGS_PER_PAGE;
    return filteredBlogs.slice(startIndex, startIndex + BLOGS_PER_PAGE);
  }, [filteredBlogs, currentPage]);

  const currentBlogIndex = useMemo(() => {
    if (!selectedBlog) return -1;
    return blogs.findIndex((b) => b.id === selectedBlog.id);
  }, [blogs, selectedBlog]);

  const prevBlog = currentBlogIndex > 0 ? blogs[currentBlogIndex - 1] : null;
  const nextBlog = currentBlogIndex >= 0 && currentBlogIndex < blogs.length - 1 ? blogs[currentBlogIndex + 1] : null;

  const relatedBlogs = useMemo(() => {
    if (!selectedBlog) return [];
    return blogs
      .filter((b) => b.id !== selectedBlog.id)
      .slice(0, 3);
  }, [blogs, selectedBlog]);

  const readingTime = useMemo(() => {
    if (!selectedBlog?.content) return '4 min read';
    const wordCount = selectedBlog.content.replace(/<[^>]*>?/gm, '').split(/\s+/).length;
    const minutes = Math.max(2, Math.ceil(wordCount / 180));
    return `${minutes} min read`;
  }, [selectedBlog]);

  if (selectedBlog) {
    const blogDescription = stripHtmlTags(selectedBlog.preview) || (selectedBlog.content ? stripHtmlTags(selectedBlog.content).slice(0, 160) : selectedBlog.title);
    return (
      <div className={`min-h-[calc(100vh-5rem)] w-full pb-24 transition-colors ${
        isDark ? 'bg-[#0D0D0F] text-[#E5E1D8]' : 'bg-[#FAF8F5] text-[#0D0D0F]'
      }`}>
        <SEO
          title={`${selectedBlog.title} • ASTROJUNCTION`}
          description={blogDescription}
          keywords={Array.isArray(selectedBlog.tags) && selectedBlog.tags.length ? selectedBlog.tags : [selectedBlog.category || 'Vedic Astrology']}
          ogImage={selectedBlog.image_url || '/blog_1.jpg'}
          ogType="article"
          jsonLd={{
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": selectedBlog.title,
            "description": blogDescription,
            "image": selectedBlog.image_url ? [selectedBlog.image_url] : [],
            "datePublished": selectedBlog.created_at || new Date().toISOString(),
            "author": {
              "@type": "Organization",
              "name": "ASTROJUNCTION Vedic Scholars"
            },
            "publisher": {
              "@type": "Organization",
              "name": "ASTROJUNCTION",
              "logo": {
                "@type": "ImageObject",
                "url": "https://astrojunction.com/jyotishveda_logo_standard.png"
              }
            }
          }}
        />
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
          {/* Compact Back Button (No extra bulky navbar) */}
          <div className="mb-6 flex items-center justify-between">
            <button 
              onClick={() => setSelectedBlog(null)}
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-black transition-all border-2 cursor-pointer group shadow-sm ${
                isDark 
                  ? 'text-[#F0ECE1] bg-[#18181C] hover:text-[#C9A050] border-[#C9A050]/60 hover:border-[#C9A050] hover:bg-[#202025]' 
                  : 'text-black bg-white hover:text-black hover:bg-amber-50/60 border-[#D4A328] hover:border-[#B88714] shadow-sm'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5 text-black" />
              <span className="text-black font-black">{t('blogs.back', 'Back')}</span>
            </button>

            {/* Compact Share Button */}
            <button
              onClick={handleShare}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer shadow-sm ${
                copied
                  ? 'bg-emerald-500 text-white border-emerald-600'
                  : isDark
                    ? 'bg-[#141418] text-[#9E9A90] hover:text-[#C9A050] border-[#2A2A2E] hover:border-[#C9A050]/40'
                    : 'bg-white text-gray-600 hover:text-amber-800 border-gray-200 hover:border-amber-400'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{t('blogs.copied', 'Copied')}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{t('blogs.share', 'Share')}</span>
                </>
              )}
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4 flex-wrap gap-y-2">
              <span className="px-3.5 py-1.5 rounded-full bg-[#C9A050] text-[#0D0D0F] text-xs font-bold uppercase tracking-widest shadow-md shadow-[#C9A050]/20">
                {getLocalizedCategory(selectedBlog.category, currentLang) || 'Vedic Astrology'}
              </span>
              {selectedBlog.sub_category && (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  isDark ? 'bg-[#18181C] text-[#C9A050] border-[#C9A050]/30' : 'bg-amber-50 text-amber-900 border-amber-200'
                }`}>
                  {getLocalizedCategory(selectedBlog.sub_category, currentLang)}
                </span>
              )}
              <div className={`flex items-center space-x-1 text-xs ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
                <Clock className="w-3.5 h-3.5 text-[#C9A050]" />
                <span>{readingTime}</span>
              </div>
            </div>

            <h1 className={`text-2xl sm:text-3xl md:text-[32px] lg:text-[34px] font-serif font-bold leading-snug mb-4 sm:mb-5 ${
              isDark ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'
            }`}>
              {selectedBlog.title}
            </h1>

            <div className={`flex items-center justify-between py-4 border-y flex-wrap gap-4 ${
              isDark ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#C9A050] to-[#E2BD68] flex items-center justify-center text-[#0D0D0F] font-serif font-bold shadow-md">
                  <BookOpen className="w-5 h-5 text-[#0D0D0F]" />
                </div>
                <div>
                  <div className="text-sm font-bold flex items-center space-x-1.5">
                    <span className={isDark ? 'text-[#F0ECE1]' : 'text-gray-900'}>{t('blogs.author_title', 'AstroJunction Masters')}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C9A050]/20 text-[#C9A050] font-semibold">
                      {t('blogs.verified', 'Verified')}
                    </span>
                  </div>
                  <div className={`text-xs flex items-center space-x-2 ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
                    <Calendar className="w-3 h-3" />
                    <span>
                      {selectedBlog.created_at
                        ? new Date(selectedBlog.created_at).toLocaleDateString(getDateLocale(currentLang), { month: 'long', day: 'numeric', year: 'numeric' })
                        : t('blogs.authentic_archive', 'Authentic Vedic Archive')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#C9A050]/10 border border-[#C9A050]/30 text-[#C9A050] text-xs font-semibold">
                <Compass className="w-3.5 h-3.5" />
                <span>{t('blogs.wisdom_badge', 'Parashari & Jaimini Wisdom')}</span>
              </div>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden mb-10 shadow-2xl border border-white/10 aspect-[16/9] sm:aspect-[21/9] bg-black/40">
            <img 
              src={getBlogImageUrl(selectedBlog.image_url)} 
              alt={selectedBlog.title}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/blog_1.jpg';
              }}
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${
              isDark ? 'from-[#0D0D0F]/60 via-transparent' : 'from-black/40 via-transparent'
            } to-transparent pointer-events-none`}></div>
          </div>

          {Array.isArray(selectedBlog.tags) && selectedBlog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {selectedBlog.tags.map((tag, i) => (
                <span 
                  key={i}
                  className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    isDark 
                      ? 'bg-[#18181C] text-[#C9A050] border border-[#2A2A2E] hover:border-[#C9A050]/50' 
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  <Tag className="w-3 h-3 text-[#C9A050]" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          )}

          {translatingDetail && (
            <div className="mb-6 px-4 py-3 rounded-2xl bg-[#C9A050]/15 border border-[#C9A050]/40 flex items-center space-x-3 text-xs font-semibold text-[#C9A050] animate-pulse">
              <Sparkles className="w-4 h-4 animate-spin text-[#C9A050] shrink-0" />
              <span>
                {currentLang === 'bn' ? '✨ সম্পূর্ণ বৈদিক বিশ্লেষণ ও প্রজ্ঞার অনুবাদ লোড হচ্ছে...' :
                 currentLang === 'hi' ? '✨ संपूर्ण वैदिक अंतर्दृष्टि और अनुवाद लोड हो रहा है...' :
                 currentLang === 'ta' ? '✨ முழுமையான வேத பகுப்பாய்வு மற்றும் மொழிபெயர்ப்பு ஏற்றப்படுகிறது...' :
                 currentLang === 'fr' ? '✨ Chargement de la traduction complète de la sagesse védique...' :
                 '✨ Loading authentic Vedic insights...'}
              </span>
            </div>
          )}

          <div 
            className={`article-content prose max-w-none space-y-6 leading-relaxed text-base sm:text-lg font-sans transition-colors ${
              isDark ? 'prose-invert text-[#E5E1D8]' : 'text-gray-900'
            }`}
            dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
          />

          <div className={`my-12 p-6 sm:p-8 rounded-3xl border relative overflow-hidden ${
            isDark 
              ? 'bg-gradient-to-r from-[#18181C] to-[#121215] border-[#C9A050]/30 shadow-xl' 
              : 'bg-gradient-to-r from-amber-50/80 to-white border-amber-200 shadow-md'
          }`}>
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-2xl bg-[#C9A050]/20 text-[#C9A050] shrink-0 mt-1">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h4 className={`text-lg font-serif font-bold mb-1.5 ${isDark ? 'text-[#F0ECE1]' : 'text-amber-950'}`}>
                  {t('blogs.principle_title', 'Vedic Astrological Principle')}
                </h4>
                <p className={`text-sm sm:text-base italic leading-relaxed ${isDark ? 'text-[#9E9A90]' : 'text-gray-700'}`}>
                  {t('blogs.principle_quote', '"Yatha pinde tatha brahmande, yatha brahmande tatha pinde." — As is the individual, so is the universe; as is the microcosm, so is the macrocosm. Every planetary placement unfolds karmic blueprints for spiritual and worldly growth.')}
                </p>
              </div>
            </div>
          </div>

          {/* Previous & Next Article Navigation Cards */}
          {(prevBlog || nextBlog) && (
            <div className={`my-10 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t ${
              isDark ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'
            }`}>
              {prevBlog ? (
                <div
                  onClick={() => {
                    setSelectedBlog(prevBlog);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group shadow-md hover:shadow-lg ${
                    isDark 
                      ? 'bg-[#141418] border-[#2A2A2E] hover:border-[#C9A050]/60' 
                      : 'bg-white border-[#E2D9C8] hover:border-[#C9A050]'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider mb-2 text-[#C9A050]">
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span>{t('blogs.prev_article', 'Previous Article')}</span>
                  </div>
                  <h5 className={`text-sm sm:text-base font-serif font-bold line-clamp-2 ${
                    isDark ? 'text-[#F0ECE1] group-hover:text-[#C9A050]' : 'text-gray-900 group-hover:text-[#8C6218]'
                  } transition-colors`}>
                    {prevBlog.title}
                  </h5>
                </div>
              ) : (
                <div className="hidden sm:block"></div>
              )}

              {nextBlog ? (
                <div
                  onClick={() => {
                    setSelectedBlog(nextBlog);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between items-end text-right group shadow-md hover:shadow-lg ${
                    isDark 
                      ? 'bg-[#141418] border-[#2A2A2E] hover:border-[#C9A050]/60' 
                      : 'bg-white border-[#E2D9C8] hover:border-[#C9A050]'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider mb-2 text-[#C9A050]">
                    <span>{t('blogs.next_article', 'Next Article')}</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                  <h5 className={`text-sm sm:text-base font-serif font-bold line-clamp-2 ${
                    isDark ? 'text-[#F0ECE1] group-hover:text-[#C9A050]' : 'text-gray-900 group-hover:text-[#8C6218]'
                  } transition-colors`}>
                    {nextBlog.title}
                  </h5>
                </div>
              ) : (
                <div className="hidden sm:block"></div>
              )}
            </div>
          )}

          <div className={`pt-8 pb-12 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${
            isDark ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'
          }`}>
            <button
              onClick={() => setSelectedBlog(null)}
              className={`w-full sm:w-auto px-7 py-3 rounded-full flex items-center justify-center space-x-2 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg border-2 group ${
                isDark 
                  ? 'bg-[#141418] border-[#C9A050] text-[#F0ECE1] hover:bg-[#C9A050] hover:text-[#0D0D0F]' 
                  : 'bg-white border-[#C9A050] text-[#0D0D0F] hover:bg-[#C9A050] hover:text-[#0D0D0F]'
              }`}
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-[#C9A050] group-hover:text-inherit" />
              <span className="font-bold tracking-wider">{t('blogs.back', 'Back')}</span>
            </button>

            <button
              onClick={() => {
                setSelectedBlog(null);
                onBack();
              }}
              className="w-full sm:w-auto px-8 py-3 rounded-full font-black text-xs uppercase tracking-wider transition-all shadow-xl cursor-pointer flex items-center justify-center space-x-2 bg-gradient-to-r from-[#D4AF37] via-[#C9A050] to-[#B89040] hover:from-[#E5C158] hover:to-[#C9A050] text-[#0D0D0F] border-2 border-[#E5C158] hover:scale-105 active:scale-95 group shadow-[#C9A050]/20"
            >
              <span className="text-[#0D0D0F] font-black tracking-wider">{t('blogs.explore_charts', 'Explore Oracle & Charts')}</span>
              <ArrowRight className="w-4 h-4 text-[#0D0D0F] transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Recommended Cosmic Insights Section (Commented out per user request)
          {relatedBlogs.length > 0 && (
            <div className="pt-8 border-t border-white/10">
              <div className="text-center mb-8">
                <h3 className={`text-2xl font-serif font-bold ${isDark ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                  Recommended <span className="italic font-light text-[#C9A050]">Cosmic Insights</span>
                </h3>
                <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-[#9E9A90]' : 'text-gray-600'}`}>
                  Continue exploring divine astrological knowledge.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedBlogs.map((relBlog) => (
                  <div
                    key={relBlog.id}
                    onClick={() => setSelectedBlog(relBlog)}
                    className={`rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all hover:-translate-y-1.5 duration-300 border shadow-lg group ${
                      isDark 
                        ? 'bg-[#141418] border-[#2A2A2E] hover:border-[#C9A050]/50' 
                        : 'bg-[#FFFFFF] border-[#E2D9C8] hover:border-[#C9A050] shadow-stone-900/10'
                    }`}
                  >
                    <div className="relative h-40 w-full overflow-hidden bg-black/20">
                      <img 
                        src={getBlogImageUrl(relBlog.image_url)} 
                        alt={relBlog.title} 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/blog_1.jpg';
                        }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className={`p-5 flex-1 flex flex-col ${isDark ? 'bg-[#141418]' : 'bg-[#FFFFFF]'}`}>
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider mb-2 ${isDark ? 'text-[#C9A050]' : 'text-[#8C6218]'}`}>
                        {relBlog.category || 'Vedic Wisdom'}
                      </span>
                      <h4 className={`text-sm font-semibold line-clamp-2 leading-snug mb-3 ${
                        isDark ? 'text-[#F0ECE1]' : 'text-[#181614] group-hover:text-[#8C6218] transition-colors'
                      }`}>
                        {relBlog.title}
                      </h4>
                      <span className={`mt-auto text-[11px] font-black uppercase tracking-wider ${
                        isDark ? 'text-[#C9A050]' : 'text-[#8C6218]'
                      }`}>
                        Read Post →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          */}
        </article>
      </div>
    );
  }

  return (
    <div className={`min-h-[calc(100vh-5rem)] w-full pb-32 transition-colors ${
      isDark ? 'bg-[#0D0D0F] text-[#E5E1D8]' : 'bg-[#FAF8F5] text-[#0D0D0F]'
    }`}>
      <SEO
        title="Vedic Astrology Blogs, Articles & Ancient Wisdom • ASTROJUNCTION"
        description="Explore curated articles on planetary transits, zodiac compatibility, Vedic rituals, gemstones, and spiritual growth."
        keywords={["astrology blog", "vedic articles", "zodiac signs blog", "planetary transits", "vedic wisdom"]}
        ogImage="/blog_1.jpg"
        ogType="website"
      />
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <button 
            onClick={onBack}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all border shadow-sm cursor-pointer ${
              isDark 
                ? 'text-[#9E9A90] hover:text-[#C9A050] hover:bg-[#C9A050]/10 border-[#2A2A2E] hover:border-[#C9A050]/40' 
                : 'text-gray-700 hover:text-amber-800 hover:bg-amber-500/10 border-gray-200 hover:border-amber-600 bg-white'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-semibold">{t('blogs.back_to_home', 'Back to Home')}</span>
          </button>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('blogs.search_placeholder', 'Search articles, topics...')}
              className={`w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-full border outline-none transition-all ${
                isDark 
                  ? 'bg-[#18181C] border-[#2A2A2E] text-white focus:border-[#C9A050]' 
                  : 'bg-white border-gray-200 text-gray-900 focus:border-amber-600 shadow-sm'
              }`}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <h1 className={`text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-3 ${isDark ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
            {t('blogs.all_title_main', 'All')} <span className="italic font-light text-[#C9A050]">{t('blogs.all_title_blogs', 'Blogs')}</span> {t('blogs.all_title_end', '& Insights')}
          </h1>
          <p className={`text-xs sm:text-sm max-w-3xl mx-auto mb-5 ${isDark ? 'text-[#9E9A90]' : 'text-gray-600'}`}>
            {t('blogs.all_subtitle', 'Explore authentic Vedic astrology, planetary yogas, kundli matching, and spiritual wisdom directly from our masters.')}
          </p>

          {categories.length > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer border ${
                    selectedCategory === cat
                      ? 'bg-[#C9A050] text-[#0D0D0F] border-[#C9A050] shadow-md shadow-[#C9A050]/20'
                      : isDark
                        ? 'bg-[#18181C] text-[#9E9A90] hover:text-white border-[#2A2A2E]'
                        : 'bg-white text-gray-700 hover:text-black border-gray-200 shadow-sm'
                  }`}
                >
                  {cat === 'All' ? t('blogs.cat_all', 'All') : (getLocalizedCategory(cat, currentLang) || cat)}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#C9A050] mb-3"></div>
            <p className={`text-xs ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>{t('blogs.loading', 'Loading articles...')}</p>
          </div>
        )}

        {!loading && filteredBlogs.length === 0 && (
          <div className={`max-w-md mx-auto text-center py-16 px-6 rounded-3xl border ${
            isDark ? 'bg-[#18181C]/60 border-white/5' : 'bg-white border-gray-100'
          }`}>
            <BookOpen className="w-10 h-10 text-[#C9A050]/60 mx-auto mb-3" />
            <h3 className={`text-lg font-serif font-bold mb-2 ${isDark ? 'text-[#F0ECE1]' : 'text-gray-900'}`}>
              {searchQuery ? 'No Matching Articles' : 'No Blogs Published Yet'}
            </h3>
            <p className={`text-xs mb-5 ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
              {searchQuery 
                ? t('blogs.no_articles', `No articles found matching "${searchQuery}". Try a different search term.`) 
                : 'Blogs created and published from the Admin Panel will appear here.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="px-4 py-1.5 rounded-full bg-[#C9A050] text-[#0D0D0F] text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {!loading && filteredBlogs.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {paginatedBlogs.map((blog) => {
                const localizedCat = getLocalizedCategory(blog.category, currentLang) || 'VEDIC ASTROLOGY';
                const tagString = Array.isArray(blog.tags) && blog.tags.length > 0
                  ? blog.tags.slice(0, 2).map(tag => getLocalizedCategory(tag, currentLang) || tag).join(' • ')
                  : (getLocalizedCategory(blog.sub_category, currentLang) || blog.sub_category || 'VEDIC JYOTISH');

                const rawExcerpt = stripHtmlTags(blog.preview) || stripHtmlTags(blog.content);
                const cleanExcerpt = rawExcerpt.length > 130 ? rawExcerpt.substring(0, 130) + '...' : rawExcerpt;

                return (
                  <div 
                    key={blog.id}
                    onClick={() => {
                      setSelectedBlog(blog);
                      if (currentLang !== 'en') {
                        const slug = blog.slug || blog.id;
                        setTranslatingDetail(true);
                        blogApi.getBlogBySlug(String(slug), currentLang)
                          .then(detailed => {
                            if (detailed && detailed.title) setSelectedBlog(detailed);
                          })
                          .catch(() => {})
                          .finally(() => {
                            setTranslatingDetail(false);
                          });
                      }
                    }}
                    className={`rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col cursor-pointer transition-all hover:-translate-y-1.5 duration-300 shadow-xl border group relative z-10 ${
                      isDark 
                        ? 'bg-[#141418] border-[#2A2A2E] shadow-black/60 hover:border-[#C9A050]/60' 
                        : 'bg-[#FFFFFF] border-[#E2D9C8] shadow-xl shadow-stone-900/10 hover:border-[#C9A050] hover:shadow-2xl'
                    }`}
                  >
                    <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-black/20">
                      <img 
                        src={getBlogImageUrl(blog.image_url)} 
                        alt={blog.title} 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/blog_1.jpg';
                        }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      
                      {blog.pinned === 1 && (
                        <span className="absolute top-3.5 right-3.5 px-2.5 py-0.5 rounded-full bg-[#C9A050] text-[#0D0D0F] text-[10px] font-bold uppercase tracking-wider shadow-md">
                          {t('blogs.featured', 'Featured')}
                        </span>
                      )}
                    </div>
                    
                    <div 
                      className={`p-6 flex-1 flex flex-col ${isDark ? 'bg-[#141418]' : 'bg-[#FFFFFF]'}`}
                    >
                      <div className="flex items-center space-x-2 mb-3 flex-wrap gap-y-1">
                        <span className={`text-[11px] font-extrabold uppercase tracking-[0.15em] ${isDark ? 'text-[#C9A050]' : 'text-[#8C6218]'}`}>
                          {localizedCat}
                        </span>
                        <span className={`text-[10px] ${isDark ? 'text-[#50505A]' : 'text-[#A0988A]'}`}>•</span>
                        <span className={`text-[11px] font-bold uppercase tracking-wider truncate max-w-[170px] ${isDark ? 'text-[#9E9A90]' : 'text-[#5A544A]'}`}>
                          {tagString}
                        </span>
                      </div>

                      <h3 className={`text-lg sm:text-xl font-serif font-bold mb-3 leading-snug line-clamp-2 ${
                        isDark ? 'text-[#F0ECE1]' : 'text-[#181614] group-hover:text-[#8C6218] transition-colors'
                      }`}>
                        {blog.title}
                      </h3>
                      
                      <p className={`text-xs sm:text-sm leading-relaxed mb-5 line-clamp-3 ${
                        isDark ? 'text-[#D0CCC2] font-normal' : 'text-[#4D473E] font-medium'
                      }`}>
                        {cleanExcerpt}
                      </p>

                      <div className={`mt-auto pt-3.5 border-t flex items-center justify-between ${
                        isDark ? 'border-white/10' : 'border-[#EAE3D4]'
                      }`}>
                        <span className={`text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 ${
                          isDark ? 'text-[#C9A050]' : 'text-[#8C6218] group-hover:text-[#63440B]'
                        }`}>
                          <span>{t('blogs.read_article', 'Read Article →')}</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </span>
                        {blog.created_at && (
                          <span className={`text-xs ${isDark ? 'text-[#9E9A90]' : 'text-[#6C6960]'}`}>
                            {new Date(blog.created_at).toLocaleDateString(getDateLocale(currentLang), { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Numbered Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                <button
                  onClick={() => {
                    if (currentPage > 1) {
                      setCurrentPage(prev => prev - 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-1 border transition-all ${
                    currentPage === 1
                      ? 'opacity-30 cursor-not-allowed border-gray-700/20'
                      : isDark
                        ? 'bg-[#141418] text-[#F0ECE1] hover:text-[#C9A050] border-[#2A2A2E] hover:border-[#C9A050]/60 cursor-pointer shadow-md'
                        : 'bg-white text-gray-800 hover:text-black border-gray-200 hover:border-amber-500 shadow-sm cursor-pointer'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center space-x-1 sm:space-x-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-[#F7D36D] via-[#F3C54E] to-[#EBB738] text-black shadow-md border border-[#D4A328] font-black scale-105'
                          : isDark
                            ? 'bg-[#141418] text-[#9E9A90] hover:text-white border border-[#2A2A2E] hover:border-[#C9A050]/40'
                            : 'bg-white text-gray-700 hover:text-black border border-gray-200 hover:border-amber-400 shadow-sm'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    if (currentPage < totalPages) {
                      setCurrentPage(prev => prev + 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-1 border transition-all ${
                    currentPage === totalPages
                      ? 'opacity-30 cursor-not-allowed border-gray-700/20'
                      : isDark
                        ? 'bg-[#141418] text-[#F0ECE1] hover:text-[#C9A050] border-[#2A2A2E] hover:border-[#C9A050]/60 cursor-pointer shadow-md'
                        : 'bg-white text-gray-800 hover:text-black border-gray-200 hover:border-amber-500 shadow-sm cursor-pointer'
                  }`}
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 3. ADMIN BLOG MANAGEMENT COMPONENT
// ============================================================================

export interface AdminBlogsViewProps {
  theme?: 'dark' | 'light';
}

export const AdminBlogsView: React.FC<AdminBlogsViewProps> = ({ theme = 'dark' }) => {
  const editor = useRef(null);
  
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'categories'>('list');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  
  const [blogs, setBlogs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [selectedCategoryForSub, setSelectedCategoryForSub] = useState('');
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    sub_category: '',
    status: 'Published',
    tags: '',
    image_url: '',
    pinned: false,
    content: ''
  });

  const config = useMemo(() => ({
    readonly: false, 
    theme: theme === 'dark' ? 'dark' : 'default',
    height: 500,
    toolbarAdaptive: false,
    buttons: [
      'bold', 'italic', 'underline', 'strikethrough', '|',
      'ul', 'ol', '|',
      'font', 'fontsize', 'brush', 'paragraph', '|',
      'image', 'video', 'link', '|',
      'align', 'undo', 'redo', '|',
      'hr', 'eraser', 'fullsize'
    ],
    style: {
      background: theme === 'dark' ? '#0D0D0F' : '#FFFFFF',
      color: theme === 'dark' ? '#E5E1D8' : '#0D0D0F',
    }
  }), [theme]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [blogsData, catsData, subCatsData] = await Promise.all([
        blogApi.getBlogs('All'),
        blogApi.getCategories(),
        blogApi.getSubcategories(),
      ]);
      setBlogs(blogsData || []);
      setCategories(catsData || []);
      setSubcategories(subCatsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const availableSubcategories = subcategories.filter(sub => {
    const parentCat = categories.find(c => c.name === formData.category);
    return parentCat && sub.category_id === parentCat.id;
  });

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    try {
      await blogApi.createCategory(newCategoryName.trim());
      setNewCategoryName('');
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create category');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('Are you sure? This may affect blogs assigned to this category.')) return;
    try {
      await blogApi.deleteCategory(id);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleCreateSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubcategoryName.trim() || !selectedCategoryForSub) return;
    
    try {
      await blogApi.createSubcategory(newSubcategoryName.trim(), Number(selectedCategoryForSub));
      setNewSubcategoryName('');
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create subcategory');
    }
  };

  const handleDeleteSubcategory = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this subcategory?')) return;
    try {
      await blogApi.deleteSubcategory(id);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete subcategory');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleContentChange = (newContent: string) => {
    setFormData(prev => ({ ...prev, content: newContent }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      sub_category: '',
      status: 'Published',
      tags: '',
      image_url: '',
      pinned: false,
      content: ''
    });
    setEditingId(null);
    setImagePreviewUrl('');
  };

  const handleEditBlog = (blog: any) => {
    setEditingId(blog.id);
    setImagePreviewUrl(getBlogImageUrl(blog.image_url));
    setFormData({
      title: blog.title || '',
      category: blog.category || '',
      sub_category: blog.sub_category || '',
      status: blog.status || 'Published',
      tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : '',
      image_url: blog.image_url || '',
      pinned: !!blog.pinned,
      content: blog.content || ''
    });
    setViewMode('create');
  };

  const handleDeleteBlog = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    try {
      await blogApi.deleteBlog(id);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete blog');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert('Please provide both a Title and Content for the blog.');
      return;
    }

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = formData.content;
      const rawText = tempDiv.textContent || tempDiv.innerText || '';
      const preview = rawText.slice(0, 160).trim() + (rawText.length > 160 ? '...' : '');

      const payload = {
        title: formData.title,
        content: formData.content,
        preview,
        image_url: formData.image_url,
        category: formData.category,
        sub_category: formData.sub_category,
        status: formData.status,
        tags: tagsArray,
        pinned: formData.pinned ? 1 : 0
      };

      if (editingId) {
        await blogApi.updateBlog(editingId, payload);
      } else {
        await blogApi.createBlog(payload);
      }

      resetForm();
      setViewMode('list');
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save blog');
    }
  };

  const filteredBlogs = blogs.filter(b => 
    (b.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`w-full min-h-[calc(100vh-5rem)] p-2 md:p-4 transition-colors`}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2A2A2E]/40 pb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-serif font-bold tracking-tight">Blog Management</h1>
            <p className={`text-xs mt-1 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Create, edit, and organize editorial articles and astrological insights.
            </p>
          </div>
          <div className={`flex items-center space-x-2 p-1 rounded-xl border-2 shadow-sm ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-white border-[#E5E1D8]'}`}>
            <button
              onClick={() => { resetForm(); setViewMode('list'); }}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list' 
                  ? 'bg-[#C9A050] text-[#0D0D0F] shadow' 
                  : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-700 hover:text-black'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>All Blogs</span>
            </button>
            <button
              onClick={() => { resetForm(); setViewMode('create'); }}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'create' 
                  ? 'bg-[#C9A050] text-[#0D0D0F] shadow' 
                  : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-700 hover:text-black'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{editingId ? 'Edit Blog' : 'Create Blog'}</span>
            </button>
            <button
              onClick={() => setViewMode('categories')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'categories' 
                  ? 'bg-[#C9A050] text-[#0D0D0F] shadow' 
                  : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-700 hover:text-black'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Categories</span>
            </button>
          </div>
        </div>

        {viewMode === 'list' && (
          <div 
            className={`rounded-2xl border-2 overflow-hidden shadow-xl relative z-10 ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-white border-[#DFC896]'}`}
          >
            <div className={`p-3.5 border-b-2 flex items-center justify-between gap-4 ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-white border-[#DFC896]'}`}>
              <div className="relative w-full max-w-xs">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9A90]" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#C9A050] ${
                    theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E] text-[#E5E1D8] placeholder-[#6C6960]' : 'bg-white border-[#DFC896] text-[#0D0D0F] shadow-xs'
                  }`}
                />
              </div>
              <div className={`text-xs font-semibold ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-600'}`}>
                Total: <span className="font-bold text-[#C9A050]">{filteredBlogs.length}</span> posts
              </div>
            </div>

            <div 
              className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-340px)] min-h-[220px] custom-scrollbar bg-white dark:bg-[#141418]"
            >
              <table 
                className="w-full text-left text-xs whitespace-nowrap border-collapse bg-white dark:bg-[#141418]"
              >
                <thead className={`sticky top-0 z-10 text-[11px] font-bold uppercase tracking-wider border-b-2 ${theme === 'dark' ? 'bg-[#0D0D0F] text-[#9E9A90] border-[#2A2A2E]' : 'bg-[#FAF8F2] text-gray-700 border-[#DFC896]'}`}>
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Preview</th>
                    <th className="px-4 py-3">Image</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Tags</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody 
                  className={`divide-y ${theme === 'dark' ? 'divide-[#2A2A2E]/60 bg-[#141418]' : 'divide-gray-100 bg-white'}`}
                >
                  {loading && blogs.length === 0 ? (
                    <tr className={theme === 'dark' ? 'bg-[#141418]' : 'bg-white'}>
                      <td colSpan={9} className="px-4 py-12 text-center text-[#9E9A90]">Loading blogs...</td>
                    </tr>
                  ) : filteredBlogs.length === 0 ? (
                    <tr className={theme === 'dark' ? 'bg-[#141418]' : 'bg-white'}>
                      <td colSpan={9} className="px-4 py-12 text-center text-[#9E9A90]">No blogs found.</td>
                    </tr>
                  ) : filteredBlogs.map((blog) => (
                    <tr key={blog.id} className={`transition-colors ${theme === 'dark' ? 'bg-[#141418] hover:bg-[#1C1C22]' : 'bg-white hover:bg-[#FAF7F2]'}`}>
                      <td className={`px-4 py-3.5 font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{blog.id}</td>
                      <td className="px-4 py-3.5">
                        <div className={`font-semibold max-w-[200px] truncate ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#1A1816]'}`} title={blog.title}>{blog.title}</div>
                        {blog.slug && <div className="text-[10px] text-[#9E9A90] font-mono truncate max-w-[200px]" title={blog.slug}>/{blog.slug}</div>}
                        {blog.pinned === 1 && <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#C9A050]/20 text-[#C9A050] mt-0.5 inline-block font-bold">Pinned</span>}
                      </td>
                      <td className={`px-4 py-3.5 ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6C6960]'}`}>
                        <div className="max-w-[200px] truncate text-[11px]" title={stripHtmlTags(blog.preview)}>{stripHtmlTags(blog.preview)}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        {blog.image_url ? (
                           <img 
                             src={getBlogImageUrl(blog.image_url)} 
                             alt="Thumb" 
                             className="w-7 h-7 rounded object-cover border border-[#DFC896]/50" 
                             onError={(e) => { (e.target as HTMLImageElement).src = '/blog_1.jpg'; }}
                           />
                        ) : (
                           <div className={`w-7 h-7 rounded flex items-center justify-center ${theme === 'dark' ? 'bg-[#2A2A2E]' : 'bg-[#FAF2DA] border border-[#DFC896]'}`}>
                             <ImageIcon className="w-3.5 h-3.5 text-[#9E9A90]" />
                           </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-[#4A90E2] font-semibold">{blog.category}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1 flex-wrap max-w-[150px]">
                          {blog.tags && blog.tags.map((tag: string) => (
                            <span key={tag} className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${theme === 'dark' ? 'bg-[#2A2A2E] text-[#E5E1D8]' : 'bg-[#FAF2DA] text-[#8C6218] border border-[#DFC896]'}`}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          blog.status === 'Published' 
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        }`}>
                          {blog.status}
                        </span>
                      </td>
                      <td className={`px-4 py-3.5 text-[11px] font-medium ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6C6960]'}`}>
                        {blog.created_at ? new Date(blog.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => handleEditBlog(blog)}
                            className="p-1.5 rounded-lg hover:bg-[#C9A050]/20 text-[#C9A050] transition-colors border border-transparent hover:border-[#C9A050]/40"
                            title="Edit Blog"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBlog(blog.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-500 transition-colors border border-transparent hover:border-red-500/40"
                            title="Delete Blog"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Footer Bar matching User Management */}
            <div className={`px-4 py-3 border-t-2 flex items-center justify-between text-xs ${theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#FAF8F2] border-[#DFC896]'}`}>
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600 font-medium'}>
                Showing <span className="font-bold text-[#C9A050]">{filteredBlogs.length}</span> editorial posts
              </span>
              <span className={`text-[11px] font-semibold ${theme === 'dark' ? 'text-[#C9A050]' : 'text-[#8C6218]'}`}>
                AstroJunction Editorial CMS
              </span>
            </div>
          </div>
        )}

        {viewMode === 'create' && (
          <form 
            onSubmit={handleSubmit} 
            className={`p-6 rounded-2xl border-2 space-y-6 shadow-xl relative z-10 ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-white border-[#E5E1D8]'}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2">
                <label className={`block text-sm font-bold mb-1.5 ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}`}>Blog Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Navigating Saturn Return: A Spiritual Guide"
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A050] focus:border-[#C9A050] transition-colors ${
                    theme === 'dark' 
                      ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8] placeholder-[#6C6960]' 
                      : 'bg-white border-gray-300 text-black placeholder-[#9E9A90]'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-bold mb-1.5 ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}`}>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={(e) => {
                    handleInputChange(e);
                    setFormData(prev => ({ ...prev, sub_category: '' }));
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A050] focus:border-[#C9A050] transition-colors ${
                    theme === 'dark' 
                      ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8]' 
                      : 'bg-[#FFFFFF] border-[#D5D1C8] text-[#0D0D0F]'
                  }`}
                >
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}`}>Subcategory</label>
                <select
                  name="sub_category"
                  value={formData.sub_category}
                  onChange={handleInputChange}
                  disabled={!formData.category || availableSubcategories.length === 0}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A050] focus:border-[#C9A050] transition-colors ${
                    theme === 'dark' 
                      ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8] disabled:opacity-50' 
                      : 'bg-[#FFFFFF] border-[#D5D1C8] text-[#0D0D0F] disabled:opacity-50'
                  }`}
                >
                  <option value="">Select Subcategory</option>
                  {availableSubcategories.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}`}>Publication Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A050] focus:border-[#C9A050] transition-colors ${
                    theme === 'dark' 
                      ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8]' 
                      : 'bg-[#FFFFFF] border-[#D5D1C8] text-[#0D0D0F]'
                  }`}
                >
                  <option value="Published">Published (Public)</option>
                  <option value="Draft">Draft (Hidden)</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}`}>Tags (Comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="e.g. Health, Anxiety, Recovery" 
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A050] focus:border-[#C9A050] transition-colors ${
                    theme === 'dark' 
                      ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8] placeholder-[#6C6960]' 
                      : 'bg-[#FFFFFF] border-[#D5D1C8] text-[#0D0D0F] placeholder-[#9E9A90]'
                  }`}
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}`}>Featured Image</label>
                <div className={`flex items-center gap-2 p-3 rounded-lg border border-dashed transition-colors ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E] hover:border-[#C9A050]/50' : 'bg-[#F9F7F1] border-[#D5D1C8] hover:border-[#C9A050]/50'}`}>
                  <ImageIcon className="w-4 h-4 text-[#9E9A90] shrink-0" />
                  <input
                    type="text"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    placeholder="Enter image URL or upload..."
                    className="flex-1 bg-transparent border-none focus:outline-none text-sm min-w-0"
                  />
                  <label className="shrink-0 cursor-pointer px-3 py-1.5 rounded-md text-xs font-bold bg-[#C9A050] text-[#0D0D0F] hover:bg-[#B89040] transition-colors">
                    Upload
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const localUrl = URL.createObjectURL(file);
                        setImagePreviewUrl(localUrl);
                        try {
                          const { url } = await blogApi.uploadBlogImage(file);
                          setFormData(prev => ({ ...prev, image_url: url }));
                          setImagePreviewUrl(getBlogImageUrl(url));
                          URL.revokeObjectURL(localUrl);
                        } catch {
                          setImagePreviewUrl('');
                          alert('Image upload failed. Please try again.');
                        }
                      }}
                    />
                  </label>
                </div>
                {(imagePreviewUrl || formData.image_url) && (
                  <div className="mt-3 relative w-fit group">
                    <img
                      src={imagePreviewUrl || getBlogImageUrl(formData.image_url)}
                      alt="preview"
                      className="h-28 w-auto max-w-xs rounded-lg object-cover border border-[#C9A050]/40 shadow-md"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <button
                      type="button"
                      onClick={() => { setFormData(prev => ({ ...prev, image_url: '' })); setImagePreviewUrl(''); }}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center hover:bg-red-600 shadow"
                      title="Remove image"
                    >✕</button>
                  </div>
                )}
              </div>

              <div className="col-span-1 md:col-span-2 pt-2 border-t border-[#2A2A2E]/50">
                <label className="flex items-center space-x-3 cursor-pointer group w-fit">
                  <input type="checkbox" name="pinned" checked={formData.pinned} onChange={handleInputChange} className="w-4 h-4 accent-[#C9A050] cursor-pointer" />
                  <span className={`text-sm font-medium transition-colors group-hover:text-[#C9A050] ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}`}>Pin this post to top</span>
                </label>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}`}>Full Article Content *</label>
              <div className="rounded-lg overflow-hidden border border-[#2A2A2E]">
                <JoditEditor
                  ref={editor}
                  value={formData.content}
                  config={config}
                  onBlur={handleContentChange}
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#2A2A2E]/40">
              <button
                type="button"
                onClick={() => { resetForm(); setViewMode('list'); }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  theme === 'dark' ? 'border-[#2A2A2E] hover:bg-[#2A2A2E]' : 'border-[#D5D1C8] hover:bg-[#E5E1D8]'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg text-xs font-bold bg-[#C9A050] hover:bg-[#D4AF37] text-[#0D0D0F] transition-all shadow-md"
              >
                {editingId ? 'Update Blog Post' : 'Publish Blog Post'}
              </button>
            </div>
          </form>
        )}

        {viewMode === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              className={`p-5 rounded-xl border-2 shadow-xl ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-white border-[#E5E1D8]'}`}
            >
              <h2 className="text-sm font-bold uppercase tracking-wider mb-4 text-[#C9A050] flex items-center space-x-2">
                <Folder className="w-4 h-4" />
                <span>Categories</span>
              </h2>
              <form onSubmit={handleCreateCategory} className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="New Category Name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className={`flex-1 px-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#C9A050] ${
                    theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E] text-white' : 'bg-white border-gray-300 text-black'
                  }`}
                />
                <button type="submit" className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#C9A050] text-[#0D0D0F] hover:bg-[#B89040]">
                  Add
                </button>
              </form>
              <ul className="divide-y divide-[#2A2A2E]/40 max-h-60 overflow-y-auto">
                {categories.map(c => (
                  <li key={c.id} className="py-2 flex items-center justify-between text-xs">
                    <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-900 font-medium'}>{c.name}</span>
                    <button onClick={() => handleDeleteCategory(c.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div 
              className={`p-5 rounded-xl border-2 shadow-xl ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-white border-[#E5E1D8]'}`}
            >
              <h2 className="text-sm font-bold uppercase tracking-wider mb-4 text-[#C9A050] flex items-center space-x-2">
                <Tag className="w-4 h-4" />
                <span>Subcategories</span>
              </h2>
              <form onSubmit={handleCreateSubcategory} className="space-y-2 mb-4">
                <select
                  value={selectedCategoryForSub}
                  onChange={(e) => setSelectedCategoryForSub(e.target.value)}
                  className={`w-full px-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#C9A050] ${
                    theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E] text-white' : 'bg-white border-gray-300 text-black'
                  }`}
                >
                  <option value="">Select Parent Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="New Subcategory Name"
                    value={newSubcategoryName}
                    onChange={(e) => setNewSubcategoryName(e.target.value)}
                    className={`flex-1 px-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#C9A050] ${
                      theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E] text-white' : 'bg-white border-gray-300 text-black'
                    }`}
                  />
                  <button type="submit" className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#C9A050] text-[#0D0D0F] hover:bg-[#B89040]">
                    Add
                  </button>
                </div>
              </form>
              <ul className="divide-y divide-[#2A2A2E]/40 max-h-60 overflow-y-auto">
                {subcategories.map(s => {
                  const parent = categories.find(c => c.id === s.category_id);
                  return (
                    <li key={s.id} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-900 font-medium'}>{s.name}</span>
                        {parent && <span className="ml-2 text-[10px] text-[#9E9A90]">({parent.name})</span>}
                      </div>
                      <button onClick={() => handleDeleteSubcategory(s.id)} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;