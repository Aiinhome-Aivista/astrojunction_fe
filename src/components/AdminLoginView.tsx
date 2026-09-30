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
    <div className={`min-h-screen flex items-center justify-center font-sans ${isDark ? 'bg-[#0D0D0F]' : 'bg-[#F0ECE1]'}`}>
      <div className={`w-full max-w-md p-8 sm:p-10 rounded-3xl border shadow-2xl relative overflow-hidden ${
        isDark ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-white border-[#E5E1D8]'
      }`}>
        <div className={`absolute -top-32 -right-32 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none ${isDark ? 'bg-[#C9A050]' : 'bg-[#8C6218]'}`} />
        <div className={`absolute -bottom-32 -left-32 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none ${isDark ? 'bg-amber-600' : 'bg-amber-700'}`} />
        
        <div className="relative z-10 flex flex-col items-center mb-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-xl mb-4 ${
            isDark ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#FAF8F4] border-[#E5E1D8]'
          }`}>
            <ShieldCheck className="w-8 h-8 text-[#C9A050]" />
          </div>
          <h2 className={`text-2xl font-serif font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Admin Login
          </h2>
          <p className={`text-xs mt-2 text-center ${isDark ? 'text-[#9E9A90]' : 'text-gray-600'}`}>
            Secure dashboard access for AstroJunction administrators.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold flex items-center justify-center text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-[#E5E1D8]' : 'text-gray-700'}`}>
              Admin Email
            </label>
            <div className="relative">
              <Mail className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@astrojunction.in"
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-sm focus:outline-none transition border ${
                  isDark
                    ? 'bg-[#1A1A1E] border-[#2A2A2E] text-white focus:border-[#C9A050]'
                    : 'bg-[#FAF8F4] border-[#E5E1D8] text-gray-900 focus:border-[#C9A050] focus:bg-white'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-[#E5E1D8]' : 'text-gray-700'}`}>
              Admin Password
            </label>
            <div className="relative">
              <Lock className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-9 pr-10 py-2.5 rounded-xl text-sm focus:outline-none transition border ${
                  isDark
                    ? 'bg-[#1A1A1E] border-[#2A2A2E] text-white focus:border-[#C9A050]'
                    : 'bg-[#FAF8F4] border-[#E5E1D8] text-gray-900 focus:border-[#C9A050] focus:bg-white'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition-colors ${
                  isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#C9A050] to-[#8C6B28] hover:from-[#D4AF37] hover:to-[#A37B2F] text-white font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#C9A050]/20 disabled:opacity-60 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>Access Dashboard</span>
            {!loading ? <ArrowRight className="w-4 h-4" /> : null}
          </button>
        </form>
        
        <div className="mt-8 text-center relative z-10">
          <a href="/" className={`text-xs font-medium hover:underline transition ${isDark ? 'text-[#9E9A90] hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
            &larr; Return to AstroJunction Home
          </a>
        </div>
      </div>
    </div>
  );
}
