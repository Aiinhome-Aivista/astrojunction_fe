import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Sun, ShieldCheck, Flame, Heart, Copy, Check, Clock, Compass, Gem, ChevronRight } from 'lucide-react';

interface VedicRemediesSectionProps {
  theme: 'light' | 'dark';
  onAskAI?: (title: string, prompt: string) => void;
  onExploreMore?: () => void;
}

interface RemedyItem {
  id: string;
  title: string;
  graha: string;
  deity: string;
  day: string;
  direction: string;
  element: string;
  gemstone: string;
  icon: React.ElementType;
  accentColor: string;
  tag: string;
  purpose: string;
  mantraEnglish: string;
  mantraCount: string;
  vidhi: string[];
  offerings: string[];
  bestTime: string;
}

const HARDCODED_REMEDIES: RemedyItem[] = [
  {
    id: 'surya-arghya',
    title: 'Surya Arghya & Gayatri Shanti',
    graha: 'Sun (Surya Deva)',
    deity: 'Lord Surya Narayana',
    day: 'Sunday (Ravivar)',
    direction: 'East (Purva)',
    element: 'Agni (Fire & Radiance)',
    gemstone: 'Ruby (Manikya) & Pure Copper',
    icon: Sun,
    accentColor: '#E65100',
    tag: 'Vitality & Career',
    purpose: 'Dispels career blockages, enhances leadership charisma, restores physical stamina, and strengthens fatherly karmic bonds.',
    mantraEnglish: 'Om Hram Hreem Hroum Sah Suryaya Namaha',
    mantraCount: '11 or 108 Chants at Sunrise',
    vidhi: [
      'Wake during Brahma Muhurta or within one hour of sunrise.',
      'Fill a pure copper vessel (Lota) with fresh, clean water.',
      'Add a pinch of red sandalwood (Rakta Chandana), kumkum, and a red flower into the water.',
      'Raise the copper vessel with both hands above your forehead and offer water slowly towards the rising Sun while chanting.'
    ],
    offerings: ['Fresh Water in Copper Pot', 'Red Flowers', 'Red Sandalwood', 'Jaggery donation'],
    bestTime: 'Sunrise (First 45 minutes of dawn)'
  },
  {
    id: 'maha-mrityunjaya',
    title: 'Maha Mrityunjaya Japa Shield',
    graha: 'Moon & Saturn (Chandra-Shani)',
    deity: 'Lord Shiva (Mahadeva)',
    day: 'Monday (Somvar) & Pradosham',
    direction: 'North-East (Ishanya)',
    element: 'Jala & Akasha (Ether & Mind)',
    gemstone: '5-Mukhi Rudraksha & Pure Silver',
    icon: ShieldCheck,
    accentColor: '#0284C7',
    tag: 'Longevity & Healing',
    purpose: 'Neutralizes severe planetary afflictions (Nadi Dosha, Maraka dashas), eases anxiety, promotes emotional serenity, and grants profound health recovery.',
    mantraEnglish: 'Om Tryambakam Yajamahe Sugandhim Pushti-Vardhanam | Urvarukamiva Bandhanan Mrityor Mukshiya Mamritat',
    mantraCount: '108 Chants with Rudraksha Mala',
    vidhi: [
      'Sit comfortably facing North or East in a clean, quiet space.',
      'Light a pure cow-ghee lamp and fragrant dhoop before Lord Shiva.',
      'Hold a consecrated 5-Mukhi Rudraksha mala and recite the Mahamantra with deep, meditative breathing.',
      'Offer raw cow milk, fresh water, and Bilva leaves to a Shiva Lingam on Mondays.'
    ],
    offerings: ['Bilva Leaves', 'Raw Cow Milk', 'Pure Ghee Lamp', 'White Sandalwood'],
    bestTime: 'Brahma Muhurta (4:30 AM – 6:00 AM) or Sunset'
  },
  {
    id: 'mangal-shanti',
    title: 'Hanuman Chalisa & Kuja Nivaran',
    graha: 'Mars (Mangala / Kuja)',
    deity: 'Sri Hanuman & Kartikeya',
    day: 'Tuesday (Mangalwar)',
    direction: 'South (Dakshin)',
    element: 'Tejas (Courage & Dynamic Energy)',
    gemstone: 'Red Coral (Moonga) & Copper Kada',
    icon: Flame,
    accentColor: '#DC2626',
    tag: 'Manglik & Relationship Peace',
    purpose: 'Pacifies intense Manglik (Kuja) Dosha, mitigates marital friction, converts destructive anger into noble bravery, and alleviates ancestral debts (Rina Mukti).',
    mantraEnglish: 'Om Kram Kreem Kroum Sah Bhaumaya Namaha',
    mantraCount: '21 Chants or 1 Hanuman Chalisa Recitation',
    vidhi: [
      'Take a purifying bath on Tuesday evening and wear clean red or saffron clothes.',
      'Light a sesame oil (Til oil) or jasmine oil lamp before Sri Hanuman.',
      'Recite Sri Hanuman Chalisa with sincere focus, asking for harmony in domestic life.',
      'Donate red lentils (Masoor Dal), copper coins, or sweet jaggery to the underprivileged.'
    ],
    offerings: ['Sesame / Jasmine Oil Lamp', 'Red Lentils (Masoor Dal)', 'Sindoor & Boondi', 'Jaggery'],
    bestTime: 'Tuesday Sunset (Sandhya Kaal)'
  },
  {
    id: 'shukra-suktam',
    title: 'Shri Suktam & Venus Preeti Upaya',
    graha: 'Venus (Shukra Dev)',
    deity: 'Maha Lakshmi & Shukracharya',
    day: 'Friday (Shukrawar)',
    direction: 'South-East (Agneya)',
    element: 'Amrita (Sweetness, Wealth & Art)',
    gemstone: 'White Zircon / Diamond & Sphatik Mala',
    icon: Heart,
    accentColor: '#D97706',
    tag: 'Love, Beauty & Abundance',
    purpose: 'Cultivates unconditional romantic tenderness, dissolves financial bottlenecks, enhances aesthetic creativity, and attracts auspicious Lakshmi energy.',
    mantraEnglish: 'Om Shum Shukraya Namaha',
    mantraCount: '16 or 108 Chants with Sphatik Mala',
    vidhi: [
      'Wear clean white, cream, or pastel attire on Friday mornings.',
      'Light a pure camphor (Karpura) flame in the North-East or pooja corner to cleanse energetic vibrations.',
      'Recite the Venus Beej Mantra or Sri Suktam with devotion.',
      'Offer white sweets (Mishri or Kheer) or donate white rice, sugar, or white cloth to needy women or temple priests.'
    ],
    offerings: ['White Fragrant Flowers', 'Pure Cow Milk Kheer', 'Camphor (Karpura)', 'Mishri (Rock Sugar)'],
    bestTime: 'Friday Morning (Shukra Hora)'
  }
];

export const VedicRemediesSection: React.FC<VedicRemediesSectionProps> = ({
  theme,
  onAskAI,
  onExploreMore
}) => {
  const { t } = useTranslation();
  const [selectedRemedyId, setSelectedRemedyId] = useState<string | null>(null);
  const [copiedMantraId, setCopiedMantraId] = useState<string | null>(null);

  const getRemedyItem = (r: RemedyItem): RemedyItem => {
    const itemKey = `remedies.items.${r.id}`;
    const translatedVidhi = t(`${itemKey}.vidhi`, { returnObjects: true });
    const vidhiList = Array.isArray(translatedVidhi) && translatedVidhi.length > 0 ? (translatedVidhi as string[]) : r.vidhi;

    const translatedOfferings = t(`${itemKey}.offerings`, { returnObjects: true });
    const offeringsList = Array.isArray(translatedOfferings) && translatedOfferings.length > 0 ? (translatedOfferings as string[]) : r.offerings;

    return {
      ...r,
      title: t(`${itemKey}.title`, r.title),
      tag: t(`${itemKey}.tag`, r.tag),
      purpose: t(`${itemKey}.purpose`, r.purpose),
      graha: t(`${itemKey}.graha`, r.graha),
      deity: t(`${itemKey}.deity`, r.deity),
      day: t(`${itemKey}.day`, r.day),
      direction: t(`${itemKey}.direction`, r.direction),
      gemstone: t(`${itemKey}.gemstone`, r.gemstone),
      bestTime: t(`${itemKey}.best_time`, r.bestTime),
      mantraCount: t(`${itemKey}.mantra_count`, r.mantraCount),
      vidhi: vidhiList,
      offerings: offeringsList,
    };
  };

  const localizedRemedies = HARDCODED_REMEDIES.map(getRemedyItem);
  const activeRemedy = localizedRemedies.find(r => r.id === selectedRemedyId) || null;

  const handleCopyMantra = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMantraId(id);
    setTimeout(() => {
      setCopiedMantraId(null);
    }, 2500);
  };

  return (
    <section className="w-full py-12 lg:py-16 relative">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#C9A050]/20 to-transparent border border-[#C9A050]/30 text-[#C9A050] text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-4 backdrop-blur-md shadow-[0_0_15px_rgba(201,160,80,0.15)]">
          <Compass className="w-4 h-4 text-[#C9A050]" />
          <span>{t('remedies.badge', 'Time-Tested Vedic Upayas & Remedies')}</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight mb-4">
          <span className={theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}>
            {t('remedies.title_main')}{' '}
          </span>
          <span className="text-[#C9A050]">{t('remedies.title_upayas')}</span>
        </h2>

        <p className={`text-sm sm:text-base text-center mx-auto max-w-lg leading-relaxed ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-black'}`}>
          {t('remedies.subtitle')}
        </p>
      </div>

      {/* 4 Hardcoded Remedies Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {localizedRemedies.map((remedy) => {
          const Icon = remedy.icon;
          const isSelected = remedy.id === selectedRemedyId;

          return (
            <motion.div
              key={remedy.id}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.25 }}
              onClick={() => setSelectedRemedyId(prev => prev === remedy.id ? null : remedy.id)}
              className={`relative rounded-2xl sm:rounded-3xl p-4 sm:p-6 cursor-pointer transition-all duration-300 flex flex-col justify-between overflow-hidden border ${
                isSelected
                  ? 'border-[#C9A050] shadow-[0_0_30px_rgba(201,160,80,0.25)] ring-1 ring-[#C9A050]'
                  : theme === 'dark'
                  ? 'bg-gradient-to-b from-[#18181E] to-[#121216] border-[#2A2A2E] hover:border-[#C9A050]/50'
                  : 'bg-gradient-to-b from-white to-[#FAF8F2] border-[#E5E1D8] hover:border-[#C9A050]/50 shadow-sm'
              }`}
            >
              {/* Subtle Ambient Glow */}
              {isSelected && (
                <div
                  className={`absolute -top-16 -right-16 w-32 h-32 rounded-full blur-2xl opacity-20 pointer-events-none astro-remedy-glow-${remedy.id}`}
                />
              )}

              <div>
                {/* Card Header: Icon & Tag */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner border transition-transform duration-300 group-hover:scale-110 ${
                      theme === 'dark' ? 'bg-[#1E1E24]' : 'bg-[#F5EFE1]'
                    } ${
                      isSelected ? 'border-[#C9A050]' : theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'
                    }`}
                  >
                    <Icon className={`w-6 h-6 astro-remedy-icon-${remedy.id}`} />
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${
                      isSelected
                        ? 'bg-[#C9A050] text-[#0D0D0F] border-[#C9A050]'
                        : theme === 'dark'
                        ? 'bg-[#141418] text-[#C9A050] border-[#2A2A2E]'
                        : 'bg-white text-amber-800 border-[#E5E1D8]'
                    }`}
                  >
                    {t(`remedies.items.${remedy.id}.tag`, remedy.tag)}
                  </span>
                </div>

                {/* English Title */}
                <div className="mb-3">
                  <h4 className={`text-lg font-serif font-bold leading-snug ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t(`remedies.items.${remedy.id}.title`, remedy.title)}
                  </h4>
                </div>

                {/* Purpose Snippet */}
                <p className={`text-xs leading-relaxed line-clamp-3 mb-4 ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-black font-medium'}`}>
                  {t(`remedies.items.${remedy.id}.purpose`, remedy.purpose)}
                </p>
              </div>

              {/* Card Footer: Graha & Action */}
              <div className="pt-3 border-t border-dashed border-[#C9A050]/20 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wider text-[#C9A050] font-semibold">
                    {t('remedies.primary_graha', 'Primary Graha')}
                  </span>
                  <span className={`text-xs font-medium ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-black font-semibold'}`}>
                    {t(`remedies.items.${remedy.id}.graha`, remedy.graha).split('(')[0].trim()}
                  </span>
                </div>

                <span
                  className={`text-xs font-semibold flex items-center space-x-1 ${
                    isSelected ? 'text-[#C9A050]' : theme === 'dark' ? 'text-[#9E9A90]' : 'text-black'
                  }`}
                >
                  <span>{t('remedies.view_vidhi', 'View Vidhi')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Expanded Detailed Showcase for the Selected Remedy */}
      <AnimatePresence mode="wait">
        {activeRemedy && (
          <motion.div
            key={activeRemedy.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className={`rounded-3xl p-6 sm:p-8 lg:p-10 border relative overflow-hidden backdrop-blur-md ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-[#18181F]/95 via-[#131317]/95 to-[#0D0D0F]/95 border-[#C9A050]/30 shadow-[0_0_40px_rgba(0,0,0,0.8)]'
                : 'bg-gradient-to-br from-white/95 via-[#FBF9F4]/95 to-[#F5EFE4]/95 border-[#C9A050]/40 shadow-xl'
            }`}
          >
          {/* Top Info Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Mantra, Meaning & Cosmic Meta (7 cols) */}
            <div className="lg:col-span-7 flex flex-col space-y-6 text-left min-w-0">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-[#C9A050]/20 text-[#C9A050] border border-[#C9A050]/30 text-xs font-bold uppercase tracking-wider">
                    {t(`remedies.items.${activeRemedy.id}.graha`, activeRemedy.graha)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    theme === 'dark' ? 'bg-[#1C1C22] text-[#9E9A90] border-[#2A2A2E]' : 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}>
                    {t(`remedies.items.${activeRemedy.id}.deity`, activeRemedy.deity)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    theme === 'dark' ? 'bg-[#1C1C22] text-[#9E9A90] border-[#2A2A2E]' : 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}>
                    {t('remedies.day_prefix', 'Day')}: {t(`remedies.items.${activeRemedy.id}.day`, activeRemedy.day)}
                  </span>
                </div>

                <h4 className={`text-2xl sm:text-3xl font-serif font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t(`remedies.items.${activeRemedy.id}.title`, activeRemedy.title)}
                </h4>
                <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-[#D0CBC0]' : 'text-gray-700'}`}>
                  {t(`remedies.items.${activeRemedy.id}.purpose`, activeRemedy.purpose)}
                </p>
              </div>

              {/* Sacred Mantra Card with Copy Action */}
              <div className={`p-5 rounded-2xl border relative overflow-hidden ${
                theme === 'dark'
                  ? 'bg-black/40 border-[#C9A050]/30'
                  : 'bg-[#FFFDF9] border-[#C9A050]/40 shadow-sm'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#C9A050] flex items-center space-x-1.5">
                    <Compass className="w-3.5 h-3.5" />
                    <span>{t('remedies.sacred_chanting', 'Sacred Vedic Chanting (Mantra)')}</span>
                  </span>

                  <button
                    onClick={() => handleCopyMantra(activeRemedy.id, t(`remedies.items.${activeRemedy.id}.mantra_text`, activeRemedy.mantraEnglish))}
                    className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#C9A050]/15 hover:bg-[#C9A050]/25 text-[#C9A050] transition cursor-pointer"
                    title={t('remedies.copy_mantra')}
                  >
                    {copiedMantraId === activeRemedy.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">{t('remedies.copied')}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{t('remedies.copy_mantra')}</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-base sm:text-lg font-serif font-semibold text-[#C9A050] tracking-wide whitespace-pre-line mb-3">
                  &ldquo;{t(`remedies.items.${activeRemedy.id}.mantra_text`, activeRemedy.mantraEnglish)}&rdquo;
                </p>

                <div className="flex items-center space-x-2 text-[11px] font-semibold text-[#C9A050]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{t('remedies.prescribed_count', 'Prescribed Count')}: {t(`remedies.items.${activeRemedy.id}.mantra_count`, activeRemedy.mantraCount)}</span>
                </div>
              </div>

              {/* Meta Badges: Best Time, Direction & Gemstone */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full">
                <div className={`p-3 rounded-xl border flex items-start space-x-2.5 min-w-0 flex-1 ${
                  theme === 'dark' ? 'bg-[#15151A] border-[#2A2A2E]' : 'bg-white border-gray-200 shadow-sm'
                }`}>
                  <Clock className="w-4 h-4 text-[#C9A050] shrink-0 mt-0.5" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[9px] uppercase tracking-wider text-[#9E9A90] font-semibold mb-0.5">{t('remedies.best_time')}</span>
                    <span
                      className={`text-[11px] font-medium leading-snug break-words ${
                        theme === 'dark' ? 'text-[#E5E1D8]' : 'text-gray-800'
                      }`}
                    >
                      {t(`remedies.items.${activeRemedy.id}.best_time`, activeRemedy.bestTime)}
                    </span>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border flex items-start space-x-2.5 min-w-0 flex-1 ${
                  theme === 'dark' ? 'bg-[#15151A] border-[#2A2A2E]' : 'bg-white border-gray-200 shadow-sm'
                }`}>
                  <Compass className="w-4 h-4 text-[#C9A050] shrink-0 mt-0.5" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[9px] uppercase tracking-wider text-[#9E9A90] font-semibold mb-0.5">{t('remedies.direction')}</span>
                    <span
                      className={`text-[11px] font-medium leading-snug break-words ${
                        theme === 'dark' ? 'text-[#E5E1D8]' : 'text-gray-800'
                      }`}
                    >
                      {t(`remedies.items.${activeRemedy.id}.direction`, activeRemedy.direction)}
                    </span>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border flex items-start space-x-2.5 min-w-0 flex-1 ${
                  theme === 'dark' ? 'bg-[#15151A] border-[#2A2A2E]' : 'bg-white border-gray-200 shadow-sm'
                }`}>
                  <Gem className="w-4 h-4 text-[#C9A050] shrink-0 mt-0.5" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[9px] uppercase tracking-wider text-[#9E9A90] font-semibold mb-0.5">{t('remedies.gemstone')}</span>
                    <span
                      className={`text-[11px] font-medium leading-snug break-words ${
                        theme === 'dark' ? 'text-[#E5E1D8]' : 'text-gray-800'
                      }`}
                    >
                      {t(`remedies.items.${activeRemedy.id}.gemstone`, activeRemedy.gemstone)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Step-by-Step Vidhi & Offerings (5 cols) */}
            <div className="lg:col-span-5 flex flex-col space-y-5 text-left min-w-0">
              <div className={`p-6 rounded-2xl border ${
                theme === 'dark' ? 'bg-[#141419] border-[#2A2A2E]' : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <h5 className="text-sm font-serif font-bold uppercase tracking-wider text-[#C9A050] mb-4 flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9A050]" />
                  <span>{t('remedies.step_by_step_vidhi', 'Step-by-Step Vedic Ritual (Vidhi)')}</span>
                </h5>

                <div className="space-y-3">
                  {(() => {
                    const localizedVidhi = t(`remedies.items.${activeRemedy.id}.vidhi`, { returnObjects: true }) as string[];
                    const vidhiList = Array.isArray(localizedVidhi) && localizedVidhi.length > 0 ? localizedVidhi : activeRemedy.vidhi;
                    return vidhiList.map((step, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <span className="w-5 h-5 rounded-full bg-[#C9A050]/20 text-[#C9A050] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-[#C9A050]/40">
                          {idx + 1}
                        </span>
                        <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-[#D0CBC0]' : 'text-gray-700'}`}>
                          {step}
                        </p>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Sacred Offerings Pill List */}
              <div className={`p-5 rounded-2xl border ${
                theme === 'dark' ? 'bg-[#141419] border-[#2A2A2E]' : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <h5 className="text-[11px] font-serif font-bold uppercase tracking-wider text-[#C9A050] mb-3">
                  {t('remedies.offerings')}
                </h5>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const localizedOfferings = t(`remedies.items.${activeRemedy.id}.offerings`, { returnObjects: true }) as string[];
                    const offeringsList = Array.isArray(localizedOfferings) && localizedOfferings.length > 0 ? localizedOfferings : activeRemedy.offerings;
                    return offeringsList.map((item, i) => (
                      <span
                        key={i}
                        className={`text-xs px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 ${
                          theme === 'dark'
                            ? 'bg-[#1C1C22] text-[#E5E1D8] border-[#2A2A2E]'
                            : 'bg-[#F9F7F1] text-gray-800 border-[#E5E1D8]'
                        }`}
                      >
                        <span className="w-1 h-1 rounded-full bg-[#C9A050]" />
                        <span>{item}</span>
                      </span>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
