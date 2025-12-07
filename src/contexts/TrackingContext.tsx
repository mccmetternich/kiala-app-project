'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { TrackingConfig, appendTrackingParams, getCurrentUrlParams } from '@/lib/tracking-utils';
import { captureFbclid, initializeFbp } from '@/lib/meta-pixel';

interface WidgetClickData {
  site_id: string;
  article_id?: string;
  widget_id?: string;
  widget_type: string;
  widget_name?: string;
  click_type?: string;
  destination_url?: string;
  is_external?: boolean;
  session_id?: string;
}

interface TrackingContextValue {
  trackingConfig: TrackingConfig | null;
  appendTracking: (url: string) => string;
  trackWidgetClick: (data: Partial<WidgetClickData> & { widget_type: string }) => void;
  trackExternalClick: (data: {
    widget_type: string;
    widget_id?: string;
    widget_name?: string;
    destination_url: string;
  }) => void;
  isExternalUrl: (url: string) => boolean;
  getSessionId: () => string;
}

const TrackingContext = createContext<TrackingContextValue>({
  trackingConfig: null,
  appendTracking: (url) => url,
  trackWidgetClick: () => {},
  trackExternalClick: () => {},
  isExternalUrl: () => false,
  getSessionId: () => '',
});

export interface TrackingProviderProps {
  children: ReactNode;
  config: TrackingConfig | string | null | undefined;
  siteId?: string;
  siteName?: string;
  articleId?: string;
}

export type { WidgetClickData };

// Generate or retrieve a session ID for unique visitor tracking
function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';

  const storageKey = 'kiala_session_id';
  let sessionId = sessionStorage.getItem(storageKey);

  if (!sessionId) {
    // Generate a simple unique ID for this session
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem(storageKey, sessionId);
  }

  return sessionId;
}

// Check if a URL is external (not an anchor, not same domain)
function checkIsExternalUrl(url: string): boolean {
  if (!url) return false;

  // Anchors (starts with #) are NOT external
  if (url.startsWith('#')) return false;

  // Relative URLs that are just anchors are NOT external
  if (url.startsWith('/#')) return false;

  // JavaScript: URLs are NOT external
  if (url.startsWith('javascript:')) return false;

  // mailto: and tel: are NOT external clicks (different interaction type)
  if (url.startsWith('mailto:') || url.startsWith('tel:')) return false;

  try {
    // Get current origin (only works in browser)
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

    // Handle relative URLs - they're internal
    if (url.startsWith('/') && !url.startsWith('//')) return false;

    // Parse the URL
    const urlObj = new URL(url, currentOrigin);

    // If it's the same origin, it's NOT external
    if (urlObj.origin === currentOrigin) return false;

    // External URL!
    return true;
  } catch {
    // If URL parsing fails, assume it's internal
    return false;
  }
}

export function TrackingProvider({ children, config, siteId, siteName, articleId }: TrackingProviderProps) {
  const [currentParams, setCurrentParams] = useState<URLSearchParams>(new URLSearchParams());
  const [sessionId, setSessionId] = useState<string>('');

  // Parse config if it's a string
  let trackingConfig: TrackingConfig | null = config
    ? (typeof config === 'string' ? JSON.parse(config) : config)
    : null;

  // If no utm_source is set and we have a siteName, use it as the default source
  // Convert site name to URL-safe slug (e.g., "Dr. Amy Heart" -> "dr-amy-heart")
  if (siteName && (!trackingConfig || !trackingConfig.utm_source)) {
    const siteSlug = siteName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    trackingConfig = {
      ...trackingConfig,
      utm_source: siteSlug
    };
  }

  useEffect(() => {
    // Get current URL params on mount (client-side only)
    setCurrentParams(getCurrentUrlParams());

    // Initialize session ID
    setSessionId(getOrCreateSessionId());

    // Initialize Meta cookies immediately on mount
    // This ensures _fbc/_fbp are available before any CTA clicks
    captureFbclid(); // Capture fbclid from URL if present
    initializeFbp(); // Initialize browser ID cookie (_fbp)
  }, []);

  const appendTracking = useCallback((url: string) => {
    return appendTrackingParams(url, trackingConfig, currentParams);
  }, [trackingConfig, currentParams]);

  const isExternalUrl = useCallback((url: string): boolean => {
    return checkIsExternalUrl(url);
  }, []);

  const getSessionId = useCallback((): string => {
    return sessionId;
  }, [sessionId]);

  // Low-level trackWidgetClick - tracks any click (internal use)
  const trackWidgetClick = useCallback((data: Partial<WidgetClickData> & { widget_type: string }) => {
    // Use provider's siteId/articleId as defaults
    const clickData: WidgetClickData = {
      site_id: data.site_id || siteId || '',
      article_id: data.article_id || articleId,
      widget_id: data.widget_id,
      widget_type: data.widget_type,
      widget_name: data.widget_name,
      click_type: data.click_type,
      destination_url: data.destination_url,
      is_external: data.is_external ?? checkIsExternalUrl(data.destination_url || ''),
      session_id: data.session_id || sessionId
    };

    if (!clickData.site_id) {
      console.warn('trackWidgetClick: No site_id provided');
      return;
    }

    // Send click data to our internal analytics API
    fetch('/api/analytics/widget-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clickData)
    }).catch(err => console.error('Failed to track widget click:', err));
  }, [siteId, articleId, sessionId]);

  // High-level trackExternalClick - only tracks if URL is external
  // Use this in widgets for CTA clicks
  const trackExternalClick = useCallback((data: {
    widget_type: string;
    widget_id?: string;
    widget_name?: string;
    destination_url: string;
  }) => {
    const isExternal = checkIsExternalUrl(data.destination_url);

    // Only track external clicks (conversions)
    if (!isExternal) {
      return;
    }

    trackWidgetClick({
      widget_type: data.widget_type,
      widget_id: data.widget_id,
      widget_name: data.widget_name,
      destination_url: data.destination_url,
      is_external: true,
      click_type: 'cta'
    });
  }, [trackWidgetClick]);

  return (
    <TrackingContext.Provider value={{
      trackingConfig,
      appendTracking,
      trackWidgetClick,
      trackExternalClick,
      isExternalUrl,
      getSessionId
    }}>
      {children}
    </TrackingContext.Provider>
  );
}

export function useTracking() {
  return useContext(TrackingContext);
}
