'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import SiteLayout from '@/components/layout/SiteLayout';
import CredibilitySidebar from '@/components/CredibilitySidebar';
import { useSite } from '@/lib/useSite';
import { Star, Clock, Users, Zap, Shield, TrendingUp, Heart } from 'lucide-react';
import { getCommunityCount, formatCountShort, formatCountFull } from '@/lib/format-community-count';

// Mock top picks data - this would come from admin in real implementation
const topPicks = [
  {
    id: '1',
    title: 'Complete Hormone Reset Kit',
    description: 'My #1 recommended 3-step system for naturally balancing hormones and boosting metabolism after 40.',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=200&fit=crop',
    originalPrice: 197,
    currentPrice: 97,
    rating: 4.9,
    reviews: 2847,
    recentPurchases: 1247,
    category: 'Hormone Health',
    benefits: [
      'Balances cortisol and insulin naturally',
      'Boosts metabolism by up to 156%',
      'Reduces cravings within 48 hours',
      'Includes exclusive meal plans'
    ],
    featured: true,
    exclusive: true,
    timeLeft: '72 hours',
    popularityTag: 'MOST POPULAR',
    purchaseUrl: 'https://example.com/hormone-reset-kit'
  },
  {
    id: '2',
    title: 'Thyroid Support Bundle',
    description: 'Comprehensive thyroid optimization protocol including supplements and lifestyle guide.',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop',
    originalPrice: 127,
    currentPrice: 87,
    rating: 4.8,
    reviews: 1432,
    recentPurchases: 847,
    category: 'Thyroid Health',
    benefits: [
      'Supports healthy T3/T4 conversion',
      'Reduces brain fog and fatigue',
      'Includes iodine and selenium',
      '90-day transformation plan'
    ],
    featured: false,
    exclusive: true,
    timeLeft: '5 days',
    popularityTag: 'TRENDING',
    purchaseUrl: 'https://example.com/thyroid-support-bundle'
  },
  {
    id: '3',
    title: 'Sleep & Recovery System',
    description: 'Fall asleep faster, sleep deeper, and wake up energized with this complete sleep protocol.',
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=300&h=200&fit=crop',
    originalPrice: 89,
    currentPrice: 67,
    rating: 4.7,
    reviews: 1089,
    recentPurchases: 623,
    category: 'Sleep Health',
    benefits: [
      'Natural melatonin optimization',
      'Stress-reduction protocols',
      'Sleep tracking journal',
      '2-minute wind-down routine'
    ],
    featured: false,
    exclusive: false,
    timeLeft: '1 week',
    popularityTag: 'NEW',
    purchaseUrl: 'https://example.com/sleep-recovery-system'
  },
  {
    id: '4',
    title: 'Gut Health Reset Program',
    description: 'Heal your gut, balance your hormones, and unlock sustainable weight loss in 21 days.',
    image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=300&h=200&fit=crop',
    originalPrice: 147,
    currentPrice: 97,
    rating: 4.9,
    reviews: 1876,
    recentPurchases: 956,
    category: 'Digestive Health',
    benefits: [
      'Eliminates bloating within 7 days',
      'Heals leaky gut naturally',
      'Includes probiotic recommendations',
      'Anti-inflammatory meal plans'
    ],
    featured: false,
    exclusive: true,
    timeLeft: '3 days',
    popularityTag: 'LIMITED TIME',
    purchaseUrl: 'https://example.com/gut-health-reset-program'
  }
];

export default function TopPicksPage() {
  const params = useParams();
  const siteId = params?.id as string;
  // publishedOnly=true for public pages
  const { site, loading: siteLoading, notFound } = useSite(siteId, true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (loading || siteLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading top picks...</p>
        </div>
      </div>
    );
  }

  // Site not found or not published - show 404
  if (notFound || !site) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Site Not Available</h1>
          <p className="text-gray-600 mb-6">
            This site is currently unavailable. It may be temporarily offline or no longer exists.
          </p>
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  // Check if this page is enabled in page_config
  const pageConfig = site?.page_config;
  if (pageConfig?.pages) {
    const topPicksPage = pageConfig.pages.find((p: any) => p.id === 'top-picks' || p.slug === '/top-picks');
    if (topPicksPage && !topPicksPage.enabled) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">This page is not available.</p>
          </div>
        </div>
      );
    }
  }

  return (
    <SiteLayout
      site={site}
      showSidebar={true}
      pageSlug="/top-picks"
      sidebar={
        <CredibilitySidebar
          doctor={site.brand}
          leadMagnet={site.settings?.emailCapture?.leadMagnet}
          communityCount={getCommunityCount(site.settings)}
          showLeadMagnet={true}
          siteId={siteId}
          audioTrackUrl={site.settings?.audioUrl || "/audio/dr-amy-welcome.mp3"}
        />
      }
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <div className="flex -space-x-1">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop&crop=face" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="" />
              <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="" />
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop&crop=face" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="" />
              <div className="w-8 h-8 bg-primary-500 text-white rounded-full border-2 border-white flex items-center justify-center text-xs font-bold">
                {formatCountShort(getCommunityCount(site.settings))}
              </div>
            </div>
            <span className="text-gray-600 font-medium">trusted by women worldwide</span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">⭐ My Top Picks</h1>
          <p className="text-lg text-primary-600 font-semibold max-w-3xl mx-auto mb-6">
            Exclusive community discounts on my favorite wellness solutions! ✨
          </p>
          
          <div className="flex justify-center items-center gap-1 mb-6">
            {[1,2,3,4,5].map((star) => (
              <Star key={star} className="w-6 h-6 fill-current text-accent-400" />
            ))}
            <span className="text-gray-600 font-semibold ml-2">4.8/5 from {formatCountFull(getCommunityCount(site.settings))} women</span>
          </div>

          {/* Exclusive member banner */}
          <div className="bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-xl p-4 mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="w-5 h-5" />
              <span className="font-bold">EXCLUSIVE COMMUNITY MEMBER PRICING</span>
            </div>
            <p className="text-accent-100 text-sm">
              Save 40-60% on everything below • Limited time offers • Access expires in 
              <span className="font-bold text-white"> 3 days</span>
            </p>
          </div>
        </div>

        {/* Top Picks Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {topPicks.map((pick, index) => (
            <div key={pick.id} className={`relative bg-white rounded-2xl border-2 shadow-xl overflow-hidden ${
              pick.featured ? 'border-accent-300 ring-4 ring-accent-100' : 'border-gray-200'
            }`}>
              
              {/* Featured badge */}
              {pick.featured && (
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-accent-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    #1 PICK
                  </div>
                </div>
              )}

              {/* Popularity badge */}
              <div className="absolute top-4 right-4 z-10">
                <div className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
                  pick.popularityTag === 'MOST POPULAR' ? 'bg-red-500' :
                  pick.popularityTag === 'TRENDING' ? 'bg-orange-500' :
                  pick.popularityTag === 'LIMITED TIME' ? 'bg-purple-500' :
                  'bg-green-500'
                }`}>
                  {pick.popularityTag}
                </div>
              </div>

              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={pick.image} 
                  alt={pick.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              <div className="p-6">
                {/* Category and rating */}
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                    {pick.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-current text-accent-400" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({pick.reviews})</span>
                  </div>
                </div>

                {/* Title and description */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">{pick.title}</h3>
                <p className="text-gray-700 mb-4 leading-relaxed">{pick.description}</p>

                {/* Benefits */}
                <div className="space-y-2 mb-5">
                  {pick.benefits.slice(0, 3).map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">
                        ✓
                      </div>
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Social proof */}
                <div className="flex items-center gap-4 mb-5 text-sm">
                  {pick.exclusive && (
                    <div className="flex items-center gap-1 text-purple-600">
                      <Shield className="w-4 h-4" />
                      <span className="font-medium">Exclusive</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-green-600">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">{pick.recentPurchases} women</span>
                    <span className="text-gray-600">unlocked today</span>
                  </div>
                </div>

                {/* Pricing */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                    Save ${pick.originalPrice - pick.currentPrice}
                  </div>
                  <div className="w-px h-6 bg-gray-300"></div>
                  <div className="text-3xl font-bold text-gray-900">${pick.currentPrice}</div>
                  <div className="text-lg text-gray-500 line-through">${pick.originalPrice}</div>
                </div>

                {/* CTA */}
                <a 
                  href={pick.purchaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 mb-3 text-center"
                >
                  Get Instant Access
                </a>

                {/* Urgency - moved below CTA */}
                <div className="text-center mb-5">
                  <div className="flex items-center justify-center gap-2 text-red-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Only {pick.timeLeft} left at this price!</span>
                  </div>
                </div>

                {/* Trust signals */}
                <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs">
                  <div>
                    <div className="font-bold text-gray-900">30-Day</div>
                    <div className="text-gray-600">Money Back</div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Instant</div>
                    <div className="text-gray-600">Access</div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Premium</div>
                    <div className="text-gray-600">Support</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </SiteLayout>
  );
}