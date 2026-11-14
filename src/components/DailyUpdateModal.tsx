import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
  X,
  Mail,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Activity,
  Coins,
  Users,
  Heart,
  GraduationCap,
  Briefcase,
  Plane,
  Check,
} from 'lucide-react';
import { zodiacApi } from '../services/zodiacApi';

export interface DailyUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSignName: string;
  activeSignSymbol?: string;
  theme?: 'light' | 'dark';
}

interface CategoryOption {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  { id: 'health', name: 'Health', icon: Activity },
  { id: 'wealth', name: 'Wealth', icon: Coins },
  { id: 'relationship', name: 'Relationship', icon: Users },
  { id: 'love_line', name: 'Love Line', icon: Heart },
  { id: 'education', name: 'Education', icon: GraduationCap },
  { id: 'professional', name: 'Profession', icon: Briefcase },
  { id: 'travel', name: 'Travel', icon: Plane },
];

export const DailyUpdateModal: React.FC<DailyUpdateModalProps> = ({
  isOpen,
  onClose,
  activeSignName,
  activeSignSymbol = '♈',
  theme = 'dark',
}) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'health',
    'wealth',
    'relationship',
    'love_line',
    'education',
    'professional',
    'travel',
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen, activeSignName]);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId)
        ? prev.filter((id) => id !== catId)
        : [...prev, catId]
    );
  };

  const selectAllCategories = () => {
    setSelectedCategories(CATEGORY_OPTIONS.map((c) => c.id));
  };

  const clearAllCategories = () => {
    setSelectedCategories([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    if (selectedCategories.length === 0) {
      setErrorMessage('Please select at least one preferred category.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await zodiacApi.subscribeDailyUpdate({
        email: cleanEmail,
        zodiac_sign: activeSignName,
        preferred_categories: selectedCategories,
      });

      if (response && response.status === 'success') {
        setSuccessMessage(
          response.message || t('zodiac.daily_update_success', { sign: activeSignName, defaultValue: `Successfully subscribed to daily updates for ${activeSignName}!` })
        );
      } else {
        setSuccessMessage(t('zodiac.daily_update_success', { sign: activeSignName, defaultValue: `Successfully subscribed to daily updates for ${activeSignName}!` }));
      }
    } catch (err: any) {
      console.error('Subscription error:', err);
      const msg = err?.message || 'Failed to save subscription. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-lg rounded-2xl border shadow-2xl p-6 sm:p-7 space-y-5 transition-all ${
          isDark
            ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8] shadow-[0_16px_48px_rgba(0,0,0,0.6)]'
            : 'bg-white border-[#E8E1D5] text-[#1A1816] shadow-2xl shadow-[#C9A050]/10'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-xl border transition cursor-pointer ${
            isDark
              ? 'bg-[#1C1C22] border-[#2A2A2E] text-[#9E9A90] hover:text-[#F0ECE1] hover:bg-[#25252E]'
              : 'bg-[#FAF7F2] border-[#E5E0D5] text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start space-x-3.5 pr-8">
          <div
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm ${
              isDark
                ? 'bg-[#C9A050]/15 border-[#C9A050]/40 text-[#E5C158]'
                : 'bg-[#C9A050]/15 border-[#C9A050]/35 text-[#8D6723]'
            }`}
          >
            <Mail className="w-6 h-6" strokeWidth={2} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className={`text-lg sm:text-xl font-serif font-bold tracking-tight ${
                isDark ? 'text-[#F0ECE1]' : 'text-[#1A1816]'
              }`}>
                {t('zodiac.get_daily_updates', 'Get Daily Updates')}
              </h3>
            </div>
            <p className={`text-xs mt-0.5 leading-relaxed ${
              isDark ? 'text-[#9E9A90]' : 'text-gray-600'
            }`}>
              {t('zodiac.daily_update_desc', { sign: `${activeSignSymbol} ${activeSignName}`, defaultValue: `Daily transits and category insights for ${activeSignSymbol} ${activeSignName} delivered to your inbox every morning.` })}
            </p>
          </div>
        </div>

        {/* Success View */}
        {successMessage ? (
          <div className="space-y-4 py-2 animate-in fade-in duration-300">
            <div
              className={`p-5 rounded-2xl border flex items-start space-x-3.5 ${
                isDark
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs sm:text-sm">
                <div className="font-bold text-sm">Subscription Confirmed!</div>
                <p className="leading-relaxed opacity-90">{successMessage}</p>
                <p className={`text-[11px] pt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  Preferred sign: <span className="font-semibold">{activeSignName}</span> • Categories:{' '}
                  <span className="font-semibold">{selectedCategories.length} selected</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl font-semibold text-xs tracking-wide bg-gradient-to-r from-[#D4AF37] to-[#C9A050] text-[#0D0D0F] hover:from-[#DFB742] hover:to-[#D4AF37] shadow-md shadow-[#C9A050]/20 transition cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          /* Subscription Form */
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* Error Banner */}
            {errorMessage && (
              <div
                className={`p-3 rounded-xl border flex items-center space-x-2 text-xs animate-in fade-in duration-200 ${
                  isDark
                    ? 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}
              >
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="daily-update-email"
                className={`block text-xs font-semibold ${
                  isDark ? 'text-[#F0ECE1]' : 'text-gray-800'
                }`}
              >
                Your Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="daily-update-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  disabled={isSubmitting}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm transition-all outline-hidden ${
                    isDark
                      ? 'bg-[#18181E] border-[#2A2A32] text-[#F0ECE1] placeholder-[#6E6A62] focus:border-[#C9A050] focus:ring-1 focus:ring-[#C9A050]'
                      : 'bg-[#FAF7F2] border-[#E5E0D5] text-[#1A1816] placeholder-gray-400 focus:border-[#C9A050] focus:ring-1 focus:ring-[#C9A050]'
                  }`}
                />
              </div>
            </div>

            {/* Selected Sign Indicator */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                isDark
                  ? 'bg-[#18181E] border-[#2A2A32]'
                  : 'bg-[#FAF7F2] border-[#E5E0D5]'
              }`}
            >
              <span className={`font-medium ${isDark ? 'text-[#9E9A90]' : 'text-gray-600'}`}>
                Selected Zodiac Sign:
              </span>
              <span className="font-bold text-[#C9A050] flex items-center space-x-1 font-serif">
                <span>{activeSignSymbol}</span>
                <span>{activeSignName} Horizon</span>
              </span>
            </div>

            {/* Preferred Categories Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={`text-xs font-semibold ${isDark ? 'text-[#F0ECE1]' : 'text-gray-800'}`}>
                  Preferred Categories ({selectedCategories.length}/7)
                </label>
                <div className="flex items-center space-x-2 text-[11px]">
                  <button
                    type="button"
                    onClick={selectAllCategories}
                    className="text-[#C9A050] hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className={isDark ? 'text-[#444450]' : 'text-gray-300'}>|</span>
                  <button
                    type="button"
                    onClick={clearAllCategories}
                    className={`hover:underline cursor-pointer ${
                      isDark ? 'text-[#9E9A90]' : 'text-gray-500'
                    }`}
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Category Pills Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORY_OPTIONS.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.id);
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`p-2 rounded-xl border text-left text-xs font-medium transition-all duration-200 cursor-pointer flex items-center space-x-2 ${
                        isSelected
                          ? isDark
                            ? 'bg-[#C9A050]/15 border-[#C9A050] text-[#F0ECE1] shadow-xs'
                            : 'bg-[#C9A050]/15 border-[#C9A050] text-[#8D6723] shadow-xs'
                          : isDark
                            ? 'bg-[#18181E] border-[#2A2A32] text-[#8E8A80] hover:text-[#C5C0B6]'
                            : 'bg-white border-[#E8E1D5] text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-[10px] ${
                          isSelected
                            ? 'bg-[#C9A050] text-[#0D0D0F]'
                            : isDark
                              ? 'bg-[#222228] text-gray-500'
                              : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : <Icon className="w-3 h-3" />}
                      </div>
                      <span className="truncate">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className={`flex-1 py-2.5 rounded-xl border font-semibold text-xs tracking-wide transition cursor-pointer ${
                  isDark
                    ? 'border-[#2A2A32] text-[#9E9A90] hover:bg-[#1C1C22] hover:text-[#F0ECE1]'
                    : 'border-[#E5E0D5] text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl font-semibold text-xs tracking-wide bg-gradient-to-r from-[#D4AF37] to-[#C9A050] text-[#0D0D0F] hover:from-[#DFB742] hover:to-[#D4AF37] shadow-md shadow-[#C9A050]/20 hover:shadow-lg hover:shadow-[#C9A050]/30 transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>{t('zodiac.subscribing')}</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5" />
                    <span>{t('zodiac.get_daily_update_btn')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
};
export default DailyUpdateModal;

