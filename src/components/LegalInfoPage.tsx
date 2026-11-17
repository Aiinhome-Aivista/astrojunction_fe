import React, { useState } from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type LegalPageView = 'about-us' | 'faq' | 'privacy-policy' | 'cookie-policy' | 'terms-and-conditions';

interface LegalInfoPageProps {
  view: LegalPageView;
  theme?: 'dark' | 'light';
  language?: string;
  onBack?: () => void;
  onNavigateView?: (view: LegalPageView) => void;
}

// ---------------- LOCALIZED CONTENT DICTIONARIES ----------------

const BACK_LABELS: Record<string, string> = {
  en: 'Back',
  bn: 'ফিরে যান',
  hi: 'वापस जाएं',
  ta: 'திரும்பு',
  fr: 'Retour',
};

const ABOUT_CONTENT: Record<string, {
  title: string;
  p1: string;
  p2: string;
  missionTitle: string;
  missionP1: string;
  missionP2: string;
  bullets: Array<{ bold: string; text: string }>;
  visionTitle: string;
  visionText: string;
}> = {
  en: {
    title: 'About AstroJunction',
    p1: "Welcome to AstroJunction, your trusted partner in deciphering celestial wisdom and navigating life's transformative milestones. We are more than just an astrology website — we are a dedicated platform bridging ancient Vedic Jyotish shastra with state-of-the-art astronomical computations. At AstroJunction, we believe that understanding your celestial blueprint should empower you with clarity, purpose, growth, and inner peace.",
    p2: 'With our easy-to-use platform, tailored planetary recommendations, and transparent calculations, we aim to make the journey of self-discovery seamless, reliable, and deeply rewarding. Whether you are seeking daily Panchang timings, in-depth Janma Kundli divisional charts, 36-Gunas matchmaking, or long-term destiny roadmaps — AstroJunction is here to support you every step of the way.',
    missionTitle: 'Our Mission',
    missionP1: 'At AstroJunction, our mission is to redefine the way seekers approach Vedic astrology by eliminating superstition and prioritizing authentic, mathematical precision. We aspire to go beyond generic horoscopes by fostering an intuitive environment where timeless Vedic wisdom meets modern analytical clarity. Our focus is on creating lasting value for our users, transforming astrological consultation into a journey of conscious decision-making.',
    missionP2: 'We are committed to delivering:',
    bullets: [
      { bold: 'Swiss Ephemeris Precision:', text: ' Sub-arcsecond astronomical calculations aligned with NASA Jet Propulsion Laboratory standards and verified sidereal ayanamshas.' },
      { bold: 'Authentic Canonical Jyotish:', text: ' Faithful adherence to Brihat Parashara Hora Shastra, Jaimini Sutras, KP System, and classical Panchang algorithms.' },
      { bold: 'Comprehensive Kundli & Milestones:', text: ' In-depth divisional charts (D1 to D60), Vimshottari Mahadasha forecasting, and 25-Year Vedic Destiny Roadmaps.' },
      { bold: 'Privacy & Ethical Integrity:', text: ' 100% zero data monetization, strict confidential encryption, and ethical advisory practices without fear-mongering.' }
    ],
    visionTitle: 'Our Vision',
    visionText: 'We envision a world where ancient Eastern astronomy and Western computational rigor work harmoniously. Every human deserves effortless access to their authentic stellar blueprint with complete transparency, verified planetary positions, and practical Vedic remedies.'
  },
  bn: {
    title: 'অ্যাস্ট্রোজংশন সম্পর্কে',
    p1: 'অ্যাস্ট্রোজংশন (AstroJunction)-এ আপনাকে স্বাগতম — মহাজাগতিক প্রজ্ঞা অনুধাবন এবং জীবনের গুরুত্বপূর্ণ সন্ধিক্ষণে সঠিক দিশা পাওয়ার ক্ষেত্রে আপনার বিশ্বস্ত সঙ্গী। আমরা কেবল একটি সাধারণ জ্যোতিষ পোর্টাল নই; আমরা প্রাচীন বৈদিক জ্যোতিষ শাস্ত্র ও আধুনিক মহাকাশীয় গণনার এক অনন্য সমন্বয়। আমরা বিশ্বাস করি, আপনার জন্মকালীন গ্রহসংস্থান আপনাকে স্পষ্টতা, আত্মবিশ্বাস এবং মানসিক প্রশান্তি প্রদানে সাহায্য করবে।',
    p2: 'আমাদের সহজ ও সাবলীল প্ল্যাটফর্ম, নির্ভুল গ্রহ গণনা এবং স্বচ্ছ বিশ্লেষণের মাধ্যমে আমরা আত্ম-আবিষ্কারের এই যাত্রাকে অর্থপূর্ণ করে তুলতে প্রতিশ্রুতিবদ্ধ। দৈনিক পঞ্জিকা, বিশদ জন্মকুণ্ডলী ও ষোড়শবর্গ চার্ট, ৩৬-গুণ মিলন কিংবা ২৫-বছরের ভাগ্য রেখাচিত্র — জীবনের প্রতিটি ধাপে আপনাকে সঠিক দিশা দেখাতে অ্যাস্ট্রোজংশন সদা তৎপর।',
    missionTitle: 'আমাদের লক্ষ্য ও উদ্দেশ্য',
    missionP1: 'অ্যাস্ট্রোজংশন-এর মূল উদ্দেশ্য হলো কুসংস্কারমুক্ত, নিখুঁত এবং গাণিতিক যথার্থতাসম্পন্ন বৈদিক জ্যোতিষ জ্ঞান সবার কাছে পৌঁছে দেওয়া। প্রচলিত সাধারণ পূর্বাভাসের ঊর্ধ্বে উঠে আমরা আধুনিক বিশ্লেষণ ও প্রাচীন শাস্ত্রের এমন এক মিলন ঘটিয়েছি যা আপনার জীবন পরিচালনার ক্ষেত্রে যুক্তিনির্ভর সিদ্ধান্ত নিতে সহায়তা করে।',
    missionP2: 'আমাদের অঙ্গীকারসমূহ:',
    bullets: [
      { bold: 'সুইস এফিমেরিস নির্ভুলতা:', text: ' নাসা (NASA JPL) সমমানের ০.০০১ আর্কসেকেন্ড নিখুঁত মহাকাশীয় গণনা এবং বিশুদ্ধ লাহিড়ী অয়নাংশ।' },
      { bold: 'প্রামাণিক শাস্ত্রীয় জ্যোতিষ:', text: ' পরাশর হোরা শাস্ত্র, জৈমিনী সূত্র, কেপি সিস্টেম এবং বিশুদ্ধ বৈদিক পঞ্জিকা পদ্ধতির কঠোর অনুসরণ।' },
      { bold: 'বিশদ কুণ্ডলী ও দীর্ঘমেয়াদী দিশা:', text: ' লগ্ন থেকে ষষ্টিঅংশ (D1 থেকে D60) বর্গ বিশ্লেষণ, বিংশোত্তরী মহাদশাঁ এবং ২৫ বছরের জীবন পথনির্দেশ।' },
      { bold: 'গোপনীয়তা ও নৈতিক সততা:', text: ' সম্পূর্ণ বিজ্ঞাপনমুক্ত, সুরক্ষিত এনক্রিপশন এবং ভয়ভীতিহীন দায়িত্বশীল জ্যোতিষ পরামর্শ।' }
    ],
    visionTitle: 'আমাদের দৃষ্টিভঙ্গি',
    visionText: 'আমাদের স্বপ্ন এমন এক বিশ্ব গড়ার যেখানে প্রাচ্যের সুপ্রাচীন জ্যোতির্বিজ্ঞান এবং প্রাশ্চাত্যের আধুনিক প্রযুক্তির মেলবন্ধনে মানুষ সহজেই তার জীবনের মহাজাগতিক মানচিত্র জানতে পারবে এবং ইতিবাচক পদক্ষেপ গ্রহণের মাধ্যমে পরম শান্তি লাভ করবে।'
  },
  hi: {
    title: 'एस्ट्रोजंक्शन के बारे में',
    p1: 'एस्ट्रोजंक्शन (AstroJunction) में आपका स्वागत है — आकाशीय ज्ञान को समझने और जीवन के महत्वपूर्ण पड़ावों को नेविगेट करने में आपका विश्वसनीय साथी। हम केवल एक ज्योतिष वेबसाइट नहीं हैं, बल्कि प्राचीन वैदिक ज्योतिष शास्त्र और आधुनिक खगोलीय गणनाओं का एक समर्पित सेतु हैं। हमारा मानना है कि आपकी जन्म कुंडली आपको स्पष्टता, उद्देश्य और आत्मिक शांति प्रदान करने वाली होनी चाहिए।',
    p2: 'हमारे सुगम प्लेटफॉर्म, सटीक ग्रह गणनाओं और पारदर्शी विश्लेषण के माध्यम से हम आत्म-खोज की इस यात्रा को विश्वसनीय और प्रेरणादायक बनाते हैं। चाहे दैनिक पंचांग हो, विस्तृत जन्म कुंडली (वर्ग कुंडलियां), 36-गुण मिलान या 25-वर्षीय जीवन पथ — एस्ट्रोजंक्शन हर कदम पर आपके साथ है।',
    missionTitle: 'हमारा उद्देश्य (मिशन)',
    missionP1: 'एस्ट्रोजंक्शन का मिशन अंधविश्वास को दूर कर वैदिक ज्योतिष को वैज्ञानिक एवं गणितीय सटीकता के साथ प्रस्तुत करना है। हम सामान्य भविष्यवाणियों से आगे बढ़कर ऐसा वातावरण तैयार करते हैं जहां समय की कसौटी पर खरी उतरी वैदिक विद्या और आधुनिक विश्लेषणात्मक स्पष्टता का संगम होता है।',
    missionP2: 'हमारी प्रमुख प्रतिबद्धताएं:',
    bullets: [
      { bold: 'स्विस एफिमेरिस सटीकता:', text: ' नासा मानकों के अनुरूप 0.001 आर्कसेकंड की खगोलीय सूक्ष्मता और शुद्ध सायन/निरयण गणना।' },
      { bold: 'प्रामाणिक वैदिक ज्योतिष:', text: ' वृहत् पराशर होरा शास्त्र, जैमिनी सूत्र, केपी प्रणाली और शास्त्रीय पंचांग का निष्ठावान पालन।' },
      { bold: 'विस्तृत कुंडली एवं माइलस्टोन्स:', text: ' D1 से D60 वर्ग कुंडलियां, विंशोत्तरी महादशा और 25-वर्षीय वैदिक जीवन रोडमैप।' },
      { bold: 'गोपनीयता एवं नैतिक निष्ठा:', text: ' 100% डेटा सुरक्षा, 256-बिट टीएलएस एन्क्रिप्शन और भयमुक्त, सकारात्मक ज्योतिषीय परामर्श।' }
    ],
    visionTitle: 'हमारा दृष्टिकोण (विज़न)',
    visionText: 'हम एक ऐसी दुनिया की कल्पना करते हैं जहां प्राचीन प्राच्य खगोल विद्या और आधुनिक तकनीक सामंजस्य के साथ काम करें। प्रत्येक व्यक्ति को बिना किसी भ्रांति के अपने ब्रह्मांडीय ब्लूप्रिंट और सकारात्मक वैदिक उपायों का सहज लाभ मिलना चाहिए।'
  },
  ta: {
    title: 'ஆஸ்ட்ரோஜங்க்ஷன் பற்றி',
    p1: 'ஆஸ்ட்ரோஜங்க்ஷன் (AstroJunction) தளத்திற்கு உங்களை வரவேற்கிறோம் — பிரபஞ்ச ஞானத்தைப் புரிந்துகொள்வதற்கும், வாழ்க்கையின் முக்கிய தருணங்களை வழிநடத்துவதற்கும் உங்கள் நம்பகமான வழிகாட்டி. நாங்கள் ஒரு எளிய ஜோதிட தளம் மட்டுமல்ல, பண்டைய வேத ஜோதிட சாஸ்திரத்தையும் அதிநவீன வானியல் கணக்கீடுகளையும் இணைக்கும் தனித்துவமான தளம்.',
    p2: 'எளிமையான தளம், துல்லியமான கிரக நிலைகள் மற்றும் வெளிப்படையான கணக்கீடுகள் மூலம் உங்கள் சுய-கண்டுபிடிப்பு பயணத்தை இனிமையானதாக மாற்றுவதே எங்கள் நோக்கம். தினசரி பஞ்சாங்கம், ஜாதகக் கணிப்பு, 36-குண திருமணப் பொருத்தம் அல்லது 25-ஆண்டு வாழ்க்கை வழிகாட்டி என அனைத்திலும் உங்களுக்கு உதவ நாங்கள் தயாராக உள்ளோம்.',
    missionTitle: 'எங்கள் நோக்கம்',
    missionP1: 'மூடநம்பிக்கைகளை நீக்கி, வேத ஜோதிடத்தை கணிதத் துல்லியத்துடன் அனைவருக்கும் கொண்டு சேர்ப்பதே எங்கள் குறிக்கோள். பொதுவான கணிப்புகளுக்கு அப்பால், காலத்தால் அழியாத வேத அறிவும் நவீன அறிவியல் தெளிவும் இணையும் தளத்தை நாங்கள் வழங்குகிறோம்.',
    missionP2: 'எங்கள் முக்கிய உறுதிமொழிகள்:',
    bullets: [
      { bold: 'சுவிஸ் எபிமெரிஸ் துல்லியம்:', text: ' நாசா தரநிலைகளுக்கு இணையான வினாடித் துல்லிய வானியல் கணக்கீடுகள்.' },
      { bold: 'உண்மையான வேத ஜோதிடம்:', text: ' பராசர ஹோரா சாஸ்திரம், ஜெமினி சூத்திரங்கள் மற்றும் பாரம்பரிய பஞ்சாங்க நெறிமுறைகளின் கண்டிப்பான பின்பற்றுதல்.' },
      { bold: 'முழுமையான ஜாதகம் & திட்டங்கள்:', text: ' D1 முதல் D60 வரையிலான வர்க்க சக்கரங்கள், விம்சோத்தரி மகா தசா பலன்கள்.' },
      { bold: 'தனியுரிமை & நேர்மை:', text: ' 100% தரவு பாதுகாப்பு, விளம்பரமற்ற தளம் மற்றும் பயமுறுத்தலற்ற நற்பண்பு ஆலோசனை.' }
    ],
    visionTitle: 'எங்கள் தொலைநோக்கு',
    visionText: 'பண்டைய கிழக்கு வானியலும் மேற்கத்திய கணக்கீட்டு துல்லியமும் இணக்கமாக செயல்படும் உலகத்தை நாங்கள் உருவாக்குகிறோம். ஒவ்வொரு மனிதரும் தங்களின் உண்மையான விண்மீன் வழிகாட்டலை எளிதாகப் பெற தகுதியுடையவர்கள்.'
  },
  fr: {
    title: "À Propos d'AstroJunction",
    p1: "Bienvenue sur AstroJunction, votre partenaire de confiance pour décrypter la sagesse céleste et naviguer les étapes charnières de votre existence. Plus qu'un simple portail d'astrologie, nous sommes une plateforme d'excellence reliant le Jyotish védique millénaire aux calculs astronomiques de haute précision.",
    p2: "Grâce à notre interface intuitive, nos recommandations planétaires personnalisées et nos algorithmes transparents, nous facilitons votre quête de sens. Qu'il s'agisse du Panchang quotidien, de thèmes natals Janma Kundli détaillés (D1 à D60) ou de la matrice de compatibilité des 36 Gunas, nous vous accompagnons à chaque instant.",
    missionTitle: 'Notre Mission',
    missionP1: "La mission d'AstroJunction est de redéfinir l'approche de l'astrologie védique en éliminant les superstitions au profit d'une rigueur mathématique irréprochable. Nous associons la clarté analytique moderne à la sagesse intemporelle des textes sacrés pour vous aider à prendre des décisions éclairées.",
    missionP2: 'Nos engagements clés :',
    bullets: [
      { bold: 'Précision Swiss Ephemeris :', text: " Calculs astronomiques ultra-précis au millième de seconde d'arc, alignés sur les éphémérides de la NASA." },
      { bold: 'Jyotish Canonique Authentique :', text: ' Respect strict du Brihat Parashara Hora Shastra, des sutras de Jaimini et des algorithmes classiques.' },
      { bold: 'Thèmes Divisionnaires Complets :', text: ' Analyse de D1 à D60, projections des Mahadashas Vimshottari et feuille de route sur 25 ans.' },
      { bold: 'Confidentialité & Éthique :', text: ' Chiffrement de pointe, aucune monétisation de vos données personnelles et conseils constructifs sans catastrophisme.' }
    ],
    visionTitle: 'Notre Vision',
    visionText: "Nous envisageons un monde où l'astronomie orientale ancestrale et la rigueur scientifique occidentale collaborent harmonieusement, offrant à chacun un accès transparent et éclairant à son empreinte astrale unique."
  }
};

const FAQS_CONTENT: Record<string, {
  title: string;
  subtitle: string;
  items: Array<{ q: string; a: string }>;
}> = {
  en: {
    title: 'Frequently Asked Questions',
    subtitle: 'Find clear answers to common questions about our calculations, Kundli accuracy, matchmaking, and account security.',
    items: [
      {
        q: 'How accurate are the horoscope and planetary calculations on AstroJunction?',
        a: 'AstroJunction leverages the world-renowned Swiss Ephemeris engine integrated with high-precision sidereal algorithms (Lahiri / Krishnamurti / Raman ayanamshas). Calculations have an astronomical precision down to 0.001 arcseconds, replicating the gold standard used by NASA astronomical tables and canonical Vedic scholars.'
      },
      {
        q: 'What birth information is necessary to generate a complete Kundli?',
        a: 'To calculate an accurate Janma Kundli (natal chart), you need your exact Date of Birth, Time of Birth (including minutes), and Place of Birth (City/State/Country). Exact coordinates and timezone offsets are automatically resolved by our planetary geocoding engine.'
      },
      {
        q: 'How does the 36-Gunas Ashta Koota Matchmaking algorithm work?',
        a: 'Our matchmaking module computes the 8 classical Vedic Kootas: Varna (1), Vashya (2), Tara (3), Yoni (4), Graha Maitri (5), Gana (6), Bhakoot (7), and Nadi (8), adding up to 36 points. It also checks for Manglik Dosha and provides specific Shanti remedies and cancelation exceptions (Pariharas).'
      },
      {
        q: 'What is the 25-Year Vedic Destiny Roadmap?',
        a: 'The 25-Year Roadmap analyzes your active and upcoming Vimshottari Mahadasha and Antardasha periods. It projects career inflection points, wealth accumulation phases, relationship transitions, and health vigilance windows across customizable 1 to 25-year horizons.'
      },
      {
        q: 'Are my birth details and personal consultations private?',
        a: 'Yes, 100%. We employ 256-bit TLS encryption in transit and secure database hashing at rest. Your birth time, chart details, and astrological questions are never sold, rented, or shared with third-party advertisers.'
      },
      {
        q: 'How do I book a personalized consultation with a certified Daivajna?',
        a: 'Visit the Consultations tab from the navigation bar. You can choose from our experienced panel of certified Vedic astrologers, select your focus area (Career, Marriage, Wealth, Health), and schedule an encrypted 1-on-1 session.'
      }
    ]
  },
  bn: {
    title: 'সাধারণ জিজ্ঞাসা (FAQ)',
    subtitle: 'আমাদের গ্রহ গণনা, কুণ্ডলীর নির্ভুলতা, কুষ্ঠি মিলন এবং তথ্য সুরক্ষা সংক্রান্ত সাধারণ প্রশ্নের স্পষ্ট উত্তর জানুন।',
    items: [
      {
        q: 'অ্যাস্ট্রোজংশনের কোষ্ঠী ও গ্রহ গণনা কতটা নির্ভুল?',
        a: 'অ্যাস্ট্রোজংশন বিশ্বখ্যাত সুইস এফিমেরিস (Swiss Ephemeris) ইঞ্জিন এবং লাহিড়ী/কেপি অয়নাংশের বিশুদ্ধ অ্যালগরিদম ব্যবহার করে। এর জ্যোতির্বৈজ্ঞানিক নির্ভুলতা ০.০০১ আর্কসেকেন্ড পর্যন্ত, যা নাসা (NASA JPL) এবং প্রাচীন ঋষিদের বিশুদ্ধ গণনার সমমানের।'
      },
      {
        q: 'একটি সম্পূর্ণ নির্ভুল জন্মকুণ্ডলী তৈরির জন্য কী কী তথ্যের প্রয়োজন?',
        a: 'সঠিক জন্মকুণ্ডলী প্রস্তুত করার জন্য আপনার সঠিক জন্মতারিখ, সঠিক জন্মসময় (মিনিটসহ) এবং জন্মস্থান (শহর/জেলা/দেশ) প্রয়োজন। আমাদের সিস্টেম স্বয়ংক্রিয়ভাবে অক্ষাংশ, দ্রাঘিমাংশ ও টাইমজোন নির্ধারণ করে নেয়।'
      },
      {
        q: '৩৬-গুণের অষ্টকূট যোটক বা কুষ্ঠি মিলন কীভাবে কাজ করে?',
        a: 'আমাদের ম্যাচমেকিং মডিউলটি বৈদিক অষ্টকূট বিশ্লেষণ করে: বর্ণ (১), বশ্য (২), তারা (৩), যোনি (৪), গ্রহমৈত্রী (৫), গণ (৬), ভকূট (৭), এবং নাড়ী (৮) — মোট ৩৬ গুণ। এছাড়াও এটি মাঙ্গলিক দোষ ও তার শান্তিমূলক পরিহার পরীক্ষা করে।'
      },
      {
        q: '২৫ বছরের বৈদিক ভাগ্য রেখাচিত্র (Life Roadmap) কী?',
        a: 'এটি আপনার চলমান ও আসন্ন বিংশোত্তরী মহাদশাঁ এবং অন্তর্দশার সূক্ষ্ম বিশ্লেষণ করে কর্মক্ষেত্রের শুভ সময়, অর্থভাগ্য, দাম্পত্যের পর্যায় এবং স্বাস্থ্য সচেতনতার দিকগুলো ২৫ বছরের দীর্ঘমেয়াদে তুলে ধরে।'
      },
      {
        q: 'আমার জন্মের তথ্য ও পরামর্শ কি সম্পূর্ণ গোপন ও নিরাপদ থাকে?',
        a: 'হ্যাঁ, ১০০% নিরাপদ। আমরা ২৫৬-বিট টিএলএস এনক্রিপশন ব্যবহার করি। আপনার জন্মের বিবরণ ও চার্ট কোনো তৃতীয় পক্ষের কাছে বিক্রি বা শেয়ার করা হয় না।'
      },
      {
        q: 'প্রমাণিত জ্যোতিষীর সাথে ব্যক্তিগত পরামর্শ কীভাবে বুক করব?',
        a: 'উপরে কনসাল্টেশন অপশনে যান। সেখান থেকে আপনার প্রয়োজনীয় ক্ষেত্র (কর্মজীবন, বিবাহ, অর্থ বা স্বাস্থ্য) অনুযায়ী অভিজ্ঞ বৈদিক জ্যোতিষীর সাথে সুরক্ষিত সেশন নির্ধারণ করতে পারেন।'
      }
    ]
  },
  hi: {
    title: 'अक्सर पूछे जाने वाले प्रश्न (FAQ)',
    subtitle: 'हमारी ग्रह गणनाओं, कुंडली की सटीकता, कुंडली मिलान और डेटा सुरक्षा से जुड़े सामान्य प्रश्नों के स्पष्ट उत्तर।',
    items: [
      {
        q: 'एस्ट्रोजंक्शन की कुंडली और ग्रह गणनाएं कितनी सटीक हैं?',
        a: 'एस्ट्रोजंक्शन विश्वप्रसिद्ध स्विस एफिमेरिस इंजन और उच्च-सटीक लाहिरी/केपी अयनांश का उपयोग करता है। इसकी खगोलीय सूक्ष्मता 0.001 आर्कसेकंड तक है, जो नासा के मानकों और शास्त्रीय वैदिक पंचांग के अनुरूप है।'
      },
      {
        q: 'सटीक जन्म कुंडली बनाने के लिए किन विवरणों की आवश्यकता होती है?',
        a: 'सटीक जन्म कुंडली के लिए आपकी सही जन्म तिथि, जन्म का सही समय (मिनट सहित) और जन्म स्थान आवश्यक है। हमारा सिस्टम अक्षांश और देशांतर स्वतः निर्धारित कर लेता है।'
      },
      {
        q: '36-गुण अष्टकूट मिलान कैसे काम करता है?',
        a: 'हमारा मिलान मॉड्यूल 8 शास्त्रीय कूटों का विश्लेषण करता है: वर्ण (1), वश्य (2), तारा (3), योनि (4), ग्रहमैत्री (5), गण (6), भकूट (7) और नाड़ी (8) — कुल 36 अंक। साथ ही मांगलिक दोष और उसके परिहार की जांच भी करता है।'
      },
      {
        q: '25-वर्षीय वैदिक भाग्य रोडमैप क्या है?',
        a: 'यह आपकी वर्तमान और आगामी विंशोत्तरी महादशाओं का विश्लेषण करके करियर में बदलाव, धन संचय, वैवाहिक जीवन और स्वास्थ्य के उतार-चढ़ाव का विस्तृत पूर्वानुमान प्रस्तुत करता है।'
      },
      {
        q: 'क्या मेरे जन्म विवरण और परामर्श पूरी तरह गोपनीय रहते हैं?',
        a: 'जी हां, शत-प्रतिशत। हम 256-बिट एन्क्रिप्शन का उपयोग करते हैं। आपकी व्यक्तिगत जानकारी किसी भी तीसरे पक्ष या विज्ञापनदाता के साथ साझा नहीं की जाती।'
      },
      {
        q: 'अनुभवी ज्योतिषी से व्यक्तिगत परामर्श कैसे लें?',
        a: 'कंसल्टेशन टैब पर जाकर आप करियर, विवाह, वित्त या स्वास्थ्य से संबंधित प्रमाणित ज्योतिषी चुन सकते हैं और अपना सत्र बुक कर सकते हैं।'
      }
    ]
  },
  ta: {
    title: 'அடிக்கடி கேட்கப்படும் கேள்விகள் (FAQ)',
    subtitle: 'எங்கள் கணக்கீடுகள், ஜாதகத் துல்லியம் மற்றும் திருமணப் பொருத்தம் பற்றிய பொதுவான கேள்விகளுக்கான விடைகள்.',
    items: [
      {
        q: 'ஆஸ்ட்ரோஜங்க்ஷனின் கிரக கணக்கீடுகள் எவ்வளவு துல்லியமானவை?',
        a: 'நாசா தரநிலைகளுக்கு இணையான சுவிஸ் எபிமெரிஸ் கணிப்பொறியைப் பயன்படுத்தி 0.001 ஆர்க் வினாடி துல்லியத்துடன் கிரக நிலைகள் கணக்கிடப்படுகின்றன.'
      },
      {
        q: 'துல்லியமான ஜாதகம் கணிக்க என்ன தகவல்கள் தேவை?',
        a: 'உங்கள் சரியான பிறந்த தேதி, பிறந்த நேரம் (நிமிடங்களுடன்) மற்றும் பிறந்த ஊர் தேவை.'
      },
      {
        q: 'திருமணப் பொருத்தம் எவ்வாறு கணக்கிடப்படுகிறது?',
        a: 'வர்ணம், வசியம், தாரா, யோனி, கிரக மைத்ரி, கணம், பகுட் மற்றும் நாடி ஆகிய 8 வேதக் கூட்டுகளின் அடிப்படையில் 36 பொருத்த புள்ளிகள் கணக்கிடப்படுகின்றன.'
      },
      {
        q: '25 ஆண்டுகால வேத வாழ்க்கை வழிகாட்டி என்றால் என்ன?',
        a: 'உங்கள் விம்சோத்தரி மகா தசா மற்றும் அந்தர தசா காலங்களை ஆராய்ந்து தொழில் மற்றும் நல்வாழ்வு பற்றிய நீண்ட காலக் கணிப்பை வழங்குகிறது.'
      },
      {
        q: 'எனது ஜாதகத் தகவல்கள் பாதுகாப்பானவையா?',
        a: 'ஆம், 100% பாதுகாப்பானது. உங்கள் தகவல்கள் எந்த மூன்றாம் தரப்பினருடனும் பகிரப்படாது.'
      },
      {
        q: 'நேரடி ஜோதிட ஆலோசனையை எவ்வாறு பெறுவது?',
        a: 'ஆலோசனைப் பகுதிக்குச் சென்று தகுதியான ஜோதிடரைத் தேர்ந்தெடுத்து உங்களுக்கான நேரத்தை முன்பதிவு செய்யலாம்.'
      }
    ]
  },
  fr: {
    title: 'Foire Aux Questions (FAQ)',
    subtitle: 'Trouvez des réponses claires à vos interrogations sur la précision de nos thèmes, la compatibilité et la sécurité.',
    items: [
      {
        q: 'Quelle est la précision des calculs sur AstroJunction ?',
        a: "AstroJunction utilise le moteur Swiss Ephemeris combiné aux ayanamshas sidéraux (Lahiri, Raman). La précision atteint 0,001 seconde d'arc, égale aux tables de la NASA."
      },
      {
        q: 'Quelles informations sont requises pour monter un thème ?',
        a: 'La date exacte, heure de naissance précise (à la minute) et lieu de naissance (ville et pays).'
      },
      {
        q: 'Comment fonctionne la synastrie des 36 Gunas ?',
        a: 'Elle évalue les 8 Kootas védiques classiques (Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi) totalisant 36 points, tout en vérifiant le Manglik Dosha.'
      },
      {
        q: "Qu'est-ce que la feuille de route sur 25 ans ?",
        a: 'Elle analyse vos cycles de Mahadashas Vimshottari pour anticiper les tournants professionnels, matériels et personnels sur un quart de siècle.'
      },
      {
        q: 'Mes données personnelles sont-elles confidentielles ?',
        a: 'Absolument. Nous appliquons un chiffrement TLS 256 bits strict et ne commercialisons aucune de vos données.'
      },
      {
        q: 'Comment réserver une consultation privée ?',
        a: 'Rendez-vous dans la section Consultations pour choisir un astrologue védique certifié et réserver un créneau chiffré.'
      }
    ]
  }
};

const LEGAL_TEXTS: Record<string, {
  privacyTitle: string;
  privacySub: string;
  privacyIntro: string;
  privacyS1Title: string;
  privacyS1Text: string;
  privacyS1Items: string[];
  privacyS2Title: string;
  privacyS2Text: string;
  privacyS3Title: string;
  privacyS3Text: string;
  privacyS4Title: string;
  privacyS4Text: string;

  cookieTitle: string;
  cookieSub: string;
  cookieIntro: string;
  cookieS1Title: string;
  cookieS1Text: string;
  cookieS2Title: string;
  cookieS2Items: Array<{ bold: string; text: string }>;
  cookieS3Title: string;
  cookieS3Text: string;

  termsTitle: string;
  termsSub: string;
  termsIntro: string;
  termsS1Title: string;
  termsS1Text: string;
  termsS2Title: string;
  termsS2Text: string;
  termsS3Title: string;
  termsS3Text: string;
  termsS4Title: string;
  termsS4Text: string;
  termsS5Title: string;
  termsS5Text: string;
}> = {
  en: {
    privacyTitle: 'Privacy Policy',
    privacySub: 'Effective Date: September 2026 • Compliant with DPDP Act & GDPR',
    privacyIntro: 'At AstroJunction, accessible from astrojunction.com, the privacy of our visitors and registered users is of utmost importance to us. This Privacy Policy document outlines the types of personal and astrological information that is collected and recorded by AstroJunction and how we utilize and safeguard it.',
    privacyS1Title: '1. Information We Collect',
    privacyS1Text: 'In order to generate mathematically accurate Vedic horoscopes and astrological reports, we collect:',
    privacyS1Items: [
      'Astrological Data: Full Name, Gender, Date of Birth, Time of Birth, and Place of Birth (latitude, longitude, and timezone).',
      'Account Details: Email address, encrypted login passwords, and optional user profile preferences.',
      'Communication Records: Questions submitted during 1-on-1 astrologer consultations.',
      'Approximate Location: We use your approximate location from your IP address only once, to choose the language. We do not store it. (_review)'
    ],
    privacyS2Title: '2. How We Use Your Information',
    privacyS2Text: 'Your birth data is used exclusively to compute planetary positions, divisional charts (D1 to D60), Mahadasha periods, and Panchang calendars. We do not sell, rent, or trade your personal information to third-party ad networks or brokers under any circumstances.',
    privacyS3Title: '3. Data Security & Encryption',
    privacyS3Text: 'We implement industry-standard 256-bit TLS encryption for all data transmitted between your browser and our servers. User records are stored behind secured cloud firewalls with strict role-based access control.',
    privacyS4Title: '4. Your Data Rights & Deletion',
    privacyS4Text: 'You hold complete ownership of your birth information. You may request an export or permanent deletion of your account and all associated Kundlis at any time by contacting our support desk.',

    cookieTitle: 'Cookie Policy',
    cookieSub: 'Effective Date: September 2026 • Transparent Cookie Practices',
    cookieIntro: 'This Cookie Policy explains how AstroJunction uses cookies and similar technologies to remember your preferences and provide a smooth, responsive astrological experience.',
    cookieS1Title: '1. What Are Cookies?',
    cookieS1Text: 'Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work efficiently, as well as to provide information to the site owners.',
    cookieS2Title: '2. How AstroJunction Uses Cookies',
    cookieS2Items: [
      { bold: 'Essential Cookies:', text: ' Necessary for user authentication, security tokens, and maintaining active login sessions.' },
      { bold: 'Preference Cookies:', text: ' Remember your chosen theme (light or dark mode), language, and preferred astrological traditions.' },
      { bold: 'Performance & Cache:', text: ' Enable instant offline rendering of precomputed chart geometries and planetary ephemeris tables.' }
    ],
    cookieS3Title: '3. Managing Your Cookies',
    cookieS3Text: 'Most web browsers allow you to control cookies through their browser settings. You may choose to disable cookies, but please note that certain features of AstroJunction (such as profile logins) may not function properly without them.',

    termsTitle: 'Terms & Conditions',
    termsSub: 'Effective Date: September 2026 • Please read carefully before using AstroJunction',
    termsIntro: 'Welcome to AstroJunction. By accessing or using our website, services, and reports, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our platform.',
    termsS1Title: '1. Nature of Astrological Services',
    termsS1Text: 'Astrological readings, planetary forecasts, Kundli analyses, and consultation recommendations provided by AstroJunction are intended solely for spiritual guidance, personal contemplation, and educational purposes. Astrology is not an exact empirical science and should never substitute for professional medical, legal, psychological, or financial advice.',
    termsS2Title: '2. User Accounts & Conduct',
    termsS2Text: 'You are responsible for maintaining the confidentiality of your account credentials. You agree to provide true and accurate birth details for yourself and any family members for whom you generate charts.',
    termsS3Title: '3. Astrologer Consultations',
    termsS3Text: 'Consultations with our panel of certified Vedic astrologers must adhere to mutual respect and decorum. Any abusive, offensive, or inappropriate behavior during live sessions may result in immediate termination of the session without refund.',
    termsS4Title: '4. Intellectual Property',
    termsS4Text: 'All algorithms, software architectures, written articles, visual designs, and reports published on AstroJunction are the intellectual property of AstroJunction and protected by copyright laws.',
    termsS5Title: '5. Limitation of Liability',
    termsS5Text: 'AstroJunction, its founders, and consulting astrologers shall not be held liable for any decisions, actions, or outcomes undertaken by users based on interpretations of planetary charts or predictions.'
  },
  bn: {
    privacyTitle: 'গোপনীয়তা নীতি (Privacy Policy)',
    privacySub: 'কার্যকর তারিখ: সেপ্টেম্বর ২০২৬ • DPDP আইন ও GDPR সঙ্গতিপূর্ণ',
    privacyIntro: 'অ্যাস্ট্রোজংশন (AstroJunction)-এ আমাদের ভিজিটর ও ব্যবহারকারীদের তথ্যের গোপনীয়তা রক্ষা করা আমাদের অন্যতম প্রধান দায়িত্ব। এই নীতিমালায় ব্যাখ্যা করা হয়েছে কীভাবে আপনার ব্যক্তিগত ও জ্যোতিষীয় তথ্য সংগ্রহ ও সংরক্ষণ করা হয়।',
    privacyS1Title: '১. আমরা যে তথ্য সংগ্রহ করি',
    privacyS1Text: 'সঠিক বৈদিক কুণ্ডলী এবং গ্রহ গণনা সম্পন্ন করার জন্য আমরা নিম্নোক্ত তথ্যসমূহ সংগ্রহ করি:',
    privacyS1Items: [
      'জ্যোতিষীয় তথ্য: পূর্ণ নাম, লিঙ্গ, সঠিক জন্মতারিখ, জন্মসময় এবং জন্মস্থান (অক্ষাংশ, দ্রাঘিমাংশ ও টাইমজোন)।',
      'অ্যাকাউন্ট তথ্য: ইমেল ঠিকানা, এনক্রিপ্ট করা পাসওয়ার্ড এবং ব্যবহারকারীর পছন্দের সেটিংস।',
      'পরামর্শের রেকর্ড: জ্যোতিষী পরামর্শ চলাকালীন আপনার জিজ্ঞাসা ও আলোচনা।',
      'আনুমানিক অবস্থান: আমরা কেবল একবার আপনার ভাষা নির্বাচন করার জন্য আপনার আইপি ঠিকানা থেকে আপনার আনুমানিক অবস্থান ব্যবহার করি। আমরা এটি সংরক্ষণ করি না। (_review)'
    ],
    privacyS2Title: '২. তথ্যের ব্যবহার',
    privacyS2Text: 'আপনার জন্মের তথ্য শুধুমাত্র কুণ্ডলী, বর্গ চার্ট, বিংশোত্তরী দশা এবং পঞ্জিকা গণনার কাজে ব্যবহৃত হয়। আমরা কোনো অবস্থাতেই আপনার তথ্য কোনো তৃতীয় পক্ষ বা বিজ্ঞাপন সংস্থার কাছে বিক্রি বা ভাড়া দিই না।',
    privacyS3Title: '৩. ডেটা সুরক্ষা ও এনক্রিপশন',
    privacyS3Text: 'আপনার ব্রাউজার ও আমাদের সার্ভারের মধ্যে তথ্য আদানপ্রদানে আধুনিক ২৫৬-বিট টিএলএস (TLS) এনক্রিপশন ব্যবহৃত হয়। আপনার তথ্য ক্লাউড ফায়ারওয়ালের মাধ্যমে সুরক্ষিত থাকে।',
    privacyS4Title: '৪. ব্যবহারকারীর অধিকার ও তথ্য মুছে ফেলা',
    privacyS4Text: 'আপনার ব্যক্তিগত তথ্যের ওপর আপনার পূর্ণ নিয়ন্ত্রণ রয়েছে। আপনি চাইলে যে কোনো সময় আমাদের সাথে যোগাযোগ করে আপনার অ্যাকাউন্ট ও সংশ্লিষ্ট সমস্ত কুণ্ডলী সম্পূর্ণ মুছে ফেলতে পারেন।',

    cookieTitle: 'কুকি নীতি (Cookie Policy)',
    cookieSub: 'কার্যকর তারিখ: সেপ্টেম্বর ২০২৬ • স্বচ্ছ কুকি ব্যবস্থাপনা',
    cookieIntro: 'এই কুকি নীতিমালায় ব্যাখ্যা করা হয়েছে কীভাবে অ্যাস্ট্রোজংশন আপনার পছন্দসমূহ মনে রাখতে এবং একটি গতিশীল অভিজ্ঞতা দিতে কুকি ব্যবহার করে।',
    cookieS1Title: '১. কুকি কী?',
    cookieS1Text: 'কুকি হলো ছোট টেক্সট ফাইল যা কোনো ওয়েবসাইট ভিজিট করার সময় আপনার ডিভাইসে সংরক্ষিত হয়, যাতে ওয়েবসাইটটি স্বাচ্ছন্দ্যে কাজ করতে পারে।',
    cookieS2Title: '২. অ্যাস্ট্রোজংশন কীভাবে কুকি ব্যবহার করে',
    cookieS2Items: [
      { bold: 'প্রয়োজনীয় কুকি:', text: ' ব্যবহারকারীর লগইন সেশন চালু রাখতে ও নিরাপত্তা নিশ্চিত করতে।' },
      { bold: 'পছন্দের কুকি:', text: ' আপনার নির্বাচিত থিম (ডার্ক বা লাইট মোড), ভাষা ও জ্যোতিষ ঐতিহ্য মনে রাখতে।' },
      { bold: 'পারফরম্যান্স ও ক্যাশ:', text: ' চার্ট ও গ্রহীয় মানচিত্র দ্রুত প্রদর্শন করতে।' }
    ],
    cookieS3Title: '৩. কুকি নিয়ন্ত্রণ',
    cookieS3Text: 'আপনি চাইলে ব্রাউজার সেটিংস থেকে কুকি নিষ্ক্রিয় করতে পারেন, তবে কিছু সুবিধা (যেমন প্রোফাইল লগইন) সঠিকভাবে কাজ নাও করতে পারে।',

    termsTitle: 'শর্তাবলী ও নিয়মাবলী (Terms & Conditions)',
    termsSub: 'কার্যকর তারিখ: সেপ্টেম্বর ২০২৬ • অনুগ্রহ করে মনোযোগ সহকারে পড়ুন',
    termsIntro: 'অ্যাস্ট্রোজংশনে আপনাকে স্বাগতম। আমাদের ওয়েবসাইট, সেবা ও প্রতিবেদন ব্যবহারের মাধ্যমে আপনি এই শর্তাবলীর সাথে একমত পোষণ করছেন।',
    termsS1Title: '১. জ্যোতিষ সেবার প্রকৃতি',
    termsS1Text: 'অ্যাস্ট্রোজংশন দ্বারা প্রদত্ত কুণ্ডলী বিশ্লেষণ ও পূর্বাভাস কেবল আধ্যাত্মিক দিকনির্দেশনা ও আত্ম-চিন্তার জন্য। এটি কোনোভাবেই আইনি, আর্থিক বা চিকিৎসা সংক্রান্ত পেশাদার মতামতের বিকল্প নয়।',
    termsS2Title: '২. ব্যবহারকারীর অ্যাকাউন্ট ও দায়বদ্ধতা',
    termsS2Text: 'আপনার অ্যাকাউন্ট ক্রেডেনশিয়ালের গোপনীয়তা রক্ষা করার দায়িত্ব আপনার। জন্মকুণ্ডলী তৈরির জন্য সঠিক তথ্য প্রদান করা আবশ্যক।',
    termsS3Title: '৩. জ্যোতিষী পরামর্শ ও সদাচরণ',
    termsS3Text: 'জ্যোতিষীদের সাথে লাইভ পরামর্শের সময় পারস্পরিক সম্মান ও শালীনতা বজায় রাখা বাধ্যতামূলক। কোনো অসদাচরণের ক্ষেত্রে তাৎক্ষণিক সেশন বাতিল হতে পারে।',
    termsS4Title: '৪. বুদ্ধিবৃত্তিক সম্পদ (Intellectual Property)',
    termsS4Text: 'অ্যাস্ট্রোজংশনের সমস্ত অ্যালগরিদম, সফটওয়্যার ডিজাইন, চার্ট ও নিবন্ধ অ্যাস্ট্রোজংশনের বুদ্ধিবৃত্তিক সম্পদ এবং কপিরাইট আইন দ্বারা সংরক্ষিত।',
    termsS5Title: '৫. দায়ের সীমাবদ্ধতা',
    termsS5Text: 'জ্যোতিষীয় পূর্বাভাসের ওপর ভিত্তি করে ব্যবহারকারীর কোনো নিজস্ব সিদ্ধান্ত বা ফলাফলের জন্য অ্যাস্ট্রোজংশন বা পরামর্শক জ্যোতিষী দায়ী থাকবেন না।'
  },
  hi: {
    privacyTitle: 'गोपनीयता नीति (Privacy Policy)',
    privacySub: 'प्रभावी तिथि: सितंबर 2026 • डीपीओके एवं जीडीपीआर के अनुरूप',
    privacyIntro: 'एस्ट्रोजंक्शन पर हमारे सभी उपयोगकर्ताओं की गोपनीयता की रक्षा करना हमारी सर्वोच्च प्राथमिकता है। यह नीति बताती है कि आपकी जानकारी कैसे सुरक्षित रखी जाती है।',
    privacyS1Title: '1. हमारे द्वारा एकत्रित जानकारी',
    privacyS1Text: 'सटीक जन्म कुंडली और ज्योतिषीय रिपोर्ट तैयार करने के लिए हम निम्नलिखित जानकारी एकत्र करते हैं:',
    privacyS1Items: [
      'ज्योतिषीय विवरण: पूरा नाम, लिंग, जन्म तिथि, जन्म समय और जन्म स्थान (अक्षांश, देशांतर और समय क्षेत्र)।',
      'अकाउंट विवरण: ईमेल पता, एन्क्रिप्टेड पासवर्ड और उपयोगकर्ता प्राथमिकताएं।',
      'परामर्श रिकॉर्ड: 1-ऑन-1 ज्योतिष परामर्श के दौरान पूछे गए प्रश्न।',
      'अनुमानित स्थान: हम आपकी भाषा का चयन करने के लिए केवल एक बार आपके आईपी पते से आपके अनुमानित स्थान का उपयोग करते हैं। हम इसे संग्रहीत नहीं करते हैं। (_review)'
    ],
    privacyS2Title: '2. जानकारी का उपयोग',
    privacyS2Text: 'आपके जन्म विवरण का उपयोग केवल ग्रहों की स्थिति, वर्ग कुंडली और दशा की गणना के लिए किया जाता है। हम आपकी जानकारी कभी किसी तीसरे पक्ष को नहीं बेचते।',
    privacyS3Title: '3. डेटा सुरक्षा एवं एन्क्रिप्शन',
    privacyS3Text: 'हम उद्योग-मानक 256-बिट टीएलएस एन्क्रिप्शन और सुरक्षित क्लाउड फायरवॉल का उपयोग करते हैं।',
    privacyS4Title: '4. आपके अधिकार',
    privacyS4Text: 'आप कभी भी हमारे सहायता केंद्र से संपर्क करके अपना खाता और संबंधित सभी कुंडलियां स्थायी रूप से हटा सकते हैं।',

    cookieTitle: 'कुकी नीति (Cookie Policy)',
    cookieSub: 'प्रभावी तिथि: सितंबर 2026 • पारदर्शी कुकी प्रबंधन',
    cookieIntro: 'यह नीति बताती है कि एस्ट्रोजंक्शन बेहतर अनुभव प्रदान करने के लिए कुकीज़ का उपयोग कैसे करता है।',
    cookieS1Title: '1. कुकीज़ क्या हैं?',
    cookieS1Text: 'कुकीज़ छोटी टेक्स्ट फाइलें होती हैं जो वेबसाइटों द्वारा आपकी डिवाइस पर सहेजी जाती हैं ताकि साइट सुचारू रूप से कार्य कर सके।',
    cookieS2Title: '2. एस्ट्रोजंक्शन कुकीज़ का उपयोग कैसे करता है',
    cookieS2Items: [
      { bold: 'अनिवार्य कुकीज़:', text: ' सुरक्षित लॉगिन और प्रमाणीकरण बनाए रखने के लिए।' },
      { bold: 'प्राथमिकता कुकीज़:', text: ' आपकी चुनी हुई भाषा और थीम (लाइट/डार्क मोड) याद रखने के लिए।' },
      { bold: 'प्रदर्शन कुकीज़:', text: ' कुंडली चार्ट और पंचांग को तेजी से लोड करने के लिए।' }
    ],
    cookieS3Title: '3. कुकीज़ का प्रबंधन',
    cookieS3Text: 'आप अपने ब्राउज़र सेटिंग्स से कुकीज़ को अक्षम कर सकते हैं, हालांकि इससे कुछ सुविधाएं प्रभावित हो सकती हैं।',

    termsTitle: 'नियम एवं शर्तें (Terms & Conditions)',
    termsSub: 'प्रभावी तिथि: सितंबर 2026 • उपयोग से पूर्व कृपया ध्यानपूर्वक पढ़ें',
    termsIntro: 'एस्ट्रोजंक्शन में आपका स्वागत है। हमारी वेबसाइट का उपयोग करके आप इन नियमों और शर्तों से बंधे होने के लिए सहमत हैं।',
    termsS1Title: '1. ज्योतिषीय सेवाओं की प्रकृति',
    termsS1Text: 'एस्ट्रोजंक्शन द्वारा प्रदान की गई भविष्यवाणियां और उपाय केवल आध्यात्मिक मार्गदर्शन के लिए हैं। यह किसी कानूनी, वित्तीय या चिकित्सीय सलाह का विकल्प नहीं है।',
    termsS2Title: '2. उपयोगकर्ता खाते एवं आचरण',
    termsS2Text: 'अपने खाते की सुरक्षा बनाए रखना आपकी जिम्मेदारी है। कुंडली बनाने हेतु सही विवरण प्रदान करें।',
    termsS3Title: '3. ज्योतिषी परामर्श',
    termsS3Text: 'ज्योतिषियों के साथ संवाद के दौरान पारस्परिक सम्मान और मर्यादा बनाए रखना अनिवार्य है।',
    termsS4Title: '4. बौद्धिक संपदा',
    termsS4Text: 'एस्ट्रोजंक्शन पर उपलब्ध सभी एल्गोरिदम, डिज़ाइन और रिपोर्ट एस्ट्रोजंक्शन की बौद्धिक संपदा हैं।',
    termsS5Title: '5. दायित्व की सीमा',
    termsS5Text: 'ज्योतिषीय गणनाओं के आधार पर लिए गए किसी भी निर्णय के लिए एस्ट्रोजंक्शन उत्तरदायी नहीं होगा।'
  },
  ta: {
    privacyTitle: 'தனியுரிமைக் கொள்கை',
    privacySub: 'செப்டம்பர் 2026 முதல் அமலுக்கு வருகிறது',
    privacyIntro: 'ஆஸ்ட்ரோஜங்க்ஷன் தளத்தைப் பயன்படுத்தும் உங்கள் தனிப்பட்ட தகவல்களைப் பாதுகாப்பதே எங்கள் முதன்மை கடமையாகும்.',
    privacyS1Title: '1. நாங்கள் சேகரிக்கும் தகவல்கள்',
    privacyS1Text: 'துல்லியமான ஜாதகத்தைக் கணிக்க பின்வரும் தகவல்களைச் சேகரிக்கிறோம்:',
    privacyS1Items: [
      'ஜாதகத் தகவல்கள்: பெயர், பாலினம், பிறந்த தேதி, பிறந்த நேரம் மற்றும் பிறந்த இடம்.',
      'கணக்கு விவரங்கள்: மின்னஞ்சல் மற்றும் கடவுச்சொல்.',
      'ஆலோசனை பதிவுகள்: நேரடி ஆலோசனையின் போது கேட்கப்பட்ட கேள்விகள்.',
      'தோராயமான இருப்பிடம்: மொழியைத் தேர்வுசெய்ய உங்கள் ஐபி முகவரியிலிருந்து உங்கள் தோராயமான இருப்பிடத்தை ஒருமுறை மட்டுமே பயன்படுத்துகிறோம். நாங்கள் அதைச் சேமிப்பதில்லை. (_review)'
    ],
    privacyS2Title: '2. தகவல்களின் பயன்பாடு',
    privacyS2Text: 'உங்கள் தகவல்கள் கிரக நிலைகளைக் கணக்கிட மட்டுமே பயன்படுத்தப்படுகின்றன. யாருக்கும் விற்கப்படாது.',
    privacyS3Title: '3. பாதுகாப்பு & குறியாக்கம்',
    privacyS3Text: '256-பிட் குறியாக்கம் மூலம் உங்கள் தரவு எப்போதும் பாதுகாக்கப்படுகிறது.',
    privacyS4Title: '4. உங்கள் உரிமைகள்',
    privacyS4Text: 'எப்போது வேண்டுமானாலும் உங்கள் கணக்கையும் ஜாதகங்களையும் நீக்கக் கோரலாம்.',

    cookieTitle: 'குக்கீ கொள்கை',
    cookieSub: 'செப்டம்பர் 2026 முதல் அமலுக்கு வருகிறது',
    cookieIntro: 'உங்கள் விருப்பங்களை நினைவில் வைத்துக் கொள்ள நாங்கள் குக்கீகளை எவ்வாறு பயன்படுத்துகிறோம் என்பதை இது விளக்குகிறது.',
    cookieS1Title: '1. குக்கீ என்றால் என்ன?',
    cookieS1Text: 'வலைத்தளங்களை சீராக இயக்க உங்கள் சாதனத்தில் சேமிக்கப்படும் சிறிய கோப்புகள்.',
    cookieS2Title: '2. எங்களின் குக்கீ பயன்பாடு',
    cookieS2Items: [
      { bold: 'அத்தியாவசிய குக்கீகள்:', text: ' பாதுகாப்பான உள்நுழைவுக்கு.' },
      { bold: 'விருப்பக் குக்கீகள்:', text: ' மொழி மற்றும் தீம் நினைவில் கொள்ள.' },
      { bold: 'செயல்திறன் குக்கீகள்:', text: ' விரைவான பக்க ஏற்றுதலுக்கு.' }
    ],
    cookieS3Title: '3. கட்டுப்பாடு',
    cookieS3Text: 'உலாவி அமைப்புகளில் இருந்து குக்கீகளை முடக்கலாம்.',

    termsTitle: 'விதிமுறைகள் மற்றும் நிபந்தனைகள்',
    termsSub: 'செப்டம்பர் 2026 முதல் அமலுக்கு வருகிறது',
    termsIntro: 'ஆஸ்ட்ரோஜங்க்ஷன் தளத்தைப் பயன்படுத்துவதன் மூலம் இந்த விதிமுறைகளை ஏற்கிறீர்கள்.',
    termsS1Title: '1. சேவையின் தன்மை',
    termsS1Text: 'ஜோதிட வழிகாட்டல்கள் ஆன்மீக நோக்கத்திற்காக மட்டுமே. இது சட்ட அல்லது மருத்துவ ஆலோசனை அல்ல.',
    termsS2Title: '2. பயனர் நடத்தை',
    termsS2Text: 'துல்லியமான பிறந்த தகவல்களை வழங்க வேண்டும்.',
    termsS3Title: '3. ஜோதிடர் ஆலோசனைகள்',
    termsS3Text: 'ஆலோசனையின் போது பரஸ்பர மரியாதையைக் கடைப்பிடிக்க வேண்டும்.',
    termsS4Title: '4. பதிப்புரிமை',
    termsS4Text: 'அனைத்து மென்பொருள் மற்றும் அறிக்கைகளும் ஆஸ்ட்ரோஜங்க்ஷனின் சொத்து.',
    termsS5Title: '5. பொறுப்பு வரம்பு',
    termsS5Text: 'ஜோதிட கணிப்புகளின் அடிப்படையில் எடுக்கப்படும் முடிவுகளுக்கு நிர்வாகம் பொறுப்பல்ல.'
  },
  fr: {
    privacyTitle: 'Politique de Confidentialité',
    privacySub: 'Date d\'entrée en vigueur : Septembre 2026 • Conforme RGPD',
    privacyIntro: 'Chez AstroJunction, la confidentialité de vos informations astrologiques et personnelles est une priorité absolue.',
    privacyS1Title: '1. Informations Collectées',
    privacyS1Text: 'Pour dresser un thème astral védique précis, nous recueillons :',
    privacyS1Items: [
      'Données astrologiques : Nom, genre, date, heure exacte et lieu de naissance.',
      'Données de compte : Adresse e-mail et mot de passe chiffré.',
      'Consultations : Questions posées lors des échanges privés.',
      'Localisation approximative : Nous utilisons votre position approximative à partir de votre adresse IP une seule fois, pour choisir la langue. Nous ne la conservons pas. (_review)'
    ],
    privacyS2Title: '2. Utilisation des Données',
    privacyS2Text: 'Vos coordonnées astrales servent uniquement au calcul des éphémérides et cartes divisionnaires. Nous ne vendons aucune donnée.',
    privacyS3Title: '3. Sécurité & Chiffrement',
    privacyS3Text: 'Protocole TLS 256 bits et serveurs sécurisés avec contrôle d\'accès strict.',
    privacyS4Title: '4. Vos Droits',
    privacyS4Text: 'Vous pouvez demander la suppression définitive de votre compte et de vos thèmes à tout moment.',

    cookieTitle: 'Politique relative aux Cookies',
    cookieSub: 'Date d\'entrée en vigueur : Septembre 2026',
    cookieIntro: 'Cette politique détaille notre usage des cookies pour optimiser votre expérience.',
    cookieS1Title: '1. Que sont les Cookies ?',
    cookieS1Text: 'De petits fichiers textes déposés sur votre terminal assurant le bon fonctionnement du site.',
    cookieS2Title: '2. Utilisation par AstroJunction',
    cookieS2Items: [
      { bold: 'Essentiels :', text: ' Maintien sécurisé de votre session connectée.' },
      { bold: 'Préférences :', text: ' Mémorisation de votre langue et du thème sombre/clair.' },
      { bold: 'Performance :', text: ' Chargement rapide des calculs astrologiques.' }
    ],
    cookieS3Title: '3. Gestion',
    cookieS3Text: 'Vous pouvez désactiver les cookies dans votre navigateur à tout moment.',

    termsTitle: 'Conditions Générales d\'Utilisation',
    termsSub: 'Date d\'entrée en vigueur : Septembre 2026',
    termsIntro: 'En accédant aux services d\'AstroJunction, vous acceptez pleinement les présentes conditions.',
    termsS1Title: '1. Nature des Services',
    termsS1Text: 'Les prévisions et interprétations constituent une guidance spirituelle et ne remplacent aucun avis médical ou juridique.',
    termsS2Title: '2. Comptes Utilisateurs',
    termsS2Text: 'Vous êtes responsable de l\'exactitude des coordonnées natales renseignées.',
    termsS3Title: '3. Consultations',
    termsS3Text: 'Courtoisie et respect mutuel sont requis durant les échanges.',
    termsS4Title: '4. Propriété Intellectuelle',
    termsS4Text: 'L\'ensemble des algorithmes, designs et textes demeure la propriété exclusive d\'AstroJunction.',
    termsS5Title: '5. Limitation de Responsabilité',
    termsS5Text: 'AstroJunction décline toute responsabilité quant aux décisions prises suite à la lecture des thèmes.'
  }
};

export const LegalInfoPage: React.FC<LegalInfoPageProps> = ({
  view,
  theme = 'dark',
  onBack,
}) => {
  const { i18n } = useTranslation();
  const currentLang = (i18n?.language || 'en').split('-')[0];
  const activeLang = ['en', 'hi', 'bn', 'ta', 'fr'].includes(currentLang) ? currentLang : 'en';

  const isLight = theme === 'light';
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const about = ABOUT_CONTENT[activeLang] || ABOUT_CONTENT.en;
  const faqsData = FAQS_CONTENT[activeLang] || FAQS_CONTENT.en;
  const legal = LEGAL_TEXTS[activeLang] || LEGAL_TEXTS.en;
  const backLabel = BACK_LABELS[activeLang] || BACK_LABELS.en;

  return (
    <div className="w-full py-8 transition-colors duration-300 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`rounded-3xl p-6 sm:p-10 border shadow-2xl backdrop-blur-xl transition-all duration-300 ${
          isLight ? 'bg-white/90 border-[#E5E1D8]' : 'bg-[#141418]/85 border-[#2A2A2E]'
        }`}>
        {/* Navigation Bar: Back Option */}
        <div className="mb-6">
          <button
            onClick={() => {
              if (onBack) {
                onBack();
              } else if (window.history.length > 1) {
                window.history.back();
              } else {
                window.location.href = '/';
              }
            }}
            className={`inline-flex items-center space-x-2 text-sm font-medium transition cursor-pointer ${
              isLight ? 'text-[#8C6218] hover:text-[#5C4010]' : 'text-[#C9A050] hover:text-[#E2C375]'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{backLabel}</span>
          </button>
        </div>

        {/* ================= PAGE: ABOUT US ================= */}
        {view === 'about-us' && (
          <article className="space-y-6 astro-prose-justified">
            <h1
              className={`text-3xl sm:text-4xl font-serif font-bold text-center mb-8 ${
                isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'
              }`}
            >
              {about.title}
            </h1>

            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              {about.p1}
            </p>

            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              {about.p2}
            </p>

            <h2
              className={`text-2xl font-serif font-bold pt-4 mb-2 ${
                isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'
              }`}
            >
              {about.missionTitle}
            </h2>

            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              {about.missionP1}
            </p>

            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              {about.missionP2}
            </p>

            <ul className={`space-y-3 pl-2 text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              {about.bullets.map((b, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#C9A050] font-bold">•</span>
                  <span>
                    <strong>{b.bold}</strong>{b.text}
                  </span>
                </li>
              ))}
            </ul>

            <h2
              className={`text-2xl font-serif font-bold pt-4 mb-2 ${
                isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'
              }`}
            >
              {about.visionTitle}
            </h2>

            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              {about.visionText}
            </p>
          </article>
        )}

        {/* ================= PAGE: FAQ ================= */}
        {view === 'faq' && (
          <article className="space-y-6 astro-prose-justified">
            <h1
              className={`text-3xl sm:text-4xl font-serif font-bold text-center mb-8 ${
                isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'
              }`}
            >
              {faqsData.title}
            </h1>

            <p className={`text-sm sm:text-base leading-relaxed mb-6 text-center ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              {faqsData.subtitle}
            </p>

            <div className="space-y-4 pt-2">
              {faqsData.items.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className={`border-b pb-4 transition-colors ${
                      isLight ? 'border-[#EADBBE]' : 'border-[#2A2A34]'
                    }`}
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between py-2 text-left cursor-pointer focus:outline-none"
                    >
                      <span
                        className={`text-base sm:text-lg font-serif font-semibold pr-4 ${
                          isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'
                        }`}
                      >
                        {faq.q}
                      </span>
                      <div
                        className={`w-6 h-6 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-[#C9A050]' : 'text-gray-400'
                        }`}
                      >
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </button>
                    {isOpen && (
                      <p className={`pt-2 text-sm sm:text-base leading-relaxed astro-prose-justified ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </article>
        )}

        {/* ================= PAGE: PRIVACY POLICY ================= */}
        {view === 'privacy-policy' && (
          <article className="space-y-6 astro-prose-justified">
            <h1
              className={`text-3xl sm:text-4xl font-serif font-bold text-center mb-2 ${
                isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'
              }`}
            >
              {legal.privacyTitle}
            </h1>
            <p className="text-center text-xs text-gray-500 mb-8">
              {legal.privacySub}
            </p>

            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              {legal.privacyIntro}
            </p>

            <h2 className={`text-xl font-serif font-bold pt-4 mb-2 ${isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'}`}>
              {legal.privacyS1Title}
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              {legal.privacyS1Text}
            </p>
            <ul className={`space-y-2 pl-2 text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              {legal.privacyS1Items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#C9A050] font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <h2 className={`text-xl font-serif font-bold pt-4 mb-2 ${isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'}`}>
              {legal.privacyS2Title}
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              {legal.privacyS2Text}
            </p>

            <h2 className={`text-xl font-serif font-bold pt-4 mb-2 ${isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'}`}>
              {legal.privacyS3Title}
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              {legal.privacyS3Text}
            </p>

            <h2 className={`text-xl font-serif font-bold pt-4 mb-2 ${isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'}`}>
              {legal.privacyS4Title}
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              {legal.privacyS4Text}
            </p>
          </article>
        )}

        {/* ================= PAGE: COOKIE POLICY ================= */}
        {view === 'cookie-policy' && (
          <article className="space-y-6 astro-prose-justified">
            <h1
              className={`text-3xl sm:text-4xl font-serif font-bold text-center mb-2 ${
                isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'
              }`}
            >
              {legal.cookieTitle}
            </h1>
            <p className="text-center text-xs text-gray-500 mb-8">
              {legal.cookieSub}
            </p>

            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              {legal.cookieIntro}
            </p>

            <h2 className={`text-xl font-serif font-bold pt-4 mb-2 ${isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'}`}>
              {legal.cookieS1Title}
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              {legal.cookieS1Text}
            </p>

            <h2 className={`text-xl font-serif font-bold pt-4 mb-2 ${isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'}`}>
              {legal.cookieS2Title}
            </h2>
            <ul className={`space-y-3 pl-2 text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              {legal.cookieS2Items.map((cItem, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#C9A050] font-bold">•</span>
                  <span>
                    <strong>{cItem.bold}</strong>{cItem.text}
                  </span>
                </li>
              ))}
            </ul>

            <h2 className={`text-xl font-serif font-bold pt-4 mb-2 ${isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'}`}>
              {legal.cookieS3Title}
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              {legal.cookieS3Text}
            </p>
          </article>
        )}

        {/* ================= PAGE: TERMS & CONDITIONS ================= */}
        {view === 'terms-and-conditions' && (
          <article className="space-y-6 astro-prose-justified">
            <h1
              className={`text-3xl sm:text-4xl font-serif font-bold text-center mb-2 ${
                isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'
              }`}
            >
              {legal.termsTitle}
            </h1>
            <p className="text-center text-xs text-gray-500 mb-8">
              {legal.termsSub}
            </p>

            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              {legal.termsIntro}
            </p>

            <h2 className={`text-xl font-serif font-bold pt-4 mb-2 ${isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'}`}>
              {legal.termsS1Title}
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              {legal.termsS1Text}
            </p>

            <h2 className={`text-xl font-serif font-bold pt-4 mb-2 ${isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'}`}>
              {legal.termsS2Title}
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              {legal.termsS2Text}
            </p>

            <h2 className={`text-xl font-serif font-bold pt-4 mb-2 ${isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'}`}>
              {legal.termsS3Title}
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              {legal.termsS3Text}
            </p>

            <h2 className={`text-xl font-serif font-bold pt-4 mb-2 ${isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'}`}>
              {legal.termsS4Title}
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              {legal.termsS4Text}
            </p>

            <h2 className={`text-xl font-serif font-bold pt-4 mb-2 ${isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'}`}>
              {legal.termsS5Title}
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              {legal.termsS5Text}
            </p>
          </article>
        )}
        </div>
      </div>
    </div>
  );
};
export default LegalInfoPage;
