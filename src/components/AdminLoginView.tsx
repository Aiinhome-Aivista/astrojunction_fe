import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { login, AuthUser } from '../services/authApi';
import { ApiError } from '../services/api';

interface AdminLoginViewProps {
  onAuthenticated: (user: AuthUser) => void;
  theme?: 'light' | 'dark';
}

export function AdminLoginView({ onAuthenticated, theme = 'dark' }: AdminLoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isDark = theme === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      // Let the main App handle redirect if role is admin
      if (user.role === 'admin') {
        onAuthenticated(user);
      } else {
        setError('Unauthorized: Admin access only.');
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during admin login.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center font-sans relative overflow-hidden ${isDark ? 'bg-[#0D0D0F]' : 'bg-[#F0ECE1]'}`}>
      {/* Universal Astrologer Background (Babaji image) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute inset-0 bg-no-repeat bg-cover bg-center transition-opacity duration-700 ${isDark ? 'opacity-[0.35]' : 'opacity-[0.20]'}`}
          style={{
            backgroundImage: 'url(/astrologer_bg.jpg)',
            backgroundPosition: 'center center'
          }}
        ></div>
        <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-transparent ${isDark ? 'to-[#0D0D0F]/90' : 'to-[#F0ECE1]/90'}`}></div>
      </div>

      <div className={`w-full max-w-md p-8 sm:p-10 rounded-3xl border-2 shadow-2xl relative z-10 overflow-hidden ${
        isDark ? 'bg-[#141418] border-[#C9A050]/40 shadow-black/80' : 'bg-white border-[#C9A050]/50 shadow-amber-900/15'
      }`}>
        <div className="relative z-10 flex flex-col items-center mb-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 shadow-xl mb-4 ${
            isDark ? 'bg-[#1A1A1E] border-[#C9A050]/50' : 'bg-[#FAF8F4] border-[#C9A050]/60'
          }`}>
            <ShieldCheck className="w-8 h-8 text-[#C9A050]" />
          </div>
          <h2 className={`text-2xl font-serif font-black tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
            Admin Login
          </h2>
          <p className={`text-xs mt-2 text-center font-medium ${isDark ? 'text-[#E5E1D8]' : 'text-gray-800'}`}>
            Secure dashboard access for AstroJunction administrators.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/15 border-2 border-rose-500/50 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-black'}`}>
              Admin Email
            </label>
            <div className="relative">
              <Mail className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#C9A050]' : 'text-[#8C6218]'}`} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@astrojunction.in"
                className={`w-full pl-10 pr-3 py-2.5 rounded-xl text-sm font-medium focus:outline-none transition border-2 ${
                  isDark
                    ? 'bg-[#1A1A1E] border-[#333338] text-white placeholder-gray-500 focus:border-[#C9A050] focus:bg-[#202026]'
                    : 'bg-[#FAF8F4] border-[#DCD3C1] text-black placeholder-gray-500 focus:border-[#C9A050] focus:bg-white'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-black'}`}>
              Admin Password
            </label>
            <div className="relative">
              <Lock className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#C9A050]' : 'text-[#8C6218]'}`} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-sm font-medium focus:outline-none transition border-2 ${
                  isDark
                    ? 'bg-[#1A1A1E] border-[#333338] text-white placeholder-gray-500 focus:border-[#C9A050] focus:bg-[#202026]'
                    : 'bg-[#FAF8F4] border-[#DCD3C1] text-black placeholder-gray-500 focus:border-[#C9A050] focus:bg-white'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer transition-colors ${
                  isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
                }`}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className={`w-full mt-2 py-3 rounded-xl font-black text-sm flex items-center justify-center space-x-2 transition-all shadow-xl cursor-pointer disabled:opacity-60 ${
              isDark
                ? 'bg-gradient-to-r from-[#F5CA53] to-[#DFB03E] hover:from-[#FCD768] hover:to-[#E8BE55] text-black shadow-[#F5CA53]/25 hover:shadow-[#F5CA53]/40'
                : 'bg-gradient-to-r from-[#F7D36D] via-[#F3C54E] to-[#EBB738] hover:from-[#FAE08B] hover:to-[#F3C54E] text-black shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35 border border-[#D4A328]'
            }`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : null}
            <span className="text-black font-black">Access Dashboard</span>
            {!loading ? <ArrowRight className="w-4 h-4 text-black" /> : null}
          </button>
        </form>
        
        <div className="mt-8 text-center relative z-10">
          <a href="/" className={`text-xs font-bold hover:underline transition ${isDark ? 'text-[#C9A050] hover:text-white' : 'text-[#8C6218] hover:text-black'}`}>
            &larr; Return to AstroJunction Home
          </a>
        </div>
      </div>
    </div>
  );
}
