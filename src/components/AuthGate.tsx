
import React, { useState, useEffect, useRef } from 'react';
import { Lock, Mail, User, Loader2, Sparkles, X, ShieldCheck, RotateCcw, Calendar, MapPin, AlertCircle, Plus, CheckCircle2, Clock, Eye, EyeOff, ChevronDown, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { login, register, loginWithGoogle, AuthUser } from '../services/authApi';
import { ApiError } from '../services/api';
import { AncientTraditionLogo } from './AncientTraditionLogo';


interface AuthGateProps {
  isOpen?: boolean;
  onClose?: () => void;
  onAuthenticated: (user: AuthUser, registrationDetails?: { gender?: string; birthDate?: string; birthPlace?: string; birthTime?: string }) => void;
  initialMode?: 'login' | 'register';
  theme?: 'light' | 'dark';
}

const CITIES_LIST = [
  'Kolkata, West Bengal, India',
  'New Delhi, Delhi, India',
  'Mumbai, Maharashtra, India',
  'Bengaluru, Karnataka, India',
  'Chennai, Tamil Nadu, India',
  'Hyderabad, Telangana, India',
  'Ahmedabad, Gujarat, India',
  'Pune, Maharashtra, India',
  'Jaipur, Rajasthan, India',
  'Lucknow, Uttar Pradesh, India',
  'Patna, Bihar, India',
  'Guwahati, Assam, India',
  'Bhubaneswar, Odisha, India',
  'Siliguri, West Bengal, India',
  'Howrah, West Bengal, India',
  'Dhaka, Bangladesh',
  'Chittagong, Bangladesh',
  'Sylhet, Bangladesh',
  'London, United Kingdom',
  'New York, USA',
  'San Francisco, USA',
  'Dubai, United Arab Emirates',
  'Singapore',
  'Toronto, Canada',
  'Sydney, Australia',
];

const MONTHS = [
  { value: '01', name: 'January (01)' },
  { value: '02', name: 'February (02)' },
  { value: '03', name: 'March (03)' },
  { value: '04', name: 'April (04)' },
  { value: '05', name: 'May (05)' },
  { value: '06', name: 'June (06)' },
  { value: '07', name: 'July (07)' },
  { value: '08', name: 'August (08)' },
  { value: '09', name: 'September (09)' },
  { value: '10', name: 'October (10)' },
  { value: '11', name: 'November (11)' },
  { value: '12', name: 'December (12)' },
];

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  isDark: boolean;
  className?: string;
  dropUp?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, placeholder, isDark, className, dropUp }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className={`relative ${className || ''}`} ref={ref}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-2.5 py-1.5 border rounded-xl text-[11px] font-bold cursor-pointer flex justify-between items-center transition-colors ${isDark ? 'bg-[#1A1A1E] border-[#2A2A2E] text-white' : 'bg-[#F9F7F1] border-[#E5E1D8] text-black'
          } ${isOpen ? 'border-[#C9A050]' : ''}`}
      >
        <span className={!selectedOption ? (isDark ? 'text-gray-500' : 'text-gray-400') : ''}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform ${isOpen ? 'rotate-180 text-[#C9A050]' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: dropUp ? 5 : -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: dropUp ? 5 : -5 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-[110] left-0 right-0 max-h-[250px] overflow-y-auto border rounded-xl shadow-2xl ${dropUp ? 'bottom-full mb-1' : 'top-full mt-1'
              } ${isDark ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#FFFFFF] border-[#E5E1D8]'
              } custom-scrollbar`}
          >
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`px-3 py-2 text-[11px] font-bold cursor-pointer transition-colors ${value === opt.value
                  ? (isDark ? 'bg-[#C9A050]/20 text-[#C9A050]' : 'bg-[#C9A050]/10 text-[#8C6B28]')
                  : (isDark ? 'hover:bg-[#2A2A2E] text-white' : 'hover:bg-[#F9F7F1] text-black')
                  }`}
              >
                {opt.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface CustomTimePickerProps {
  hour: string;
  minute: string;
  ampm: string;
  onHourChange: (v: string) => void;
  onMinuteChange: (v: string) => void;
  onAmPmChange: (v: string) => void;
  isDark: boolean;
}

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({ hour, minute, ampm, onHourChange, onMinuteChange, onAmPmChange, isDark }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAmPmOpen, setIsAmPmOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsAmPmOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={ref}>
      <div
        className={`w-full flex items-center px-3 py-1.5 border rounded-xl text-xs font-medium cursor-pointer transition-colors ${isDark
          ? 'bg-[#1A1A1E] border-[#2A2A2E] text-white hover:border-[#C9A050]'
          : 'bg-[#F9F7F1] border-[#E5E1D8] text-black hover:border-[#C9A050]'
          } ${(isOpen || isAmPmOpen) ? 'border-[#C9A050]' : ''}`}
      >
        <div className="flex-1 flex items-center" onClick={() => { setIsOpen(!isOpen); setIsAmPmOpen(false); }}>
          <Clock className="w-3.5 h-3.5 text-gray-400 mr-2 shrink-0" />
          <span className="tracking-wider">{hour} : {minute}</span>
        </div>
        <div
          className={`flex items-center font-bold px-1.5 py-0.5 rounded hover:bg-black/10 transition-colors ${isDark ? 'text-[#C9A050]' : 'text-[#8C6B28]'}`}
          onClick={(e) => { e.stopPropagation(); setIsAmPmOpen(!isAmPmOpen); setIsOpen(false); }}
        >
          <span>{ampm}</span>
          <ChevronDown className={`w-3.5 h-3.5 ml-1 opacity-70 transition-transform ${isAmPmOpen ? 'rotate-180 text-[#C9A050]' : ''}`} />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-[110] left-0 w-[180px] bottom-full mb-1 flex border rounded-xl shadow-2xl overflow-hidden ${isDark ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#FFFFFF] border-[#E5E1D8]'
              }`}
          >
            {/* Hours Column */}
            <div className={`flex-1 h-48 overflow-y-auto custom-scrollbar border-r ${isDark ? 'border-[#2A2A2E]' : 'border-gray-100'}`}>
              <div className={`sticky top-0 p-1 text-center text-[10px] font-bold uppercase tracking-wider bg-opacity-90 backdrop-blur-sm ${isDark ? 'bg-[#1A1A1E] text-[#C9A050]' : 'bg-white text-[#8C6B28]'}`}>Hour</div>
              {Array.from({ length: 12 }, (_, i) => {
                const h = (i + 1).toString().padStart(2, '0');
                return (
                  <div key={h} onClick={() => onHourChange(h)} className={`p-2 text-center text-xs cursor-pointer ${hour === h ? (isDark ? 'bg-[#C9A050]/20 text-[#C9A050] font-bold' : 'bg-[#C9A050]/10 text-[#8C6B28] font-bold') : (isDark ? 'hover:bg-[#2A2A2E]' : 'hover:bg-[#F9F7F1]')}`}>
                    {h}
                  </div>
                );
              })}
            </div>

            {/* Minutes Column */}
            <div className={`flex-1 h-48 overflow-y-auto custom-scrollbar border-r ${isDark ? 'border-[#2A2A2E]' : 'border-gray-100'}`}>
              <div className={`sticky top-0 p-1 text-center text-[10px] font-bold uppercase tracking-wider bg-opacity-90 backdrop-blur-sm ${isDark ? 'bg-[#1A1A1E] text-[#C9A050]' : 'bg-white text-[#8C6B28]'}`}>Min</div>
              {Array.from({ length: 60 }, (_, i) => {
                const m = i.toString().padStart(2, '0');
                return (
                  <div key={m} onClick={() => onMinuteChange(m)} className={`p-2 text-center text-xs cursor-pointer ${minute === m ? (isDark ? 'bg-[#C9A050]/20 text-[#C9A050] font-bold' : 'bg-[#C9A050]/10 text-[#8C6B28] font-bold') : (isDark ? 'hover:bg-[#2A2A2E]' : 'hover:bg-[#F9F7F1]')}`}>
                    {m}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAmPmOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-[110] right-0 w-[80px] bottom-full mb-1 flex flex-col border rounded-xl shadow-2xl overflow-hidden ${isDark ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#FFFFFF] border-[#E5E1D8]'
              }`}
          >
            {['AM', 'PM'].map(a => (
              <div
                key={a}
                onClick={() => { onAmPmChange(a); setIsAmPmOpen(false); }}
                className={`p-2.5 text-center text-xs font-bold cursor-pointer ${ampm === a
                  ? (isDark ? 'bg-[#C9A050]/20 text-[#C9A050]' : 'bg-[#C9A050]/10 text-[#8C6B28]')
                  : (isDark ? 'hover:bg-[#2A2A2E] text-white' : 'hover:bg-[#F9F7F1] text-black')
                  }`}
              >
                {a}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function AuthGate({
  isOpen = true,
  onClose,
  onAuthenticated,
  initialMode = 'login',
  theme = 'light',
}: AuthGateProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [regStep, setRegStep] = useState<'credentials' | 'birth_details'>('credentials');
  const [registeredUser, setRegisteredUser] = useState<AuthUser | null>(null);

  // Registration Fields: Gender, Place, Date of Birth, Time of Birth
  const [gender, setGender] = useState<'male' | 'female' | 'others'>('male');
  const [birthPlace, setBirthPlace] = useState('');
  const [birthDay, setBirthDay] = useState('01');
  const [birthMonth, setBirthMonth] = useState('01');
  const [birthYear, setBirthYear] = useState('2000');
  const [birthHour, setBirthHour] = useState('12');
  const [birthMinute, setBirthMinute] = useState('00');
  const [birthAmPm, setBirthAmPm] = useState('AM');

  const getFormattedBirthTime = () => {
    if (!birthHour || !birthMinute) return undefined;
    let h = parseInt(birthHour, 10);
    if (birthAmPm === 'PM' && h < 12) h += 12;
    if (birthAmPm === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${birthMinute}`;
  };

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Captcha state
  const [captchaCode, setCaptchaCode] = useState('');
  const [userCaptchaInput, setUserCaptchaInput] = useState('');
  const birthTimeInputRef = useRef<HTMLInputElement>(null);

  const refreshCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setUserCaptchaInput('');
  };

  useEffect(() => {
    setMode(initialMode);
    setError(null);
    setSuccessMessage(null);
    setAgreeTerms(false);
    refreshCaptcha();
  }, [initialMode, isOpen]);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const handleGoogleSuccess = async (targetEmail: string, targetName: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(targetEmail.trim())) {
      setError('Please enter a valid email address (e.g. yourname@gmail.com)');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const user = await loginWithGoogle(targetEmail.trim().toLowerCase(), targetName.trim() || 'Google User');
      onAuthenticated(user, (mode === 'register') as any);
      if (onClose) onClose();
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : (err?.message || 'Google sign-in failed.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleButtonClick = () => {
    setError(null);

    const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
    const google = (window as any).google;

    if (googleClientId && google?.accounts?.oauth2) {
      try {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.error) {
              if (tokenResponse.error !== 'popup_closed_by_user') {
                setError(tokenResponse.error_description || 'Google sign-in was not completed.');
              }
              return;
            }
            if (tokenResponse?.access_token) {
              setLoading(true);
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userInfo = await res.json();
                if (userInfo?.email) {
                  await handleGoogleSuccess(userInfo.email, userInfo.name || userInfo.email.split('@')[0]);
                } else {
                  throw new Error('Could not retrieve email from Google profile.');
                }
              } catch (err: any) {
                const msg = err instanceof ApiError ? err.message : (err?.message || 'Google authentication failed.');
                setError(msg);
              } finally {
                setLoading(false);
              }
            }
          },
        });
        client.requestAccessToken();
        return;
      } catch (e) {
        console.warn('Google Token Client init error:', e);
        setError('Google sign-in initialization failed. Please try again or use email.');
        return;
      }
    }

    setError('Google Sign-In is currently unavailable. Please register or log in using email and password.');
  };

  // Generate day options 01 - 31
  const days = Array.from({ length: 31 }, (_, i) => {
    const val = (i + 1).toString().padStart(2, '0');
    return val;
  });

  // Generate year options 1940 - 2026
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1940 + 1 }, (_, i) => {
    return (currentYear - i).toString();
  });

  // Pre-compute dropdown options
  const daysOptions = days.map(d => ({ label: d, value: d }));
  const monthsOptions = MONTHS.map(m => ({ label: m.name.slice(0, 3), value: m.value }));
  const yearsOptions = years.map(y => ({ label: y, value: y }));

  const hoursOptions = Array.from({ length: 12 }, (_, i) => {
    const val = (i + 1).toString().padStart(2, '0');
    return { label: val, value: val };
  });

  const minutesOptions = Array.from({ length: 60 }, (_, i) => {
    const val = i.toString().padStart(2, '0');
    return { label: val, value: val };
  });

  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'others' }
  ];

  const amPmOptions = [
    { label: 'AM', value: 'AM' },
    { label: 'PM', value: 'PM' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Terms & Conditions validation for registration
    if (mode === 'register' && !agreeTerms) {
      setError('Please agree to the Terms & Conditions and Privacy Policy to proceed.');
      return;
    }

    // Captcha validation
    if (userCaptchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setError('Invalid Captcha code. Please enter the characters shown.');
      refreshCaptcha();
      return;
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        // 1. Create account with Name, Email, Phone (optional), and Password
        await register(email, password, fullName, undefined, {
          phone: phoneNumber.trim() || undefined,
        });

        // 2. Auto-login after registration
        const user = await login(email, password);
        onAuthenticated(user, true as any);
        if (onClose) onClose();
        return;
      }

      // Explicit login
      const user = await login(email, password);

      if (user.role === 'admin') {
        throw new Error('Admins must log in via the dedicated admin portal.');
      }

      onAuthenticated(user);

      if (onClose) onClose();
    } catch (err: any) {
      const message = err instanceof ApiError ? err.message : (err.message || 'Something went wrong. Please try again.');
      setError(message);
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="astro-modal-backdrop transition-opacity"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="astro-modal-card my-auto"
        >
          {/* Close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="astro-modal-close"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Header */}
          <div className="pb-1 flex flex-col items-center text-center shrink-0">
            <AncientTraditionLogo size="sm" isLight={!isDark} className="mb-1" />
            <h2 className="astro-heading-md tracking-wide flex items-center">
              ASTRO<span className="text-[#C9A050]">JUNCTION</span>
            </h2>
            <p className="astro-text-xs mt-0.5 astro-text-muted">
              {mode === 'login' ? 'Welcome back! Log in to continue.' : 'Create your account to unlock personalized astrological insights.'}
            </p>
          </div>

          <div className="pt-2">
            {/* Google Authentication Button */}
            <div className="mb-3 flex flex-col items-center">
              <button
                type="button"
                onClick={handleGoogleButtonClick}
                disabled={loading}
                className="astro-btn-google"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>{mode === 'login' ? 'Continue with Google' : 'Register with Google'}</span>
              </button>

              <div className="relative w-full my-2.5 flex items-center justify-center">
                <div className={`w-full border-t ${isDark ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`} />
                <span className={`absolute px-2.5 text-[9px] uppercase font-bold tracking-wider ${isDark ? 'bg-[#141418] text-[#9E9A90]' : 'bg-[#FFFFFF] text-gray-400'}`}>
                  or continue with email
                </span>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="astro-tab-group">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); setSuccessMessage(null); refreshCaptcha(); }}
                className={`astro-tab-btn ${mode === 'login' ? 'astro-tab-btn-active' : ''}`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(null); setSuccessMessage(null); setAgreeTerms(false); refreshCaptcha(); }}
                className={`astro-tab-btn ${mode === 'register' ? 'astro-tab-btn-active' : ''}`}
              >
                Register
              </button>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-2.5">
              {mode === 'register' ? (
                <div className="space-y-2.5">
                    {/* Full Name */}
                    <div>
                      <label className="astro-label">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="astro-input-icon-wrap">
                        <User className="astro-input-icon" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="astro-input"
                          placeholder="e.g. Keya Biswas"
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="astro-label">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="astro-input-icon-wrap">
                        <Mail className="astro-input-icon" />
                        <input
                          type="email"
                          required
                          autoComplete="off"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="astro-input"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    {/* Phone Number (Optional) */}
                    <div>
                      <label className="astro-label flex items-center justify-between">
                        <span>Phone Number</span>
                        <span className="text-[9px] font-normal opacity-70">(Optional)</span>
                      </label>
                      <div className="astro-input-icon-wrap">
                        <Phone className="astro-input-icon" />
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="astro-input"
                          placeholder="e.g. +91 98765 43210"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="astro-label">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="astro-input-icon-wrap">
                        <Lock className="astro-input-icon" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={8}
                          autoComplete="new-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="astro-input pr-10"
                          placeholder="Min. 8 characters"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Terms & Conditions / Privacy Policy Checkbox */}
                    <div className="pt-1">
                      <label className="flex items-start space-x-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          required
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#C9A050] focus:ring-[#C9A050] cursor-pointer"
                        />
                        <span className={`text-[11px] leading-tight ${isDark ? 'text-[#9E9A90]' : 'text-gray-600'}`}>
                          I agree to the{' '}
                          <a
                            href="/terms-and-conditions"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              sessionStorage.setItem('return_to_auth', 'register');
                              if (onClose) onClose();
                              window.history.pushState({ returnToAuth: 'register' }, '', '/terms-and-conditions');
                              window.dispatchEvent(new PopStateEvent('popstate'));
                            }}
                            className="font-semibold underline text-[#C9A050] hover:text-[#D4AF37] cursor-pointer"
                          >
                            Terms &amp; Conditions
                          </a>
                          {' '}and{' '}
                          <a
                            href="/privacy-policy"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              sessionStorage.setItem('return_to_auth', 'register');
                              if (onClose) onClose();
                              window.history.pushState({ returnToAuth: 'register' }, '', '/privacy-policy');
                              window.dispatchEvent(new PopStateEvent('popstate'));
                            }}
                            className="font-semibold underline text-[#C9A050] hover:text-[#D4AF37] cursor-pointer"
                          >
                            Privacy Policy
                          </a>
                        </span>
                      </label>
                    </div>

                    {/* Captcha Section (Compact) */}
                    <div className="pt-1 max-w-[270px]">
                      <label className="astro-label">
                        Security Verification (Captcha)
                      </label>
                      <div className="flex items-center space-x-2">
                        <div className="astro-captcha-code">
                          <span className="line-through decoration-[#C9A050]/60 decoration-2">
                            {captchaCode}
                          </span>
                          <button
                            type="button"
                            onClick={refreshCaptcha}
                            className="ml-1.5 p-0.5 rounded hover:bg-black/10 transition-colors cursor-pointer text-gray-400 hover:text-[#C9A050]"
                            title="Generate new captcha"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="astro-input-icon-wrap flex-1">
                          <ShieldCheck className="astro-input-icon" />
                          <input
                            type="text"
                            required
                            maxLength={6}
                            value={userCaptchaInput}
                            onChange={(e) => setUserCaptchaInput(e.target.value)}
                            className="astro-input"
                            placeholder="Enter code"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                /* Login 1-Column View */
                <div className="space-y-2.5">
                  {/* Email Address */}
                  <div>
                    <label className="astro-label">
                      Email Address
                    </label>
                    <div className="astro-input-icon-wrap">
                      <Mail className="astro-input-icon" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="astro-input"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="astro-label">
                      Password
                    </label>
                    <div className="astro-input-icon-wrap">
                      <Lock className="astro-input-icon" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="astro-input pr-10"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Captcha Section (Compact) */}
                  <div className="pt-1 max-w-[270px]">
                    <label className="astro-label">
                      Security Verification (Captcha)
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="astro-captcha-code">
                        <span className="line-through decoration-[#C9A050]/60 decoration-2">
                          {captchaCode}
                        </span>
                        <button
                          type="button"
                          onClick={refreshCaptcha}
                          className="ml-1.5 p-0.5 rounded hover:bg-black/10 transition-colors cursor-pointer text-gray-400 hover:text-[#C9A050]"
                          title="Generate new captcha"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="astro-input-icon-wrap flex-1">
                        <ShieldCheck className="astro-input-icon" />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={userCaptchaInput}
                          onChange={(e) => setUserCaptchaInput(e.target.value)}
                          className="astro-input"
                          placeholder="Enter code"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {successMessage && (
                <div className={`text-[11px] rounded-xl px-3 py-2 font-medium flex items-center space-x-2 border transition-all ${isDark
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  }`}>
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{successMessage}</span>
                </div>
              )}

              {error && (
                <div className="text-[11px] text-rose-500 bg-rose-500/10 border border-rose-500/30 rounded-xl px-2.5 py-1.5 font-medium">
                  {error}
                </div>
              )}

              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="astro-btn astro-btn-primary min-w-[200px] max-w-xs"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>
                    {mode === 'login'
                      ? 'Login To Continue'
                      : 'Create Free Account'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>

    </AnimatePresence>
  );
}