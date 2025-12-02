'use client';

import { useEffect, useState } from 'react';
import MetaPixel from './MetaPixel';

interface AnalyticsSettings {
  metaPixelId?: string;
  metaPixelEnabled?: boolean;
  metaDomainVerification?: string;
  metaTestMode?: boolean;
}

interface SitePixelProviderProps {
  siteId: string;
}

/**
 * Client component that fetches site analytics settings and renders the MetaPixel
 * This is used in the site layout to dynamically load pixel configuration
 */
export default function SitePixelProvider({ siteId }: SitePixelProviderProps) {
  const [analytics, setAnalytics] = useState<AnalyticsSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSiteSettings() {
      try {
        const response = await fetch(`/api/sites?subdomain=${siteId}`);
        if (response.ok) {
          const data = await response.json();
          const settings = data.site?.settings;

          if (settings) {
            const parsed = typeof settings === 'string' ? JSON.parse(settings) : settings;
            setAnalytics(parsed.analytics || null);
          }
        }
      } catch (error) {
        console.error('[SitePixelProvider] Error fetching site settings:', error);
      } finally {
        setLoading(false);
      }
    }

    if (siteId) {
      fetchSiteSettings();
    }
  }, [siteId]);

  // Don't render anything while loading or if no analytics settings
  if (loading || !analytics) {
    return null;
  }

  // Don't render if pixel is not enabled or no pixel ID
  if (!analytics.metaPixelEnabled || !analytics.metaPixelId) {
    return null;
  }

  return (
    <MetaPixel
      pixelId={analytics.metaPixelId}
      enabled={analytics.metaPixelEnabled}
      testMode={analytics.metaTestMode}
    />
  );
}
