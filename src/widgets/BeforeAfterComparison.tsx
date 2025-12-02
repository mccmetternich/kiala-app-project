'use client';

import { useState } from 'react';
import { Star, CheckCircle, ArrowRight } from 'lucide-react';
import { useTracking } from '@/contexts/TrackingContext';

interface BeforeAfterComparisonProps {
  beforeImage?: string;
  afterImage?: string;
  name?: string;
  age?: string;
  location?: string;
  result?: string;
  timeframe?: string;
  testimonial?: string;
  verified?: boolean;
  ctaText?: string;
  ctaUrl?: string;
  target?: '_self' | '_blank';
}

export default function BeforeAfterComparison({
  beforeImage = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop&crop=face',
  afterImage = 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop&crop=face',
  name = 'Sarah M.',
  age = '52',
  location = 'Austin, TX',
  result = 'Lost 23 lbs & More Energy Than Ever',
  timeframe = '12 weeks',
  testimonial = "I can't believe this is me! After following the protocol, I feel like I've turned back the clock 10 years.",
  verified = true,
  ctaText = 'Get The Same Results',
  ctaUrl = '#',
  target = '_self'
}: BeforeAfterComparisonProps) {
  const { appendTracking } = useTracking();
  const trackedCtaUrl = appendTracking(ctaUrl);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleSliderMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const container = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const position = ((clientX - container.left) / container.width) * 100;
    setSliderPosition(Math.min(Math.max(position, 5), 95));
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden my-8 border border-gray-100">
      {/* Header with real person badge - Pink/Lavender theme */}
      <div className="bg-gradient-to-r from-primary-500 to-purple-500 text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 fill-current" />
          <span className="font-bold">REAL MEMBER TRANSFORMATION</span>
        </div>
        {verified && (
          <div className="flex items-center gap-1 text-primary-100">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Verified Result</span>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Before/After Image Comparison */}
          <div
            className="relative aspect-[4/5] rounded-xl overflow-hidden cursor-ew-resize select-none"
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onMouseMove={handleSliderMove}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            onTouchMove={handleSliderMove}
          >
            {/* After Image (background) */}
            <div className="absolute inset-0">
              <img
                src={afterImage}
                alt="After transformation"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-gradient-to-r from-primary-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                AFTER
              </div>
            </div>

            {/* Before Image (overlay with clip) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <img
                src={beforeImage}
                alt="Before transformation"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-gray-700 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                BEFORE
              </div>
            </div>

            {/* Slider Handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
              style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-primary-500">
                <div className="flex gap-0.5">
                  <div className="w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-primary-500"></div>
                  <div className="w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-primary-500"></div>
                </div>
              </div>
            </div>

            {/* Drag instruction */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
              ← Drag to compare →
            </div>
          </div>

          {/* Testimonial & Details */}
          <div className="flex flex-col justify-center">
            {/* Person info */}
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{name}, {age}</h3>
              <p className="text-gray-600">{location}</p>
            </div>

            {/* Result highlight - Pink/Lavender theme */}
            <div className="bg-gradient-to-r from-primary-50 to-purple-50 border-l-4 border-primary-500 p-4 rounded-r-lg mb-4">
              <div className="text-sm text-primary-700 font-medium mb-1">TRANSFORMATION RESULT</div>
              <div className="text-xl font-bold text-gray-900">{result}</div>
              <div className="text-sm text-gray-600 mt-1">In just {timeframe}</div>
            </div>

            {/* Testimonial */}
            <blockquote className="text-gray-700 italic text-lg leading-relaxed mb-6">
              "{testimonial}"
            </blockquote>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">23</div>
                <div className="text-sm text-gray-600">Lbs Lost</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">3x</div>
                <div className="text-sm text-gray-600">More Energy</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">12</div>
                <div className="text-sm text-gray-600">Weeks</div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <a
                href={trackedCtaUrl}
                target={target}
                rel={target === '_blank' ? 'noopener noreferrer' : undefined}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-bold text-lg py-4 px-10 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-center"
              >
                {ctaText}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 px-6 py-3 text-xs text-gray-500 border-t">
        *Results may vary. Individual testimonial based on personal experience.
      </div>
    </div>
  );
}
