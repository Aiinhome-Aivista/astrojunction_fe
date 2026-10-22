/**
 * Session Tracker and Telemetry Service for AstroJunction.
 * Manages unique browser session IDs and logs initiated events, inputs, and results.
 * Accurately detects and passes real client public IP addresses.
 */

import { API_ENDPOINTS } from '../config/api_config';

const SESSION_STORAGE_KEY = 'jyotish_session_id';
const CLIENT_IP_STORAGE_KEY = 'jyotish_client_ip';

let cachedPublicIp: string | null = null;
let ipFetchPromise: Promise<string | null> | null = null;

export async function detectPublicIp(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  if (cachedPublicIp) return cachedPublicIp;

  try {
    const stored = sessionStorage.getItem(CLIENT_IP_STORAGE_KEY);
    if (stored && stored !== '127.0.0.1') {
      cachedPublicIp = stored;
      return stored;
    }
  } catch {}

  if (ipFetchPromise) return ipFetchPromise;

  ipFetchPromise = (async () => {
    const endpoints = [
      'https://api.ipify.org?format=json',
      'https://api.seeip.org/jsonip',
      'https://api64.ipify.org?format=json',
    ];

    for (const url of endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          const ip = data?.ip;
          if (ip && typeof ip === 'string' && ip.trim()) {
            cachedPublicIp = ip.trim();
            try {
              sessionStorage.setItem(CLIENT_IP_STORAGE_KEY, cachedPublicIp);
            } catch {}
            return cachedPublicIp;
          }
        }
      } catch {
        // try next endpoint
      }
    }
    return null;
  })();

  return ipFetchPromise;
}

export function getCachedPublicIp(): string | null {
  if (cachedPublicIp) return cachedPublicIp;
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(CLIENT_IP_STORAGE_KEY);
      if (stored && stored !== '127.0.0.1') {
        cachedPublicIp = stored;
        return stored;
      }
    } catch {}
  }
  return null;
}

// Trigger background IP detection immediately
if (typeof window !== 'undefined') {
  detectPublicIp().catch(() => {});
}

const SESSION_LAST_ACTIVE_KEY = 'jyotish_session_last_active';
const SESSION_TIMEOUT_CONFIG_KEY = 'jyotish_session_timeout_minutes';
export const DEFAULT_TIMEOUT_MINUTES = 10;

export function getSessionTimeoutMinutes(): number {
  if (typeof window === 'undefined') return DEFAULT_TIMEOUT_MINUTES;
  try {
    const val = localStorage.getItem(SESSION_TIMEOUT_CONFIG_KEY);
    if (val) {
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  } catch {}
  return DEFAULT_TIMEOUT_MINUTES;
}

export function setSessionTimeoutMinutes(minutes: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SESSION_TIMEOUT_CONFIG_KEY, String(minutes));
  } catch {}
}

export function getInactivityTimeoutMs(): number {
  return getSessionTimeoutMinutes() * 60 * 1000;
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return 'server_session';
  const now = Date.now();
  let sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
  const lastActiveStr = sessionStorage.getItem(SESSION_LAST_ACTIVE_KEY);
  const lastActive = lastActiveStr ? parseInt(lastActiveStr, 10) : 0;
  const timeoutMs = getInactivityTimeoutMs();

  // If session doesn't exist OR user has been inactive for > configured timeout, start a new session
  if (!sessionId || (lastActive && (now - lastActive > timeoutMs))) {
    sessionId = 'sess_' + now.toString(36) + '_' + Math.random().toString(36).substring(2, 10);
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    } catch {
      // In case private browsing blocks sessionStorage
    }
  }

  // Update last activity timestamp on every access
  try {
    sessionStorage.setItem(SESSION_LAST_ACTIVE_KEY, now.toString());
  } catch {}

  return sessionId;
}

export function rotateSessionId(): string {
  if (typeof window === 'undefined') return 'server_session';
  const now = Date.now();
  const newSessionId = 'sess_' + now.toString(36) + '_' + Math.random().toString(36).substring(2, 10);
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, newSessionId);
    sessionStorage.setItem(SESSION_LAST_ACTIVE_KEY, now.toString());
  } catch {}
  return newSessionId;
}

export const TELEMETRY_EVENTS = {
  LANDING_PAGE_VIEW: 'LANDING_PAGE_VIEW',
  LANDING_AI_CHAT: 'LANDING_AI_CHAT',
  LANDING_AI_CHAT_SIGN: 'LANDING_AI_CHAT_SIGN',
  ZODIAC_FORECAST_CLICK: 'ZODIAC_FORECAST_CLICK',
  ZODIAC_COMPATIBILITY_CHECK: 'ZODIAC_COMPATIBILITY_CHECK',
  PANJIKA_DATE_CONVERSION: 'PANJIKA_DATE_CONVERSION',
  PANJIKA_DAY_VIEW: 'PANJIKA_DAY_VIEW',
  BLOG_POST_CLICK: 'BLOG_POST_CLICK',
  FEATURE_PREVIEW_CLICK: 'FEATURE_PREVIEW_CLICK',
  AUTH_GATE_OPEN: 'AUTH_GATE_OPEN',
  USER_LOGIN: 'USER_LOGIN',
  USER_REGISTRATION: 'USER_REGISTRATION',
} as const;

export interface TrackEventParams {
  eventName: string;
  category?: 'ASTROLOGY' | 'AI_CHAT' | 'NUMEROLOGY' | 'BILLING' | 'AUTH' | 'NAVIGATION' | 'REPORT' | 'CLIENT' | string;
  inputPayload?: any;
  status?: 'SUCCESS' | 'FAILURE' | 'PENDING' | 'CANCELLED';
  resultSummary?: any;
  executionTimeMs?: number;
  errorMessage?: string;
  userId?: string;
}

/**
 * Logs an event with input payload and execution outcome to the backend.
 * Fire-and-forget: will never block UI or throw errors.
 */
export async function trackEvent({
  eventName,
  category = 'CLIENT',
  inputPayload,
  status = 'SUCCESS',
  resultSummary,
  executionTimeMs = 0,
  errorMessage,
  userId,
}: TrackEventParams): Promise<void> {
  try {
    const sessionId = getSessionId();
    const clientIp = getCachedPublicIp();
    const endpoint = API_ENDPOINTS.TELEMETRY.TRACK_EVENT;
    let url = endpoint;

    if (typeof window !== 'undefined') {
      const live = (window as any).__VITE_API_BASE_URL__;
      const envUrl = ((import.meta as any).env?.VITE_API_BASE_URL || '').trim();
      const base = (live || envUrl || '').replace(/\/+$/, '');
      if (base) {
        url = `${base}${endpoint}`;
      }
    }

    const payloadObj = {
      session_id: sessionId,
      client_ip: clientIp || undefined,
      event_name: eventName,
      event_category: category,
      input_payload: inputPayload,
      status,
      result_summary: resultSummary,
      execution_time_ms: executionTimeMs,
      error_message: errorMessage,
      user_id: userId,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-session-id': sessionId,
    };
    if (clientIp) {
      headers['x-client-ip'] = clientIp;
    }

    fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payloadObj),
      keepalive: true,
    }).catch(() => {
      // Non-blocking catch
    });
  } catch (err) {
    console.debug('[Telemetry trackEvent failed quietly]:', err);
  }
}

/**
 * Centralized Session Tracker Service (UI single-point-of-entry)
 * Every interaction telemetry call in the frontend routes through this object.
 */
export const sessionTracker = {
  // 1. Landing page view
  trackLandingPageView: (path: string = typeof window !== 'undefined' ? window.location.pathname : '/') => {
    return trackEvent({
      eventName: TELEMETRY_EVENTS.LANDING_PAGE_VIEW,
      category: 'NAVIGATION',
      inputPayload: {
        page: 'Landing Page',
        path,
        referrer: typeof document !== 'undefined' ? (document.referrer || 'direct') : 'direct',
      },
      status: 'SUCCESS',
      resultSummary: {
        page: 'Landing Page',
        status: 'viewed',
      },
    });
  },

  // 2. Guest AI Chat message
  trackGuestAIChat: (params: {
    userMessage: string;
    aiReply?: string;
    msgCount?: number;
    status?: 'SUCCESS' | 'FAILURE';
    errorMessage?: string;
    executionTimeMs?: number;
  }) => {
    return trackEvent({
      eventName: TELEMETRY_EVENTS.LANDING_AI_CHAT,
      category: 'AI_CHAT',
      inputPayload: {
        clicked: 'Send Message in Guest AI Chat',
        userMessage: params.userMessage,
        msgCount: params.msgCount,
      },
      status: params.status || 'SUCCESS',
      resultSummary: params.aiReply ? {
        aiReply: params.aiReply,
        msgCount: params.msgCount,
      } : undefined,
      errorMessage: params.errorMessage,
      executionTimeMs: params.executionTimeMs || 0,
    });
  },

  // 3. Guest AI Chat sign prompt
  trackGuestAISign: (params: {
    signName: string;
    promptText: string;
    aiReply?: string;
    status?: 'SUCCESS' | 'FAILURE';
    errorMessage?: string;
    executionTimeMs?: number;
  }) => {
    return trackEvent({
      eventName: TELEMETRY_EVENTS.LANDING_AI_CHAT_SIGN,
      category: 'AI_CHAT',
      inputPayload: {
        clicked: `Ask AI for Sign (${params.signName})`,
        signName: params.signName,
        prompt: params.promptText,
      },
      status: params.status || 'SUCCESS',
      resultSummary: params.aiReply ? {
        aiReply: params.aiReply,
      } : undefined,
      errorMessage: params.errorMessage,
      executionTimeMs: params.executionTimeMs || 0,
    });
  },

  // 4. Zodiac forecast click
  trackZodiacForecastClick: (params: {
    signName: string;
    timeframe: string;
    language?: string;
    forecast?: any;
    status?: 'SUCCESS' | 'FAILURE';
    errorMessage?: string;
    executionTimeMs?: number;
  }) => {
    return trackEvent({
      eventName: TELEMETRY_EVENTS.ZODIAC_FORECAST_CLICK,
      category: 'ASTROLOGY',
      inputPayload: {
        clicked: `Zodiac Sign: ${params.signName}`,
        sign: params.signName,
        timeframe: params.timeframe,
        language: params.language,
      },
      status: params.status || 'SUCCESS',
      resultSummary: params.forecast ? {
        sign: params.signName,
        timeframe: params.timeframe,
        forecast: params.forecast,
      } : undefined,
      errorMessage: params.errorMessage,
      executionTimeMs: params.executionTimeMs || 0,
    });
  },

  // 5. Zodiac compatibility check
  trackCompatibilityCheck: (params: {
    signA: string;
    signB: string;
    system?: string;
    result?: any;
    status?: 'SUCCESS' | 'FAILURE';
    errorMessage?: string;
    executionTimeMs?: number;
  }) => {
    return trackEvent({
      eventName: TELEMETRY_EVENTS.ZODIAC_COMPATIBILITY_CHECK,
      category: 'ASTROLOGY',
      inputPayload: {
        clicked: `Check Compatibility (${params.signA} & ${params.signB})`,
        signA: params.signA,
        signB: params.signB,
        system: params.system,
      },
      status: params.status || 'SUCCESS',
      resultSummary: params.result ? {
        signA: params.signA,
        signB: params.signB,
        overallScore: params.result?.overallScore || params.result?.score || 0,
        harmonyLevel: params.result?.harmonyLevel || 'Calculated',
        summary: params.result?.summary || params.result?.verdict || 'Compatibility evaluated successfully',
      } : undefined,
      errorMessage: params.errorMessage,
      executionTimeMs: params.executionTimeMs || 0,
    });
  },

  // 6. Panjika date conversion
  trackPanjikaDateConversion: (params: {
    convertFrom: string;
    convertTo: string;
    payload?: any;
    result?: any;
    status?: 'SUCCESS' | 'FAILURE';
    errorMessage?: string;
    executionTimeMs?: number;
  }) => {
    return trackEvent({
      eventName: TELEMETRY_EVENTS.PANJIKA_DATE_CONVERSION,
      category: 'ASTROLOGY',
      inputPayload: {
        clicked: `Convert Date (${params.convertFrom} -> ${params.convertTo})`,
        from_type: params.convertFrom,
        to_type: params.convertTo,
        ...(params.payload || {}),
      },
      status: params.status || 'SUCCESS',
      resultSummary: params.result ? {
        from_type: params.convertFrom,
        to_type: params.convertTo,
        result: params.result?.result || params.result,
      } : undefined,
      errorMessage: params.errorMessage,
      executionTimeMs: params.executionTimeMs || 0,
    });
  },

  // 7. Panjika day details
  trackPanjikaDayView: (params: {
    dateStr: string;
    locationName?: string;
    result?: any;
    status?: 'SUCCESS' | 'FAILURE';
    errorMessage?: string;
    executionTimeMs?: number;
  }) => {
    return trackEvent({
      eventName: TELEMETRY_EVENTS.PANJIKA_DAY_VIEW,
      category: 'ASTROLOGY',
      inputPayload: {
        clicked: `Panjika Day: ${params.dateStr}`,
        date: params.dateStr,
        location: params.locationName,
      },
      status: params.status || 'SUCCESS',
      resultSummary: params.result ? {
        date: params.dateStr,
        tithi: params.result?.tithi || params.result?.panjika?.tithi,
        nakshatra: params.result?.nakshatra || params.result?.panjika?.nakshatra,
        sunrise: params.result?.sunrise || params.result?.panjika?.sunrise,
        sunset: params.result?.sunset || params.result?.panjika?.sunset,
      } : undefined,
      errorMessage: params.errorMessage,
      executionTimeMs: params.executionTimeMs || 0,
    });
  },

  // 8. Blog click
  trackBlogClick: (blog: { id: string | number; title: string; category?: string }) => {
    return trackEvent({
      eventName: TELEMETRY_EVENTS.BLOG_POST_CLICK,
      category: 'CONTENT',
      inputPayload: {
        clicked: `Blog: ${blog.title}`,
        blogId: blog.id,
        blogTitle: blog.title,
        category: blog.category,
      },
      status: 'SUCCESS',
      resultSummary: {
        blogId: blog.id,
        title: blog.title,
        category: blog.category,
        status: 'opened',
      },
    });
  },

  // 9. Feature preview click
  trackFeaturePreviewClick: (feat: { id: string; title: string }) => {
    return trackEvent({
      eventName: TELEMETRY_EVENTS.FEATURE_PREVIEW_CLICK,
      category: 'NAVIGATION',
      inputPayload: {
        clicked: `Feature Preview: ${feat.title}`,
        featureId: feat.id,
        title: feat.title,
      },
      status: 'SUCCESS',
      resultSummary: {
        featureId: feat.id,
        title: feat.title,
        status: 'previewed',
      },
    });
  },

  // 10. Auth gate open
  trackAuthGateOpen: (mode: 'login' | 'register') => {
    const label = mode === 'login' ? 'Log In Button' : 'Get Started Button';
    return trackEvent({
      eventName: TELEMETRY_EVENTS.AUTH_GATE_OPEN,
      category: 'AUTH',
      inputPayload: { clicked: label, mode },
      status: 'SUCCESS',
      resultSummary: { mode, status: 'modal_opened' },
    });
  },
};
