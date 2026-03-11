import type { Metadata, ResolvingMetadata } from 'next';
import SitePixelProvider from '@/components/SitePixelProvider';
import db from '@/lib/db-enhanced';

// Default metadata for the site - fallback only when no brand profile exists
const defaultMetadata = {
  title: 'WellnessVault - Evidence-Based Wellness Content',
  description: 'Discover evidence-based wellness insights and nutritional guidance from certified professionals. Research-backed articles on nutrition, supplements, and women\'s health from qualified nutritionists and wellness experts.',
  // No default image - will use brand images from database
  image: '',
};

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

async function getSiteData(subdomain: string) {
  try {
    // Query DB directly instead of self-referencing HTTP call
    const result = await db.execute({
      sql: 'SELECT * FROM sites WHERE subdomain = ?',
      args: [subdomain]
    });

    if (result.rows.length > 0) {
      return result.rows[0];
    }
  } catch (error) {
    console.error('Error fetching site data for metadata:', error);
  }
  return null;
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id: subdomain } = await params;
  const site = await getSiteData(subdomain);

  // Parse brand profile if it's a string
  const brand = site?.brand_profile
    ? (typeof site.brand_profile === 'string' ? JSON.parse(site.brand_profile) : site.brand_profile)
    : null;

  // Parse settings if it's a string
  const siteSettings = site?.settings
    ? (typeof site.settings === 'string' ? JSON.parse(site.settings) : site.settings)
    : null;

  const siteName = brand?.name || site?.name || defaultMetadata.title;
  const title = brand?.name
    ? `${brand.name} - ${brand.tagline || 'Wellness Authority'}`
    : defaultMetadata.title;

  // Priority for description: settings.metaDescription > brand.bio > default
  const description = siteSettings?.metaDescription || brand?.bio || defaultMetadata.description;

  // Priority for OG image: sidebarImage > aboutImage > authorImage > profileImage
  // sidebarImage is typically the best quality image for social sharing
  const rawImage = brand?.sidebarImage || brand?.aboutImage || brand?.authorImage || brand?.profileImage || defaultMetadata.image;

  // Convert relative paths to absolute URLs for OG images
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
                  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const image = rawImage && rawImage.startsWith('/') ? `${baseUrl}${rawImage}` : rawImage;

  // Get analytics settings for domain verification
  const analytics = await getSiteAnalytics(subdomain);

  // Build other metadata for custom meta tags like Facebook domain verification
  const other: Record<string, string> = {};
  if (analytics?.metaDomainVerification) {
    other['facebook-domain-verification'] = analytics.metaDomainVerification;
  }

  // Site-specific keywords
  const siteKeywords = siteSettings?.metaKeywords || brand?.keywords || ['women\'s health', 'wellness', 'health authority'];

  return {
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },
    description,
    keywords: siteKeywords,
    authors: [{ name: siteName }],
    creator: siteName,
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName,
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: siteSettings?.social?.twitter || undefined,
    },
    icons: {
      icon: siteSettings?.faviconUrl || brand?.faviconUrl || '/favicon.ico',
      apple: siteSettings?.faviconUrl || brand?.faviconUrl || '/favicon.ico',
    },
    robots: {
      index: true,
      follow: true,
    },
    // Facebook domain verification - renders in <head> as:
    // <meta name="facebook-domain-verification" content="..." />
    ...(Object.keys(other).length > 0 && { other }),
  };
}

// Server-side function to get domain verification code for metadata
async function getSiteAnalytics(subdomain: string) {
  try {
    const result = await db.execute({
      sql: 'SELECT settings FROM sites WHERE subdomain = ?',
      args: [subdomain]
    });

    if (result.rows.length > 0) {
      const settings = result.rows[0].settings as string | null;
      if (settings) {
        const parsed = typeof settings === 'string' ? JSON.parse(settings) : settings;
        return parsed.analytics || null;
      }
    }
  } catch (error) {
    console.error('Error fetching site analytics:', error);
  }
  return null;
}

export default async function SiteLayout({ params, children }: Props) {
  const { id: subdomain } = await params;

  return (
    <>
      {/* Meta Pixel Provider - client component that loads pixel based on settings */}
      <SitePixelProvider siteId={subdomain} />

      {children}
    </>
  );
}
