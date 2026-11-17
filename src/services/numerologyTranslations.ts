import { formatLocalizedDigits as formatDigitsBase } from './birthChartTranslations';

export const formatLocalizedDigits = formatDigitsBase;

export function formatLocalizedDate(dateStr: string, lang: string = 'en'): string {
  if (!dateStr) return '';
  const l = (lang || 'en').split('-')[0].toLowerCase();
  return formatDigitsBase(dateStr, l);
}

// Maps traits (case-insensitive) to translation keys
const TRAIT_MAP: { [key: string]: string } = {
  'natural leader': 'natural_leader',
  'independent & ambitious': 'independent_ambitious',
  'visionary authority': 'visionary_authority',
  'high vitality & dignity': 'high_vitality_dignity',
  'empathetic & diplomatic': 'empathetic_diplomatic',
  'creative imagination': 'creative_imagination',
  'peaceful harmony': 'peaceful_harmony',
  'deep emotional resonance': 'deep_emotional_resonance',
  'philosophical wisdom': 'philosophical_wisdom',
  'expansive optimism': 'expansive_optimism',
  'master communicator': 'master_communicator',
  'lifelong teacher & advisor': 'lifelong_teacher',
  'lifelong teacher': 'lifelong_teacher',
  'methodical organizer': 'methodical_organizer',
  'out-of-the-box thinker': 'out_of_box_thinker',
  'technological genius': 'technological_genius',
  'courageous reformer': 'courageous_reformer',
  'rapid adaptability': 'rapid_adaptability',
  'commercial brilliance': 'commercial_brilliance',
  'witty eloquence': 'witty_eloquence',
  'multi-faceted curiosity': 'multi_faceted_curiosity',
  'refined aesthetics': 'refined_aesthetics',
  'sensory luxury': 'sensory_luxury',
  'magnetic charisma': 'magnetic_charisma',
  'devoted compassion': 'devoted_compassion',
  'deep introspection': 'deep_introspection',
  'occult & metaphysical insight': 'occult_insight',
  'analytical researcher': 'analytical_researcher',
  'detached clarity': 'detached_clarity',
  'unyielding endurance': 'unyielding_endurance',
  'mastery of discipline': 'mastery_discipline',
  'deep justice & humility': 'deep_justice_humility',
  'empire builder': 'empire_builder',
  'fearless courage': 'fearless_courage',
  'dynamic action': 'dynamic_action',
  'generous passion': 'generous_passion',
  'protector of the righteous': 'protector_righteous',
};

// Maps colors to translation keys
const COLOR_MAP: { [key: string]: string } = {
  'gold': 'gold',
  'copper': 'copper',
  'orange': 'orange',
  'yellow': 'yellow',
  'pearl white': 'pearl_white',
  'cream': 'cream',
  'silver': 'silver',
  'light green': 'light_green',
  'bright yellow': 'bright_yellow',
  'golden saffron': 'golden_saffron',
  'amber': 'amber',
  'electric blue': 'electric_blue',
  'grey': 'grey',
  'gray': 'grey',
  'brown': 'brown',
  'khaki': 'khaki',
  'emerald green': 'emerald_green',
  'light turquoise': 'light_turquoise',
  'pistachio': 'pistachio',
  'royal blue': 'royal_blue',
  'pristine white': 'pristine_white',
  'rose pink': 'rose_pink',
  'silvery lilac': 'silvery_lilac',
  'smoky grey': 'smoky_grey',
  'smoky gray': 'smoky_grey',
  'olive green': 'olive_green',
  'white': 'white',
  'variegated': 'variegated',
  'deep navy': 'deep_navy',
  'midnight black': 'midnight_black',
  'dark violet': 'dark_violet',
  'crimson red': 'crimson_red',
  'scarlet': 'scarlet',
  'coral pink': 'coral_pink',
};

// Maps weekdays to translation keys
const DAY_MAP: { [key: string]: string } = {
  'sunday': 'sunday',
  'monday': 'monday',
  'tuesday': 'tuesday',
  'wednesday': 'wednesday',
  'thursday': 'thursday',
  'friday': 'friday',
  'saturday': 'saturday',
};

// Planet number mapping for Mulank / Bhagyank
export function getPlanetNumberFromStr(planetStr: string, fallbackNum?: number): number {
  if (fallbackNum && fallbackNum >= 1 && fallbackNum <= 9) return fallbackNum;
  const p = (planetStr || '').toLowerCase();
  if (p.includes('sun') || p.includes('surya')) return 1;
  if (p.includes('moon') || p.includes('chandra')) return 2;
  if (p.includes('jupiter') || p.includes('guru') || p.includes('brihaspati')) return 3;
  if (p.includes('rahu')) return 4;
  if (p.includes('mercury') || p.includes('budha')) return 5;
  if (p.includes('venus') || p.includes('shukra')) return 6;
  if (p.includes('ketu')) return 7;
  if (p.includes('saturn') || p.includes('shani')) return 8;
  if (p.includes('mars') || p.includes('mangal')) return 9;
  return fallbackNum || 1;
}

export function getLocalizedPlanetTitle(planetStr: string, num: number, t: any): string {
  const pNum = getPlanetNumberFromStr(planetStr, num);
  return t(`numerology.meta.planets.${pNum}`, { defaultValue: planetStr });
}

export function getLocalizedTrait(trait: string, t: any): string {
  if (!trait) return '';
  const key = TRAIT_MAP[trait.trim().toLowerCase()];
  if (key) {
    return t(`numerology.meta.traits.${key}`, { defaultValue: trait });
  }
  return trait;
}

export function getLocalizedMission(missionStr: string, num: number, t: any): string {
  if (num >= 1 && num <= 9) {
    return t(`numerology.meta.missions.${num}`, { defaultValue: missionStr });
  }
  return missionStr;
}

export function getLocalizedDays(days: string[] | string, t: any): string {
  const arr = Array.isArray(days) ? days : (days || '').split(',').map(s => s.trim());
  return arr.map(d => {
    const k = DAY_MAP[d.trim().toLowerCase()];
    return k ? t(`numerology.meta.days.${k}`, { defaultValue: d }) : d;
  }).join(', ');
}

export function getLocalizedColors(colors: string[] | string, t: any): string {
  const arr = Array.isArray(colors) ? colors : (colors || '').split(',').map(s => s.trim());
  return arr.map(c => {
    const k = COLOR_MAP[c.trim().toLowerCase()];
    return k ? t(`numerology.meta.colors.${k}`, { defaultValue: c }) : c;
  }).join(', ');
}

export function getPlaneKey(planeName: string): string {
  const p = (planeName || '').toLowerCase();
  if (p.includes('thought')) return 'thought';
  if (p.includes('will')) return 'will';
  if (p.includes('action')) return 'action';
  if (p.includes('mental')) return 'mental';
  if (p.includes('emotional')) return 'emotional';
  if (p.includes('practical')) return 'practical';
  if (p.includes('raj yoga') || p.includes('golden')) return 'raj_yoga';
  if (p.includes('spirituality') || p.includes('silver')) return 'spirituality';
  return 'thought';
}

export function getLocalizedPlaneName(plane: { name: string; numbers?: number[] }, lang: string, t: any): string {
  const key = getPlaneKey(plane.name);
  const nums = plane.numbers || [4, 9, 2];
  return t(`numerology.meta.planes.${key}.name`, {
    n1: formatDigitsBase(nums[0], lang),
    n2: formatDigitsBase(nums[1], lang),
    n3: formatDigitsBase(nums[2], lang),
    defaultValue: plane.name,
  });
}

export function getLocalizedPlaneMeaning(planeName: string, defaultMeaning: string, t: any): string {
  const key = getPlaneKey(planeName);
  return t(`numerology.meta.planes.${key}.meaning`, { defaultValue: defaultMeaning });
}

export function getLocalizedPlaneStatus(status: string, strength: number, lang: string, t: any): string {
  const sLower = (status || '').toLowerCase();
  let statusText = status;
  if (sLower === 'strong') statusText = t('numerology.loshu.status.strong', { defaultValue: 'Strong' });
  else if (sLower === 'moderate') statusText = t('numerology.loshu.status.moderate', { defaultValue: 'Moderate' });
  else if (sLower === 'weak') statusText = t('numerology.loshu.status.weak', { defaultValue: 'Weak' });
  else if (sLower === 'empty') statusText = t('numerology.loshu.status.empty', { defaultValue: 'Empty' });

  const pctStr = formatDigitsBase(Math.round(strength), lang);
  return t('numerology.loshu.status_with_pct', { status: statusText, pct: pctStr, defaultValue: `${statusText} (${pctStr}%)` });
}

export function getLocalizedRemedy(remStr: string, idx: number, lang: string, t: any): string {
  // Check if string mentions a number like "(Number 1)"
  const match = remStr.match(/\(Number\s*(\d)\)/i) || remStr.match(/number\s*(\d)/i);
  const num = match ? parseInt(match[1], 10) : (idx + 1);
  if (num >= 1 && num <= 9) {
    return t(`numerology.meta.remedies.${num}`, {
      n: formatDigitsBase(num, lang),
      defaultValue: remStr
    });
  }
  return remStr;
}

export function getLocalizedChaldeanCompatibility(num: number, lang: string, t: any): string {
  const isFavorable = [1, 3, 5, 6].includes(num);
  const nStr = formatDigitsBase(num, lang);
  if (isFavorable) {
    return t('numerology.chaldean.favorable_desc', { n: nStr });
  } else {
    return t('numerology.chaldean.adjust_desc', { n: nStr });
  }
}

export function getLocalizedChaldeanSuggestion(sug: string, num: number, lang: string, t: any): string {
  const sLower = (sug || '').toLowerCase();
  const nStr = formatDigitsBase(num, lang);

  if (sLower.includes('resonates on auspicious chaldean vibration') || sLower.includes('commercial prosperity')) {
    return t('numerology.chaldean.sug_favorable', { n: nStr, defaultValue: sug });
  }
  if (sLower.includes('adjust spelling slightly') || sLower.includes('adding or modifying an')) {
    return t('numerology.chaldean.sug_adjust_1', { defaultValue: sug });
  }
  if (sLower.includes('which may attract periodic delays') || sLower.includes('current name vibrates')) {
    return t('numerology.chaldean.sug_adjust_2', { n: nStr, defaultValue: sug });
  }

  return sug;
}

