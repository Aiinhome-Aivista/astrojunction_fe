import { formatLocalizedDigits } from './birthChartTranslations';

export { formatLocalizedDigits };

// Helper to translate Koota names
// In hi/bn/ta: native name first, followed by Latin name in parenthesis e.g. "वर्ण कूट (Varna Koota)"
// In en/fr: keeps today's look e.g. "Varna Koota"
export function getLocalizedKootaName(
  kootaId: string,
  rawName: string,
  lang: string,
  t: any
): string {
  const normId = kootaId ? kootaId.toLowerCase() : '';
  let id = normId;
  if (normId.includes('varna')) id = 'varna';
  else if (normId.includes('vashya')) id = 'vashya';
  else if (normId.includes('tara')) id = 'tara';
  else if (normId.includes('yoni')) id = 'yoni';
  else if (normId.includes('graha') || normId.includes('maitri')) id = 'graha';
  else if (normId.includes('gana')) id = 'gana';
  else if (normId.includes('bhakoot')) id = 'bhakoot';
  else if (normId.includes('nadi')) id = 'nadi';

  const nativeName = t(`kundliMilan.kootas.${id}.name`, { defaultValue: rawName });
  const latinName = t(`kundliMilan.kootas.${id}.latin`, { defaultValue: rawName });

  if (lang === 'hi' || lang === 'bn' || lang === 'ta') {
    if (nativeName !== latinName) {
      return `${nativeName} (${latinName})`;
    }
    return nativeName;
  }
  return latinName || rawName;
}

export function getLocalizedKootaArea(
  kootaId: string,
  rawArea: string,
  t: any
): string {
  const normId = kootaId ? kootaId.toLowerCase() : '';
  let id = normId;
  if (normId.includes('varna')) id = 'varna';
  else if (normId.includes('vashya')) id = 'vashya';
  else if (normId.includes('tara')) id = 'tara';
  else if (normId.includes('yoni')) id = 'yoni';
  else if (normId.includes('graha') || normId.includes('maitri')) id = 'graha';
  else if (normId.includes('gana')) id = 'gana';
  else if (normId.includes('bhakoot')) id = 'bhakoot';
  else if (normId.includes('nadi')) id = 'nadi';

  return t(`kundliMilan.kootas.${id}.area`, { defaultValue: rawArea });
}

export function getLocalizedKootaDescription(
  kootaId: string,
  rawDesc: string,
  t: any
): string {
  const normId = kootaId ? kootaId.toLowerCase() : '';
  let id = normId;
  if (normId.includes('varna')) id = 'varna';
  else if (normId.includes('vashya')) id = 'vashya';
  else if (normId.includes('tara')) id = 'tara';
  else if (normId.includes('yoni')) id = 'yoni';
  else if (normId.includes('graha') || normId.includes('maitri')) id = 'graha';
  else if (normId.includes('gana')) id = 'gana';
  else if (normId.includes('bhakoot')) id = 'bhakoot';
  else if (normId.includes('nadi')) id = 'nadi';

  return t(`kundliMilan.kootas.${id}.desc`, { defaultValue: rawDesc });
}

// Maps raw koota values (e.g., "Brahmin", "Chatushpada (Quadruped)", "Tara 4/9", "Ashwa", "Deva Gana", "Adi Nadi", "Capricorn (Saturn)")
export function getLocalizedKootaValue(
  kootaId: string,
  rawValue: string,
  lang: string,
  t: any
): string {
  if (!rawValue) return '';
  const str = String(rawValue).trim();
  const lower = str.toLowerCase();

  // Tara formatting e.g. "Tara 4/9" or "Tara 4 / 9"
  if (kootaId === 'tara' || lower.includes('tara')) {
    const taraMatch = str.match(/tara\s*(\d+)\s*\/\s*(\d+)/i);
    if (taraMatch) {
      const from = formatLocalizedDigits(taraMatch[1], lang);
      const to = formatLocalizedDigits(taraMatch[2], lang);
      return t('kundliMilan.classes.tara_val', { from, to, defaultValue: `Tara ${from}/${to}` });
    }
  }

  // Varna
  if (lower.startsWith('brahmin')) return t('kundliMilan.classes.brahmin', { defaultValue: 'Brahmin' });
  if (lower.startsWith('kshatriya')) return t('kundliMilan.classes.kshatriya', { defaultValue: 'Kshatriya' });
  if (lower.startsWith('vaishya')) return t('kundliMilan.classes.vaishya', { defaultValue: 'Vaishya' });
  if (lower.startsWith('shudra')) return t('kundliMilan.classes.shudra', { defaultValue: 'Shudra' });

  // Vashya
  if (lower.includes('chatushpada')) return t('kundliMilan.classes.chatushpada', { defaultValue: 'Chatushpada' });
  if (lower.includes('manava') || lower.includes('dwipada') || lower.includes('human')) return t('kundliMilan.classes.manava', { defaultValue: 'Manava' });
  if (lower.includes('jalachara') || lower.includes('water')) return t('kundliMilan.classes.jalachara', { defaultValue: 'Jalachara' });
  if (lower.includes('vanachara') || lower.includes('wild')) return t('kundliMilan.classes.vanachara', { defaultValue: 'Vanachara' });
  if (lower.includes('keeta') || lower.includes('insect')) return t('kundliMilan.classes.keeta', { defaultValue: 'Keeta' });

  // Gana
  if (lower.includes('deva')) return t('kundliMilan.classes.deva', { defaultValue: 'Deva Gana' });
  if (lower.includes('manush')) return t('kundliMilan.classes.manushya', { defaultValue: 'Manushya Gana' });
  if (lower.includes('rakshas')) return t('kundliMilan.classes.rakshasa', { defaultValue: 'Rakshasa Gana' });

  // Nadi
  if (lower.includes('adi')) return t('kundliMilan.classes.adi', { defaultValue: 'Adi Nadi' });
  if (lower.includes('madhya')) return t('kundliMilan.classes.madhya', { defaultValue: 'Madhya Nadi' });
  if (lower.includes('antya')) return t('kundliMilan.classes.antya', { defaultValue: 'Antya Nadi' });

  // Yoni
  const yoniMap: Record<string, string> = {
    ashwa: 'ashwa', horse: 'ashwa',
    gaja: 'gaja', elephant: 'gaja',
    mesha: 'mesha', ram: 'mesha', sheep: 'mesha',
    sarpa: 'sarpa', serpent: 'sarpa', snake: 'sarpa',
    shwan: 'shwan', dog: 'shwan',
    marjara: 'marjara', cat: 'marjara',
    mushaka: 'mushaka', rat: 'mushaka',
    gau: 'gau', cow: 'gau',
    mahisha: 'mahisha', buffalo: 'mahisha',
    vyaghra: 'vyaghra', tiger: 'vyaghra',
    mriga: 'mriga', deer: 'mriga',
    vanara: 'vanara', monkey: 'vanara',
    nakula: 'nakula', mongoose: 'nakula',
    simha: 'simha', lion: 'simha',
  };
  for (const [key, id] of Object.entries(yoniMap)) {
    if (lower.includes(key)) {
      return t(`kundliMilan.classes.${id}`, { defaultValue: rawValue });
    }
  }

  // Rashi with Lord or House Number e.g. "Capricorn (Saturn)" or "Capricorn (10)"
  const rashiMatch = str.match(/^([A-Za-z]+)(?:\s*\(([^)]+)\))?$/);
  if (rashiMatch) {
    const rName = rashiMatch[1].toLowerCase();
    const localizedRashi = t(`vedic.signs.${rName}`, { defaultValue: rashiMatch[1] });
    if (rashiMatch[2]) {
      const parenContent = rashiMatch[2].trim();
      if (/^\d+$/.test(parenContent)) {
        const localizedNum = formatLocalizedDigits(parenContent, lang);
        return `${localizedRashi} (${localizedNum})`;
      } else {
        const localizedLord = t(`vedic.planets.${parenContent.toLowerCase()}`, { defaultValue: parenContent });
        return `${localizedRashi} (${localizedLord})`;
      }
    }
    return localizedRashi;
  }

  return str;
}

export function getLocalizedVerdict(
  rawVerdict: string,
  t: any,
  lang?: string
): string {
  if (!rawVerdict) return '';
  const lower = rawVerdict.toLowerCase();
  const currentL = (lang || (t?.i18n ? t.i18n.language : 'en') || 'en').toLowerCase().slice(0, 2);

  // Nadi Dosha Verdict Details Sentences
  if (lower.includes('active nadi dosha detected')) {
    if (currentL === 'hi') return 'सक्रिय नाड़ी दोष उपस्थित है (दोनों साथियों की समान मध्य नाड़ी)। महामृत्युंजय जप एवं वैदिक दान द्वारा शांति अनुशंसित है।';
    if (currentL === 'bn') return 'সক্রিয় নাড়ী দোষ বিদ্যমান (উভয় সঙ্গীরই অভিন্ন মধ্য নাড়ী)। মহামৃত্যুঞ্জয় জপ ও দান দ্বারা প্রতিকার নির্দেশিত।';
    if (currentL === 'ta') return 'இருவருக்கும் ஒரே நாடி (மத்திய நாடி) இருப்பதால் தீவிர நாடி தோஷம் உள்ளது. மகா மிருத்யுஞ்ஜய ஜபம் மற்றும் பரிகாரம் பரிந்துரைக்கப்படுகிறது.';
    if (currentL === 'fr') return 'Dosha Nadi actif détecté (Madhya Nadi pour les deux partenaires). Le Japa Maha Mrityunjaya et des dons caritatifs sont recommandés.';
    return rawVerdict;
  }
  if (lower.includes('different nadis') && lower.includes('bio-magnetic balance')) {
    if (currentL === 'hi') return 'विभिन्न नाड़ियां उत्तम प्राणिक संतुलन (वात/पित्त/कफ सामंजस्य) एवं सुदृढ़ आनुवंशिक जीवन शक्ति प्रदान करती हैं।';
    if (currentL === 'bn') return 'ভিন্ন নাড়ী শুভ বায়ো-ম্যাগনেটিক ভারসাম্য (বাত/পিত্ত/কফ সামঞ্জস্য) ও বংশাণুগত কল্যাণ নিশ্চিত করে।';
    if (currentL === 'ta') return 'வேறுபட்ட நாடிகள் உகந்த உயிரியல் சமநிலை (வாதம்/பித்தம்/கபம்) மற்றும் வலுவான மரபணு ஆரோக்கியத்தை அளிக்கின்றன.';
    if (currentL === 'fr') return 'Les Nadis différentes assurent un équilibre bio-magnétique optimal (Vata/Pitta/Kapha) et une forte vitalité héréditaire.';
    return rawVerdict;
  }
  if (lower.includes('nadi dosha cancelled')) {
    if (currentL === 'hi') return 'नाड़ी दोष शास्त्रीय परिहार नियमों द्वारा पूर्णतः निरस्त एवं निष्प्रभावी है। पूरे ८ अंक प्रदान किए गए।';
    if (currentL === 'bn') return 'শাস্ত্রীয় পরিহার নিয়মানুসারে নাড়ী দোষ সম্পূর্ণরূপে প্রশমিত। পূর্ণ ৮ পয়েন্ট প্রদান করা হয়েছে।';
    if (currentL === 'ta') return 'சாஸ்திர பரிகார விதிகளின்படி நாடி தோஷம் ரத்து செய்யப்பட்டுள்ளது. முழு 8 புள்ளிகள் வழங்கப்பட்டன.';
    if (currentL === 'fr') return 'Dosha Nadi annulé par les règles classiques de Parihara. 8 points complets accordés.';
    return rawVerdict;
  }

  // Bhakoot Dosha Verdict Details Sentences
  if (lower.includes('auspicious rashi angular disposition')) {
    if (currentL === 'hi') return 'शुभ राशि कोणीय स्थिति; दांपत्य में सुख, पारिवारिक सामंजस्य एवं आर्थिक संवृद्धि प्रदान करती है।';
    if (currentL === 'bn') return 'শুভ রাশি অবস্থান; দাম্পত্যে আনন্দ, পারিবারিক সম্প্রীতি ও আর্থিক সমৃদ্ধি বৃদ্ধি করে।';
    if (currentL === 'ta') return 'மங்கலகரமான ராசி அமைப்பு; மகிழ்ச்சி, குடும்ப நல்லிணக்கம் மற்றும் நிதி வளர்ச்சியைத் தருகிறது.';
    if (currentL === 'fr') return 'Disposition angulaire favorable des Rashis accordant joie, harmonie familiale et croissance financière.';
    return rawVerdict;
  }
  if (lower.includes('bhakoot dosha cancelled')) {
    if (currentL === 'hi') return 'समान/मित्र ग्रह स्वामियों के कारण भकूट दोष निरस्त है; पारिवारिक समृद्धि सुनिश्चित होती है।';
    if (currentL === 'bn') return 'মিত্র গ্রহাধিপতির কারণে ভকূট দোষ প্রশমিত; পারিবারিক কল্যাণ ও সমৃদ্ধি নিশ্চিত।';
    if (currentL === 'ta') return 'நட்பு கிரக அதிபதிகளால் பகூட் தோஷம் ரத்து செய்யப்பட்டுள்ளது; குடும்ப செழிப்பு உண்டாகும்.';
    if (currentL === 'fr') return 'Dosha Bhakoot annulé grâce à la maîtrise planétaire favorable ; harmonie familiale.';
    return rawVerdict;
  }
  if (lower.includes('bhakoot dosha') && lower.includes('challenging')) {
    if (currentL === 'hi') return 'प्रतिकूल राशि संबंध (भकूट दोष); संयुक्त दान एवं शिव-पार्वती की उपासना अनुशंसित है।';
    if (currentL === 'bn') return 'প্রতিকূল রাশি অবস্থান (ভকূট দোষ); যৌথ দান ও শিব-পার্বতীর পূজা নির্দেশিত।';
    if (currentL === 'ta') return 'சவாலான ராசி அமைப்பு (பகூட் தோஷம்); கூட்டு வழிபாடு மற்றும் தானம் பரிந்துரைக்கப்படுகிறது.';
    if (currentL === 'fr') return 'Disposition difficile des Rashis (Dosha Bhakoot) ; dons et prières recommandés.';
    return rawVerdict;
  }

  if (lower.includes('uttam') && lower.includes('caution')) return t('kundliMilan.verdicts.uttam_caution', { defaultValue: rawVerdict });
  if (lower.includes('uttam')) return t('kundliMilan.verdicts.uttam', { defaultValue: rawVerdict });
  if (lower.includes('madhyam')) return t('kundliMilan.verdicts.madhyam', { defaultValue: rawVerdict });
  if (lower.includes('samanya')) return t('kundliMilan.verdicts.samanya', { defaultValue: rawVerdict });
  if (lower.includes('alpa')) return t('kundliMilan.verdicts.alpa', { defaultValue: rawVerdict });
  if (lower === 'excellent') return t('kundliMilan.verdicts.excellent', { defaultValue: 'Excellent' });
  if (lower === 'good') return t('kundliMilan.verdicts.good', { defaultValue: 'Good' });
  if (lower === 'average' || lower.includes('average / acceptable') || lower.includes('moderate')) return t('kundliMilan.verdicts.average', { defaultValue: 'Average' });
  if (lower === 'challenging') return t('kundliMilan.verdicts.challenging', { defaultValue: 'Challenging' });
  if (lower === 'critical') return t('kundliMilan.verdicts.critical', { defaultValue: 'Critical' });
  if (lower.includes('neither partner manglik') || lower.includes('clean planetary axis')) return t('kundliMilan.status.neither_manglik', { defaultValue: rawVerdict });
  if (lower.includes('both partners manglik')) return t('kundliMilan.status.both_manglik', { defaultValue: rawVerdict });
  if (lower.includes('neutralized')) return t('kundliMilan.status.neutralized', { defaultValue: 'Neutralized ✓' });
  return rawVerdict;
}

export function getLocalizedStatus(
  rawStatus: string,
  t: any
): string {
  if (!rawStatus) return '';
  const lower = rawStatus.toLowerCase();
  if (lower.includes('neutralized')) return t('kundliMilan.status.neutralized', { defaultValue: 'Neutralized ✓' });
  if (lower.includes('no dosha') || lower === 'clean' || lower === 'none' || lower.includes('dosh mukt') || lower.includes('दोष मुक्त')) return t('kundliMilan.status.no_dosha', { defaultValue: 'No Dosha' });
  if (lower.includes('non-manglik')) return t('kundliMilan.status.non_manglik', { defaultValue: 'Non-Manglik' });
  if (lower.includes('active manglik')) return t('kundliMilan.status.active_manglik', { defaultValue: 'Active Manglik Dosha' });
  if (lower.includes('active nadi')) return t('kundliMilan.status.active_nadi', { defaultValue: 'Active Nadi Dosha ⚠️' });
  if (lower.includes('active bhakoot')) return t('kundliMilan.status.active_bhakoot', { defaultValue: 'Active Bhakoot Dosha' });
  if (lower.includes('neither partner manglik') || lower.includes('clean planetary axis')) return t('kundliMilan.status.neither_manglik', { defaultValue: rawStatus });
  if (lower.includes('both partners manglik')) return t('kundliMilan.status.both_manglik', { defaultValue: rawStatus });
  if (lower.includes('one partner manglik')) return t('kundliMilan.status.one_manglik', { defaultValue: rawStatus });
  if (lower.includes('active') || lower.includes('remedy needed')) return t('kundliMilan.status.active', { defaultValue: 'Active' });
  if (lower.includes('cancelled') || lower.includes('parihara')) return t('kundliMilan.status.cancelled', { defaultValue: 'Cancelled' });
  return rawStatus;
}

export function getLocalizedSeverity(
  severity: string,
  t: any
): string {
  if (!severity) return '';
  const lower = severity.toLowerCase();
  if (lower === 'none') return t('kundliMilan.doshas.severity.none', { defaultValue: 'None' });
  if (lower === 'mild') return t('kundliMilan.doshas.severity.mild', { defaultValue: 'Mild' });
  if (lower === 'moderate') return t('kundliMilan.doshas.severity.moderate', { defaultValue: 'Moderate' });
  if (lower.includes('high') || lower.includes('purna')) return t('kundliMilan.doshas.severity.high', { defaultValue: 'High (Purna Manglik)' });
  return severity;
}

export function getLocalizedRashi(
  rashiStr: string,
  lang: string,
  t: any
): string {
  if (!rashiStr) return '';
  const clean = rashiStr.replace(/\s*Rashi/i, '').trim().toLowerCase();
  const res = t(`vedic.signs.${clean}`, { defaultValue: '' });
  if (res) return res;
  return rashiStr;
}

export function getLocalizedNakshatra(
  nakStr: string,
  lang: string,
  t: any
): string {
  if (!nakStr) return '';
  const clean = nakStr.replace(/\s*Nakshatra/i, '').trim().toLowerCase();
  const res = t(`vedic.nakshatras.${clean}`, { defaultValue: '' });
  if (res) return res;
  return nakStr;
}

export function getLocalizedPlanet(
  planetStr: string,
  t: any
): string {
  if (!planetStr) return '';
  const clean = planetStr.trim().toLowerCase();
  return t(`vedic.planets.${clean}`, { defaultValue: planetStr });
}

export function getLocalizedGemPurpose(
  purposeStr: string,
  t: any
): string {
  if (!purposeStr) return '';
  const lower = purposeStr.toLowerCase();
  if (lower.includes('lagna lord') || lower.includes('life force')) {
    return t('kundliMilan.remedies.gem_purpose_lagna', { defaultValue: 'Life Force & Health (Lagna Lord)' });
  }
  if (lower.includes('5th lord') || lower.includes('intelligence')) {
    return t('kundliMilan.remedies.gem_purpose_5th', { defaultValue: 'Intelligence & Luck (5th Lord)' });
  }
  if (lower.includes('9th lord') || lower.includes('fortune')) {
    return t('kundliMilan.remedies.gem_purpose_9th', { defaultValue: 'Fortune & Dharma (9th Lord)' });
  }
  return purposeStr;
}

export function getLocalizedElement(elem: string, lang: string): string {
  if (!elem) return '';
  const lower = elem.toLowerCase().trim();
  if (lower === 'earth') {
    if (lang === 'hi') return 'पृथ्वी';
    if (lang === 'bn') return 'মাটি';
    if (lang === 'ta') return 'நிலம்';
    if (lang === 'fr') return 'Terre';
    return 'Earth';
  }
  if (lower === 'water') {
    if (lang === 'hi') return 'जल';
    if (lang === 'bn') return 'জল';
    if (lang === 'ta') return 'நீர்';
    if (lang === 'fr') return 'Eau';
    return 'Water';
  }
  if (lower === 'fire') {
    if (lang === 'hi') return 'अग्नि';
    if (lang === 'bn') return 'অগ্নি';
    if (lang === 'ta') return 'நெருப்பு';
    if (lang === 'fr') return 'Feu';
    return 'Fire';
  }
  if (lower === 'air') {
    if (lang === 'hi') return 'वायु';
    if (lang === 'bn') return 'বায়ু';
    if (lang === 'ta') return 'காற்று';
    if (lang === 'fr') return 'Air';
    return 'Air';
  }
  return elem;
}

export function getLocalizedElementalSynergy(synergyStr: string, lang: string): string {
  if (!synergyStr) return '';
  if (lang === 'en') return synergyStr;
  const lower = synergyStr.toLowerCase();
  if (lower.includes('earth & water') || lower.includes('water & earth')) {
    if (lang === 'hi') return 'पृथ्वी एवं जल (स्थिर, उर्वर एवं भावनात्मक रूप से समृद्ध)';
    if (lang === 'bn') return 'মাটি ও জল (সুদৃঢ়, উর্বর ও মানসিকভাবে সমৃদ্ধ)';
    if (lang === 'ta') return 'நிலம் & நீர் (நிலைத்தன்மை, செழுமை மற்றும் உணர்ச்சி இணக்கம்)';
    if (lang === 'fr') return 'Terre & Eau (Ancré, Fertile & Émotionnellement Riche)';
  }
  if (lower.includes('fire & air') || lower.includes('air & fire')) {
    if (lang === 'hi') return 'अग्नि एवं वायु (प्रेरणादायक, रचनात्मक एवं विस्तृत)';
    if (lang === 'bn') return 'অগ্নি ও বায়ু (অনুপ্রেরণামূলক, সৃজনশীল ও প্রগতিশীল)';
    if (lang === 'ta') return 'நெருப்பு & காற்று (ஊக்கமளிக்கும், ஆக்கப்பூர்வமான)';
    if (lang === 'fr') return 'Feu & Air (Inspirant, Créatif & Expansif)';
  }
  if (lower.includes('twin')) {
    if (lang === 'hi') return 'समान तत्व संबंध (गहन स्वाभाविक बंध)';
    if (lang === 'bn') return 'অভিন্ন উপাদান সম্পর্ক (গভীর মানসিক বন্ধন)';
    if (lang === 'ta') return 'ஒரே மூலக்கூறு இணைப்பு (ஆழ்ந்த இயற்கை பந்தம்)';
    if (lang === 'fr') return 'Connexion d\'éléments identiques (Affinité instinctive profonde)';
  }
  if (lang === 'hi') return 'तत्व संतुलन (विविधता के माध्यम से संतुलित विकास)';
  if (lang === 'bn') return 'উপাদান ভারসাম্য (বৈচিত্র্যের মাধ্যমে সমন্বিত বিকাশ)';
  if (lang === 'ta') return 'கூறுகள் சமநிலை (பல்வகைமை மூலம் வளர்ச்சி)';
  if (lang === 'fr') return 'Équilibre des Éléments (Croissance Dynamique)';
  return synergyStr;
}

export function getLocalizedNumerologyDescription(
  descStr: string,
  m1: number,
  m2: number,
  lang: string
): string {
  if (!descStr) return '';
  if (lang === 'en') return descStr;
  const num1 = formatLocalizedDigits(m1, lang);
  const num2 = formatLocalizedDigits(m2, lang);
  if (lang === 'hi') return `मूलांक ${num1} एवं मूलांक ${num2} परस्पर सहयोगात्मक सफलता हेतु सहज सामंजस्यपूर्ण संख्यात्मक ऊर्जा साझा करते हैं।`;
  if (lang === 'bn') return `মূলাঙ্ক ${num1} ও মূলাঙ্ক ${num2} পারস্পরিক সফলতার জন্য অত্যন্ত সামঞ্জস্যপূর্ণ সংখ্যাতাত্ত্বিক শক্তি প্রকাশ করে।`;
  if (lang === 'ta') return `எண் கணித எண் ${num1} மற்றும் ${num2} பரஸ்பர வெற்றிக்கான ஆழமான எண் அதிர்வெண்ணைப் பகிர்ந்து கொள்கின்றன.`;
  if (lang === 'fr') return `Le chiffre de naissance ${num1} et le chiffre ${num2} partagent une résonance numérique intuitive pour un succès mutuel.`;
  return descStr;
}

// Nadi string e.g. "Madhya (Dhanishta)"
export function getLocalizedNadi(
  nadiStr: string,
  lang: string,
  t: any
): string {
  if (!nadiStr) return '';
  const match = nadiStr.match(/^([A-Za-z]+)(?:\s*\((.*?)\))?$/);
  if (match) {
    const rawNadi = match[1].toLowerCase();
    const rawNak = match[2] ? match[2].trim() : '';
    let locNadi = rawNadi;
    if (rawNadi.includes('adi')) locNadi = t('kundliMilan.classes.adi', { defaultValue: 'Adi Nadi' });
    else if (rawNadi.includes('madhya')) locNadi = t('kundliMilan.classes.madhya', { defaultValue: 'Madhya Nadi' });
    else if (rawNadi.includes('antya')) locNadi = t('kundliMilan.classes.antya', { defaultValue: 'Antya Nadi' });
    
    if (rawNak) {
      const locNak = getLocalizedNakshatra(rawNak, lang, t);
      return `${locNadi} (${locNak})`;
    }
    return locNadi;
  }
  return nadiStr;
}

export function getLocalizedNadiReason(
  reasonStr: string,
  p1Name: string,
  p2Name: string,
  lang: string,
  t: any
): string {
  if (!reasonStr) return '';
  if (lang === 'en') return reasonStr;
  const lower = reasonStr.toLowerCase();
  if (lower.includes('different nadis')) {
    if (lang === 'hi') return 'विभिन्न नाड़ियां उत्तम प्राणिक ऊर्जा एवं आनुवंशिक सामंजस्य प्रदान करती हैं';
    if (lang === 'bn') return 'ভিন্ন নাড়ী শুভ শারীরিক স্বাস্থ্য ও বংশাণুগত সামঞ্জস্য নির্দেশ করে';
    if (lang === 'ta') return 'வேறுபட்ட நாடிகள் உகந்த உயிரியல் மற்றும் மரபணு ஆரோக்கியத்தை அளிக்கின்றன';
    if (lang === 'fr') return 'Les Nadis différentes assurent un accord génétique et vital optimal';
  }
  if (lower.includes('both share') || lower.includes('active nadi dosha')) {
    if (lang === 'hi') return `दोनों की समान नाड़ी होने से नाड़ी दोष उपस्थित है। महामृत्युंजय जप एवं वैदिक दान द्वारा शांति अनुशंसित है`;
    if (lang === 'bn') return `উভয়েরই অভিন্ন নাড়ী হওয়ার কারণে নাড়ী দোষ বিদ্যমান। মহামৃত্যুঞ্জয় জপ ও দান দ্বারা প্রতিকার নির্দেশিত`;
    if (lang === 'ta') return `இருவருக்கும் ஒரே நாடி இருப்பதால் நாடி தோஷம் உள்ளது. மகா மிருத்யுஞ்சய ஜபம் மற்றும் பரிகாரம் பரிந்துரைக்கப்படுகிறது`;
    if (lang === 'fr') return `Partageant la même Nadi, un Dosha Nadi actif est présent. Le Japa Maha Mrityunjaya est recommandé`;
  }
  if (lower.includes('cancelled') || lower.includes('parihara')) {
    if (lang === 'hi') return 'नाड़ी दोष शास्त्रीय परिहार नियमों द्वारा पूर्णतः निरस्त एवं निष्प्रभावी है';
    if (lang === 'bn') return 'নাড়ী দোষ শাস্ত্রীয় পরিহার নিয়মানুসারে সম্পূর্ণরূপে প্রশমিত';
    if (lang === 'ta') return 'சாஸ்திர பரிகார விதிகளின்படி நாடி தோஷம் ரத்து செய்யப்பட்டுள்ளது';
    if (lang === 'fr') return 'Dosha Nadi annulé par les règles classiques de Parihara';
  }
  return reasonStr;
}

export function getLocalizedNadiRemedy(remedyStr: string, lang: string, t: any): string {
  if (!remedyStr) return '';
  if (lang === 'en') return remedyStr;
  const lower = remedyStr.toLowerCase();
  if (lower.includes('maha mrityunjaya')) {
    if (lang === 'hi') return 'प्रतिदिन १०८ बार महामृत्युंजय जप करें और शुभ नक्षत्र में अन्न, वस्त्र अथवा सुवर्ण का दान करें।';
    if (lang === 'bn') return 'প্রতিদিন ১০৮ বার মহামৃত্যুঞ্জয় জপ করুন এবং শুভ দিনে বস্ত্র বা খাদ্যশস্য দান করুন।';
    if (lang === 'ta') return 'தினமும் 108 முறை மகா மிருத்யுஞ்சய ஜபம் செய்து அன்னதானம் அல்லது ஆடை தானம் வழங்கவும்.';
    if (lang === 'fr') return 'Pratiquez le Japa Maha Mrityunjaya (108 répétitions) et faites don de vêtements ou de grains.';
  }
  if (lower.includes('no specific remedy')) {
    if (lang === 'hi') return 'किसी विशेष उपाय की आवश्यकता नहीं है, संबंध स्वाभाविक रूप से शुभ है।';
    if (lang === 'bn') return 'কোনো বিশেষ প্রতিকারের প্রয়োজন নেই, এই সম্পর্ক স্বাভাবিকভাবেই কল্যাণকর।';
    if (lang === 'ta') return 'குறிப்பிட்ட பரிகாரம் தேவையில்லை, இயற்கையான இணக்கம் உள்ளது.';
    if (lang === 'fr') return 'Aucun remède requis, l\'accord est naturellement harmonieux.';
  }
  return remedyStr;
}

export function getLocalizedBhakootReason(reasonStr: string, lang: string, t: any): string {
  if (!reasonStr) return '';
  if (lang === 'en') return reasonStr;
  const lower = reasonStr.toLowerCase();
  if (lower.includes('auspicious')) {
    if (lang === 'hi') return 'शुभ राशि संबंध, पारस्परिक भावनात्मक प्रगाढ़ता को बल देता है';
    if (lang === 'bn') return 'শুভ রাশি অবস্থান, মানসিক একাত্মতা ও প্রীতি বৃদ্ধি করে';
    if (lang === 'ta') return 'மங்களகரமான ராசி அமைப்பு, பரஸ்பர அன்பை வளர்க்கிறது';
    if (lang === 'fr') return 'Disposition favorable des Rashis renforçant l\'harmonie affective';
  }
  if (lower.includes('cancelled')) {
    if (lang === 'hi') return 'राशि स्वामियों की मित्रता अथवा साझा आधिपत्य से भकूट दोष निरस्त है';
    if (lang === 'bn') return 'রাশি অধিপতিদের মিত্রতার কারণে ভকূট দোষ প্রশমিত হয়েছে';
    if (lang === 'ta') return 'ராசி அதிபதிகளின் நட்புறவால் பகுட் தோஷம் ரத்து செய்யப்பட்டுள்ளது';
    if (lang === 'fr') return 'Dosha Bhakoot annulé par l\'amitié des maîtres de signes';
  }
  if (lower.includes('placement') || lower.includes('inauspicious')) {
    if (lang === 'hi') return 'कोणीय राशि अंतर हेतु धैर्य एवं संतुलित संवाद आवश्यक है';
    if (lang === 'bn') return 'কোণিক রাশি পার্থক্যের কারণে ধৈর্য ও সংযমী মনোভাব কাম্য';
    if (lang === 'ta') return 'ராசி இடைவெளிக்கு அமைதியான பேச்சுவார்த்தை தேவை';
    if (lang === 'fr') return 'Distance angulaire nécessitant tempérance et communication';
  }
  return reasonStr;
}

export function getLocalizedBhakootRemedy(remedyStr: string, lang: string, t: any): string {
  if (!remedyStr) return '';
  if (lang === 'en') return remedyStr;
  const lower = remedyStr.toLowerCase();
  if (lower.includes('vishnu sahasranama')) {
    if (lang === 'hi') return 'प्रत्येक गुरुवार को विष्णु सहस्रनाम का पाठ करें अथवा पीले पुष्प अर्पित करें।';
    if (lang === 'bn') return 'প্রতি বৃহস্পতিবার বিষ্ণু সহস্রনাম পাঠ করুন বা হলুদ ফুল নিবেদন করুন।';
    if (lang === 'ta') return 'வியாழக்கிழமைகளில் விஷ்ணு சஹஸ்ரநாமம் பாராயணம் செய்யவும்.';
    if (lang === 'fr') return 'Récitez le Vishnu Sahasranama chaque jeudi.';
  }
  if (lower.includes('no specific remedy')) {
    if (lang === 'hi') return 'किसी विशेष उपाय की आवश्यकता नहीं है।';
    if (lang === 'bn') return 'কোনো বিশেষ প্রতিকারের প্রয়োজন নেই।';
    if (lang === 'ta') return 'குறிப்பிட்ட பரிகாரம் தேவையில்லை.';
    if (lang === 'fr') return 'Aucun remède particulier n\'est requis.';
  }
  return remedyStr;
}

export function getLocalizedManglikExplanation(expl: string, lang: string, t: any): string {
  if (!expl) return '';
  if (lang === 'en') return expl;
  const lower = expl.toLowerCase();
  if (lower.includes('completely neutralized') || lower.includes('unblemished')) {
    if (lang === 'hi') return 'दोनों कुंडलियों में मांगलिक दोष का कोई अनिष्ट प्रभाव नहीं है, वैवाहिक जीवन में शांति एवं सुख रहेगा।';
    if (lang === 'bn') return 'উভয় কোষ্ঠীতে মাঙ্গলিক দোষের কোনো ক্ষতিকর প্রভাব নেই, দাম্পত্য জীবন সুখময় ও শান্তিময় হবে।';
    if (lang === 'ta') return 'இருவர் ஜாதகத்திலும் செவ்வாய் தோஷ பாதிப்பு இல்லை, திருமண வாழ்க்கை அமைதியாக அமையும்.';
    if (lang === 'fr') return 'L\'intensité de Kuja est entièrement neutralisée entre les deux thèmes, assurant paix et stabilité.';
  }
  if (lower.includes('both') && lower.includes('cancel')) {
    if (lang === 'hi') return 'दोनों जातक मांगलिक होने से शास्त्रीय परिहार के अनुसार दोष स्वतः शांत हो जाता है।';
    if (lang === 'bn') return 'উভয়েই মাঙ্গলিক হওয়ার কারণে শাস্ত্রীয় পরিহার অনুসারে দোষ নিষ্ক্রিয় হয়েছে।';
    if (lang === 'ta') return 'இருவரும் செவ்வாய் தோஷம் கொண்டுள்ளதால் சாஸ்திரப்படி தோஷம் ரத்தாகிறது.';
    if (lang === 'fr') return 'Les deux partenaires étant Manglik, le dosha s\'annule mutuellement selon les règles classiques.';
  }
  if (lang === 'hi') return 'मंगल शांति हेतु नियमित हनुमान चालीसा पाठ एवं मंगलवार को लाल वस्तुओं का दान शुभ फलदायी है।';
  if (lang === 'bn') return 'মঙ্গল শান্তির জন্য প্রতি মঙ্গলবার হনুমান চালিসা পাঠ ও দান শুভ ফলপ্রসূ।';
  if (lang === 'ta') return 'செவ்வாய் சாந்திக்காக செவ்வாய்க்கிழமைகளில் அனுமன் சாலிசா பாராயணம் செய்யவும்.';
  if (lang === 'fr') return 'Des upayas d\'apaisement de Mars sont conseillés pour une félicité durable.';
  return expl;
}

export function getLocalizedSynastryAspect(aspectName: string, t: any): string {
  if (!aspectName) return '';
  const lower = aspectName.toLowerCase();
  if (lower.includes('sun-moon') || lower.includes('core synergy')) {
    return t('kundliMilan.synastry.title_sun_moon', { defaultValue: 'Sun-Moon Core Synergy' });
  }
  if (lower.includes('venus-mars') || lower.includes('romantic magnetism')) {
    return t('kundliMilan.synastry.title_venus_mars', { defaultValue: 'Venus-Mars Romantic Magnetism' });
  }
  if (lower.includes('mercury-jupiter') || lower.includes('intellectual growth')) {
    return t('kundliMilan.synastry.title_mercury_jupiter', { defaultValue: 'Mercury-Jupiter Intellectual Growth' });
  }
  if (lower.includes('conjunction')) return t('kundliMilan.synastry.aspects.conjunction', { defaultValue: 'Conjunction' });
  if (lower.includes('trine')) return t('kundliMilan.synastry.aspects.trine', { defaultValue: 'Trine' });
  if (lower.includes('sextile')) return t('kundliMilan.synastry.aspects.sextile', { defaultValue: 'Sextile' });
  if (lower.includes('opposition')) return t('kundliMilan.synastry.aspects.opposition', { defaultValue: 'Opposition' });
  if (lower.includes('square')) return t('kundliMilan.synastry.aspects.square', { defaultValue: 'Square' });
  return aspectName;
}

export function getLocalizedSynastryAspectPlanets(
  planetsStr: string,
  lang: string,
  t: any
): string {
  if (!planetsStr) return '';
  if (lang === 'en') return planetsStr;

  let res = planetsStr;
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  for (const s of signs) {
    const loc = t(`vedic.signs.${s.toLowerCase()}`, { defaultValue: s });
    res = res.replace(new RegExp(`\\b${s}\\b`, 'g'), loc);
  }
  const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  for (const p of planets) {
    const loc = t(`vedic.planets.${p.toLowerCase()}`, { defaultValue: p });
    res = res.replace(new RegExp(`\\b${p}\\b`, 'g'), loc);
  }
  const aspects: Record<string, string> = {
    Square: lang === 'hi' ? 'केंद्र' : lang === 'bn' ? 'কেন্দ্র' : lang === 'ta' ? 'சதுரம்' : 'Carré',
    Trine: lang === 'hi' ? 'त्रिकोण' : lang === 'bn' ? 'ত্রিকোণ' : lang === 'ta' ? 'திரிகோணம்' : 'Trigone',
    Sextile: lang === 'hi' ? 'षष्ठांश' : lang === 'bn' ? 'ষষ্ঠাংশ' : lang === 'ta' ? 'அறுங்கோணம்' : 'Sextile',
    Opposition: lang === 'hi' ? 'सप्तम दृष्टि' : lang === 'bn' ? 'সপ্তম দৃষ্টি' : lang === 'ta' ? 'எதிர் நிலை' : 'Opposition',
    Conjunction: lang === 'hi' ? 'युति' : lang === 'bn' ? 'যুতি' : lang === 'ta' ? 'இணைவு' : 'Conjonction',
    Quincunx: lang === 'hi' ? 'षडाष्टक' : lang === 'bn' ? 'ষড়ষ্টক' : lang === 'ta' ? 'குயின்கங்க்ஸ்' : 'Quinconce',
  };
  for (const [asp, loc] of Object.entries(aspects)) {
    res = res.replace(new RegExp(`\\b${asp}\\b`, 'g'), loc);
  }
  return res;
}

export function getLocalizedSynastryVerdict(
  verdict: string,
  lang: string,
  t: any
): string {
  if (!verdict) return '';
  if (lang === 'en') return verdict;
  const lower = verdict.toLowerCase();

  // Synastry card 1 (Sun-Moon)
  if (lower.includes('expressive drive') || lower.includes('emotional rhythm')) {
    if (lang === 'hi') return 'सूर्य की रचनात्मक शक्ति एवं चंद्रमा की भावनात्मक तरंगे पारस्परिक संवाद को प्रगाढ़ कर आत्मिक सामंजस्य स्थापित करती हैं।';
    if (lang === 'bn') return 'সূর্যের আত্মিক প্রেরণা ও চন্দ্রের আবেগঘন ছন্দ পরস্পরের বন্ধনকে সুদৃঢ় ও ফলপ্রসূ করে তোলে।';
    if (lang === 'ta') return 'சூரியனின் வெளிப்படையான ஆற்றலும் சந்திரனின் உணர்ச்சி தாளமும் இணைந்து உறவில் சிறந்த வளர்ச்சியை உருவாக்குகின்றன.';
    if (lang === 'fr') return 'L\'élan solaire expressif et le rythme émotionnel lunaire créent une résonance affective profonde.';
  }
  // Synastry card 2 (Venus-Mars)
  if (lower.includes('affectionate nature') || lower.includes('romantic magnetism') || lower.includes('distinct love languages')) {
    if (lang === 'hi') return 'शुक्र का स्नेहमय स्वभाव और मंगल का ओजस्वी आकर्षण मिलकर दांपत्य जीवन में गहरा अनुराग और स्थायित्व प्रदान करते हैं।';
    if (lang === 'bn') return 'শুক্রের অনুরাগ ও মঙ্গলের দৈহিক প্রাণশক্তি একত্রিত হয়ে দাম্পত্য প্রেমে আন্তরিকতা ও স্থায়িত্ব আনে।';
    if (lang === 'ta') return 'சுக்கிரனின் பாசமான இயல்பும் செவ்வாயின் உற்சாகமும் இணைந்து நீடித்த ஈர்ப்பையும் தாம்பத்திய இனிமையையும் தருகின்றன.';
    if (lang === 'fr') return 'La tendresse vénusienne et la vitalité martienne équilibrent harmonieusement les langages de l\'amour.';
  }
  // Synastry card 3 (Mercury-Jupiter)
  if (lower.includes('intellectual') || lower.includes('clear communication') || lower.includes('shared life goals')) {
    if (lang === 'hi') return 'बुध का पारदर्शी संवाद और गुरु का विवेकपूर्ण मार्गदर्शन संयुक्त रूप से आर्थिक स्थिरता और साझा लक्ष्यों को सिद्ध करते हैं।';
    if (lang === 'bn') return 'বুধের স্পষ্ট যোগাযোগ ও বৃহস্পতির নৈতিক প্রজ্ঞা যৌথভাবে পারিবারিক সমৃদ্ধি ও একাত্মতা নিশ্চিত করে।';
    if (lang === 'ta') return 'புதனின் தெளிவான தொடர்பாடலும் குருவின் அறநெறியும் இணைந்து பொருளாதாரப் பாதுகாப்பையும் பொதுவான இலக்குகளையும் உறுதி செய்கின்றன.';
    if (lang === 'fr') return 'La communication claire de Mercure et la sagesse éthique de Jupiter posent un socle solide pour les projets communs.';
  }

  if (lower.includes('deep soul')) return t('kundliMilan.synastry.verdict_deep_soul', { defaultValue: verdict });
  if (lower.includes('flowing emotional')) return t('kundliMilan.synastry.verdict_flowing_harmony', { defaultValue: verdict });
  if (lower.includes('complementary polarity')) return t('kundliMilan.synastry.verdict_complementary', { defaultValue: verdict });
  if (lower.includes('passionate vitality')) return t('kundliMilan.synastry.verdict_passionate', { defaultValue: verdict });
  if (lower.includes('sensual devotion')) return t('kundliMilan.synastry.verdict_sensual', { defaultValue: verdict });
  if (lower.includes('romantic')) return t('kundliMilan.synastry.verdict_dynamic_romance', { defaultValue: verdict });
  if (lower.includes('visionary')) return t('kundliMilan.synastry.verdict_visionary', { defaultValue: verdict });
  if (lower.includes('practical')) return t('kundliMilan.synastry.verdict_practical', { defaultValue: verdict });
  return verdict;
}

// Localized Muhurat Advice helper (accepts raw string or parameters)
export function getLocalizedMuhuratAdvice(
  rawAdvice: string,
  p1Name: string,
  p2Name: string,
  lang: string,
  t: any
): string {
  if (!rawAdvice) return '';
  if (lang === 'en') return rawAdvice;

  // Extract from rawAdvice if present
  let p1 = p1Name || 'Partner 1';
  let p2 = p2Name || 'Partner 2';
  let nak1 = '';
  let rashi1 = '';
  let nak2 = '';
  let rashi2 = '';

  const m = rawAdvice.match(/Personalized Vivaha Muhurat for (.*?) \((.*?) Nakshatra, (.*?)\) & (.*?) \((.*?) Nakshatra, (.*?)\)/i);
  if (m) {
    p1 = m[1];
    nak1 = getLocalizedNakshatra(m[2], lang, t);
    rashi1 = getLocalizedRashi(m[3], lang, t);
    p2 = m[4];
    nak2 = getLocalizedNakshatra(m[5], lang, t);
    rashi2 = getLocalizedRashi(m[6], lang, t);
  }

  return t('kundliMilan.remedies.muhurat_advice', {
    p1,
    p2,
    nak1,
    rashi1,
    nak2,
    rashi2,
    defaultValue: rawAdvice,
  });
}

// Localized Remedy string helper
export function getLocalizedRemedy(
  remedyStr: string,
  p1Name: string,
  p2Name: string,
  lang: string,
  t: any
): string {
  if (!remedyStr) return '';
  if (lang === 'en') return remedyStr;
  const lower = remedyStr.toLowerCase();

  if (lower.includes('kuja shanti') || lower.includes('hanuman chalisa')) {
    const isP1 = lower.includes((p1Name || '').toLowerCase());
    const isP2 = lower.includes((p2Name || '').toLowerCase());
    const names = [isP1 ? p1Name : '', isP2 ? p2Name : ''].filter(Boolean).join(lang === 'hi' ? ' एवं ' : lang === 'bn' ? ' ও ' : lang === 'ta' ? ' மற்றும் ' : ' & ') || `${p1Name} & ${p2Name}`;
    if (lang === 'hi') return `कुज शांति उपाय: ${names} को मंगलवार को हनुमान चालीसा का पाठ करना चाहिए, तिल/सरसों के तेल का दीपक जलाना चाहिए और मसूर की दाल या तांबे का दान करना चाहिए।`;
    if (lang === 'bn') return `কুজ শান্তি প্রতিকার: ${names}-এর মঙ্গলবারে হনুমান চালিসা পাঠ করা, তিল বা সরিষার তেলের প্রদীপ প্রজ্বলন এবং মসুর ডাল বা তামা দান করা মঙ্গলজনক।`;
    if (lang === 'ta') return `செவ்வாய் சாந்தி பரிகாரம்: ${names} செவ்வாய்க்கிழமைகளில் அனுமன் சாலிசா பாராயணம் செய்ய வேண்டும், எள்/கடுகு எண்ணெய் தீபம் ஏற்றி, சிவப்பு பருப்பு அல்லது தாமிரம் தானம் செய்ய வேண்டும்.`;
    if (lang === 'fr') return `Upaya d'apaisement de Kuja : ${names} doit réciter l'Hanuman Chalisa les mardis, allumer une lampe à l'huile de sésame ou de moutarde et faire don de lentilles rouges ou de cuivre.`;
    return remedyStr;
  }

  if (lower.includes('nadi dosha') || lower.includes('maha mrityunjaya')) {
    if (lang === 'hi') return `नाड़ी दोष निवारण: चूंकि ${p1Name} एवं ${p2Name} दोनों की समान नाड़ी है, प्रतिदिन १०८ बार महामृत्युंजय जप करें और शुभ नक्षत्र में वस्त्र, अन्न या स्वर्ण/रजत का दान करें।`;
    if (lang === 'bn') return `নাড়ী দোষ নিবারণ: যেহেতু ${p1Name} ও ${p2Name} উভয়েরই সমান নাড়ী, প্রতিদিন ১০৮ বার মহামৃত্যুঞ্জয় জপ করুন এবং শুভ দিনে বস্ত্র, খাদ্যশস্য বা স্বর্ণ/রৌপ্য দান করুন।`;
    if (lang === 'ta') return `நாடி தோஷ நிவாரணம்: ${p1Name} மற்றும் ${p2Name} இருவரும் ஒரே நாடி கொண்டுள்ளதால், தினமும் 108 முறை மகா மிருத்யுஞ்சய ஜபம் செய்யவும், மங்களகரமான நாட்களில் ஆடை, தானியம் அல்லது பொன்/வெள்ளி தானம் செய்யவும்.`;
    if (lang === 'fr') return `Nivaran du Dosha Nadi : Les deux partenaires partageant la même Nadi, récitez le Japa Maha Mrityunjaya (108 fois par jour) et faites don de vêtements chauds, de grains ou d'un gage d'or/argent.`;
    return remedyStr;
  }

  if (lower.includes('bhakoot shanti') || lower.includes('vishnu sahasranama')) {
    if (lang === 'hi') return `भकूट शांति: राशि संबंध के संतुलन हेतु प्रत्येक गुरुवार को मिलकर विष्णु सहस्रनाम का पाठ करें और भगवान बृहस्पति को पीले पुष्प या चने की दाल अर्पित करें।`;
    if (lang === 'bn') return `ভকূট শান্তি: রাশি ভারসাম্য রক্ষার জন্য প্রতি বৃহস্পতিবার একত্রে বিষ্ণু সহস্রনাম পাঠ করুন এবং দেবগুরু বৃহস্পতিকে হলুদ ফুল বা ছোলার ডাল অর্পণ করুন।`;
    if (lang === 'ta') return `பகூட சாந்தி: ராசி அமைப்பை சமநிலைப்படுத்த, ஒவ்வொரு வியாழக்கிழமையும் இணைந்து விஷ்ணு சஹஸ்ரநாமம் பாராயணம் செய்து, குரு பகவானுக்கு மஞ்சள் மலர்கள் அல்லது கொண்டைக்கடலை சமர்ப்பிக்கவும்.`;
    if (lang === 'fr') return `Shanti Bhakoot : Pour équilibrer la disposition des Rashis, récitez ensemble le Vishnu Sahasranama chaque jeudi et offrez des fleurs jaunes ou des lentilles à Brihaspati.`;
    return remedyStr;
  }

  if (lower.includes('gana dosha')) {
    if (lang === 'hi') return `गण दोष शांति: ${p1Name} एवं ${p2Name} के स्वभाविक अंतर को संतुलित करने हेतु नित्य हनुमान चालीसा का पाठ करें और मंगलवार को मीठा प्रसाद अर्पित करें।`;
    if (lang === 'bn') return `গণ দোষ শান্তি: ${p1Name} ও ${p2Name}-এর স্বভাবজাত ভিন্নতা সমন্বয়ের জন্য প্রতিদিন হনুমান চালিসা পাঠ করুন এবং মঙ্গলবারে মিষ্টি নিবেদন করুন।`;
    if (lang === 'ta') return `கண தோஷ சாந்தி: ${p1Name} மற்றும் ${p2Name} சுபாவ வேறுபாட்டை சமநிலைப்படுத்த, தினமும் அனுமன் சாலிசா பாராயணம் செய்து செவ்வாய்க்கிழமைகளில் இனிப்பு பிரசாதம் படைக்கவும்.`;
    if (lang === 'fr') return `Shanti du Dosha Gana : Les tempéraments divergeant, chantez quotidiennement l'Hanuman Chalisa et partagez des offrandes de friandises le mardi.`;
    return remedyStr;
  }

  if (lower.includes('yoni dosha')) {
    if (lang === 'hi') return `योनि दोष शांति: सहज जैविक अनुकूलता के सामंजस्य हेतु शुक्ल पक्ष के सोमवार को भगवान शिव और माता पार्वती की संयुक्त आराधना करें तथा पशुओं को अन्न अथवा दुग्ध अर्पित करें।`;
    if (lang === 'bn') return `যোনি দোষ শান্তি: জৈবিক সামঞ্জস্য সুন্দর রাখতে শুক্লপক্ষের সোমবারে ভগবান শিব ও মাতা পার্বতীর যৌথ পূজা করুন এবং পশুপাখিকে অন্ন বা দুধ প্রদান করুন।`;
    if (lang === 'ta') return `யோனி தோஷ சாந்தி: உயிரியல் இணக்கத்தை மேம்படுத்த, சுக்ல பக்ஷ திங்கட்கிழமைகளில் சிவ-பார்வதியை வழிபட்டு, விலங்குகளுக்கு தானியம் அல்லது பால் வழங்கவும்.`;
    if (lang === 'fr') return `Shanti du Dosha Yoni : Pour harmoniser la résonance instinctive, vénérez conjointement Shiva et Parvati les lundis de Shukla Paksha et nourrissez les animaux.`;
    return remedyStr;
  }

  if (lower.includes('graha maitri') || lower.includes('radha-krishna')) {
    if (lang === 'hi') return `ग्रह मैत्री सामंजस्य: राशि स्वामियों की अनुकूलता हेतु शुक्ल पक्ष के सोमवार को शिव-पार्वती अथवा राधा-कृष्ण मंदिर में संयुक्त अर्चना करें।`;
    if (lang === 'bn') return `গ্রহ মৈত্রী সমন্বয়: রাশি অধিপতিদের শুভ প্রভাবে শুক্লপক্ষের সোমবারে শিব-পার্বতী বা রাধা-কৃষ্ণ মন্দিরে অর্চনা করা ফলপ্রসূ।`;
    if (lang === 'ta') return `கிரக மைத்ரி நல்லிணக்கம்: ராசி அதிபதிகள் நல்லிணக்கத்திற்கு, சுக்ல பக்ஷ திங்கட்கிழமைகளில் சிவ-பார்வதி அல்லது ராதா-கிருஷ்ணர் கோவிலில் அர்ச்சனை செய்யவும்.`;
    if (lang === 'fr') return `Harmonie de Graha Maitri : Bénéficiez d'une prière conjointe dans un temple de Shiva-Parvati les lundis de Shukla Paksha.`;
    return remedyStr;
  }

  if (lower.includes('shukra') || lower.includes('preeti mantra') || lower.includes('om shum shukraya')) {
    if (lang === 'hi') return `शुक्र एवं प्रीति मंत्र: ${p1Name} एवं ${p2Name} को प्रेम और दांपत्य माधुर्य हेतु प्रत्येक शुक्रवार को "Om Shum Shukraya Namaha" मंत्र का २१ बार जप करना चाहिए।`;
    if (lang === 'bn') return `শুক্র ও প্রীতি মন্ত্র: ${p1Name} ও ${p2Name}-এর প্রেম ও দাম্পত্য মধুরতা বৃদ্ধির জন্য প্রতি শুক্রবার "Om Shum Shukraya Namaha" মন্ত্রটি ২১ বার জপ করা উচিত।`;
    if (lang === 'ta') return `சுக்கிர & ப்ரீதி மந்திரம்: ${p1Name} & ${p2Name} தாம்பத்திய இனிமைக்காக ஒவ்வொரு வெள்ளிக்கிழமையும் "Om Shum Shukraya Namaha" (21 முறை) உச்சரிக்க வேண்டும்.`;
    if (lang === 'fr') return `Mantra de Vénus & Preeti : ${p1Name} & ${p2Name} doivent chanter "Om Shum Shukraya Namaha" (21 fois) chaque vendredi pour attirer la douceur amoureuse et la grâce vénusienne.`;
    return remedyStr;
  }

  if (lower.includes('vastu') || lower.includes('ishanya') || lower.includes('rose quartz')) {
    if (lang === 'hi') return `ईशान्य वास्तु उपाय: दांपत्य शांति और समृद्धि हेतु घर के ईशान कोण में अभिमंत्रित रोज क्वार्ट्ज क्रिस्टल अथवा पवित्र चांदी का सिक्का रखें।`;
    if (lang === 'bn') return `ঈশান বাস্তু প্রতিকার: দাম্পত্য শান্তি ও আর্থিক বৃদ্ধির জন্য বাড়ির উত্তর-পূর্ব (ঈশান) কোণে প্রাণপ্রতিষ্ঠিত রোজ কোয়ার্টজ ক্রিস্টাল বা রৌপ্য মুদ্রা স্থাপন করুন।`;
    if (lang === 'ta') return `ஈசான்ய வாஸ்து பரிகாரம்: தாம்பத்திய அமைதி மற்றும் பொருளாதார வளர்ச்சிக்கு, வீட்டின் வடகிழக்கு (ஈசான்ய) மூலையில் ரோஸ் குவார்ட்ஸ் படிகம் அல்லது வெள்ளி நாணயம் வைக்கவும்.`;
    if (lang === 'fr') return `Remède Vastu Ishanya : Placez des cristaux de quartz rose ou une pièce d'argent sacrée dans le coin Nord-Est (Ishanya) de votre foyer pour favoriser la paix conjugale et la prospérité.`;
    return remedyStr;
  }

  if (lower.includes('deep daan') || lower.includes('ghee lamp')) {
    if (lang === 'hi') return `दीप दान: पारिवारिक शांति और निरंतर सौभाग्य हेतु गुरुवार को सूर्यास्त के समय पूर्व दिशा की ओर मुख कर शुद्ध गाय के घी का दीपक जलाएं।`;
    if (lang === 'bn') return `দীপ দান: পারিবারিক শান্তি ও চিরস্থায়ী সৌভাগ্যের জন্য বৃহস্পতিবার সূর্যাস্তের সময় পূর্বমুখী হয়ে খাঁটি গাওয়া ঘিয়ের প্রদীপ প্রজ্বলন করুন।`;
    if (lang === 'ta') return `தீப தானம்: குடும்ப அமைதி மற்றும் நிலைத்த அதிர்ஷ்டத்திற்கு, வியாழக்கிழமைகளில் சூரிய அஸ்தமனத்தின் போது கிழக்கு நோக்கி தூய பசு நெய் தீபம் ஏற்றவும்.`;
    if (lang === 'fr') return `Offrande de Lampe (Deep Daan) : Allumez une lampe de ghee pur de vache orientée vers l'Est au coucher du soleil les jeudis pour cultiver la sérénité familiale.`;
    return remedyStr;
  }

  if (lower.includes('jointly light a pure cow ghee lamp')) {
    if (lang === 'hi') return 'पारिवारिक सुख-शांति हेतु गुरुवार की संध्या को मिलकर पूर्व दिशा में शुद्ध गाय के घी का दीपक जलाएं।';
    if (lang === 'bn') return 'পারিবারিক সমৃদ্ধির জন্য বৃহস্পতিবার সন্ধ্যায় একত্রে পূর্বমুখী হয়ে খাঁটি ঘিয়ের প্রদীপ প্রজ্বলন করুন।';
    if (lang === 'ta') return 'குடும்ப மகிழ்ச்சிக்காக வியாழன் மாலை கிழக்கு நோக்கி தூய பசு நெய் தீபம் ஏற்றவும்.';
    if (lang === 'fr') return 'Allumez ensemble une lampe au ghee pur tournée vers l\'Est le jeudi soir pour la tranquillité familiale.';
  }

  if (lower.includes('perform charity of food or clothing')) {
    if (lang === 'hi') return 'ईश्वरीय कृपा प्राप्ति हेतु शुभ तिथियों पर जरूरतमंदों को अन्न, वस्त्र अथवा आवश्यक वस्तुओं का दान करें।';
    if (lang === 'bn') return 'ঐশ্বরিক কৃপা লাভের জন্য শুভ তিথিতে বস্ত্র বা খাদ্য দান করুন।';
    if (lang === 'ta') return 'சுப திதிகளில் தேவையுள்ளோருக்கு உணவு அல்லது ஆடை தானம் செய்யுங்கள்.';
    if (lang === 'fr') return 'Faites la charité de nourriture ou de vêtements lors des tithis propices.';
  }

  if (lower.includes('worship lord shiva and goddess parvati')) {
    if (lang === 'hi') return 'दांपत्य दीर्घायु एवं अटूट प्रेम हेतु शुक्ल पक्ष के सोमवार को भगवान शिव और माता पार्वती की संयुक्त पूजा करें।';
    if (lang === 'bn') return 'দাম্পত্য দীর্ঘায়ু ও অটুট প্রেমের জন্য শুক্লপক্ষের সোমবারে শিব ও পার্বতীর যৌথ পূজা করুন।';
    if (lang === 'ta') return 'நீடித்த திருமண உறவிற்காக சுக்ல பக்ஷ திங்கட்கிழமைகளில் சிவ-பார்வதியை ஒன்றாக வணங்கவும்.';
    if (lang === 'fr') return 'Vénérez ensemble Shiva et Parvati les lundis de Shukla Paksha pour la longévité de votre union.';
  }

  return remedyStr;
}
