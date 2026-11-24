import React from 'react';
import { Compass, Home, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface NotFoundPageProps {
  onGoHome: () => void;
  theme?: 'light' | 'dark';
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onGoHome, theme = 'dark' }) => {
  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-[70vh] flex items-center justify-center px-4 py-12 transition-colors duration-300 ${
        isDark ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'
      }`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`w-full max-w-lg p-6 sm:p-8 rounded-3xl border text-center shadow-2xl relative overflow-hidden backdrop-blur-xl ${
          isDark
            ? 'bg-[#141418]/90 border-[#C9A050]/30 shadow-black/60'
            : 'bg-white/95 border-[#E5E1D8] shadow-amber-900/10'
        }`}
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5 rounded-full bg-gradient-to-tr from-[#C9A050]/20 to-[#8C6B28]/10 border border-[#C9A050]/40 flex items-center justify-center">
          <Compass className="w-8 h-8 sm:w-10 sm:h-10 text-[#C9A050] animate-pulse" />
        </div>

        <span className="text-[11px] font-black tracking-widest text-[#C9A050] uppercase mb-1 block">
          404 • Page Not Found
        </span>

        <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight mb-3 text-[#111111] dark:text-[#F5F2EB]">
          Lost in the Cosmos
        </h1>

        <p className="text-xs sm:text-sm text-[#555555] dark:text-[#A8A296] leading-relaxed max-w-md mx-auto mb-6">
          The celestial coordinates you entered do not align with any known page or ephemeris. Let us guide you back to your astrological chart.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onGoHome}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-[#C9A050] to-[#8C6B28] text-[#0D0D0F] shadow-lg shadow-[#C9A050]/20 hover:opacity-95 transition cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </button>
          <button
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                onGoHome();
              }
            }}
            className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition cursor-pointer ${
              isDark
                ? 'border-[#2A2A2E] bg-[#1A1A1E] text-[#D8D2C5] hover:border-[#C9A050]/50 hover:text-white'
                : 'border-[#D4CFC4] bg-white text-gray-700 hover:border-[#C9A050]/50 hover:text-gray-950'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Page</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
