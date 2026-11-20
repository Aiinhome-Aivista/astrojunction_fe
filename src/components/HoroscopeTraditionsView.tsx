import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Compass,
  Sparkles,
  Layers,
  CheckCircle,
  Flame,
  Volume2,
  Download,
  FileText,
  Loader2,
  Milestone,
  Lock,
  Crown,
  ArrowRight,
  X,
  CheckCircle2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import {
  UserProfile,
  HoroscopeTradition,
  ChartStyle,
  PlanetPosition,
  HouseData,
  DashaPeriod,
  VedicYoga,
  VedicDosha,
  NumerologyReport,
} from '../types';

import { getTranslation } from '../services/translations';
import { calculateVedicChart } from '../services/astroEngine';
import { api, getToken } from '../services/api';
import { API_ENDPOINTS } from '../config/api_config';
import { tVedic } from '../i18n';
import {
  formatLocalizedDigits,
  getPlanetAbbreviation,
  getLagnaAbbreviation,
  getCanonicalYogaId,
  getCanonicalDoshaId,
  getDignityKey,
  getGemstoneKey,
  parseSynthesisOutput,
  parseInlineBold,
  SynthesisResponse,
  SynthesisSection,
  SynthesisCard,
} from '../services/birthChartTranslations';
import { getLocalizedGemPurpose } from '../services/matchmakingTranslations';

const PlanetBadge = ({
  p,
  isDiamond,
}: {
  p: any;
  isDiamond?: boolean;
}) => {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language || 'en').split('-')[0].toLowerCase();
  const abbr = getPlanetAbbreviation(p.id || p.name, currentLang);
  const planetName = tVedic('planets', p.name, p.name);
  const signName = tVedic('signs', p.signName, p.signName);
  const nakshatraName = tVedic('nakshatras', p.nakshatra, p.nakshatra);
  const degFormatted = formatLocalizedDigits(p.degree.toFixed(2), currentLang);
  const padaFormatted = formatLocalizedDigits(p.pada, currentLang);
  const dignityKey = getDignityKey(p.dignity);

  return (
    <div className="group relative z-50">
      <span
        className={`cursor-help transition-all duration-300 block ${
          isDiamond
            ? 'text-[10px] font-sans font-bold text-[#E5E1D8] bg-[#1A1A1E] px-1 rounded border border-[#C9A050]/40 hover:scale-110 shadow-sm hover:shadow-[#C9A050]/30'
            : 'text-[9px] font-bold text-[#C9A050] hover:scale-110 hover:text-[#F0ECE1] hover:drop-shadow-[0_0_4px_rgba(201,160,80,0.8)]'
        }`}
      >
        {abbr}
      </span>

      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-[#141418]/95 backdrop-blur-xl border border-[#C9A050]/40 text-[#E5E1D8] text-[10px] rounded-lg px-3 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.8)] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[100] flex flex-col items-center translate-y-2 group-hover:translate-y-0 scale-95 group-hover:scale-100">
        <span className="font-bold text-[#C9A050] text-xs">
          {planetName} ({p.sanskritName})
        </span>

        <div className="flex items-center gap-1.5 mt-1 opacity-90">
          {p.isRetrograde && (
            <span className="text-[#C9A050] uppercase tracking-wider text-[8px] font-bold bg-[#C9A050]/15 px-1 rounded border border-[#C9A050]/30">
              {getTranslation('birthChart.chart.retrograde', currentLang) || 'Retrograde'}
            </span>
          )}

          <span>
            {degFormatted}° {signName}
          </span>
        </div>

        <div className="mt-1 text-[9px] text-[#9E9A90]">
          {nakshatraName} (Pada {padaFormatted})
        </div>

        <div className="mt-0.5 text-[8px] text-[#C9A050]/90 uppercase tracking-widest bg-[#C9A050]/10 px-1.5 rounded-sm">
          {getTranslation('birthChart.planets_table.dignities.' + dignityKey, currentLang) || p.dignity}
        </div>
      </div>
    </div>
  );
};

interface HoroscopeTraditionsViewProps {
  profile: UserProfile;
  tradition: HoroscopeTradition;
  setTradition: (t: HoroscopeTradition) => void;

  chartData: {
    ascendant: {
      signIndex: number;
      degree: number;
      signName: string;
      signSanskrit: string;
      nakshatra: string;
    };
    planets: PlanetPosition[];
    houses: HouseData[];
    dashas: DashaPeriod[];
    yogas: VedicYoga[];
    doshas: VedicDosha[];
    divisionalCharts?: { d9: any; d10: any };
    aspects?: any[];
    gemstones?: any[];
    kpSystem?: { houses: number[] };
  };

  numerology: NumerologyReport;
  language?: string;
  theme?: 'light' | 'dark';
  onNavigateToTab?: (tab: string, tierId?: string) => void;
}

export const HoroscopeTraditionsView: React.FC<
  HoroscopeTraditionsViewProps
> = ({
  profile,
  tradition,
  setTradition,
  chartData: rawChartData,
  numerology,
  language = 'en',
  theme = 'light',
  onNavigateToTab,
}) => {
  const chartData = useMemo(() => {
    if (
      rawChartData &&
      Array.isArray(rawChartData.houses) &&
      rawChartData.houses.length > 0 &&
      Array.isArray(rawChartData.planets) &&
      rawChartData.planets.length > 0 &&
      rawChartData.ascendant
    ) {
      return rawChartData;
    }
    return calculateVedicChart(profile);
  }, [rawChartData, profile]);

  const isDark = theme === 'dark';
  const [chartStyle, setChartStyle] =
    useState<ChartStyle>('north_indian');

  const [selectedHouse, setSelectedHouse] =
    useState<HouseData | null>(() => chartData.houses?.[0] || null);

  const [selectedPlanet, setSelectedPlanet] =
    useState<PlanetPosition | null>(() => chartData.planets?.[0] || null);

  const { t: tI18n, i18n } = useTranslation();
  const currentLang = (i18n.language || language || 'en').split('-')[0].toLowerCase();
  const profileKey = profile?.id || profile?.fullName || 'seeker';

  const t = (key: string, optionsOrFallback?: any): string => {
    if (typeof optionsOrFallback === 'string') {
      const val = tI18n(key, { defaultValue: optionsOrFallback });
      if (val && val !== key) return String(val);
      const legacyVal = getTranslation(key, currentLang);
      return legacyVal === key ? optionsOrFallback : String(legacyVal);
    }
    const val = tI18n(key, optionsOrFallback);
    if (val && val !== key) return String(val);
    const legacy = getTranslation(key, currentLang);
    return legacy && legacy !== key ? String(legacy) : key;
  };

  const defaultEnglishSynthesis = `### 🌟 Cosmic Synthesis & Lagna Archetype
Your Vedic Ascendant (Lagna) is placed in **Libra (Tula)** under the sacred asterism of **Swati Nakshatra**. This divine placement endows you with formidable determination, innate clarity of vision, and the stamina to pioneer new ventures. In Indian numerology, your Psychic Number (**Mulank 8**) harmonizes with your Destiny Number (**Bhagyank 5**), revealing a life path designed for purposeful leadership, commercial acumen, and lasting legacy.

### 🪐 Tradition-Specific Deep Dive (PARASHARI)
- **Ascendant Core Vitality**: Your Lagna in Libra anchors your fundamental constitution, personal charisma, and psychological resilience. It defines how you meet challenges and grants the steadfast willpower needed to accomplish significant worldly and spiritual goals.
- **Lagna Lord Dynamics**: Your Lagna Lord **Sun (Surya)** is conjunct *Mercury (Budha)* in Aries, generating a powerful **Budhaditya Yoga** that sharpens executive intellect.
- **Time: 10:30 AM Transit (तुला लग्न / तुला लग्न)**: Auspicious planetary transits activate favorable karmic alignments during mid-morning hours.
- Direct transit of Jupiter through the 9th house brings continuous spiritual wisdom and philosophical expansion without requiring specific remedial pacification.

### ⚡ Planetary Dignities & Active Yogas
- **Maha Dhana & Raja Yogas**: Auspicious alignments between your 2nd (Wealth), 9th (Grace), and 11th (Income) Bhavas create strong pathways for multi-stream asset accumulation.
- **Karmic Axis Regulation**: Rahu and Ketu reside in balancing quadrants, granting you unconventional insights in technological or strategic problem-solving.`;

  const defaultHindiSynthesis = JSON.stringify({
    sections: [
      {
        id: "cosmic_archetype",
        title: "कॉस्मिक समन्वय एवं लग्न मूल-स्वरूप",
        cards: [
          {
            title: "लग्न आत्मिक शक्ति",
            summary: "आपका वैदिक लग्न आपकी शारीरिक जीवन-शक्ति, मौलिक स्वभाव तथा जीवन की दिशा का मुख्य आधार है। यह जीवन में स्थिरता और संकल्प शक्ति प्रदान करता है।",
            bullets: ["शारीरिक ऊर्जा एवं तेज", "मानसिक दृढ़ता"],
            tags: ["लग्न", "ऊर्जा"]
          },
          {
            title: "जन्म नक्षत्र प्रभाव",
            summary: "जन्म नक्षत्र का सूक्ष्म प्रभाव आपकी गहरी अंतर्दृष्टि तथा निर्णय क्षमता को परिपक्व बनाता है, जिससे महत्वपूर्ण निर्णयों में स्पष्टता प्राप्त होती है।",
            bullets: ["दूरदर्शिता", "नेतृत्व क्षमता"],
            tags: ["नक्षत्र"]
          }
        ]
      },
      {
        id: "bhava_alignments",
        title: "भाव संरेखण एवं भाव स्वामी प्रभाव",
        cards: [
          {
            title: "कर्म एवं धर्म भाव संरेखण",
            summary: "दशम कर्म भाव तथा नवम धर्म भाव का संतुलित संबंध पेशेवर प्रतिष्ठा, दीर्घकालिक लक्ष्य और नैतिक नेतृत्व में सतत वृद्धि करता है।",
            bullets: ["व्यावसायिक प्रतिष्ठा", "नैतिक नेतृत्व"],
            tags: ["कर्म", "धर्म"]
          },
          {
            title: "केंद्र एवं त्रिकोण शुभ संबंध",
            summary: "केंद्र भावों की स्थिरता और त्रिकोण भावों का दैवीय अनुग्रह मिलकर जीवन में निरंतर सौभाग्य एवं व्यक्तिगत प्रगति का मार्ग प्रशस्त करते हैं।",
            bullets: ["स्थिर प्रगति", "दैवीय अनुग्रह"],
            tags: ["केंद्र", "त्रिकोण"]
          }
        ]
      },
      {
        id: "tradition_deep_dive",
        title: "पराशरी पद्धति विशेष विश्लेषण",
        cards: [
          {
            title: "लग्नेश की स्थिति एवं प्रभाव",
            summary: "लग्नेश की शुभ स्थिति जीवन के प्रत्येक क्षेत्र में आत्म-विश्वास तथा दीर्घकालिक सफलता का मार्ग प्रशस्त करती है।",
            bullets: ["सक्रिय आत्म-बल", "कैरियर में उन्नति"],
            tags: ["लग्नेश"]
          },
          {
            title: "सक्रिय विंशोत्तरी दशा चक्र",
            summary: "सक्रिय महादशा एवं अन्तर्दशा का समयावधि आपके प्रयासों को रचनात्मक दिशा तथा अनुकूल सामर्थ्य प्रदान कर रहा है।",
            bullets: ["दशा अनुकूलता", "कल्याणकारी अवसर"],
            tags: ["दशा"]
          }
        ]
      },
      {
        id: "yogas_formations",
        title: "ग्रह योग एवं शुभ खगोलीय विन्यास",
        cards: [
          {
            title: "सक्रिय शुभ राजयोग",
            summary: "जन्म कुंडली में निर्मित केंद्र-त्रिकोण योग आपके बौद्धिक सामर्थ्य और सामाजिक प्रतिष्ठा को निरंतर संवर्धित करते हैं।",
            bullets: ["सामाजिक प्रतिष्ठा", "आर्थिक संपन्नता"],
            tags: ["राजयोग"]
          },
          {
            title: "धन योग एवं समृद्धि",
            summary: "द्वितीय, पंचम एवं एकादश भावों की अनुकूल युति धन संचय, वित्तीय स्थिरता और निरंतर संसाधनों की वृद्धि करती है।",
            bullets: ["वित्तीय सुरक्षा", "संसाधन वृद्धि"],
            tags: ["धन योग"]
          },
          {
            title: "बुधादित्य एवं ज्ञान योग",
            summary: "सूर्य और बुध का शुभ प्रभाव तार्किक बुद्धि, वाक्पटुता और रणनीतिक सोच में असाधारण प्रखरता लाता है।",
            bullets: ["कुशाग्र बुद्धि", "रणनीतिक दक्षता"],
            tags: ["ज्ञान योग"]
          }
        ]
      },
      {
        id: "sacred_upayas",
        title: "कल्याणकारी वैदिक उपाय, साधना एवं मार्गदर्शन",
        cards: [
          {
            title: "लग्नेश अनुकूल रत्न एवं उपाय",
            summary: "लग्नेश के अनुकूल रत्न का विधिवत धारण एवं संबंधित मंत्र साधना शारीरिक आरोग्य एवं आत्मिक बल को तीव्र करती है।",
            bullets: ["आरोग्य संवर्धन", "आत्मिक बल"],
            tags: ["रत्न उपाय"]
          },
          {
            title: "दैनिक जप एवं ईष्ट साधना",
            summary: "प्रातःकाल गायत्री मंत्र अथवा महामृत्युंजय मंत्र का शांत चित्त से जप अंतर्मन को शांति और मानसिक स्थिरता प्रदान करता है।",
            bullets: ["मानसिक शांति", "ईष्ट कृपा"],
            tags: ["जप साधना"]
          },
          {
            title: "ग्रह शांति एवं दान विधान",
            summary: "शुभ नक्षत्र एवं विशिष्ट वार को अन्न अथवा वस्त्र का सात्विक दान जीवन की बाधाओं को दूर कर सकारात्मक ऊर्जा का संचार करता है।",
            bullets: ["सकारात्मक ऊर्जा", "बाधा निवारण"],
            tags: ["वैदिक दान"]
          }
        ]
      }
    ]
  });

  const defaultBengaliSynthesis = JSON.stringify({
    sections: [
      {
        id: "cosmic_archetype",
        title: "কসমিক সমন্বয় ও লগ্ন মূল-স্বরূপ",
        cards: [
          {
            title: "লগ্নের আত্মিক শক্তি",
            summary: "আপনার বৈদিক লগ্ন আপনার শারীরিক জীবনীশক্তি, মানসিক দৃঢ়তা এবং ব্যক্তিত্বের মূল ভিত্তি নির্দেশ করে। এটি আপনার কর্মশক্তি এবং জীবনের লক্ষ্য অর্জনে ধারাবাহিক একাগ্রতা প্রদান করে।",
            bullets: ["শারীরিক জীবনীশক্তি ও মানসিক ভারসাম্য", "দৃঢ় সংকল্প"],
            tags: ["লগ্ন", "শক্তি"]
          },
          {
            title: "জন্ম নক্ষত্রের প্রভাব",
            summary: "জন্ম নক্ষত্রের শাসনে আপনার মনস্তাত্ত্বিক উপলব্ধি এবং গভীর অন্তর্দৃষ্টি বিকশিত হয়, যা গুরুত্বপূর্ণ সিদ্ধান্ত গ্রহণে দূরদর্শিতা দান করে।",
            bullets: ["গভীর অন্তর্দৃষ্টি", "দূরদর্শী সিদ্ধান্ত"],
            tags: ["নক্ষত্র"]
          }
        ]
      },
      {
        id: "bhava_alignments",
        title: "ভাব সমন্বয় ও ভাবাধিপতি গতিপ্রকৃতি",
        cards: [
          {
            title: "কর্ম ও ধর্ম ভাব সমন্বয়",
            summary: "দশম কর্ম ভাব ও নবম ধর্ম ভাবের অনুকূল সংযোগ পেশাগত সমৃদ্ধি, নেতৃত্ব এবং দীর্ঘমেয়াদী সামাজিক সুনাম নিশ্চিত করে।",
            bullets: ["পেশাগত স্থায়িত্ব", "নৈতিক নেতৃত্ব"],
            tags: ["কর্ম", "ধর্ম"]
          },
          {
            title: "কেন্দ্র ও ত্রিকোণ শুভ সম্পর্ক",
            summary: "কেন্দ্র ভাবের স্থায়িত্ব এবং ত্রিকোণ ভাবের শুভাশীর্বাদ একত্রে জীবনে অবিচল কল্যাণ ও সৌভাগ্যের প্রবাহ অক্ষুণ্ণ রাখে।",
            bullets: ["অবিচল কল্যাণ", "সৌভাগ্যের ধারা"],
            tags: ["কেন্দ্র", "ত্রিকোণ"]
          }
        ]
      },
      {
        id: "tradition_deep_dive",
        title: "পরাশরী ঐতিহ্য গভীর বিশ্লেষণ",
        cards: [
          {
            title: "লগ্নেশের স্থিতি ও প্রভাব",
            summary: "লগ্নেশের অনুকূল অবস্থান কর্মক্ষেত্রে মর্যাদা, নেতৃত্ব এবং দীর্ঘমেয়াদী মানসিক শান্তি বৃদ্ধি করে।",
            bullets: ["নেতৃত্ব ও প্রতিষ্ঠা", "মানসিক শান্তি"],
            tags: ["লগ্নেশ"]
          },
          {
            title: "সক্রিয় বিংশোত্তরী দশা চক্র",
            summary: "বর্তমান মহাদশা ও অন্তর্দশা আপনার কর্মপ্রচেষ্টাকে সঠিক দিকনির্দেশনা ও শুভ ফল প্রদান করছে।",
            bullets: ["দশার অনুকূলতা", "সাফল্যের সুযোগ"],
            tags: ["দশা"]
          }
        ]
      },
      {
        id: "yogas_formations",
        title: "গ্রহ যোগ ও শুভ মহাজাগতিক সংস্থান",
        cards: [
          {
            title: "শুভ রাজযোগ প্রভাব",
            summary: "কেন্দ্র ও ত্রিকোণ ভাবের শুভ সংযোগ আপনার বুদ্ধিমত্তা এবং সামাজিক প্রতিষ্ঠার পথ সুগম করে।",
            bullets: ["সামাজিক প্রতিষ্ঠা", "আর্থিক সমৃদ্ধি"],
            tags: ["শুভ যোগ"]
          },
          {
            title: "ধন যোগ ও সমৃদ্ধি",
            summary: "দ্বিতীয়, পঞ্চম ও একাদশ ভাবের মঙ্গলজনক যোগাযোগ আর্থিক স্থায়িত্ব এবং সম্পদ বৃদ্ধির স্থায়ী সুযোগ তৈরি করে।",
            bullets: ["আর্থিক নিরাপত্তা", "সম্পদ বৃদ্ধি"],
            tags: ["ধন যোগ"]
          },
          {
            title: "বুদ্ধি ও প্রজ্ঞা বিকাশক যোগ",
            summary: "সূর্য ও বুধের অনুকূল দৃষ্টি ও সংযোগ আপনার কৌশলগত চিন্তা, স্পষ্ট যোগাযোগ ও সূক্ষ্ম বিচারবুদ্ধি জাগ্রত রাখে।",
            bullets: ["সূক্ষ্ম প্রজ্ঞা", "কৌশলগত দূরদর্শিতা"],
            tags: ["জ্ঞান যোগ"]
          }
        ]
      },
      {
        id: "sacred_upayas",
        title: "কল্যাণকর বৈদিক প্রতিকার, সাধনা ও নির্দেশিকা",
        cards: [
          {
            title: "লগ্নেশ অনুকূল রত্ন ও প্রতিকার",
            summary: "লগ্নাধিপতির অনুকূল রত্ন ধারণ ও বিধিসম্মত মন্ত্র পাঠ আপনার সার্বিক স্বাস্থ্য এবং মনোবল বহুগুণ বৃদ্ধি করে।",
            bullets: ["স্বাস্থ্য সুরক্ষা", "মনোবল বৃদ্ধি"],
            tags: ["রত্ন প্রতিকার"]
          },
          {
            title: "দৈনিক জপ ও ইষ্ট সাধনা",
            summary: "প্রত্যহ প্রাতঃকালে গায়ত্রী মন্ত্র বা মহামৃত্যুঞ্জয় মন্ত্র একাগ্রচিত্তে পাঠ মানসিক প্রশান্তি ও আত্মিক তেজ দান করে।",
            bullets: ["আত্মিক তেজ", "মানসিক প্রশান্তি"],
            tags: ["জপ সাধনা"]
          },
          {
            title: "গ্রহ শান্তি ও বৈদিক দান",
            summary: "শুভ তিথি ও নক্ষত্রে খাদ্যশস্য অথবা বস্ত্র দান জীবনের সকল অনাকাঙ্ক্ষিত অন্তরায় দূর করে কল্যাণ বয়ে আনে।",
            bullets: ["অন্তরায় মুক্তি", "শুভ শক্তির বিকাশ"],
            tags: ["বৈদিক দান"]
          }
        ]
      }
    ]
  });

  const defaultTamilSynthesis = JSON.stringify({
    sections: [
      {
        id: "cosmic_archetype",
        title: "பிரபஞ்ச ஒருங்கிணைப்பு மற்றும் லக்ன இயல்பு",
        cards: [
          {
            title: "லக்னத்தின் ஆன்மீக ஆற்றல்",
            summary: "உங்கள் வேத லக்னம் உங்கள் உடல் ஆற்றல், மன உறுதி மற்றும் ஆளுமைப் பண்புகளை வழிநடத்துகிறது. இது உங்கள் வாழ்க்கைப் பயணத்தில் வெற்றியைத் தருகிறது.",
            bullets: ["உடல் உறுதி", "மன அமைதி"],
            tags: ["லக்னம்", "ஆற்றல்"]
          },
          {
            title: "பிறப்பு நட்சத்திர ஆதிக்கம்",
            summary: "பிறப்பு நட்சத்திரத்தின் ஆதிக்கம் உங்கள் உள்ளுணர்வை கூர்மைப்படுத்தி, சிறந்த முடிவுகளை எடுக்க உதவுகிறது.",
            bullets: ["கூர்மையான அறிவு", "தொலைநோக்கு பார்வை"],
            tags: ["நட்சத்திரம்"]
          }
        ]
      },
      {
        id: "bhava_alignments",
        title: "பாவ அமைப்புகள் மற்றும் அதிபதிகளின் இயக்கம்",
        cards: [
          {
            title: "தர்ம மற்றும் கர்ம பாவ சீரமைப்பு",
            summary: "10-ஆம் கர்ம பாவம் மற்றும் 9-ஆம் தர்ம பாவத்தின் சமநிலை தொழில்முறை வளர்ச்சி, சமூக அந்தஸ்து மற்றும் நீடித்த நற்பெயரை உறுதி செய்கிறது.",
            bullets: ["தொழில் நிலைத்தன்மை", "நேர்மையான தலைமை"],
            tags: ["கர்மம்", "தர்மம்"]
          },
          {
            title: "கேந்திர-திரிகோண சுப இணைப்புகள்",
            summary: "கேந்திர வீடுகளின் வலிமையும் திரிகோண வீடுகளின் அருளும் இணைந்து தொடர்ச்சியான வெற்றிகளையும் பாக்கியத்தையும் அளிக்கின்றன.",
            bullets: ["நிலையான வளர்ச்சி", "இறை அருள்"],
            tags: ["கேந்திரம்", "திரிகோணம்"]
          }
        ]
      },
      {
        id: "tradition_deep_dive",
        title: "பராசர பாரம்பரிய ஆழமான பகுப்பாய்வு",
        cards: [
          {
            title: "லக்னாதிபதியின் நிலை",
            summary: "லக்னாதிபதியின் நிலை உங்கள் தன்னம்பிக்கையை உயர்த்தி, சமூகத்தில் உயர் அந்தஸ்தை வழங்குகிறது.",
            bullets: ["சமூக அந்தஸ்து", "நீடித்த வெற்றி"],
            tags: ["லக்னாதிபதி"]
          },
          {
            title: "செயலில் உள்ள விம்சோத்தரி தசா சுழற்சி",
            summary: "நடப்பு மகா தசை மற்றும் அந்தர்தசை உங்கள் முயற்சிகளுக்கு சரியான பாதையையும் சுப பலன்களையும் வழங்குகிறது.",
            bullets: ["தசா அனுகூலம்", "வெற்றி வாய்ப்புகள்"],
            tags: ["தசா"]
          }
        ]
      },
      {
        id: "yogas_formations",
        title: "கிரக யோகங்கள் மற்றும் சுப அமைப்புகள்",
        cards: [
          {
            title: "சுப ராஜயோக அமைப்பு",
            summary: "ஜாதகத்தில் அமைந்துள்ள கேந்திர-திரிகோண யோகங்கள் உங்கள் அறிவுத்திறனையும் சமுதாய கௌரவத்தையும் உயர்த்துகின்றன.",
            bullets: ["சமூக கௌரவம்", "ஆளுமைத் திறன்"],
            tags: ["ராஜயோகம்"]
          },
          {
            title: "தன யோகம் மற்றும் செல்வ வளம்",
            summary: "2, 5 மற்றும் 11-ஆம் வீடுகளின் தொடர்பு நிதிப் பாதுகாப்பு, நிலையான செல்வம் மற்றும் தொடர் வளங்களை உருவாக்குகிறது.",
            bullets: ["நிதிப் பாதுகாப்பு", "செல்வ வளம்"],
            tags: ["தன யோகம்"]
          },
          {
            title: "ஞானம் மற்றும் புத்தி கூர்மை யோகம்",
            summary: "சூரியன் மற்றும் புதனின் சுப சேர்க்கை கூர்மையான பகுத்தறிவு, பேச்சுத் திறன் மற்றும் தொலைநோக்குச் சிந்தனையைத் தருகிறது.",
            bullets: ["கூர்மையான புத்தி", "வியூகச் சிந்தனை"],
            tags: ["ஞான யோகம்"]
          }
        ]
      },
      {
        id: "sacred_upayas",
        title: "மங்களகரமான வேத பரிகாரங்கள் மற்றும் சாதனை",
        cards: [
          {
            title: "லக்னாதிபதி ரத்தினம் மற்றும் பரிகாரம்",
            summary: "லக்னாதிபதிக்குரிய ரத்தினத்தை அணிவதும் உரிய மந்திரங்களை உச்சரிப்பதும் உடல் நலம் மற்றும் ஆன்மீக ஆற்றலை மேம்படுத்துகிறது.",
            bullets: ["ஆரோக்கிய மேம்பாடு", "மன உறுதி"],
            tags: ["ரத்தின பரிகாரம்"]
          },
          {
            title: "தினசரி ஜபம் மற்றும் இஷ்ட தெய்வ வழிபாடு",
            summary: "காலை வேளையில் காயத்ரி மந்திரம் அல்லது மகா மிருத்யுஞ்ஜய மந்திரத்தை மன அமைதியுடன் ஜபிப்பது அமைதியைத் தருகிறது.",
            bullets: ["மன அமைதி", "தெய்வ அருள்"],
            tags: ["மந்திர ஜபம்"]
          },
          {
            title: "கிரக சாந்தி மற்றும் தான நெறி",
            summary: "சுப நாட்களில் ஏழைகளுக்கு அன்னதானம் அல்லது ஆடை தானம் வழங்குவது தடைகளை நீக்கி நேர்மறை ஆற்றலை ஈர்க்கிறது.",
            bullets: ["தடைகள் நீங்குதல்", "நேர்மறை ஆற்றல்"],
            tags: ["வேத தானம்"]
          }
        ]
      }
    ]
  });

  const defaultFrenchSynthesis = JSON.stringify({
    sections: [
      {
        id: "cosmic_archetype",
        title: "Synthèse Cosmique & Archétype de l'Ascendant",
        cards: [
          {
            title: "Force Fondamentale de l'Ascendant",
            summary: "Votre Ascendant védique ancre votre constitution vitale, votre clarté de vision et votre résilience naturelle face aux défis de la vie.",
            bullets: ["Vitalité physique & équilibre mental", "Détermination inébranlable"],
            tags: ["Ascendant", "Vitalité"]
          },
          {
            title: "Influence du Nakshatra Natal",
            summary: "Votre astérisme de naissance confère une intuition profonde et une solide capacité d'analyse stratégique pour les décisions majeures.",
            bullets: ["Intuition affinée", "Vision prospective"],
            tags: ["Nakshatra"]
          }
        ]
      },
      {
        id: "bhava_alignments",
        title: "Alignement des Bhavas & Dynamique des Maîtres de Maisons",
        cards: [
          {
            title: "Harmonie Karma & Dharma (Maisons 10 & 9)",
            summary: "L'interaction harmonieuse entre la 10e maison du Karma et la 9e maison du Dharma assure l'épanouissement professionnel, un leadership éthique et une réputation pérenne.",
            bullets: ["Stabilité professionnelle", "Leadership éthique"],
            tags: ["Karma", "Dharma"]
          },
          {
            title: "Synergie Bénéfique Kendra & Trikona",
            summary: "La force structurelle des maisons Kendra combinée à la grâce spirituelle des maisons Trikona maintient un flux constant de prospérité et de bien-être.",
            bullets: ["Progrès constant", "Bénédiction cosmique"],
            tags: ["Kendra", "Trikona"]
          }
        ]
      },
      {
        id: "tradition_deep_dive",
        title: "Analyse Approfondie de la Tradition Parashari",
        cards: [
          {
            title: "Dynamique du Maître de l'Ascendant",
            summary: "Le positionnement favorable du maître de votre Ascendant stimule l'assurance, le statut social et une expansion professionnelle continue.",
            bullets: ["Autorité naturelle", "Succès durable"],
            tags: ["Lagnesha"]
          },
          {
            title: "Cycle des Vimshottari Dashas Actif",
            summary: "La période planétaire actuelle (Mahadasha & Antardasha) canalise vos initiatives vers des réalisations tangibles et hautement constructives.",
            bullets: ["Période propice", "Opportunités d'essor"],
            tags: ["Dasha"]
          }
        ]
      },
      {
        id: "yogas_formations",
        title: "Yogas Planétaires & Formations Célestes Auspicieuses",
        cards: [
          {
            title: "Activation du Raja Yoga Parashari",
            summary: "La conjonction des seigneurs angulaires et des maisons de grâce active un puissant Raja Yoga favorisant l'autorité et le respect sociétal.",
            bullets: ["Élévation sociale", "Reconnaissance d'élite"],
            tags: ["Raja Yoga"]
          },
          {
            title: "Dhana Yoga & Multiplicateurs de Prospérité",
            summary: "Les aspects bénéfiques reliant les 2e, 5e et 11e maisons renforcent la sécurité financière et la croissance continue du patrimoine.",
            bullets: ["Stabilité matérielle", "Abondance pérenne"],
            tags: ["Dhana Yoga"]
          },
          {
            title: "Yoga de Discernement & d'Intelligence Stratégique",
            summary: "L'alignement harmonieux de Mercure et du Soleil vivifie votre acuité intellectuelle, votre discernement stratégique et votre éloquence.",
            bullets: ["Sagesse analytique", "Communication fluide"],
            tags: ["Budhaditya"]
          }
        ]
      },
      {
        id: "sacred_upayas",
        title: "Remèdes Védiques Sacrés, Sadhanas & Directives",
        cards: [
          {
            title: "Gemmothérapie Védique Personnalisée",
            summary: "Le port d'une pierre gemme naturelle associée à votre planète maîtresse harmonise vos courants subtils d'énergie et fortifie votre vitalité globale.",
            bullets: ["Vitalité renforcée", "Harmonisation aurique"],
            tags: ["Gemmes védiques"]
          },
          {
            title: "Sadhana Quotidienne & Méditation",
            summary: "La récitation matinale concentrée du Gayatri Mantra ou du Maha Mrityunjaya Mantra purifie l'esprit et développe une grande sérénité intérieure.",
            bullets: ["Sérénité mentale", "Élévation spirituelle"],
            tags: ["Japa Sadhana"]
          },
          {
            title: "Harmonisation Spatiale Vastu & Rituels du Jeudi",
            summary: "L'orientation harmonieuse de votre espace d'étude vers l'Est et l'offrande d'une lampe de ghee pur au crépuscule attirent la félicité familiale.",
            bullets: ["Paix au foyer", "Énergie purifiée"],
            tags: ["Vastu & Rituels"]
          }
        ]
      }
    ]
  });

  const [interpretationCache, setInterpretationCache] = useState<Record<string, string>>(() => ({
    [`parashari_en_${profileKey}`]: defaultEnglishSynthesis,
    [`parashari_en_seeker`]: defaultEnglishSynthesis,
    [`parashari_en_default`]: defaultEnglishSynthesis,
    [`parashari_en_guest`]: defaultEnglishSynthesis,
    [`parashari_hi_${profileKey}`]: defaultHindiSynthesis,
    [`parashari_hi_seeker`]: defaultHindiSynthesis,
    [`parashari_bn_${profileKey}`]: defaultBengaliSynthesis,
    [`parashari_bn_seeker`]: defaultBengaliSynthesis,
    [`parashari_ta_${profileKey}`]: defaultTamilSynthesis,
    [`parashari_ta_seeker`]: defaultTamilSynthesis,
    [`parashari_fr_${profileKey}`]: defaultFrenchSynthesis,
    [`parashari_fr_seeker`]: defaultFrenchSynthesis,
  }));

  const cacheKey = `${tradition}_${currentLang}_${profileKey}`;
  const aiInterpretation = interpretationCache[cacheKey] || interpretationCache[`${tradition}_${currentLang}_seeker`] || null;
  const setAiInterpretation = (val: string | null) => {
    setInterpretationCache((prev) => (val ? { ...prev, [cacheKey]: val } : { ...prev, [cacheKey]: '' }));
  };

  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  const [isHistoryUnlocked, setIsHistoryUnlocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('jyotish_user_premium') === 'true' ||
        localStorage.getItem('jyotish_birth_chart_subscription_active') === 'true' ||
        localStorage.getItem('jyotish_daily_vedic_subscription_active') === 'true'
      );
    }
    return false;
  });

  const isPremiumUser = Boolean(
    profile?.isPremium ||
    isHistoryUnlocked ||
    (typeof window !== 'undefined' && (
      localStorage.getItem('jyotish_user_premium') === 'true' ||
      localStorage.getItem('jyotish_birth_chart_subscription_active') === 'true' ||
      localStorage.getItem('jyotish_daily_vedic_subscription_active') === 'true'
    ))
  );

  // Sync unlock status from backend payment history
  React.useEffect(() => {
    let isCancelled = false;
    const syncStatus = async () => {
      if (isPremiumUser) return;
      try {
        const token = getToken();
        if (token) {
          const res = await api.get<any>(API_ENDPOINTS.PAYMENT.HISTORY);
          const list = Array.isArray(res) ? res : (res?.data && Array.isArray(res.data) ? res.data : []);
          if (list.some((tx: any) => tx.status === 'success' && (tx.item_id === 'daily_vedic_subscription' || tx.item_id === 'birth_chart_subscription' || Number(tx.amount) === 99))) {
            if (!isCancelled) {
              setIsHistoryUnlocked(true);
              localStorage.setItem('jyotish_user_premium', 'true');
              localStorage.setItem('jyotish_birth_chart_subscription_active', 'true');
              localStorage.setItem('jyotish_daily_vedic_subscription_active', 'true');
            }
          }
        }
      } catch (err) {
        console.warn('Could not sync history in HoroscopeTraditionsView:', err);
      }
    };
    syncStatus();
    return () => {
      isCancelled = true;
    };
  }, [profile?.id, profile?.isPremium, isPremiumUser]);

  const loadImageBase64 = (url: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width || 400;
          canvas.height = img.naturalHeight || img.height || 400;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
            return;
          }
        } catch {
          // Ignore canvas security errors
        }
        resolve(null);
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  };

  const traditionsList: {
    id: HoroscopeTradition;
    name: string;
    tag: string;
    description: string;
  }[] = [
    {
      id: 'parashari',
      name: t('birthChart.nav.tradition_names.parashari', 'Parashari Jyotish'),
      tag: t('birthChart.nav.tradition_tags.parashari', 'Brihat Parashara Hora Shastra'),
      description: t('birthChart.nav.tradition_descriptions.parashari', 'Classical foundational system analyzing bhavas, planetary dignities, Vimshottari dasha cycles, and kendra-trikona auspicious yogas.'),
    },
    {
      id: 'jaimini',
      name: t('birthChart.nav.tradition_names.jaimini', 'Jaimini Sutras'),
      tag: t('birthChart.nav.tradition_tags.jaimini', 'Chara Karakas & Sign Aspects'),
      description: t('birthChart.nav.tradition_descriptions.jaimini', 'Sign-based aspects, Chara Karakas (Atmakaraka, Amatyakaraka), and unique padha lagna karmic timing.'),
    },
    {
      id: 'lal_kitab',
      name: t('birthChart.nav.tradition_names.lal_kitab', 'Lal Kitab'),
      tag: t('birthChart.nav.tradition_tags.lal_kitab', 'Planetary Debts & Practical Upayas'),
      description: t('birthChart.nav.tradition_descriptions.lal_kitab', 'Karmic planetary debts (Rina), blind planets, sleeping houses, and practical, non-ritualistic remedial measures.'),
    },
    {
      id: 'kp_system',
      name: t('birthChart.nav.tradition_names.kp_system', 'KP System'),
      tag: t('birthChart.nav.tradition_tags.kp_system', 'Krishnamurti Padhdhati Sub-Lords'),
      description: t('birthChart.nav.tradition_descriptions.kp_system', 'Precision timing through 249 sub-lords, ruling planets, and stellar nakshatra-sub lord significations.'),
    },
    {
      id: 'bhrigu_nadi',
      name: t('birthChart.nav.tradition_names.bhrigu_nadi', 'Bhrigu Nadi'),
      tag: t('birthChart.nav.tradition_tags.bhrigu_nadi', 'Nandi Nadi Planetary Combinations'),
      description: t('birthChart.nav.tradition_descriptions.bhrigu_nadi', 'Ancient palm-leaf revelation focusing on planetary conjunctions, past-life karma, and soul destiny.'),
    },
  ];

  const handleGenerateAIInterpretation = async () => {
    setIsLoadingAi(true);

    try {
      const data = await api.post<any>(
        API_ENDPOINTS.BIRTH_CHART.INTERPRET,
        {
          profile,
          tradition,
          chartData,
          numerology,
          language: i18n.language || language || 'en',
        }
      );

      if (data && data.interpretation) {
        setAiInterpretation(data.interpretation);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const clean = text.replace(/[#*`_>-]/g, ' ');

    const utterance =
      new SpeechSynthesisUtterance(clean);

    utterance.rate = 0.95;

    utterance.onend = () =>
      setIsPlayingAudio(false);

    setIsPlayingAudio(true);

    window.speechSynthesis.speak(utterance);
  };

  const cleanAiInterpretation = (rawText: string | null): string => {
    if (!rawText) return '';
    return rawText
      // Strip lines that are just hashes, dashes, or asterisks
      .replace(/^[\s#*_-]+$/gm, '')
      // Standardize section headers by stripping leading hashes and emojis so ReactMarkdown parses cleanly
      .replace(/^#{1,6}\s*(?:[🌟🪐✨💫🔮🌙☀️]|\u2728|\u2B50)?\s*/gmu, '### ')
      // Strip any unwanted parenthetical translation blocks like "(In fluent Bengali script: ...)"
      .replace(/\s*\([^)​]*[\u0980-\u09FF]+[^)]*\)\s*/g, '')
      .replace(/\s*\(In (?:fluent )?[A-Za-z\s]+script:[^)]*\)\s*/gi, '')
      .trim();
  };

  const parsedSynthesis = useMemo<SynthesisResponse | null>(() => {
    return parseSynthesisOutput(aiInterpretation, currentLang);
  }, [aiInterpretation, currentLang]);

  // Comprehensive 5 Vedic Traditions & Birth Chart PDF Report Generator
  const handleDownloadTraditionsPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const pName = profile?.fullName || 'Seeker';
      const safeName = pName.replace(/\s+/g, '_');
      const dateStr = profile?.birthDate || new Date().toISOString().split('T')[0];
      const lang = i18n.language || 'en';
      const fileName = `AstroJunction_BirthChart_${tradition}_${safeName}_${dateStr}_${lang}.pdf`;

      await api.downloadFile(API_ENDPOINTS.BIRTH_CHART.GENERATE_PDF, fileName, {
        method: 'POST',
        body: JSON.stringify({
          lang,
          profile,
          chartData,
          tradition,
          traditionSynthesis: aiInterpretation,
          labels: {
            'birthChart.pdf.report_title': t('birthChart.pdf.report_title', 'VEDIC BIRTH CHART & NATAL ANALYSIS'),
          }
        }),
      });
    } catch (err: any) {
      console.error('Failed to generate birth chart traditions PDF:', err);
      alert(err?.message || 'Failed to generate PDF report. Please ensure the backend server is reachable.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // --------------------------------------------------
  // NORTH INDIAN CHART
  // --------------------------------------------------

  const renderNorthIndianChart = () => {
    return (
      <div className="relative w-full max-w-[380px] aspect-square mx-auto bg-[#08080A] rounded-xl border border-[#C9A050]/40 p-1 shadow-2xl select-none">
        <svg
          viewBox="0 0 300 300"
          className="w-full h-full text-[#C9A050] stroke-[#C9A050]/60 stroke-[1.5]"
        >
          <rect
            x="5"
            y="5"
            width="290"
            height="290"
            fill="none"
            className="stroke-[#C9A050]/80 stroke-2"
          />

          <line
            x1="5"
            y1="5"
            x2="295"
            y2="295"
          />

          <line
            x1="295"
            y1="5"
            x2="5"
            y2="295"
          />

          <line
            x1="150"
            y1="5"
            x2="5"
            y2="150"
          />

          <line
            x1="5"
            y1="150"
            x2="150"
            y2="295"
          />

          <line
            x1="150"
            y1="295"
            x2="295"
            y2="150"
          />

          <line
            x1="295"
            y1="150"
            x2="150"
            y2="5"
          />
        </svg>

        {/* House 1 */}

        <div
          onClick={() =>
            setSelectedHouse(chartData.houses[0])
          }
          className={`absolute top-[18%] left-[32%] w-[36%] h-[26%] flex flex-col items-center justify-center cursor-pointer rounded transition p-1 ${
            selectedHouse?.houseNumber === 1
              ? 'bg-[#C9A050]/20 ring-1 ring-[#C9A050]'
              : 'hover:bg-[#C9A050]/10'
          }`}
        >
          <span className="text-[10px] font-serif font-bold text-[#C9A050]">
            H{formatLocalizedDigits(1, currentLang)} ({formatLocalizedDigits(chartData.houses[0].signIndex + 1, currentLang)})
          </span>

          <span className="text-[9px] text-[#9E9A90]">
            {getLagnaAbbreviation(chartData.ascendant.signName, currentLang)}
          </span>

          <div className="flex flex-wrap gap-0.5 justify-center mt-0.5">
            {chartData.houses[0].planets.map((p) => (
              <PlanetBadge
                key={p.id}
                p={p}
                isDiamond
              />
            ))}
          </div>
        </div>

        {/* House 2 */}

        <div
          onClick={() =>
            setSelectedHouse(chartData.houses[1])
          }
          className={`absolute top-[4%] left-[6%] w-[26%] h-[22%] flex flex-col items-center justify-center cursor-pointer rounded transition ${
            selectedHouse?.houseNumber === 2
              ? 'bg-[#C9A050]/20 ring-1 ring-[#C9A050]'
              : 'hover:bg-[#C9A050]/10'
          }`}
        >
          <span className="text-[9px] font-serif font-bold text-[#E5E1D8]">
            H2 ({chartData.houses[1].signIndex + 1})
          </span>

          <div className="flex flex-wrap gap-0.5 justify-center">
            {chartData.houses[1].planets.map((p) => (
              <PlanetBadge
                key={p.id}
                p={p}
              />
            ))}
          </div>
        </div>

        {/* House 3 */}

        <div
          onClick={() =>
            setSelectedHouse(chartData.houses[2])
          }
          className={`absolute top-[26%] left-[4%] w-[22%] h-[26%] flex flex-col items-center justify-center cursor-pointer rounded transition ${
            selectedHouse?.houseNumber === 3
              ? 'bg-[#C9A050]/20 ring-1 ring-[#C9A050]'
              : 'hover:bg-[#C9A050]/10'
          }`}
        >
          <span className="text-[9px] font-serif font-bold text-[#E5E1D8]">
            H3 ({chartData.houses[2].signIndex + 1})
          </span>

          <div className="flex flex-wrap gap-0.5 justify-center">
            {chartData.houses[2].planets.map((p) => (
              <PlanetBadge
                key={p.id}
                p={p}
              />
            ))}
          </div>
        </div>

        {/* House 4 */}

        <div
          onClick={() =>
            setSelectedHouse(chartData.houses[3])
          }
          className={`absolute top-[38%] left-[16%] w-[26%] h-[26%] flex flex-col items-center justify-center cursor-pointer rounded transition ${
            selectedHouse?.houseNumber === 4
              ? 'bg-[#C9A050]/20 ring-1 ring-[#C9A050]'
              : 'hover:bg-[#C9A050]/10'
          }`}
        >
          <span className="text-[10px] font-serif font-bold text-[#C9A050]">
            H4 ({chartData.houses[3].signIndex + 1})
          </span>

          <div className="flex flex-wrap gap-0.5 justify-center">
            {chartData.houses[3].planets.map((p) => (
              <PlanetBadge
                key={p.id}
                p={p}
                isDiamond
              />
            ))}
          </div>
        </div>

        {/* House 5 */}

        <div
          onClick={() =>
            setSelectedHouse(chartData.houses[4])
          }
          className={`absolute top-[58%] left-[4%] w-[22%] h-[26%] flex flex-col items-center justify-center cursor-pointer rounded transition ${
            selectedHouse?.houseNumber === 5
              ? 'bg-[#C9A050]/20 ring-1 ring-[#C9A050]'
              : 'hover:bg-[#C9A050]/10'
          }`}
        >
          <span className="text-[9px] font-serif font-bold text-[#E5E1D8]">
            H5 ({chartData.houses[4].signIndex + 1})
          </span>

          <div className="flex flex-wrap gap-0.5 justify-center">
            {chartData.houses[4].planets.map((p) => (
              <PlanetBadge
                key={p.id}
                p={p}
              />
            ))}
          </div>
        </div>

        {/* House 6 */}

        <div
          onClick={() =>
            setSelectedHouse(chartData.houses[5])
          }
          className={`absolute bottom-[4%] left-[6%] w-[26%] h-[22%] flex flex-col items-center justify-center cursor-pointer rounded transition ${
            selectedHouse?.houseNumber === 6
              ? 'bg-[#C9A050]/20 ring-1 ring-[#C9A050]'
              : 'hover:bg-[#C9A050]/10'
          }`}
        >
          <span className="text-[9px] font-serif font-bold text-[#E5E1D8]">
            H6 ({chartData.houses[5].signIndex + 1})
          </span>

          <div className="flex flex-wrap gap-0.5 justify-center">
            {chartData.houses[5].planets.map((p) => (
              <PlanetBadge
                key={p.id}
                p={p}
              />
            ))}
          </div>
        </div>

        {/* House 7 */}

        <div
          onClick={() =>
            setSelectedHouse(chartData.houses[6])
          }
          className={`absolute bottom-[16%] left-[32%] w-[36%] h-[26%] flex flex-col items-center justify-center cursor-pointer rounded transition ${
            selectedHouse?.houseNumber === 7
              ? 'bg-[#C9A050]/20 ring-1 ring-[#C9A050]'
              : 'hover:bg-[#C9A050]/10'
          }`}
        >
          <span className="text-[10px] font-serif font-bold text-[#C9A050]">
            H7 ({chartData.houses[6].signIndex + 1})
          </span>

          <div className="flex flex-wrap gap-0.5 justify-center">
            {chartData.houses[6].planets.map((p) => (
              <PlanetBadge
                key={p.id}
                p={p}
                isDiamond
              />
            ))}
          </div>
        </div>

        {/* House 8 */}

        <div
          onClick={() =>
            setSelectedHouse(chartData.houses[7])
          }
          className={`absolute bottom-[4%] right-[6%] w-[26%] h-[22%] flex flex-col items-center justify-center cursor-pointer rounded transition ${
            selectedHouse?.houseNumber === 8
              ? 'bg-[#C9A050]/20 ring-1 ring-[#C9A050]'
              : 'hover:bg-[#C9A050]/10'
          }`}
        >
          <span className="text-[9px] font-serif font-bold text-[#E5E1D8]">
            H8 ({chartData.houses[7].signIndex + 1})
          </span>

          <div className="flex flex-wrap gap-0.5 justify-center">
            {chartData.houses[7].planets.map((p) => (
              <PlanetBadge
                key={p.id}
                p={p}
              />
            ))}
          </div>
        </div>

        {/* House 9 */}

        <div
          onClick={() =>
            setSelectedHouse(chartData.houses[8])
          }
          className={`absolute top-[58%] right-[4%] w-[22%] h-[26%] flex flex-col items-center justify-center cursor-pointer rounded transition ${
            selectedHouse?.houseNumber === 9
              ? 'bg-[#C9A050]/20 ring-1 ring-[#C9A050]'
              : 'hover:bg-[#C9A050]/10'
          }`}
        >
          <span className="text-[9px] font-serif font-bold text-[#E5E1D8]">
            H9 ({chartData.houses[8].signIndex + 1})
          </span>

          <div className="flex flex-wrap gap-0.5 justify-center">
            {chartData.houses[8].planets.map((p) => (
              <PlanetBadge
                key={p.id}
                p={p}
              />
            ))}
          </div>
        </div>

        {/* House 10 */}

        <div
          onClick={() =>
            setSelectedHouse(chartData.houses[9])
          }
          className={`absolute top-[38%] right-[16%] w-[26%] h-[26%] flex flex-col items-center justify-center cursor-pointer rounded transition ${
            selectedHouse?.houseNumber === 10
              ? 'bg-[#C9A050]/20 ring-1 ring-[#C9A050]'
              : 'hover:bg-[#C9A050]/10'
          }`}
        >
          <span className="text-[10px] font-serif font-bold text-[#C9A050]">
            H10 ({chartData.houses[9].signIndex + 1})
          </span>

          <div className="flex flex-wrap gap-0.5 justify-center">
            {chartData.houses[9].planets.map((p) => (
              <PlanetBadge
                key={p.id}
                p={p}
                isDiamond
              />
            ))}
          </div>
        </div>

        {/* House 11 */}

        <div
          onClick={() =>
            setSelectedHouse(chartData.houses[10])
          }
          className={`absolute top-[26%] right-[4%] w-[22%] h-[26%] flex flex-col items-center justify-center cursor-pointer rounded transition ${
            selectedHouse?.houseNumber === 11
              ? 'bg-[#C9A050]/20 ring-1 ring-[#C9A050]'
              : 'hover:bg-[#C9A050]/10'
          }`}
        >
          <span className="text-[9px] font-serif font-bold text-[#E5E1D8]">
            H11 ({chartData.houses[10].signIndex + 1})
          </span>

          <div className="flex flex-wrap gap-0.5 justify-center">
            {chartData.houses[10].planets.map((p) => (
              <PlanetBadge
                key={p.id}
                p={p}
              />
            ))}
          </div>
        </div>

        {/* House 12 */}

        <div
          onClick={() =>
            setSelectedHouse(chartData.houses[11])
          }
          className={`absolute top-[4%] right-[6%] w-[26%] h-[22%] flex flex-col items-center justify-center cursor-pointer rounded transition ${
            selectedHouse?.houseNumber === 12
              ? 'bg-[#C9A050]/20 ring-1 ring-[#C9A050]'
              : 'hover:bg-[#C9A050]/10'
          }`}
        >
          <span className="text-[9px] font-serif font-bold text-[#E5E1D8]">
            H12 ({chartData.houses[11].signIndex + 1})
          </span>

          <div className="flex flex-wrap gap-0.5 justify-center">
            {chartData.houses[11].planets.map((p) => (
              <PlanetBadge
                key={p.id}
                p={p}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  // --------------------------------------------------
  // SOUTH INDIAN CHART
  // --------------------------------------------------

  const renderSouthIndianChart = () => {
    const gridSignIndices = [
      [11, 0, 1, 2],
      [10, -1, -1, 3],
      [9, -1, -1, 4],
      [8, 7, 6, 5],
    ];

    return (
      <div className="w-full max-w-[380px] aspect-square mx-auto bg-[#08080A] rounded-xl border border-[#C9A050]/40 p-2 shadow-2xl grid grid-cols-4 grid-rows-4 gap-1 select-none">
        {gridSignIndices.map((row, rIdx) =>
          row.map((signIdx, cIdx) => {
            if (signIdx === -1) {
              if (rIdx === 1 && cIdx === 1) {
                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className="col-span-2 row-span-2 bg-[#141418] border border-[#2A2A2E] rounded-lg flex flex-col items-center justify-center p-2 text-center"
                  >
                    <span className="text-[#C9A050] font-serif font-bold text-xs">
                      South Indian Kundli
                    </span>

                    <span className="text-[10px] text-[#9E9A90] mt-1">
                      Lagna in House 1 (
                      {chartData.ascendant.signName})
                    </span>

                    <span className="text-[9px] text-[#C9A050]/80 mt-1 font-mono">
                      12 Fixed Rashis Matrix
                    </span>
                  </div>
                );
              }

              return null;
            }

            const houseMatchingSign =
              chartData.houses.find(
                (h) => h.signIndex === signIdx
              );

            const isLagnaSign =
              chartData.ascendant.signIndex === signIdx;

            const planetsInSign =
              chartData.planets.filter(
                (p) => p.signIndex === signIdx
              );

            const isSelected =
              selectedHouse?.signIndex === signIdx;

            return (
              <div
                key={`${rIdx}-${cIdx}`}
                onClick={() =>
                  houseMatchingSign &&
                  setSelectedHouse(houseMatchingSign)
                }
                className={`border rounded p-1 flex flex-col justify-between cursor-pointer transition ${
                  isSelected
                    ? 'border-[#C9A050] bg-[#C9A050]/15'
                    : isLagnaSign
                    ? 'border-[#C9A050]/50 bg-[#141418]'
                    : 'border-[#2A2A2E] bg-[#141418]/60 hover:bg-[#1A1A1E]'
                }`}
              >
                <div className="flex justify-between items-center text-[9px] font-bold">
                  <span
                    className={
                      isLagnaSign
                        ? 'text-[#C9A050]'
                        : 'text-[#9E9A90]'
                    }
                  >
                    {isLagnaSign
                      ? 'ASC/L'
                      : `H${houseMatchingSign?.houseNumber || ''}`}
                  </span>

                  <span className="text-[#9E9A90] font-mono">
                    {signIdx + 1}
                  </span>
                </div>

                <div className="flex flex-wrap gap-0.5 justify-center py-0.5">
                  {planetsInSign.map((p) => (
                    <PlanetBadge
                      key={p.id}
                      p={p}
                      isDiamond
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  // --------------------------------------------------
  // --------------------------------------------------
  // EAST INDIAN CHART (12-Box Perimeter Layout / Surya Chakra)
  // --------------------------------------------------

  const renderEastIndianChart = () => {
    // Standard East Indian (Surya Chakra / Bengali style):
    // 12 outer boxes along the perimeter with a 2x2 center.
    // Fixed Rashis running Counter-Clockwise starting from Aries (Mesha, 0) at top:
    // Row 0: Taurus (1), Aries (0), Pisces (11), Aquarius (10)
    // Row 1: Gemini (2), [Center], [Center], Capricorn (9)
    // Row 2: Cancer (3), [Center], [Center], Sagittarius (8)
    // Row 3: Leo (4), Virgo (5), Libra (6), Scorpio (7)
    const eastGridSignIndices = [
      [1, 0, 11, 10],
      [2, -1, -1, 9],
      [3, -1, -1, 8],
      [4, 5, 6, 7],
    ];

    return (
      <div className="w-full max-w-[380px] aspect-square mx-auto bg-[#08080A] rounded-xl border border-[#C9A050]/40 p-2 shadow-2xl grid grid-cols-4 grid-rows-4 gap-1 select-none">
        {eastGridSignIndices.map((row, rIdx) =>
          row.map((signIdx, cIdx) => {
            if (signIdx === -1) {
              if (rIdx === 1 && cIdx === 1) {
                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className="col-span-2 row-span-2 bg-[#141418] border border-[#C9A050]/30 rounded-lg flex flex-col items-center justify-center p-2 text-center"
                  >
                    <span className="text-[#C9A050] font-serif font-bold text-xs">
                      East Indian Kundli
                    </span>
                    <span className="text-[10px] text-[#9E9A90] mt-1">
                      Lagna: {chartData.ascendant.signName} (H1)
                    </span>
                    <span className="text-[9px] text-[#C9A050]/80 mt-1 font-mono">
                      12 Fixed Rashis (Anti-Clockwise)
                    </span>
                  </div>
                );
              }
              return null;
            }

            const houseMatchingSign = chartData.houses.find(
              (h) => h.signIndex === signIdx
            );

            const isLagnaSign =
              chartData.ascendant.signIndex === signIdx;

            const planetsInSign = chartData.planets.filter(
              (p) => p.signIndex === signIdx
            );

            const isSelected =
              selectedHouse?.signIndex === signIdx;

            return (
              <div
                key={`${rIdx}-${cIdx}`}
                onClick={() =>
                  houseMatchingSign && setSelectedHouse(houseMatchingSign)
                }
                className={`border rounded p-1 flex flex-col justify-between cursor-pointer transition ${
                  isSelected
                    ? 'border-[#C9A050] bg-[#C9A050]/15'
                    : isLagnaSign
                    ? 'border-[#C9A050]/60 bg-[#C9A050]/10'
                    : 'border-[#2A2A2E] bg-[#141418]/60 hover:bg-[#1A1A1E]'
                }`}
              >
                <div className="flex justify-between items-center text-[9px] font-bold">
                  <span
                    className={
                      isLagnaSign ? 'text-[#C9A050]' : 'text-[#9E9A90]'
                    }
                  >
                    {isLagnaSign
                      ? 'ASC/L'
                      : `H${houseMatchingSign?.houseNumber || ''}`}
                  </span>

                  <span className="text-[#C9A050]/80 font-mono text-[8.5px]">
                    {signIdx + 1}
                  </span>
                </div>

                <div className="flex flex-wrap gap-0.5 justify-center py-0.5">
                  {planetsInSign.map((p) => (
                    <PlanetBadge
                      key={p.id}
                      p={p}
                      isDiamond
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#2A2A2E]">
          <div>
            <div className={`flex flex-wrap items-center gap-2 text-xs font-semibold text-[#C9A050] mb-1 ${['hi', 'bn', 'ta'].includes(currentLang) ? 'normal-case tracking-normal' : 'tracking-widest uppercase'}`}>

              <span className="flex items-center space-x-1.5">
                <Compass className="w-4 h-4" />
                <span>
                  {profile.horoscopeSystem === 'western'
                    ? t('birthChart.nav.system_western', 'Western Tropical (Sayana) Horoscope Engine')
                    : t('birthChart.nav.system_vedic', 'Vedic Sidereal (Nirayana) Jyotish Engine')}
                </span>
              </span>

              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1A1A1E] text-[#9E9A90] border border-[#2A2A2E] normal-case tracking-normal">
                {profile.horoscopeSystem === 'western'
                  ? 'Equinox-Aligned • Ayanamsha: +23.86° Tropical Shift'
                  : t('birthChart.nav.ayanamsha_subtitle', 'Lahiri Ayanamsha (~24°) • 27 Nakshatras')}
              </span>
            </div>

            <h1 className="astro-page-header-title">
              {profile.horoscopeSystem === 'western'
                ? t('birthChart.nav.title_western', 'Western & Multi-Tradition Astrological Synthesis')
                : t('birthChart.nav.title', 'Vedic Birth Chart & Multi-Tradition Synthesis')}
            </h1>

            <p className="text-xs text-[#9E9A90] mt-1 leading-relaxed">
              {t('birthChart.nav.subtitle', {
                name: profile.fullName,
                defaultValue: `Synthesizing ${profile.fullName}'s profile across Parashari, Jaimini, Lal Kitab, KP System, and Bhrigu Nadi methodologies.`
              })}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto shrink-0">
            <button
              onClick={() => onNavigateToTab?.('roadmap')}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border text-xs font-bold transition shadow-md cursor-pointer w-full sm:w-auto ${
                theme === 'dark'
                  ? 'bg-[#1A1A1E] hover:bg-[#222228] text-[#E5E1D8] border-[#C9A050]/50 hover:border-[#C9A050] hover:text-[#C9A050] shadow-sm'
                  : 'bg-white hover:bg-[#FAF6F0] text-[#7A5A1A] border-[#C9A050]/60 hover:border-[#C9A050] shadow-sm'
              }`}
              title={t('birthChart.nav.roadmap_button', '25-Year Roadmap')}
            >
              <Milestone className="w-4 h-4 text-[#C9A050]" />
              <span>{t('birthChart.nav.roadmap_button', '25-Year Roadmap')}</span>
            </button>

            <button
              onClick={handleDownloadTraditionsPdf}
              disabled={isGeneratingPdf}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border text-xs font-bold transition shadow-lg cursor-pointer w-full sm:w-auto ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-[#C9A050] to-[#A07828] hover:from-[#D4AF37] hover:to-[#B38730] text-[#0D0D0F] border-[#C9A050] shadow-[#C9A050]/20'
                  : 'bg-[#C9A050] hover:bg-[#B38730] text-white border-[#C9A050] shadow-[#C9A050]/20'
              } disabled:opacity-50`}
              title={t('birthChart.nav.download_pdf', 'Download full birth chart traditions PDF report')}
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{isGeneratingPdf ? t('birthChart.nav.generating_pdf', 'Generating PDF...') : t('birthChart.nav.download_pdf', 'Download Report (PDF)')}</span>
            </button>
          </div>
        </div>

        {/* TRADITIONS */}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-5">
          {traditionsList.map((traditionItem) => {
            const isActive =
              tradition === traditionItem.id;

            return (
              <button
                key={traditionItem.id}
                onClick={() =>
                  setTradition(traditionItem.id)
                }
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'bg-[#1A1A1E] border-[#C9A050] shadow-md shadow-[#C9A050]/10'
                    : 'bg-[#141418] border-[#2A2A2E] hover:border-[#C9A050]/40 text-[#9E9A90]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-serif font-bold ${
                        isActive
                          ? 'text-[#C9A050]'
                          : 'text-[#F0ECE1]'
                      }`}
                    >
                      {traditionItem.name}
                    </span>

                    {isActive && (
                      <CheckCircle className="w-3.5 h-3.5 text-[#C9A050]" />
                    )}
                  </div>

                  <span className="text-[10px] text-[#C9A050]/80 font-mono block mt-0.5">
                    {traditionItem.tag}
                  </span>
                </div>

                <p className="text-[11px] text-[#9E9A90] mt-2 line-clamp-2 leading-relaxed">
                  {traditionItem.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN GRID (2 COLUMNS ON DESKTOPS, STACKED COMFORTABLY ON TABLETS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-5 text-[#E5E1D8] shadow-xl flex flex-col items-center">
            <div className="w-full pb-3 mb-3 border-b border-[#2A2A2E] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-serif font-semibold text-[#C9A050] flex items-center space-x-1.5">
                  <Layers className="w-4 h-4" />

                  <span>
                    {t('birthChart.chart.click_prompt', 'Click any House to inspect')}
                  </span>
                </span>

                <span className="text-[#9E9A90]">
                  {t('birthChart.chart.lagna', 'Lagna')}: {tVedic('signs', chartData.ascendant.signName, chartData.ascendant.signName)} ({formatLocalizedDigits(chartData.ascendant.degree, currentLang)}°)
                </span>
              </div>

              {/* CHART STYLE */}
              <div className="flex items-center justify-between bg-[#1A1A1E] p-1 rounded-xl border border-[#2A2A2E]">
                <span className="text-[11px] text-[#9E9A90] px-2 font-medium">
                  {t('birthChart.chart.style_label', 'Chart Style:')}
                </span>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() =>
                      setChartStyle('north_indian')
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition cursor-pointer ${
                      chartStyle === 'north_indian'
                        ? 'bg-[#C9A050] text-[#0D0D0F] shadow'
                        : 'text-[#9E9A90] hover:text-white'
                    }`}
                  >
                    {t('birthChart.chart.style_north', 'North Indian')}
                  </button>

                  <button
                    onClick={() =>
                      setChartStyle('south_indian')
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition cursor-pointer ${
                      chartStyle === 'south_indian'
                        ? 'bg-[#C9A050] text-[#0D0D0F] shadow'
                        : 'text-[#9E9A90] hover:text-white'
                    }`}
                  >
                    {t('birthChart.chart.style_south', 'South Indian')}
                  </button>

                  <button
                    onClick={() =>
                      setChartStyle('east_indian')
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition cursor-pointer ${
                      chartStyle === 'east_indian'
                        ? 'bg-[#C9A050] text-[#0D0D0F] shadow'
                        : 'text-[#9E9A90] hover:text-white'
                    }`}
                  >
                    {t('birthChart.chart.style_east', 'East Indian')}
                  </button>
                </div>
              </div>
            </div>

            {chartStyle === 'north_indian' &&
              renderNorthIndianChart()}

            {chartStyle === 'south_indian' &&
              renderSouthIndianChart()}

            {chartStyle === 'east_indian' &&
              renderEastIndianChart()}

            <p className="text-[11px] text-[#9E9A90] mt-4 text-center">
              {t('birthChart.chart.footer_caption', 'Houses indicate life domains (Bhavas). Badges show planetary placements and conjunctions.')}
            </p>
          </div>

          {/* SELECTED HOUSE */}

          {selectedHouse && (
            <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-5 text-[#E5E1D8] shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2E]">
                <div className="flex items-center space-x-2">
                  <span className="w-7 h-7 rounded-lg bg-[#C9A050]/20 text-[#C9A050] font-serif font-bold text-xs flex items-center justify-center border border-[#C9A050]/30">
                    {formatLocalizedDigits(selectedHouse.houseNumber, currentLang)}
                  </span>

                  <div>
                    <h3 className="text-sm font-serif font-bold text-[#F0ECE1]">
                      {t('birthChart.houses.house_' + selectedHouse.houseNumber + '.title', selectedHouse.sanskritName)}
                    </h3>

                    <span className="text-[11px] text-[#9E9A90]">
                      {t('birthChart.chart.sign', 'Sign')}: {tVedic('signs', selectedHouse.signName, selectedHouse.signName)} (
                      {selectedHouse.signSanskrit}) • {t('birthChart.houses.house_' + selectedHouse.houseNumber + '.lord', 'Lord: ' + selectedHouse.signLord)}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] px-2 py-0.5 rounded bg-[#1A1A1E] text-[#C9A050] font-medium border border-[#2A2A2E]">
                  {t('birthChart.chart.planets_in_house', { count: formatLocalizedDigits(selectedHouse.planets.length, currentLang), defaultValue: `${selectedHouse.planets.length} Planets` })}
                </span>
              </div>

              <div className="mt-3 space-y-2 text-xs font-sans">
                <div>
                  <span className="text-[9px] uppercase font-bold text-[#9E9A90] tracking-wider">
                    {t('birthChart.chart.significance', 'Significance')}
                  </span>

                  <p className="text-[#E5E1D8] mt-0.5 leading-relaxed">
                    {t('birthChart.houses.house_' + selectedHouse.houseNumber + '.significance', selectedHouse.significance)}
                  </p>
                </div>

                {tradition === 'kp_system' && (
                  <div className="p-2.5 bg-[#1A1A1E] rounded-lg border border-[#2A2A2E] flex justify-between">
                    <span>
                      {t('birthChart.traditions_analysis.kp_sublord', 'KP Cuspal Sub-Lord:')}{' '}
                      <strong className="text-[#C9A050]">
                        {tVedic('planets', selectedHouse.kpSubLord, selectedHouse.kpSubLord)}
                      </strong>
                    </span>

                    <span>
                      {t('birthChart.traditions_analysis.star_lord', 'Star Lord:')}{' '}
                      <strong className="text-[#C9A050]">
                        {tVedic('planets', selectedHouse.kpStarLord, selectedHouse.kpStarLord)}
                      </strong>
                    </span>
                  </div>
                )}

                {tradition === 'lal_kitab' && (
                  <div className="p-2.5 bg-[#1A1A1E] rounded-lg border border-[#2A2A2E]">
                    <span className="text-[11px] text-[#9E9A90]">
                      {t('birthChart.traditions_analysis.lal_kitab_state', 'Lal Kitab Farman State:')}
                    </span>

                    <p className="text-[#C9A050] font-semibold text-xs mt-0.5">
                      {selectedHouse.lalKitabState}
                    </p>
                  </div>
                )}

                {selectedHouse.planets.length > 0 && (
                  <div>
                    <span className="text-[9px] uppercase font-bold text-[#9E9A90] tracking-wider">
                      {t('birthChart.chart.occupying_grahas', 'Occupying Grahas')}
                    </span>

                    <div className="grid grid-cols-1 gap-1.5 mt-1">
                      {selectedHouse.planets.map((p) => (
                        <div
                          key={p.id}
                          onClick={() =>
                            setSelectedPlanet(p)
                          }
                          className="p-2 bg-[#1A1A1E] rounded-lg border border-[#2A2A2E] flex items-center justify-between cursor-pointer hover:border-[#C9A050]/50"
                        >
                          <span className="font-semibold text-[#C9A050]">
                            {p.sanskritName} ({tVedic('planets', p.name, p.name)})
                          </span>

                          <span className="text-[11px] text-[#9E9A90]">
                            {formatLocalizedDigits(p.degree, currentLang)}° in {tVedic('nakshatras', p.nakshatra, p.nakshatra)} ({t('birthChart.planets_table.dignities.' + getDignityKey(p.dignity), p.dignity)})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* YOGAS & DOSHAS (Moved to Left Column for perfect balanced layout) */}
          <div className="grid grid-cols-1 gap-4">
            {/* YOGAS */}
            <div className={`${
              isDark ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-[#FFFDF7] border-[#DECFA6] text-[#1E1B15]'
            } border rounded-2xl p-5 shadow-sm space-y-3`}>
              <div className={`flex items-center space-x-2 text-[#C9A050] font-serif font-bold text-xs pb-2 border-b ${
                isDark ? 'border-[#2A2A2E]' : 'border-[#DECFA6]/60'
              }`}>
                <Sparkles className="w-4 h-4" />
                <span>
                  {t('birthChart.yogas_doshas.yogas_title', t('birthChart.yogas.title', 'Detected Auspicious Yogas'))} ({formatLocalizedDigits(chartData.yogas.length, currentLang)})
                </span>
              </div>

              <div className="space-y-2">
                {chartData.yogas.map((y) => {
                  const yogaId = getCanonicalYogaId(y.name);
                  const yogaName = t('birthChart.yogas_doshas.yogas.' + yogaId + '.name', y.name);
                  const yogaType = t('birthChart.yogas_doshas.yogas.' + yogaId + '.type', t('birthChart.yogas_doshas.auspicious', y.type || 'Auspicious'));
                  const yogaDesc = t('birthChart.yogas_doshas.yogas.' + yogaId + '.effect', t('birthChart.yogas_doshas.yogas.' + yogaId + '.desc', y.effect));
                  return (
                    <div
                      key={y.id}
                      className={`p-3 rounded-xl border ${
                        isDark ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#FAF7F0] border-[#DECFA6]'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-serif font-bold text-[#C9A050]">
                          {yogaName}
                        </h4>

                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#C9A050]/15 text-[#C9A050] font-sans">
                          {yogaType}
                        </span>
                      </div>

                      <p className={`text-[11px] mt-1 leading-relaxed font-sans ${
                        isDark ? 'text-[#9E9A90]' : 'text-[#6E6452]'
                      }`}>
                        {yogaDesc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DOSHAS */}
            <div className={`${
              isDark ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-[#FFFDF7] border-[#DECFA6] text-[#1E1B15]'
            } border rounded-2xl p-5 shadow-sm space-y-3`}>
              <div className={`flex items-center space-x-2 text-[#C9A050] font-serif font-bold text-xs pb-2 border-b ${
                isDark ? 'border-[#2A2A2E]' : 'border-[#DECFA6]/60'
              }`}>
                <Flame className="w-4 h-4" />
                <span>
                  {t('birthChart.yogas_doshas.doshas_title', t('birthChart.doshas.title', 'Karmic Doshas & Planetary Afflictions'))}
                </span>
              </div>

              <div className="space-y-2">
                {chartData.doshas.map((d) => {
                  const doshaId = getCanonicalDoshaId(d.name);
                  const doshaName = t('birthChart.yogas_doshas.doshas.' + doshaId + '.name', d.name);
                  const doshaDesc = !d.isPresent && doshaId === 'manglik'
                    ? t('birthChart.yogas_doshas.doshas.manglik.no_affliction', d.description)
                    : t('birthChart.yogas_doshas.doshas.' + doshaId + '.effect', t('birthChart.yogas_doshas.doshas.' + doshaId + '.desc', d.description));
                  const severityText = d.isPresent
                    ? t('birthChart.yogas_doshas.severity.' + (d.severity || 'moderate').toLowerCase(), t('birthChart.yogas_doshas.formed', d.severity || 'Present'))
                    : t('birthChart.planets_table.dignities.neutral', t('birthChart.yogas_doshas.not_formed', 'Neutral'));
                  return (
                    <div
                      key={d.id}
                      className={`p-3 rounded-xl border ${
                        isDark ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#FAF7F0] border-[#DECFA6]'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <h4 className={`text-xs font-serif font-bold ${
                          isDark ? 'text-[#F0ECE1]' : 'text-[#1E1B15]'
                        }`}>
                          {doshaName}
                        </h4>

                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold font-sans ${
                            d.isPresent
                              ? 'dignity-badge-severe'
                              : 'dignity-badge-neutral'
                          }`}
                        >
                          {severityText}
                        </span>
                      </div>

                      <p className={`text-[11px] mt-1 leading-relaxed font-sans ${
                        isDark ? 'text-[#9E9A90]' : 'text-[#6E6452]'
                      }`}>
                        {doshaDesc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ASPECTS */}
            {chartData.aspects && chartData.aspects.length > 0 && (
              <div className={`${
                isDark ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-[#FFFDF7] border-[#DECFA6] text-[#1E1B15]'
              } border rounded-2xl p-5 shadow-sm space-y-3`}>
                <div className={`flex items-center justify-between pb-2.5 border-b ${
                  isDark ? 'border-[#2A2A2E]' : 'border-[#DECFA6]/60'
                }`}>
                  <div className="flex items-center space-x-2 text-[#C9A050] font-serif font-bold text-xs sm:text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {t('birthChart.aspects.title', 'Planetary Aspects (Drishti)')}
                    </span>
                  </div>
                  <span className={`text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full font-mono font-semibold ${
                    isDark ? 'bg-[#C9A050]/15 text-[#C9A050] border border-[#C9A050]/30' : 'bg-[#FAF4E4] text-[#8C6D23] border border-[#DFC896]'
                  }`}>
                    {formatLocalizedDigits(chartData.aspects.length, currentLang)} {t('birthChart.aspects.drishti_label', 'Drishtis')}
                  </span>
                </div>
                <div className="space-y-2 max-h-[305px] overflow-y-auto pr-1.5 custom-scrollbar">
                  {chartData.aspects.map((asp, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 sm:p-3 rounded-xl border grid grid-cols-3 items-center transition hover:border-[#C9A050]/40 ${
                        isDark ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#FAF7F0] border-[#DECFA6]'
                      }`}
                    >
                      <span className={`text-xs font-bold uppercase text-left tracking-wide truncate ${
                        isDark ? 'text-[#E5E1D8]' : 'text-[#2C2825]'
                      }`}>
                        {tVedic('planets', asp.aspectingPlanet, asp.aspectingPlanet)}
                      </span>
                      <span className="text-[10px] font-bold text-[#C9A050] bg-[#C9A050]/15 border border-[#C9A050]/30 px-2.5 py-0.5 rounded-full justify-self-center text-center whitespace-nowrap">
                        {t('birthChart.aspects.drishti_' + (asp.aspectType.replace(/[^0-9]/g, '') || 'special'), asp.aspectType)}
                      </span>
                      <span className="text-xs text-[#C9A050] font-bold uppercase text-right tracking-wide truncate">
                        {tVedic('planets', asp.aspectedPlanet, asp.aspectedPlanet)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-7 space-y-6">
          {/* PLANETARY TABLE */}

          <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl overflow-x-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#2A2A2E] mb-4">
              <div>
                <h3 className="text-base font-serif font-bold text-[#F0ECE1]">
                  {t('birthChart.planets_table.title', 'Sidereal Planetary Positions (Graha Spashta)')}
                </h3>

                <p className="text-xs text-[#9E9A90]">
                  {t('birthChart.planets_table.subtitle', 'Lahiri Ayanamsha • Click a planet for remedies & karakas')}
                </p>
              </div>

              <span className="text-[10px] px-2 py-0.5 bg-[#C9A050]/15 text-[#C9A050] rounded font-semibold border border-[#C9A050]/30 font-mono">
                {formatLocalizedDigits(chartData.planets.length, currentLang)} {t('birthChart.planets_table.grahas_label', 'Grahas')}
              </span>
            </div>

            <table className="w-full min-w-[520px] text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-[#2A2A2E] text-[#9E9A90] font-semibold">
                  <th className="pb-2.5 pl-3 pr-2">{t('birthChart.planets_table.th_planet', 'Planet')}</th>
                  <th className="pb-2.5 px-2">{t('birthChart.planets_table.th_sign', 'Sign (Rashi)')}</th>
                  <th className="pb-2.5 px-2">{t('birthChart.planets_table.th_degree', 'Degree')}</th>
                  <th className="pb-2.5 px-2">{t('birthChart.planets_table.th_nakshatra', 'Nakshatra & Pada')}</th>
                  <th className="pb-2.5 px-2">{t('birthChart.planets_table.th_dignity', 'Dignity')}</th>
                  {tradition === 'jaimini' && (
                    <th className="pb-2.5 px-2">{t('birthChart.traditions_analysis.chara_karaka', 'Chara Karaka')}</th>
                  )}
                  {tradition === 'kp_system' && (
                    <>
                      <th className="pb-2.5 px-2 text-[#C9A050]">{t('birthChart.traditions_analysis.star_lord', 'Star Lord')}</th>
                      <th className="pb-2.5 px-2 text-[#9E9A90]">{t('birthChart.traditions_analysis.sub_lord', 'Sub-Lord')}</th>
                    </>
                  )}
                  <th className="pb-2.5 pr-3 pl-2">{t('birthChart.remedies.gemstone_label', 'Gemstone')}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#2A2A2E]/60">
                {chartData.planets.map((p) => {
                  const isSelected = selectedPlanet?.id === p.id;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedPlanet(p)}
                      className={`hover:bg-[#1A1A1E] transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#C9A050]/15 font-semibold text-[#C9A050]'
                          : 'text-[#E5E1D8]'
                      }`}
                    >
                      <td className="py-2.5 pl-3 pr-2 flex items-center space-x-2 font-medium text-[#F0ECE1]">
                        <span className="text-sm sm:text-base text-[#C9A050] w-4 text-center shrink-0 inline-block">
                          {p.symbol}
                        </span>
                        <span className="whitespace-nowrap">{tVedic('planets', p.name, p.name)}</span>
                        {p.isRetrograde && (
                          <span className="text-[10px] text-[#C9A050] font-bold shrink-0">
                            (R)
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-2 whitespace-nowrap">
                        {tVedic('signs', p.signName, p.signName)}
                      </td>

                      <td className="py-2.5 px-2 font-mono whitespace-nowrap">
                        {formatLocalizedDigits(p.degree, currentLang)}°
                      </td>

                      <td className="py-2.5 px-2 text-[#9E9A90] whitespace-nowrap">
                        {tVedic('nakshatras', p.nakshatra, p.nakshatra)} ({t('birthChart.chart.pada', 'P')}{formatLocalizedDigits(p.pada, currentLang)})
                      </td>

                      <td className="py-2.5 px-2 whitespace-nowrap">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            p.dignity === 'Exalted'
                              ? 'dignity-badge-neutral'
                              : p.dignity === 'Own'
                              ? 'dignity-badge-own'
                              : p.dignity === 'Debilitated'
                              ? 'dignity-badge-debilitated'
                              : 'dignity-badge-neutral'
                          }`}
                        >
                          {t('birthChart.planets_table.dignities.' + getDignityKey(p.dignity), p.dignity)}
                        </span>
                      </td>

                      {tradition === 'jaimini' && (
                        <td className="py-2.5 px-2 text-[#C9A050] font-medium font-serif whitespace-nowrap">
                          {p.karaka ? t('birthChart.traditions_analysis.chara_karakas.' + (p.karaka || '').toLowerCase(), p.karaka) : '-'}
                        </td>
                      )}

                      {tradition === 'kp_system' && (
                        <>
                          <td className="py-2.5 px-2 whitespace-nowrap">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#C9A050]/15 text-[#C9A050] border border-[#C9A050]/30">
                              {tVedic('planets', p.nakshatraLord, p.nakshatraLord)}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 whitespace-nowrap">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#9E9A90]/10 text-[#9E9A90] border border-[#9E9A90]/30">
                              {p.kpSubLord ? tVedic('planets', p.kpSubLord, p.kpSubLord) : '-'}
                            </span>
                          </td>
                        </>
                      )}

                      <td className="py-2.5 pr-3 pl-2 text-[11px] text-[#9E9A90] whitespace-nowrap">
                        {tVedic('gems', getGemstoneKey(p.gemstone, p.id), p.gemstone)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* DASHA */}

          <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2E] mb-4">
              <div>
                <h3 className="text-base font-serif font-bold text-[#F0ECE1]">
                  {t('birthChart.dashas.title', 'Vimshottari Mahadasha Timeline')} ({formatLocalizedDigits(120, currentLang)} {t('birthChart.dashas.years_label', 'Years')})
                </h3>

                <p className="text-xs text-[#9E9A90]">
                  {t('birthChart.dashas.subtitle', 'Calculated from Moon’s natal Nakshatra degree')}
                </p>
              </div>

              <span className="text-xs text-[#C9A050] font-semibold">
                {t('birthChart.dashas.active_now', 'Active:')} {tVedic('planets', (chartData.dashas.find(d => d.isCurrent)?.planet || 'Jupiter'), (chartData.dashas.find(d => d.isCurrent)?.planet || 'Jupiter'))} {t('birthChart.dashas.mahadasha', 'Mahadasha')}
              </span>
            </div>

            <div className="space-y-2.5 font-sans">
              {chartData.dashas.map((d) => (
                <div
                  key={d.planet}
                  className={`p-3 rounded-xl border transition ${
                    d.isCurrent
                      ? 'bg-[#1A1A1E] border-[#C9A050] shadow-md'
                      : 'bg-[#141418]/60 border-[#2A2A2E] text-[#9E9A90]'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`font-bold ${
                          d.isCurrent
                            ? 'text-[#C9A050] text-sm font-serif'
                            : 'text-[#E5E1D8]'
                        }`}
                      >
                        {tVedic('planets', d.planet, d.planet)} ({d.sanskrit})
                      </span>

                      {d.isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-[#C9A050] text-[#0D0D0F] font-bold text-[9px] uppercase tracking-wider">
                          {t('birthChart.dashas.active_badge', 'ACTIVE DASHA')}
                        </span>
                      )}
                    </div>

                    <span className="font-mono text-[#9E9A90] text-[11px]">
                      {formatLocalizedDigits(d.startDate.slice(0, 4), currentLang)} –{' '}
                      {formatLocalizedDigits(d.endDate.slice(0, 4), currentLang)} (
                      {formatLocalizedDigits(d.durationYears, currentLang)} {t('birthChart.dashas.years_label', 'Years')})
                    </span>
                  </div>

                  {d.isCurrent && d.subPeriods && (
                    <div className="mt-3 pt-3 border-t border-[#2A2A2E]">
                      <span className="text-[9px] uppercase font-bold text-[#C9A050] block mb-1.5 tracking-wider">
                        {t('birthChart.dashas.active_antardashas', 'Active Antardashas (Sub-Periods)')}
                      </span>

                      <div className="flex flex-wrap gap-1.5">
                        {d.subPeriods
                          .slice(0, 6)
                          .map((sub) => {
                            const locTag = currentLang === 'hi' ? 'hi-IN' : currentLang === 'bn' ? 'bn-BD' : currentLang === 'ta' ? 'ta-IN' : currentLang === 'fr' ? 'fr-FR' : 'en-US';
                            const startFormatted = formatLocalizedDigits(new Date(sub.startDate).toLocaleDateString(locTag, { month: 'short', year: '2-digit' }), currentLang);
                            const endFormatted = formatLocalizedDigits(new Date(sub.endDate).toLocaleDateString(locTag, { month: 'short', year: '2-digit' }), currentLang);
                            return (
                              <span
                                key={sub.planet}
                                className={`px-2 py-1 rounded text-[11px] border ${
                                  sub.isCurrent
                                    ? 'bg-[#C9A050] text-[#0D0D0F] font-bold border-[#C9A050]'
                                    : 'bg-[#1A1A1E] text-[#E5E1D8] border-[#2A2A2E]'
                                }`}
                              >
                                {tVedic('planets', sub.planet, sub.planet)} ({startFormatted} - {endFormatted})
                              </span>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* GEMSTONES (Favorable Gemstones placed in right column to balance layout) */}
          {chartData.gemstones && chartData.gemstones.length > 0 && (
            <div className={`${
              isDark
                ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8]'
                : 'bg-[#FFFDF7] border-[#DECFA6] text-[#1E1B15]'
            } border rounded-2xl p-6 shadow-md space-y-4`}>
              <div className={`flex items-center justify-between pb-3 border-b ${
                isDark ? 'border-[#2A2A2E]' : 'border-[#DECFA6]/60'
              }`}>
                <div className="flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-[#C9A050]" />
                  <h3 className={`text-sm sm:text-base font-serif font-bold ${
                    isDark ? 'text-[#F0ECE1]' : 'text-[#8C6D23]'
                  }`}>
                    {t('birthChart.remedies.favorable_gemstones', 'Favorable Gemstones (Lagna Based)')}
                  </h3>
                </div>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-semibold ${
                  isDark ? 'bg-[#C9A050]/15 text-[#C9A050] border border-[#C9A050]/30' : 'bg-[#FAF4E4] text-[#8C6D23] border border-[#DFC896]'
                }`}>
                  {t('birthChart.remedies.trikona_upayas', 'Trikona Vedic Upayas')}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {chartData.gemstones.map((g, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition hover:scale-[1.01] ${
                      isDark
                        ? 'bg-[#1A1A1E] border-[#2A2A2E]'
                        : 'bg-[#FAF7F0] border-[#DECFA6]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex justify-between items-start gap-1">
                        <span className={`text-xs sm:text-[13px] font-bold ${
                          isDark ? 'text-[#F0ECE1]' : 'text-[#1E1B15]'
                        }`}>
                          {tVedic('gems', getGemstoneKey(g.gem, g.planet), g.gem)}
                        </span>
                        <span className="text-[10px] font-bold text-[#C9A050] uppercase tracking-wider shrink-0 bg-[#C9A050]/10 px-1.5 py-0.5 rounded">
                          {tVedic('planets', g.planet, g.planet)}
                        </span>
                      </div>
                      <p className={`text-[11px] leading-relaxed pt-1 ${
                        isDark ? 'text-[#9E9A90]' : 'text-[#6E6452]'
                      }`}>
                        {getLocalizedGemPurpose(g.purpose, t)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI COMPREHENSIVE SYNTHESIS (FULL WIDTH ACROSS ENTIRE PAGE) */}
      <div
        id="comprehensive-synthesis-section"
        className={`w-full border rounded-2xl p-6 sm:p-8 shadow-xl space-y-5 transition-colors ${
        isDark
          ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8]'
          : 'bg-[#FFFDF9] border-[#E5E1D8] text-[#1A1A1E]'
      }`}>
        <div className="flex items-center justify-between pb-4 border-b border-[#C9A050]/20 flex-wrap gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className={`text-base sm:text-lg font-serif font-bold flex items-center space-x-2 ${
                isDark ? 'text-[#F0ECE1]' : 'text-gray-900'
              }`}>
                <Sparkles className="w-4 h-4 text-[#C9A050]" />
                <span>
                  {t('birthChart.synthesis.title', {
                    defaultValue: `Comprehensive Vedic Synthesis (${tradition.toUpperCase()})`,
                    tradition: tradition.toUpperCase(),
                  })}
                </span>
              </h3>
              {isPremiumUser ? (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  {t('birthChart.synthesis.unlocked_badge', '✓ UNLOCKED')}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#C9A050]/20 text-[#C9A050] border border-[#C9A050]/40 flex items-center space-x-1">
                  <Lock className="w-2.5 h-2.5" />
                  <span>{t('birthChart.synthesis.premium_badge', 'PREMIUM ₹99')}</span>
                </span>
              )}
            </div>
            <p className={`text-xs mt-1 ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
              {t('birthChart.synthesis.subtitle', 'Deep Vedic analysis integrating chart positions, 12 Bhavas, dashas & ancient rules')}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {aiInterpretation && (
              <button
                onClick={() => handleSpeech(aiInterpretation)}
                className={`p-2 rounded-lg border transition cursor-pointer text-xs flex items-center space-x-1.5 ${
                  isDark
                    ? 'bg-[#1A1A1E] border-[#2A2A2E] text-[#E5E1D8] hover:text-white'
                    : 'bg-white border-[#E5E1D8] text-gray-700 hover:text-black shadow-sm'
                }`}
              >
                <Volume2 className="w-4 h-4 text-[#C9A050]" />
                <span>{isPlayingAudio ? t('birthChart.synthesis.audio_stop', 'Stop') : t('birthChart.synthesis.audio_listen', 'Listen')}</span>
              </button>
            )}

            {isPremiumUser ? (
              <button
                onClick={handleGenerateAIInterpretation}
                disabled={isLoadingAi}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#C9A050] to-[#A07828] hover:from-[#D4AF37] hover:to-[#B38730] text-[#0D0D0F] font-bold text-xs shadow-md shadow-[#C9A050]/20 transition cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Sparkles
                  className={`w-3.5 h-3.5 ${
                    isLoadingAi ? 'animate-spin' : ''
                  }`}
                />
                <span>
                  {isLoadingAi
                    ? t('birthChart.synthesis.generating', 'Synthesizing...')
                    : aiInterpretation
                    ? t('birthChart.synthesis.retry_button', 'Regenerate Analysis')
                    : t('birthChart.synthesis.run_button', 'Run Full Synthesis')}
                </span>
              </button>
            ) : (
              <button
                onClick={() => setIsSubscriptionModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#C9A050] to-[#A07828] hover:from-[#D4AF37] hover:to-[#B38730] text-[#0D0D0F] font-bold text-xs shadow-md shadow-[#C9A050]/20 transition cursor-pointer flex items-center space-x-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{t('birthChart.synthesis.unlock_button', { defaultValue: 'Unlock for ₹99', price: '₹99' })}</span>
              </button>
            )}
          </div>
        </div>

        {isLoadingAi ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
            <div className="w-9 h-9 border-2 border-[#C9A050] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-[#C9A050] font-serif font-semibold">
              {t('birthChart.synthesis.calculating', 'AstroJunction synthesizing multi-tradition Vedic sutras...')}
            </p>
          </div>
        ) : aiInterpretation && isPremiumUser ? (
          <div className={`p-6 sm:p-8 rounded-2xl border shadow-inner ${
            isDark
              ? 'bg-[#0B0B0E] border-[#2A2A2E]'
              : 'bg-[#FAF7F0] border-[#E8E2D5]'
          }`}>
            {parsedSynthesis && parsedSynthesis.sections && parsedSynthesis.sections.length > 0 ? (
              <div className="space-y-6">
                {parsedSynthesis.showingEnglishNote && (
                  <div className="px-3.5 py-2 rounded-lg bg-[#C9A050]/10 border border-[#C9A050]/30 text-xs text-[#C9A050] flex items-center space-x-2">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>{t('birthChart.synthesis.showing_english', 'Showing English version')}</span>
                  </div>
                )}
                {parsedSynthesis.sections.map((section, sIdx) => (
                  <div key={section.id || sIdx} className="space-y-3">
                    <div className="mt-6 mb-3 pt-4 first:mt-0 first:pt-0 border-t first:border-t-0 border-[#C9A050]/20 flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-lg bg-[#C9A050]/15 border border-[#C9A050]/30 flex items-center justify-center shrink-0 shadow-sm">
                        <Sparkles className="w-3.5 h-3.5 text-[#C9A050]" />
                      </div>
                      <h3 className={`text-base sm:text-lg font-serif font-bold tracking-wide ${
                        isDark ? 'text-[#F0ECE1]' : 'text-gray-900'
                      }`}>
                        {section.title}
                      </h3>
                    </div>

                    {section.error ? (
                      <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-xs text-red-400 flex items-center justify-between">
                        <span>{t('birthChart.synthesis.section_error', 'Could not generate this section. Please click to retry.')}</span>
                        <button
                          onClick={handleGenerateAIInterpretation}
                          className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded font-semibold text-xs cursor-pointer"
                        >
                          {t('birthChart.synthesis.retry_button', 'Retry Section')}
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {section.cards.map((card, cIdx) => (
                          <div
                            key={cIdx}
                            className={`p-4 sm:p-5 rounded-xl border transition-all duration-200 shadow-sm text-xs sm:text-sm ${
                              isDark
                                ? 'bg-[#15151A]/90 border-[#2A2A2E] text-[#D0CCC2] hover:border-[#C9A050]/40'
                                : 'bg-white border-[#E8E2D5] text-gray-800 hover:border-[#C9A050]/50 shadow-sm'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#C9A050]/20">
                              <h4 className={`text-sm sm:text-base font-semibold leading-snug ${
                                isDark ? 'text-[#E5C170]' : 'text-[#8C6218]'
                              }`}>
                                {card.title}
                              </h4>
                              {card.tags && card.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {card.tags.map((tag, tIdx) => (
                                    <span key={tIdx} className="text-[9px] px-1.5 py-0.5 rounded bg-[#C9A050]/15 text-[#C9A050] border border-[#C9A050]/30 font-medium">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {card.summary && (
                              <p className="leading-relaxed font-sans text-xs sm:text-sm mb-2 astro-prose-justified">
                                {parseInlineBold(card.summary).map((part, pIdx) =>
                                  part.isBold ? (
                                    <strong key={pIdx} className={`font-semibold tracking-wide ${isDark ? 'text-[#E5B558]' : 'text-[#96721E]'}`}>
                                      {part.text}
                                    </strong>
                                  ) : (
                                    <span key={pIdx}>{part.text}</span>
                                  )
                                )}
                              </p>
                            )}

                            {card.bullets && card.bullets.length > 0 && (
                              <ul className="space-y-1.5 mt-2 pl-4 list-disc text-xs text-[#9E9A90]">
                                {card.bullets.map((bullet, bIdx) => (
                                  <li key={bIdx} className="leading-relaxed">
                                    {parseInlineBold(bullet).map((part, pIdx) =>
                                      part.isBold ? (
                                        <strong key={pIdx} className={`font-semibold ${isDark ? 'text-[#E5B558]' : 'text-[#96721E]'}`}>
                                          {part.text}
                                        </strong>
                                      ) : (
                                        <span key={pIdx}>{part.text}</span>
                                      )
                                    )}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <ReactMarkdown
                components={{
                  h2: ({ children }) => (
                    <div className="mt-7 mb-4 pt-5 first:mt-0 first:pt-0 border-t first:border-t-0 border-[#C9A050]/20 flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-lg bg-[#C9A050]/15 border border-[#C9A050]/30 flex items-center justify-center shrink-0 shadow-sm">
                        <Sparkles className="w-3.5 h-3.5 text-[#C9A050]" />
                      </div>
                      <h2 className={`text-base sm:text-lg font-serif font-bold tracking-wide ${
                        isDark ? 'text-[#F0ECE1]' : 'text-gray-900'
                      }`}>
                        {children}
                      </h2>
                    </div>
                  ),
                  h3: ({ children }) => (
                    <div className="mt-7 mb-4 pt-5 first:mt-0 first:pt-0 border-t first:border-t-0 border-[#C9A050]/20 flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-lg bg-[#C9A050]/15 border border-[#C9A050]/30 flex items-center justify-center shrink-0 shadow-sm">
                        <Sparkles className="w-3.5 h-3.5 text-[#C9A050]" />
                      </div>
                      <h3 className={`text-base sm:text-lg font-serif font-bold tracking-wide ${
                        isDark ? 'text-[#F0ECE1]' : 'text-gray-900'
                      }`}>
                        {children}
                      </h3>
                    </div>
                  ),
                  p: ({ children }) => (
                    <p className={`text-xs sm:text-sm font-sans leading-relaxed mb-4 astro-prose-justified ${
                      isDark ? 'text-[#C5C0B5]' : 'text-gray-700'
                    }`}>
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3.5 my-4 list-none pl-0">
                      {children}
                    </ul>
                  ),
                  li: ({ children }) => {
                    const childArray = React.Children.toArray(children);
                    let titleNode: React.ReactNode = null;
                    let bodyNodes: React.ReactNode[] = [];

                    const unwrapped =
                      childArray.length === 1 &&
                      React.isValidElement(childArray[0]) &&
                      (childArray[0] as any).type === 'p'
                        ? React.Children.toArray(((childArray[0] as any).props as any)?.children)
                        : childArray;

                    if (unwrapped.length > 0) {
                      const first = unwrapped[0];
                      if (
                        React.isValidElement(first) &&
                        ((first as any).type === 'strong' || (first as any).type === 'b')
                      ) {
                        titleNode = first;
                        bodyNodes = unwrapped.slice(1).map((node, idx) => {
                          if (idx === 0 && typeof node === 'string') {
                            return node.replace(/^[:\s\-–—]+/, '');
                          }
                          return node;
                        });
                      } else {
                        bodyNodes = unwrapped;
                      }
                    }

                    return (
                      <li
                        className={`p-4 sm:p-5 rounded-xl border transition-all duration-200 shadow-sm text-xs sm:text-sm ${
                          isDark
                            ? 'bg-[#15151A]/90 border-[#2A2A2E] text-[#D0CCC2] hover:border-[#C9A050]/40'
                            : 'bg-white border-[#E8E2D5] text-gray-800 hover:border-[#C9A050]/50 shadow-sm'
                        }`}
                      >
                        {titleNode && (
                          <div
                            className={`mb-2 pb-1.5 border-b border-[#C9A050]/20 text-sm sm:text-base font-semibold leading-snug ${
                              isDark ? 'text-[#E5C170]' : 'text-[#8C6218]'
                            }`}
                          >
                            {titleNode}
                          </div>
                        )}
                        <div className="leading-relaxed font-sans text-xs sm:text-sm inline-block w-full">
                          {bodyNodes}
                        </div>
                      </li>
                    );
                  },
                  strong: ({ children }) => (
                    <strong className={`font-semibold tracking-wide ${
                      isDark ? 'text-[#E5B558]' : 'text-[#96721E]'
                    }`}>
                      {children}
                    </strong>
                  ),
                }}
              >
                {cleanAiInterpretation(aiInterpretation)}
              </ReactMarkdown>
            )}
          </div>
        ) : isPremiumUser ? (
          <div className={`text-center py-8 rounded-xl border ${
            isDark ? 'bg-[#1A1A1E]/40 border-[#2A2A2E]' : 'bg-[#FAF7F0] border-[#E8E2D5]'
          }`}>
            <p className={`text-xs font-sans ${isDark ? 'text-[#9E9A90]' : 'text-gray-600'}`}>
              {t('birthChart.synthesis.calculating', {
                defaultValue: `Ready to generate a comprehensive synthesis combining ${tradition.toUpperCase()} rules with your active Dasha timeline and yogas.`,
                tradition: tradition.toUpperCase(),
              })}
            </p>
            <button
              onClick={handleGenerateAIInterpretation}
              className="mt-3.5 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#C9A050] to-[#A07828] hover:from-[#D4AF37] hover:to-[#B38730] text-[#0D0D0F] font-bold text-xs shadow-md shadow-[#C9A050]/20 cursor-pointer transition inline-flex items-center space-x-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('birthChart.synthesis.click_to_generate', 'Click to Generate Deep Interpretation')}</span>
            </button>
          </div>
        ) : (
          /* Subscription Locked Banner */
          <div className={`relative overflow-hidden rounded-xl border p-6 sm:p-8 text-center space-y-4 ${
            isDark ? 'bg-[#1A1A1E]/60 border-[#C9A050]/30' : 'bg-gradient-to-b from-[#FAF7F0] to-[#F5EEDC] border-[#DFC896]'
          }`}>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#C9A050]/15 border border-[#C9A050]/40 flex items-center justify-center text-[#C9A050] shadow-lg shadow-[#C9A050]/10">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-1.5 max-w-lg mx-auto">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C9A050]/15 text-[#C9A050] border border-[#C9A050]/30">
                <Crown className="w-3.5 h-3.5" />
                <span>{t('birthChart.subscription.badge', 'Vedic Premium Subscription • ₹99 Only')}</span>
              </div>
              <h4 className={`text-lg sm:text-xl font-serif font-bold ${isDark ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                {t('birthChart.subscription.title', {
                  defaultValue: `Unlock Comprehensive Vedic Synthesis (${tradition.toUpperCase()})`,
                  tradition: tradition.toUpperCase(),
                })}
              </h4>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-[#9E9A90]' : 'text-gray-600'}`}>
                {t('birthChart.subscription.description', 'Gain access to deep personalized multi-tradition synthesis integrating your Lagna, 12 Bhavas, active Vimshottari Mahadashas, planetary yogas, and classical Vedic sutras.')}
              </p>
            </div>

            {/* Quick feature pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-2xl mx-auto pt-2 text-left">
              <div className={`p-3 rounded-lg border text-xs flex items-center space-x-2 ${isDark ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-white border-[#E8E2D5]'}`}>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-[11px] font-medium">{t('birthChart.subscription.feature_1', '12-Bhava & Yoga Audit')}</span>
              </div>
              <div className={`p-3 rounded-lg border text-xs flex items-center space-x-2 ${isDark ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-white border-[#E8E2D5]'}`}>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-[11px] font-medium">{t('birthChart.subscription.feature_2', 'Dasha Milestones & Timing')}</span>
              </div>
              <div className={`p-3 rounded-lg border text-xs flex items-center space-x-2 ${isDark ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-white border-[#E8E2D5]'}`}>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-[11px] font-medium">{t('birthChart.subscription.feature_3', 'Remedies & Sacred Mantras')}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsSubscriptionModalOpen(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#C9A050] to-[#A07828] hover:from-[#D4AF37] hover:to-[#B38730] text-[#0D0D0F] font-bold text-xs sm:text-sm shadow-lg shadow-[#C9A050]/25 transition cursor-pointer inline-flex items-center space-x-2"
              >
                <Lock className="w-4 h-4" />
                <span>{t('birthChart.subscription.subscribe_button', 'Subscribe for ₹99 & Unlock Synthesis')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Vedic Premium Subscription Modal */}
      {isSubscriptionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className={`relative w-full max-w-lg rounded-2xl border p-6 sm:p-8 shadow-2xl overflow-hidden transition-all ${
              isDark
                ? 'bg-[#141418] border-[#C9A050]/40 text-[#E5E1D8]'
                : 'bg-[#FFFDF7] border-[#DECFA6] text-[#2A2A2E]'
            }`}
          >
            {/* Background ambient decorative glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#C9A050]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#C9A050]/15 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setIsSubscriptionModalOpen(false)}
              className={`absolute top-4 right-4 p-2 rounded-full border transition cursor-pointer ${
                isDark
                  ? 'border-[#2A2A2E] text-[#9E9A90] hover:text-white hover:bg-[#1A1A1E]'
                  : 'border-[#E5E1D8] text-[#9E9A90] hover:text-black hover:bg-[#F0ECE1]'
              }`}
              title={t('birthChart.planet_modal.close', 'Close')}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex flex-col items-center text-center space-y-3 pt-2">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C9A050]/30 to-[#A07828]/10 border border-[#C9A050]/60 flex items-center justify-center shadow-lg shadow-[#C9A050]/20">
                  <Lock className="w-8 h-8 text-[#C9A050]" />
                </div>
                <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#C9A050] text-[#0D0D0F]">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#C9A050]/15 text-[#C9A050] border border-[#C9A050]/30">
                <Crown className="w-3.5 h-3.5" />
                <span>{t('birthChart.subscription.badge', 'Vedic Premium Subscription • ₹99 Only')}</span>
              </div>

              <h3 className={`text-xl sm:text-2xl font-serif font-bold ${
                isDark ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'
              }`}>
                {t('birthChart.subscription.modal_title', {
                  defaultValue: `Unlock Comprehensive Vedic Synthesis (${tradition.toUpperCase()})`,
                  tradition: tradition.toUpperCase(),
                })}
              </h3>

              <p className="text-xs font-sans text-[#9E9A90] max-w-md leading-relaxed">
                {t('birthChart.subscription.modal_desc', 'Deep personalized Vedic synthesis integrating your Lagna, 12 Bhavas, active Vimshottari Mahadashas, planetary yogas, and classical sutras for just ₹99 INR.')}
              </p>
            </div>

            {/* Feature Highlights */}
            <div className={`mt-5 p-4 rounded-xl border space-y-2.5 ${
              isDark ? 'bg-[#1A1A1E]/80 border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
            }`}>
              <div className="text-xs font-bold text-[#C9A050] uppercase tracking-wider font-sans mb-1">
                {t('birthChart.subscription.what_unlocked', 'What is unlocked with your Subscription:')}
              </div>
              
              <div className="flex items-start space-x-2.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{t('birthChart.subscription.feature_synthesis', 'Comprehensive Vedic Synthesis: Detailed Parashari, Jaimini, Lal Kitab & KP multi-tradition cross-audits.')}</span>
              </div>
              
              <div className="flex items-start space-x-2.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{t('birthChart.subscription.feature_bhavas', '12 Bhavas & Planetary Yogas: Wealth, Career, Raj Yogas, Viparita Yogas & Neecha Bhanga analysis.')}</span>
              </div>
              
              <div className="flex items-start space-x-2.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{t('birthChart.subscription.feature_dashas', 'Vimshottari Dasha Milestones: Antardasha timing windows, career shifts & karmic turning points.')}</span>
              </div>

              <div className="flex items-start space-x-2.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{t('birthChart.subscription.feature_remedies', 'Vedic Upayas & Remedies: Customized Vedic Mantras, Gemstones, Rudraksha, and ritual guidelines.')}</span>
              </div>

              <div className="flex items-start space-x-2.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{t('birthChart.subscription.feature_dossier', 'Full PDF Dossier & Voice Reading: Listen to your reading via audio and download full formatted chart reports.')}</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => {
                  setIsSubscriptionModalOpen(false);
                  if (onNavigateToTab) {
                    onNavigateToTab('consultations', 'daily_vedic_subscription');
                  }
                }}
                className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#C9A050] to-[#A07828] hover:from-[#D4AF37] hover:to-[#B38730] text-[#0D0D0F] font-bold text-xs sm:text-sm shadow-lg shadow-[#C9A050]/25 transition cursor-pointer flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t('birthChart.subscription.cta_button', 'Subscribe for ₹99 & Open Payment Gateway')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsSubscriptionModalOpen(false)}
                className={`w-full sm:w-auto py-3.5 px-4 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  isDark
                    ? 'border-[#2A2A2E] text-[#9E9A90] hover:text-white hover:bg-[#1A1A1E]'
                    : 'border-[#E5E1D8] text-[#6E6A60] hover:text-black hover:bg-[#F0ECE1]'
                }`}
              >
                {t('birthChart.subscription.maybe_later', 'Maybe Later')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};