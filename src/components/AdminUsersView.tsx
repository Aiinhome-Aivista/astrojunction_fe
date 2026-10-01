import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Trash2,
  AlertCircle,
  Ban,
  CheckCircle,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

import { adminApi, UserData } from '../services/adminApi';

interface AdminUsersViewProps {
  theme: 'dark' | 'light';
}

export const AdminUsersView: React.FC<AdminUsersViewProps> = ({ theme }) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchUsers = async () => {
    try {
      const data = await adminApi.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err?.message || 'Network error while loading users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtered Users based on search query
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const query = searchQuery.toLowerCase().trim();
      return (
        !query ||
        (user.full_name && user.full_name.toLowerCase().includes(query)) ||
        (user.email && user.email.toLowerCase().includes(query))
      );
    });
  }, [users, searchQuery]);

  // Reset to page 1 on search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  // Pagination computations
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredUsers.length);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const handleDelete = async (userId: string) => {
    if (
      !window.confirm(
        'CRITICAL ACTION: Are you sure you want to permanently DELETE this user? This cannot be undone.'
      )
    )
      return;

    try {
      await adminApi.deleteUser(userId);
      fetchUsers();
    } catch (error) {
      alert('Error deleting user');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Users className="w-8 h-8 text-[#C9A050] animate-spin" />
      </div>
    );
  }

  const bgClass = theme === 'dark' ? 'bg-[#141418]' : 'bg-white';
  const borderClass = theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]';
  const textClass = theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]';
  const textMutedClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-700 font-medium';

  // Generate pagination numbers array
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-3.5 animate-in fade-in duration-500 font-sans">
      {/* Top Header Row with Title & Search Section on the Right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-xl font-serif font-bold tracking-wide flex items-center gap-2">
              <Users className="w-5 h-5 text-[#C9A050]" />
              User <span className="text-[#C9A050]">Management</span>
            </h2>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                theme === 'dark'
                  ? 'bg-[#1C1A14] text-[#E8C470] border-[#C9A050]/40'
                  : 'bg-[#FAF2DA] text-[#8C6218] border-[#DFC896]'
              }`}
            >
              {users.length} Total
            </span>
          </div>
          <p className={`mt-0.5 text-xs ${textMutedClass}`}>
            Manage registered accounts, roles, access permissions, and account status.
          </p>
        </div>

        {/* Right Side: Search Bar */}
        <div className="flex items-center gap-2 sm:self-end w-full sm:w-80">
          {/* Search Input Box */}
          <div className="relative w-full">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                searchQuery ? 'text-[#C9A050]' : 'text-[#9E9A90]'
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs font-medium border outline-none transition-all ${
                theme === 'dark'
                  ? 'bg-[#1A1A1E] border-[#2A2A2E] text-[#F0ECE1] placeholder-[#9E9A90]/60 focus:border-[#C9A050] focus:ring-1 focus:ring-[#C9A050]/50'
                  : 'bg-white border-[#DFC896] text-[#1A1816] placeholder-gray-400 focus:border-[#C9A050] focus:ring-1 focus:ring-[#C9A050]/50 shadow-xs'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-2.5 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Main Table Container */}
      <div
        style={{ backgroundColor: theme === 'dark' ? '#141418' : '#FFFFFF' }}
        className={`rounded-2xl border-2 ${borderClass} overflow-hidden shadow-xl relative z-10 ${bgClass}`}
      >
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-340px)] min-h-[220px] custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr
                className={`border-b-2 ${borderClass} ${
                  theme === 'dark' ? 'bg-[#0D0D0F]' : 'bg-[#FAF8F2]'
                }`}
              >
                <th className={`px-4 py-3.5 text-xs font-bold uppercase tracking-wider ${textMutedClass}`}>
                  Name
                </th>
                <th className={`px-4 py-3.5 text-xs font-bold uppercase tracking-wider ${textMutedClass}`}>
                  Email
                </th>
                <th className={`px-4 py-3.5 text-xs font-bold uppercase tracking-wider ${textMutedClass}`}>
                  Joined
                </th>
                <th className={`px-4 py-3.5 text-xs font-bold uppercase tracking-wider ${textMutedClass}`}>
                  Role
                </th>
                <th className={`px-4 py-3.5 text-xs font-bold uppercase tracking-wider ${textMutedClass}`}>
                  Status
                </th>
                <th
                  className={`px-4 py-3.5 text-xs font-bold uppercase tracking-wider ${textMutedClass} text-right`}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                theme === 'dark' ? 'divide-[#2A2A2E]/60 bg-[#141418]' : 'divide-gray-100 bg-white'
              }`}
            >
              {paginatedUsers.map((user) => (
                <tr
                  key={user.id}
                  className={`transition-colors ${
                    theme === 'dark'
                      ? 'bg-[#141418] hover:bg-[#1C1C22]'
                      : 'bg-white hover:bg-[#FAF7F2]'
                  }`}
                >
                  <td className={`px-4 py-3.5 font-bold text-xs ${textClass}`}>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          user.role === 'admin'
                            ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                            : 'bg-amber-500/15 text-[#C9A050] border border-amber-500/30'
                        }`}
                      >
                        {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span className="truncate max-w-[160px] sm:max-w-none">{user.full_name}</span>
                    </div>
                  </td>
                  <td className={`px-4 py-3.5 text-xs font-medium ${textMutedClass}`}>
                    {user.email}
                  </td>
                  <td className={`px-4 py-3.5 text-xs font-medium ${textMutedClass}`}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      User
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        user.is_active === 1
                          ? 'bg-green-500/10 text-green-500 border-green-500/20'
                          : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}
                    >
                      {user.is_active === 1 ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <Ban className="w-3 h-3" />
                      )}
                      {user.is_active === 1 ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-1.5 rounded-lg text-red-500 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                      title="Delete User permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-1.5">
                      <Users className="w-8 h-8 text-[#9E9A90]/40" />
                      <p className={`text-xs font-semibold ${textClass}`}>
                        {searchQuery
                          ? `No users found matching "${searchQuery}"`
                          : 'No users found in the system.'}
                      </p>
                      <p className={`text-[11px] ${textMutedClass}`}>
                        {searchQuery
                          ? 'Try searching with a different keyword or clearing filters.'
                          : 'Registered users will appear here automatically.'}
                      </p>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="mt-2 px-3 py-1 text-xs font-semibold rounded-lg bg-[#C9A050]/20 text-[#C9A050] border border-[#C9A050]/40 hover:bg-[#C9A050]/30 transition"
                        >
                          Clear Search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination Bar */}
        {filteredUsers.length > 0 && (
          <div
            className={`px-4 py-3 border-t-2 ${borderClass} flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
              theme === 'dark' ? 'bg-[#0D0D0F]' : 'bg-[#FAF8F2]'
            }`}
          >
            {/* Left: Entries Counter Info & Per Page selector */}
            <div className="flex items-center space-x-3">
              <span className={textMutedClass}>
                Showing <span className="font-bold text-[#C9A050]">{startIndex + 1}</span> to{' '}
                <span className="font-bold text-[#C9A050]">{endIndex}</span> of{' '}
                <span className="font-bold">{filteredUsers.length}</span> users
              </span>

              <div className="hidden sm:flex items-center space-x-1.5">
                <span className={`text-[11px] ${textMutedClass}`}>| Per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className={`px-2 py-0.5 rounded-lg text-xs font-semibold border outline-none cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-[#1A1A1E] border-[#2A2A2E] text-[#E5E1D8]'
                      : 'bg-white border-[#DFC896] text-[#2C2825]'
                  }`}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Right: Pagination Buttons */}
            <div className="flex items-center space-x-1">
              {/* Prev Button */}
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg border text-xs font-medium flex items-center space-x-1 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  theme === 'dark'
                    ? 'bg-[#1A1A1E] border-[#2A2A2E] text-[#E5E1D8] hover:border-[#C9A050]/60'
                    : 'bg-white border-[#DFC896] text-[#2C2825] hover:border-[#C9A050]'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              {/* Numbered Page Buttons */}
              {getPageNumbers().map((p, idx) => {
                if (p === '...') {
                  return (
                    <span key={`dots-${idx}`} className={`px-2 py-1 text-xs ${textMutedClass}`}>
                      ...
                    </span>
                  );
                }
                const pageNum = p as number;
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={`page-${pageNum}`}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                      isActive
                        ? 'bg-gradient-to-r from-[#C9A050] to-[#A37B2F] text-[#0D0D0F] shadow-sm'
                        : theme === 'dark'
                        ? 'bg-[#1A1A1E] border border-[#2A2A2E] text-[#9E9A90] hover:text-[#F0ECE1] hover:border-[#C9A050]/50'
                        : 'bg-white border border-[#DFC896] text-[#5C574F] hover:text-[#1A1816] hover:border-[#C9A050]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Next Button */}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg border text-xs font-medium flex items-center space-x-1 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  theme === 'dark'
                    ? 'bg-[#1A1A1E] border-[#2A2A2E] text-[#E5E1D8] hover:border-[#C9A050]/60'
                    : 'bg-white border-[#DFC896] text-[#2C2825] hover:border-[#C9A050]'
                }`}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
