import React, { useState } from 'react';
import {
  Mail,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { zodiacApi } from '../services/zodiacApi';

export interface DailyUpdateInlineCardProps {
  activeSignName: string;
  activeSignSymbol?: string;
  theme?: 'light' | 'dark';
}

const ALL_CATEGORIES = [
  'health',
  'wealth',
  'relationship',
  'love_line',
  'education',
  'professional',
  'travel',
];

export const DailyUpdateInlineCard: React.FC<DailyUpdateInlineCardProps> = ({
  activeSignName,
  activeSignSymbol = '♈',
  theme = 'dark',
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isDark = theme === 'dark';

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

    setIsSubmitting(true);

    try {
      const response = await zodiacApi.subscribeDailyUpdate({
        email: cleanEmail,
        zodiac_sign: activeSignName,
        preferred_categories: ALL_CATEGORIES,
      });

      if (response && response.status === 'success') {
        setSuccessMessage(
          response.message || `Successfully subscribed! Today's cosmic update for ${activeSignName} has been sent to your inbox.`
        );
      } else {
        setSuccessMessage(`Successfully subscribed to daily updates for ${activeSignName}!`);
      }
    } catch (err: any) {
      console.error('Subscription error:', err);
      const msg = err?.message || 'Failed to save subscription. Please check if the backend is running.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`rounded-xl border transition-all ${
        isDark
          ? 'bg-[#0D0D0F] border-[#2A2A2E]'
          : 'bg-[#FAF7F2] border-[#E8E1D5] shadow-xs'
      }`}
    >
      <div className="p-4 sm:p-4.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          {/* Left Column: Heading */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                isDark
                  ? 'bg-[#C9A050]/15 border-[#C9A050]/30 text-[#C9A050]'
                  : 'bg-[#C9A050]/15 border-[#C9A050]/40 text-[#8D6723]'
              }`}
            >
              <Mail className="w-4 h-4" />
            </div>
            <h3 className={`text-sm sm:text-base font-bold font-serif tracking-wide ${isDark ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
              YOUR ASTRO NEWS LETTER
            </h3>
          </div>

          {/* Right Column: Clean Inline Email Input & Button */}
          <div className="flex flex-col items-stretch sm:items-end shrink-0">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-end gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                disabled={isSubmitting}
                className={`w-full sm:w-56 px-3 py-2 text-xs rounded-lg border transition-all outline-hidden ${
                  isDark
                    ? 'bg-[#18181E] border-[#2A2A32] text-[#F0ECE1] placeholder:text-[#65625B] focus:border-[#C9A050]'
                    : 'bg-white border-[#DDD5C7] text-gray-900 placeholder:text-gray-400 focus:border-[#C9A050] shadow-2xs'
                }`}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-bold tracking-wide bg-gradient-to-r from-[#D4AF37] to-[#C9A050] text-[#0D0D0F] hover:from-[#DFB742] hover:to-[#D4AF37] shadow-sm shadow-[#C9A050]/20 hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center space-x-1.5 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3 h-3 border-2 border-[#0D0D0F] border-t-transparent rounded-full animate-spin" />
                    <span>Subscribing...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5" />
                    <span>Get Daily Update</span>
                  </>
                )}
              </button>
            </form>

            {/* Status Messages */}
            {errorMessage && (
              <div className="mt-1.5 p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-[11px] flex items-center space-x-1.5 animate-in fade-in duration-200">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mt-1.5 p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] flex items-center space-x-1.5 animate-in fade-in duration-200">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
