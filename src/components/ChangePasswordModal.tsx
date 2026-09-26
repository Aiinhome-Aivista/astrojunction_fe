import React, { useState } from 'react';
import { Key, Eye, EyeOff, Lock, CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { changePassword } from '../services/authApi';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
  userEmail?: string;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  theme,
  userEmail,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(null);
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword) {
      setError('Please enter your current password.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from your current password.');
      return;
    }

    setLoading(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      setSuccess(res?.message || 'Password changed successfully!');
      setTimeout(() => {
        handleClose();
      }, 1800);
    } catch (err: any) {
      setError(err?.message || 'Failed to change password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden transition-all duration-300 ${
          isDark
            ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8]'
            : 'bg-white border-[#DFC896]/60 text-[#0D0D0F]'
        }`}
      >
        {/* Modal Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? 'border-[#2A2A2E] bg-[#1A1A20]' : 'border-[#F0E6D2] bg-[#FAF6EE]'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#C9A050]/15 text-[#C9A050]">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold tracking-wide">
                Change <span className="text-[#C9A050]">Password</span>
              </h3>
              {userEmail && (
                <p className={`text-xs ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
                  {userEmail}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? 'text-[#9E9A90] hover:bg-[#25252D] hover:text-white'
                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-500 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Current Password */}
          <div className="space-y-1.5">
            <label className={`block text-xs font-semibold ${isDark ? 'text-[#C9A050]' : 'text-[#8C6218]'}`}>
              Current Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className={`w-full pl-9 pr-10 py-2.5 rounded-xl text-xs border outline-none transition-all ${
                  isDark
                    ? 'bg-[#1C1C22] border-[#2A2A2E] text-white focus:border-[#C9A050]'
                    : 'bg-white border-[#DFC896] text-gray-900 focus:border-[#C9A050]'
                }`}
                disabled={loading || !!success}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 cursor-pointer"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className={`block text-xs font-semibold ${isDark ? 'text-[#C9A050]' : 'text-[#8C6218]'}`}>
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className={`w-full pl-9 pr-10 py-2.5 rounded-xl text-xs border outline-none transition-all ${
                  isDark
                    ? 'bg-[#1C1C22] border-[#2A2A2E] text-white focus:border-[#C9A050]'
                    : 'bg-white border-[#DFC896] text-gray-900 focus:border-[#C9A050]'
                }`}
                disabled={loading || !!success}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 cursor-pointer"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <label className={`block text-xs font-semibold ${isDark ? 'text-[#C9A050]' : 'text-[#8C6218]'}`}>
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className={`w-full pl-9 pr-10 py-2.5 rounded-xl text-xs border outline-none transition-all ${
                  isDark
                    ? 'bg-[#1C1C22] border-[#2A2A2E] text-white focus:border-[#C9A050]'
                    : 'bg-white border-[#DFC896] text-gray-900 focus:border-[#C9A050]'
                }`}
                disabled={loading || !!success}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 cursor-pointer"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className={`px-4 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                isDark
                  ? 'border-[#2A2A2E] text-[#9E9A90] hover:bg-[#1C1C22]'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !!success}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#C9A050] text-[#0D0D0F] hover:bg-[#D4AF37] transition-all shadow-md shadow-[#C9A050]/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
