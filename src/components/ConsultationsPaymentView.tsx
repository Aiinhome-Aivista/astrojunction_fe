import React, { useState } from 'react';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Zap,
  X,
  Download,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  Home,
  AlertCircle,
  Loader2,
  History,
  Receipt,
  Sparkles,
  Crown,
  Compass,
  HeartHandshake,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Check,
  ChevronRight,
  Star,
  Award,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { UserProfile, ConsultationTier } from '../types';
import { API_ENDPOINTS } from '../config/api_config';
import { api, getToken } from '../services/api';

interface ConsultationsPaymentViewProps {
  profile: UserProfile;
  tiers: ConsultationTier[];
  initialSelectedTierId?: string | null;
  onPaymentSuccess?: (tier: ConsultationTier, txId: string) => void;
  onNavigateTab?: (tab: string) => void;
  theme?: 'light' | 'dark';
}

export const ConsultationsPaymentView: React.FC<ConsultationsPaymentViewProps> = ({
  profile,
  tiers,
  initialSelectedTierId,
  onPaymentSuccess,
  onNavigateTab,
  theme = 'dark',
}) => {
  const [selectedTier, setSelectedTier] = useState<ConsultationTier | null>(null);

  // User Database Information Form State
  const [userData, setUserData] = useState({
    fullName: profile.fullName || '',
    email: (profile as any).email || '',
    phone: (profile as any).phone || '',
    gender: (profile.gender as 'male' | 'female' | 'other') || 'male',
    birthDate: profile.birthDate || '',
    birthTime: profile.birthTime || '',
    birthAddress: profile.birthPlace || '',
    currentAddress: (profile as any).address || (profile as any).currentAddress || '',
  });

  React.useEffect(() => {
    if (profile) {
      setUserData((prev) => ({
        ...prev,
        fullName: profile.fullName || prev.fullName,
        email: (profile as any).email || prev.email,
        phone: (profile as any).phone || prev.phone,
        gender: (profile.gender as 'male' | 'female' | 'other') || prev.gender,
        birthDate: profile.birthDate || prev.birthDate,
        birthTime: profile.birthTime || prev.birthTime,
        birthAddress: profile.birthPlace || prev.birthAddress,
        currentAddress: (profile as any).address || (profile as any).currentAddress || prev.currentAddress,
      }));
    }
  }, [profile]);

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<any | null>(null);

  // Payment History State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const getHistoryItemDetails = (tx: any) => {
    const itemId = tx.item_id || '';
    const amount = Number(tx.amount);

    if (itemId === 'daily_vedic_subscription' || amount === 99) {
      return {
        id: 'daily_vedic_subscription',
        name: 'Vedic Daily Seeker (Daily Horoscope & Panchang)',
        tab: 'daily',
        tabName: 'Daily Horoscope',
        highlights: 'Real-time Planetary Transits (Gochar), Auspicious Muhurats & AI Horoscope Synthesis.',
      };
    }
    if (itemId === 'matchmaking_regenerate_subscription' || amount === 149) {
      return {
        id: 'matchmaking_regenerate_subscription',
        name: 'Relationship Karma & Synastry (Matchmaking)',
        tab: 'matchmaking',
        tabName: 'Kundli Milan',
        highlights: '36-Guna Ashta Koota Milan, Manglik & Nadi Dosha Analysis & Karmic Synastry.',
      };
    }
    if (itemId.startsWith('roadmap_') || amount === 169 || amount === 199 || amount === 249) {
      const is25 = itemId === 'roadmap_25_subscription' || amount === 249;
      const is20 = itemId === 'roadmap_20_subscription' || amount === 199;
      return {
        id: itemId || (is25 ? 'roadmap_25_subscription' : is20 ? 'roadmap_20_subscription' : 'roadmap_15_subscription'),
        name: is25 ? '25-Year Life Horizon' : is20 ? '20-Year Life Horizon' : '15-Year Life Horizon',
        tab: 'roadmap',
        tabName: 'Destiny Roadmap',
        highlights: '15-Year Vimshottari Dasha Milestones, Career/Wealth Yogas & Lifetime PDF Dossier.',
      };
    }

    const foundTier = tiers.find((t) => t.id === itemId);
    if (foundTier) {
      return {
        id: foundTier.id,
        name: foundTier.name,
        tab: foundTier.id.startsWith('roadmap_') ? 'roadmap' : foundTier.id === 'daily_vedic_subscription' ? 'daily' : foundTier.id === 'matchmaking_regenerate_subscription' ? 'matchmaking' : 'roadmap',
        tabName: foundTier.id.startsWith('roadmap_') ? 'Destiny Roadmap' : foundTier.id === 'daily_vedic_subscription' ? 'Daily Horoscope' : 'Kundli Milan',
        highlights: foundTier.description || foundTier.features.join(' • '),
      };
    }

    return {
      id: itemId || 'daily_vedic_subscription',
      name: 'Vedic Consultation & Astrology Services',
      tab: 'daily',
      tabName: 'Daily Horoscope',
      highlights: 'Personalized Astrological Insights & Transit Forecasts.',
    };
  };

  const syncUnlockedFromHistory = (list: any[]) => {
    if (typeof window !== 'undefined' && Array.isArray(list)) {
      list.forEach((tx: any) => {
        if (tx.status === 'success') {
          const details = getHistoryItemDetails(tx);
          localStorage.setItem(`jyotish_${details.id}_active`, 'true');
          if (details.id === 'daily_vedic_subscription' || Number(tx.amount) === 99) {
            localStorage.setItem('jyotish_user_premium', 'true');
            localStorage.setItem('jyotish_daily_vedic_subscription_active', 'true');
          }
          if (details.id === 'matchmaking_regenerate_subscription' || Number(tx.amount) === 149) {
            localStorage.setItem('jyotish_matchmaking_subscribed', 'true');
            localStorage.setItem('jyotish_matchmaking_regenerate_subscription_active', 'true');
          }
          if (details.id.startsWith('roadmap_')) {
            localStorage.setItem(`jyotish_${details.id}_active`, 'true');
          }
        }
      });
    }
  };

  const fetchPaymentHistory = async () => {
    setShowHistoryModal(true);
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const token = getToken();
      if (!token) {
        setHistoryError('Please log in to view your payment history.');
        return;
      }
      const res = await api.get<any>(API_ENDPOINTS.PAYMENT.HISTORY);
      const list = Array.isArray(res) ? res : (res?.data && Array.isArray(res.data) ? res.data : []);
      setHistoryList(list);
      syncUnlockedFromHistory(list);
    } catch (err: any) {
      console.error('Failed to fetch payment history:', err);
      setHistoryError(err?.message || 'Could not load payment history. Please try again.');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Silently load history on mount to auto-unlock purchased tiers immediately
  React.useEffect(() => {
    const silentLoad = async () => {
      try {
        const token = getToken();
        if (!token) return;
        const res = await api.get<any>(API_ENDPOINTS.PAYMENT.HISTORY);
        const list = Array.isArray(res) ? res : (res?.data && Array.isArray(res.data) ? res.data : []);
        setHistoryList(list);
        syncUnlockedFromHistory(list);
      } catch (e) {
        // silent
      }
    };
    silentLoad();
  }, []);


  const handleInitiatePayment = (tier: ConsultationTier) => {
    setSelectedTier(tier);
    setPaymentSuccess(null);
    setFormErrors({});
    setApiError(null);
  };

  const handleExecutePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier) return;

    // Validation
    const errors: { [key: string]: string } = {};
    if (!userData.fullName.trim()) {
      errors.fullName = 'Full Name is required';
    }
    if (!userData.phone.trim()) {
      errors.phone = 'Phone / WhatsApp number is required';
    } else if (userData.phone.replace(/\D/g, '').length < 10) {
      errors.phone = 'Please enter a valid 10-digit mobile number';
    }
    if (!userData.currentAddress.trim()) {
      errors.currentAddress = 'Current Full Address is required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setApiError(null);
    setIsProcessing(true);

    try {
      const token = getToken();
      if (!token) {
        setApiError('Please log in to your account to complete consultation payment.');
        setIsProcessing(false);
        return;
      }

      // Step 1: Call @require_auth API using the config variable
      const orderData = await api.post<{
        tx_id?: string;
        order_id?: string;
        amount?: number;
        amount_paise?: number;
        currency?: string;
        key_id?: string;
        [key: string]: any;
      }>(API_ENDPOINTS.PAYMENT.CREATE_ORDER, {
        amount: selectedTier.priceINR,
        currency: 'INR',
        itemType: 'consultation',
        itemId: selectedTier.id,
        userDetails: userData,
      });

      const rzpOrderId = orderData?.order_id;
      if (!rzpOrderId) {
        throw new Error('Failed to obtain Razorpay Order ID from server.');
      }

      // Step 2: Ensure Razorpay SDK is loaded
      if (!(window as any).Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve(true);
          script.onerror = () => reject(new Error('Failed to load Razorpay SDK. Please check your internet connection.'));
          document.body.appendChild(script);
        });
      }

      // Step 3: Open Razorpay Checkout Modal
      const options = {
        key: orderData?.key_id || 'rzp_test_Td36lHPecE55Mo',
        amount: orderData?.amount_paise || selectedTier.priceINR * 100,
        currency: orderData?.currency || 'INR',
        name: 'AstroJunction',
        description: `${selectedTier.name} Consultation Booking`,
        order_id: rzpOrderId,
        prefill: {
          name: userData.fullName,
          email: userData.email,
          contact: userData.phone,
        },
        theme: {
          color: '#C9A050',
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
        // Step 4: After payment, verify HMAC signature on backend
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            setIsProcessing(true);
            const verifyRes = await api.post<{
              verified: boolean;
              status: string;
              order_id: string;
              [key: string]: any;
            }>(API_ENDPOINTS.PAYMENT.VERIFY, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            const txId =
              response.razorpay_payment_id ||
              orderData?.tx_id ||
              `TXN_${Date.now().toString(36).toUpperCase()}`;

            try {
              localStorage.setItem('jyotish_user_premium', 'true');
              localStorage.setItem(`jyotish_${selectedTier.id}_active`, 'true');
              if (selectedTier.id === 'matchmaking_regenerate_subscription') {
                localStorage.setItem('jyotish_matchmaking_subscribed', 'true');
              }
            } catch (storageErr) {
              console.warn('LocalStorage save failed:', storageErr);
            }

            setPaymentSuccess({
              tier: selectedTier,
              txId,
              date: new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
              amount: selectedTier.priceINR,
              user: userData,
              verification: verifyRes,
            });

            if (onPaymentSuccess) {
              onPaymentSuccess(selectedTier, txId);
            }
          } catch (verifyErr: any) {
            console.error('[Payment Verification Failed]', verifyErr);
            setApiError(
              verifyErr?.message || 'Payment signature verification failed. Please contact support.'
            );
          } finally {
            setIsProcessing(false);
          }
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.on('payment.failed', (resp: any) => {
        setIsProcessing(false);
        setApiError(
          resp.error?.description || 'Payment was cancelled or failed.'
        );
      });
      razorpayInstance.open();
    } catch (err: any) {
      console.error('[ConsultationsPaymentView] Payment flow failed:', err);
      setApiError(err?.message || 'Payment order creation failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const isTierUnlocked = (tierId: string) => {
    if (paymentSuccess?.tier?.id === tierId) return true;
    if (
      historyList.some(
        (tx) =>
          tx.status === 'success' &&
          (tx.item_id === tierId ||
            (tierId === 'daily_vedic_subscription' && (tx.item_id === 'daily_vedic_subscription' || Number(tx.amount) === 99)) ||
            (tierId === 'matchmaking_regenerate_subscription' && (tx.item_id === 'matchmaking_regenerate_subscription' || Number(tx.amount) === 149)) ||
            (tierId === 'roadmap_15_subscription' && (tx.item_id === 'roadmap_15_subscription' || Number(tx.amount) === 169)))
      )
    ) {
      return true;
    }
    if (typeof window !== 'undefined') {
      if (localStorage.getItem(`jyotish_${tierId}_active`) === 'true') return true;
      if (
        tierId === 'daily_vedic_subscription' &&
        (profile?.isPremium || localStorage.getItem('jyotish_user_premium') === 'true' || localStorage.getItem('jyotish_daily_vedic_subscription_active') === 'true')
      )
        return true;
      if (
        tierId === 'matchmaking_regenerate_subscription' &&
        ((profile as any)?.isMatchmakingPremium ||
          localStorage.getItem('jyotish_matchmaking_subscribed') === 'true')
      )
        return true;
    }
    const unlocked = (profile as any)?.unlockedRoadmapTiers || [];
    if (Array.isArray(unlocked) && unlocked.includes(tierId)) return true;
    return false;
  };

  const handleViewUnlockedData = (tierId: string) => {
    setSelectedTier(null);
    setShowHistoryModal(false);

    try {
      localStorage.setItem(`jyotish_${tierId}_active`, 'true');
      if (tierId === 'daily_vedic_subscription') {
        localStorage.setItem('jyotish_user_premium', 'true');
        localStorage.setItem('jyotish_daily_vedic_subscription_active', 'true');
      }
      if (tierId === 'matchmaking_regenerate_subscription') {
        localStorage.setItem('jyotish_matchmaking_subscribed', 'true');
        localStorage.setItem('jyotish_matchmaking_regenerate_subscription_active', 'true');
      }
    } catch {}

    if (onNavigateTab) {
      if (tierId.startsWith('roadmap_')) {
        onNavigateTab('roadmap');
      } else if (tierId === 'daily_vedic_subscription') {
        onNavigateTab('daily');
      } else if (tierId === 'matchmaking_regenerate_subscription') {
        onNavigateTab('matchmaking');
      } else {
        onNavigateTab('daily');
      }
    } else if (onPaymentSuccess && paymentSuccess?.tier) {
      onPaymentSuccess(paymentSuccess.tier, paymentSuccess.txId);
    }
  };

  const getTierUnlockedDetails = (tierId: string) => {
    if (tierId.startsWith('roadmap_')) {
      return {
        title: '15-Year Astrological Destiny Roadmap',
        destination: 'Vedic Roadmap Dashboard',
        tab: 'roadmap',
        highlights: [
          { label: 'Vimshottari Dasha Milestones', desc: 'Complete 15-Year Mahadasha & Antardasha transition timings unlocked.' },
          { label: 'Career & Financial Turning Points', desc: 'Optimal career progression, business growth & wealth yogas.' },
          { label: 'Destiny & Life Progression', desc: 'Predictions across all 8 core life dimensions synthesized.' },
          { label: 'Planetary Upayas & Remedial Guide', desc: 'Customized gemstone, Yantra, Kavach & Vedic Stotras.' },
          { label: 'Full High-Res PDF Life Dossier', desc: 'Printable 25-Year Vedic Destiny Blueprint unlocked for instant export.' },
        ],
      };
    }
    if (tierId === 'matchmaking_regenerate_subscription') {
      return {
        title: 'Daivajna Cosmic Relationship & Synastry',
        destination: 'Kundli Milan & Synastry Dashboard',
        tab: 'matchmaking',
        highlights: [
          { label: '36-Guna Ashta Koota Milan', desc: 'Deep breakdown of Varn, Vashya, Tara, Yoni, Maitri, Gana, Bhakoot & Nadi.' },
          { label: 'Dosha Cancellation Analysis', desc: 'Mangal Dosha & Nadi Dosha cancellations computed from classical Shastras.' },
          { label: 'Daivajna AI Karmic Synastry', desc: 'Emotional, psychological & spiritual harmony analysis.' },
          { label: 'Unlimited Regenerations', desc: 'Re-synthesize matchmaking counsel anytime with updated partner data.' },
          { label: 'Printable Kundli Milan Dossier', desc: 'Instant export of the full comprehensive matchmaking report.' },
        ],
      };
    }
    if (tierId === 'daily_vedic_subscription') {
      return {
        title: 'Vedic Daily Horoscope & Real-time Panchang',
        destination: 'Daily Vedic Horoscope Dashboard',
        tab: 'daily',
        highlights: [
          { label: 'Real-time Gochar (Transits)', desc: 'Live Chandra Gochar, Nakshatra lord vibrations & 12 Bhavas analysis.' },
          { label: 'Auspicious Muhurats & Kaal Windows', desc: 'Precise Abhijit Muhurat, Rahu Kaal, Gulika Kaal & Yamaganda timings.' },
          { label: 'Personalized Lucky Vibrations', desc: 'Daily lucky numbers, color frequencies & auspicious planetary hours.' },
          { label: 'Daivajna AI Daily Synthesis', desc: 'Personalized transit reading calculated directly from your birth chart.' },
        ],
      };
    }
    return {
      title: 'Certified Vedic Consultation Services',
      destination: 'Consultation Services',
      tab: 'roadmap',
      highlights: [
        { label: 'Verified Vedic Synthesis', desc: 'Personalized astrologer analysis customized for your birth chart.' },
        { label: 'Planetary Remedial Guide', desc: 'Authentic remedies, gemstone & mantra recommendations.' },
        { label: 'Downloadable Consultation Report', desc: 'Printable astrological summary and recommendations.' },
      ],
    };
  };

  const getTierMeta = (tier: ConsultationTier, index: number) => {
    if (tier.id.includes('roadmap') || index === 2) {
      return {
        badge: 'MOST POPULAR • BEST VALUE',
        badgeBg: 'bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C9A050] text-[#0D0D0F] font-black shadow-lg shadow-amber-500/25',
        icon: Crown,
        iconBox: 'bg-amber-500/20 text-[#E5C378] border border-amber-500/40 shadow-inner',
        highlight: true,
        tagline: 'Comprehensive 15-Year Life Horizon',
        popularLabel: 'Recommended by Daivajna AI',
      };
    }
    if (tier.id.includes('matchmaking') || index === 1) {
      return {
        badge: 'RELATIONSHIP KARMA',
        badgeBg: 'bg-[#C9A050]/20 text-[#E2C378] border border-[#C9A050]/40 font-bold backdrop-blur-md',
        icon: HeartHandshake,
        iconBox: 'bg-[#C9A050]/15 text-[#C9A050] border border-[#C9A050]/30',
        highlight: false,
        tagline: 'Marital Harmony & Synastry Regeneration',
        popularLabel: 'Deep Synastry',
      };
    }
    return {
      badge: 'DAILY SEEKER',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold backdrop-blur-md',
      icon: Compass,
      iconBox: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
      highlight: false,
      tagline: 'Daily Auspicious Planetary Timing',
      popularLabel: 'Daily Precision',
    };
  };

  const FAQS = [
    {
      q: 'How does instant payment activation work with Razorpay?',
      a: 'As soon as your payment is completed via Razorpay (UPI, Credit/Debit Card, NetBanking), our system instantly generates and cryptographically verifies the transaction. Your profile unlocks the selected consultation dossier and features immediately.',
    },
    {
      q: 'Can I download the report dossier as a high-resolution PDF?',
      a: 'Yes! All premium consultations and roadmap unlocks include downloadable, print-ready high-resolution PDF dossiers complete with classical Shastra references and personalized planetary remedies.',
    },
    {
      q: 'Are my birth chart details kept confidential?',
      a: '100% strictly confidential. Your birth date, time, latitude/longitude, and addresses are encrypted with 256-bit SSL and stored in a secured vault accessible only to you.',
    },
    {
      q: 'Which astrological computational engine is used?',
      a: 'AstroJunction uses high-precision Swiss Ephemeris (Lahiri Ayanamsha) coupled with classical Brihat Parashara Hora Shastra, Jaimini Sutras, and Ashtakavarga algorithms.',
    },
  ];

  const isDark = theme === 'dark';

  return (
    <div className="space-y-8 font-sans">
      {/* Top Cosmic Hero Banner */}
      <div className={`relative overflow-hidden rounded-3xl p-7 md:p-9 shadow-2xl backdrop-blur-xl border transition-colors duration-300 ${
        isDark ? 'bg-[#121217]/95 border-[#2E2E38]' : 'bg-white/95 border-[#E5E1D8] shadow-xl'
      }`}>
        {/* Background Ambient Radial Glow */}
        <div className={`absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none ${isDark ? 'bg-[#C9A050]/10' : 'bg-[#C9A050]/15'}`} />
        <div className={`absolute top-1/2 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none ${isDark ? 'bg-amber-500/10' : 'bg-amber-500/10'}`} />

        <div className={`relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b ${
          isDark ? 'border-[#2A2A35]' : 'border-[#EAE6DC]'
        }`}>
          <div className="max-w-2xl space-y-2.5">
            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-semibold tracking-wider uppercase backdrop-blur-md ${
              isDark ? 'bg-[#C9A050]/15 border-[#C9A050]/35 text-[#E2C378]' : 'bg-[#C9A050]/15 border-[#C9A050]/40 text-[#8C6517]'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-[#C9A050]" />
              <span>Certified Vedic Consultations & Premium Gateways</span>
            </div>

            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight ${
              isDark
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#FFF8E7] via-[#F0DFB0] to-[#C9A050]'
                : 'text-transparent bg-clip-text bg-gradient-to-r from-[#1A1A1E] via-[#5C451D] to-[#996F19]'
            }`}>
              Unlock Deeper Planetary Wisdom & 1-on-1 Guidance
            </h1>

            <p className={`text-xs sm:text-sm leading-relaxed max-w-xl ${
              isDark ? 'text-[#A8A49C]' : 'text-[#666258]'
            }`}>
              Certified astrological accuracy backed by Swiss Ephemeris, 256-bit SSL encrypted transactions, and sacred Vedic remediations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchPaymentHistory}
              title="View Payment History"
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer shadow-md ${
                isDark
                  ? 'bg-[#1A1A20] hover:bg-[#25252D] border border-[#C9A050]/40 hover:border-[#C9A050] text-[#E2C378]'
                  : 'bg-[#FAF7F0] hover:bg-[#F3EFE6] border border-[#C9A050]/50 hover:border-[#C9A050] text-[#8C6517]'
              }`}
            >
              <History className="w-4 h-4 text-[#C9A050]" />
              <span>Payment History</span>
            </button>

            <div className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-medium border ${
              isDark ? 'bg-[#1A1A20] border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-500/40 text-emerald-800'
            }`}>
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>100% Certified Astrological Precision</span>
            </div>
          </div>
        </div>

        {/* Feature Highlights Ribbon */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 pt-6">
          <div className={`p-3 rounded-xl border flex items-center space-x-2.5 transition ${
            isDark ? 'bg-[#181820]/70 border-[#2A2A34] hover:border-[#C9A050]/30' : 'bg-[#FAF8F4] border-[#E8E4DA] hover:border-[#C9A050]/40 shadow-sm'
          }`}>
            <div className="w-8 h-8 rounded-lg bg-[#C9A050]/15 flex items-center justify-center text-[#C9A050] shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className={`text-xs font-bold ${isDark ? 'text-[#F0ECE1]' : 'text-[#1A1A1E]'}`}>Instant PDF Dossier</p>
              <p className={`text-[10px] ${isDark ? 'text-[#9E9A90]' : 'text-[#787266]'}`}>Automated Download</p>
            </div>
          </div>

          <div className={`p-3 rounded-xl border flex items-center space-x-2.5 transition ${
            isDark ? 'bg-[#181820]/70 border-[#2A2A34] hover:border-[#C9A050]/30' : 'bg-[#FAF8F4] border-[#E8E4DA] hover:border-[#C9A050]/40 shadow-sm'
          }`}>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-500 shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <p className={`text-xs font-bold ${isDark ? 'text-[#F0ECE1]' : 'text-[#1A1A1E]'}`}>Classical Shastras</p>
              <p className={`text-[10px] ${isDark ? 'text-[#9E9A90]' : 'text-[#787266]'}`}>Brihat Parashara Rigor</p>
            </div>
          </div>

          <div className={`p-3 rounded-xl border flex items-center space-x-2.5 transition ${
            isDark ? 'bg-[#181820]/70 border-[#2A2A34] hover:border-[#C9A050]/30' : 'bg-[#FAF8F4] border-[#E8E4DA] hover:border-[#C9A050]/40 shadow-sm'
          }`}>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-500 shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <p className={`text-xs font-bold ${isDark ? 'text-[#F0ECE1]' : 'text-[#1A1A1E]'}`}>Personalized Upayas</p>
              <p className={`text-[10px] ${isDark ? 'text-[#9E9A90]' : 'text-[#787266]'}`}>Sacred Remedial Mantras</p>
            </div>
          </div>

          <div className={`p-3 rounded-xl border flex items-center space-x-2.5 transition ${
            isDark ? 'bg-[#181820]/70 border-[#2A2A34] hover:border-[#C9A050]/30' : 'bg-[#FAF8F4] border-[#E8E4DA] hover:border-[#C9A050]/40 shadow-sm'
          }`}>
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-500 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className={`text-xs font-bold ${isDark ? 'text-[#F0ECE1]' : 'text-[#1A1A1E]'}`}>Instant Activation</p>
              <p className={`text-[10px] ${isDark ? 'text-[#9E9A90]' : 'text-[#787266]'}`}>Seamless Razorpay Sync</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch pt-2 max-w-6xl mx-auto">
        {tiers.map((tier, idx) => {
          const meta = getTierMeta(tier, idx);
          const unlocked = isTierUnlocked(tier.id);
          return (
            <div
              key={tier.id}
              className={`group rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 relative ${
                unlocked
                  ? isDark
                    ? 'bg-[#141A16]/90 border-2 border-emerald-500/60 shadow-[0_8px_30px_-6px_rgba(16,185,129,0.22)] ring-1 ring-emerald-500/30 text-[#E5E1D8]'
                    : 'bg-[#F0FAF4] border-2 border-emerald-600/60 shadow-lg ring-1 ring-emerald-500/20 text-[#1A1A1E]'
                  : meta.highlight
                  ? isDark
                    ? 'bg-gradient-to-b from-[#1E1C15] via-[#141419] to-[#101014] border-2 border-[#C9A050] shadow-[0_8px_30px_-6px_rgba(201,160,80,0.28)] ring-1 ring-[#C9A050]/40 -translate-y-1 text-[#E5E1D8]'
                    : 'bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EC] to-[#F5EFE0] border-2 border-[#C9A050] shadow-[0_10px_30px_-6px_rgba(201,160,80,0.22)] ring-1 ring-[#C9A050]/40 -translate-y-1 text-[#1A1A1E]'
                  : isDark
                  ? 'bg-[#131318]/90 hover:bg-[#17171E] border border-[#2A2A34] hover:border-[#C9A050]/50 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-[#E5E1D8]'
                  : 'bg-white hover:bg-[#FAF9F5] border border-[#E5E1D8] hover:border-[#C9A050]/60 shadow-md hover:shadow-xl hover:-translate-y-0.5 text-[#1A1A1E]'
              }`}
            >
              {/* Top Floating Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
                {unlocked ? (
                  <span className="px-3 py-0.5 rounded-full text-[9px] tracking-wider uppercase flex items-center space-x-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black shadow-md shadow-emerald-500/25">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>PLAN UNLOCKED & ACTIVE</span>
                  </span>
                ) : (
                  <span className={`px-3 py-0.5 rounded-full text-[9px] tracking-wider uppercase flex items-center space-x-1 ${
                    meta.highlight
                      ? meta.badgeBg
                      : isDark
                      ? meta.badgeBg
                      : 'bg-[#C9A050]/15 text-[#8C6517] border border-[#C9A050]/35 font-bold shadow-sm'
                  }`}>
                    <meta.icon className="w-3 h-3" />
                    <span>{meta.badge}</span>
                  </span>
                )}
              </div>

              <div>
                {/* Header with Icon and Delivery */}
                <div className="flex items-center justify-between pt-0.5 mb-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    unlocked
                      ? isDark ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      : isDark ? meta.iconBox : 'bg-[#C9A050]/15 text-[#8C6517] border border-[#C9A050]/30'
                  }`}>
                    <meta.icon className="w-4.5 h-4.5" />
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                    unlocked
                      ? isDark ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30' : 'text-emerald-800 bg-emerald-100/90 border-emerald-300'
                      : isDark ? 'text-[#A09C92] bg-[#1A1A22] border-[#2B2B36]' : 'text-[#666258] bg-[#F3EFE6] border-[#E2DDD0]'
                  }`}>
                    {unlocked ? 'Active on Profile' : (tier.deliveryTime || 'Instant Access')}
                  </span>
                </div>

                <h3 className={`text-base sm:text-lg font-serif font-bold transition ${
                  isDark ? 'text-[#F5F2EA] group-hover:text-[#F3E5AB]' : 'text-[#1A1A1E] group-hover:text-[#8C6517]'
                }`}>
                  {tier.name}
                </h3>
                <p className={`text-[11px] mt-1 leading-snug min-h-[32px] line-clamp-2 ${
                  isDark ? 'text-[#9E9A90]' : 'text-[#666258]'
                }`}>
                  {tier.description}
                </p>

                {/* Price Display */}
                <div className={`mt-3 pt-2.5 pb-3 border-y flex items-baseline justify-between ${
                  isDark ? 'border-[#282832]' : 'border-[#EAE6DC]'
                }`}>
                  <div className="flex items-baseline space-x-1">
                    <span className={`text-2xl sm:text-3xl font-serif font-bold ${
                      isDark
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#FFF4D0] to-[#C9A050]'
                        : 'text-transparent bg-clip-text bg-gradient-to-r from-[#8C6517] to-[#C9A050]'
                    }`}>
                      ₹{tier.priceINR.toLocaleString()}
                    </span>
                    <span className={`text-[10px] font-sans font-medium ${isDark ? 'text-[#9E9A90]' : 'text-[#787266]'}`}>INR</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                      isDark
                        ? 'text-[#C9A050] bg-[#C9A050]/10 border-[#C9A050]/25'
                        : 'text-[#8C6517] bg-[#C9A050]/15 border-[#C9A050]/35'
                    }`}>
                      ~ ${tier.priceUSD} USD
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <div className="mt-3 space-y-2">
                  <p className={`text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 ${
                    isDark ? 'text-[#C9A050]' : 'text-[#8C6517]'
                  }`}>
                    <Star className="w-2.5 h-2.5 text-[#C9A050] fill-[#C9A050]" />
                    <span>Included Benefits:</span>
                  </p>
                  <ul className="space-y-1.5 text-[11px]">
                    {tier.features.map((feat, i) => (
                      <li key={i} className={`flex items-start space-x-2 leading-snug ${
                        isDark ? 'text-[#D8D4CA]' : 'text-[#36342E]'
                      }`}>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                          unlocked
                            ? isDark ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-emerald-100 text-emerald-700 border-emerald-400'
                            : isDark ? 'bg-[#C9A050]/15 border-[#C9A050]/35 text-[#C9A050]' : 'bg-[#C9A050]/15 border-[#C9A050]/40 text-[#8C6517]'
                        }`}>
                          <Check className="w-2 h-2 stroke-[3]" />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              {unlocked ? (
                <button
                  onClick={() => handleViewUnlockedData(tier.id)}
                  className={`w-full mt-4 py-2.5 rounded-xl font-sans font-bold text-xs shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center space-x-1.5 ${
                    isDark
                      ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 shadow-md'
                  }`}
                >
                  <BookOpen className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-white'}`} />
                  <span>View Unlocked Plan Data ➔</span>
                </button>
              ) : (
                <button
                  onClick={() => handleInitiatePayment(tier)}
                  className={`w-full mt-4 py-2.5 rounded-xl font-sans font-bold text-xs shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center space-x-1.5 ${
                    meta.highlight
                      ? 'bg-gradient-to-r from-[#C9A050] via-[#E2C378] to-[#C9A050] hover:brightness-110 active:scale-[0.99] text-[#0A0A0D] shadow-[#C9A050]/30'
                      : isDark
                      ? 'bg-[#1E1E26] hover:bg-[#C9A050] text-[#F0ECE1] hover:text-[#0A0A0D] border border-[#2D2D38] hover:border-[#C9A050] shadow-md hover:shadow-[#C9A050]/25'
                      : 'bg-[#F7F4EC] hover:bg-[#C9A050] text-[#2A2A2E] hover:text-white border border-[#DDD6C7] hover:border-[#C9A050] shadow-sm hover:shadow-[#C9A050]/25'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Unlock Consultation & Pay</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Trust & Security 4-Pillar Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        <div className={`p-4 rounded-2xl border flex items-center space-x-3.5 transition ${
          isDark ? 'bg-[#131317]/80 border-[#272730] hover:border-[#C9A050]/30' : 'bg-white border-[#E5E1D8] shadow-sm hover:border-[#C9A050]/40'
        }`}>
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[#C9A050] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className={`text-xs font-bold ${isDark ? 'text-[#F0ECE1]' : 'text-[#1A1A1E]'}`}>256-Bit SSL Secured</h4>
            <p className={`text-[11px] ${isDark ? 'text-[#9E9A90]' : 'text-[#787266]'}`}>Bank-grade Razorpay gateway</p>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border flex items-center space-x-3.5 transition ${
          isDark ? 'bg-[#131317]/80 border-[#272730] hover:border-[#C9A050]/30' : 'bg-white border-[#E5E1D8] shadow-sm hover:border-[#C9A050]/40'
        }`}>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className={`text-xs font-bold ${isDark ? 'text-[#F0ECE1]' : 'text-[#1A1A1E]'}`}>Instant Fulfillment</h4>
            <p className={`text-[11px] ${isDark ? 'text-[#9E9A90]' : 'text-[#787266]'}`}>Zero waiting, immediate activation</p>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border flex items-center space-x-3.5 transition ${
          isDark ? 'bg-[#131317]/80 border-[#272730] hover:border-[#C9A050]/30' : 'bg-white border-[#E5E1D8] shadow-sm hover:border-[#C9A050]/40'
        }`}>
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-500 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className={`text-xs font-bold ${isDark ? 'text-[#F0ECE1]' : 'text-[#1A1A1E]'}`}>Ancient Vedic Rigor</h4>
            <p className={`text-[11px] ${isDark ? 'text-[#9E9A90]' : 'text-[#787266]'}`}>Parashari & Jaimini precision</p>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border flex items-center space-x-3.5 transition ${
          isDark ? 'bg-[#131317]/80 border-[#272730] hover:border-[#C9A050]/30' : 'bg-white border-[#E5E1D8] shadow-sm hover:border-[#C9A050]/40'
        }`}>
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-500 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className={`text-xs font-bold ${isDark ? 'text-[#F0ECE1]' : 'text-[#1A1A1E]'}`}>100% Confidential</h4>
            <p className={`text-[11px] ${isDark ? 'text-[#9E9A90]' : 'text-[#787266]'}`}>Strict privacy for your birth data</p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions Accordion */}
      <div className={`rounded-3xl p-6 md:p-8 space-y-4 shadow-xl border ${
        isDark ? 'bg-[#121217]/90 border-[#2A2A35]' : 'bg-white border-[#E5E1D8] shadow-lg'
      }`}>
        <div className={`flex items-center space-x-2.5 border-b pb-4 ${
          isDark ? 'border-[#282834]' : 'border-[#EAE6DC]'
        }`}>
          <HelpCircle className="w-5 h-5 text-[#C9A050]" />
          <div>
            <h3 className={`text-lg font-serif font-bold ${isDark ? 'text-[#F0ECE1]' : 'text-[#1A1A1E]'}`}>
              Frequently Asked Questions
            </h3>
            <p className={`text-xs ${isDark ? 'text-[#9E9A90]' : 'text-[#787266]'}`}>
              Everything you need to know about our consultations and instant payment verification
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border overflow-hidden transition ${
                  isDark ? 'border-[#2A2A34] bg-[#171720]/60' : 'border-[#E8E4DA] bg-[#FAF8F4]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className={`w-full p-4 text-left flex items-center justify-between text-xs font-semibold transition cursor-pointer ${
                    isDark ? 'text-[#F0ECE1] hover:text-[#C9A050]' : 'text-[#1A1A1E] hover:text-[#8C6517]'
                  }`}
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#C9A050] shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className={`w-4 h-4 shrink-0 ml-2 ${isDark ? 'text-[#9E9A90]' : 'text-[#8E8A80]'}`} />
                  )}
                </button>
                {isOpen && (
                  <div className={`px-4 pb-4 pt-1 text-xs leading-relaxed border-t ${
                    isDark ? 'text-[#A8A49C] border-[#2A2A34]/50' : 'text-[#4A463E] border-[#EAE6DC]'
                  }`}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* User Information & Direct Pay Modal */}
      {selectedTier && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl max-w-lg w-full p-6 shadow-2xl relative font-sans max-h-[92vh] flex flex-col ${
            isDark ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-white border-[#E5E1D8] text-[#1A1A1E]'
          }`}>
            {/* Top Right Actions: History & Close */}
            <div className="absolute top-4 right-4 flex items-center space-x-1.5 z-10">
              <button
                type="button"
                onClick={fetchPaymentHistory}
                className={`p-1.5 rounded-lg cursor-pointer transition flex items-center space-x-1 text-xs ${
                  isDark
                    ? 'text-[#9E9A90] hover:text-[#C9A050] bg-[#1A1A1E] hover:bg-[#2A2A2E]'
                    : 'text-[#787266] hover:text-[#8C6517] bg-[#F2EFE8] hover:bg-[#EAE5DA]'
                }`}
                title="View Payment History"
              >
                <History className="w-4 h-4" />
                <span className="text-[11px] font-medium hidden sm:inline">History</span>
              </button>
              <button
                onClick={() => setSelectedTier(null)}
                className={`p-1.5 rounded-lg cursor-pointer transition ${
                  isDark
                    ? 'text-[#9E9A90] hover:text-white bg-[#1A1A1E] hover:bg-[#2A2A2E]'
                    : 'text-[#787266] hover:text-black bg-[#F2EFE8] hover:bg-[#EAE5DA]'
                }`}
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Header */}
            {!paymentSuccess && (
              <div className={`pb-4 border-b pr-10 ${isDark ? 'border-[#2A2A2E]' : 'border-[#EAE6DC]'}`}>
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    isDark ? 'bg-[#C9A050]/15 border-[#C9A050]/30 text-[#C9A050]' : 'bg-[#C9A050]/15 border-[#C9A050]/40 text-[#8C6517]'
                  }`}>
                    {selectedTier.name}
                  </span>
                </div>
                <div className="text-xl font-bold text-[#C9A050] font-serif mt-1">
                  ₹{selectedTier.priceINR.toLocaleString()} INR
                </div>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-[#9E9A90]' : 'text-[#666258]'}`}>
                  Confirm your personal details below to proceed with payment and sync your profile.
                </p>
              </div>
            )}

            {/* Modal Body Container */}
            <div className="overflow-y-auto pr-1 py-4 flex-1">
              {paymentSuccess ? (
                /* SUCCESS RECEIPT & UNLOCKED PLAN DATA */
                <div className="space-y-4 py-1">
                  {/* Celebration Header */}
                  <div className="text-center pt-2 pb-1">
                    <div className="relative inline-flex items-center justify-center mb-3">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-500/10 border-2 border-emerald-500/60 text-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-gradient-to-r from-[#C9A050] to-[#E2C378] text-[#0D0D0F] shadow">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 border border-emerald-500/40 mb-2">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Payment Verified • Plan Unlocked</span>
                    </div>
                    <h3 className={`text-xl font-serif font-bold ${isDark ? 'text-[#F5F2EA]' : 'text-[#1A1A1E]'}`}>
                      Congratulations, {userData.fullName}!
                    </h3>
                    <p className={`text-xs mt-1 max-w-md mx-auto leading-relaxed ${isDark ? 'text-[#A8A49A]' : 'text-[#666258]'}`}>
                      Your plan <strong>{paymentSuccess.tier.name}</strong> is now <span className="text-emerald-600 font-semibold">unlocked &amp; active</span>. Your personalized astrological data and features are ready to explore.
                    </p>
                  </div>

                  {/* UNLOCKED PLAN DATA SHOWCASE CARD */}
                  {(() => {
                    const unlockedInfo = getTierUnlockedDetails(paymentSuccess.tier.id);
                    return (
                      <div className={`rounded-2xl p-4 border-2 shadow-lg space-y-3.5 font-sans ${
                        isDark
                          ? 'bg-gradient-to-b from-[#181F1B] via-[#141A17] to-[#101512] border-emerald-500/50 shadow-[0_8px_30px_-6px_rgba(16,185,129,0.25)] text-[#E5E1D8]'
                          : 'bg-gradient-to-b from-[#F0FAF4] via-[#EAF7EE] to-[#E2F2E9] border-emerald-500/60 text-[#1A1A1E]'
                      }`}>
                        <div className={`flex items-center justify-between border-b pb-2.5 ${
                          isDark ? 'border-emerald-500/25' : 'border-emerald-500/30'
                        }`}>
                          <div className="flex items-center space-x-2">
                            <Crown className="w-4 h-4 text-[#C9A050]" />
                            <span className={`text-xs font-bold font-serif tracking-wide ${
                              isDark ? 'text-[#F0ECE1]' : 'text-[#1A1A1E]'
                            }`}>
                              {unlockedInfo.title}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-black shadow-sm">
                            ACTIVE
                          </span>
                        </div>

                        {/* Profile Binding Summary */}
                        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] p-2.5 rounded-xl border ${
                          isDark ? 'bg-black/30 border-emerald-500/20' : 'bg-white/80 border-emerald-500/30'
                        }`}>
                          <div>
                            <span className={`block text-[10px] ${isDark ? 'text-[#8E8A80]' : 'text-[#787266]'}`}>Client / Chart:</span>
                            <span className={`font-semibold ${isDark ? 'text-[#F0ECE1]' : 'text-[#1A1A1E]'}`}>{userData.fullName}</span>
                          </div>
                          <div>
                            <span className={`block text-[10px] ${isDark ? 'text-[#8E8A80]' : 'text-[#787266]'}`}>Birth Coordinates:</span>
                            <span className={`truncate block ${isDark ? 'text-[#D8D4CA]' : 'text-[#36342E]'}`} title={`${userData.birthDate} ${userData.birthTime} • ${userData.birthAddress}`}>
                              {userData.birthDate} {userData.birthTime ? `@ ${userData.birthTime}` : ''}
                            </span>
                          </div>
                        </div>

                        {/* Unlocked Features / Data List */}
                        <div className="space-y-2">
                          <p className={`text-[11px] font-bold flex items-center space-x-1.5 uppercase tracking-wider ${
                            isDark ? 'text-[#E5C378]' : 'text-[#8C6517]'
                          }`}>
                            <Sparkles className="w-3 h-3 text-[#C9A050]" />
                            <span>Unlocked Data &amp; Calculations:</span>
                          </p>
                          <div className="grid grid-cols-1 gap-2">
                            {unlockedInfo.highlights.map((h, i) => (
                              <div key={i} className={`flex items-start space-x-2 text-xs p-2 rounded-lg border ${
                                isDark ? 'bg-[#1A221D]/60 border-emerald-500/15' : 'bg-white/90 border-emerald-500/25 shadow-sm'
                              }`}>
                                <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </div>
                                <div className="text-left">
                                  <span className={`font-semibold ${isDark ? 'text-[#F0ECE1]' : 'text-[#1A1A1E]'}`}>{h.label}: </span>
                                  <span className={`text-[11px] ${isDark ? 'text-[#A8A49A]' : 'text-[#666258]'}`}>{h.desc}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Big Prominent Action Button to view unlocked data */}
                        <button
                          onClick={() => handleViewUnlockedData(paymentSuccess.tier.id)}
                          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#C9A050] via-[#F3E5AB] to-[#C9A050] hover:from-[#D4AF37] hover:to-[#B38730] text-[#0D0D0F] font-bold text-xs sm:text-sm shadow-xl shadow-amber-500/25 transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2 group mt-2"
                        >
                          <BookOpen className="w-4 h-4 text-black group-hover:scale-110 transition-transform" />
                          <span>View Unlocked {paymentSuccess.tier.name} Data Now ➔</span>
                        </button>
                      </div>
                    );
                  })()}

                  {/* Payment Verification Receipt Slip Details */}
                  <div className={`p-3 rounded-xl border text-left text-xs space-y-2 font-sans ${
                    isDark ? 'bg-[#16161B] border-[#2A2A32]' : 'bg-[#FAF8F4] border-[#E8E4DA]'
                  }`}>
                    <div className={`flex items-center justify-between border-b pb-1.5 ${
                      isDark ? 'border-[#2A2A32]' : 'border-[#EAE6DC]'
                    }`}>
                      <span className={`text-[11px] ${isDark ? 'text-[#8E8A80]' : 'text-[#787266]'}`}>Transaction ID:</span>
                      <span className="text-[#C9A050] font-mono font-bold text-[11px]">{paymentSuccess.txId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-[#8E8A80]' : 'text-[#787266]'}>Amount Paid:</span>
                      <span className={`font-bold ${isDark ? 'text-[#F0ECE1]' : 'text-[#1A1A1E]'}`}>₹{paymentSuccess.amount} INR</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-[#8E8A80]' : 'text-[#787266]'}>Order Verification:</span>
                      <span className="text-emerald-500 font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 inline" />
                        <span>HMAC Verified &amp; Synced</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-[#8E8A80]' : 'text-[#787266]'}>Phone / WhatsApp:</span>
                      <span className={`font-mono ${isDark ? 'text-[#D8D4CA]' : 'text-[#1A1A1E]'}`}>{userData.phone}</span>
                    </div>
                    {userData.currentAddress && (
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-[#8E8A80]' : 'text-[#787266]'}>Current Address:</span>
                        <span className={`max-w-[220px] truncate text-right ${isDark ? 'text-[#D8D4CA]' : 'text-[#1A1A1E]'}`} title={userData.currentAddress}>
                          {userData.currentAddress}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="flex space-x-3 pt-1">
                    <button
                      onClick={() => handleViewUnlockedData(paymentSuccess.tier.id)}
                      className="flex-1 py-2.5 rounded-xl bg-[#C9A050] hover:bg-[#D4AF37] text-[#0D0D0F] font-bold text-xs shadow cursor-pointer transition flex items-center justify-center space-x-1.5"
                    >
                      <span>Go to Unlocked Data</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => window.print()}
                      className={`px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer transition ${
                        isDark ? 'bg-[#1A1A22] hover:bg-[#252530] text-[#E5E1D8] border-[#2D2D3A]' : 'bg-[#F3EFE6] hover:bg-[#EAE5DA] text-[#2A2A2E] border-[#DDD6C7]'
                      }`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Print Slip</span>
                    </button>
                    <button
                      onClick={() => setSelectedTier(null)}
                      className={`px-3 py-2.5 rounded-xl border text-xs transition cursor-pointer ${
                        isDark ? 'bg-[#141418] hover:bg-[#1E1E26] text-[#9E9A90] hover:text-white border-[#25252E]' : 'bg-[#FAF8F4] hover:bg-[#F0ECE1] text-[#787266] hover:text-black border-[#E2DDD0]'
                      }`}
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                /* USER INFORMATION FORM MATCHING DATABASE SCHEMA */
                <form onSubmit={handleExecutePayment} className="space-y-3">
                  {/* Row 1: Full Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-[#E5E1D8]' : 'text-[#2A2A2E]'}`}>
                        Full Name <span className="text-amber-500">*</span>
                      </label>
                      <div className="relative">
                        <User className={`w-4 h-4 absolute left-3 top-2.5 ${isDark ? 'text-[#9E9A90]' : 'text-[#8E8A80]'}`} />
                        <input
                          type="text"
                          required
                          value={userData.fullName}
                          onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                          placeholder="Your legal or chart name"
                          className={`w-full pl-9 pr-3 py-2 rounded-lg text-xs focus:outline-none transition border ${
                            isDark
                              ? 'bg-[#1A1A1E] border-[#2A2A2E] text-[#F0ECE1] focus:border-[#C9A050]'
                              : 'bg-[#FAF8F2] border-[#DED7C8] text-[#1A1A1E] focus:border-[#C9A050] focus:bg-white'
                          }`}
                        />
                      </div>
                      {formErrors.fullName && (
                        <p className="text-rose-400 text-[10px] mt-1">{formErrors.fullName}</p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-[#E5E1D8]' : 'text-[#2A2A2E]'}`}>
                        Phone / WhatsApp <span className="text-amber-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className={`w-4 h-4 absolute left-3 top-2.5 ${isDark ? 'text-[#9E9A90]' : 'text-[#8E8A80]'}`} />
                        <input
                          type="tel"
                          required
                          value={userData.phone}
                          onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className={`w-full pl-9 pr-3 py-2 rounded-lg text-xs focus:outline-none transition font-mono border ${
                            isDark
                              ? 'bg-[#1A1A1E] border-[#2A2A2E] text-[#F0ECE1] focus:border-[#C9A050]'
                              : 'bg-[#FAF8F2] border-[#DED7C8] text-[#1A1A1E] focus:border-[#C9A050] focus:bg-white'
                          }`}
                        />
                      </div>
                      {formErrors.phone && (
                        <p className="text-rose-400 text-[10px] mt-1">{formErrors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Current Full Address */}
                  <div>
                    <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-[#E5E1D8]' : 'text-[#2A2A2E]'}`}>
                      Current Full Address <span className="text-amber-500">*</span>
                    </label>
                    <div className="relative">
                      <Home className={`w-4 h-4 absolute left-3 top-2.5 ${isDark ? 'text-[#9E9A90]' : 'text-[#8E8A80]'}`} />
                      <input
                        type="text"
                        required
                        value={userData.currentAddress}
                        onChange={(e) => setUserData({ ...userData, currentAddress: e.target.value })}
                        placeholder="House/Flat No, Street, Landmark, City, State, Pincode"
                        className={`w-full pl-9 pr-3 py-2 rounded-lg text-xs focus:outline-none transition border ${
                          isDark
                            ? 'bg-[#1A1A1E] border-[#2A2A2E] text-[#F0ECE1] focus:border-[#C9A050]'
                            : 'bg-[#FAF8F2] border-[#DED7C8] text-[#1A1A1E] focus:border-[#C9A050] focus:bg-white'
                        }`}
                      />
                    </div>
                    {formErrors.currentAddress && (
                      <p className="text-rose-400 text-[10px] mt-1">{formErrors.currentAddress}</p>
                    )}
                  </div>

                  {apiError && (
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{apiError}</span>
                    </div>
                  )}

                  {/* DIRECT PAY BUTTON */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-3.5 rounded-xl bg-[#C9A050] hover:bg-[#D4AF37] text-[#0D0D0F] font-bold text-xs shadow-lg shadow-[#C9A050]/20 transition cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Processing Payment Order...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Pay ₹{selectedTier.priceINR.toLocaleString()} & Confirm</span>
                        </>
                      )}
                    </button>
                    <div className={`flex items-center justify-center space-x-1.5 mt-2.5 text-xs font-medium ${
                      isDark ? 'text-[#E5E1D8]' : 'text-[#666258]'
                    }`}>
                      <Lock className="w-3.5 h-3.5 text-[#C9A050]" />
                      <span>256-Bit SSL Encrypted • 100% Safe & Secure Payment</span>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
          <div className={`border rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[85vh] flex flex-col ${
            isDark ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-white border-[#E5E1D8] text-[#1A1A1E]'
          }`}>
            {/* Header */}
            <div className={`flex items-center justify-between pb-4 border-b ${isDark ? 'border-[#2A2A2E]' : 'border-[#EAE6DC]'}`}>
              <div className="flex items-center space-x-2.5">
                <div className={`p-2 rounded-xl border ${
                  isDark ? 'bg-[#C9A050]/15 border-[#C9A050]/30 text-[#C9A050]' : 'bg-[#C9A050]/15 border-[#C9A050]/40 text-[#8C6517]'
                }`}>
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`text-lg font-serif font-bold ${isDark ? 'text-[#F0ECE1]' : 'text-[#1A1A1E]'}`}>
                    Payment & Transaction History
                  </h2>
                  <p className={`text-xs ${isDark ? 'text-[#9E9A90]' : 'text-[#666258]'}`}>
                    Official record of your consultations and orders
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  isDark ? 'text-[#9E9A90] hover:text-white bg-[#1A1A1E] hover:bg-[#2A2A2E]' : 'text-[#787266] hover:text-black bg-[#F2EFE8] hover:bg-[#EAE5DA]'
                }`}
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content List */}
            <div className="overflow-y-auto py-4 flex-1 space-y-3">
              {historyLoading ? (
                <div className={`py-12 flex flex-col items-center justify-center space-y-2 ${isDark ? 'text-[#9E9A90]' : 'text-[#787266]'}`}>
                  <Loader2 className="w-6 h-6 animate-spin text-[#C9A050]" />
                  <p className="text-xs">Loading transaction history...</p>
                </div>
              ) : historyError ? (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{historyError}</span>
                </div>
              ) : historyList.length === 0 ? (
                <div className={`py-12 text-center space-y-2 ${isDark ? 'text-[#9E9A90]' : 'text-[#787266]'}`}>
                  <Receipt className="w-8 h-8 mx-auto opacity-40" />
                  <p className={`text-sm font-medium ${isDark ? 'text-[#F0ECE1]' : 'text-[#1A1A1E]'}`}>No transactions yet</p>
                  <p className="text-xs">
                    Your confirmed consultation orders and payments will appear here.
                  </p>
                </div>
              ) : (
                historyList.map((tx, idx) => {
                  const itemInfo = getHistoryItemDetails(tx);
                  const isSuccess = tx.status === 'success';

                  return (
                    <div
                      key={tx.id || idx}
                      className={`p-4 rounded-xl border transition space-y-2.5 ${
                        isSuccess
                          ? isDark
                            ? 'bg-gradient-to-r from-[#141A16] to-[#171E1A] border-emerald-500/40 shadow-md'
                            : 'bg-gradient-to-r from-[#F0FAF4] to-[#EAF7EE] border-emerald-500/50 shadow-sm'
                          : isDark
                          ? 'bg-[#1A1A1E] border-[#2A2A2E] hover:border-[#C9A050]/40'
                          : 'bg-[#FAF8F4] border-[#E8E4DA] hover:border-[#C9A050]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`font-semibold text-sm ${isDark ? 'text-[#F0ECE1]' : 'text-[#1A1A1E]'}`}>
                            {itemInfo.name}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              isSuccess
                                ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/40 flex items-center space-x-1'
                                : tx.status === 'failed'
                                ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                                : 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
                            }`}
                          >
                            {isSuccess ? (
                              <>
                                <Check className="w-2.5 h-2.5 stroke-[3] inline mr-1" />
                                <span>SUCCESS • UNLOCKED</span>
                              </>
                            ) : (
                              tx.status
                            )}
                          </span>
                        </div>
                        <div className="text-right font-mono font-bold text-[#C9A050] text-sm">
                          ₹{Number(tx.amount).toLocaleString()} {tx.currency || 'INR'}
                        </div>
                      </div>

                      {/* Unlocked Data Box for Successful Transactions */}
                      {isSuccess && (
                        <div className={`p-3 rounded-lg border text-left text-xs space-y-2 ${
                          isDark ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-emerald-50/80 border-emerald-300'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className="text-emerald-600 font-bold flex items-center space-x-1 text-[11px]">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Plan Features &amp; Predictions Unlocked</span>
                            </span>
                            <span className={`text-[10px] font-medium ${isDark ? 'text-emerald-300/80' : 'text-emerald-700'}`}>
                              Active for your Profile
                            </span>
                          </div>
                          <p className={`text-[11px] leading-relaxed ${isDark ? 'text-[#D8D4CA]' : 'text-[#2D2A24]'}`}>
                            {itemInfo.highlights}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleViewUnlockedData(itemInfo.id)}
                            className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-[#C9A050] via-[#F3E5AB] to-[#C9A050] hover:from-[#D4AF37] hover:to-[#B38730] text-[#0D0D0F] font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer shadow-md"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-black" />
                            <span>View Unlocked Data ({itemInfo.tabName}) ➔</span>
                          </button>
                        </div>
                      )}

                      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t ${
                        isDark ? 'text-[#9E9A90] border-[#2A2A2E]/60' : 'text-[#787266] border-[#EAE6DC]'
                      }`}>
                        {tx.razorpay_payment_id && (
                          <div>
                            Payment ID:{' '}
                            <span className={`font-mono ${isDark ? 'text-[#F0ECE1]' : 'text-[#1A1A1E]'}`}>{tx.razorpay_payment_id}</span>
                          </div>
                        )}
                        {tx.razorpay_order_id && (
                          <div>
                            Order ID:{' '}
                            <span className={`font-mono ${isDark ? 'text-[#F0ECE1]' : 'text-[#1A1A1E]'}`}>{tx.razorpay_order_id}</span>
                          </div>
                        )}
                        <div>
                          Date:{' '}
                          <span className={isDark ? 'text-[#F0ECE1]' : 'text-[#1A1A1E]'}>
                            {tx.created_at
                              ? new Date(tx.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Recently'}
                          </span>
                        </div>
                        <div>
                          Method: <span className={`capitalize ${isDark ? 'text-[#F0ECE1]' : 'text-[#1A1A1E]'}`}>{tx.payment_method || 'Razorpay'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className={`pt-3 border-t flex justify-end ${isDark ? 'border-[#2A2A2E]' : 'border-[#EAE6DC]'}`}>
              <button
                onClick={() => setShowHistoryModal(false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition ${
                  isDark ? 'bg-[#2A2A2E] hover:bg-[#3A3A3E] text-[#F0ECE1]' : 'bg-[#F2EFE8] hover:bg-[#EAE5DA] text-[#1A1A1E] border border-[#DDD6C7]'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
