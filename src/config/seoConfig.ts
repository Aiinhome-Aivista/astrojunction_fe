export interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article';
  canonical?: string;
  jsonLd?: Record<string, any>;
}

export const DEFAULT_SEO: SEOProps = {
  title: "ASTROJUNCTION • Vedic Astrology, Kundli & Daily Oracle",
  description: "Ancient Knowledge • Modern Intelligence. Accurate Vedic Janam Kundli, Daily Panchang & Horoscope, Kundli Milan (Matchmaking), Numerology, and Life Counselling.",
  keywords: [
    "vedic astrology",
    "janam kundli",
    "kundli online",
    "daily horoscope",
    "panchang today",
    "kundli milan",
    "numerology calculator",
    "daivajna consultation",
    "astrology prediction"
  ],
  ogImage: "/golden_zodiac_wheel.jpg",
  ogType: "website",
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AstroJunction",
    "applicationCategory": "LifestyleApplication",
    "operatingSystem": "All",
    "description": "Comprehensive Vedic Astrology, Janam Kundli, Daily Horoscope, Panchang, and Numerology platform.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    }
  }
};

export const TAB_SEO_CONFIG: Record<string, SEOProps> = {
  landing: {
    title: "ASTROJUNCTION • Ancient Vedic Astrology & Life Insights",
    description: "Explore authentic Vedic Astrology, personalized Janam Kundli, Daily Horoscope, Panchang, 36 Gun Milan Matchmaking, and Vedic Numerology.",
    keywords: ["astrojunction", "vedic astrology", "kundli", "horoscope", "indian astrology", "vedic panchang"],
    ogImage: "/golden_zodiac_wheel.jpg",
    ogType: "website",
  },
  home: {
    title: "ASTROJUNCTION • Ancient Vedic Astrology & Life Insights",
    description: "Explore authentic Vedic Astrology, personalized Janam Kundli, Daily Horoscope, Panchang, 36 Gun Milan Matchmaking, and Vedic Numerology.",
    keywords: ["astrojunction", "vedic astrology", "kundli", "horoscope", "indian astrology"],
    ogImage: "/golden_zodiac_wheel.jpg",
    ogType: "website",
  },
  daily: {
    title: "Daily Horoscope & Vedic Panchang • ASTROJUNCTION",
    description: "Get real-time Vedic Panchang today with accurate Tithi, Nakshatra, Yoga, Karana, Rahu Kaal, Shubh Muhurat, and personalized daily horoscope forecasts.",
    keywords: ["daily horoscope", "today panchang", "tithi today", "nakshatra", "rahu kaal", "shubh muhurat", "vedic daily insights"],
    ogImage: "/vedic_calendar_alt.jpg",
    ogType: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Daily Vedic Horoscope & Panchang",
      "description": "Accurate daily astrological predictions, planetary transits, and Vedic Panchang calendar."
    }
  },
  horoscope: {
    title: "Janam Kundli & Vedic Birth Chart (D1 & D9) • ASTROJUNCTION",
    description: "Generate your free Vedic Janam Kundli online. Detailed Parashari planetary positions, Lagna chart, Navamsha (D9) analysis, and life predictions.",
    keywords: ["janam kundli", "kundli generator", "birth chart online", "vedic birth chart", "navamsha chart", "lagna chart", "parashari astrology"],
    ogImage: "/golden_zodiac_wheel.jpg",
    ogType: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Vedic Janam Kundli Generator",
      "applicationCategory": "AstrologyTool",
      "description": "Interactive online Vedic birth chart and Kundli calculation engine."
    }
  },
  matchmaking: {
    title: "Kundli Milan & Gun Milan (36 Points Ashtakoota) • ASTROJUNCTION",
    description: "Free online Kundli Milan for marriage. In-depth 36 Gun Ashtakoota analysis, Manglik Dosha assessment, Nadi Dosha cancellation, and Vedic compatibility.",
    keywords: ["kundli milan", "gun milan", "36 gun milan", "horoscope matching for marriage", "manglik dosha check", "nadi dosha", "vedic compatibility"],
    ogImage: "/zodiac_compatibility_art.jpg",
    ogType: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Vedic Kundli Milan Engine",
      "applicationCategory": "AstrologyTool",
      "description": "Complete Ashtakoota 36 Guna marriage compatibility analysis tool."
    }
  },
  numerology: {
    title: "Vedic Numerology Calculator (Mulank, Bhagyank, Namank) • ASTROJUNCTION",
    description: "Discover your destiny with Vedic Numerology. Instant Mulank (Root), Bhagyank (Life Path), Chaldean and Pythagorean Name numbers with lucky gem recommendations.",
    keywords: ["numerology calculator", "mulank calculator", "bhagyank calculator", "chaldean name numerology", "pythagorean numerology", "lucky numbers"],
    ogImage: "/golden_zodiac_wheel.jpg",
    ogType: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Vedic Numerology Calculator",
      "applicationCategory": "NumerologyTool",
      "description": "Calculate Mulank, Bhagyank, and Chaldean/Pythagorean name numbers."
    }
  },
  panjika: {
    title: "Vedic Panjika & Hindu Calendar • ASTROJUNCTION",
    description: "Complete Hindu Vedic Panjika calendar. Find auspicious dates, festivals, Ekadashi, Purnima, Amavasya, and planetary transits.",
    keywords: ["vedic panjika", "hindu calendar", "panjika online", "festivals calendar", "ekadashi dates", "amavasya"],
    ogImage: "/vedic_calendar_alt.jpg",
    ogType: "website",
  },
  consultations: {
    title: "Expert Vedic Astrologer Consultations • ASTROJUNCTION",
    description: "Book 1-on-1 personalized consultations with certified Vedic astrologers for career, marriage, health, and financial roadmap guidance.",
    keywords: ["astrologer consultation", "talk to astrologer", "vedic astrologer online", "kundli consultation", "career astrology"],
    ogImage: "/astrologer_bg.jpg",
    ogType: "website",
  },
  counsellor: {
    title: "Daivajna Astrological Life Counsellor • ASTROJUNCTION",
    description: "Get instant, personalized Vedic life counselling powered by Daivajna intelligence combined with classical Jyotish shastras.",
    keywords: ["ai astrologer", "daivajna", "astrology counselling", "vedic ai oracle"],
    ogImage: "/golden_zodiac_wheel.jpg",
    ogType: "website",
  },
  blogs: {
    title: "Vedic Astrology Blogs, Articles & Ancient Wisdom • ASTROJUNCTION",
    description: "Explore curated articles on planetary transits, zodiac compatibility, Vedic rituals, gemstones, and spiritual growth.",
    keywords: ["astrology blog", "vedic articles", "zodiac signs blog", "planetary transits", "vedic wisdom"],
    ogImage: "/blog_1.jpg",
    ogType: "website",
  },
  admin_dashboard: {
    title: "Admin Portal • ASTROJUNCTION",
    description: "AstroJunction Administrative Dashboard and System Management.",
    ogType: "website",
  }
};
