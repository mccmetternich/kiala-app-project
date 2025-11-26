'use client';

import { useState } from 'react';
import { Heart, Eye, Clock, TrendingUp, Flame, Sparkles, Mail, CheckCircle } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  excerpt?: string;
  image?: string;
  slug: string;
  category?: string;
  featured?: boolean;
  trending?: boolean;
  views?: number;
  read_time?: number;
  created_at?: string;
}

interface ArticleGridProps {
  articles?: Article[];
  siteId?: string;
  title?: string;
  showFeatured?: boolean;
  showProductTile?: boolean;
  showEmailCapture?: boolean;
}

// Helper to determine badge type
function getArticleBadge(article: Article) {
  if (article.trending) return { label: 'TRENDING', icon: TrendingUp, color: 'bg-red-500' };
  if (article.featured) return { label: 'HOT', icon: Flame, color: 'bg-orange-500' };
  // Check if article is less than 7 days old
  if (article.created_at) {
    const daysSinceCreation = Math.floor((Date.now() - new Date(article.created_at).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceCreation < 7) return { label: 'NEW', icon: Sparkles, color: 'bg-green-500' };
  }
  return null;
}

// Default hero image for articles without images
const DEFAULT_ARTICLE_IMAGE = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop';

// Email capture component for the grid
function EmailCaptureTile({ siteId }: { siteId?: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setStatus('loading');
    try {
      const response = await fetch('/api/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          siteId: siteId || 'default',
          source: 'articles_grid'
        }),
      });

      if (response.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="md:col-span-2 bg-gradient-to-br from-primary-500 via-primary-600 to-purple-700 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="p-8 text-white">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <span className="text-white/80 text-sm font-medium">JOIN 47K+ WOMEN</span>
        </div>

        <h3 className="text-2xl font-bold mb-3">
          Get Exclusive Wellness Tips
        </h3>
        <p className="text-white/90 mb-6">
          Be the first to know about new articles, protocols & special offers. No spam, ever.
        </p>

        {status === 'success' ? (
          <div className="flex items-center gap-3 bg-green-500/30 rounded-lg p-4">
            <CheckCircle className="w-6 h-6 text-green-300" />
            <span className="font-medium">You're in! Check your inbox.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email..."
              className="w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50"
              disabled={status === 'loading'}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-white text-primary-600 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50"
            >
              {status === 'loading' ? 'Joining...' : 'Join the Community →'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="text-red-200 text-sm mt-2">Something went wrong. Try again!</p>
        )}

        <div className="flex items-center gap-4 mt-4 text-sm text-white/70">
          <span className="flex items-center gap-1">
            <Sparkles className="w-4 h-4" /> Weekly tips
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-4 h-4" /> No spam
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ArticleGrid({
  articles = [],
  siteId,
  title = "Latest Articles",
  showFeatured = false,
  showProductTile = false,
  showEmailCapture = true
}: ArticleGridProps) {
  // Filter featured articles if showFeatured is true
  const displayArticles = showFeatured
    ? articles.filter(article => article.featured)
    : articles;

  // Insert product tile after 3rd article if showProductTile is true
  const articlesWithSpecialTiles = [...displayArticles];
  if (showProductTile && articlesWithSpecialTiles.length > 3) {
    articlesWithSpecialTiles.splice(3, 0, {
      id: 'product-tile',
      title: '',
      slug: '',
      isProductTile: true
    } as any);
  }

  // Insert email capture early in the grid (position 3-4 for second row) if showEmailCapture is true
  if (showEmailCapture && articlesWithSpecialTiles.length > 2) {
    const insertPosition = Math.min(3, articlesWithSpecialTiles.length);
    articlesWithSpecialTiles.splice(insertPosition, 0, {
      id: 'email-capture-tile',
      title: '',
      slug: '',
      isEmailCaptureTile: true
    } as any);
  }

  return (
    <div className="py-8">
      {title && (
        <h2 className="text-3xl font-bold text-gray-900 mb-8">{title}</h2>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articlesWithSpecialTiles.map((article: any) => {
          // Render email capture tile
          if (article.isEmailCaptureTile) {
            return <EmailCaptureTile key="email-capture" siteId={siteId} />;
          }

          // Render product tile
          if (article.isProductTile) {
            return (
              <div key="product-tile" className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl shadow-lg overflow-hidden border-2 border-pink-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                <div className="p-6">
                  <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-bold mb-4">
                    <span>⭐</span>
                    Dr. Heart's Top Pick
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Complete Hormone Reset Kit
                  </h3>
                  <p className="text-gray-700 mb-4">
                    My #1 recommended 3-step system for naturally balancing hormones and boosting metabolism after 40.
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl font-bold text-pink-600">$97</span>
                    <span className="text-lg text-gray-500 line-through">$197</span>
                  </div>
                  <a
                    href={`/site/${siteId}/top-picks`}
                    className="block w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg text-center transition-all"
                  >
                    Learn More →
                  </a>
                </div>
              </div>
            );
          }

          const badge = getArticleBadge(article);
          const BadgeIcon = badge?.icon;

          // Use default image if article doesn't have one or image is broken
          const articleImage = article.image || DEFAULT_ARTICLE_IMAGE;

          // Render article card with badges and hover states
          return (
            <a
              key={article.id}
              href={`/site/${siteId}/articles/${article.slug}`}
              className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 block"
            >
              <div className="relative">
                <img
                  src={articleImage}
                  alt={article.title}
                  className="w-full h-48 object-cover group-hover:brightness-105 transition-all duration-300"
                  onError={(e) => {
                    // Fallback to default image if image fails to load
                    (e.target as HTMLImageElement).src = DEFAULT_ARTICLE_IMAGE;
                  }}
                />
                {/* Badge */}
                {badge && BadgeIcon && (
                  <div className="absolute top-3 left-3">
                    <span className={`${badge.color} text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg`}>
                      <BadgeIcon className="w-3 h-3" />
                      {badge.label}
                    </span>
                  </div>
                )}
                {/* Engagement overlay on hover */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center gap-3 text-white text-sm">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {(article.views || Math.floor(Math.random() * 5000) + 500).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {Math.floor((article.views || 1000) * 0.15).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {article.read_time || 5} min
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-5">
                {article.category && (
                  <span className="text-xs font-semibold text-primary-600 uppercase tracking-wide">
                    {article.category}
                  </span>
                )}
                <h3 className="mt-2 text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="mt-2 text-gray-600 text-sm line-clamp-2">{article.excerpt}</p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-primary-600 font-semibold text-sm group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Read More <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Eye className="w-3 h-3" />
                    {(article.views || Math.floor(Math.random() * 5000) + 500).toLocaleString()}
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
