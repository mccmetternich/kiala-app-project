'use client';

import { useState } from 'react';
import { Star, Quote, CheckCircle, MapPin, Mail } from 'lucide-react';
import { useTracking } from '@/contexts/TrackingContext';

interface QuoteItem {
  id: string;
  name: string;
  location?: string;
  result?: string;
  image?: string;
  rating?: number;
  content: string;
  verified?: boolean;
}

interface StackedQuotesProps {
  headline?: string;
  subheading?: string;
  quotes?: QuoteItem[];
  showVerifiedBadge?: boolean;
  ctaText?: string;
  ctaUrl?: string;
  target?: '_self' | '_blank';
  reviewCount?: string;
  siteId?: string;
  showEmailCapture?: boolean;
}

const defaultQuotes: QuoteItem[] = [
  {
    id: '1',
    name: 'Sarah M.',
    location: 'Austin, TX',
    result: 'Lost 23 lbs',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    content: "After following Dr. Heart's protocol for just 8 weeks, I've lost 23 pounds and feel more energetic than I have in years. My husband says I'm like a different person!",
    verified: true
  },
  {
    id: '2',
    name: 'Jennifer K.',
    location: 'Phoenix, AZ',
    result: 'Energy restored',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    content: "I was skeptical at first, but the transformation has been incredible. My energy levels have completely changed - I went from barely making it through the day to having energy to spare.",
    verified: true
  },
  {
    id: '3',
    name: 'Michelle R.',
    location: 'Seattle, WA',
    result: 'Hormones balanced',
    image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    content: "Finally, something that actually works! After years of trying different approaches, this protocol balanced my hormones naturally. No more mood swings, no more brain fog. I feel like myself again.",
    verified: true
  },
  {
    id: '4',
    name: 'Lisa T.',
    location: 'Denver, CO',
    result: 'Better sleep',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    content: "The sleep improvements alone were worth it. I'm falling asleep faster, staying asleep all night, and waking up actually refreshed. I didn't know I could feel this good at 55!",
    verified: true
  }
];

export default function StackedQuotes({
  headline = 'Real Results from Real Women',
  subheading = 'Join thousands who have transformed their health',
  quotes = defaultQuotes,
  showVerifiedBadge = true,
  ctaText = 'Start Your Transformation',
  ctaUrl = '#',
  target = '_self',
  reviewCount = '1.2M',
  siteId,
  showEmailCapture = false
}: StackedQuotesProps) {
  const { appendTracking } = useTracking();
  const trackedCtaUrl = appendTracking(ctaUrl);
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
          source: 'stacked_quotes'
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

  // Get current date formatted
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="my-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{headline}</h2>
        <p className="text-gray-600">{subheading}</p>

        {/* Overall rating */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="flex">
            {[1,2,3,4,5].map((star) => (
              <Star key={star} className={`w-5 h-5 ${star <= 4 ? 'fill-current text-amber-400' : 'fill-amber-400/70 text-amber-400/70'}`} />
            ))}
          </div>
          <span className="font-bold text-gray-900">4.7</span>
          <span className="text-gray-500">from {reviewCount} reviews</span>
        </div>
      </div>

      {/* Stacked Quotes */}
      <div className="space-y-3 md:space-y-4">
        {quotes.map((quote, index) => (
          <div
            key={quote.id}
            className={`bg-white rounded-xl md:rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all ${
              index === 0 ? 'border-l-4 border-l-primary-500' : ''
            }`}
          >
            {/* Mobile Layout - Compact card */}
            <div className="md:hidden p-3">
              {/* Top row: Avatar + Name/Location/Result + Stars */}
              <div className="flex items-start gap-2.5">
                <div className="relative flex-shrink-0">
                  <img
                    src={quote.image}
                    alt={quote.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                  />
                  {quote.verified && showVerifiedBadge && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                      <CheckCircle className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-semibold text-gray-900 text-sm">{quote.name}</h4>
                    {quote.location && (
                      <span className="text-xs text-gray-400">{quote.location}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {quote.rating && (
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < quote.rating! ? 'fill-current text-amber-400' : 'text-gray-200'}`}
                          />
                        ))}
                      </div>
                    )}
                    {quote.result && (
                      <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded font-medium">
                        {quote.result}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {/* Quote content - tight spacing */}
              <p className="text-gray-700 text-base leading-snug mt-2">
                "{quote.content}"
              </p>
              {/* Verified badge - inline */}
              {quote.verified && showVerifiedBadge && (
                <div className="mt-1.5">
                  <span className="inline-flex items-center gap-1 text-[10px] text-gray-500">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    Verified Member
                  </span>
                </div>
              )}
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:block p-6">
              <div className="flex gap-4">
                {/* Avatar & Info */}
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0">
                    <img
                      src={quote.image}
                      alt={quote.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg"
                    />
                    {quote.verified && showVerifiedBadge && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    {/* Name & Location */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-gray-900">{quote.name}</h4>
                      {quote.location && (
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="w-3 h-3" />
                          {quote.location}
                        </span>
                      )}
                      {quote.result && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                          {quote.result}
                        </span>
                      )}
                    </div>

                    {/* Rating */}
                    {quote.rating && (
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < quote.rating! ? 'fill-current text-amber-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quote icon - decorative */}
                <Quote className="w-8 h-8 text-primary-100 flex-shrink-0" />
              </div>

              {/* Quote Content */}
              <blockquote className="mt-4 text-gray-700 leading-relaxed pl-20 text-lg">
                "{quote.content}"
              </blockquote>

              {/* Verified badge */}
              {quote.verified && showVerifiedBadge && (
                <div className="mt-4 pl-20">
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    Verified Member
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA - Email Signup (only show if enabled) */}
      {showEmailCapture && (
        <div className="text-center mt-8 bg-gradient-to-br from-primary-50 to-purple-50 rounded-xl p-8 border border-primary-100">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-primary-600" />
            <span className="text-gray-700 font-medium">Join Our Wellness Community</span>
          </div>

          {status === 'success' ? (
            <div className="flex items-center justify-center gap-2 text-green-600 font-medium py-4">
              <CheckCircle className="w-5 h-5" />
              <span>You're in! Check your inbox.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email..."
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={status === 'loading'}
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {status === 'loading' ? 'Joining...' : 'Join Now'}
                </button>
              </div>
              {status === 'error' && (
                <p className="text-red-500 text-sm mt-2">Something went wrong. Please try again.</p>
              )}
            </form>
          )}

          <p className="text-gray-600 mt-4 text-sm">
            <strong>843,293+</strong> women have already taken advantage of this offer since {currentDate}
          </p>

          {ctaUrl && ctaUrl !== '#' && (
            <a
              href={trackedCtaUrl}
              target={target}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl mt-4"
            >
              {ctaText}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
