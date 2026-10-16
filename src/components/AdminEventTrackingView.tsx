import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Layers,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Copy,
  Check,
  User,
  Smartphone,
  Laptop,
  Tablet,
  Shield,
  Compass,
  HeartHandshake,
  Hash,
  CreditCard,
  Cpu,
  FileText,
  Sparkles,
  Terminal,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import {
  adminApi,
  TelemetryStats,
  TelemetrySession,
  TelemetryEvent,
  SessionTimeline,
} from '../services/adminApi';
import {
  getSessionTimeoutMinutes,
  setSessionTimeoutMinutes,
} from '../services/sessionTracker';

interface AdminEventTrackingViewProps {
  theme: 'dark' | 'light';
}

export const AdminEventTrackingView: React.FC<AdminEventTrackingViewProps> = ({ theme }) => {
  // Configurable session timeout policy (persisted)
  const [timeoutMinutes, setTimeoutMinutes] = useState<number>(getSessionTimeoutMinutes());

  // Main view state
  const [stats, setStats] = useState<TelemetryStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Sessions list state
  const [sessions, setSessions] = useState<TelemetrySession[]>([]);
  const [sessionsTotal, setSessionsTotal] = useState(0);
  const [sessionsPage, setSessionsPage] = useState(1);
  const [sessionsTotalPages, setSessionsTotalPages] = useState(1);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals
  const [inspectedEvent, setInspectedEvent] = useState<TelemetryEvent | null>(null);
  const [selectedTimelineSessionId, setSelectedTimelineSessionId] = useState<string | null>(null);
  const [timelineData, setTimelineData] = useState<SessionTimeline | null>(null);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Fetch KPI Stats
  const loadStats = async (timeout = timeoutMinutes) => {
    try {
      const data = await adminApi.getTelemetryStats({ timeout_minutes: timeout });
      setStats(data);
    } catch (err) {
      console.error('Failed to load telemetry stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch User Sessions Stream
  const loadSessions = async (page = sessionsPage, timeout = timeoutMinutes) => {
    setLoadingSessions(true);
    try {
      const res = await adminApi.getTelemetrySessions({
        page,
        page_size: 20,
        search: searchQuery,
        status: selectedStatus,
        timeout_minutes: timeout,
      });
      setSessions(res.sessions || []);
      setSessionsTotal(res.total || 0);
      setSessionsPage(res.page || 1);
      setSessionsTotalPages(res.total_pages || 1);
    } catch (err) {
      console.error('Failed to load telemetry sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  // Handle timeout policy change
  const handleTimeoutChange = (newMinutes: number) => {
    setTimeoutMinutes(newMinutes);
    setSessionTimeoutMinutes(newMinutes);
    loadStats(newMinutes);
    loadSessions(1, newMinutes);
  };

  // Refresh all current data
  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    await Promise.all([loadStats(timeoutMinutes), loadSessions(sessionsPage, timeoutMinutes)]);
    setIsRefreshing(false);
  };

  // Initial load
  useEffect(() => {
    loadStats(timeoutMinutes);
  }, []);

  // When filters change
  useEffect(() => {
    loadSessions(1, timeoutMinutes);
  }, [selectedStatus]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      loadSessions(1, timeoutMinutes);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);


  // Load session timeline when selected
  useEffect(() => {
    if (!selectedTimelineSessionId) {
      setTimelineData(null);
      return;
    }
    const fetchTimeline = async () => {
      setLoadingTimeline(true);
      try {
        const data = await adminApi.getSessionTimeline(selectedTimelineSessionId);
        setTimelineData(data);
      } catch (err) {
        console.error('Failed to load session timeline:', err);
      } finally {
        setLoadingTimeline(false);
      }
    };
    fetchTimeline();
  }, [selectedTimelineSessionId]);

  // Helpers for icons and styles
  const getCategoryIcon = (category: string) => {
    const cat = (category || '').toUpperCase();
    if (cat.includes('ASTRO')) return <Compass className="w-3.5 h-3.5 text-amber-500" />;
    if (cat.includes('AI') || cat.includes('CHAT')) return <Cpu className="w-3.5 h-3.5 text-purple-500" />;
    if (cat.includes('NUMERO')) return <Hash className="w-3.5 h-3.5 text-blue-500" />;
    if (cat.includes('BILL') || cat.includes('PAY')) return <CreditCard className="w-3.5 h-3.5 text-emerald-500" />;
    if (cat.includes('AUTH')) return <Shield className="w-3.5 h-3.5 text-indigo-500" />;
    if (cat.includes('REPORT')) return <FileText className="w-3.5 h-3.5 text-rose-500" />;
    return <Sparkles className="w-3.5 h-3.5 text-yellow-500" />;
  };

  const getDeviceIcon = (device: string | null) => {
    const d = (device || '').toLowerCase();
    if (d.includes('mobile')) return <Smartphone className="w-3.5 h-3.5 text-blue-400" />;
    if (d.includes('tablet')) return <Tablet className="w-3.5 h-3.5 text-purple-400" />;
    return <Laptop className="w-3.5 h-3.5 text-emerald-400" />;
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'SUCCESS') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
          <CheckCircle2 className="w-3 h-3" /> SUCCESS
        </span>
      );
    }
    if (s === 'FAILURE') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-500 border border-rose-500/30">
          <XCircle className="w-3 h-3" /> FAILED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
        <Clock className="w-3 h-3" /> {s}
      </span>
    );
  };

  const formatJson = (data: any): string => {
    if (!data) return 'None';
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return data;
      }
    }
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  const formatISTDateTime = (dateInput?: string | Date | null): { time: string; date: string; full: string } => {
    if (!dateInput) return { time: '--', date: '--', full: '--' };
    try {
      let d: Date;
      if (typeof dateInput === 'string') {
        let clean = dateInput.trim();
        if (clean.endsWith(' GMT')) {
          clean = clean.replace(' GMT', '');
        }
        if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/.test(clean)) {
          clean = clean.replace(' ', 'T') + '+05:30';
        }
        d = new Date(clean);
      } else {
        d = dateInput;
      }

      if (isNaN(d.getTime())) {
        return { time: String(dateInput), date: '', full: String(dateInput) };
      }

      const time = d.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      const date = d.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      return { time: `${time} IST`, date, full: `${date}, ${time} IST` };
    } catch {
      return { time: String(dateInput), date: '', full: String(dateInput) };
    }
  };

  const getEventUserDisplay = (evt: TelemetryEvent) => {
    const devType = evt.device_type ? (evt.device_type.charAt(0).toUpperCase() + evt.device_type.slice(1)) : 'Desktop';
    if (evt.user_email) {
      return {
        name: evt.user_name || evt.user_email,
        subtext: evt.user_email,
        device: devType,
        isRegistered: true,
      };
    }
    // Check if input_payload has name or email from seeker calculations
    let payloadObj: any = null;
    if (evt.input_payload) {
      try {
        payloadObj = typeof evt.input_payload === 'string' ? JSON.parse(evt.input_payload) : evt.input_payload;
      } catch {}
    }
    const payloadName = payloadObj?.fullName || payloadObj?.name;
    const payloadEmail = payloadObj?.email;

    if (payloadName) {
      return {
        name: payloadName,
        subtext: payloadEmail || '',
        device: devType,
        isRegistered: Boolean(payloadEmail),
      };
    }

    if (payloadEmail) {
      return {
        name: payloadEmail,
        subtext: '',
        device: devType,
        isRegistered: true,
      };
    }

    return {
      name: 'Guest Seeker',
      subtext: '',
      device: devType,
      isRegistered: false,
    };
  };

  const getSessionUserDisplay = (sess: TelemetrySession) => {
    const devType = sess.device_type ? (sess.device_type.charAt(0).toUpperCase() + sess.device_type.slice(1)) : 'Desktop';
    if (sess.user_email) {
      return {
        name: sess.user_name || sess.user_email,
        subtext: sess.user_email,
        device: devType,
        isRegistered: Boolean(sess.user_id),
      };
    }
    if (sess.user_name) {
      return {
        name: sess.user_name,
        subtext: '',
        device: devType,
        isRegistered: Boolean(sess.user_id),
      };
    }
    return {
      name: sess.user_id ? `User #${sess.user_id}` : 'Guest Seeker',
      subtext: '',
      device: devType,
      isRegistered: Boolean(sess.user_id),
    };
  };

  const getTimelineUserDisplay = (data: any): { name: string; subtext: string } => {
    if (!data) return { name: 'Guest Seeker', subtext: '' };
    if (data.user_name) return { name: data.user_name, subtext: data.user_email || '' };
    if (data.user_email) return { name: data.user_email, subtext: '' };

    if (data.events && Array.isArray(data.events)) {
      for (const evt of data.events) {
        if (evt.input_payload) {
          try {
            const p = typeof evt.input_payload === 'string' ? JSON.parse(evt.input_payload) : evt.input_payload;
            const name = p?.fullName || p?.name;
            const email = p?.email;
            if (name) return { name, subtext: email || '' };
            if (email) return { name: email, subtext: '' };
          } catch {}
        }
      }
    }

    if (data.user_id) return { name: `User #${data.user_id}`, subtext: '' };
    return { name: 'Guest Seeker', subtext: '' };
  };

  const cardClasses = `relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 shadow-sm ${
    theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-white border-[#E5E1D8] text-[#0D0D0F]'
  }`;

  const tableClasses = `w-full text-left text-xs ${
    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
  }`;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="astro-page-header-title flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-[#C9A050]" />
            USER SESSIONS
          </h2>
          <p className={`mt-1 text-xs font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Real-time audit of user sessions, initiated calculations, payloads, and results.
          </p>
        </div>

        {/* Refresh Control */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#C9A050] text-[#0D0D0F] hover:bg-[#D4AF37] transition shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* 1. Active Sessions Now */}
        <div className={cardClasses}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">Live Active</span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="mt-2 text-3xl font-extrabold font-serif text-emerald-400">
            {loadingStats ? '...' : stats?.active_sessions_now || 0}
          </div>
          <div className="text-[10px] text-gray-400 mt-1">Active in last {timeoutMinutes}m</div>
        </div>

        {/* 2. Total Events Today */}
        <div className={cardClasses}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">Events Today</span>
            <Activity className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="mt-2 text-3xl font-extrabold font-serif text-[#C9A050]">
            {loadingStats ? '...' : stats?.total_events_today || 0}
          </div>
          <div className="text-[10px] text-gray-400 mt-1">Actions triggered</div>
        </div>

        {/* 3. Success Rate */}
        <div className={cardClasses}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">Success Rate</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="mt-2 text-3xl font-extrabold font-serif text-blue-400">
            {loadingStats ? '...' : `${stats?.success_rate || 100}%`}
          </div>
          <div className="text-[10px] text-gray-400 mt-1">Execution reliability</div>
        </div>

        {/* 4. Errors Today */}
        <div className={cardClasses}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500">Failed Events</span>
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className={`mt-2 text-3xl font-extrabold font-serif ${stats?.failed_events_today ? 'text-rose-500' : 'text-gray-400'}`}>
            {loadingStats ? '...' : stats?.failed_events_today || 0}
          </div>
          <div className="text-[10px] text-gray-400 mt-1">Errors captured</div>
        </div>

        {/* 5. Successful Events */}
        <div className={cardClasses}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Successful</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-2 text-3xl font-extrabold font-serif text-emerald-400">
            {loadingStats ? '...' : Math.max(0, (stats?.total_events_today || 0) - (stats?.failed_events_today || 0))}
          </div>
          <div className="text-[10px] text-gray-400 mt-1">Actions executed</div>
        </div>

        {/* 6. All-Time Sessions */}
        <div className={cardClasses}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Total Sessions</span>
            <User className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="mt-2 text-3xl font-extrabold font-serif text-indigo-400">
            {loadingStats ? '...' : stats?.total_all_time_sessions || 0}
          </div>
          <div className="text-[10px] text-gray-400 mt-1">Registered &amp; Guest visits</div>
        </div>
      </div>

      {/* ── Filters & Search Bar with Compact Timeout Box ── */}
      <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-white border-[#E5E1D8]'} flex flex-wrap items-center gap-3 shadow-sm`}>
        {/* Search */}
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by user name, email, action, or session ID..."
            className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border outline-none transition ${
              theme === 'dark'
                ? 'bg-[#1C1C22] border-[#2A2A2E] text-white focus:border-[#C9A050]'
                : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#C9A050]'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${
                theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'
              }`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Small Inactivity Timeout Text Box (Easily editable in future) */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">Session Timeout:</span>
          <div className="flex items-center">
            <input
              type="number"
              min={1}
              max={1440}
              value={timeoutMinutes || ''}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val > 0) {
                  handleTimeoutChange(val);
                } else {
                  setTimeoutMinutes(0);
                }
              }}
              onBlur={() => {
                if (!timeoutMinutes || timeoutMinutes < 1) {
                  handleTimeoutChange(10);
                }
              }}
              title="Session inactivity window in minutes (A new session is created after this duration of inactivity)"
              aria-label="Session Inactivity Timeout in minutes"
              className={`w-14 px-2 py-2 rounded-l-xl text-xs font-bold text-center border-y border-l outline-none transition ${
                theme === 'dark'
                  ? 'bg-[#1C1C22] border-[#2A2A2E] text-[#C9A050] focus:border-[#C9A050]'
                  : 'bg-gray-50 border-gray-200 text-amber-950 focus:border-[#C9A050]'
              }`}
            />
            <span className={`px-2 py-2 text-xs font-semibold rounded-r-xl border border-l-0 ${
              theme === 'dark' ? 'bg-[#2A2A2E] border-[#2A2A2E] text-gray-300' : 'bg-gray-200 border-gray-200 text-gray-600'
            }`}>
              min
            </span>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            aria-label="Filter sessions by status"
            className={`px-3 py-2 rounded-xl text-xs border font-semibold outline-none cursor-pointer ${
              theme === 'dark'
                ? 'bg-[#1C1C22] border-[#2A2A2E] text-gray-200 focus:border-[#C9A050]'
                : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-[#C9A050]'
            }`}
          >
            <option value="all">All Sessions</option>
            <option value="active">Active Now (Last {timeoutMinutes}m)</option>
            <option value="inactive">Idle / Completed</option>
            <option value="SUCCESS">With Successful Actions</option>
            <option value="FAILURE">With Errors / Failures</option>
          </select>
        </div>

        {/* Reset */}
        {(searchQuery || selectedStatus !== 'all') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedStatus('all');
            }}
            className="text-xs font-bold text-[#C9A050] hover:underline cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* ── Single Unified Sessions Table ── */}
      <div className={`rounded-2xl border overflow-hidden shadow-lg ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-white border-[#E5E1D8]'}`}>
        <div className="overflow-x-auto">
          <table className={tableClasses}>
            <thead className={`border-b text-[11px] uppercase tracking-wider font-bold ${theme === 'dark' ? 'bg-[#1C1C22] border-[#2A2A2E] text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
              <tr>
                <th className="py-3.5 px-4">Started / Last Active</th>
                <th className="py-3.5 px-4">User (Name / Email &amp; Device)</th>
                <th className="py-3.5 px-4">Session ID</th>
                <th className="py-3.5 px-4">Actions in Session</th>
                <th className="py-3.5 px-4">Session Status</th>
                <th className="py-3.5 px-4 text-right">Inspect Journey</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'dark' ? 'divide-[#2A2A2E]/50' : 'divide-gray-100'}`}>
              {loadingSessions ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#C9A050] mb-2" />
                    Loading user sessions stream...
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No matching user session records found.
                  </td>
                </tr>
              ) : (
                sessions.map((sess) => {
                  const display = getSessionUserDisplay(sess);
                  const startIST = formatISTDateTime(sess.started_at);
                  const lastActiveIST = formatISTDateTime(sess.last_activity_at);
                  const isActive = Boolean(sess.is_active);

                  return (
                    <tr
                      key={sess.id}
                      className={`transition cursor-pointer ${
                        theme === 'dark'
                          ? 'hover:bg-[#C9A050]/10'
                          : 'hover:bg-amber-100/60'
                      }`}
                      onClick={() => setSelectedTimelineSessionId(sess.id)}
                    >
                      {/* Started / Last Active */}
                      <td className={`py-3.5 px-4 whitespace-nowrap text-[11px] ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div className="flex items-center gap-1.5 font-bold font-mono">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{lastActiveIST.time}</span>
                          {isActive && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 animate-pulse">
                              Active Now
                            </span>
                          )}
                        </div>
                        <div className={`text-[10px] mt-0.5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          Started: {startIST.time} ({startIST.date})
                        </div>
                      </td>

                      {/* User (Name / Email & Device) */}
                      <td className="py-3.5 px-4">
                        <div>
                          <div className={`font-bold text-xs ${
                            display.isRegistered
                              ? (theme === 'dark' ? 'text-indigo-400' : 'text-indigo-700')
                              : (theme === 'dark' ? 'text-amber-400' : 'text-amber-800')
                          }`}>
                            {display.name}
                            {!display.isRegistered && (
                              <span className="ml-1.5 text-[9px] font-normal uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                Guest
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {display.subtext && (
                              <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {display.subtext}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                              {getDeviceIcon(sess.device_type)}
                              <span className="capitalize">{sess.device_type || 'Desktop'}</span>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Session ID */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700 font-medium'}`}>
                            {sess.id.substring(0, 14)}...
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(sess.id, `sess_${sess.id}`);
                            }}
                            className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'} cursor-pointer`}
                            title="Copy full session ID"
                          >
                            {copiedKey === `sess_${sess.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      {/* Actions in Session */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              theme === 'dark' ? 'bg-[#C9A050]/20 text-[#C9A050] border border-[#C9A050]/30' : 'bg-amber-100 text-amber-900 border border-amber-200'
                            }`}>
                              <Activity className="w-3 h-3" />
                              {sess.event_count || 1} {(sess.event_count || 1) === 1 ? 'Action' : 'Actions'}
                            </span>
                            {sess.error_count > 0 && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-500 border border-rose-500/30">
                                {sess.error_count} Err
                              </span>
                            )}
                          </div>
                          {sess.last_action && (
                            <span className={`text-[10px] font-mono truncate max-w-[170px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              Latest: <strong className={theme === 'dark' ? 'text-[#C9A050]' : 'text-amber-800'}>{sess.last_action}</strong>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Session Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            ACTIVE (Last {timeoutMinutes}m)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-500/15 text-gray-400 border border-gray-500/30">
                            <Clock className="w-3 h-3" />
                            IDLE / ENDED
                          </span>
                        )}
                      </td>

                      {/* Inspection: Eye icon opens Session Journey Timeline */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedTimelineSessionId(sess.id)}
                          title="Inspect Complete Session Journey Timeline"
                          aria-label="Inspect Journey"
                          className={`p-2 rounded-xl transition inline-flex items-center justify-center cursor-pointer shadow-sm ${
                            theme === 'dark'
                              ? 'text-[#C9A050] bg-[#C9A050]/15 hover:bg-[#C9A050] hover:text-[#0D0D0F]'
                              : 'text-[#8C6B28] bg-[#C9A050]/20 hover:bg-[#C9A050] hover:text-white'
                          }`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className={`p-4 border-t ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-gray-200'} flex items-center justify-between text-xs`}>
          <span className="text-gray-400">
            Showing page {sessionsPage} of {sessionsTotalPages} ({sessionsTotal} total sessions)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={sessionsPage <= 1}
              onClick={() => loadSessions(sessionsPage - 1)}
              className={`p-1.5 rounded-lg border disabled:opacity-30 transition cursor-pointer ${
                theme === 'dark'
                  ? 'border-[#2A2A2E] text-gray-300 hover:border-[#C9A050] hover:text-[#C9A050]'
                  : 'border-gray-300 text-gray-700 hover:border-[#C9A050] hover:text-[#8C6B28] hover:bg-amber-50'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={sessionsPage >= sessionsTotalPages}
              onClick={() => loadSessions(sessionsPage + 1)}
              className={`p-1.5 rounded-lg border disabled:opacity-30 transition cursor-pointer ${
                theme === 'dark'
                  ? 'border-[#2A2A2E] text-gray-300 hover:border-[#C9A050] hover:text-[#C9A050]'
                  : 'border-gray-300 text-gray-700 hover:border-[#C9A050] hover:text-[#8C6B28] hover:bg-amber-50'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Modal 1: Event Details & Payload Inspector (No outer scrolling) ── */}
      {inspectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${
              theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E] text-white' : 'bg-white border-[#E5E1D8] text-gray-900'
            }`}
          >
            {/* Modal Header */}
            <div className={`p-4 sm:p-5 border-b ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-gray-200'} flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#C9A050]/20 text-[#C9A050]">
                  {getCategoryIcon(inspectedEvent.event_category)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold font-mono text-[#C9A050]">{inspectedEvent.event_name}</h3>
                    {getStatusBadge(inspectedEvent.status)}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Category: <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{inspectedEvent.event_category}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectedEvent(null)}
                className={`p-2 rounded-xl transition cursor-pointer ${
                  theme === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-white/10'
                    : 'text-gray-500 hover:text-black hover:bg-gray-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Compact & Side-by-Side to eliminate outer scrolling */}
            <div className="p-5 space-y-4 overflow-hidden">
              {/* Error Banner if Failed */}
              {inspectedEvent.status === 'FAILURE' && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs">Execution Failure</div>
                    <div className="font-mono mt-0.5 text-[11px] whitespace-pre-wrap">{inspectedEvent.error_message || 'Unknown error occurred'}</div>
                  </div>
                </div>
              )}

              {/* Actor & Session Meta Card */}
              <div className={`p-3.5 rounded-xl border text-xs grid grid-cols-2 md:grid-cols-4 gap-3 ${theme === 'dark' ? 'bg-[#1C1C22] border-[#2A2A2E]' : 'bg-gray-50 border-gray-200'}`}>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">User</span>
                  <span className="font-semibold text-indigo-400">{getEventUserDisplay(inspectedEvent).name}</span>
                  <span className="text-[10px] text-gray-400 block font-mono truncate">{getEventUserDisplay(inspectedEvent).subtext}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Device</span>
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-500 mt-0.5">
                    {getDeviceIcon(inspectedEvent.device_type)}
                    <span className="capitalize">{inspectedEvent.device_type || 'Desktop'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Session ID</span>
                  <span className="font-mono truncate block" title={inspectedEvent.session_id}>
                    {inspectedEvent.session_id.substring(0, 14)}...
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Recorded At (IST)</span>
                  <span className="font-mono text-[11px]">{formatISTDateTime(inspectedEvent.created_at).full}</span>
                </div>
              </div>

              {/* Payload & Result 2-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Initiated Input Payload */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#C9A050] flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" /> Initiated Input Payload
                    </span>
                    <button
                      onClick={() => copyToClipboard(formatJson(inspectedEvent.input_payload), 'payload')}
                      className={`flex items-center gap-1 text-[11px] font-bold transition cursor-pointer ${
                        theme === 'dark' ? 'text-gray-400 hover:text-[#C9A050]' : 'text-gray-500 hover:text-[#C9A050]'
                      }`}
                    >
                      {copiedKey === 'payload' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      Copy JSON
                    </button>
                  </div>
                  <pre className={`p-3.5 rounded-xl border font-mono text-[11px] overflow-x-auto h-[220px] overflow-y-auto leading-relaxed shadow-sm transition-colors ${
                    theme === 'dark'
                      ? 'bg-[#0D0D0F] border-[#2A2A2E] text-amber-300'
                      : 'bg-[#FDFBF7] border-amber-200/80 text-[#3D2808] font-semibold'
                  }`}>
                    {formatJson(inspectedEvent.input_payload)}
                  </pre>
                </div>

                {/* 2. Output / Execution Result */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Computed Result / Output
                    </span>
                    <button
                      onClick={() => copyToClipboard(formatJson(inspectedEvent.result_summary), 'result')}
                      className={`flex items-center gap-1 text-[11px] font-bold transition cursor-pointer ${
                        theme === 'dark' ? 'text-gray-400 hover:text-emerald-400' : 'text-gray-500 hover:text-emerald-600'
                      }`}
                    >
                      {copiedKey === 'result' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      Copy Result
                    </button>
                  </div>
                  <pre className={`p-3.5 rounded-xl border font-mono text-[11px] overflow-x-auto h-[220px] overflow-y-auto leading-relaxed shadow-sm transition-colors ${
                    theme === 'dark'
                      ? 'bg-[#0D0D0F] border-[#2A2A2E] text-emerald-300'
                      : 'bg-[#F4F9F6] border-emerald-200/80 text-[#093C34] font-semibold'
                  }`}>
                    {formatJson(inspectedEvent.result_summary)}
                  </pre>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`p-3.5 sm:p-4 border-t ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-gray-200'} flex items-center justify-between`}>
              <button
                onClick={() => setSelectedTimelineSessionId(inspectedEvent.session_id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500 hover:text-white'
                    : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-600 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                View Session Journey
              </button>
              <button
                onClick={() => setInspectedEvent(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#C9A050] text-[#0D0D0F] hover:bg-[#D4AF37] transition cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 2: Session Timeline Drawer / Modal ── */}
      {selectedTimelineSessionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className={`w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${
              theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E] text-white' : 'bg-white border-[#E5E1D8] text-gray-900'
            }`}
          >
            {/* Timeline Header */}
            <div className={`p-5 border-b ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-gray-200'} flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-mono text-indigo-400">
                    User Session Journey &amp; Timeline
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Session ID: <span className={`font-mono ${theme === 'dark' ? 'text-white' : 'text-gray-900 font-bold'}`}>{selectedTimelineSessionId}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTimelineSessionId(null)}
                className={`p-2 rounded-xl transition cursor-pointer ${
                  theme === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-white/10'
                    : 'text-gray-500 hover:text-black hover:bg-gray-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Timeline Body */}
            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
              {loadingTimeline ? (
                <div className="p-12 text-center text-gray-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-400 mb-2" />
                  Loading chronological user journey...
                </div>
              ) : !timelineData ? (
                <div className="p-12 text-center text-gray-400">Session details not found.</div>
              ) : (
                <>
                  {/* Session Overview Stats */}
                  <div className={`p-4 rounded-xl border text-xs grid grid-cols-2 md:grid-cols-4 gap-4 ${theme === 'dark' ? 'bg-[#1C1C22] border-[#2A2A2E]' : 'bg-gray-50 border-gray-200'}`}>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">User</span>
                      {(() => {
                        const u = getTimelineUserDisplay(timelineData);
                        return (
                          <div>
                            <span className="font-semibold text-indigo-400 block truncate max-w-[190px]">{u.name}</span>
                            {u.subtext && <span className="text-[10px] text-gray-400 font-mono block truncate max-w-[190px]">{u.subtext}</span>}
                          </div>
                        );
                      })()}
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Device</span>
                      <div className="flex items-center gap-1 font-semibold">
                        {getDeviceIcon(timelineData.device_type)}
                        <span className="capitalize">{timelineData.device_type}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Started At (IST)</span>
                      <span className="font-mono">{formatISTDateTime(timelineData.started_at).full}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Total Actions</span>
                      <span className="font-bold text-amber-500">{timelineData.events?.length || 0} events</span>
                    </div>
                  </div>

                  {/* Vertical Stepper / Timeline */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
                      Chronological Activity Stream
                    </h4>

                    {timelineData.events?.length === 0 ? (
                      <div className="p-8 text-center text-xs text-gray-400">
                        No events logged during this session yet.
                      </div>
                    ) : (
                      <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#2A2A2E]">
                        {timelineData.events.map((evt, idx) => (
                          <div key={evt.id} className="relative group">
                            {/* Dot on line */}
                            <div className="absolute -left-[19px] top-1 w-3 h-3 rounded-full bg-[#C9A050] border-2 border-[#141418] shadow" />

                            {/* Event Card */}
                            <div className={`p-4 rounded-xl border transition ${theme === 'dark' ? 'bg-[#1C1C22] border-[#2A2A2E] hover:border-[#C9A050]/50' : 'bg-gray-50 border-gray-200'}`}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold font-mono text-xs text-[#C9A050]">
                                    #{idx + 1} {evt.event_name}
                                  </span>
                                  {getStatusBadge(evt.status)}
                                </div>
                                <div className="text-[11px] font-mono text-gray-400 flex items-center gap-2">
                                  <span>{formatISTDateTime(evt.created_at).time}</span>
                                </div>
                              </div>

                              {/* Summary / Result snippet */}
                              <div className={`p-3.5 rounded-xl border font-mono text-xs overflow-x-auto shadow-sm transition-colors ${
                                theme === 'dark'
                                  ? 'bg-[#0E0E12] border-[#2A2A2E] text-emerald-300'
                                  : 'bg-[#F4F9F6] border-emerald-200/80 text-[#093C34]'
                              }`}>
                                <div className={`text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center justify-between border-b pb-1.5 ${
                                  theme === 'dark' ? 'border-[#2A2A2E]' : 'border-emerald-200/60'
                                }`}>
                                  <span className="text-[#C9A050] flex items-center gap-1.5 font-bold">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Result Summary
                                  </span>
                                  <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>JSON</span>
                                </div>
                                <pre className={`whitespace-pre-wrap font-mono text-[11px] leading-relaxed font-semibold ${
                                  theme === 'dark' ? 'text-emerald-300' : 'text-[#093C34]'
                                }`}>
                                  {formatJson(evt.result_summary)}
                                </pre>
                              </div>

                              {/* Click to open full inspector */}
                              <div className="mt-2 text-right">
                                <button
                                  onClick={() => setInspectedEvent(evt)}
                                  className="text-[11px] font-bold text-[#C9A050] hover:underline"
                                >
                                  Inspect Full Input &amp; Output &rarr;
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Timeline Footer */}
            <div className={`p-4 border-t ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-gray-200'} flex justify-end`}>
              <button
                onClick={() => setSelectedTimelineSessionId(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#C9A050] text-[#0D0D0F] hover:bg-[#D4AF37] transition"
              >
                Close Journey
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
