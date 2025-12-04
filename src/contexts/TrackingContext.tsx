'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { TrackingConfig, appendTrackingParams, getCurrentUrlParams } from '@/lib/tracking-utils';
import { captureFbclid, initializeFbp } from '@/lib/meta-pixel';

interface WidgetClickData {
  site_id: string;
  article_id?: string;
  widget_type: string;
  widget_name?: string;
  click_type?: string;
  destination_url?: string;
}

interface TrackingContextValue {
  trackingConfig: TrackingConfig | null;
  appendTracking: (url: string) => string;
  trackWidgetClick: (data: Partial<WidgetClickData> & { widget_type: string }) => void;
}

const TrackingContext = createContext<TrackingContextValue>({
  trackingConfig: null,
  appendTracking: (url) => url,
  trackWidgetClick: () => {},
});

export interface TrackingProviderProps {
  children: ReactNode;
  config: TrackingConfig | string | null | undefined;
  siteId?: string;
  articleId?: string;
}

export type { WidgetClickData };

export function TrackingProvider({ children, config, siteId, articleId }: TrackingProviderProps) {
  const [currentParams, setCurrentParams] = useState<URLSearchParams>(new URLSearchParams());

  // Parse config if it's a string
  const trackingConfig: TrackingConfig | null = config
    ? (typeof config === 'string' ? JSON.parse(config) : config)
    : null;

  useEffect(() => {
    // Get current URL params on mount (client-side only)
    setCurrentParams(getCurrentUrlParams());

    // Initialize Meta cookies immediately on mount
    // This ensures _fbc/_fbp are available before any CTA clicks
    captureFbclid(); // Capture fbclid from URL if present
    initializeFbp(); // Initialize browser ID cookie (_fbp)
  }, []);

  const appendTracking = (url: string) => {
    return appendTrackingParams(url, trackingConfig, currentParams);
  };

  const trackWidgetClick = (data: Partial<WidgetClickData> & { widget_type: string }) => {
    // Use provider's siteId/articleId as defaults
    const clickData: WidgetClickData = {
      site_id: data.site_id || siteId || '',
      article_id: data.article_id || articleId,
      widget_type: data.widget_type,
      widget_name: data.widget_name,
      click_type: data.click_type,
      destination_url: data.destination_url
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
  };

  return (
    <TrackingContext.Provider value={{ trackingConfig, appendTracking, trackWidgetClick }}>
      {children}
    </TrackingContext.Provider>
  );
}

export function useTracking() {
  return useContext(TrackingContext);
}
