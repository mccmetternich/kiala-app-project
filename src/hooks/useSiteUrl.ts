'use client';

import { useEffect, useState } from 'react';

// Domain to site subdomain mapping
const domainToSite: Record<string, string> = {
  'dramyheart.com': 'dr-amy',
  'www.dramyheart.com': 'dr-amy',
};

// Reverse mapping: site to custom domain
const siteToDomain: Record<string, string> = {
  'dr-amy': 'www.dramyheart.com',
};

export function useSiteUrl(siteId: string | undefined) {
  const [isCustomDomain, setIsCustomDomain] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      setIsCustomDomain(!!domainToSite[hostname]);
    }
  }, []);

  // Generate a URL for the site - removes /site/{siteId} prefix on custom domains
  const getSiteUrl = (path: string): string => {
    if (isCustomDomain) {
      // On custom domain, strip /site/{siteId} prefix and ensure leading slash
      let cleanPath = path.replace(/^\/site\/[^/]+/, '');
      // Ensure path starts with /
      if (!cleanPath.startsWith('/')) {
        cleanPath = '/' + cleanPath;
      }
      return cleanPath || '/';
    }
    // On main domain, ensure path has /site/{siteId} prefix
    if (path.startsWith('/site/')) {
      return path;
    }
    return `/site/${siteId}${path.startsWith('/') ? path : '/' + path}`;
  };

  return { isCustomDomain, getSiteUrl };
}

// Simple function for server-side or when hook isn't available
export function buildSiteUrl(siteId: string, path: string, isCustomDomain: boolean = false): string {
  if (isCustomDomain) {
    const cleanPath = path.replace(/^\/site\/[^/]+/, '');
    return cleanPath || '/';
  }
  if (path.startsWith('/site/')) {
    return path;
  }
  return `/site/${siteId}${path.startsWith('/') ? path : '/' + path}`;
}
