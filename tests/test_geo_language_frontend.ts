/**
 * Automated Verification Suite for Step 3: Frontend Auto-Language Resolution
 */

import {
  SUPPORTED_LANGUAGES,
  MANUAL_LANG_KEY,
  MANUAL_LANG_KEY_ALT,
  AUTO_LANG_KEY,
  getManualLanguage,
  getAutoLanguage,
  getUrlLanguage,
  getBrowserFallbackLanguage,
  setManualLanguage,
  setAutoLanguage,
  initLanguage,
} from '../src/i18n';

// Simple in-memory localStorage mock
class MockStorage {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, val: string): void {
    this.store.set(key, String(val));
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

// Global browser mocks
const mockStorage = new MockStorage();
(globalThis as any).localStorage = mockStorage;

const mockDocument = {
  documentElement: {
    lang: 'en',
    setAttribute: () => {},
    classList: { add: () => {} },
  },
};
(globalThis as any).document = mockDocument;

let mockUrlSearch = '';
(globalThis as any).window = {
  get location() {
    return {
      search: mockUrlSearch,
      origin: 'http://localhost:3000',
      port: '3000',
    };
  },
};

let mockNavigatorLang = 'en-US';
Object.defineProperty(globalThis, 'navigator', {
  value: {
    get language() {
      return mockNavigatorLang;
    },
  },
  configurable: true,
  writable: true,
});

let fetchCallCount = 0;
let mockFetchResponse: any = null;
let mockFetchShouldTimeout = false;

(globalThis as any).fetch = async (url: string, options: any) => {
  fetchCallCount++;
  if (mockFetchShouldTimeout) {
    // Return a promise that waits longer than the 1.5s timeout or simulate abort
    return new Promise((_, reject) => {
      const signal = options?.signal;
      if (signal) {
        signal.addEventListener('abort', () => {
          reject(new Error('The operation was aborted'));
        });
      }
    });
  }

  return {
    ok: mockFetchResponse ? true : false,
    status: mockFetchResponse ? 200 : 500,
    json: async () => mockFetchResponse,
  };
};

function resetTestEnv() {
  mockStorage.clear();
  mockUrlSearch = '';
  mockNavigatorLang = 'en-US';
  mockDocument.documentElement.lang = 'en';
  fetchCallCount = 0;
  mockFetchResponse = null;
  mockFetchShouldTimeout = false;
}

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${msg}`);
    failed++;
  }
}

async function runTests() {
  console.log('=== Step 3 Frontend Language Resolution Verification ===\n');

  // Test 1: URL Query Parameter Highest Priority (?lang=fr)
  {
    resetTestEnv();
    mockUrlSearch = '?lang=fr';
    mockStorage.setItem(MANUAL_LANG_KEY, 'hi'); // manual should be overridden by explicit URL param
    const resolved = await initLanguage();
    assert(resolved === 'fr', 'URL query param ?lang=fr takes highest priority');
    assert(mockDocument.documentElement.lang === 'fr', 'document.documentElement.lang updated to fr');
    assert(fetchCallCount === 0, 'No fetch called when ?lang= is present');
    assert(mockStorage.getItem(MANUAL_LANG_KEY) === 'hi', 'Manual key is NOT modified by ?lang=');
    assert(mockStorage.getItem(AUTO_LANG_KEY) === null, 'Auto key is NOT created by ?lang=');
  }

  // Test 2: Manual Selection Priority Over Geo and Auto
  {
    resetTestEnv();
    mockStorage.setItem(MANUAL_LANG_KEY, 'ta');
    mockStorage.setItem(AUTO_LANG_KEY, 'bn'); // auto key also present
    const resolved = await initLanguage();
    assert(resolved === 'ta', 'Manual language "ta" takes precedence over auto key and geo');
    assert(mockDocument.documentElement.lang === 'ta', 'document.documentElement.lang set to manual "ta"');
    assert(fetchCallCount === 0, 'No fetch called when manual key exists');
  }

  // Test 3: Returning Visitor Uses Auto Key Without Fetching Geo
  {
    resetTestEnv();
    mockStorage.setItem(AUTO_LANG_KEY, 'bn');
    const resolved = await initLanguage();
    assert(resolved === 'bn', 'Returning visitor uses saved auto language "bn"');
    assert(mockDocument.documentElement.lang === 'bn', 'document.documentElement.lang set to auto "bn"');
    assert(fetchCallCount === 0, 'Second/returning visit NEVER calls /geo/language');
    assert(mockStorage.getItem(MANUAL_LANG_KEY) === null, 'Manual key remains completely null');
  }

  // Test 4: First Visit Auto Resolution - AUTO IS NOT MANUAL
  {
    resetTestEnv();
    // Simulate first visit: No manual key, no auto key
    mockFetchResponse = { status: 'success', lang: 'bn', source: 'region' };
    const resolved = await initLanguage();
    assert(resolved === 'bn', 'First visit resolves to geo lang "bn"');
    assert(fetchCallCount === 1, 'First visit triggers exactly 1 fetch to /geo/language');
    assert(mockStorage.getItem(AUTO_LANG_KEY) === 'bn', 'Auto result is saved to astrojunction_lang_auto');
    assert(mockStorage.getItem(MANUAL_LANG_KEY) === null, 'Manual key astrojunction_lang is NOT written');
    assert(mockStorage.getItem(MANUAL_LANG_KEY_ALT) === null, 'Manual key jyotish_language is NOT written');
    assert(mockDocument.documentElement.lang === 'bn', 'document.documentElement.lang set to "bn"');
  }

  // Test 5: Geo Timeout Falls Back to Browser Language (No Manual Write)
  {
    resetTestEnv();
    mockFetchShouldTimeout = true; // Simulates 1500ms abort
    mockNavigatorLang = 'ta-IN'; // Tamil browser
    const resolved = await initLanguage();
    assert(resolved === 'ta', 'Geo timeout cleanly falls back to browser language "ta"');
    assert(mockStorage.getItem(AUTO_LANG_KEY) === 'ta', 'Browser fallback saved to astrojunction_lang_auto');
    assert(mockStorage.getItem(MANUAL_LANG_KEY) === null, 'Browser fallback is NOT saved as manual choice');
    assert(mockDocument.documentElement.lang === 'ta', 'document.documentElement.lang set to "ta"');
  }

  // Test 6: Geo Network Error Falls Back to English Default
  {
    resetTestEnv();
    mockFetchResponse = null; // 500 error
    mockNavigatorLang = 'de-DE'; // Unsupported browser language
    const resolved = await initLanguage();
    assert(resolved === 'en', 'Geo error + unsupported browser falls back to English "en"');
    assert(mockStorage.getItem(AUTO_LANG_KEY) === 'en', 'English fallback saved to astrojunction_lang_auto');
    assert(mockStorage.getItem(MANUAL_LANG_KEY) === null, 'English fallback is NOT saved as manual choice');
  }

  // Test 7: "country-only" and "default" Sources Fall Back to Browser / English
  {
    resetTestEnv();
    mockFetchResponse = { status: 'success', lang: 'en', source: 'country-only' };
    mockNavigatorLang = 'hi-IN'; // User in India without region header, but browser is Hindi
    const resolved = await initLanguage();
    assert(resolved === 'hi', 'source "country-only" falls back to browser language "hi" instead of raw country');
    assert(mockStorage.getItem(AUTO_LANG_KEY) === 'hi', 'Saved to astrojunction_lang_auto');
    assert(mockStorage.getItem(MANUAL_LANG_KEY) === null, 'Manual key is NOT written');
  }

  // Test 8: Manual Language Selector Switch
  {
    resetTestEnv();
    // Simulate user selecting French manually in language selector
    setManualLanguage('fr');
    assert(mockStorage.getItem(MANUAL_LANG_KEY) === 'fr', 'Manual selection writes astrojunction_lang');
    assert(mockStorage.getItem(MANUAL_LANG_KEY_ALT) === 'fr', 'Manual selection writes jyotish_language');
    assert(mockDocument.documentElement.lang === 'fr', 'Manual selection updates document.documentElement.lang');
    assert(getManualLanguage() === 'fr', 'getManualLanguage() returns "fr"');

    // Simulate page reload: Manual choice must stay and prevent geo fetch
    fetchCallCount = 0;
    const reloaded = await initLanguage();
    assert(reloaded === 'fr', 'Reload after manual change keeps "fr" forever');
    assert(fetchCallCount === 0, 'No geo fetch after manual selection');
  }

  // Test 9: Real Regional Simulations
  console.log('\n--- Real Regional First-Visit Simulations ---');
  const testCases = [
    { name: 'West Bengal (India)', apiLang: 'bn', apiSource: 'region', expected: 'bn' },
    { name: 'Tamil Nadu (India)', apiLang: 'ta', apiSource: 'region', expected: 'ta' },
    { name: 'Uttar Pradesh (India)', apiLang: 'hi', apiSource: 'region', expected: 'hi' },
    { name: 'Maharashtra (India)', apiLang: 'en', apiSource: 'region', expected: 'en' },
    { name: 'France', apiLang: 'fr', apiSource: 'country', expected: 'fr' },
    { name: 'Unknown / Fallback (US)', apiLang: 'en', apiSource: 'default', expected: 'en' },
  ];

  for (const tc of testCases) {
    resetTestEnv();
    mockFetchResponse = { status: 'success', lang: tc.apiLang, source: tc.apiSource };
    const res = await initLanguage();
    assert(res === tc.expected, `${tc.name} resolves to "${tc.expected}"`);
    assert(mockDocument.documentElement.lang === tc.expected, `${tc.name} sets html lang="${tc.expected}"`);
  }

  console.log(`\n=== Summary: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Test suite failed:', e);
  process.exit(1);
});
