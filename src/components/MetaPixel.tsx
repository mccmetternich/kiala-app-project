'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { captureFbclid, initializeFbp } from '@/lib/meta-pixel';

interface MetaPixelProps {
  pixelId: string;
  enabled?: boolean;
  testMode?: boolean;
}

/**
 * Meta Pixel Component
 * Renders the Meta/Facebook Pixel base code and handles cookie initialization
 *
 * Usage:
 * <MetaPixel pixelId="696663729529775" enabled={true} />
 */
export default function MetaPixel({
  pixelId,
  enabled = true,
  testMode = false
}: MetaPixelProps) {
  // Don't render if disabled or no pixel ID
  if (!enabled || !pixelId) {
    return null;
  }

  useEffect(() => {
    // Initialize first-party cookies on mount
    captureFbclid(); // Capture fbclid from URL if present
    initializeFbp(); // Initialize browser ID cookie

    if (process.env.NODE_ENV === 'development' || testMode) {
      console.log('[Meta Pixel] Initialized with Pixel ID:', pixelId);
      console.log('[Meta Pixel] Test Mode:', testMode);
    }
  }, [pixelId, testMode]);

  // In test mode, only initialize cookies but don't load the actual pixel
  if (testMode) {
    return null;
  }

  return (
    <>
      {/* Meta Pixel Base Code */}
      <Script
        id="meta-pixel-base"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');

            // Initialize with first-party cookies enabled
            fbq('init', '${pixelId}', {}, {
              agent: 'dr-cms-1.0'
            });

            // Fire PageView event
            fbq('track', 'PageView');

            ${process.env.NODE_ENV === 'development' ? `console.log('[Meta Pixel] Base code loaded, PageView fired');` : ''}
          `
        }}
      />

      {/* NoScript fallback for users without JavaScript */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

/**
 * Meta Domain Verification Component
 * Renders the meta tag for domain verification
 */
export function MetaDomainVerification({ code }: { code?: string }) {
  if (!code) return null;

  return (
    <meta name="facebook-domain-verification" content={code} />
  );
}
