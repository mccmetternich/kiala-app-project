'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { TrackingConfig, appendTrackingParams, getCurrentUrlParams } from '@/lib/tracking-utils';

interface TrackingContextValue {
  trackingConfig: TrackingConfig | null;
  appendTracking: (url: string) => string;
}

const TrackingContext = createContext<TrackingContextValue>({
  trackingConfig: null,
  appendTracking: (url) => url,
});

interface TrackingProviderProps {
  children: ReactNode;
  config: TrackingConfig | string | null | undefined;
}

export function TrackingProvider({ children, config }: TrackingProviderProps) {
  const [currentParams, setCurrentParams] = useState<URLSearchParams>(new URLSearchParams());

  // Parse config if it's a string
  const trackingConfig: TrackingConfig | null = config
    ? (typeof config === 'string' ? JSON.parse(config) : config)
    : null;

  useEffect(() => {
    // Get current URL params on mount (client-side only)
    setCurrentParams(getCurrentUrlParams());
  }, []);

  const appendTracking = (url: string) => {
    return appendTrackingParams(url, trackingConfig, currentParams);
  };

  return (
    <TrackingContext.Provider value={{ trackingConfig, appendTracking }}>
      {children}
    </TrackingContext.Provider>
  );
}

export function useTracking() {
  return useContext(TrackingContext);
}
