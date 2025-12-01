'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// Domain to site subdomain mapping
const domainToSite: Record<string, string> = {
  'dramyheart.com': 'dr-amy',
  'www.dramyheart.com': 'dr-amy',
};

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export function useSiteId(): string | null {
  const params = useParams();
  const [siteId, setSiteId] = useState<string | null>(null);

  useEffect(() => {
    // First try to get from URL params
    if (params?.id) {
      setSiteId(params.id as string);
      return;
    }

    // Try to get from cookie (set by middleware)
    const cookieSiteId = getCookie('x-site-id');
    if (cookieSiteId) {
      setSiteId(cookieSiteId);
      return;
    }

    // Check if we're on a custom domain
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const mappedSiteId = domainToSite[hostname];
      if (mappedSiteId) {
        setSiteId(mappedSiteId);
        return;
      }
    }

    setSiteId(null);
  }, [params]);

  return siteId;
}
