import { useEffect, useState } from 'react';
import { Site } from '@/types';

// Fallback site data for when no site is found
export const fallbackSite: Site = {
  id: 'fallback-site',
  subdomain: 'dr-amy',
  name: 'Health Authority',
  domain: 'example.com',
  theme: {
    name: 'Medical Authority',
    colors: {
      primary: '#1e40af',
      secondary: '#059669', 
      accent: '#dc2626',
      trust: '#0369a1',
      background: '#fefefe',
      text: '#374151'
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter'
    },
    style: 'medical'
  },
  brand: {
    name: 'Health Authority',
    tagline: 'Your trusted source for health information',
    bio: 'We are a team of health experts dedicated to providing you with the most accurate and up-to-date health information.',
    logo: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=100&h=100&fit=crop',
    profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop',
    quote: 'True wellness comes from understanding your body\'s unique needs.'
  },
  settings: {
    navigation: [
      { label: 'Home', url: '/site/dr-amy', type: 'internal' },
      { label: 'Articles', url: '/site/dr-amy/articles', type: 'internal' },
      { label: 'My Top Picks', url: '/site/dr-amy/top-picks', type: 'internal' },
      { label: 'Success Stories', url: '/site/dr-amy/success-stories', type: 'internal' },
      { label: 'About', url: '/site/dr-amy/about', type: 'internal' }
    ],
    footer: {
      disclaimer: 'This information is for educational purposes only.',
      privacyPolicy: '/privacy',
      termsOfService: '/terms',
      contact: {
        email: 'hello@example.com',
        phone: '(555) 123-4567'
      }
    },
    emailCapture: {
      provider: 'convertkit',
      apiKey: 'test-key',
      listId: 'test-list',
      leadMagnet: {
        title: 'Health Guide',
        description: 'Get your free health guide',
        downloadUrl: '/downloads/guide.pdf',
        image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=100&h=100&fit=crop'
      }
    },
    social: {
      instagram: 'https://instagram.com/example',
      facebook: 'https://facebook.com/example',
      youtube: 'https://youtube.com/example'
    }
  },
  pages: [],
  createdAt: new Date(),
  updatedAt: new Date()
};

export function useSite(siteId: string) {
  const [siteData, setSiteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSite() {
      if (!siteId) {
        setError('No site ID provided');
        setLoading(false);
        return;
      }

      try {
        // Try fetching by subdomain first
        const response = await fetch(`/api/sites?subdomain=${siteId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.site) {
            setSiteData(data.site);
          } else {
            console.warn('Site not found, using fallback');
            setSiteData(fallbackSite);
          }
        } else {
          console.warn('Site not found, using fallback');
          setSiteData(fallbackSite);
        }
      } catch (err) {
        console.error('Error loading site:', err);
        setSiteData(fallbackSite);
        setError('Failed to load site');
      } finally {
        setLoading(false);
      }
    }

    loadSite();
  }, [siteId]);

  // Transform database site data to match the Site interface
  const transformedSite = siteData ? {
    ...fallbackSite,
    ...siteData,
    brand: typeof siteData.brand_profile === 'string' 
      ? JSON.parse(siteData.brand_profile) 
      : siteData.brand_profile || fallbackSite.brand,
    settings: typeof siteData.settings === 'string' 
      ? { ...fallbackSite.settings, ...JSON.parse(siteData.settings) } 
      : { ...fallbackSite.settings, ...siteData.settings }
  } : fallbackSite;

  return { site: transformedSite, loading, error };
}