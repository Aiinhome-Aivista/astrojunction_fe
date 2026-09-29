import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Moon,
  Sun,
  MapPin,
  X,
  ArrowRightLeft,
  Sparkles,
  Star,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { API_ENDPOINTS } from '../config/api_config';

// ---------------- Data Dictionaries & Translations ----------------

export const BENGALI_MONTHS_LIST = [
  { en: 'Baisakh', bn: 'বৈশাখ', hi: 'वैशाख' },
  { en: 'Jaistha', bn: 'জ্যৈষ্ঠ', hi: 'ज्येष्ठ' },
  { en: 'Ashar', bn: 'আষাঢ়', hi: 'आषाढ़' },
  { en: 'Sraban', bn: 'শ্রাবণ', hi: 'श्रावण' },
  { en: 'Bhadra', bn: 'ভাদ্র', hi: 'भाद्रपद' },
  { en: 'Aswin', bn: 'আশ্বিন', hi: 'आश्विन' },
  { en: 'Kartik', bn: 'কার্তিক', hi: 'कार्तिक' },
  { en: 'Agrahayan', bn: 'অগ্রহায়ণ', hi: 'मार्गशीर्ष' },
  { en: 'Poush', bn: 'পৌষ', hi: 'पौष' },
  { en: 'Magh', bn: 'মাঘ', hi: 'माघ' },
  { en: 'Falgun', bn: 'ফাল্গুন', hi: 'फाल्गुन' },
  { en: 'Chaitra', bn: 'চৈত্র', hi: 'चैत्र' },
];

export const HINDI_MONTHS_LIST = [
  { en: 'Chaitra', hi: 'चैत्र', bn: 'চৈত্র' },
  { en: 'Vaisakha', hi: 'वैशाख', bn: 'বৈশাখ' },
  { en: 'Jyaistha', hi: 'ज्येष्ठ', bn: 'জ্যৈষ্ঠ' },
  { en: 'Ashadha', hi: 'आषाढ़', bn: 'আষাঢ়' },
  { en: 'Shravana', hi: 'श्रावण', bn: 'শ্রাবণ' },
  { en: 'Bhadrapada', hi: 'भाद्रपद', bn: 'ভাদ্র' },
  { en: 'Ashvina', hi: 'आश्विन', bn: 'আশ্বিন' },
  { en: 'Kartika', hi: 'कार्तिक', bn: 'কার্তিক' },
  { en: 'Margashirsha', hi: 'मार्गशीर्ष', bn: 'অগ্রহায়ণ' },
  { en: 'Pausha', hi: 'पौष', bn: 'পৌষ' },
  { en: 'Magha', hi: 'माघ', bn: 'মাঘ' },
  { en: 'Phalguna', hi: 'फाल्गुन', bn: 'ফাল্গুন' },
];

export const TITHI_MAP: Record<string, { en: string; bn: string; hi: string }> = {
  Pratipada: { en: 'Pratipada', bn: 'প্রতিপদ', hi: 'प्रतिपदा' },
  Dwitiya: { en: 'Dwitiya', bn: 'দ্বিতীয়া', hi: 'द्वितीया' },
  Tritiya: { en: 'Tritiya', bn: 'তৃতীয়া', hi: 'तृतीया' },
  Chaturthi: { en: 'Chaturthi', bn: 'চতুর্থী', hi: 'चतुर्थी' },
  Panchami: { en: 'Panchami', bn: 'পঞ্চমী', hi: 'पंचमी' },
  Shashthi: { en: 'Shashthi', bn: 'ষষ্ঠী', hi: 'षष्ठी' },
  Saptami: { en: 'Saptami', bn: 'সপ্তমী', hi: 'सप्तमी' },
  Ashtami: { en: 'Ashtami', bn: 'অষ্টমী', hi: 'अष्टमी' },
  Navami: { en: 'Navami', bn: 'নবমী', hi: 'नवमी' },
  Dashami: { en: 'Dashami', bn: 'দশমী', hi: 'दशमी' },
  Ekadashi: { en: 'Ekadashi', bn: 'একাদশী', hi: 'एकादशी' },
  Dwadashi: { en: 'Dwadashi', bn: 'দ্বাদশী', hi: 'द्वादशी' },
  Trayodashi: { en: 'Trayodashi', bn: 'ত্রয়োদশী', hi: 'त्रयोदशी' },
  Chaturdashi: { en: 'Chaturdashi', bn: 'চতুর্দশী', hi: 'चतुर्दशी' },
  Purnima: { en: 'Purnima', bn: 'পূর্ণিমা', hi: 'पूर्णिमा' },
  Amavasya: { en: 'Amavasya', bn: 'অমাবস্যা', hi: 'अमावस्या' },
};

export const WEEKDAYS_MAP = [
  { en: 'Sun', bn: 'রবি', hi: 'रवि', fullEn: 'Sunday', fullBn: 'রবিবার', fullHi: 'रविवार' },
  { en: 'Mon', bn: 'সোম', hi: 'सोम', fullEn: 'Monday', fullBn: 'সোমবার', fullHi: 'सोमवार' },
  { en: 'Tue', bn: 'মঙ্গল', hi: 'मंगल', fullEn: 'Tuesday', fullBn: 'মঙ্গলবার', fullHi: 'मंगलवार' },
  { en: 'Wed', bn: 'বুধ', hi: 'बुध', fullEn: 'Wednesday', fullBn: 'বুধবার', fullHi: 'बुधवार' },
  { en: 'Thu', bn: 'বৃহ', hi: 'गुरु', fullEn: 'Thursday', fullBn: 'বৃহস্পতিবার', fullHi: 'गुरुवार' },
  { en: 'Fri', bn: 'শুক্র', hi: 'शुक्र', fullEn: 'Friday', fullBn: 'শুক্রবার', fullHi: 'शुक्रवार' },
  { en: 'Sat', bn: 'শনি', hi: 'शनि', fullEn: 'Saturday', fullBn: 'শনিবার', fullHi: 'शनिवार' },
];

export const LOCATIONS = [
  { name: 'Kolkata, India', lat: 22.5726, lon: 88.3639 },
  { name: 'New Delhi, India', lat: 28.6139, lon: 77.2090 },
  { name: 'Mumbai, India', lat: 19.0760, lon: 72.8777 },
  { name: 'Dhaka, Bangladesh', lat: 23.8103, lon: 90.4125 },
  { name: 'New York, USA', lat: 40.7128, lon: -74.0060 },
  { name: 'London, UK', lat: 51.5074, lon: -0.1278 },
  { name: 'Dubai, UAE', lat: 25.2048, lon: 55.2708 },
];

export const toBengaliNum = (num: string | number): string => {
  const digits: Record<string, string> = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
  };
  return String(num).replace(/[0-9]/g, (d) => digits[d] || d);
};

export const toHindiNum = (num: string | number): string => {
  const digits: Record<string, string> = {
    '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
    '5': '५', '6': '६', '7': '७', '8': '८', '9': '९',
  };
  return String(num).replace(/[0-9]/g, (d) => digits[d] || d);
};

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const PANCHANG_TERMS_MAP: Record<string, {bn: string; hi: string}> = {
  'Ashwini': { bn: 'অশ্বিনী', hi: 'अश्विनी' },
  'Bharani': { bn: 'ভরণী', hi: 'भरणी' },
  'Krittika': { bn: 'কৃত্তিকা', hi: 'कृत्तिका' },
  'Rohini': { bn: 'রোহিণী', hi: 'रोहिणी' },
  'Mrigashira': { bn: 'মৃগশিরা', hi: 'मृगशिरा' },
  'Ardra': { bn: 'আর্দ্রা', hi: 'आर्द्रा' },
  'Punarvasu': { bn: 'পুনর্বসু', hi: 'पुनर्वसु' },
  'Pushya': { bn: 'পুষ্যা', hi: 'पुष्य' },
  'Ashlesha': { bn: 'অশ্লেষা', hi: 'आश्लेषा' },
  'Magha': { bn: 'মঘা', hi: 'मघा' },
  'Purva Phalguni': { bn: 'পূর্ব ফাল্গুনী', hi: 'पूर्वाफाल्गुनी' },
  'Uttara Phalguni': { bn: 'উত্তর ফাল্গুনী', hi: 'उत्तराफाल्गुनी' },
  'Hasta': { bn: 'হস্তা', hi: 'हस्त' },
  'Chitra': { bn: 'চিত্রা', hi: 'चित्रा' },
  'Swati': { bn: 'স্বাতী', hi: 'स्वाती' },
  'Vishakha': { bn: 'বিশাখা', hi: 'विशाखा' },
  'Anuradha': { bn: 'অনুরাধা', hi: 'अनुराधा' },
  'Jyeshtha': { bn: 'জ্যেষ্ঠা', hi: 'ज्येष्ठा' },
  'Mula': { bn: 'মূলা', hi: 'मूल' },
  'Purva Ashadha': { bn: 'পূর্বাষাঢ়া', hi: 'पूर्वाषाढ़ा' },
  'Uttara Ashadha': { bn: 'উত্তরাষাঢ়া', hi: 'उत्तराषाढ़ा' },
  'Shravana': { bn: 'শ্রবণা', hi: 'श्रवण' },
  'Dhanishta': { bn: 'ধনিষ্ঠা', hi: 'धनिष्ठा' },
  'Shatabhisha': { bn: 'শতভিষা', hi: 'शतभिषा' },
  'Purva Bhadrapada': { bn: 'পূর্বভাদ্রপদ', hi: 'पूर्वाभाद्रपद' },
  'Uttara Bhadrapada': { bn: 'উত্তরভাদ্রপদ', hi: 'उत्तराभाद्रपद' },
  'Revati': { bn: 'রেবতী', hi: 'रेवती' },

  'Vishkumbha': { bn: 'বিষ্কুম্ভ', hi: 'विष्कुम्भ' },
  'Priti': { bn: 'প্রীতি', hi: 'प्रीति' },
  'Ayushman': { bn: 'আয়ুষ্মান', hi: 'आयुष्मान' },
  'Saubhagya': { bn: 'সৌভাগ্য', hi: 'सौभाग्य' },
  'Shobhana': { bn: 'শোভন', hi: 'शोभन' },
  'Atiganda': { bn: 'অতিগণ্ড', hi: 'अतिगण्ड' },
  'Sukarma': { bn: 'সুকর্মা', hi: 'सुकर्मा' },
  'Dhriti': { bn: 'ধৃতি', hi: 'धृति' },
  'Shula': { bn: 'শূল', hi: 'शूल' },
  'Ganda': { bn: 'গণ্ড', hi: 'गण्ड' },
  'Vriddhi': { bn: 'বৃদ্ধি', hi: 'वृद्धि' },
  'Dhruva': { bn: 'ধ্রুব', hi: 'ध्रुव' },
  'Vyaghata': { bn: 'ব্যাঘাত', hi: 'व्याघात' },
  'Harshana': { bn: 'হর্ষণ', hi: 'हर्षण' },
  'Vajra': { bn: 'বজ্র', hi: 'वज्र' },
  'Siddhi': { bn: 'সিদ্ধি', hi: 'सिद्धि' },
  'Vyatipata': { bn: 'ব্যতিপাত', hi: 'व्यतीपात' },
  'Variyan': { bn: 'বরীয়ান', hi: 'वरीयान' },
  'Parigha': { bn: 'পরিঘ', hi: 'परिघ' },
  'Shiva': { bn: 'শিব', hi: 'शिव' },
  'Siddha': { bn: 'সিদ্ধ', hi: 'सिद्ध' },
  'Sadhya': { bn: 'সাধ্য', hi: 'साध्य' },
  'Shubha': { bn: 'শুভ', hi: 'शुभ' },
  'Shukla': { bn: 'শুক্ল', hi: 'शुक्ल' },
  'Brahma': { bn: 'ব্রহ্ম', hi: 'ब्रह्म' },
  'Indra': { bn: 'ইন্দ্র', hi: 'इन्द्र' },
  'Vaidhriti': { bn: 'বৈধৃতি', hi: 'वैधृति' },

  'Bava': { bn: 'বব', hi: 'बव' },
  'Balava': { bn: 'বালব', hi: 'बालव' },
  'Kaulava': { bn: 'কৌলব', hi: 'कौलव' },
  'Taitila': { bn: 'তৈতিল', hi: 'तैतिल' },
  'Gara': { bn: 'গর', hi: 'गर' },
  'Vanija': { bn: 'বণিজ', hi: 'वणिज' },
  'Vishti': { bn: 'বিষ্টি', hi: 'विष्टि' },
  'Shakuni': { bn: 'শকুনি', hi: 'शकुनि' },
  'Chatushpada': { bn: 'চতুষ্পদ', hi: 'चतुष्पद' },
  'Naga': { bn: 'নাগ', hi: 'नाग' },
  'Kintughna': { bn: 'কিস্তুঘ্ন', hi: 'किस्तुघ्न' },

  'Mesha (Aries)': { bn: 'মেষ', hi: 'मेष' },
  'Vrishabha (Taurus)': { bn: 'বৃষ', hi: 'वृषभ' },
  'Mithuna (Gemini)': { bn: 'মিথুন', hi: 'मिथुन' },
  'Karka (Cancer)': { bn: 'কর্কট', hi: 'कर्क' },
  'Simha (Leo)': { bn: 'সিংহ', hi: 'सिंह' },
  'Kanya (Virgo)': { bn: 'কন্যা', hi: 'कन्या' },
  'Tula (Libra)': { bn: 'তুলা', hi: 'तुला' },
  'Vrishchika (Scorpio)': { bn: 'বৃশ্চিক', hi: 'वृश्चिक' },
  'Dhanu (Sagittarius)': { bn: 'ধনু', hi: 'धनु' },
  'Makara (Capricorn)': { bn: 'মকর', hi: 'मकर' },
  'Kumbha (Aquarius)': { bn: 'কুম্ভ', hi: 'कुंभ' },
  'Meena (Pisces)': { bn: 'মীন', hi: 'मीन' },

  'Vasant (Spring)': { bn: 'বসন্ত', hi: 'वसंत' },
  'Grishma (Summer)': { bn: 'গ্রীষ্ম', hi: 'ग्रीष्म' },
  'Varsha (Monsoon)': { bn: 'বর্ষা', hi: 'वर्षा' },
  'Sharad (Autumn)': { bn: 'শরৎ', hi: 'शरद' },
  'Hemant (Pre-Winter)': { bn: 'হেমন্ত', hi: 'हेमंत' },
  'Shishir (Winter)': { bn: 'শীত', hi: 'शिशिर' }
};

interface PanjikaCalendarViewProps {
  theme?: 'light' | 'dark';
}

export const PanjikaCalendarView: React.FC<PanjikaCalendarViewProps> = ({ theme = 'dark' }) => {
  // Navigation & Sub-views
  const [activeSubTab, setActiveSubTab] = useState<'calendar' | 'converter'>('calendar');
  const [calendarLang, setCalendarLang] = useState<'all' | 'bn' | 'hi' | 'en'>('all');

  // Loaders for smooth interactive transition
  const [tabLoading, setTabLoading] = useState<boolean>(false);
  const [langLoading, setLangLoading] = useState<boolean>(false);

  // Calendar State
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [calendarData, setCalendarData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [location, setLocation] = useState(LOCATIONS[0]);

  // 6-Way Converter State
  const [convertFrom, setConvertFrom] = useState<'english' | 'bengali' | 'hindi'>('english');
  const [convertTo, setConvertTo] = useState<'english' | 'bengali' | 'hindi'>('bengali');

  const [engDate, setEngDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [benDay, setBenDay] = useState<string>('16');
  const [benMonth, setBenMonth] = useState<string>('Bhadra');
  const [benYear, setBenYear] = useState<string>('1433');

  const [hinTithi, setHinTithi] = useState<string>('Panchami');
  const [hinPaksha, setHinPaksha] = useState<string>('Krishna');
  const [hinMonth, setHinMonth] = useState<string>('Bhadrapada');
  const [hinYear, setHinYear] = useState<string>('2083');

  const [conversionLoading, setConversionLoading] = useState<boolean>(false);
  const [conversionResult, setConversionResult] = useState<any>(null);

  // Detail Modal State
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [fullPanjika, setFullPanjika] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState<boolean>(false);

  // Fetch month calendar data
  useEffect(() => {
    fetchMonthData(currentDate.getFullYear(), currentDate.getMonth() + 1);
  }, [currentDate, location]);

  const fetchMonthData = async (year: number, month: number) => {
    setLoading(true);
    try {
      const res = await api.post<any>(API_ENDPOINTS.CALENDAR.MONTH, {
        year,
        month,
        lat: location.lat,
        lon: location.lon,
      });
      setCalendarData(res);
    } catch (error) {
      console.error('Error fetching calendar:', error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 250);
    }
  };

  const handleTabSwitch = (tab: 'calendar' | 'converter') => {
    if (activeSubTab === tab) return;
    setTabLoading(true);
    setActiveSubTab(tab);
    setTimeout(() => {
      setTabLoading(false);
    }, 350);
  };

  const handleLanguageChange = (newLang: 'all' | 'bn' | 'hi' | 'en') => {
    // Do NOT reset selectedDay — we don't want modal to close when language changes
    setCalendarLang(newLang);
  };

  const fetchFullPanjika = async (dateStr: string) => {
    setModalLoading(true);
    try {
      const res = await api.post<any>(API_ENDPOINTS.CALENDAR.FULL_PANJIKA, {
        date: dateStr,
        lat: location.lat,
        lon: location.lon,
      });
      setFullPanjika(res);
    } catch (error) {
      console.error('Error fetching full panjika:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const openDayModal = (dayData: any) => {
    setSelectedDay(dayData);
    setFullPanjika(null);
    fetchFullPanjika(dayData.english_date);
  };

  // Convert Date
  const handleConvert = async () => {
    setConversionLoading(true);
    let payload: any = { from_type: convertFrom, lat: location.lat, lon: location.lon };

    if (convertFrom === 'english') {
      payload.date = engDate;
    } else if (convertFrom === 'bengali') {
      payload.day = benDay;
      payload.month = benMonth;
      payload.year = benYear;
    } else if (convertFrom === 'hindi') {
      payload.tithi = hinTithi;
      payload.paksha = hinPaksha;
      payload.month = hinMonth;
      payload.year = hinYear;
    }

    try {
      const res = await api.post<any>(API_ENDPOINTS.CALENDAR.CONVERT, payload);
      setConversionResult(res);
    } catch (error) {
      console.error('Error converting date:', error);
      setConversionResult({ error: 'Date not found or invalid calculation.' });
    } finally {
      setConversionLoading(false);
    }
  };

  useEffect(() => {
    handleConvert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convertFrom, convertTo, engDate, benDay, benMonth, benYear, hinTithi, hinPaksha, hinMonth, hinYear, location]);

  const handleSwapConverter = () => {
    const prevFrom = convertFrom;
    const prevTo = convertTo;
    setConvertFrom(prevTo);
    setConvertTo(prevFrom);
  };

  const nextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const isDark = theme === 'dark';

  // Format Helper for Bengali dates
  const formatBengaliDisplay = (rawBengaliStr: string) => {
    if (!rawBengaliStr) return '';
    const parts = rawBengaliStr.split(' ');
    const day = parts[0] || '';
    const monthEn = parts[1] || '';
    const year = parts[2] || '';
    const mObj = BENGALI_MONTHS_LIST.find((m) => m.en.toLowerCase() === monthEn.toLowerCase());
    const monthBn = mObj ? mObj.bn : monthEn;
    return `${toBengaliNum(day)} ${monthBn} ${toBengaliNum(year)} বঙ্গাব্দ`;
  };

  // Format Helper for Bengali dates — English display
  const formatBengaliDisplayEn = (rawBengaliStr: string) => {
    if (!rawBengaliStr) return rawBengaliStr;
    const parts = rawBengaliStr.split(' ');
    const day = parts[0] || '';
    const monthEn = parts[1] || '';
    const year = parts[2] || '';
    return `${day} ${monthEn} ${year} BS`;
  };

  const localizeString = (str: string, lang: string) => {
    if (!str) return str;
    let s = String(str);
    if (lang === 'bn') {
      s = s.replace(/AM/g, 'পূর্বাহ্ণ').replace(/PM/g, 'অপরাহ্ণ');
      const bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
      s = s.replace(/\d/g, d => bn[Number(d)]);
    } else if (lang === 'hi') {
      s = s.replace(/AM/g, 'पूर्वाह्न').replace(/PM/g, 'अपराह्न');
      const hi = ['०','१','२','३','४','५','६','७','८','९'];
      s = s.replace(/\d/g, d => hi[Number(d)]);
    }
    return s;
  };

  // Unified format helper to completely localize ANY date string
  const formatLocalizedDate = (rawStr: string, lang: 'bn' | 'hi' | 'en' | 'all') => {
    if (!rawStr || lang === 'en' || lang === 'all') return String(rawStr);
    let mapped = String(rawStr);
    
    Object.keys(TITHI_MAP).forEach(key => {
      const trans = TITHI_MAP[key][lang as 'bn' | 'hi'];
      if (trans) mapped = mapped.replace(new RegExp(`\\b${key}\\b`, 'g'), trans);
    });
    Object.keys(PANCHANG_TERMS_MAP).forEach(key => {
      const trans = PANCHANG_TERMS_MAP[key][lang as 'bn' | 'hi'];
      if (trans) mapped = mapped.replace(new RegExp(`\\b${key}\\b`, 'g'), trans);
    });
    BENGALI_MONTHS_LIST.forEach(m => {
      const trans = m[lang as 'bn' | 'hi'];
      if (trans) mapped = mapped.replace(new RegExp(`\\b${m.en}\\b`, 'gi'), trans);
    });
    HINDI_MONTHS_LIST.forEach(m => {
      const trans = m[lang as 'bn' | 'hi'];
      if (trans) mapped = mapped.replace(new RegExp(`\\b${m.en}\\b`, 'gi'), trans);
    });

    if (lang === 'bn') {
      mapped = mapped.replace('VS', 'বি.সং.').replace('Paksha', 'পক্ষ').replace('Shukla', 'শুক্ল').replace('Krishna', 'কৃষ্ণ').replace('BS', 'বঙ্গাব্দ');
    } else if (lang === 'hi') {
      mapped = mapped.replace('VS', 'वि.सं.').replace('Paksha', 'पक्ष').replace('Shukla', 'शुक्ल').replace('Krishna', 'कृष्ण').replace('BS', 'बंगाब्द');
    }
    
    return localizeString(mapped, lang);
  };

  const getTithiShort = (tithiEn: string, lang: 'all' | 'en' | 'bn' | 'hi') => {
    const t = TITHI_MAP[tithiEn];
    if (!t) return tithiEn;
    if (lang === 'bn') return t.bn;
    if (lang === 'hi') return t.hi;
    return t.en;
  };

  const isCurrentDayToday = (dayNum: number) => {
    const now = new Date();
    return (
      now.getFullYear() === currentDate.getFullYear() &&
      now.getMonth() === currentDate.getMonth() &&
      now.getDate() === dayNum
    );
  };

  const isCalendarViewLoading = loading || tabLoading || langLoading;

  return (
    <div className={`w-full transition-colors duration-300 ${isDark ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}`}>
      <div className="w-full space-y-4">
        
        {/* Top Control Bar: Compact & Clean */}
        <div className={`p-3 sm:p-4 rounded-2xl border backdrop-blur-xl shadow-md transition-all ${
          isDark
            ? 'bg-[#141418]/90 border-[#2A2A2E] shadow-black/40'
            : 'bg-[#FFFFFF]/90 border-[#E5E1D8] shadow-amber-900/5'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Title: Panjika & Calendar */}
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C9A050] to-[#997328] flex items-center justify-center text-[#0D0D0F] shadow-sm shadow-[#C9A050]/20 shrink-0">
                <CalendarIcon className="w-4 h-4 font-bold" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-serif font-bold tracking-tight">
                  Panjika & <span className="text-[#C9A050]">Calendar</span>
                </h2>
              </div>
            </div>

            {/* Standalone Distinct Tab Buttons / Cards */}
            <div className="flex items-center space-x-2.5">
              {/* Card 1: Calendar Button */}
              <button
                onClick={() => handleTabSwitch('calendar')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-sm ${
                  activeSubTab === 'calendar'
                    ? 'bg-[#C9A050] border-[#C9A050] text-[#0D0D0F] shadow-[#C9A050]/25'
                    : isDark
                    ? 'bg-[#0D0D0F] border-[#2A2A2E] text-[#9E9A90] hover:text-[#C9A050] hover:border-[#C9A050]/50 hover:bg-[#1A1A1E]'
                    : 'bg-white border-[#D4CFC4] text-gray-700 hover:text-[#8C6B28] hover:border-[#C9A050]/50 hover:bg-[#C9A050]/10'
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
                <span>Calendar</span>
              </button>

              {/* Card 2: 6-Way Date Converter Button */}
              <button
                onClick={() => handleTabSwitch('converter')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-sm ${
                  activeSubTab === 'converter'
                    ? 'bg-[#C9A050] border-[#C9A050] text-[#0D0D0F] shadow-[#C9A050]/25'
                    : isDark
                    ? 'bg-[#0D0D0F] border-[#2A2A2E] text-[#9E9A90] hover:text-[#C9A050] hover:border-[#C9A050]/50 hover:bg-[#1A1A1E]'
                    : 'bg-white border-[#D4CFC4] text-gray-700 hover:text-[#8C6B28] hover:border-[#C9A050]/50 hover:bg-[#C9A050]/10'
                }`}
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>6-Way Date Converter</span>
              </button>
            </div>
          </div>
        </div>

        {/* ---------------- SUB-TAB 1: CALENDAR VIEW ---------------- */}
        {activeSubTab === 'calendar' && (
          <div className={`p-3.5 sm:p-5 rounded-2xl border backdrop-blur-xl shadow-lg transition-all relative min-h-[380px] ${
            isDark
              ? 'bg-[#141418]/90 border-[#2A2A2E] shadow-black/50'
              : 'bg-[#FFFFFF]/95 border-[#E5E1D8] shadow-amber-900/5'
          }`}>
            
            {/* Calendar Controls & Month Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#C9A050]/20 mb-3">
              
              {/* Modern Unified Month / Year Navigation Pill */}
              <div className={`inline-flex items-center p-0.5 rounded-xl border shadow-xs transition-all ${
                isDark ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-white border-[#D4CFC4]'
              }`}>
                {/* Prev Button */}
                <button
                  onClick={prevMonth}
                  title="Previous Month"
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    isDark
                      ? 'text-[#9E9A90] hover:text-[#C9A050] hover:bg-[#1A1A1E]'
                      : 'text-gray-600 hover:text-[#8C6B28] hover:bg-[#C9A050]/15'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="h-4 w-px bg-[#C9A050]/20 mx-1" />

                {/* Month Selector */}
                <div className="relative flex items-center">
                  <select
                    value={currentDate.getMonth()}
                    onChange={(e) =>
                      setCurrentDate(new Date(currentDate.getFullYear(), parseInt(e.target.value), 1))
                    }
                    className="appearance-none bg-transparent text-xs sm:text-sm font-bold pl-2 pr-5 py-1 outline-none cursor-pointer text-[#8C6B28] dark:text-[#C9A050] hover:opacity-80 transition-opacity"
                  >
                    {MONTH_NAMES_EN.map((m, i) => (
                      <option key={m} value={i} className={isDark ? 'bg-[#141418] text-[#E5E1D8]' : 'bg-white text-black'}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-[#C9A050] absolute right-1 pointer-events-none opacity-80" />
                </div>

                <span className="text-gray-300 dark:text-gray-600 text-xs font-light mx-0.5">•</span>

                {/* Year Selector */}
                <div className="relative flex items-center">
                  <select
                    value={currentDate.getFullYear()}
                    onChange={(e) =>
                      setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth(), 1))
                    }
                    className="appearance-none bg-transparent text-xs sm:text-sm font-bold pl-2 pr-5 py-1 outline-none cursor-pointer text-[#8C6B28] dark:text-[#C9A050] hover:opacity-80 transition-opacity"
                  >
                    {Array.from({ length: 151 }, (_, i) => 1950 + i).map((y) => (
                      <option key={y} value={y} className={isDark ? 'bg-[#141418] text-[#E5E1D8]' : 'bg-white text-black'}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-[#C9A050] absolute right-1 pointer-events-none opacity-80" />
                </div>

                <div className="h-4 w-px bg-[#C9A050]/20 mx-1" />

                {/* Next Button */}
                <button
                  onClick={nextMonth}
                  title="Next Month"
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    isDark
                      ? 'text-[#9E9A90] hover:text-[#C9A050] hover:bg-[#1A1A1E]'
                      : 'text-gray-600 hover:text-[#8C6B28] hover:bg-[#C9A050]/15'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Language Dropdown Selector */}
              <div className="flex items-center space-x-2 self-end sm:self-auto">
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  isDark ? 'text-[#9E9A90]' : 'text-gray-500'
                }`}>
                  Language:
                </span>
                <div className={`relative flex items-center p-0.5 rounded-xl border shadow-xs ${
                  isDark ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-white border-[#D4CFC4]'
                }`}>
                  <select
                    value={calendarLang}
                    onChange={(e) => handleLanguageChange(e.target.value as any)}
                    className="appearance-none bg-transparent text-xs font-bold pl-2.5 pr-6 py-1 outline-none cursor-pointer text-[#8C6B28] dark:text-[#C9A050]"
                  >
                    <option value="all" className={isDark ? 'bg-[#141418] text-[#E5E1D8]' : 'bg-white text-black'}>
                      All
                    </option>
                    <option value="bn" className={isDark ? 'bg-[#141418] text-[#E5E1D8]' : 'bg-white text-black'}>
                      Bengali
                    </option>
                    <option value="hi" className={isDark ? 'bg-[#141418] text-[#E5E1D8]' : 'bg-white text-black'}>
                      Hindi
                    </option>
                    <option value="en" className={isDark ? 'bg-[#141418] text-[#E5E1D8]' : 'bg-white text-black'}>
                      English
                    </option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-[#C9A050] absolute right-2 pointer-events-none opacity-80" />
                </div>
              </div>
            </div>

            {/* Calendar Grid Header (Sun - Sat) */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-1.5">
              {WEEKDAYS_MAP.map((w) => (
                <div
                  key={w.en}
                  className={`text-center py-1 rounded-lg font-bold text-[10px] sm:text-xs uppercase tracking-wider ${
                    w.en === 'Sun' ? 'text-amber-500 font-extrabold' : isDark ? 'text-[#9E9A90]' : 'text-gray-500'
                  }`}
                >
                  <span>{w.en}</span>
                  <span className="block text-[8px] sm:text-[8.5px] opacity-80 font-normal">
                    {calendarLang === 'all'
                      ? `${w.bn} • ${w.hi}`
                      : calendarLang === 'hi'
                      ? w.hi
                      : calendarLang === 'bn'
                      ? w.bn
                      : w.en}
                  </span>
                </div>
              ))}
            </div>

            {/* Calendar Days Loader or Grid */}
            {isCalendarViewLoading ? (
              <div className="h-64 flex flex-col items-center justify-center space-y-3 animate-fade-in">
                <div className="relative flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full border-2 border-[#C9A050]/20 border-t-[#C9A050] animate-spin" />
                  <Sparkles className="w-4 h-4 text-[#C9A050] absolute animate-pulse" />
                </div>
                <p className="text-xs font-serif tracking-wider text-[#C9A050] font-medium">
                  Loading Calendar...
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-7 gap-1 sm:gap-1.5"
              >
                {/* Empty leading days of the month */}
                {Array.from({
                  length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(),
                }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-14 sm:h-16 rounded-xl bg-transparent opacity-0 pointer-events-none" />
                ))}

                {/* Calendar Days */}
                {calendarData?.days?.map((dayData: any) => {
                  const isToday = isCurrentDayToday(dayData.day);
                  const isSelected = selectedDay?.day === dayData.day;
                  const isShukla = dayData.paksha === 'Shukla';
                  const isPurnima = dayData.tithi === 'Purnima';
                  const isAmavasya = dayData.tithi === 'Amavasya';
                  const isEkadashi = dayData.tithi === 'Ekadashi';

                  const benShort = dayData.bengali_date ? dayData.bengali_date.split(' ').slice(0, 2).join(' ') : '';
                  const benParts = benShort.split(' ');
                  const benDayNum = calendarLang === 'en' ? benParts[0] : toBengaliNum(benParts[0] || '');
                  const hinDayNum = toHindiNum(benParts[0] || '');
                  
                  const benMonthObj = BENGALI_MONTHS_LIST.find(
                    (m) => m.en.toLowerCase() === (benParts[1] || '').toLowerCase()
                  );
                  const benMonthName = calendarLang === 'en' ? (benParts[1] || '') : benMonthObj ? benMonthObj.bn : benParts[1];
                  const hinMonthName = benMonthObj ? benMonthObj.hi : benParts[1];

                  const tithiBn = TITHI_MAP[dayData.tithi]?.bn || dayData.tithi;
                  const tithiHi = TITHI_MAP[dayData.tithi]?.hi || dayData.tithi;

                  // Multilingual Tithi display text based on selected language
                  let tithiDisplay = `${tithiBn} • ${tithiHi}`;
                  if (calendarLang === 'bn') {
                    tithiDisplay = `${tithiBn} (${dayData.paksha === 'Shukla' ? 'শু.' : 'কৃ.'})`;
                  } else if (calendarLang === 'hi') {
                    tithiDisplay = `${tithiHi} (${dayData.paksha === 'Shukla' ? 'शु.' : 'कृ.'})`;
                  } else if (calendarLang === 'en') {
                    tithiDisplay = `${dayData.tithi} (${dayData.paksha[0]})`;
                  }

                  // Badge labels
                  const purnimaLabel =
                    calendarLang === 'bn'
                      ? 'পূর্ণিমা'
                      : calendarLang === 'hi'
                      ? 'पूर्णिमा'
                      : calendarLang === 'en'
                      ? 'Purnima'
                      : 'পূর্ণিমা • पूर्णिमा';

                  const amavasyaLabel =
                    calendarLang === 'bn'
                      ? 'অমাবস্যা'
                      : calendarLang === 'hi'
                      ? 'अमावस्या'
                      : calendarLang === 'en'
                      ? 'Amavasya'
                      : 'অমাবস্যা • अमावस्या';

                  const ekadashiLabel =
                    calendarLang === 'bn'
                      ? 'একাদশী'
                      : calendarLang === 'hi'
                      ? 'एकादशी'
                      : calendarLang === 'en'
                      ? 'Ekadashi'
                      : 'একাদশী • एकादशी';

                  // Month display string for top right
                  let topRegionalDate = `${benDayNum} ${benMonthName}`;
                  if (calendarLang === 'hi') {
                    topRegionalDate = `${hinDayNum} ${hinMonthName}`;
                  }

                  return (
                    <motion.div
                      key={dayData.day}
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => openDayModal(dayData)}
                      className={`min-h-[56px] sm:min-h-[62px] p-1 sm:p-1.5 rounded-xl border transition-all flex flex-col justify-between cursor-pointer relative overflow-hidden group shadow-xs ${
                        isSelected
                          ? 'border-[#C9A050] bg-[#C9A050]/20 shadow-md shadow-[#C9A050]/30 ring-2 ring-[#C9A050]/40'
                          : isToday
                          ? isDark
                            ? 'border-[#C9A050] bg-[#C9A050]/15 ring-1 ring-[#C9A050]/40'
                            : 'border-[#C9A050] bg-[#C9A050]/10 ring-1 ring-[#C9A050]/40'
                          : isPurnima || isAmavasya || isEkadashi
                          ? isDark
                            ? 'bg-[#181611] border-[#C9A050]/35 hover:border-[#C9A050] hover:bg-[#201C15]'
                            : 'bg-[#F9F5EC] border-[#C9A050]/35 hover:border-[#C9A050] hover:bg-[#F3ECE0]'
                          : isDark
                          ? 'bg-[#0D0D0F]/80 border-[#2A2A2E]/80 hover:border-[#C9A050]/60 hover:bg-[#1A1A1E]'
                          : 'bg-[#FDFBF7] border-[#EAE6DF] hover:border-[#C9A050]/60 hover:bg-white shadow-sm'
                      }`}
                    >
                      {/* Top Row: Gregorian Date Number & Regional Bengali/Hindi Date */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-serif font-bold text-xs sm:text-sm leading-none ${
                            isSelected || isToday
                              ? 'text-[#C9A050]'
                              : isDark
                              ? 'text-[#F0ECE1]'
                              : 'text-[#0D0D0F]'
                          }`}
                        >
                          {calendarLang === 'bn' ? toBengaliNum(dayData.day) : calendarLang === 'hi' ? toHindiNum(dayData.day) : dayData.day}
                        </span>

                        <span className="text-[8px] sm:text-[9px] font-semibold text-[#8C6B28] dark:text-[#C9A050] truncate pl-1">
                          {topRegionalDate}
                        </span>
                      </div>

                      {/* Bottom Row: Purnima/Amavasya/Ekadashi Badge OR Tithi */}
                      <div className="mt-1">
                        {isPurnima ? (
                          <div className="flex items-center justify-center space-x-0.5 px-1 py-0.5 rounded bg-[#C9A050]/20 text-[#8C6B28] dark:text-[#E5C170] border border-[#C9A050]/40 text-[7.5px] sm:text-[8.5px] font-bold tracking-tight truncate w-full shadow-xs">
                            <span>🌕</span>
                            <span className="truncate">{purnimaLabel}</span>
                          </div>
                        ) : isAmavasya ? (
                          <div className="flex items-center justify-center space-x-0.5 px-1 py-0.5 rounded bg-[#C9A050]/15 text-[#8C6B28] dark:text-[#E5C170] border border-[#C9A050]/30 text-[7.5px] sm:text-[8.5px] font-bold tracking-tight truncate w-full shadow-xs">
                            <span>🌑</span>
                            <span className="truncate">{amavasyaLabel}</span>
                          </div>
                        ) : isEkadashi ? (
                          <div className="flex items-center justify-center space-x-0.5 px-1 py-0.5 rounded bg-[#C9A050]/15 text-[#8C6B28] dark:text-[#E5C170] border border-[#C9A050]/30 text-[7.5px] sm:text-[8.5px] font-bold tracking-tight truncate w-full shadow-xs">
                            <span>🌿</span>
                            <span className="truncate">{ekadashiLabel}</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-[7.5px] sm:text-[8.5px] text-gray-500 dark:text-gray-400 px-0.5">
                            <span className="truncate">{tithiDisplay}</span>
                            {isShukla ? (
                              <Moon className="w-2 h-2 text-[#C9A050] shrink-0 ml-0.5" />
                            ) : (
                              <Moon className="w-2 h-2 text-gray-400 shrink-0 ml-0.5" />
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        )}

        {/* ---------------- SUB-TAB 2: 6-WAY DATE CONVERTER ---------------- */}
        {activeSubTab === 'converter' && (
          <div className={`p-4 sm:p-6 rounded-2xl border backdrop-blur-xl shadow-xl transition-all relative min-h-[420px] ${
            isDark
              ? 'bg-[#141418]/90 border-[#2A2A2E] shadow-black/50'
              : 'bg-[#FFFFFF]/95 border-[#E5E1D8] shadow-amber-900/5'
          }`}>
            
            {tabLoading ? (
              <div className="h-80 flex flex-col items-center justify-center space-y-4 animate-fade-in">
                <div className="relative flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-2 border-[#C9A050]/20 border-t-[#C9A050] animate-spin" />
                  <ArrowRightLeft className="w-5 h-5 text-[#C9A050] absolute animate-pulse" />
                </div>
                <p className="text-xs font-serif tracking-wider text-[#C9A050] font-medium">
                  Loading 6-Way Date Converter...
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#C9A050]/20">
                  <div>
                    <h3 className="text-lg sm:text-xl font-serif font-bold text-[#C9A050] flex items-center space-x-2">
                      <ArrowRightLeft className="w-5 h-5" />
                      <span>6-Way Date Converter</span>
                    </h3>
                  </div>

                  {/* Quick Preset Modes */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { from: 'english', to: 'bengali', label: 'Eng ➔ Ben' },
                      { from: 'bengali', to: 'english', label: 'Ben ➔ Eng' },
                      { from: 'english', to: 'hindi', label: 'Eng ➔ Hin' },
                      { from: 'hindi', to: 'english', label: 'Hin ➔ Eng' },
                      { from: 'hindi', to: 'bengali', label: 'Hin ➔ Ben' },
                      { from: 'bengali', to: 'hindi', label: 'Ben ➔ Hin' },
                    ].map((item, idx) => {
                      const isActive = convertFrom === item.from && convertTo === item.to;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setConvertFrom(item.from as any);
                            setConvertTo(item.to as any);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#C9A050] text-[#0D0D0F] shadow-sm'
                              : isDark
                              ? 'bg-[#0D0D0F] text-[#9E9A90] hover:text-[#E5E1D8] border border-[#2A2A2E]'
                              : 'bg-[#F0ECE1] text-gray-700 hover:text-black border border-[#D4CFC4]'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Interactive Converter Form */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  
                  {/* SOURCE (FROM) INPUTS */}
                  <div className={`lg:col-span-5 p-4 rounded-xl border ${
                    isDark ? 'bg-[#0D0D0F]/90 border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#C9A050]">
                        Convert From
                      </label>
                      <select
                        value={convertFrom}
                        onChange={(e) => {
                          const newFrom = e.target.value as any;
                          setConvertFrom(newFrom);
                          if (newFrom === convertTo) {
                            setConvertTo(newFrom === 'english' ? 'bengali' : 'english');
                          }
                        }}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border outline-none cursor-pointer ${
                          isDark ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-white border-[#D4CFC4] text-black'
                        }`}
                      >
                        <option value="english">English</option>
                        <option value="bengali">Bengali</option>
                        <option value="hindi">Hindi</option>
                      </select>
                    </div>

                    {/* Input Fields According to ConvertFrom */}
                    {convertFrom === 'english' && (
                      <div>
                        <input
                          type="date"
                          value={engDate}
                          onChange={(e) => setEngDate(e.target.value)}
                          className={`w-full p-2.5 rounded-lg border text-sm font-mono outline-none focus:border-[#C9A050] transition ${
                            isDark ? 'bg-[#141418] border-[#2A2A2E] text-[#F0ECE1]' : 'bg-white border-[#D4CFC4] text-black'
                          }`}
                        />
                        <div className="mt-2 flex justify-between text-[11px] text-[#9E9A90]">
                          <span>Select Gregorian Date</span>
                        </div>
                      </div>
                    )}

                    {convertFrom === 'bengali' && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Day (1-32)</label>
                            <input
                              type="number"
                              min="1"
                              max="32"
                              value={benDay}
                              onChange={(e) => setBenDay(e.target.value)}
                              className={`w-full p-2 rounded-lg border text-center text-sm font-semibold outline-none focus:border-[#C9A050] ${
                                isDark ? 'bg-[#141418] border-[#2A2A2E] text-[#F0ECE1]' : 'bg-white border-[#D4CFC4] text-black'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Month</label>
                            <select
                              value={benMonth}
                              onChange={(e) => setBenMonth(e.target.value)}
                              className={`w-full p-2 rounded-lg border text-xs font-semibold outline-none focus:border-[#C9A050] ${
                                isDark ? 'bg-[#141418] border-[#2A2A2E] text-[#F0ECE1]' : 'bg-white border-[#D4CFC4] text-black'
                              }`}
                            >
                              {BENGALI_MONTHS_LIST.map((m) => (
                                <option key={m.en} value={m.en}>
                                  {m.bn} ({m.en})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Year (BS)</label>
                            <input
                              type="number"
                              value={benYear}
                              onChange={(e) => setBenYear(e.target.value)}
                              className={`w-full p-2 rounded-lg border text-center text-sm font-semibold outline-none focus:border-[#C9A050] ${
                                isDark ? 'bg-[#141418] border-[#2A2A2E] text-[#F0ECE1]' : 'bg-white border-[#D4CFC4] text-black'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {convertFrom === 'hindi' && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Tithi</label>
                            <select
                              value={hinTithi}
                              onChange={(e) => setHinTithi(e.target.value)}
                              className={`w-full p-2 rounded-lg border text-xs font-semibold outline-none focus:border-[#C9A050] ${
                                isDark ? 'bg-[#141418] border-[#2A2A2E] text-[#F0ECE1]' : 'bg-white border-[#D4CFC4] text-black'
                              }`}
                            >
                              {Object.keys(TITHI_MAP).map((t) => (
                                <option key={t} value={t}>
                                  {TITHI_MAP[t].hi}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Paksha</label>
                            <select
                              value={hinPaksha}
                              onChange={(e) => setHinPaksha(e.target.value)}
                              className={`w-full p-2 rounded-lg border text-xs font-semibold outline-none focus:border-[#C9A050] ${
                                isDark ? 'bg-[#141418] border-[#2A2A2E] text-[#F0ECE1]' : 'bg-white border-[#D4CFC4] text-black'
                              }`}
                            >
                              <option value="Shukla">Shukla</option>
                              <option value="Krishna">Krishna</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Month</label>
                            <select
                              value={hinMonth}
                              onChange={(e) => setHinMonth(e.target.value)}
                              className={`w-full p-2 rounded-lg border text-xs font-semibold outline-none focus:border-[#C9A050] ${
                                isDark ? 'bg-[#141418] border-[#2A2A2E] text-[#F0ECE1]' : 'bg-white border-[#D4CFC4] text-black'
                              }`}
                            >
                              {HINDI_MONTHS_LIST.map((m) => (
                                <option key={m.en} value={m.en}>
                                  {m.hi}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Year (VS)</label>
                            <input
                              type="number"
                              value={hinYear}
                              onChange={(e) => setHinYear(e.target.value)}
                              className={`w-full p-2 rounded-lg border text-center text-xs font-semibold outline-none focus:border-[#C9A050] ${
                                isDark ? 'bg-[#141418] border-[#2A2A2E] text-[#F0ECE1]' : 'bg-white border-[#D4CFC4] text-black'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SWAP BUTTON */}
                  <div className="lg:col-span-2 flex justify-center py-2">
                    <button
                      type="button"
                      onClick={handleSwapConverter}
                      title="Swap Conversion Directions"
                      className="w-11 h-11 rounded-full bg-[#C9A050] text-[#0D0D0F] flex items-center justify-center shadow-lg shadow-[#C9A050]/25 hover:scale-110 active:scale-95 transition cursor-pointer"
                    >
                      <ArrowRightLeft className="w-5 h-5 font-bold" />
                    </button>
                  </div>

                  {/* TARGET (TO) SELECTION */}
                  <div className={`lg:col-span-5 p-4 rounded-xl border ${
                    isDark ? 'bg-[#0D0D0F]/90 border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#C9A050]">
                        Convert To
                      </label>
                      <select
                        value={convertTo}
                        onChange={(e) => setConvertTo(e.target.value as any)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border outline-none cursor-pointer ${
                          isDark ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-white border-[#D4CFC4] text-black'
                        }`}
                      >
                        <option value="english">English</option>
                        <option value="bengali">Bengali</option>
                        <option value="hindi">Hindi</option>
                      </select>
                    </div>

                    <div className="p-3 rounded-lg bg-[#C9A050]/10 border border-[#C9A050]/30 min-h-[64px] flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-bold tracking-wider text-[#C9A050]">
                          {conversionLoading ? 'Calculating...' : `Result (${convertTo})`}
                        </div>
                        <div className="text-base sm:text-lg font-serif font-bold text-[#E5E1D8] dark:text-[#F0ECE1] mt-0.5">
                          {conversionLoading && <RefreshCw className="w-4 h-4 animate-spin text-[#C9A050] inline mr-2" />}
                          {!conversionLoading && conversionResult && !conversionResult.error && (
                            <>
                              {convertTo === 'english' && conversionResult.english}
                              {convertTo === 'bengali' && formatLocalizedDate(conversionResult.bengali + " BS", 'bn')}
                              {convertTo === 'hindi' && formatLocalizedDate(conversionResult.hindi, 'hi')}
                            </>
                          )}
                          {!conversionLoading && conversionResult?.error && (
                            <span className="text-xs text-red-500">{conversionResult.error}</span>
                          )}
                        </div>
                      </div>

                      {conversionResult && !conversionResult.error && (
                        <button
                          onClick={() => {
                            if (conversionResult.english_date) {
                              openDayModal({
                                english_date: conversionResult.english_date,
                                bengali_date: conversionResult.bengali,
                                hindi_date: conversionResult.hindi,
                                tithi: conversionResult.tithi,
                                paksha: conversionResult.paksha,
                                day: new Date(conversionResult.english_date).getDate(),
                              });
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#C9A050] text-[#0D0D0F] text-xs font-bold hover:bg-[#D4AF37] transition cursor-pointer shrink-0 shadow-sm"
                        >
                          Details
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3-Way Comparative Cards Snapshot */}
                {conversionResult && !conversionResult.error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 pt-5 border-t border-[#2A2A2E]/50"
                  >
                    <div className="text-xs font-bold uppercase tracking-wider text-[#C9A050] mb-3 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>3-Way Comparative Formats (English, Bengali, Hindi)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      
                      {/* English Gregorian */}
                      <div className={`p-3.5 rounded-xl border ${
                        isDark ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
                      }`}>
                        <div className="flex items-center justify-between text-xs text-[#9E9A90] mb-1">
                          <span className="font-semibold">Gregorian Calendar</span>
                          <span className="text-[10px] text-amber-500 font-mono">English</span>
                        </div>
                        <div className="text-sm font-serif font-bold text-[#F0ECE1] dark:text-[#F0ECE1]">
                          {conversionResult.english}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-1">
                          {new Date(conversionResult.english_date || engDate).toLocaleDateString('en-US', { weekday: 'long' })}
                        </div>
                      </div>

                      {/* Bengali Bangabda */}
                      <div className={`p-3.5 rounded-xl border ${
                        isDark ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
                      }`}>
                        <div className="flex items-center justify-between text-xs text-[#9E9A90] mb-1">
                          <span className="font-semibold">Bangabda</span>
                          <span className="text-[10px] text-[#C9A050] font-mono">Bengali</span>
                        </div>
                        <div className="text-sm font-serif font-bold text-[#C9A050]">
                          {formatLocalizedDate(conversionResult.bengali + " BS", 'bn')}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-1">
                          {conversionResult.bengali}
                        </div>
                      </div>

                      {/* Hindi Vikram Samvat */}
                      <div className={`p-3.5 rounded-xl border ${
                        isDark ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
                      }`}>
                        <div className="flex items-center justify-between text-xs text-[#9E9A90] mb-1">
                          <span className="font-semibold">Vikram Samvat</span>
                          <span className="text-[10px] text-[#C9A050] font-mono">Hindi</span>
                        </div>
                        <div className="text-sm font-serif font-bold text-[#C9A050]">
                          {formatLocalizedDate(conversionResult.hindi, 'hi')}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-1">
                          {conversionResult.tithi} ({conversionResult.paksha} Paksha)
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        )}

      </div>

      {/* ---------------- DAY DETAIL & PANJIKA MODAL ---------------- */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-[64px] inset-x-0 bottom-0 z-50 bg-black/75 backdrop-blur-md overflow-y-auto flex items-start justify-center p-3 sm:p-4"
            onClick={() => setSelectedDay(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-xl rounded-2xl border shadow-2xl flex flex-col my-auto ${
                isDark ? 'bg-[#141418] border-[#C9A050]/40 text-[#E5E1D8]' : 'bg-white border-[#C9A050]/40 text-[#0D0D0F]'
              }`}
            >
              {/* Modal Header - sticky */}
              <div className="bg-gradient-to-r from-[#C9A050] to-[#8C6B28] p-4 text-[#0D0D0F] flex items-center justify-between relative overflow-hidden flex-shrink-0">
                <div className="relative z-10">
                  <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-[#0D0D0F]/80">
                    <Sparkles className="w-4 h-4" />
                    <span>{calendarLang === 'bn' ? 'পঞ্জিকা ও পঞ্চাঙ্গ' : (calendarLang === 'hi' ? 'पंचांग और पंजिका' : 'Panchang & Panjika')}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold mt-0.5">
                    {localizeString(new Date(selectedDay.english_date).toLocaleDateString(
                      calendarLang === 'bn' ? 'bn-IN' : (calendarLang === 'hi' ? 'hi-IN' : 'en-US'),
                      {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    ), calendarLang)}
                  </h3>
                </div>

                <button
                  onClick={() => setSelectedDay(null)}
                  className="p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-[#0D0D0F] transition cursor-pointer relative z-10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-5 space-y-5 overflow-y-auto flex-1">
                
                {/* 3-Way Date Parallel Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* English Date Card */}
                  <div className={`p-3 rounded-xl border text-center ${
                    isDark ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
                  }`}>
                    <div className="text-[10px] font-bold text-[#C9A050] uppercase tracking-wider mb-1">
                      {calendarLang === 'bn' ? 'গ্রেগরিয়ান (ইংরেজি)' : (calendarLang === 'hi' ? 'ग्रेगोरियन (अंग्रेज़ी)' : 'Gregorian (English)')}
                    </div>
                    <div className={`font-serif font-bold text-sm sm:text-base ${
                      isDark ? 'text-[#F0ECE1]' : 'text-[#1A1816]'
                    }`}>
                      {localizeString(new Date(selectedDay.english_date).toLocaleDateString(
                        calendarLang === 'bn' ? 'bn-IN' : (calendarLang === 'hi' ? 'hi-IN' : 'en-GB'),
                        { day: 'numeric', month: 'short', year: 'numeric' }
                      ), calendarLang)}
                    </div>
                    <div className="text-[11px] text-[#9E9A90] mt-0.5">
                      {localizeString(new Date(selectedDay.english_date).toLocaleDateString(
                        calendarLang === 'bn' ? 'bn-IN' : (calendarLang === 'hi' ? 'hi-IN' : 'en-US'),
                        { weekday: 'long' }
                      ), calendarLang)}
                    </div>
                  </div>

                  {/* Bengali Date Card */}
                  <div className={`p-3 rounded-xl border text-center ${
                    isDark ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
                  }`}>
                    <div className="text-[10px] font-bold text-[#C9A050] uppercase tracking-wider mb-1">
                      {calendarLang === 'bn' ? 'বঙ্গাব্দ' : (calendarLang === 'hi' ? 'बंगाब्द' : 'Bangabda (Bengali Era)')}
                    </div>
                    <div className={`font-serif font-bold text-sm sm:text-base ${
                      isDark ? 'text-[#F0ECE1]' : 'text-[#1A1816]'
                    }`}>
                      {calendarLang === 'en'
                        ? formatBengaliDisplayEn(selectedDay.bengali_date)
                        : formatLocalizedDate(formatBengaliDisplayEn(selectedDay.bengali_date), calendarLang as 'bn' | 'hi')}
                    </div>
                  </div>

                  {/* Hindi Date Card */}
                  <div className={`p-3 rounded-xl border text-center ${
                    isDark ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
                  }`}>
                    <div className="text-[10px] font-bold text-[#C9A050] uppercase tracking-wider mb-1">
                      {calendarLang === 'bn' ? 'বিক্রম সংবৎ' : (calendarLang === 'hi' ? 'विक्रम संवत' : 'Vikram Samvat (Hindi Era)')}
                    </div>
                    <div className={`font-serif font-bold text-sm sm:text-base ${
                      isDark ? 'text-[#F0ECE1]' : 'text-[#1A1816]'
                    }`}>
                      {calendarLang === 'en'
                        ? selectedDay.hindi_date
                        : formatLocalizedDate(selectedDay.hindi_date, calendarLang as 'bn' | 'hi')}
                    </div>
                  </div>
                </div>

                {modalLoading || !fullPanjika ? (
                  <div className="h-48 flex flex-col items-center justify-center space-y-3">
                    <RefreshCw className="w-7 h-7 text-[#C9A050] animate-spin" />
                    <p className="text-xs text-[#9E9A90]">Calculating Planetary & Tithi Coordinates...</p>
                  </div>
                ) : (
                  <>
                    {/* 5 Limbs of Panchang */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9A050] mb-3 flex items-center space-x-1.5">
                        <Moon className="w-4 h-4" />
                        <span>{calendarLang === 'bn' ? 'মূল পঞ্চাঙ্গ বিবরণ' : (calendarLang === 'hi' ? 'मुख्य पंचांग विवरण' : 'Core Panchang Details')}</span>
                      </h4>

                      <div className={`rounded-xl border divide-y ${
                        isDark ? 'bg-[#0D0D0F] border-[#2A2A2E] divide-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8] divide-[#E5E1D8]'
                      }`}>
                        {[
                          {
                            labelBn: 'বার',
                            labelHi: 'दिन (वार)',
                            labelEn: 'Day (Vara)',
                            valueEn: new Date(selectedDay.english_date).toLocaleDateString('en-US', { weekday: 'long' }),
                            valueBn: new Date(selectedDay.english_date).toLocaleDateString('bn-IN', { weekday: 'long' }),
                            valueHi: new Date(selectedDay.english_date).toLocaleDateString('hi-IN', { weekday: 'long' }),
                          },
                          {
                            labelBn: 'তিথি ও পক্ষ',
                            labelHi: 'तिथि और पक्ष',
                            labelEn: 'Tithi & Paksha',
                            valueEn: `${fullPanjika.tithi} (${fullPanjika.paksha} Paksha)`,
                            valueBn: `${TITHI_MAP[fullPanjika.tithi]?.bn || fullPanjika.tithi} (${fullPanjika.paksha === 'Shukla' ? 'শুক্লপক্ষ' : 'কৃষ্ণপক্ষ'})`,
                            valueHi: `${TITHI_MAP[fullPanjika.tithi]?.hi || fullPanjika.tithi} (${fullPanjika.paksha === 'Shukla' ? 'शुक्लपक्ष' : 'कृष्णपक्ष'})`,
                          },
                          {
                            labelBn: 'নক্ষত্র',
                            labelHi: 'नक्षत्र',
                            labelEn: 'Nakshatra',
                            valueEn: fullPanjika.nakshatra,
                            valueBn: PANCHANG_TERMS_MAP[fullPanjika.nakshatra]?.bn || fullPanjika.nakshatra,
                            valueHi: PANCHANG_TERMS_MAP[fullPanjika.nakshatra]?.hi || fullPanjika.nakshatra,
                          },
                          {
                            labelBn: 'যোগ',
                            labelHi: 'योग',
                            labelEn: 'Yoga',
                            valueEn: fullPanjika.yoga,
                            valueBn: PANCHANG_TERMS_MAP[fullPanjika.yoga]?.bn || fullPanjika.yoga,
                            valueHi: PANCHANG_TERMS_MAP[fullPanjika.yoga]?.hi || fullPanjika.yoga,
                          },
                          {
                            labelBn: 'করণ',
                            labelHi: 'करण',
                            labelEn: 'Karana',
                            valueEn: fullPanjika.karana,
                            valueBn: PANCHANG_TERMS_MAP[fullPanjika.karana]?.bn || fullPanjika.karana,
                            valueHi: PANCHANG_TERMS_MAP[fullPanjika.karana]?.hi || fullPanjika.karana,
                          },
                          {
                            labelBn: 'চন্দ্র রাশি',
                            labelHi: 'चंद्र राशि',
                            labelEn: 'Chandra Rashi (Moon Sign)',
                            valueEn: fullPanjika.rashi,
                            valueBn: PANCHANG_TERMS_MAP[fullPanjika.rashi]?.bn || fullPanjika.rashi,
                            valueHi: PANCHANG_TERMS_MAP[fullPanjika.rashi]?.hi || fullPanjika.rashi,
                          },
                          {
                            labelBn: 'ঋতু',
                            labelHi: 'ऋतु',
                            labelEn: 'Ritu (Season)',
                            valueEn: fullPanjika.ritu,
                            valueBn: PANCHANG_TERMS_MAP[fullPanjika.ritu]?.bn || fullPanjika.ritu,
                            valueHi: PANCHANG_TERMS_MAP[fullPanjika.ritu]?.hi || fullPanjika.ritu,
                          },
                        ].map((item, idx) => {
                          const displayLabel =
                            calendarLang === 'hi' ? item.labelHi :
                            calendarLang === 'en' ? item.labelEn :
                            item.labelBn;
                          const displayValue =
                            calendarLang === 'hi' ? item.valueHi :
                            calendarLang === 'en' ? item.valueEn :
                            item.valueBn;
                          const subValue =
                            calendarLang === 'hi' ? item.valueEn :
                            calendarLang === 'en' ? '' :
                            item.valueEn;
                          return (
                          <div key={idx} className="flex items-center justify-between p-3 text-xs">
                            <span className="font-medium text-[#9E9A90]">
                              {displayLabel}
                            </span>
                            <div className="text-right">
                              <span className="font-bold text-[#F0ECE1] dark:text-[#F0ECE1]">{localizeString(displayValue, calendarLang)}</span>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Celestial Transit Timings */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9A050] mb-3 flex items-center space-x-1.5">
                        <Sun className="w-4 h-4" />
                        <span>
                          {calendarLang === 'bn' 
                            ? 'সূর্য ও চন্দ্রের উদয়/অস্ত সময়' 
                            : (calendarLang === 'hi' ? 'उदय और अस्त का समय' : 'Celestial Rise & Set Times')}
                        </span>
                      </h4>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div className={`p-3 rounded-xl border text-center ${
                          isDark ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
                        }`}>
                          <span className="text-[10px] text-amber-500 uppercase font-bold block mb-1">
                            🌅 {calendarLang === 'bn' ? 'সূর্যোদয়' : (calendarLang === 'hi' ? 'सूर्योदय' : 'Sunrise')}
                          </span>
                          <span className="font-mono text-sm font-bold text-[#F0ECE1] dark:text-[#F0ECE1]">{localizeString(fullPanjika.sunrise, calendarLang)}</span>
                        </div>
                        <div className={`p-3 rounded-xl border text-center ${
                          isDark ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
                        }`}>
                          <span className="text-[10px] text-orange-400 uppercase font-bold block mb-1">
                            🌇 {calendarLang === 'bn' ? 'সূর্যাস্ত' : (calendarLang === 'hi' ? 'सूर्यास्त' : 'Sunset')}
                          </span>
                          <span className="font-mono text-sm font-bold text-[#F0ECE1] dark:text-[#F0ECE1]">{localizeString(fullPanjika.sunset, calendarLang)}</span>
                        </div>
                        <div className={`p-3 rounded-xl border text-center ${
                          isDark ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
                        }`}>
                          <span className="text-[10px] text-indigo-400 uppercase font-bold block mb-1">
                            🌙 {calendarLang === 'bn' ? 'চন্দ্রোদয়' : (calendarLang === 'hi' ? 'चंद्रोदय' : 'Moonrise')}
                          </span>
                          <span className="font-mono text-sm font-bold text-[#F0ECE1] dark:text-[#F0ECE1]">{localizeString(fullPanjika.moonrise, calendarLang)}</span>
                        </div>
                        <div className={`p-3 rounded-xl border text-center ${
                          isDark ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#E5E1D8]'
                        }`}>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                            🌘 {calendarLang === 'bn' ? 'চন্দ্রাস্ত' : (calendarLang === 'hi' ? 'चंद्रास्त' : 'Moonset')}
                          </span>
                          <span className="font-mono text-sm font-bold text-[#F0ECE1] dark:text-[#F0ECE1]">{localizeString(fullPanjika.moonset, calendarLang)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Festivals & Observances */}
                    {fullPanjika.festivals && fullPanjika.festivals.length > 0 && (
                      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30">
                        <h5 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2 flex items-center space-x-1.5">
                          <Star className="w-3.5 h-3.5" />
                          <span>
                            {calendarLang === 'bn' 
                              ? 'ব্রত ও পর্ব' 
                              : (calendarLang === 'hi' ? 'व्रत और पर्व' : 'Auspicious Festivals & Observances')}
                          </span>
                        </h5>
                        <ul className="list-disc list-inside space-y-1 text-xs font-semibold text-[#F0ECE1] dark:text-[#F0ECE1]">
                          {fullPanjika.festivals.map((fest: string, i: number) => (
                            <li key={i}>{fest}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Modal Footer - sticky at bottom */}
              <div className={`p-3 border-t flex justify-end flex-shrink-0 ${
                isDark ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#F0ECE1] border-[#E5E1D8]'
              }`}>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="px-5 py-2 rounded-xl bg-[#C9A050] text-[#0D0D0F] font-bold text-xs hover:bg-[#D4AF37] transition cursor-pointer shadow-md"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PanjikaCalendarView;
