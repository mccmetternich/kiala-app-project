'use client';

import { useTracking } from '@/contexts/TrackingContext';
import { ReactNode, AnchorHTMLAttributes } from 'react';

interface TrackedLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
}

/**
 * A link component that automatically appends tracking parameters
 * (UTM params and fbclid) from the TrackingContext.
 */
export default function TrackedLink({ href, children, ...props }: TrackedLinkProps) {
  const { appendTracking } = useTracking();
  const trackedHref = appendTracking(href);

  return (
    <a href={trackedHref} {...props}>
      {children}
    </a>
  );
}
