'use client';

import { useTracking } from '@/contexts/TrackingContext';
import { trackInitiateCheckout } from '@/lib/meta-pixel';
import { ReactNode, AnchorHTMLAttributes } from 'react';

interface TrackedLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
  /** If true, fires InitiateCheckout event on click */
  trackCheckout?: boolean;
  /** Content name for tracking (e.g., product or CTA name) */
  contentName?: string;
  /** Value of the checkout (optional) */
  value?: number;
  /** Currency code (default: USD) */
  currency?: string;
}

/**
 * A link component that automatically appends tracking parameters
 * (UTM params and fbclid) from the TrackingContext.
 * Optionally fires InitiateCheckout Meta Pixel event on click.
 */
export default function TrackedLink({
  href,
  children,
  trackCheckout = false,
  contentName,
  value,
  currency = 'USD',
  onClick,
  ...props
}: TrackedLinkProps) {
  const { appendTracking } = useTracking();
  const trackedHref = appendTracking(href);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Fire InitiateCheckout event if enabled
    if (trackCheckout) {
      trackInitiateCheckout({
        content_name: contentName || 'CTA Click',
        value,
        currency
      });
    }
    // Call original onClick if provided
    onClick?.(e);
  };

  return (
    <a href={trackedHref} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
