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
  ChevronRight
} from 'lucide-react';

export type LegalPageView = 'about-us' | 'faq' | 'privacy-policy' | 'cookie-policy' | 'terms-and-conditions';

interface FooterProps {
  onOpenDisclaimer?: () => void;
  setActiveTab?: (tab: string) => void;
  onNavigatePage?: (page: LegalPageView) => void;
  setTradition?: (tradition: HoroscopeTradition) => void;
  theme?: 'dark' | 'light';
  language?: string;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenDisclaimer,
  setActiveTab,
  onNavigatePage,
  theme = 'dark',
  language = 'en',
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
        className={`py-4 relative z-20 border-t transition-colors duration-300 font-sans ${
          isLight
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
              <div className="flex items-center space-x-2">
                {/* Facebook */}
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white bg-[#1877F2] hover:scale-105 hover:shadow-md transition-all duration-200 cursor-pointer">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                {/* Instagram */}
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:scale-105 hover:shadow-md transition-all duration-200 cursor-pointer">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                {/* LinkedIn */}
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white bg-[#0A66C2] hover:scale-105 hover:shadow-md transition-all duration-200 cursor-pointer">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c.92 0 1.67-.75 1.67-1.67 0-.93-.75-1.68-1.67-1.68-.92 0-1.67.75-1.67 1.68 0 .92.75 1.67 1.67 1.67m1.39 9.74v-8.37H5.07v8.37h2.78z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Right: Quick Links */}
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4 sm:gap-6 text-xs font-medium">
              <button onClick={() => handlePageClick('about-us')}
                className={`transition-colors duration-200 cursor-pointer ${isLight ? 'text-[#5C5446] hover:text-[#94691E]' : 'text-[#9E9A90] hover:text-[#C9A050]'}`}>
                About us
              </button>
              <button onClick={() => handlePageClick('faq')}
                className={`transition-colors duration-200 cursor-pointer ${isLight ? 'text-[#5C5446] hover:text-[#94691E]' : 'text-[#9E9A90] hover:text-[#C9A050]'}`}>
                FAQ
              </button>
              <button onClick={() => handlePageClick('privacy-policy')}
                className={`transition-colors duration-200 cursor-pointer ${isLight ? 'text-[#5C5446] hover:text-[#94691E]' : 'text-[#9E9A90] hover:text-[#C9A050]'}`}>
                Privacy policy
              </button>
              <button onClick={() => handlePageClick('cookie-policy')}
                className={`transition-colors duration-200 cursor-pointer ${isLight ? 'text-[#5C5446] hover:text-[#94691E]' : 'text-[#9E9A90] hover:text-[#C9A050]'}`}>
                Cookie Policy
              </button>
              <button onClick={() => handlePageClick('terms-and-conditions')}
                className={`transition-colors duration-200 cursor-pointer ${isLight ? 'text-[#5C5446] hover:text-[#94691E]' : 'text-[#9E9A90] hover:text-[#C9A050]'}`}>
                Terms &amp; conditions
              </button>
            </div>
          </div>

          {/* Bottom: Copyright */}
          <div className={`border-t pt-3 flex items-center justify-center text-center text-xs ${
            isLight ? 'border-[#DFC896]/60 text-[#6E6452]' : 'border-[#22232A] text-[#9E9A90]'
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
          <div className={`border rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto space-y-4 ${
            isLight ? 'bg-[#FFFDF9] border-[#DFC896] text-[#2C2825]' : 'bg-[#121217] border-[#2A2A34] text-[#E5E1D8]'
          }`}>
            <button
              onClick={() => setActiveModal(null)}
              className={`absolute top-4 right-4 p-1.5 rounded-lg border transition cursor-pointer ${
                isLight ? 'bg-[#F2ECE0] border-[#DFC896] text-black hover:bg-[#E5DAC6]' : 'bg-[#1A1A20] border-[#2A2A34] text-white hover:bg-[#2A2A35]'
              }`}
            >
              <X className="w-5 h-5" />
            </button>

            {/* About Us Modal */}
            {activeModal === 'about' && (
              <div className="space-y-3">
                <div className={`flex items-center space-x-2 font-serif font-bold text-lg border-b pb-3 ${
                  isLight ? 'text-[#94691E] border-[#DFC896]' : 'text-[#C9A050] border-[#2A2A34]'
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
                <div className={`p-3 rounded-xl border text-xs ${
                  isLight ? 'bg-[#F7F2E7] border-[#DFC896] text-[#7A5415]' : 'bg-[#181820] border-[#C9A050]/30 text-[#E8C470]'
                }`}>
                  ✦ 100% astronomical precision with high-accuracy ayanamshas (Lahiri, Krishnamurti, Raman).
                </div>
              </div>
            )}

            {/* Privacy Policy Modal */}
            {activeModal === 'privacy' && (
              <div className="space-y-3">
                <div className={`flex items-center space-x-2 font-serif font-bold text-lg border-b pb-3 ${
                  isLight ? 'text-[#94691E] border-[#DFC896]' : 'text-[#C9A050] border-[#2A2A34]'
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
                <div className={`flex items-center space-x-2 font-serif font-bold text-lg border-b pb-3 ${
                  isLight ? 'text-[#94691E] border-[#DFC896]' : 'text-[#C9A050] border-[#2A2A34]'
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
                <div className={`flex items-center space-x-2 font-serif font-bold text-lg border-b pb-3 ${
                  isLight ? 'text-[#94691E] border-[#DFC896]' : 'text-[#C9A050] border-[#2A2A34]'
                }`}>
                  <PhoneCall className="w-5 h-5" />
                  <span>Contact &amp; Astrologer Support</span>
                </div>
                <p className="text-xs sm:text-sm">
                  Have a question about your birth chart, consultation, or technical inquiries? Our dedicated support desk is available to assist:
                </p>
                <div className="space-y-2.5 text-xs">
                  <div className={`p-3 rounded-xl border flex items-center justify-between ${
                    isLight ? 'bg-[#F7F2E7] border-[#DFC896]' : 'bg-[#181820] border-[#2A2A34]'
                  }`}>
                    <span className="font-semibold">Email Support:</span>
                    <a href="mailto:support@astrojunction.com" className={`font-bold hover:underline ${
                      isLight ? 'text-[#94691E]' : 'text-[#C9A050]'
                    }`}>
                      support@astrojunction.com
                    </a>
                  </div>
                  <div className={`p-3 rounded-xl border flex items-center justify-between ${
                    isLight ? 'bg-[#F7F2E7] border-[#DFC896]' : 'bg-[#181820] border-[#2A2A34]'
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
                className={`px-4 py-2 rounded-lg font-bold text-xs tracking-wide cursor-pointer transition ${
                  isLight
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
