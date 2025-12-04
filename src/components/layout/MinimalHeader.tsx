'use client';

import Link from 'next/link';
import { Site } from '@/types';
import { useSiteUrl } from '@/hooks/useSiteUrl';

interface MinimalHeaderProps {
  site: Site;
}

/**
 * MinimalHeader - Logo only, no navigation or social proof
 * Used for: Checkout pages, landing pages, special funnels
 * Navigation Mode: 'minimal'
 */
export default function MinimalHeader({ site }: MinimalHeaderProps) {
  const brand = site.brand;
  const siteId = site.subdomain || site.id;
  const { getSiteUrl } = useSiteUrl(siteId);
  const homeUrl = getSiteUrl('/');

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-center">
          {/* Centered Logo */}
          <Link href={homeUrl} className="flex items-center gap-3">
            {(brand?.logoImage || brand?.profileImage) ? (
              <img
                src={brand.logoImage || brand.profileImage}
                alt={brand?.name || 'Logo'}
                className="w-10 h-10 rounded-lg object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {brand?.name ? brand.name.replace(/^Dr\.?\s*/i, '').split(' ').map(n => n[0]).join('') : 'DR'}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {brand?.name || site.name || 'Dr. Heart'}
              </h1>
              {brand?.tagline && (
                <p className="text-xs text-primary-600 font-medium">
                  {brand.tagline}
                </p>
              )}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
