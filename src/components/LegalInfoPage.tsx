import React, { useState } from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';

export type LegalPageView = 'about-us' | 'faq' | 'privacy-policy' | 'cookie-policy' | 'terms-and-conditions';

interface LegalInfoPageProps {
  view: LegalPageView;
  theme?: 'dark' | 'light';
  language?: string;
  onBack?: () => void;
  onNavigateView?: (view: LegalPageView) => void;
}

export const LegalInfoPage: React.FC<LegalInfoPageProps> = ({
  view,
  theme = 'dark',
  onBack,
}) => {
  const isLight = theme === 'light';

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const faqs = [
    {
      q: 'How accurate are the horoscope and planetary calculations on AstroJunction?',
      a: 'AstroJunction leverages the world-renowned Swiss Ephemeris engine integrated with high-precision sidereal algorithms (Lahiri / Krishnamurti / Raman ayanamshas). Calculations have an astronomical precision down to 0.001 arcseconds, replicating the gold standard used by NASA astronomical tables and canonical Vedic scholars.'
    },
    {
      q: 'What birth information is necessary to generate a complete Kundli?',
      a: 'To calculate an accurate Janma Kundli (natal chart), you need your exact Date of Birth, Time of Birth (including minutes), and Place of Birth (City/State/Country). Exact coordinates and timezone offsets are automatically resolved by our planetary geocoding engine.'
    },
    {
      q: 'How does the 36-Gunas Ashta Koota Matchmaking algorithm work?',
      a: 'Our matchmaking module computes the 8 classical Vedic Kootas: Varna (1), Vashya (2), Tara (3), Yoni (4), Graha Maitri (5), Gana (6), Bhakoot (7), and Nadi (8), adding up to 36 points. It also checks for Manglik Dosha and provides specific Shanti remedies and cancelation exceptions (Pariharas).'
    },
    {
      q: 'What is the 25-Year Vedic Destiny Roadmap?',
      a: 'The 25-Year Roadmap analyzes your active and upcoming Vimshottari Mahadasha and Antardasha periods. It projects career inflection points, wealth accumulation phases, relationship transitions, and health vigilance windows across customizable 1 to 25-year horizons.'
    },
    {
      q: 'Are my birth details and personal consultations private?',
      a: 'Yes, 100%. We employ 256-bit TLS encryption in transit and secure database hashing at rest. Your birth time, chart details, and astrological questions are never sold, rented, or shared with third-party advertisers.'
    },
    {
      q: 'How do I book a personalized consultation with a certified Daivajna?',
      a: 'Visit the Consultations tab from the navigation bar. You can choose from our experienced panel of certified Vedic astrologers, select your focus area (Career, Marriage, Wealth, Health), and schedule an encrypted 1-on-1 session.'
    }
  ];

  return (
    <div
      className="w-full py-8 transition-colors duration-300 font-sans"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`rounded-3xl p-6 sm:p-10 border shadow-2xl backdrop-blur-xl transition-all duration-300 ${
          isLight ? 'bg-white/90 border-[#E5E1D8]' : 'bg-[#141418]/85 border-[#2A2A2E]'
        }`}>
        {/* Navigation Bar: Back Option Only */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className={`inline-flex items-center space-x-2 text-sm font-medium transition cursor-pointer ${
              isLight ? 'text-[#8C6218] hover:text-[#5C4010]' : 'text-[#C9A050] hover:text-[#E2C375]'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        {/* ================= PAGE: ABOUT US ================= */}
        {view === 'about-us' && (
          <article className="space-y-6 [&_p]:text-justify [&_li]:text-justify">
            <h1
              className={`text-3xl sm:text-4xl font-serif font-bold text-center mb-8 ${
                isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'
              }`}
            >
              About AstroJunction
            </h1>

            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              Welcome to <strong className="text-[#C9A050] font-semibold">AstroJunction</strong>, your trusted partner in deciphering celestial wisdom and navigating life&apos;s transformative milestones. We are more than just an astrology website — we are a dedicated platform bridging ancient Vedic Jyotish shastra with state-of-the-art astronomical computations. At AstroJunction, we believe that understanding your celestial blueprint should empower you with clarity, purpose, growth, and inner peace.
            </p>

            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              With our easy-to-use platform, tailored planetary recommendations, and transparent calculations, we aim to make the journey of self-discovery seamless, reliable, and deeply rewarding. Whether you are seeking daily Panchang timings, in-depth Janma Kundli divisional charts, 36-Gunas matchmaking, or long-term destiny roadmaps — AstroJunction is here to support you every step of the way.
            </p>

            <h2
              className={`text-2xl font-serif font-bold pt-4 mb-2 ${
                isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'
              }`}
            >
              Our Mission
            </h2>

            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              At AstroJunction, our mission is to redefine the way seekers approach Vedic astrology by eliminating superstition and prioritizing authentic, mathematical precision. We aspire to go beyond generic horoscopes by fostering an intuitive environment where timeless Vedic wisdom meets modern analytical clarity. Our focus is on creating lasting value for our users, transforming astrological consultation into a journey of conscious decision-making.
            </p>

            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              We are committed to delivering:
            </p>

            <ul className={`space-y-3 pl-2 text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A050] font-bold">•</span>
                <span>
                  <strong>Swiss Ephemeris Precision:</strong> Sub-arcsecond astronomical calculations aligned with NASA Jet Propulsion Laboratory standards and verified sidereal ayanamshas.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A050] font-bold">•</span>
                <span>
                  <strong>Authentic Canonical Jyotish:</strong> Faithful adherence to Brihat Parashara Hora Shastra, Jaimini Sutras, KP System, and classical Panchang algorithms.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A050] font-bold">•</span>
                <span>
                  <strong>Comprehensive Kundli &amp; Milestones:</strong> In-depth divisional charts (D1 to D60), Vimshottari Mahadasha forecasting, and 25-Year Vedic Destiny Roadmaps.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A050] font-bold">•</span>
                <span>
                  <strong>Privacy &amp; Ethical Integrity:</strong> 100% zero data monetization, strict confidential encryption, and ethical advisory practices without fear-mongering.
                </span>
              </li>
            </ul>

            <h2
              className={`text-2xl font-serif font-bold pt-4 mb-2 ${
                isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'
              }`}
            >
              Our Vision
            </h2>

            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              We envision a world where ancient Eastern astronomy and Western computational rigor work harmoniously. Every human deserves effortless access to their authentic stellar blueprint with complete transparency, verified planetary positions, and practical Vedic remedies.
            </p>
          </article>
        )}

        {/* ================= PAGE: FAQ ================= */}
        {view === 'faq' && (
          <article className="space-y-6 [&_p]:text-justify [&_li]:text-justify">
            <h1
              className={`text-3xl sm:text-4xl font-serif font-bold text-center mb-8 ${
                isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'
              }`}
            >
              Frequently Asked Questions
            </h1>

            <p className={`text-sm sm:text-base leading-relaxed mb-6 text-center ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              Find clear answers to common questions about our calculations, Kundli accuracy, matchmaking, and account security.
            </p>

            <div className="space-y-4 pt-2">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className={`border-b pb-4 transition-colors ${
                      isLight ? 'border-[#EADBBE]' : 'border-[#2A2A34]'
                    }`}
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between py-2 text-left cursor-pointer focus:outline-none"
                    >
                      <span
                        className={`text-base sm:text-lg font-serif font-semibold pr-4 ${
                          isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'
                        }`}
                      >
                        {faq.q}
                      </span>
                      <div
                        className={`w-6 h-6 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-[#C9A050]' : 'text-gray-400'
                        }`}
                      >
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </button>
                    {isOpen && (
                      <p className={`pt-2 text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </article>
        )}

        {/* ================= PAGE: PRIVACY POLICY ================= */}
        {view === 'privacy-policy' && (
          <article className="space-y-6 [&_p]:text-justify [&_li]:text-justify">
            <h1
              className={`text-3xl sm:text-4xl font-serif font-bold text-center mb-2 ${
                isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'
              }`}
            >
              Privacy Policy
            </h1>
            <p className="text-center text-xs text-gray-500 mb-8">
              Effective Date: September 2026 • Compliant with DPDP Act &amp; GDPR
            </p>

            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              At AstroJunction, accessible from astrojunction.com, the privacy of our visitors and registered users is of utmost importance to us. This Privacy Policy document outlines the types of personal and astrological information that is collected and recorded by AstroJunction and how we utilize and safeguard it.
            </p>

            <h2 className={`text-xl font-serif font-bold pt-4 mb-2 ${isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'}`}>
              1. Information We Collect
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              In order to generate mathematically accurate Vedic horoscopes and astrological reports, we collect:
            </p>
            <ul className={`space-y-2 pl-2 text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A050] font-bold">•</span>
                <span><strong>Astrological Data:</strong> Full Name, Gender, Date of Birth, Time of Birth, and Place of Birth (latitude, longitude, and timezone).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A050] font-bold">•</span>
                <span><strong>Account Details:</strong> Email address, encrypted login passwords, and optional user profile preferences.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A050] font-bold">•</span>
                <span><strong>Communication Records:</strong> Questions submitted during 1-on-1 astrologer consultations.</span>
              </li>
            </ul>

            <h2 className={`text-xl font-serif font-bold pt-4 mb-2 ${isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'}`}>
              2. How We Use Your Information
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              Your birth data is used exclusively to compute planetary positions, divisional charts (D1 to D60), Mahadasha periods, and Panchang calendars. <strong>We do not sell, rent, or trade your personal information to third-party ad networks or brokers under any circumstances.</strong>
            </p>

            <h2 className={`text-xl font-serif font-bold pt-4 mb-2 ${isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'}`}>
              3. Data Security &amp; Encryption
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              We implement industry-standard 256-bit TLS encryption for all data transmitted between your browser and our servers. User records are stored behind secured cloud firewalls with strict role-based access control.
            </p>

            <h2 className={`text-xl font-serif font-bold pt-4 mb-2 ${isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'}`}>
              4. Your Data Rights &amp; Deletion
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              You hold complete ownership of your birth information. You may request an export or permanent deletion of your account and all associated Kundlis at any time by contacting our support desk.
            </p>
          </article>
        )}

        {/* ================= PAGE: COOKIE POLICY ================= */}
        {view === 'cookie-policy' && (
          <article className="space-y-6 [&_p]:text-justify [&_li]:text-justify">
            <h1
              className={`text-3xl sm:text-4xl font-serif font-bold text-center mb-2 ${
                isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'
              }`}
            >
              Cookie Policy
            </h1>
            <p className="text-center text-xs text-gray-500 mb-8">
              Effective Date: September 2026 • Transparent Cookie Practices
            </p>

            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              This Cookie Policy explains how AstroJunction uses cookies and similar technologies to remember your preferences and provide a smooth, responsive astrological experience.
            </p>

            <h2 className={`text-xl font-serif font-bold pt-4 mb-2 ${isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'}`}>
              1. What Are Cookies?
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work efficiently, as well as to provide information to the site owners.
            </p>

            <h2 className={`text-xl font-serif font-bold pt-4 mb-2 ${isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'}`}>
              2. How AstroJunction Uses Cookies
            </h2>
            <ul className={`space-y-3 pl-2 text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A050] font-bold">•</span>
                <span>
                  <strong>Essential Cookies:</strong> Necessary for user authentication, security tokens, and maintaining active login sessions.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A050] font-bold">•</span>
                <span>
                  <strong>Preference Cookies:</strong> Remember your chosen theme (light or dark mode), language, and preferred astrological traditions.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A050] font-bold">•</span>
                <span>
                  <strong>Performance &amp; Cache:</strong> Enable instant offline rendering of precomputed chart geometries and planetary ephemeris tables.
                </span>
              </li>
            </ul>

            <h2 className={`text-xl font-serif font-bold pt-4 mb-2 ${isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'}`}>
              3. Managing Your Cookies
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              Most web browsers allow you to control cookies through their browser settings. You may choose to disable cookies, but please note that certain features of AstroJunction (such as profile logins) may not function properly without them.
            </p>
          </article>
        )}

        {/* ================= PAGE: TERMS & CONDITIONS ================= */}
        {view === 'terms-and-conditions' && (
          <article className="space-y-6 [&_p]:text-justify [&_li]:text-justify">
            <h1
              className={`text-3xl sm:text-4xl font-serif font-bold text-center mb-2 ${
                isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'
              }`}
            >
              Terms &amp; Conditions
            </h1>
            <p className="text-center text-xs text-gray-500 mb-8">
              Effective Date: September 2026 • Please read carefully before using AstroJunction
            </p>

            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              Welcome to AstroJunction. By accessing or using our website, services, and reports, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our platform.
            </p>

            <h2 className={`text-xl font-serif font-bold pt-4 mb-2 ${isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'}`}>
              1. Nature of Astrological Services
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              Astrological readings, planetary forecasts, Kundli analyses, and consultation recommendations provided by AstroJunction are intended solely for spiritual guidance, personal contemplation, and educational purposes. <strong>Astrology is not an exact empirical science and should never substitute for professional medical, legal, psychological, or financial advice.</strong>
            </p>

            <h2 className={`text-xl font-serif font-bold pt-4 mb-2 ${isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'}`}>
              2. User Accounts &amp; Conduct
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              You are responsible for maintaining the confidentiality of your account credentials. You agree to provide true and accurate birth details for yourself and any family members for whom you generate charts.
            </p>

            <h2 className={`text-xl font-serif font-bold pt-4 mb-2 ${isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'}`}>
              3. Astrologer Consultations
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              Consultations with our panel of certified Vedic astrologers must adhere to mutual respect and decorum. Any abusive, offensive, or inappropriate behavior during live sessions may result in immediate termination of the session without refund.
            </p>

            <h2 className={`text-xl font-serif font-bold pt-4 mb-2 ${isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'}`}>
              4. Intellectual Property
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              All algorithms, software architectures, written articles, visual designs, and reports published on AstroJunction are the intellectual property of AstroJunction and protected by copyright laws.
            </p>

            <h2 className={`text-xl font-serif font-bold pt-4 mb-2 ${isLight ? 'text-[#1E1B15]' : 'text-[#FAF5E8]'}`}>
              5. Limitation of Liability
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-[#4A453F]' : 'text-[#B8B4C2]'}`}>
              AstroJunction, its founders, and consulting astrologers shall not be held liable for any decisions, actions, or outcomes undertaken by users based on interpretations of planetary charts or predictions.
            </p>
          </article>
        )}
        </div>
      </div>
    </div>
  );
};
