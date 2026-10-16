/**
 * Session Tracker and Telemetry Service for AstroJunction.
 * Manages unique browser session IDs and logs initiated events, inputs, and results.
 * Accurately detects and passes real client public IP addresses.
 */

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
    const endpoint = '/api/track/event';
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
