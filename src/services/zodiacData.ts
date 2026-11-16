export interface ZodiacSign {
  id: string;
  name: string;
  sanskrit: string;
  sanskritName?: string;
  sanskritScript?: string;
  symbol: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  modality: 'Cardinal' | 'Fixed' | 'Mutable';
  ruling_planet: string;
  tropical_dates: string;
  sidereal_dates: string;
  motto: string;
  chinese_archetype: string;
  nakshatras: string[];
  
  // These are now generated dynamically by AI, not stored in DB
  vitalityToday?: number;
  loveRating?: number;
  careerRating?: number;
  wealthRating?: number;
  todayForecast?: string;
  weeklyForecast?: string;
  monthlyForecast?: string;
  yearly2026Forecast?: string;
  luckyGemstone?: string;
  luckyColor?: string;
  luckyDay?: string;
  powerNumbers?: number[];
  resonantChakra?: string;
  affirmation?: string;
  bestRomanceMatches?: string[];
  bestCareerMatches?: string[];
  growthMatches?: string[];
}

export interface ZodiacCompatibilityResult {
  signA: ZodiacSign;
  signB: ZodiacSign;
  overallScore: number; // 0-100%
  elementSynergy: string;
  romanceAnalysis: string;
  intellectualAnalysis: string;
  growthPotential: string;
  remedialAdvice: string;
}

export const RASHI_NAMES_BY_LANG: Record<string, Record<string, string>> = {
  hi: {
    aries: 'मेष',
    taurus: 'वृषभ',
    gemini: 'मिथुन',
    cancer: 'कर्क',
    leo: 'सिंह',
    virgo: 'कन्या',
    libra: 'तुला',
    scorpio: 'वृश्चिक',
    sagittarius: 'धनु',
    capricorn: 'मकर',
    aquarius: 'कुम्भ',
    pisces: 'मीन',
  },
  bn: {
    aries: 'মেষ',
    taurus: 'বৃষ',
    gemini: 'মিথুন',
    cancer: 'কর্কট',
    leo: 'সিংহ',
    virgo: 'কন্যা',
    libra: 'তুলা',
    scorpio: 'বৃশ্চিক',
    sagittarius: 'ধনু',
    capricorn: 'মকর',
    aquarius: 'কুম্ভ',
    pisces: 'মীন',
  },
  ta: {
    aries: 'மேஷம்',
    taurus: 'ரிஷபம்',
    gemini: 'மிதுனம்',
    cancer: 'கடகம்',
    leo: 'சிம்மம்',
    virgo: 'கன்னி',
    libra: 'துலாம்',
    scorpio: 'விருச்சிகம்',
    sagittarius: 'தனுசு',
    capricorn: 'மகரம்',
    aquarius: 'கும்பம்',
    pisces: 'மீனம்',
  },
  fr: {
    aries: 'Bélier',
    taurus: 'Taureau',
    gemini: 'Gémeaux',
    cancer: 'Cancer',
    leo: 'Lion',
    virgo: 'Vierge',
    libra: 'Balance',
    scorpio: 'Scorpion',
    sagittarius: 'Sagittaire',
    capricorn: 'Capricorne',
    aquarius: 'Verseau',
    pisces: 'Poissons',
  },
  en: {
    aries: 'Mesha',
    taurus: 'Vrishabha',
    gemini: 'Mithuna',
    cancer: 'Karka',
    leo: 'Simha',
    virgo: 'Kanya',
    libra: 'Tula',
    scorpio: 'Vrishchika',
    sagittarius: 'Dhanu',
    capricorn: 'Makara',
    aquarius: 'Kumbha',
    pisces: 'Meena',
  },
};

export const RULER_NAMES_BY_LANG: Record<string, Record<string, string>> = {
  hi: {
    Mars: 'मंगल',
    Venus: 'शुक्र',
    Mercury: 'बुध',
    Moon: 'चन्द्र',
    Sun: 'सूर्य',
    Jupiter: 'गुरु',
    Saturn: 'शनि',
  },
  bn: {
    Mars: 'মঙ্গল',
    Venus: 'শুক্র',
    Mercury: 'বুধ',
    Moon: 'চন্দ্র',
    Sun: 'সূর্য',
    Jupiter: 'বৃহস্পতি',
    Saturn: 'শনি',
  },
  ta: {
    Mars: 'செவ்வாய்',
    Venus: 'சுக்கிரன்',
    Mercury: 'புதன்',
    Moon: 'சந்திரன்',
    Sun: 'சூரியன்',
    Jupiter: 'குரு',
    Saturn: 'சனி',
  },
  fr: {
    Mars: 'Mars',
    Venus: 'Vénus',
    Mercury: 'Mercure',
    Moon: 'Lune',
    Sun: 'Soleil',
    Jupiter: 'Jupiter',
    Saturn: 'Saturne',
  },
  en: {
    Mars: 'Mangal',
    Venus: 'Shukra',
    Mercury: 'Budha',
    Moon: 'Chandra',
    Sun: 'Surya',
    Jupiter: 'Guru',
    Saturn: 'Shani',
  },
};

export function getLocalizedRashiName(signId: string, lang: string, fallback: string = ''): string {
  const normLang = (lang || 'en').split('-')[0].toLowerCase();
  const normId = (signId || '').toLowerCase().trim();
  return RASHI_NAMES_BY_LANG[normLang]?.[normId] || RASHI_NAMES_BY_LANG['hi']?.[normId] || fallback;
}

export function getLocalizedRulerName(ruler: string, lang: string, fallback: string = ''): string {
  const normLang = (lang || 'en').split('-')[0].toLowerCase();
  return RULER_NAMES_BY_LANG[normLang]?.[ruler] || RULER_NAMES_BY_LANG['hi']?.[ruler] || fallback;
}

export function calculateZodiacCompatibility(
  signAId: string, 
  signBId: string, 
  system: 'tropical' | 'sidereal' = 'tropical',
  allSigns: ZodiacSign[],
  language: string = 'en'
): ZodiacCompatibilityResult {
  
  const signA = allSigns.find((s) => s.id === signAId) || allSigns[0];
  const signB = allSigns.find((s) => s.id === signBId) || allSigns[1];

  let baseScore = 75;

  if (signA.element === signB.element) {
    baseScore += signA.id === signB.id ? 12 : 18;
  } else if (
    (signA.element === 'Fire' && signB.element === 'Air') ||
    (signA.element === 'Air' && signB.element === 'Fire') ||
    (signA.element === 'Earth' && signB.element === 'Water') ||
    (signA.element === 'Water' && signB.element === 'Earth')
  ) {
    baseScore += 15;
  } else if (
    (signA.element === 'Fire' && signB.element === 'Water') ||
    (signA.element === 'Water' && signB.element === 'Fire')
  ) {
    baseScore -= 8;
  }

  if (signA.modality === signB.modality && signA.id !== signB.id) {
    baseScore += 2;
  }

  // We no longer check explicit matches because those arrays are dynamic now, 
  // we rely strictly on element and planetary synergy for the base math.
  
  if (system === 'sidereal') {
    const asuraGroup = ['Mercury', 'Venus', 'Saturn'];
    const devaGroup = ['Sun', 'Moon', 'Mars', 'Jupiter'];
    const rulerA = signA.ruling_planet || '';
    const rulerB = signB.ruling_planet || '';
    
    if (rulerA === rulerB) {
      baseScore += 4;
    } else if (asuraGroup.includes(rulerA) && asuraGroup.includes(rulerB)) {
      baseScore += 3;
    } else if (devaGroup.includes(rulerA) && devaGroup.includes(rulerB)) {
      baseScore += 3;
    } else {
      baseScore -= 6;
    }
    
    if (baseScore % 2 === 0) {
      baseScore -= 1;
    } else {
      baseScore += 2;
    }
  }

  let overallScore = Math.min(99, Math.max(55, baseScore));

  const isFireAir = (signA.element === 'Fire' && signB.element === 'Air') || (signA.element === 'Air' && signB.element === 'Fire');
  const isEarthWater = (signA.element === 'Earth' && signB.element === 'Water') || (signA.element === 'Water' && signB.element === 'Earth');
  const isSameElement = signA.element === signB.element;

  const normLang = (language || 'en').split('-')[0].toLowerCase();
  
  const LOCALIZED_ANALYSIS: Record<string, {
    elementSynergy: (eA: string, eB: string, isSame: boolean, isFA: boolean, isEW: boolean) => string;
    romance: (sA: string, sB: string, rA: string, rB: string) => string;
    intellectual: (sA: string, sB: string) => string;
    growth: string;
    remedial: string;
  }> = {
    hi: {
      elementSynergy: (eA, eB, isSame, isFA, isEW) => {
        if (isSame) return `समान तत्व सामंजस्य: दोनों राशियों में जन्मजात आपसी समझ और संतुलित ऊर्जा का प्रवाह रहता है।`;
        if (isFA) return `ऊर्जावान प्रेरणा: वायु तत्व अग्नि को नई प्रेरणा देता है, जिससे उत्साह और रचनात्मक विचार विकसित होते हैं।`;
        if (isEW) return `पोषणकारी संबंध: जल तत्व पृथ्वी को सींचता है, जिससे व्यावहारिक सपने यथार्थ में बदलते हैं।`;
        return `${eA} और ${eB} तत्वों का स्वाभाविक एवं संतुलित समन्वय।`;
      },
      romance: (sA, sB, rA, rB) => `${sA} और ${sB} के बीच ग्रहों की ऊर्जा एक स्वाभाविक और गहरा आकर्षण पैदा करती है।`,
      intellectual: (sA, sB) => `संवाद में खुलापन और एक-दूसरे के विचारों का आदर इस संबंध को बौद्धिक रूप से समृद्ध बनाता है।`,
      growth: `आपसी सहयोग और समझ से दोनों एक-दूसरे के व्यक्तिगत एवं आत्मिक विकास में सहायक बनते हैं।`,
      remedial: `धैर्य बनाए रखें, नियमित संवाद स्थापित करें और एक-दूसरे के दृष्टिकोण का सम्मान करें।`
    },
    bn: {
      elementSynergy: (eA, eB, isSame, isFA, isEW) => {
        if (isSame) return `অনুরূপ উপাদান সামঞ্জস্য: উভয়ের মধ্যে সহজাত পারস্পরিক বোঝাপড়া ও ইতিবাচক মানসিক সংযোগ বিদ্যমান।`;
        if (isFA) return `গতিশীল অনুপ্রেরণা: বায়ু উপাদান অগ্নির দীপ্তিকে প্রজ্জ্বলিত করে, যা উৎসাহ ও সৃষ্টিশীল চিন্তা জাগিয়ে তোলে।`;
        if (isEW) return `পুষ্টিকর সংযোগ: জল উপাদান মাটিকে স্নিগ্ধ ও সমৃদ্ধ করে, যা বাস্তবসম্মত স্বপ্নকে সফল রূপ দেয়।`;
        return `${eA} ও ${eB} উপাদানের প্রাকৃতিক ও ভারসাম্যপূর্ণ মেলবন্ধন।`;
      },
      romance: (sA, sB, rA, rB) => `${sA} ও ${sB}-এর গ্রহাধিপতিদের শক্তি উভয়ের মধ্যে গভীর আত্মিক ও মানসিক আকর্ষণ সৃষ্টি করে।`,
      intellectual: (sA, sB) => `খোলামেলা মতবিনিময় এবং পারস্পরিক বোঝাপড়া সম্পর্ককে স্থায়ী বুদ্ধিবৃত্তিক ভিত্তি দেয়।`,
      growth: `উভয় সঙ্গী পরস্পরের সীমাবদ্ধতা কাটিয়ে উঠতে ও আত্মিক উন্নতিতে পরস্পরকে সাহায্য করে।`,
      remedial: `ধৈর্য বজায় রাখুন, নিয়মিত ভাববিনিময় করুন এবং পরস্পরের স্বাতন্ত্র্যের প্রতি শ্রদ্ধাশীল থাকুন।`
    },
    ta: {
      elementSynergy: (eA, eB, isSame, isFA, isEW) => {
        if (isSame) return `இயற்கையான பஞ்சபூத ஒற்றுமை: இருவரிடமும் இயல்பான பரஸ்பர புரிதலும் ஆற்றலும் உள்ளது.`;
        if (isFA) return `ஊக்கமளிக்கும் நல்லிணக்கம்: காற்று நெருப்பை மேலும் பிரகாசிக்கச் செய்து உற்சாகத்தை உருவாக்குகிறது.`;
        if (isEW) return `வளப்படுத்தும் பிணைப்பு: நீர் நிலத்தை செழுமைப்படுத்தி லட்சியங்களை நனவாக்குகிறது.`;
        return `${eA} மற்றும் ${eB} கூறுகளின் இயல்பான ஆற்றல் சமநிலை.`;
      },
      romance: (sA, sB, rA, rB) => `${sA} மற்றும் ${sB} ஆகிய இருவரின் கிரக ஆற்றல்கள் ஆழமான அன்பையும் ஈர்ப்பையும் உருவாக்குகின்றன.`,
      intellectual: (sA, sB) => `தெளிவான கருத்துப் பகிர்வும் பரஸ்பர புரிதலும் அறிவுசார் பிணைப்பை பலப்படுத்துகிறது.`,
      growth: `இருவரும் ஒருவரையொருவர் ஊக்கப்படுத்தி வாழ்வில் புதிய நிலைகளை எட்ட உதவுகிறார்கள்.`,
      remedial: `பொறுமையுடன் செயல்பட்டு ஒருவரையொருவர் மதித்து நடப்பது உறவுக்கு நன்மை பயக்கும்.`
    },
    fr: {
      elementSynergy: (eA, eB, isSame, isFA, isEW) => {
        if (isSame) return `Résonance élémentaire harmonieuse : Compréhension mutuelle innée et longueur d'onde partagée.`;
        if (isFA) return `Inspiration dynamique : L'Air nourrit le Feu sacré, générant enthousiasme et vision.`;
        if (isEW) return `Manifestation nourricière : L'Eau enrichit la Terre, permettant aux rêves de s'enraciner durablement.`;
        return `Union dynamique naturelle entre ${eA} et ${eB}.`;
      },
      romance: (sA, sB, rA, rB) => `La connexion entre ${sA} et ${sB} mêle harmonieusement les énergies planétaires de leurs dirigeants.`,
      intellectual: (sA, sB) => `La communication s'épanouit avec clarté grâce au respect mutuel de leurs perspectives.`,
      growth: `Les deux partenaires s'enrichissent mutuellement et grandissent ensemble avec bienveillance.`,
      remedial: `Pratiquez la patience, honorez les besoins élémentaires de chacun et cultivez le dialogue.`
    },
    en: {
      elementSynergy: (eA, eB, isSame, isFA, isEW) => {
        if (isSame) return `Harmonious ${eA} Resonance: Innate mutual understanding and shared instinctual wavelength.`;
        if (isFA) return `Dynamic Inspiration: Air fuels the Sacred Fire, generating endless enthusiasm and visionary ideas.`;
        if (isEW) return `Nourishing Manifestation: Water softens and enriches Earth, allowing grounded dreams to blossom into enduring reality.`;
        return `${eA} & ${eB} dynamic union.`;
      },
      romance: (sA, sB, rA, rB) => `The connection between ${sA} and ${sB} blends ${rA}'s energetic qualities with ${rB}'s guidance.`,
      intellectual: (sA, sB) => `Communication flows with clarity when ${sA}'s natural perspective interacts constructively with ${sB}'s view.`,
      growth: `Both partners serve as mirrors for evolution, helping each other transcend limitations through compassionate dialogue.`,
      remedial: `Engage in shared reflection, honor each other's elemental needs, and practice patient communication.`
    }
  };

  const localized = LOCALIZED_ANALYSIS[normLang] || LOCALIZED_ANALYSIS['en'];

  return {
    signA,
    signB,
    overallScore,
    elementSynergy: localized.elementSynergy(signA.element, signB.element, isSameElement, isFireAir, isEarthWater),
    romanceAnalysis: localized.romance(signA.name, signB.name, signA.ruling_planet || 'Ruling Lord', signB.ruling_planet || 'Ruling Lord'),
    intellectualAnalysis: localized.intellectual(signA.name, signB.name),
    growthPotential: localized.growth,
    remedialAdvice: localized.remedial,
  };
}
