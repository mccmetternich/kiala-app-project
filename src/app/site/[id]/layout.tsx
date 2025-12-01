import type { Metadata, ResolvingMetadata } from 'next';

// Default metadata for the site
const defaultMetadata = {
  title: 'Dr. Amy Heart - Women\'s Health Authority',
  description: 'Join one of the fastest-growing communities of women over 40 discovering breakthrough research, evidence-based protocols, and transformative wellness strategies. Dr. Amy Heart shares clinically-validated insights that have helped thousands reclaim their energy, balance their hormones, and feel vibrant again.',
  image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1200&h=630&fit=crop',
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
  const image = brand?.profileImage || brand?.authorImage || defaultMetadata.image;

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
  };
}

export default function SiteLayout({ children }: Props) {
  return <>{children}</>;
}
