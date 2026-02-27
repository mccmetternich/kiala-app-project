'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SiteHomePageProps {
  params: { id: string };
}

export default function SiteHomePage({ params }: SiteHomePageProps) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to articles page - this is now an article-focused platform
    router.replace(`/site/${params.id}/articles`);
  }, [router, params.id]);

  return null; // No content while redirecting
}