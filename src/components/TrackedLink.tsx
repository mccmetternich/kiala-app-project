'use client';

import { useTracking } from '@/contexts/TrackingContext';
import { trackInitiateCheckout } from '@/lib/meta-pixel';
import { ReactNode, AnchorHTMLAttributes } from 'react';

interface TrackedLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'target'> {
  href: string;
  children: ReactNode;
  target?: '_self' | '_blank';
  /** Widget type for analytics tracking (e.g., 'shop-now', 'cta-button', 'product-card') */
  widgetType: string;
  /** Unique widget ID for per-instance tracking */
  widgetId?: string;
  /** Human-readable widget name */
  widgetName?: string;
  /** Content name for Meta Pixel (defaults to widgetName) */
  contentName?: string;
  /** Content category for Meta Pixel (defaults to widgetType) */
  contentCategory?: string;
  /** Value of the checkout (optional) */
  value?: number;
  /** Currency code (default: USD) */
  currency?: string;
  /** Skip tracking entirely (for internal links that shouldn't be tracked) */
  skipTracking?: boolean;
}

/**
 * TrackedLink - A link component that AUTOMATICALLY tracks external CTA clicks.
 *
 * USE THIS COMPONENT for all CTA links in widgets. It automatically:
 * 1. Detects if the URL is external (not anchors, not internal paths)
 * 2. Tracks the click via trackExternalClick (for conversion analytics)
 * 3. Fires Meta Pixel InitiateCheckout event for external clicks
 * 4. Appends tracking parameters (fbclid, utm, etc.)
 *
 * For internal/anchor links, it only appends tracking params without firing events.
 *
 * IMPORTANT: The `widgetType` prop is REQUIRED to ensure all clicks are properly
 * categorized in analytics. This is enforced at the TypeScript level.
 *
 * @example
 * // Basic usage in a widget
 * <TrackedLink
 *   href={ctaUrl}
 *   widgetType="shop-now"
 *   widgetName="Complete Hormone Reset"
 *   className="bg-primary-500 text-white px-6 py-3 rounded-xl"
 * >
 *   Buy Now
 * </TrackedLink>
 *
 * @example
 * // With custom Meta Pixel content and value
 * <TrackedLink
 *   href={ctaUrl}
 *   widgetType="product-card"
 *   widgetId={`product-${productId}`}
 *   widgetName={productName}
 *   contentName={productName}
 *   value={97}
 *   target="_blank"
 * >
 *   Shop Now
 * </TrackedLink>
 */
export default function TrackedLink({
  href,
  children,
  target = '_self',
  widgetType,
  widgetId,
  widgetName,
  contentName,
  contentCategory,
  value,
  currency = 'USD',
  skipTracking = false,
  onClick,
  ...props
}: TrackedLinkProps) {
  const { appendTracking, trackExternalClick, isExternalUrl } = useTracking();
  const trackedHref = appendTracking(href);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Only track external URLs (not anchors, not internal paths, not mailto/tel)
    // This is AUTOMATIC - no need for the widget to check
    if (!skipTracking && isExternalUrl(href)) {
      // Fire InitiateCheckout Meta Pixel event
      trackInitiateCheckout({
        content_name: contentName || widgetName || widgetType,
        content_category: contentCategory || widgetType,
        value,
        currency
      });

      // Track external click for conversion analytics
      trackExternalClick({
        widget_type: widgetType,
        widget_id: widgetId || `${widgetType}-${(widgetName || 'cta').substring(0, 20).replace(/\s+/g, '-').toLowerCase()}`,
        widget_name: widgetName || widgetType,
        destination_url: href
      });
    }

    // Call original onClick if provided
    onClick?.(e);
  };

  return (
    <a href={trackedHref} target={target} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}

/**
 * Hook for tracking clicks on non-link elements (buttons, custom elements)
 * Use this when you can't use TrackedLink directly.
 *
 * @example
 * const { trackClick, getTrackedUrl } = useTrackedClick();
 *
 * const handleButtonClick = () => {
 *   // Do some work...
 *   trackClick({
 *     url: ctaUrl,
 *     widgetType: 'custom-modal',
 *     widgetName: 'Newsletter Popup'
 *   });
 *   window.open(getTrackedUrl(ctaUrl), '_blank');
 * };
 */
export function useTrackedClick() {
  const { appendTracking, trackExternalClick, isExternalUrl } = useTracking();

  const trackClick = ({
    url,
    widgetType,
    widgetId,
    widgetName,
    contentName,
    contentCategory,
    value,
    currency = 'USD'
  }: {
    url: string;
    widgetType: string;
    widgetId?: string;
    widgetName?: string;
    contentName?: string;
    contentCategory?: string;
    value?: number;
    currency?: string;
  }) => {
    if (isExternalUrl(url)) {
      // Fire Meta Pixel
      trackInitiateCheckout({
        content_name: contentName || widgetName || widgetType,
        content_category: contentCategory || widgetType,
        value,
        currency
      });

      // Track for analytics
      trackExternalClick({
        widget_type: widgetType,
        widget_id: widgetId || `${widgetType}-${(widgetName || 'cta').substring(0, 20).replace(/\s+/g, '-').toLowerCase()}`,
        widget_name: widgetName || widgetType,
        destination_url: url
      });
    }
  };

  const getTrackedUrl = (url: string) => appendTracking(url);

  return { trackClick, getTrackedUrl, isExternalUrl };
}
