/**
 * Tracking utilities for appending UTM parameters, fbclid, and Meta cookies to CTA links
 */

import { getFbCookies } from './meta-pixel';

export interface TrackingConfig {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  passthrough_fbclid?: boolean;
  passthrough_fb_cookies?: boolean;
}

/**
 * Get current URL search params (fbclid, existing UTMs, etc.)
 * Only works on client side
 */
export function getCurrentUrlParams(): URLSearchParams {
  if (typeof window === 'undefined') {
    return new URLSearchParams();
  }
  return new URLSearchParams(window.location.search);
}

/**
 * Default tracking config used when no article-specific config is provided.
 * This ensures all external links get proper UTM attribution.
 * Note: utm_source should be set dynamically by TrackingProvider using site name
 */
export const DEFAULT_TRACKING_CONFIG: TrackingConfig = {
  utm_medium: 'article',
  passthrough_fbclid: true,
  passthrough_fb_cookies: true
};

/**
 * Append tracking parameters to a URL
 * - Adds UTM params from tracking config (with sensible defaults)
 * - Passes through fbclid from current URL if enabled
 * - Preserves existing params on the target URL
 */
export function appendTrackingParams(
  url: string,
  trackingConfig: TrackingConfig | null | undefined,
  currentParams?: URLSearchParams
): string {
  if (!url) return url;

  // Don't modify internal links (starting with / but not //)
  if (url.startsWith('/') && !url.startsWith('//')) {
    return url;
  }

  // Don't modify anchor links
  if (url.startsWith('#')) {
    return url;
  }

  // Don't modify mailto/tel links
  if (url.startsWith('mailto:') || url.startsWith('tel:')) {
    return url;
  }

  try {
    const targetUrl = new URL(url);
    const params = currentParams || getCurrentUrlParams();

    // Merge provided config with defaults (provided config takes precedence)
    const config: TrackingConfig = {
      ...DEFAULT_TRACKING_CONFIG,
      ...trackingConfig
    };

    // Add UTM parameters from tracking config (if not already present on target URL)
    if (config.utm_source && !targetUrl.searchParams.has('utm_source')) {
      targetUrl.searchParams.set('utm_source', config.utm_source);
    }
    if (config.utm_medium && !targetUrl.searchParams.has('utm_medium')) {
      targetUrl.searchParams.set('utm_medium', config.utm_medium);
    }
    if (config.utm_campaign && !targetUrl.searchParams.has('utm_campaign')) {
      targetUrl.searchParams.set('utm_campaign', config.utm_campaign);
    }
    if (config.utm_content && !targetUrl.searchParams.has('utm_content')) {
      targetUrl.searchParams.set('utm_content', config.utm_content);
    }

    // Pass through fbclid if enabled and present in current URL
    if (config.passthrough_fbclid !== false) {
      const fbclid = params.get('fbclid');
      if (fbclid && !targetUrl.searchParams.has('fbclid')) {
        targetUrl.searchParams.set('fbclid', fbclid);
      }
    }

    // Pass through _fbc and _fbp cookies for cross-domain tracking (enabled by default)
    if (config.passthrough_fb_cookies !== false) {
      const fbCookies = getFbCookies();
      if (fbCookies.fbc && !targetUrl.searchParams.has('_fbc')) {
        targetUrl.searchParams.set('_fbc', fbCookies.fbc);
      }
      if (fbCookies.fbp && !targetUrl.searchParams.has('_fbp')) {
        targetUrl.searchParams.set('_fbp', fbCookies.fbp);
      }
    }

    return targetUrl.toString();
  } catch (e) {
    // If URL parsing fails, return original
    console.warn('Failed to parse URL for tracking:', url, e);
    return url;
  }
}

/**
 * Parse tracking config from JSON string or object
 */
export function parseTrackingConfig(config: string | TrackingConfig | null | undefined): TrackingConfig | null {
  if (!config) return null;

  if (typeof config === 'string') {
    try {
      return JSON.parse(config);
    } catch (e) {
      console.error('Failed to parse tracking config:', e);
      return null;
    }
  }

  return config;
}
