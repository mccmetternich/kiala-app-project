'use client';

import { Check, X, Shield } from 'lucide-react';
import { useTracking } from '@/contexts/TrackingContext';

interface UsVsThemComparisonProps {
  headline?: string;
  column1Image?: string;
  column1Title?: string;
  column1Features?: string[];
  column2Image?: string;
  column2Title?: string;
  column2Features?: string[];
  buttonText?: string;
  buttonUrl?: string;
  target?: '_self' | '_blank';
  guaranteeBadge?: string;
  satisfactionBadge?: string;
  // Legacy props for backwards compatibility
  ctaText?: string;
  ctaUrl?: string;
}

const defaultColumn1Features = [
  'Clinically validated Spectra® blend',
  'Organic, non-GMO ingredients',
  'No added sugars or artificial sweeteners',
  'Proper therapeutic dosing',
  'Delicious taste you\'ll actually enjoy',
  'Formulated specifically for women 40+'
];

const defaultColumn2Features = [
  'Unproven proprietary blends',
  'Synthetic fillers and additives',
  'Hidden sugars and sweeteners',
  'Under-dosed "pixie dust" ingredients',
  'Chalky, unpleasant taste',
  'Generic one-size-fits-all formula'
];

export default function UsVsThemComparison({
  headline = 'See The Difference',
  column1Image = 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=400&fit=crop',
  column1Title = 'Kiala Greens',
  column1Features = defaultColumn1Features,
  column2Image = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
  column2Title = 'Other Greens',
  column2Features = defaultColumn2Features,
  buttonText,
  buttonUrl,
  target = '_blank',
  guaranteeBadge = '90-Day Money Back Guarantee',
  satisfactionBadge = '100% Satisfaction Guarantee',
  // Legacy props
  ctaText = 'Try Kiala Greens Risk-Free →',
  ctaUrl = 'https://trygreens.com/dr-amy'
}: UsVsThemComparisonProps) {
  const { appendTracking } = useTracking();

  // Use new props if set, otherwise fall back to legacy props
  const finalButtonText = buttonText || ctaText;
  const finalButtonUrl = buttonUrl || ctaUrl;
  const trackedCtaUrl = appendTracking(finalButtonUrl);

  return (
    <div className="my-12">
      {/* Headline */}
      {headline && (
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8">
          {headline}
        </h2>
      )}

      {/* Two Column Comparison */}
      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        {/* Column 1 - The Good (Kiala) - Pink/Purple Theme */}
        <div className="relative bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-primary-200 shadow-lg">
          {/* Satisfaction Badge */}
          <div className="absolute -top-3 -left-3 z-10">
            <div className="bg-gradient-to-r from-primary-500 via-purple-500 to-primary-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              {satisfactionBadge}
            </div>
          </div>

          {/* Image */}
          <div className="relative mb-6 mt-4">
            <div className="aspect-square rounded-xl overflow-hidden shadow-md border-4 border-white">
              <img
                src={column1Image}
                alt={column1Title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-primary-800 text-center mb-6">
            {column1Title}
          </h3>

          {/* Features with Checkmarks */}
          <div className="space-y-4">
            {column1Features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 bg-white/70 rounded-lg p-3 shadow-sm"
              >
                <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-primary-400 via-purple-500 to-primary-600 rounded-full flex items-center justify-center shadow-md">
                  <Check className="w-4 h-4 text-white stroke-[3]" />
                </div>
                <span className="text-gray-800 font-medium leading-tight pt-0.5">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2 - The Bad (Others) */}
        <div className="relative bg-gray-50 rounded-2xl p-6 border border-gray-200">
          {/* Image */}
          <div className="relative mb-6 mt-4">
            <div className="aspect-square rounded-xl overflow-hidden grayscale opacity-70 border border-gray-200">
              <img
                src={column2Image}
                alt={column2Title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-500 text-center mb-6">
            {column2Title}
          </h3>

          {/* Features with X marks */}
          <div className="space-y-4">
            {column2Features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3"
              >
                <div className="flex-shrink-0 w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center">
                  <X className="w-4 h-4 text-gray-400 stroke-[2.5]" />
                </div>
                <span className="text-gray-500 leading-tight pt-0.5">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-10 text-center">
        <a
          href={trackedCtaUrl}
          target={target}
          rel={target === '_blank' ? 'noopener noreferrer' : undefined}
          className="inline-block bg-gradient-to-r from-primary-500 via-purple-500 to-primary-600 hover:from-primary-600 hover:via-purple-600 hover:to-primary-700 text-white font-bold text-lg md:text-xl py-4 px-10 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
        >
          {finalButtonText}
        </a>

        {/* Guarantee Badge */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <Shield className="w-5 h-5 text-primary-600" />
          <span className="text-sm font-medium text-gray-600">{guaranteeBadge}</span>
        </div>
      </div>
    </div>
  );
}
