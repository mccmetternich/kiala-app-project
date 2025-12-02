/**
 * Meta Pixel Utility Library
 * Handles fbclid capture, cookie management, and event tracking
 */

// Type declarations for fbq
declare global {
  interface Window {
    fbq: (
      action: string,
      eventOrPixelId: string,
      params?: Record<string, unknown>,
      options?: Record<string, unknown>
    ) => void;
    _fbq: typeof window.fbq;
  }
}

export interface MetaPixelConfig {
  pixelId: string;
  enabled: boolean;
  testMode?: boolean;
}

export interface FbCookies {
  fbc: string | null;
  fbp: string | null;
}

export interface EventParams {
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
  value?: number;
  currency?: string;
  [key: string]: unknown;
}

/**
 * Cookie utility functions
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

function setCookie(name: string, value: string, days: number = 90): void {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  // Set cookie with proper attributes for first-party tracking
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

/**
 * Generate a unique browser ID for _fbp cookie
 * Format: fb.1.{timestamp}.{random10digits}
 */
function generateFbp(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
  return `fb.1.${timestamp}.${random}`;
}

/**
 * Capture fbclid from URL and store as _fbc cookie
 * Format: fb.1.{timestamp}.{fbclid}
 */
export function captureFbclid(): string | null {
  if (typeof window === 'undefined') return null;

  const urlParams = new URLSearchParams(window.location.search);
  const fbclid = urlParams.get('fbclid');

  if (fbclid) {
    const timestamp = Date.now();
    const fbcValue = `fb.1.${timestamp}.${fbclid}`;
    setCookie('_fbc', fbcValue, 90);

    if (process.env.NODE_ENV === 'development') {
      console.log('[Meta Pixel] Captured fbclid:', fbclid);
      console.log('[Meta Pixel] Set _fbc cookie:', fbcValue);
    }

    return fbcValue;
  }

  return getCookie('_fbc');
}

/**
 * Initialize or get _fbp cookie (browser ID)
 */
export function initializeFbp(): string {
  let fbp = getCookie('_fbp');

  if (!fbp) {
    fbp = generateFbp();
    setCookie('_fbp', fbp, 90);

    if (process.env.NODE_ENV === 'development') {
      console.log('[Meta Pixel] Generated new _fbp:', fbp);
    }
  }

  return fbp;
}

/**
 * Get both _fbc and _fbp cookies
 */
export function getFbCookies(): FbCookies {
  return {
    fbc: getCookie('_fbc'),
    fbp: getCookie('_fbp')
  };
}

/**
 * Check if Meta Pixel (fbq) is available
 */
export function isPixelAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.fbq === 'function';
}

/**
 * Generate a unique event ID for deduplication with CAPI
 * Format: {timestamp}.{random9chars}
 */
export function generateEventId(): string {
  return `${Date.now()}.${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Track a Meta Pixel event
 * @param eventName - Standard or custom event name
 * @param params - Event parameters
 * @param testMode - If true, only logs to console without firing
 * @returns The event_id used for this event (for CAPI deduplication)
 */
export function trackEvent(
  eventName: string,
  params?: EventParams,
  testMode: boolean = false
): string {
  // Generate unique event ID for deduplication with CAPI
  const eventId = generateEventId();

  // Always log in development
  if (process.env.NODE_ENV === 'development' || testMode) {
    console.log(`[Meta Pixel${testMode ? ' TEST MODE' : ''}] Event: ${eventName}`, {
      event_id: eventId,
      ...params
    });
  }

  // Don't fire in test mode
  if (testMode) return eventId;

  // Fire the event if pixel is available
  if (isPixelAvailable()) {
    try {
      if (params) {
        window.fbq('track', eventName, params, { eventID: eventId });
      } else {
        window.fbq('track', eventName, {}, { eventID: eventId });
      }
    } catch (error) {
      console.error('[Meta Pixel] Error tracking event:', error);
    }
  } else if (process.env.NODE_ENV === 'development') {
    console.warn('[Meta Pixel] fbq not available - pixel may be blocked or not loaded');
  }

  return eventId;
}

/**
 * Track a custom event (uses trackCustom instead of track)
 * @returns The event_id used for this event (for CAPI deduplication)
 */
export function trackCustomEvent(
  eventName: string,
  params?: EventParams,
  testMode: boolean = false
): string {
  const eventId = generateEventId();

  if (process.env.NODE_ENV === 'development' || testMode) {
    console.log(`[Meta Pixel${testMode ? ' TEST MODE' : ''}] Custom Event: ${eventName}`, {
      event_id: eventId,
      ...params
    });
  }

  if (testMode) return eventId;

  if (isPixelAvailable()) {
    try {
      if (params) {
        window.fbq('trackCustom', eventName, params, { eventID: eventId });
      } else {
        window.fbq('trackCustom', eventName, {}, { eventID: eventId });
      }
    } catch (error) {
      console.error('[Meta Pixel] Error tracking custom event:', error);
    }
  }

  return eventId;
}

/**
 * Standard Event Helpers
 */

export function trackPageView(testMode: boolean = false): void {
  trackEvent('PageView', undefined, testMode);
}

export function trackViewContent(
  params: {
    content_name?: string;
    content_category?: string;
    content_ids?: string[];
    content_type?: string;
    value?: number;
    currency?: string;
  },
  testMode: boolean = false
): void {
  trackEvent('ViewContent', params, testMode);
}

export function trackLead(
  params?: {
    content_name?: string;
    content_category?: string;
    value?: number;
    currency?: string;
  },
  testMode: boolean = false
): void {
  trackEvent('Lead', params, testMode);
}

export function trackInitiateCheckout(
  params?: {
    content_name?: string;
    content_category?: string;
    content_ids?: string[];
    content_type?: string;
    value?: number;
    currency?: string;
    num_items?: number;
  },
  testMode: boolean = false
): void {
  trackEvent('InitiateCheckout', params, testMode);
}

export function trackAddToCart(
  params: {
    content_name?: string;
    content_ids?: string[];
    content_type?: string;
    value?: number;
    currency?: string;
  },
  testMode: boolean = false
): void {
  trackEvent('AddToCart', params, testMode);
}

export function trackPurchase(
  params: {
    content_name?: string;
    content_ids?: string[];
    content_type?: string;
    value: number;
    currency: string;
    num_items?: number;
  },
  testMode: boolean = false
): void {
  trackEvent('Purchase', params, testMode);
}

export function trackSearch(
  params: {
    search_string: string;
    content_category?: string;
  },
  testMode: boolean = false
): void {
  trackEvent('Search', params, testMode);
}

export function trackCompleteRegistration(
  params?: {
    content_name?: string;
    status?: string;
    value?: number;
    currency?: string;
  },
  testMode: boolean = false
): void {
  trackEvent('CompleteRegistration', params, testMode);
}
