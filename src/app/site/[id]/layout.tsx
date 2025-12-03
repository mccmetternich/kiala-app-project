import type { Metadata, ResolvingMetadata } from 'next';
import SitePixelProvider from '@/components/SitePixelProvider';
import db from '@/lib/db-enhanced';

// Default metadata for the site - fallback only when no brand profile exists
const defaultMetadata = {
  title: 'Dr. Amy Heart - Women\'s Health Authority',
  description: 'Join one of the fastest-growing communities of women over 40 discovering breakthrough research, evidence-based protocols, and transformative wellness strategies. Dr. Amy Heart shares clinically-validated insights that have helped thousands reclaim their energy, balance their hormones, and feel vibrant again.',
  // No default image - will use brand images from database
  image: '',
};

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

async function getSiteData(subdomain: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
                    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
                    'http://localhost:3000';

    const response = await fetch(`${baseUrl}/api/sites?subdomain=${subdomain}`, {
      next: { revalidate: 60 } // Cache for 60 seconds
    });

    if (response.ok) {
      const data = await response.json();
      return data.site;
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

  const title = brand?.name
    ? `${brand.name} - Women's Health Authority`
    : defaultMetadata.title;

  const description = brand?.bio || defaultMetadata.description;

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

  return {
    title: {
      default: title,
      template: `%s | ${brand?.name || 'Dr. Amy Heart'}`,
    },
    description,
    keywords: ['women\'s health', 'hormone balance', 'menopause', 'wellness', 'weight loss after 40', 'energy', 'Dr. Amy Heart'],
    authors: [{ name: brand?.name || 'Dr. Amy Heart' }],
    creator: brand?.name || 'Dr. Amy Heart',
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName: brand?.name || 'Dr. Amy Heart',
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: brand?.name || 'Dr. Amy Heart',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@dramyheart',
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
