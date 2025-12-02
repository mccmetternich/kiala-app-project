'use client';

import { CheckCircle, Star } from 'lucide-react';
import { useTracking } from '@/contexts/TrackingContext';

interface StatItem {
  label: string;
  value: string;
}

interface BeforeAfterSideBySideProps {
  headline?: string;
  name?: string;
  age?: string;
  location?: string;
  beforeImage?: string;
  afterImage?: string;
  beforeLabel?: string;
  afterLabel?: string;
  beforeStats?: StatItem[];
  afterStats?: StatItem[];
  testimonial?: string;
  timeframe?: string;
  verified?: boolean;
  style?: 'simple' | 'detailed' | 'cards';
  // CTA props
  showCta?: boolean;
  ctaText?: string;
  ctaUrl?: string;
  target?: '_self' | '_blank';
}

export default function BeforeAfterSideBySide({
  headline = 'Real Results',
  name,
  age,
  location,
  beforeImage = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
  afterImage = 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop',
  beforeLabel = 'BEFORE',
  afterLabel = 'AFTER',
  beforeStats,
  afterStats,
  testimonial,
  timeframe,
  verified = true,
  style = 'detailed',
  showCta = false,
  ctaText = 'Get The Same Results →',
  ctaUrl = '#',
  target = '_blank'
}: BeforeAfterSideBySideProps) {
  const { appendTracking } = useTracking();
  const trackedCtaUrl = appendTracking(ctaUrl);

  // CTA button component to reuse across styles
  const CtaButton = () => showCta ? (
    <div className="mt-6 text-center">
      <a
        href={trackedCtaUrl}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-bold text-lg py-4 px-10 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        {ctaText}
      </a>
    </div>
  ) : null;
  if (style === 'simple') {
    return (
      <div className="my-8">
        {headline && (
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-6">{headline}</h3>
        )}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Before */}
          <div className="relative rounded-xl overflow-hidden">
            <div className="aspect-[4/5] relative">
              <img src={beforeImage} alt="Before" className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <span className="inline-block bg-gray-600 text-white text-sm font-bold px-3 py-1 rounded">
                {beforeLabel}
              </span>
            </div>
          </div>
          {/* After */}
          <div className="relative rounded-xl overflow-hidden">
            <div className="aspect-[4/5] relative">
              <img src={afterImage} alt="After" className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <span className="inline-block bg-green-600 text-white text-sm font-bold px-3 py-1 rounded">
                {afterLabel}
              </span>
            </div>
          </div>
        </div>
        {timeframe && (
          <p className="text-center text-gray-600 mt-4">Results achieved in {timeframe}</p>
        )}
        <CtaButton />
      </div>
    );
  }

  if (style === 'cards') {
    return (
      <div className="my-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 md:p-8">
        {headline && (
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-6">{headline}</h3>
        )}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Before Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="aspect-square relative">
              <img src={beforeImage} alt="Before" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute top-4 left-4">
                <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  {beforeLabel}
                </span>
              </div>
            </div>
            {beforeStats && beforeStats.length > 0 && (
              <div className="p-4 bg-gray-50 border-t">
                <div className="grid grid-cols-2 gap-3">
                  {beforeStats.map((stat, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-lg font-bold text-gray-400">{stat.value}</div>
                      <div className="text-sm text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* After Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden ring-2 ring-primary-500">
            <div className="aspect-square relative">
              <img src={afterImage} alt="After" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute top-4 left-4">
                <span className="bg-gradient-to-r from-primary-500 to-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  {afterLabel}
                </span>
              </div>
              {timeframe && (
                <div className="absolute top-4 right-4">
                  <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    {timeframe}
                  </span>
                </div>
              )}
            </div>
            {afterStats && afterStats.length > 0 && (
              <div className="p-4 bg-primary-50 border-t border-primary-100">
                <div className="grid grid-cols-2 gap-3">
                  {afterStats.map((stat, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-lg font-bold text-primary-600">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Testimonial & Info */}
        {(testimonial || name) && (
          <div className="mt-6 text-center">
            {testimonial && (
              <blockquote className="text-gray-700 italic mb-3">"{testimonial}"</blockquote>
            )}
            {name && (
              <div className="flex items-center justify-center gap-2">
                <span className="font-semibold text-gray-900">{name}</span>
                {age && <span className="text-gray-500">• {age}</span>}
                {location && <span className="text-gray-500">• {location}</span>}
              </div>
            )}
            {verified && (
              <div className="flex items-center justify-center gap-1 text-primary-600 text-sm mt-2">
                <CheckCircle className="w-4 h-4" />
                <span>Verified Result</span>
              </div>
            )}
          </div>
        )}
        <CtaButton />
      </div>
    );
  }

  // Default: detailed style
  return (
    <div className="my-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white p-6 text-center">
          <h3 className="text-2xl font-bold mb-1">{headline}</h3>
          {verified && (
            <div className="flex items-center justify-center gap-2 text-primary-100">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Verified Transformation</span>
            </div>
          )}
        </div>

        {/* Images Side by Side */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Before */}
            <div>
              <div className="relative rounded-xl overflow-hidden shadow-lg mb-4">
                <div className="aspect-square relative">
                  <img src={beforeImage} alt="Before" className="absolute inset-0 w-full h-full object-cover grayscale-[30%]" />
                </div>
                <div className="absolute top-4 left-4">
                  <span className="bg-gray-800/80 text-white text-sm font-bold px-4 py-2 rounded-lg">
                    {beforeLabel}
                  </span>
                </div>
              </div>
              {beforeStats && beforeStats.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-3">
                    {beforeStats.map((stat, idx) => (
                      <div key={idx} className="text-center p-2 bg-white rounded-lg">
                        <div className="text-xl font-bold text-gray-400">{stat.value}</div>
                        <div className="text-sm text-gray-500">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* After */}
            <div>
              <div className="relative rounded-xl overflow-hidden shadow-lg ring-4 ring-primary-400 mb-4">
                <div className="aspect-square relative">
                  <img src={afterImage} alt="After" className="absolute inset-0 w-full h-full object-cover" />
                </div>
                <div className="absolute top-4 left-4">
                  <span className="bg-gradient-to-r from-primary-500 to-purple-500 text-white text-sm font-bold px-4 py-2 rounded-lg">
                    {afterLabel}
                  </span>
                </div>
                {timeframe && (
                  <div className="absolute bottom-4 right-4">
                    <span className="bg-amber-500 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-lg">
                      {timeframe}
                    </span>
                  </div>
                )}
              </div>
              {afterStats && afterStats.length > 0 && (
                <div className="bg-primary-50 rounded-lg p-4 border border-primary-100">
                  <div className="grid grid-cols-2 gap-3">
                    {afterStats.map((stat, idx) => (
                      <div key={idx} className="text-center p-2 bg-white rounded-lg border border-primary-100">
                        <div className="text-xl font-bold text-primary-600">{stat.value}</div>
                        <div className="text-sm text-gray-600">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Testimonial Section */}
        {(testimonial || name) && (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 border-t">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              {name && (
                <div className="flex items-center justify-center gap-3 text-gray-600 mb-3">
                  <span className="font-semibold text-gray-900">{name}</span>
                  {age && <span>• Age {age}</span>}
                  {location && <span>• {location}</span>}
                </div>
              )}
              {testimonial && (
                <p className="text-lg text-gray-700 italic">"{testimonial}"</p>
              )}
            </div>
          </div>
        )}
        {showCta && (
          <div className="p-6 border-t text-center">
            <a
              href={trackedCtaUrl}
              target={target}
              rel={target === '_blank' ? 'noopener noreferrer' : undefined}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-bold text-lg py-4 px-10 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {ctaText}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
