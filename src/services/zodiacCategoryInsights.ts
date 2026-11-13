import {
  Sparkles,
  Activity,
  Coins,
  Users,
  Heart,
  GraduationCap,
  Briefcase,
  Plane,
} from 'lucide-react';

export type PredictionColorName = 'green' | 'emerald' | 'yellow' | 'orange' | 'red';

export interface PredictionTier {
  colorName: PredictionColorName;
  label: string; // e.g. "Excellent / Very Positive"
  badgeClass: string;
  pillClass: string;
  barColor: string;
  textClass: string;
  borderClass: string;
  dotClass: string;
}

export interface ZodiacCategory {
  id: string;
  name: string;
  icon: any;
}

export const ZODIAC_CATEGORIES: ZodiacCategory[] = [
  { id: 'all', name: 'Cosmic Pulse', icon: Sparkles },
  { id: 'health', name: 'Health', icon: Activity },
  { id: 'wealth', name: 'Wealth', icon: Coins },
  { id: 'relationship', name: 'Relationship', icon: Users },
  { id: 'love_line', name: 'Love Life', icon: Heart },
  { id: 'education', name: 'Education', icon: GraduationCap },
  { id: 'professional', name: 'Profession', icon: Briefcase },
  { id: 'travel', name: 'Travel', icon: Plane },
];

export function getPredictionTier(score: number): PredictionTier {
  const s = Math.max(0, Math.min(100, Math.round(score)));
  if (s >= 80) {
    return {
      colorName: 'green',
      label: 'Excellent / Highly Favourable',
      badgeClass: 'bg-green-500/10 dark:bg-green-500/15 text-green-700 dark:text-green-400 border border-green-600/25 dark:border-green-500/30',
      pillClass: 'bg-green-500 text-black',
      barColor: '#22c55e',
      textClass: 'text-green-700 dark:text-green-400',
      borderClass: 'border-green-600/25 dark:border-green-500/40',
      dotClass: 'bg-green-500',
    };
  } else if (s >= 60) {
    return {
      colorName: 'emerald',
      label: 'Good / Favourable',
      badgeClass: 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-600/25 dark:border-emerald-500/30',
      pillClass: 'bg-emerald-500 text-black',
      barColor: '#10b981',
      textClass: 'text-emerald-700 dark:text-emerald-400',
      borderClass: 'border-emerald-600/25 dark:border-emerald-500/40',
      dotClass: 'bg-emerald-500',
    };
  } else if (s >= 40) {
    return {
      colorName: 'yellow',
      label: 'Average / Moderate',
      badgeClass: 'bg-amber-500/10 dark:bg-yellow-500/15 text-amber-700 dark:text-yellow-400 border border-amber-600/25 dark:border-yellow-500/30',
      pillClass: 'bg-yellow-500 text-black',
      barColor: '#eab308',
      textClass: 'text-amber-700 dark:text-yellow-400',
      borderClass: 'border-amber-600/25 dark:border-yellow-500/40',
      dotClass: 'bg-yellow-500',
    };
  } else if (s >= 20) {
    return {
      colorName: 'orange',
      label: 'Challenging',
      badgeClass: 'bg-orange-500/10 dark:bg-orange-500/15 text-orange-700 dark:text-orange-400 border border-orange-600/25 dark:border-orange-500/30',
      pillClass: 'bg-orange-500 text-white',
      barColor: '#f97316',
      textClass: 'text-orange-700 dark:text-orange-400',
      borderClass: 'border-orange-600/25 dark:border-orange-500/40',
      dotClass: 'bg-orange-500',
    };
  } else {
    return {
      colorName: 'red',
      label: 'Unfavourable',
      badgeClass: 'bg-rose-500/10 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-600/25 dark:border-rose-500/30',
      pillClass: 'bg-rose-500 text-white',
      barColor: '#ef4444',
      textClass: 'text-rose-700 dark:text-rose-400',
      borderClass: 'border-rose-600/25 dark:border-rose-500/40',
      dotClass: 'bg-rose-500',
    };
  }
}

interface CategoryDataPoint {
  score: number;
  insight: string;
  transitAspect: string;
}

const FALLBACK_CATEGORY_DATA: Record<string, Record<string, CategoryDataPoint>> = {
  aries: {
    health: {
      score: 88,
      insight: 'Mars in your ascendant energizes physical vitality, stamina, and cardiovascular resilience today. Channel this high-octane energy into athletic conditioning, yoga, or a vigorous morning walk. Remember to hydrate conscientiously to regulate your thermal equilibrium and pacify internal Pitta dosha. Avoid impulsive overexertion late in the evening to ensure deep, restorative sleep.',
      transitAspect: 'Mars Ascendant Ingress • High Vitality Flow',
    },
    wealth: {
      score: 76,
      insight: 'Promising planetary alignments support consolidating material assets and strategically evaluating upcoming expenditure. Past resource allocations and calculated investments begin demonstrating stable, compounding yields. Exercise discernment before committing to speculative proposals or high-risk market moves today. Focusing on emergency reserve expansion and debt retirement brings long-term financial security.',
      transitAspect: 'Venus-Jupiter Aspect • Asset Stability',
    },
    relationship: {
      score: 70,
      insight: 'Direct and transparent dialogue clears long-standing ambiguities with family members and close companions. Practice empathetic listening so your loved ones feel genuinely acknowledged and emotionally validated. A slight tendency toward impatience may surface during midday discussions, so pause before reacting. Warm evening interactions will restore communal harmony and mutual trust.',
      transitAspect: 'Solar Energy in 7th • Clear Communication',
    },
    love_line: {
      score: 84,
      insight: 'Magnetic passion and adventurous boldness light up your romantic axis under favorable Venusian transits. Single natives encounter electric attractions in social or recreational circles with high potential for chemistry. Committed partners can rekindle deep emotional intimacy through spontaneous shared adventures and heartfelt conversations. Keep honesty at the forefront to transform fiery attraction into lasting emotional devotion.',
      transitAspect: 'Venus-Mars Trine • Passionate Chemistry',
    },
    education: {
      score: 78,
      insight: 'A surge of analytical mental drive and competitive endurance assists you in conquering demanding coursework today. Ideal planetary hours favor mastering complex quantitative modules, timed mock examinations, and technical subjects. Structured revisions conducted in the morning hours yield superior retention and conceptual clarity. Trust your deductive instincts while maintaining methodical attention to detailed notes.',
      transitAspect: 'Mercury-Mars Synthesis • Academic Stamina',
    },
    professional: {
      score: 91,
      insight: 'Dynamic initiative and decisive problem-solving position you favorably in front of management and key stakeholders. Pitching pioneering solutions or leading team deliverables today attracts enthusiastic executive backing. Guard against confrontational debates with senior colleagues by framing feedback constructively. Decisive actions taken before sunset unlock significant pathways for leadership advancement.',
      transitAspect: 'Sun in 10th Aspect • Executive Command',
    },
    travel: {
      score: 65,
      insight: 'Short business excursions, daily commutes, and local transits proceed with favorable navigational alignments. Review travel logistics and vehicular condition early to circumvent minor delays and maintain optimal composure. Auspicious travel directions point toward the south and east for productive commercial outcomes. Keep your travel timetable adaptable to embrace unexpected serendipitous discoveries along the way.',
      transitAspect: 'Lunar Navigation Aspect • Swift Commutes',
    },
    cosmic_pulse: {
      score: 92,
      insight: 'Dynamic planetary transits ignite ambitious initiatives, emotional resilience, and decisive leadership across all life spheres today. With your ruling planet elevating mental stamina, you balance career advancement and relational harmony with effortless poise. Maintain consistent pacing through the midday hours to maximize overall productivity and cosmic vitality.',
      transitAspect: 'Mars Planetary Alignment • Overall Cosmic Vitality',
    },
  },
  taurus: {
    health: {
      score: 75,
      insight: 'Venus in harmonious dignity promotes physical grounding, metabolic equilibrium, and sensual well-being. Gentle neck stretches and restorative vocal exercises relieve tension stored in the cervical spine and throat. Focus on warm, sattvic nutrition to support optimal digestion and steady energy levels. Taking unhurried evening strolls amidst natural greenery will effortlessly ground any residual sensory fatigue.',
      transitAspect: 'Venus Dignity • Restorative Nutrition',
    },
    wealth: {
      score: 92,
      insight: 'Superb planetary trines illuminate your 2nd house of accumulated reserves, enhancing material prudence and asset retention. Calculated opportunities involving tangible assets, real estate valuations, or sovereign bonds exhibit favorable compounding potential. Avoid hasty impulse splurges on ephemeral luxuries and instead allocate surpluses to secure reserves. Diligent financial auditing conducted today uncovers immediate avenues for compounding long-term prosperity.',
      transitAspect: 'Venus-Kuber Resonance • Peak Prosperity',
    },
    relationship: {
      score: 86,
      insight: 'Gentle loyalty and unwavering emotional dependability serve as your greatest relational strengths today. Domestic interactions thrive when you create a serene, unhurried environment for family members to share their thoughts. If differing perspectives arise regarding shared household responsibilities, respond with calm patience rather than stubborn resistance. A home-cooked evening meal shared with loved ones deepens mutual appreciation and emotional warmth.',
      transitAspect: 'Anahata Heart Alignment • Domestic Harmony',
    },
    love_line: {
      score: 89,
      insight: 'Warm Venusian harmonies grace your romantic axis, fostering deep tactile affection, sensual connection, and mutual security. Single Taurus natives may find meaningful emotional resonance with someone who demonstrates consistency, integrity, and shared life values. Committed partners can strengthen their shared foundation through honest conversations about shared dreams and comfortable intimacy. Express heartfelt gratitude to let your partner feel cherished, valued, and emotionally safe.',
      transitAspect: 'Venus-Moon Conjunction • Sweet Romantic Bliss',
    },
    education: {
      score: 72,
      insight: 'Your steadfast concentration and methodological approach provide an ideal foundation for mastering dense academic coursework. Scholarly pursuits in finance, architectural design, environmental sciences, or classical arts yield deep conceptual understanding. Repetition and systematic note-taking during morning study hours enhance memory retention significantly. Trust your steady learning pace rather than rushing through complex reference materials.',
      transitAspect: 'Earth Element Grounding • Subject Mastery',
    },
    professional: {
      score: 80,
      insight: 'Steadfast composure and meticulous attention to procedural detail anchor your team deliverables during high-pressure workplace moments. Senior stakeholders appreciate your pragmatic approach and trustworthy management of operational workflows. This is an opportune planetary window for negotiating contracts, reviewing quarterly targets, or standardizing project benchmarks. Maintain quiet confidence in your expertise, as steady competence speaks louder than dramatic gestures.',
      transitAspect: 'Saturn 10th Transit • Reliable Operations',
    },
    travel: {
      score: 58,
      insight: 'Deliberate, well-curated travel itineraries proceed smoothly when you prioritize comfort, leisure, and scenic routes. Local commutes and regional travel for business or leisure benefit from early departure and verified reservations. Auspicious travel directions point toward the south and southeast for productive and peaceful journeys. Keep transit schedules flexible to avoid rushing and fully absorb the tranquility of your surroundings.',
      transitAspect: 'Moderate Ingress • Unhurried Movement',
    },
    cosmic_pulse: {
      score: 86,
      insight: 'Sensual Venusian harmonics and grounded earth energies create a deeply anchored, prosperous day across your financial and relational domains. Practical decisions taken with patient deliberation yield steady compounded success while nurturing meaningful interpersonal bonds. Ground yourself through nature and mindful pauses to maintain peak vitality.',
      transitAspect: 'Venus Planetary Harmony • Grounded Cosmic Radiance',
    },
  },
  gemini: {
    health: {
      score: 81,
      insight: 'Mercury’s brisk transit stimulates mental agility and nervous system activity, requiring conscious pacing throughout your day. Practice diaphragmatic breathwork or short digital pauses to prevent sensory overload and alleviate neck and shoulder tension. Nourishing herbal teas and adequate hydration help maintain neurological calm and respiratory balance. Prioritize a relaxing wind-down routine before sleep to quiet an active, racing imagination.',
      transitAspect: 'Pranayama Balance • Mental Calm Flow',
    },
    wealth: {
      score: 79,
      insight: 'Dynamic commercial currents open up multi-stream earning possibilities, freelance contracts, or creative monetization avenues. Your analytical versatility aids in identifying lucrative arbitrage or digital commerce trends ahead of the market curve. Be cautious with speculative investments that promise unrealistic speed over proven underlying value. Channeling a fixed percentage of income into liquid emergency savings safeguards your long-term independence.',
      transitAspect: 'Mercury-Jupiter Trine • Intellectual Gains',
    },
    relationship: {
      score: 84,
      insight: 'Lively intellectual exchanges and witty conversations breathe vibrant energy into your social interactions and friendships. Family discussions benefit from your natural curiosity and open-minded mediation between differing opinions. Make a conscious effort to listen attentively rather than swiftly jumping ahead to the next conversational topic. Your warm verbal encouragement uplifts a close sibling or friend facing a personal dilemma.',
      transitAspect: 'Air Element Harmony • Vibrant Social Circle',
    },
    love_line: {
      score: 77,
      insight: 'Electric conversational chemistry and playful banter spark romantic excitement under auspicious airy planetary transits. Single Geminis might find surprising attraction through intellectual forums, virtual exchanges, or casual neighborhood encounters. In partnerships, sharing books, engaging in curious debates, or planning spontaneous date nights reignites emotional freshness. Transparent honesty regarding your emotional needs ensures lightness without sacrificing deeper commitment.',
      transitAspect: 'Mercury Romantic Spark • Playful Curiosity',
    },
    education: {
      score: 94,
      insight: 'Mercurial brilliance accelerates cognitive processing, making this a prime phase for linguistic studies, coding, journalism, and rapid comprehension. You absorb vast amounts of varied information effortlessly, excelling in interactive seminars and competitive aptitude tests. Break study sessions into focused twenty-minute sprints to keep restlessness from diluting your concentration. Summarizing complex topics in your own words solidifies long-term academic mastery.',
      transitAspect: 'Mercury 1st House • Peak Logic Mastery',
    },
    professional: {
      score: 85,
      insight: 'Sharp communication acumen and versatile problem-solving make you an invaluable bridge between cross-functional corporate teams. Presenting strategic ideas, drafting influential proposals, or leading client negotiations yields swift, positive approvals. Steer clear of spreading yourself too thin across too many concurrent projects; select your top three priorities. Your ability to distill complex data into actionable steps positions you for greater career visibility.',
      transitAspect: 'Commercial Diplomacy • Strategic Closures',
    },
    travel: {
      score: 90,
      insight: 'Short-distance transit, intra-city commutes, and swift impromptu excursions flow with favorable celestial support. Verify route conditions and digital passes beforehand to navigate busy corridors without unexpected delays. Auspicious travel directions point toward the north and northwest for trade, networking, and creative exploration. Keep travel lightweight and carry versatile essentials to adapt swiftly to dynamic itineraries.',
      transitAspect: 'Air Ingress • Inspiring Outbound Journeys',
    },
  },
  cancer: {
    health: {
      score: 68,
      insight: 'The Lunar cycle brings heightened emotional sensitivity, making gentle digestive care and autonomic nervous system regulation essential. Incorporate warm, home-cooked broths, soothing herbal infusions, and mindful eating habits to support healthy gut digestion. Gentle swimming, water therapies, or reflective journaling near sunset help release absorbed emotional stress. Establishing soothing evening rituals promotes restful, recuperative sleep and cellular rejuvenation.',
      transitAspect: 'Lunar Vitality • Digestive Comfort',
    },
    wealth: {
      score: 82,
      insight: 'Intuitive financial prudence protects domestic assets and guides sensible long-term resource allocations. Family investments, real estate evaluations, or savings plans aimed at home security receive favorable planetary support. Avoid making emotionally driven purchase decisions during moments of domestic stress or market volatility. Setting aside funds for predictable future family milestones builds an impenetrable fortress of security.',
      transitAspect: '4th House Security • Domestic Prosperity',
    },
    relationship: {
      score: 91,
      insight: 'Your natural empathy and nurturing presence create a safe haven for family members, close friends, and kindred spirits. Thoughtful gestures, such as preparing comfort food or offering an attentive listening ear, dissolve recent household tensions. Maintain clear, healthy emotional boundaries so that you do not absorb burdens that belong to others. Heartfelt evening conversations strengthen ancestral bonds and foster deep emotional unity.',
      transitAspect: 'Moon-Jupiter Trine • Deep Soul Connection',
    },
    love_line: {
      score: 88,
      insight: 'Deep emotional intimacy and soulful vulnerability take center stage under tender, water-dominant planetary transits. Singles attract compassionate, protective partners who appreciate genuine emotional depth and authentic vulnerability. Couples experience rekindled emotional harmony through quiet, cozy evenings spent reminiscing and renewing mutual devotion. Speaking candidly about your innermost feelings allows your partner to understand and cherish your heart completely.',
      transitAspect: 'Lunar Love Ingress • Emotional Vulnerability',
    },
    education: {
      score: 76,
      insight: 'Exceptional emotional memory and intuitive comprehension empower your progress in psychology, history, literature, and medical sciences. Immersive, solitary study environments allow you to absorb complex conceptual frameworks without distracting external noise. Visual mind maps and storytelling techniques enhance retention far better than dry rote memorization. Trust your creative intuition when answering subjective examination questions or writing analytical essays.',
      transitAspect: 'Moon Tranquil Zone • Memory Retention',
    },
    professional: {
      score: 79,
      insight: 'Empathetic leadership and instinctual teamwork enable you to navigate complex organizational politics with graceful diplomacy. Clients and colleagues place deep trust in your ethical consistency and protective stewardship of team welfare. While supporting team morale, remember to champion your personal contributions and seek the credit you genuinely merit. Concluding pending administrative tasks before the weekend clears the runway for strategic leadership opportunities.',
      transitAspect: 'Water Element Empathy • Collaborative Wins',
    },
    travel: {
      score: 62,
      insight: 'Journeys toward lakesides, river banks, coastal regions, or tranquil heritage towns offer deep psychological rejuvenation. Traveling with trusted family members or intimate companions fosters lasting, cherished memories and emotional healing. Auspicious travel directions lean toward the north and east for peaceful, spiritually enriching travel outcomes. Ensure your lodging provides a secure, peaceful ambiance so you can truly unwind away from daily duties.',
      transitAspect: 'Coastal Water Aspect • Spiritual Restoration',
    },
  },
  leo: {
    health: {
      score: 90,
      insight: 'Solar radiance invigorates your cardiovascular system, spine, and natural vital life-force throughout the waking day. Engage in brisk morning sun salutations or cardiovascular exercise to channel high internal energy into physical strength. Guard against excessive physical strain or postural slouching during long hours at workstations. Staying well-hydrated with citrus-infused water and pacing your commitments keeps your energy burning bright without burnout.',
      transitAspect: 'Solar Manipura Peak • Radiant Stamina',
    },
    wealth: {
      score: 85,
      insight: 'Auspicious cosmic currents spotlight your 5th and 11th houses, expanding opportunities for speculative gains and creative enterprise profits. Strategic investments in luxury brands, entertainment, gold, or high-growth ventures show encouraging upward trajectory. Balance your natural generosity with prudent expenditure discipline, ensuring gifts and social hospitality remain within budget. Prudent wealth expansion strategies instituted today fortify your royal financial independence.',
      transitAspect: 'Sun Royal Treasury • Prestige Acquisitions',
    },
    relationship: {
      score: 78,
      insight: 'Magnanimous warmth, playful charisma, and generous loyalty make you the shining heart of your family and friendship circles. Leading social gatherings with authentic humility rather than dominant authority earns genuine admiration and deep respect. Take time to acknowledge the quiet contributions of quieter companions who may feel overshadowed by large personalities. Joyful celebrations or shared dining this evening solidify lasting bonds of mutual affection.',
      transitAspect: 'Solar Magnanimity • Harmonious Kinship',
    },
    love_line: {
      score: 86,
      insight: 'Grand romantic gestures, passionate chemistry, and regal devotion make your romantic life sparkle with theatrical charm. Single Leos turn heads effortlessly in public or celebratory gatherings, drawing admirers who resonate with confident enthusiasm. In committed bonds, showering your partner with heartfelt praise, romantic surprises, and undivided attention reignites the flame. Allow your tender, vulnerable side to show, proving that your royal heart is as loving as it is brave.',
      transitAspect: 'Sun-Venus Romance • Regal Affection',
    },
    education: {
      score: 82,
      insight: 'Supreme self-assurance and creative flair elevate your academic performances, dramatic presentations, and competitive debates. Studies in political science, performing arts, corporate governance, and executive leadership yield stellar breakthroughs. Channel your competitive spirit into surpassing your past personal bests rather than obsessing over peer rankings. Practicing oratory presentations out loud sharpens your retention and commands total audience attention.',
      transitAspect: 'Solar Oratory Flow • Debate & Exam Glory',
    },
    professional: {
      score: 93,
      insight: 'Executive authority and commanding vision position you at the vanguard of key institutional initiatives and high-stakes projects. Senior decision-makers gravitate toward your decisive confidence and ability to inspire morale during complex organizational challenges. Avoid dismissing alternative viewpoints; incorporating collaborative feedback actually elevates your executive stature. Seize opportunities to pitch pioneering concepts before the sun sets to secure high-visibility backing.',
      transitAspect: 'Sun in Highest Dignity • Executive Triumph',
    },
    travel: {
      score: 75,
      insight: 'High-profile business travels, executive summits, and visits to prestigious historical capitals proceed with remarkable favor. Travel undertaken for leadership representation, industry conferences, or celebratory leisure elevates your public prestige. Auspicious directions point toward the east and northeast for victorious outcomes and expanded influence. Pack elegant attire and maintain organized schedules to reflect your commanding professional presence.',
      transitAspect: 'Solar Highway Aspect • High Prestige Travel',
    },
  },
  virgo: {
    health: {
      score: 82,
      insight: 'Mercury’s analytical influence highlights gastrointestinal wellness, nervous system balance, and mindful lifestyle hygiene. Nourish your system with fiber-rich, easily digestible whole foods, probiotics, and warm herbal teas to support gut flora. Schedule brief mental reset intervals during intense analytical tasks to reduce eye strain and quiet hypercritical thinking. An early evening stretching routine or contemplative walk in nature promotes restorative cellular balance.',
      transitAspect: 'Mercury Clean Flow • Posture & Gut Balance',
    },
    wealth: {
      score: 84,
      insight: 'Meticulous financial tracking and disciplined budgeting enable continuous, risk-adjusted compounding of your monetary resources. Conducting an exhaustive audit of recurring subscriptions, banking fees, and investment portfolios reveals immediate cost-efficiency gains. Favorable alignments support conservative equity allocations, health insurance upgrades, and emergency liquidity building. Your analytical prudence ensures your hard-earned assets remain shielded from market volatility.',
      transitAspect: 'Calculated Compounding • Strategic Savings',
    },
    relationship: {
      score: 70,
      insight: 'Quiet dependability, practical service, and thoughtful assistance form the heartwarming cornerstone of your personal relationships. Offer constructive advice with gentle kindness, ensuring loved ones perceive your suggestions as care rather than criticism. Friends and family turn to your calm, rational perspective to help resolve convoluted domestic entanglements. Small, thoughtful acts of service performed today communicate deeper love than grand, empty declarations.',
      transitAspect: 'Practical Devotion • Dependable Service',
    },
    love_line: {
      score: 72,
      insight: 'Sincere dedication, emotional steadiness, and practical devotion build an enduring, safe haven within your romantic partnerships. Single Virgos may connect deeply with an articulate, intellectually grounded partner who values emotional maturity and integrity. Couples find romantic fulfillment through shared domestic routines, thoughtful teamwork, and unhurried heart-to-heart dialogues. Lower your expectations of perfection, embracing the authentic, messy beauty of real human connection.',
      transitAspect: 'Earth Modality Loyalty • Unwavering Care',
    },
    education: {
      score: 95,
      insight: 'Phenomenal mental precision and acute critical analysis make this an extraordinary phase for mastering intricate scientific and quantitative fields. Studies in data analysis, medical disciplines, auditing, accounting, and technical certifications progress with unmatched clarity. Organizing your study notes into structured, color-coded summaries maximizes your long-term information recall. Trust your methodical diligence—it will outperform sporadic bursts of hasty cramming every time.',
      transitAspect: 'Mercury Analytical Zenith • Perfect Retention',
    },
    professional: {
      score: 89,
      insight: 'Flawless organization, rigorous quality control, and procedural mastery make you the indispensable anchor of your organization. Audits, operational standardizations, complex project deliveries, and performance reviews proceed under your vigilant guidance. While perfecting deliverables, beware of diminishing returns caused by over-polishing beyond client expectations. Management recognizes your meticulous precision, paving the way for expanded institutional authority.',
      transitAspect: 'Saturn-Mercury Discipline • Milestone Delivery',
    },
    travel: {
      score: 64,
      insight: 'Methodically planned itineraries, business trips, and purposeful transit corridors proceed with remarkable punctuality. Double-check travel documentation, ticketing details, and logistical schedules in advance to preserve your trademark peace of mind. Auspicious travel directions point toward the north and northwest for trade, research, and technical missions. Keep your luggage organized and streamlined to make transits effortlessly smooth and stress-free.',
      transitAspect: 'Methodical Route Flow • Organized Transit',
    },
  },
  libra: {
    health: {
      score: 74,
      insight: 'Venus emphasizes somatic symmetry, kidney hydration, and lower back postural alignment throughout your daily activities. Balance demanding desk work with gentle lumbar stretches, pelvic tilts, and regular hydration with pure mineral water. Cultivate inner tranquility through soothing ambient music, aesthetic spaces, and mindful meditation to calm the nervous system. Avoid overextending yourself to please others; honoring your body\'s need for peaceful rest is essential.',
      transitAspect: 'Equilibrium Aspect • Postural Harmony',
    },
    wealth: {
      score: 80,
      insight: 'Harmonious alignments in your financial axis favor collaborative wealth strategies, legal settlements, and balanced portfolio allocation. Joint investments, artistic ventures, luxury curations, and contract renegotiations offer promising avenues for steady return. Keep an eye on balancing discretionary spending on lifestyle aesthetics with firm contributions to long-term wealth funds. Seeking consensus with financial partners or advisors today yields balanced, profitable fiscal strategies.',
      transitAspect: 'Venusian Asset Flow • Balanced Accumulation',
    },
    relationship: {
      score: 93,
      insight: 'Your natural diplomatic grace and empathic charm bridge divides, effortlessly dissolving interpersonal discord within your social sphere. You excel at mediating differing viewpoints, creating fair outcomes where every party feels respected and understood. Ensure that your desire for surface peace does not lead you to suppress your own legitimate preferences or needs. An intimate gathering or cultural evening with close friends fosters deep emotional solidarity.',
      transitAspect: 'Venus Conciliation Peak • Flawless Diplomacy',
    },
    love_line: {
      score: 92,
      insight: 'Pure romantic elegance, mutual reciprocity, and heart-centered resonance illuminate your partnership axis under radiant Venusian transits. Single Libras encounter prospective partners through artistic venues, design spaces, legal conferences, or sophisticated social gatherings. In committed relationships, curating a romantic candlelit dinner, exchanging heartfelt poetry, or expressing deep appreciation deepens intimacy. Focus on authentic mutual respect to transform romantic infatuation into an enduring spiritual bond.',
      transitAspect: 'Venus 7th House Zenith • Magical Soul Resonance',
    },
    education: {
      score: 79,
      insight: 'Balanced intellectual curiosity aids rapid progress in jurisprudence, international relations, design, literature, and social sciences. Collaborative study circles and structured debates stimulate your intellect far more effectively than isolated cramming. Take decisive stances on philosophical or theoretical questions rather than lingering in prolonged conceptual ambivalence. Synthesizing complementary viewpoints in essays and presentations earns high academic appraisal.',
      transitAspect: 'Aesthetic Wisdom • Jurisprudence & Design',
    },
    professional: {
      score: 78,
      insight: 'Exquisite diplomatic tact and alliance-building finesse make you an exceptional negotiator and team consensus-builder. High-stakes client presentations, partnership agreements, and public relations campaigns thrive under your balanced stewardship. Stand firm on your core commercial terms during negotiations, pairing gracious etiquette with steadfast strategic resolve. Your ability to harmonize conflicting corporate interests marks you out for senior executive advancement.',
      transitAspect: 'Air Diplomatic Harmony • Partner Deals',
    },
    travel: {
      score: 77,
      insight: 'Charming cultural excursions, gallery tours, romantic weekend retreats, and scenic journeys proceed with exquisite harmony. Traveling accompanied by a compatible partner or close companion magnifies the joy and aesthetic pleasure of every transit. Auspicious travel directions point toward the west and northwest for fruitful social and diplomatic missions. Choose accommodations celebrated for aesthetic elegance and tranquil ambiance to maximize your trip’s delight.',
      transitAspect: 'Venus Scenic Ingress • Romantic Excursions',
    },
  },
  scorpio: {
    health: {
      score: 86,
      insight: 'Mars and Pluto channel deep regenerative vitality into your physical body, supporting cellular repair and emotional catharsis. Incorporate deep diaphragmatic breathwork, core strengthening, and pelvic mobility exercises to release deep-seated physical tension. Dedicate time to detoxify your system by drinking clean water, sweating through sauna or vigorous exercise, and meditating. Allow yourself to release lingering emotional resentments, freeing up vast reserves of physical stamina.',
      transitAspect: 'Mars-Ketu Cellular Renewal • Deep Prana',
    },
    wealth: {
      score: 83,
      insight: 'Potent planetary alignments illuminate your 8th house of joint resources, legacy assets, tax optimization, and strategic investments. Thorough due diligence into hidden financial clauses, insurance policies, or intellectual property rights yields substantial advantage. Maintain strategic discretion regarding your net worth and upcoming moves, shielding your plans from external scrutiny. Reinvesting profits into foundational assets compounds your financial resilience against economic fluctuations.',
      transitAspect: '8th House Treasure Ingress • High Equity',
    },
    relationship: {
      score: 75,
      insight: 'Fierce loyalty and uncompromised emotional authenticity define your closest relationships, inspiring deep trust among true companions. You easily detect unspoken undercurrents in social situations; address underlying tensions with calm, direct clarity. Avoid maintaining defensive emotional barriers with those who have consistently proven their loyalty and integrity over time. A candid, soul-deep conversation with a trusted confidant this evening seals an unshakeable bond.',
      transitAspect: 'Water Depth Alignment • Unbreakable Bonds',
    },
    love_line: {
      score: 87,
      insight: 'Electric magnetic attraction and transformative emotional depth define your romantic world under intense cosmic aspects. Single Scorpios draw passionate admirers who are captivated by your mysterious allure and authentic, soulful presence. In committed partnerships, mutual vulnerability and total emotional transparency unlock profound physical and spiritual unity. Let down your guard completely, as true intimacy flourishes when passion is embraced without fear.',
      transitAspect: 'Passionate Magnetism • Soulmate Union',
    },
    education: {
      score: 88,
      insight: 'Incisive investigative focus and relentless intellectual stamina make this an extraordinary period for complex research and breakthroughs. You thrive in forensic analysis, psychology, deep tech, investigative journalism, esoteric philosophies, and advanced sciences. Complex concepts that confuse others surrender quickly to your penetrating intuition and disciplined inquiry. Maintain focus on one major subject at a time to harness the full piercing power of your intellect.',
      transitAspect: 'Deep Investigative Focus • Analytical Discovery',
    },
    professional: {
      score: 90,
      insight: 'Unshakeable strategic acumen and crisis-management mastery position you as the definitive problem-solver in demanding situations. While others may panic amidst corporate turmoil, your tactical composure allows you to execute precise, decisive turnaround strategies. Direct your formidable willpower toward common institutional goals rather than getting embroiled in subtle workplace rivalries. A major milestone achieved today garners high-level respect and consolidates your executive authority.',
      transitAspect: 'Mars Strategic Command • Crisis Mastery',
    },
    travel: {
      score: 60,
      insight: 'Purposeful, private journeys, spiritual retreats, and travel near deep bodies of water offer profound mental clarity. Solitary travel or trips undertaken with one deeply trusted companion prove far more rewarding than crowded group tours. Auspicious travel directions point toward the south and southwest for transformative personal and commercial discoveries. Keep emergency supplies and contingency plans handy to maintain absolute control over your travel transit.',
      transitAspect: 'Introspective Transit • Sacred Solitude',
    },
  },
  sagittarius: {
    health: {
      score: 84,
      insight: 'Expansive Jupiterian energy fuels your vitality, optimism, and physical stamina, inspiring an urge for wide-open outdoor movement. Engage in trail running, equestrian sports, hiking, or brisk athletic walks to invigorate the hips, thighs, and liver. Moderate heavy indulgence in celebratory foods and sugary beverages to maintain steady metabolic harmony throughout the day. Restorative sleep preceded by inspirational reading ensures your natural exuberance remains vibrant and fresh.',
      transitAspect: 'Jupiterian Vitality • Outdoor Stamina',
    },
    wealth: {
      score: 88,
      insight: 'Jupiter’s expansive gaze illuminates your houses of prosperity, opening avenues for cross-border investments, royalties, and higher returns. Long-range financial planning, international commerce, and venture capital allocations show substantial promise for growth. Guard against over-optimistic projections by grounding your investment decisions in audited figures and historical performance metrics. Allocating surpluses toward philanthropic causes or intellectual assets multiplies your good karmic fortune.',
      transitAspect: 'Guru Dhan Yoga • Abundant Inflows',
    },
    relationship: {
      score: 80,
      insight: 'Cheerful optimism, philosophical humor, and infectious enthusiasm make you a beacon of light in every social interaction. Family members and friends look to your broad perspective to help them transcend petty grievances and see the bigger picture. Be mindful that your direct, unfiltered honesty does not accidentally bruise the feelings of sensitive companions. An evening of philosophical conversation, hearty laughter, and shared stories uplifts the spirits of everyone present.',
      transitAspect: 'Philosophical Bonhomie • High Spirit Camaraderie',
    },
    love_line: {
      score: 82,
      insight: 'Romantic adventure, playful banter, and joyful mutual growth define your love life under dynamic fire-sign transits. Single Sagittarians attract free-spirited, intellectually stimulating partners who share an insatiable thirst for travel and truth. In partnerships, exploring new philosophies, embarking on spontaneous day trips, or planning ambitious future goals reignites romance. Give each other the freedom to grow while cherishing the unbreakable trust that anchors your connection.',
      transitAspect: 'Jupiterian Heart Spark • Expansive Affection',
    },
    education: {
      score: 91,
      insight: 'Expansive comprehension and profound philosophical insight empower extraordinary academic achievements across higher education. You excel in comparative jurisprudence, global economics, philosophy, aviation, theology, and international relations. Broad thematic understanding comes naturally, though you should dedicate equal care to reviewing specific technical citations and formulas. Discussing your thesis or coursework with mentors opens doors to valuable academic fellowships.',
      transitAspect: 'Higher Wisdom Blessing • Academic Distinction',
    },
    professional: {
      score: 86,
      insight: 'Visionary strategy, inspiring leadership, and global perspective enable you to rally teams around daring, transformative objectives. Cross-functional initiatives, international business expansion, and creative publishing campaigns thrive under your optimistic guidance. Ensure that you pair your grand, visionary roadmaps with practical milestone tracking to maintain steady operational execution. Presenting your expansive vision to key executives secures enthusiastic sponsorship and opens doors to leadership.',
      transitAspect: 'Jupiter Global Outreach • Strategic Buy-In',
    },
    travel: {
      score: 96,
      insight: 'Exceptional celestial favor crowns long-distance voyages, international flights, pilgrimage expeditions, and wilderness explorations. Journeys undertaken for higher learning, cultural immersion, or philosophical discovery bring immense serendipity and fortune. Auspicious travel directions point toward the east and northeast for mind-expanding and commercially rewarding transits. Embrace spontaneous side journeys, as unexpected detours along your path will yield the most unforgettable wisdom.',
      transitAspect: '9th House Supreme Transit • Global Horizons',
    },
  },
  capricorn: {
    health: {
      score: 76,
      insight: 'Saturnian discipline supports your skeletal framework, joints, and knees, rewarding consistent, structured wellness routines. Incorporate calcium-rich nutrition, joint mobilization exercises, and steady posture awareness into your workday. Avoid skipping scheduled meals or pushing past physical exhaustion in the pursuit of unrelenting professional milestones. Taking a warm mineral bath and unplugging from work communication in the evening ensures deep restorative recovery.',
      transitAspect: 'Saturn Bone Grounding • Steady Stamina',
    },
    wealth: {
      score: 90,
      insight: 'Masterful financial discipline, compounding asset strategies, and conservative capital preservation steadily build generational wealth. Real estate valuations, infrastructure investments, fixed-yield bonds, and blue-chip equities progress with dependable stability. Resist speculative market hypes; your competitive edge lies in patience, structural due diligence, and calculated endurance. Channeling profits into debt retirement and tangible assets solidifies an unassailable financial empire.',
      transitAspect: 'Saturn Fortress Assets • Unshakeable Wealth',
    },
    relationship: {
      score: 72,
      insight: 'Steadfast loyalty, quiet dependability, and unshakeable integrity earn you the profound respect of family and elder relatives. While you may express affection through duty and material provision rather than effusive words, your loved ones cherish your presence. Take time to verbally affirm your support so that family members feel emotionally connected as well as physically secure. A quiet, supportive family dinner this evening reinforces the deep intergenerational bonds of your household.',
      transitAspect: 'Dharmic Familial Duty • Respect & Honor',
    },
    love_line: {
      score: 68,
      insight: 'Enduring devotion, emotional maturity, and mutual respect anchor your romantic journey under auspicious earth-sign transits. Single Capricorns attract mature, goal-oriented partners who value personal responsibility, loyalty, and long-term security. In established unions, working together toward tangible life milestones deepens mutual admiration and emotional intimacy. Express your tender, vulnerable side to your partner, showing that behind your professional armor lies a deeply devoted heart.',
      transitAspect: 'Earth Stability • Enduring Commitment',
    },
    education: {
      score: 85,
      insight: 'Formidable mental endurance, iron willpower, and structured study habits make this a prime phase for conquering rigorous curricula. You excel in civil engineering, corporate law, corporate governance, architecture, and competitive civil service examinations. Creating structured study timetables and adhering strictly to daily milestones guarantees complete academic mastery. Trust your methodical pacing; consistent daily diligence will outlast any short-lived burst of academic competition.',
      transitAspect: 'Saturn Structured Focus • Syllabus Domination',
    },
    professional: {
      score: 94,
      insight: 'Commanding executive maturity, operational excellence, and steadfast accountability make you the pillar of your enterprise. Senior management entrusts you with mission-critical projects, knowing your execution will be flawless, on-time, and within budget. Lead with compassionate mentorship, inspiring junior team members by modeling high ethical standards and technical precision. Decisive leadership demonstrations today position you favorably for anticipated promotions and executive appointments.',
      transitAspect: '10th House Master Authority • Career Peak',
    },
    travel: {
      score: 54,
      insight: 'Strictly scheduled business travels, corporate delegations, and structured transit routes proceed with reliable efficiency. Confirm logistical timelines, transport bookings, and corporate itineraries in advance to circumvent preventable transit disruptions. Auspicious travel directions point toward the south and west for high-value commercial and contractual outcomes. Maintain comfortable travel routines so that business trips leave you energized for high-stakes meetings.',
      transitAspect: 'Controlled Business Transit • Timely Arrival',
    },
  },
  aquarius: {
    health: {
      score: 73,
      insight: 'Saturn and Rahu influence neurological circulation, peripheral blood flow, and energetic balance throughout your system. Counteract prolonged screen exposure and mental fatigue by taking regular fresh-air walks and doing ankle and calf mobility stretches. Support vascular and nerve wellness with magnesium-rich foods, deep hydration, and calming breathwork exercises. Disconnecting from electronic screens an hour before sleep invites deep, uninterrupted, and mentally restorative sleep.',
      transitAspect: 'Circulatory Regulation • Nervous Calm',
    },
    wealth: {
      score: 82,
      insight: 'Innovative financial horizons expand through digital enterprises, technological investments, and collaborative community ventures. Your forward-looking foresight spots emerging technological disruptions and innovative fiscal platforms well before they enter mainstream adoption. Ensure that decentralized or venture capital allocations are balanced by liquid, conventional emergency reserves. Seeking guidance from independent financial specialists validates your unorthodox wealth-building strategies.',
      transitAspect: 'Future Tech Ingress • Digital Prosperity',
    },
    relationship: {
      score: 84,
      insight: 'Intellectual camaraderie, egalitarian values, and authentic individuality enrich your friendships and community associations. You naturally bridge diverse social groups, rallying peers around shared humanitarian causes or visionary community ideals. Balance your broad social networking with focused one-on-one attention for close family members who desire emotional intimacy. An engaging evening discussion on progressive social ideas creates memorable, inspiring solidarity among friends.',
      transitAspect: '11th House Community Flow • Altruistic Alliances',
    },
    love_line: {
      score: 75,
      insight: 'Intellectual resonance, mutual freedom, and shared progressive ideals form the electric foundation of your romantic life. Single Aquarians are drawn to eccentric, brilliant minds who honor individuality, philosophical debate, and personal independence. In relationships, planning unconventional date nights, engaging in social activism, or exploring new ideas keeps romance vibrant. Blend your deep mental connection with heartfelt emotional warmth, showing your partner how profoundly you care.',
      transitAspect: 'Air Unconventional Bond • Intellectual Romance',
    },
    education: {
      score: 92,
      insight: 'Visionary intellect, abstract conceptualization, and inventive genius empower breakthroughs across cutting-edge academic fields. Exceptional progress is highlighted in computer science, artificial intelligence, astrophysics, sociology, and modern inventions. Group brainstorming sessions and interactive experimental laboratories stimulate your brilliance far more than traditional lectures. Document your innovative hypotheses systematically, as your unique insights could form the basis of groundbreaking papers.',
      transitAspect: 'Rahu-Saturn Genius • Scientific Epiphany',
    },
    professional: {
      score: 88,
      insight: 'Disruptive innovation, technical expertise, and progressive problem-solving position you as a vital catalyst for organizational evolution. You excel at modernizing outdated processes, introducing automated workflows, and designing systems that scale effortlessly. Present your revolutionary concepts with clear commercial benchmarks so conservative stakeholders understand their tangible value. Collaborative team brainstorms led by you today unlock major competitive advantages for your company.',
      transitAspect: 'Disruptive Ideation • Technical Leadership',
    },
    travel: {
      score: 78,
      insight: 'Auspicious celestial alignments favor travels to high-tech metropolises, innovative research hubs, aviation expos, and group conferences. Transit flows smoothly when you leverage modern digital navigation apps and streamlined travel gadgets for seamless movement. Auspicious travel directions point toward the west and northwest for networking, intellectual expansion, and scientific ventures. Group travel and communal expeditions spark serendipitous friendships and inspiring collaborative opportunities.',
      transitAspect: 'Group Transit Ingress • Innovative Exploration',
    },
  },
  pisces: {
    health: {
      score: 70,
      insight: 'Jupiterian and Neptunian currents heighten your subtle energetic sensitivity, emphasizing lymphatic balance and restorative foot care. Incorporate warm Epsom salt foot soaks, gentle reflexology, and lymphatic drainage exercises to clear sluggish physical energy. Nourish your immune system with wholesome broths, adequate electrolytes, and clean, hydrating herbal teas throughout the day. Surrounding yourself with serene soundscapes or guided meditations before sleep invites deeply restorative, healing dreams.',
      transitAspect: 'Lymphatic Equilibrium • Sound Therapy Rest',
    },
    wealth: {
      score: 77,
      insight: 'Intuitive monetary currents and creative inspiration open channels for prosperity through artistic royalties, consulting, and international associations. Your gut instinct accurately senses hidden market trends and creative value, guiding sound financial choices. Maintain clear, structured accounting records and firm financial boundaries to protect your savings from emotionally motivated lending. Setting aside automated monthly contributions into protected, ethical investment funds secures your financial future.',
      transitAspect: 'Creative Royalty Flow • Overseas Fortune',
    },
    relationship: {
      score: 89,
      insight: 'Compassionate empathy, tender understanding, and soulful listening make you a comforting presence for family and friends in distress. You easily soothe heated arguments and heal lingering domestic friction through your gentle, forgiving demeanor. Be mindful to protect your emotional boundaries so that you do not take on the unresolved emotional burdens of others. A serene evening spent in quiet communion with loved ones restores communal peace and mutual understanding.',
      transitAspect: 'Jupiterian Compassion • Loving Harmony',
    },
    love_line: {
      score: 94,
      insight: 'Poetic tenderness, soulmate resonance, and unconditional emotional devotion weave a magical aura around your romantic partnerships. Single Pisces natives attract compassionate, emotionally attuned partners who cherish spiritual depth and artistic sensitivity. In committed unions, sharing heartfelt dreams, exchanging meaningful tokens of affection, and enjoying cozy quiet moments deepens your bond. Express your gratitude openly, allowing the timeless, healing power of unconditional love to nurture your relationship.',
      transitAspect: 'Venus Exaltation Resonance • Pure Soulmate Love',
    },
    education: {
      score: 81,
      insight: 'Rich creative imagination and holistic intuitive absorption empower superior mastery across artistic, philosophical, and healing disciplines. Studies in psychology, fine arts, creative writing, marine biology, and holistic medicine flourish with inspiring depth. Engaging with visual metaphors, audio lectures, and creative storytelling strengthens your retention far better than dry memorization. Trust your intuitive synthesis when tackling subjective examination topics and creative research assignments.',
      transitAspect: 'Intuitive Creative Absorption • Arts & Psyche',
    },
    professional: {
      score: 76,
      insight: 'Creative vision, empathetic diplomacy, and intuitive team leadership allow you to resolve organizational gridlocks with effortless grace. You excel in design, human resources, creative direction, healthcare, and humanitarian initiatives where empathy is key. Protect your creative focus by setting firm boundaries around your working hours and declining non-essential administrative burdens. Presenting imaginative, human-centered project solutions today wins the enthusiastic endorsement of senior stakeholders.',
      transitAspect: 'Empathetic Facilitation • Creative Solutions',
    },
    travel: {
      score: 82,
      insight: 'Auspicious cosmic currents favor journeys to seaside sanctuaries, tranquil island retreats, sacred rivers, and spiritual pilgrimages. Traveling near bodies of water provides profound emotional cleansing, creative inspiration, and spiritual renewal for your soul. Auspicious travel directions point toward the northeast and east for soulful restoration and artistic rejuvenation. Choose peaceful accommodations with unhurried schedules so you can fully immerse yourself in the therapeutic journey.',
      transitAspect: 'Water Pilgrimage Aspect • Soulful Restoration',
    },
  },
};

export function getSignCategoryInsightDetails(
  signId: string,
  categoryId: string,
  _language: string = 'en',
  dynamicCategoryData?: Record<string, any>
): {
  score: number;
  tier: PredictionTier;
  insight: string;
  transitAspect: string;
  categoryObj: ZodiacCategory;
  luckyTime?: string;
  remedy?: string;
} {
  const normSign = (signId || 'aries').toLowerCase().trim();
  const normCategory = (categoryId === 'all' ? 'cosmic_pulse' : (categoryId || 'health')).toLowerCase().trim();
  const categoryObj = ZODIAC_CATEGORIES.find((c) => c.id === categoryId || c.id === normCategory) || ZODIAC_CATEGORIES[0];

  const signData = FALLBACK_CATEGORY_DATA[normSign] || FALLBACK_CATEGORY_DATA['aries'];
  const fallbackPoint = signData[normCategory] || signData[categoryId] || signData['health'] || {
    score: 75,
    insight: 'Planetary alignments stimulate steady progress and positive developments today.',
    transitAspect: 'Favorable Planetary Transit',
  };

  let resolvedScore = fallbackPoint.score;
  let resolvedInsight = fallbackPoint.insight;
  let resolvedAspect = fallbackPoint.transitAspect;
  let resolvedLuckyTime: string | undefined = undefined;
  let resolvedRemedy: string | undefined = undefined;

  if (dynamicCategoryData && typeof dynamicCategoryData === 'object') {
    // Check direct key or aliases (e.g. love_line / loveLine / love_life, professional / career, all / cosmic_pulse)
    const rawVal = dynamicCategoryData[categoryId] ||
      dynamicCategoryData[normCategory] ||
      (normCategory === 'love_line' ? (dynamicCategoryData['loveLine'] || dynamicCategoryData['love_life']) : undefined) ||
      (normCategory === 'relationship' ? dynamicCategoryData['relationships'] : undefined) ||
      (normCategory === 'professional' ? dynamicCategoryData['career'] : undefined) ||
      (normCategory === 'cosmic_pulse' ? (dynamicCategoryData['all'] || dynamicCategoryData['forecast']) : undefined);

    if (rawVal) {
      if (typeof rawVal === 'object') {
        if (typeof rawVal.score === 'number') {
          resolvedScore = Math.max(0, Math.min(100, rawVal.score));
        }
        const textCandidate = rawVal.insight || rawVal.text;
        if (typeof textCandidate === 'string' && textCandidate.trim()) {
          resolvedInsight = textCandidate.trim();
        }
        const aspectCandidate = rawVal.transitAspect || rawVal.transit_aspect;
        if (typeof aspectCandidate === 'string' && aspectCandidate.trim()) {
          resolvedAspect = aspectCandidate.trim();
        }
        if (typeof rawVal.lucky_time === 'string' && rawVal.lucky_time.trim()) {
          resolvedLuckyTime = rawVal.lucky_time.trim();
        } else if (typeof rawVal.luckyTime === 'string' && rawVal.luckyTime.trim()) {
          resolvedLuckyTime = rawVal.luckyTime.trim();
        }
        if (typeof rawVal.remedy === 'string' && rawVal.remedy.trim()) {
          resolvedRemedy = rawVal.remedy.trim();
        }
      } else if (typeof rawVal === 'string' && rawVal.trim()) {
        resolvedInsight = rawVal.trim();
      }
    }
  }

  const tier = getPredictionTier(resolvedScore);

  return {
    score: resolvedScore,
    tier,
    insight: resolvedInsight,
    transitAspect: resolvedAspect,
    categoryObj,
    luckyTime: resolvedLuckyTime,
    remedy: resolvedRemedy,
  };
}
