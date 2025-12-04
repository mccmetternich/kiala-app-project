'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import SiteLayout from '@/components/layout/SiteLayout';
import CredibilitySidebar from '@/components/CredibilitySidebar';
import { clientAPI } from '@/lib/api';
import { Star, ChevronLeft, ChevronRight, ArrowRight, Zap } from 'lucide-react';
import { getCommunityCount, formatCountShort, formatCountFull } from '@/lib/format-community-count';

function ImageCarousel({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (images.length === 1) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-xl">
        <img
          src={images[0]}
          alt="Transformation"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
      <img
        src={images[currentIndex]}
        alt={`Transformation ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-opacity duration-300"
      />
      
      {/* BEFORE/AFTER Tags for multiple images */}
      {images.length > 1 && (
        <div className="absolute top-3 left-3">
          <span className="bg-gradient-to-r from-purple-400 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            {currentIndex === 0 ? 'BEFORE' : 'AFTER'}
          </span>
        </div>
      )}
      
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const successStories = [
  {
    id: '1',
    name: 'Sarah Johnson',
    age: 42,
    location: 'Austin, TX',
    timeframe: '90 days',
    weightLoss: '28 lbs',
    story: 'After struggling with weight gain and low energy for years after hitting 40, I was skeptical about yet another program. But this approach was different - it addressed my hormones, not just my diet. The results speak for themselves!',
    highlights: [
      'Lost 28 pounds in 90 days',
      'Energy levels increased dramatically',
      'Sleep quality improved significantly',
      'Reduced joint pain and inflammation'
    ],
    quote: 'I finally feel like myself again. The hormone reset kit changed everything for me.',
    transformationImages: [
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=300&h=300&fit=crop'
    ],
    favoriteProduct: {
      name: 'Complete Hormone Reset Kit',
      description: 'The exact 3-step system that helped Sarah balance her hormones naturally',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150&h=120&fit=crop',
      price: 97,
      originalPrice: 197,
      link: '/top-picks'
    }
  },
  {
    id: '2',
    name: 'Jennifer Chen',
    age: 45,
    location: 'Seattle, WA',
    timeframe: '6 months',
    weightLoss: '35 lbs',
    story: 'My thyroid levels were "normal" according to my results, but I felt terrible. The thyroid protocol helped me understand what my body really needed. Six months later, I\'m a new person.',
    highlights: [
      'Lost 35 pounds steadily',
      'Brain fog completely cleared',
      'Stopped afternoon energy crashes',
      'Hair and nails became stronger'
    ],
    quote: 'The thyroid support bundle gave me my life back. I wish I had found this sooner!',
    transformationImages: [
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop'
    ],
    favoriteProduct: {
      name: 'Thyroid Support Bundle',
      description: 'Complete thyroid optimization protocol including supplements and lifestyle guide',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=150&h=120&fit=crop',
      price: 87,
      originalPrice: 127,
      link: '/top-picks'
    }
  },
  {
    id: '3',
    name: 'Lisa Rodriguez',
    age: 38,
    location: 'Phoenix, AZ',
    timeframe: '4 months',
    weightLoss: '22 lbs',
    story: 'I was constantly bloated and uncomfortable. Nothing seemed to help until I discovered this gut health approach. The transformation has been incredible - inside and out.',
    highlights: [
      'Eliminated chronic bloating',
      'Lost 22 pounds of inflammation',
      'Digestive issues resolved',
      'Skin cleared up dramatically'
    ],
    quote: 'Healing my gut was the key to everything. I feel amazing and look better than I did in my 20s!',
    transformationImages: [
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop'
    ],
    favoriteProduct: {
      name: 'Gut Health Reset Program',
      description: 'Heal your gut, balance your hormones, and unlock sustainable weight loss',
      image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=150&h=120&fit=crop',
      price: 97,
      originalPrice: 147,
      link: '/top-picks'
    }
  },
  {
    id: '4',
    name: 'Michelle Parker',
    age: 41,
    location: 'Denver, CO',
    timeframe: '3 months',
    weightLoss: '18 lbs',
    story: 'Sleepless nights were ruining my life and my health. This sleep protocol didn\'t just help me sleep better - it transformed my entire well-being.',
    highlights: [
      'Sleep quality improved 300%',
      'Lost 18 pounds effortlessly',
      'Morning energy increased',
      'Mood and focus dramatically better'
    ],
    quote: 'Great sleep was the foundation I needed for everything else. This program saved my sanity!',
    transformationImages: [
      'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=300&h=300&fit=crop'
    ],
    favoriteProduct: {
      name: 'Sleep & Recovery System',
      description: 'Complete sleep protocol to fall asleep faster and wake up energized',
      image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=150&h=120&fit=crop',
      price: 67,
      originalPrice: 89,
      link: '/top-picks'
    }
  }
];

export default function SuccessStoriesPage() {
  const params = useParams();
  const siteId = params?.id as string;
  const [siteData, setSiteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!siteId) return;
      try {
        const site = await clientAPI.getSiteBySubdomain(siteId);
        setSiteData(site);
      } catch (error) {
        console.error('Error loading site data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [siteId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading success stories...</p>
        </div>
      </div>
    );
  }

  if (!siteData) {
    return <div>Site not found</div>;
  }

  const transformedSite = {
    ...siteData,
    brand: typeof siteData.brand_profile === 'string' ? JSON.parse(siteData.brand_profile) : siteData.brand_profile,
    settings: typeof siteData.settings === 'string' ? JSON.parse(siteData.settings) : siteData.settings,
    page_config: typeof siteData.page_config === 'string' ? JSON.parse(siteData.page_config || '{}') : siteData.page_config || {}
  };

  // Check if this page is enabled in page_config
  const pageConfig = transformedSite.page_config;
  if (pageConfig?.pages) {
    const successPage = pageConfig.pages.find((p: any) => p.id === 'success-stories' || p.slug === '/success-stories');
    if (successPage && !successPage.enabled) {
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
      site={transformedSite}
      showSidebar={true}
      pageSlug="/success-stories"
      sidebar={
        <CredibilitySidebar
          doctor={transformedSite.brand}
          leadMagnet={transformedSite.settings?.emailCapture?.leadMagnet}
          communityCount={getCommunityCount(transformedSite.settings)}
          showLeadMagnet={true}
          siteId={siteId}
          audioTrackUrl={transformedSite.settings?.audioUrl || "/audio/dr-amy-welcome.mp3"}
        />
      }
    >
      <div className="space-y-12">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <div className="flex -space-x-1">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop&crop=face" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="" />
              <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="" />
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop&crop=face" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="" />
              <div className="w-8 h-8 bg-primary-500 text-white rounded-full border-2 border-white flex items-center justify-center text-xs font-bold">
                {formatCountShort(getCommunityCount(transformedSite.settings))}
              </div>
            </div>
            <span className="text-gray-600 font-medium">real transformations</span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">Success Stories</h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Real people, real results. See how women just like you transformed their lives.
          </p>
          <p className="text-lg text-primary-600 font-semibold max-w-3xl mx-auto mb-6">
            Your success story could be next! 💪
          </p>
          
          <div className="flex justify-center items-center gap-1 mb-8">
            {[1,2,3,4,5].map((star) => (
              <Star key={star} className="w-6 h-6 fill-current text-accent-400" />
            ))}
            <span className="text-gray-600 font-semibold ml-2">4.9/5 from {formatCountFull(getCommunityCount(transformedSite.settings))} transformations</span>
          </div>
        </div>

        {/* Success Stories */}
        <div className="space-y-16">
          {successStories.map((story) => (
            <div key={story.id} className="bg-white rounded-3xl border-2 border-gray-300 shadow-xl overflow-hidden">
              <div className="p-8 lg:p-12">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start mb-8">
                  {/* Story Content */}
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{story.name}</h3>
                        <p className="text-gray-600">{story.age} years old • {story.location}</p>
                      </div>
                      <div className="ml-auto text-right">
                        <div className="bg-gradient-to-r from-purple-400 to-purple-500 text-white px-4 py-2 rounded-full shadow-lg">
                          <div className="text-2xl font-bold">-{story.weightLoss}</div>
                          <div className="text-xs">in {story.timeframe}</div>
                        </div>
                      </div>
                    </div>

                    {/* Quote */}
                    <blockquote className="text-lg italic text-gray-800 border-l-4 border-accent-300 pl-6">
                      "{story.quote}"
                    </blockquote>

                    {/* Story */}
                    <p className="text-gray-700 leading-relaxed">
                      {story.story}
                    </p>

                    {/* Highlights */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">Key Results:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {story.highlights.map((highlight, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">
                              ✓
                            </div>
                            <span className="text-sm text-gray-700">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Images */}
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-900 mb-4">Transformation Journey</h4>
                    <ImageCarousel images={story.transformationImages} />
                    <p className="text-xs text-gray-500 mt-2">
                      {story.transformationImages.length > 1 ? 'Swipe to see progress photos' : 'Transformation photo'}
                    </p>
                  </div>
                </div>

                {/* Featured Product - Full Width */}
                <div className="bg-gradient-to-br from-accent-50 to-primary-50 rounded-2xl p-6 border border-accent-200">
                  <div className="text-center mb-6">
                    <span className="bg-secondary-100 text-secondary-700 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide">
                      {story.name.split(' ')[0]}'s Favorite Product
                    </span>
                  </div>
                  
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <img 
                        src={story.favoriteProduct.image}
                        alt={story.favoriteProduct.name}
                        className="w-32 h-24 rounded-lg object-cover shadow-md"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-gray-900 text-lg mb-2">{story.favoriteProduct.name}</h5>
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">{story.favoriteProduct.description}</p>
                      
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-2xl font-bold text-gray-900">${story.favoriteProduct.price}</div>
                        <div className="text-lg text-gray-500 line-through">${story.favoriteProduct.originalPrice}</div>
                        <div className="bg-accent-100 text-accent-700 px-3 py-1 rounded-full text-sm font-bold">
                          Save ${story.favoriteProduct.originalPrice - story.favoriteProduct.price}
                        </div>
                      </div>
                      
                      <a 
                        href={story.favoriteProduct.link}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-bold px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      >
                        Get This Product
                        <ArrowRight className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-br from-accent-500 to-primary-600 rounded-3xl p-8 lg:p-12 text-white text-center shadow-2xl">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center items-center gap-2 mb-6">
              <Zap className="w-8 h-8 text-accent-100" />
              <span className="text-accent-100 font-semibold text-lg">Ready for Your Transformation?</span>
              <Zap className="w-8 h-8 text-accent-100" />
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              These People Saw Results Because They Used 
              <br />
              <span className="text-accent-100">Our Proven Systems</span>
            </h2>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Every success story you just read started with the same decision: choosing to invest in their health 
              with our evidence-based protocols. Your transformation could be next.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <div className="flex -space-x-2">
                <img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=40&h=40&fit=crop&crop=face" className="w-10 h-10 rounded-full border-2 border-white shadow-lg" alt="" />
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face" className="w-10 h-10 rounded-full border-2 border-white shadow-lg" alt="" />
                <img src="https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=40&h=40&fit=crop&crop=face" className="w-10 h-10 rounded-full border-2 border-white shadow-lg" alt="" />
                <div className="w-10 h-10 bg-accent-400 text-white rounded-full border-2 border-white flex items-center justify-center text-sm font-bold">
                  {formatCountShort(getCommunityCount(transformedSite.settings))}
                </div>
              </div>
              <div className="text-white/90">
                <div className="font-bold">Join {formatCountFull(getCommunityCount(transformedSite.settings))} people</div>
                <div className="text-sm">who've already transformed their lives</div>
              </div>
            </div>
            
            <a 
              href={`/site/${siteId}/top-picks`}
              className="inline-flex items-center gap-3 bg-white hover:bg-gray-50 text-accent-600 font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-lg"
            >
              Explore Our Top Picks
              <ArrowRight className="w-6 h-6" />
            </a>
            
            <p className="text-accent-100 text-sm mt-4">
              30-day money-back guarantee • Instant access • Premium support included
            </p>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}