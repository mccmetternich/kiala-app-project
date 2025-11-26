'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import SiteLayout from '@/components/layout/SiteLayout';
import { clientAPI } from '@/lib/api';
import { Play, Pause } from 'lucide-react';

// Mini audio player component for compact display
function AudioPlayerMini({ audioUrl }: { audioUrl: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100;
    setProgress(pct || 0);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        preload="metadata"
      />
      <button
        onClick={togglePlay}
        className="relative w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
      >
        {/* Progress ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="28"
            cy="28"
            r="25"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="3"
          />
          <circle
            cx="28"
            cy="28"
            r="25"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeDasharray={`${progress * 1.57} 157`}
            className="transition-all duration-100"
          />
        </svg>
        {isPlaying ? (
          <Pause className="w-6 h-6 text-white relative z-10" />
        ) : (
          <Play className="w-6 h-6 text-white relative z-10 ml-0.5" />
        )}
      </button>
    </>
  );
}

export default function AboutPage() {
  const params = useParams();
  const siteId = params?.id as string;
  const [siteData, setSiteData] = useState<any>(null);
  const [pageContent, setPageContent] = useState<any>(null);
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [emailMessage, setEmailMessage] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setEmailStatus('error');
      setEmailMessage('Please enter a valid email address');
      return;
    }
    setEmailStatus('loading');
    try {
      const response = await fetch('/api/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          siteId: siteId || 'default',
          source: 'about_page_eguide'
        }),
      });
      if (response.ok) {
        setEmailStatus('success');
        setEmailMessage('Check your inbox for your free Welcome E-Guide!');
        setEmail('');
      } else {
        const data = await response.json();
        setEmailStatus('error');
        setEmailMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setEmailStatus('error');
      setEmailMessage('Unable to subscribe. Please try again later.');
    }
  };

  useEffect(() => {
    async function loadData() {
      if (!siteId) {
        setLoading(false);
        return;
      }
      try {
        // Fetch site data
        const site = await clientAPI.getSiteBySubdomain(siteId);
        if (site) {
          setSiteData(site);

          // Try to fetch About page content from database
          try {
            const aboutPage = await fetch(`/api/pages?siteId=${site.id}&slug=about`);
            if (aboutPage.ok) {
              const pageData = await aboutPage.json();
              if (pageData.length > 0 && pageData[0].published) {
                setPageContent(pageData[0]);
              }
            }
          } catch (error) {
            console.log('No custom about page found, using default brand profile');
          }

          // Fetch recent articles
          try {
            const articlesResponse = await fetch(`/api/articles?siteId=${site.id}&published=true`);
            if (articlesResponse.ok) {
              const articlesData = await articlesResponse.json();
              setRecentArticles((articlesData.articles || []).slice(0, 3));
            }
          } catch (error) {
            console.log('Error fetching recent articles:', error);
          }
        }
      } catch (error) {
        console.error('Error loading about page:', error);
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
          <p className="text-gray-600">Loading about page...</p>
        </div>
      </div>
    );
  }

  const transformedSite = siteData ? {
    ...siteData,
    brand: typeof siteData.brand_profile === 'string' 
      ? JSON.parse(siteData.brand_profile) 
      : siteData.brand_profile,
    settings: typeof siteData.settings === 'string' 
      ? JSON.parse(siteData.settings)
      : siteData.settings
  } : null;

  if (!transformedSite) {
    return <div>Site not found.</div>;
  }

  const brand = transformedSite.brand;

  return (
    <SiteLayout
      site={transformedSite}
      showSidebar={false}
    >
      <div className="space-y-12">
        {/* Custom Page Content or Default Doctor Profile */}
        {pageContent ? (
          /* Custom Admin-Editable Content */
          (() => {
            // Parse content if it's JSON, otherwise treat as HTML
            let parsedContent: any = null;
            try {
              parsedContent = typeof pageContent.content === 'string'
                ? JSON.parse(pageContent.content)
                : pageContent.content;
            } catch {
              // Not JSON, will render as HTML
            }

            if (parsedContent && typeof parsedContent === 'object' && parsedContent.story) {
              // Render structured JSON content
              return (
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{parsedContent.heading || pageContent.title}</h1>
                  </div>

                  {/* Story */}
                  <div className="prose prose-lg max-w-none mb-8">
                    {parsedContent.story.split('\n\n').map((paragraph: string, idx: number) => (
                      <p key={idx} className="text-gray-700 leading-relaxed mb-4">{paragraph}</p>
                    ))}
                  </div>

                  {/* Credentials */}
                  {parsedContent.credentials && parsedContent.credentials.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-6 mt-8">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Credentials & Experience</h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {parsedContent.credentials.map((credential: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2 text-gray-700">
                            <span className="text-green-500">✓</span>
                            {credential}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            }

            // Fallback: render as HTML
            return (
              <div className="prose prose-lg max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">{pageContent.title}</h1>
                </div>
                <div dangerouslySetInnerHTML={{ __html: pageContent.content }} />
              </div>
            );
          })()
        ) : (
          /* Default Doctor Profile Layout */
          <>
            {/* Hero Section - Beautifully Balanced Layout */}
            <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 rounded-3xl overflow-hidden shadow-xl border border-gray-100">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Left: Large Profile Image */}
                <div className="relative h-80 md:h-auto md:min-h-[500px]">
                  <img
                    src={brand.aboutImage || brand.profileImage || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=600&fit=crop'}
                    alt={brand.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/20 md:to-purple-50/80" />
                </div>

                {/* Right: Content */}
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  {/* Header */}
                  <div className="mb-6">
                    <p className="text-purple-600 font-semibold text-sm uppercase tracking-wide mb-2">About</p>
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                      Meet {brand.name}
                    </h1>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      {brand.tagline}
                    </p>
                  </div>

                  {/* Credentials */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full text-sm text-gray-700 border border-gray-200">
                      🎓 Board Certified
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full text-sm text-gray-700 border border-gray-200">
                      📚 MS Nutrition
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full text-sm text-gray-700 border border-gray-200">
                      ⭐ 15+ Years Experience
                    </span>
                  </div>

                  {/* Quote */}
                  <blockquote className="relative mb-8">
                    <div className="absolute -top-2 -left-2 text-5xl text-purple-200 font-serif">"</div>
                    <p className="text-lg text-gray-700 italic leading-relaxed pl-6">
                      {brand.quote}
                    </p>
                  </blockquote>

                  {/* Audio Player - Compact inline version */}
                  {transformedSite.settings?.aboutAudioUrl && (
                    <div className="bg-white/60 backdrop-blur rounded-xl p-4 border border-purple-100">
                      <div className="flex items-center gap-4">
                        <AudioPlayerMini audioUrl={transformedSite.settings.aboutAudioUrl} />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">Personal Message</p>
                          <p className="text-xs text-gray-500">Listen to my story</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bio / My Story - Expanded */}
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">My Story</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed mb-6">
                  {brand.bio}
                </p>
                <blockquote className="border-l-4 border-primary-500 pl-6 italic text-lg text-gray-800 my-8">
                  "{brand.quote}"
                </blockquote>
                <p className="text-gray-700 leading-relaxed mb-6">
                  My journey began when I realized that conventional approaches
                  weren't addressing the root causes of women's health challenges. Through years of
                  research and practice, I've developed protocols that combine the best of
                  evidence-based medicine with natural healing approaches.
                </p>
                <p className="text-gray-700 leading-relaxed mb-6">
                  After helping thousands of women in my clinical practice, I noticed a pattern: most women over 40 were struggling with the same issues - stubborn weight gain, fatigue, brain fog, and hormonal imbalances that no one seemed to take seriously. The standard advice of "eat less, move more" wasn't working because it failed to address the underlying metabolic and hormonal shifts happening in their bodies.
                </p>
                <p className="text-gray-700 leading-relaxed mb-6">
                  That's when I dedicated myself to finding real solutions. I spent years studying functional medicine, gut health, and hormone optimization. I tested different protocols on myself first, then refined them with my patients. The results were transformative - women were finally getting their energy back, losing the stubborn weight, and feeling like themselves again.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Today, I'm on a mission to share these evidence-based protocols with women everywhere. You don't have to accept feeling tired and frustrated as "just part of getting older." There's a better way, and I'm here to guide you through it.
                </p>
              </div>
            </div>

            {/* Second Email Capture - Welcome E-Guide */}
            <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-2xl p-8 border border-primary-100 shadow-lg">
              <div className="max-w-2xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <span>🎁</span>
                  Free Instant Download
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                  Get Your Free Welcome E-Guide
                </h3>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Start your wellness journey today with my exclusive guide to balancing hormones naturally.
                  Inside you'll discover the 5 key strategies that have helped thousands of women reclaim their energy and vitality.
                </p>
                <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={emailStatus === 'loading'}
                  />
                  <button
                    type="submit"
                    disabled={emailStatus === 'loading'}
                    className="bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {emailStatus === 'loading' ? 'Sending...' : 'Send My Guide'}
                  </button>
                </form>
                {emailMessage && (
                  <p className={`mt-3 text-sm ${emailStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {emailMessage}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-4">
                  Join 47,000+ women who have transformed their health. No spam, unsubscribe anytime.
                </p>
              </div>
            </div>

            {/* Recent Articles */}
            {recentArticles.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Recent Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recentArticles.map((article) => (
                    <a
                      key={article.id}
                      href={`/site/${siteId}/articles/${article.slug}`}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      {article.image && (
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                          {article.title}
                        </h3>
                        {article.excerpt && (
                          <p className="text-gray-600 text-sm line-clamp-3">
                            {article.excerpt}
                          </p>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </SiteLayout>
  );
}