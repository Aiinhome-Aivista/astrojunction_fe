import React, { useState } from 'react';
import { AncientTraditionLogo } from './AncientTraditionLogo';
import { getTranslation } from '../services/translations';
import { HoroscopeTradition } from '../types';
import {
  Compass,
  X,
  ShieldCheck,
  FileText,
  PhoneCall,
  ChevronRight,
  Facebook,
  Linkedin
} from 'lucide-react';

export type LegalPageView = 'about-us' | 'faq' | 'privacy-policy' | 'cookie-policy' | 'terms-and-conditions';

interface FooterProps {
  onOpenDisclaimer?: () => void;
  setActiveTab?: (tab: string) => void;
  onNavigatePage?: (page: LegalPageView) => void;
  setTradition?: (tradition: HoroscopeTradition) => void;
  theme?: 'dark' | 'light';
  language?: string;
  activePage?: string;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenDisclaimer,
  setActiveTab,
  onNavigatePage,
  theme = 'dark',
  language = 'en',
  activePage,
}) => {
  const t = (key: string) => getTranslation(key, language);

  const [activeModal, setActiveModal] = useState<'about' | 'privacy' | 'terms' | 'contact' | null>(null);

  const handlePageClick = (page: LegalPageView) => {
    if (onNavigatePage) {
      onNavigatePage(page);
    } else if (setActiveTab) {
      setActiveTab(page);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isLight = theme === 'light';

  return (
    <>
      <footer
        className={`py-4 relative z-20 border-t transition-colors duration-300 font-sans ${isLight
            ? 'bg-[#F7F2E7] text-[#2C2825] border-[#DFC896]'
            : 'bg-[#08080C] text-[#E5E1D8] border-[#22232A]'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Main Row: Connect with us (left) | Quick links (right) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3">

            {/* Left: Connect With Us */}
            <div className="flex items-center space-x-3">
              <span className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${isLight ? 'text-[#3E382E]' : 'text-[#D0CBC0]'}`}>
                Connect with us
              </span>
              <div className="flex items-center space-x-5">
                {/* Facebook */}
                <a href="https://www.facebook.com/astrojunction.in/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                  className="flex items-center justify-center hover:scale-110 transition-all duration-200 cursor-pointer shadow-sm">
                  <svg className="w-7 h-7 fill-[#1877F2]" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="white" />
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>

                {/* LinkedIn (Disabled) */}
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" aria-disabled="true"
                  className="flex items-center justify-center opacity-50 cursor-not-allowed pointer-events-none grayscale">
                  <svg className="w-7 h-7 fill-[#0A66C2]" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" fill="white" />
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c.92 0 1.67-.75 1.67-1.67 0-.93-.75-1.68-1.67-1.68-.92 0-1.67.75-1.67 1.68 0 .92.75 1.67 1.67 1.67m1.39 9.74v-8.37H5.07v8.37h2.78z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Right: Quick Links */}
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4 sm:gap-6 text-xs font-medium">
              <button onClick={() => handlePageClick('about-us')}
                className={`transition-all duration-200 cursor-pointer ${activePage === 'about-us'
                    ? (isLight ? 'text-[#94691E] font-bold underline underline-offset-4 decoration-[#94691E]/50' : 'text-[#C9A050] font-bold underline underline-offset-4 decoration-[#C9A050]/50')
                    : (isLight ? 'text-[#5C5446] hover:text-[#94691E]' : 'text-[#9E9A90] hover:text-[#C9A050]')
                  }`}>
                About us
              </button>
              <button onClick={() => handlePageClick('faq')}
                className={`transition-all duration-200 cursor-pointer ${activePage === 'faq'
                    ? (isLight ? 'text-[#94691E] font-bold underline underline-offset-4 decoration-[#94691E]/50' : 'text-[#C9A050] font-bold underline underline-offset-4 decoration-[#C9A050]/50')
                    : (isLight ? 'text-[#5C5446] hover:text-[#94691E]' : 'text-[#9E9A90] hover:text-[#C9A050]')
                  }`}>
                FAQ
              </button>
              <button onClick={() => handlePageClick('privacy-policy')}
                className={`transition-all duration-200 cursor-pointer ${activePage === 'privacy-policy'
                    ? (isLight ? 'text-[#94691E] font-bold underline underline-offset-4 decoration-[#94691E]/50' : 'text-[#C9A050] font-bold underline underline-offset-4 decoration-[#C9A050]/50')
                    : (isLight ? 'text-[#5C5446] hover:text-[#94691E]' : 'text-[#9E9A90] hover:text-[#C9A050]')
                  }`}>
                Privacy policy
              </button>
              <button onClick={() => handlePageClick('cookie-policy')}
                className={`transition-all duration-200 cursor-pointer ${activePage === 'cookie-policy'
                    ? (isLight ? 'text-[#94691E] font-bold underline underline-offset-4 decoration-[#94691E]/50' : 'text-[#C9A050] font-bold underline underline-offset-4 decoration-[#C9A050]/50')
                    : (isLight ? 'text-[#5C5446] hover:text-[#94691E]' : 'text-[#9E9A90] hover:text-[#C9A050]')
                  }`}>
                Cookie Policy
              </button>
              <button onClick={() => handlePageClick('terms-and-conditions')}
                className={`transition-all duration-200 cursor-pointer ${activePage === 'terms-and-conditions'
                    ? (isLight ? 'text-[#94691E] font-bold underline underline-offset-4 decoration-[#94691E]/50' : 'text-[#C9A050] font-bold underline underline-offset-4 decoration-[#C9A050]/50')
                    : (isLight ? 'text-[#5C5446] hover:text-[#94691E]' : 'text-[#9E9A90] hover:text-[#C9A050]')
                  }`}>
                Terms &amp; conditions
              </button>
            </div>
          </div>

          {/* Bottom: Copyright */}
          <div className={`border-t pt-3 flex items-center justify-center text-center text-xs ${isLight ? 'border-[#DFC896]/60 text-[#6E6452]' : 'border-[#22232A] text-[#9E9A90]'
            }`}>
            <div className="flex items-center justify-center space-x-2">
              <AncientTraditionLogo size="sm" isLight={isLight} />
              <p>
                Copyright © {new Date().getFullYear()}{' '}
                <span className={`font-semibold ${isLight ? 'text-[#1A1816]' : 'text-white'}`}>AstroJunction</span> | All Rights Reserved
              </p>
            </div>
          </div>

        </div>
      </footer>

      {/* Interactive Info Modals: About Us, Privacy Policy, Terms & Conditions, Contact Us */}
      {activeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto space-y-4 ${isLight ? 'bg-[#FFFDF9] border-[#DFC896] text-[#2C2825]' : 'bg-[#121217] border-[#2A2A34] text-[#E5E1D8]'
            }`}>
            <button
              onClick={() => setActiveModal(null)}
              className={`absolute top-4 right-4 p-1.5 rounded-lg border transition cursor-pointer ${isLight ? 'bg-[#F2ECE0] border-[#DFC896] text-black hover:bg-[#E5DAC6]' : 'bg-[#1A1A20] border-[#2A2A34] text-white hover:bg-[#2A2A35]'
                }`}
            >
              <X className="w-5 h-5" />
            </button>

            {/* About Us Modal */}
            {activeModal === 'about' && (
              <div className="space-y-3">
                <div className={`flex items-center space-x-2 font-serif font-bold text-lg border-b pb-3 ${isLight ? 'text-[#94691E] border-[#DFC896]' : 'text-[#C9A050] border-[#2A2A34]'
                  }`}>
                  <Compass className="w-5 h-5" />
                  <span>About AstroJunction</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed">
                  AstroJunction was founded with a singular sacred mission: to preserve and elevate the astronomical precision, philosophical depth, and spiritual integrity of ancient Vedic Jyotish.
                </p>
                <p className="text-xs sm:text-sm leading-relaxed">
                  Our computation core combines the high-precision Swiss Ephemeris engine with 5 classical Jyotish traditions: Parashari Brihat Hora, Jaimini Sutras, Lal Kitab Remedies, Krishnamurti Paddhati (KP), and Bhrigu Nadi principles.
                </p>
                <div className={`p-3 rounded-xl border text-xs ${isLight ? 'bg-[#F7F2E7] border-[#DFC896] text-[#7A5415]' : 'bg-[#181820] border-[#C9A050]/30 text-[#E8C470]'
                  }`}>
                  ✦ 100% astronomical precision with high-accuracy ayanamshas (Lahiri, Krishnamurti, Raman).
                </div>
              </div>
            )}

            {/* Privacy Policy Modal */}
            {activeModal === 'privacy' && (
              <div className="space-y-3">
                <div className={`flex items-center space-x-2 font-serif font-bold text-lg border-b pb-3 ${isLight ? 'text-[#94691E] border-[#DFC896]' : 'text-[#C9A050] border-[#2A2A34]'
                  }`}>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Privacy Policy</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed">
                  At AstroJunction, we prioritize the sanctity and absolute privacy of your personal astrological birth information.
                </p>
                <ul className="space-y-2 text-xs list-disc list-inside">
                  <li><strong>Zero Data Monetization:</strong> We never sell, rent, or trade your birth records (Date, Time, Location) to third parties or ad networks.</li>
                  <li><strong>256-Bit SSL Encryption:</strong> All account data, transactions, and consultations are encrypted and strictly confidential.</li>
                  <li><strong>Isolated Computations:</strong> Ephemeris calculations run in secure environments without public logging of coordinates.</li>
                </ul>
              </div>
            )}

            {/* Terms & Conditions Modal */}
            {activeModal === 'terms' && (
              <div className="space-y-3">
                <div className={`flex items-center space-x-2 font-serif font-bold text-lg border-b pb-3 ${isLight ? 'text-[#94691E] border-[#DFC896]' : 'text-[#C9A050] border-[#2A2A34]'
                  }`}>
                  <FileText className="w-5 h-5" />
                  <span>Terms &amp; Conditions</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed">
                  Welcome to AstroJunction. By using our website, services, and reports, you agree to comply with our platform terms.
                </p>
                <ul className="space-y-2 text-xs list-disc list-inside">
                  <li><strong>Spiritual &amp; Self-Guidance Scope:</strong> Astrological charts and readings provide guidance, contemplation, and timing insights. They are not substitutes for certified medical, legal, or financial professional advice.</li>
                  <li><strong>Consultations Code:</strong> Respectful, ethical interaction with verified Daivajnas is mandatory during audio/video consultation sessions.</li>
                  <li><strong>Intellectual Property:</strong> All algorithms, synthesized report blueprints, and content remain copyrighted by AstroJunction.</li>
                </ul>
              </div>
            )}

            {/* Contact Us Modal */}
            {activeModal === 'contact' && (
              <div className="space-y-4">
                <div className={`flex items-center space-x-2 font-serif font-bold text-lg border-b pb-3 ${isLight ? 'text-[#94691E] border-[#DFC896]' : 'text-[#C9A050] border-[#2A2A34]'
                  }`}>
                  <PhoneCall className="w-5 h-5" />
                  <span>Contact &amp; Astrologer Support</span>
                </div>
                <p className="text-xs sm:text-sm">
                  Have a question about your birth chart, consultation, or technical inquiries? Our dedicated support desk is available to assist:
                </p>
                <div className="space-y-2.5 text-xs">
                  <div className={`p-3 rounded-xl border flex items-center justify-between ${isLight ? 'bg-[#F7F2E7] border-[#DFC896]' : 'bg-[#181820] border-[#2A2A34]'
                    }`}>
                    <span className="font-semibold">Email Support:</span>
                    <a href="mailto:support@astrojunction.com" className={`font-bold hover:underline ${isLight ? 'text-[#94691E]' : 'text-[#C9A050]'
                      }`}>
                      support@astrojunction.com
                    </a>
                  </div>
                  <div className={`p-3 rounded-xl border flex items-center justify-between ${isLight ? 'bg-[#F7F2E7] border-[#DFC896]' : 'bg-[#181820] border-[#2A2A34]'
                    }`}>
                    <span className="font-semibold">Astrologer Desk:</span>
                    <span>Monday - Saturday (9:00 AM - 8:00 PM IST)</span>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 text-right">
              <button
                onClick={() => setActiveModal(null)}
                className={`px-4 py-2 rounded-lg font-bold text-xs tracking-wide cursor-pointer transition ${isLight
                    ? 'bg-[#94691E] hover:bg-[#7D5717] text-white'
                    : 'bg-[#C9A050] hover:bg-[#D4AF37] text-black font-extrabold'
                  }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
