'use client';

import { usePathname } from 'next/navigation';

export default function AdminAccess() {
  const pathname = usePathname();

  // Only show on non-admin pages in development for quick access
  // Admin pages already have full navigation - no need for floating button
  const isAdminPage = pathname?.startsWith('/admin');

  // Never show floating admin button on admin pages
  if (isAdminPage) return null;

  // For now, completely disable this component
  // The admin navigation is sufficient
  return null;
}