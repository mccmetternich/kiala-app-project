'use client';

import { useState } from 'react';
import { XCircle, CheckCircle, Sparkles, ArrowRight, Brain, Thermometer, Link, Zap, Heart, Scale } from 'lucide-react';
import TrackedLink from '@/components/TrackedLink';

interface Myth {
  myth: string;
  truth: string;
  icon?: string;
}

interface MythBusterProps {
  headline?: string;
  subheading?: string;
  myths: Myth[];
  style?: 'cards' | 'list' | 'compact';
  // CTA options
  ctaText?: string;
  ctaUrl?: string;
  showCta?: boolean;
}

const iconMap: Record<string, React.ReactNode> = {
  brain: <Brain className="w-5 h-5" />,
  thermometer: <Thermometer className="w-5 h-5" />,
  link: <Link className="w-5 h-5" />,
  zap: <Zap className="w-5 h-5" />,
  heart: <Heart className="w-5 h-5" />,
  scale: <Scale className="w-5 h-5" />,
};

export default function MythBuster({
  headline = "Myth vs. Reality",
  subheading,
  myths = [],
  style = 'cards',
  ctaText,
  ctaUrl,
  showCta = false,
}: MythBusterProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Safety check for myths array
  const safeMyths = Array.isArray(myths) ? myths : [];

  if (style === 'compact') {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 md:p-8 border border-gray-200 shadow-lg">
        {headline && (
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{headline}</h3>
          </div>
        )}
        {subheading && (
          <p className="text-gray-600 mb-6 ml-12">{subheading}</p>
        )}
        <div className="space-y-4">
          {safeMyths.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="p-1.5 bg-rose-100 rounded-full">
                  <XCircle className="w-4 h-4 text-rose-500" />
                </div>
                <p className="text-gray-500 line-through text-base">{item.myth}</p>
              </div>
              <div className="flex items-start gap-3 ml-0.5">
                <div className="p-1.5 bg-emerald-100 rounded-full">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-gray-900 font-semibold text-base">{item.truth}</p>
              </div>
            </div>
          ))}
        </div>

        {showCta && ctaText && ctaUrl && (
          <div className="mt-6 text-center">
            <TrackedLink
              href={ctaUrl}
              widgetType="myth-buster"
              widgetName={headline || 'Myth vs. Reality'}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {ctaText}
              <ArrowRight className="w-4 h-4" />
            </TrackedLink>
          </div>
        )}
      </div>
    );
  }

  if (style === 'list') {
    return (
      <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100">
        {headline && (
          <div className="bg-gradient-to-r from-primary-500 to-purple-500 px-6 py-5">
            <div className="flex items-center gap-3">
              <Scale className="w-6 h-6 text-white" />
              <div>
                <h3 className="text-xl font-bold text-white">{headline}</h3>
                {subheading && <p className="text-primary-100 text-sm mt-1">{subheading}</p>}
              </div>
            </div>
          </div>
        )}
        <div className="bg-white divide-y divide-gray-100">
          {safeMyths.map((item, idx) => (
            <div
              key={idx}
              className="p-6 hover:bg-gray-50 transition-colors"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div className={`rounded-xl p-5 transition-all duration-300 ${
                  hoveredIndex === idx
                    ? 'bg-gradient-to-br from-rose-100 to-pink-100 shadow-md'
                    : 'bg-gradient-to-br from-rose-50 to-pink-50'
                }`}>
                  <div className="flex items-center gap-2 text-rose-700 font-semibold text-sm mb-3">
                    <div className="p-1.5 bg-rose-200 rounded-full">
                      <XCircle className="w-4 h-4" />
                    </div>
                    <span className="uppercase tracking-wide">What You've Been Told</span>
                  </div>
                  <p className="text-gray-700 text-base leading-relaxed">{item.myth}</p>
                </div>
                <div className={`rounded-xl p-5 transition-all duration-300 ${
                  hoveredIndex === idx
                    ? 'bg-gradient-to-br from-emerald-100 to-teal-100 shadow-md'
                    : 'bg-gradient-to-br from-emerald-50 to-teal-50'
                }`}>
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm mb-3">
                    <div className="p-1.5 bg-emerald-200 rounded-full">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <span className="uppercase tracking-wide">What's Actually True</span>
                  </div>
                  <p className="text-gray-800 font-medium text-base leading-relaxed">{item.truth}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showCta && ctaText && ctaUrl && (
          <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
            <TrackedLink
              href={ctaUrl}
              widgetType="myth-buster"
              widgetName={headline || 'Myth vs. Reality'}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {ctaText}
              <ArrowRight className="w-4 h-4" />
            </TrackedLink>
          </div>
        )}
      </div>
    );
  }

  // Cards style (default) - enhanced with better visual design
  return (
    <div className="my-8">
      {headline && (
        <div className="bg-gradient-to-r from-primary-500 to-purple-500 rounded-t-2xl px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{headline}</h3>
              {subheading && <p className="text-primary-100 mt-1">{subheading}</p>}
            </div>
          </div>
        </div>
      )}

      <div className={`bg-white shadow-xl border border-gray-100 ${headline ? 'rounded-b-2xl' : 'rounded-2xl'}`}>
        <div className="p-6 space-y-4">
          {safeMyths.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-primary-200 transition-all duration-300 hover:shadow-lg group"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="grid md:grid-cols-2">
                {/* Myth side - Rose/Pink theme */}
                <div className={`p-6 transition-all duration-300 ${
                  hoveredIndex === idx
                    ? 'bg-gradient-to-br from-rose-100 via-pink-100 to-rose-50'
                    : 'bg-gradient-to-br from-rose-50 via-pink-50 to-rose-50/50'
                }`}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`p-2 rounded-full transition-all duration-300 ${
                      hoveredIndex === idx ? 'bg-rose-300 shadow-md' : 'bg-rose-200'
                    }`}>
                      <XCircle className="w-5 h-5 text-rose-700" />
                    </div>
                    <span className="text-sm font-bold text-rose-700 uppercase tracking-wider">
                      What You've Been Told
                    </span>
                  </div>
                  <p className={`text-lg leading-relaxed transition-all duration-300 ${
                    hoveredIndex === idx ? 'text-rose-800' : 'text-gray-700'
                  }`}>
                    "{item.myth}"
                  </p>
                </div>

                {/* Arrow connector for desktop */}
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  {/* Arrow is handled by the grid layout */}
                </div>

                {/* Truth side - Emerald/Teal theme */}
                <div className={`p-6 border-t md:border-t-0 md:border-l border-gray-200 transition-all duration-300 ${
                  hoveredIndex === idx
                    ? 'bg-gradient-to-br from-emerald-100 via-teal-100 to-emerald-50'
                    : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50/50'
                }`}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`p-2 rounded-full transition-all duration-300 ${
                      hoveredIndex === idx ? 'bg-emerald-300 shadow-md' : 'bg-emerald-200'
                    }`}>
                      {item.icon && iconMap[item.icon] ? (
                        <span className="text-emerald-700">{iconMap[item.icon]}</span>
                      ) : (
                        <CheckCircle className="w-5 h-5 text-emerald-700" />
                      )}
                    </div>
                    <span className="text-sm font-bold text-emerald-700 uppercase tracking-wider">
                      What's Actually True
                    </span>
                  </div>
                  <p className={`text-lg leading-relaxed font-semibold transition-all duration-300 ${
                    hoveredIndex === idx ? 'text-emerald-800' : 'text-gray-800'
                  }`}>
                    {item.truth}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showCta && ctaText && ctaUrl && (
          <div className="px-6 pb-6">
            <TrackedLink
              href={ctaUrl}
              widgetType="myth-buster"
              widgetName={headline || 'Myth vs. Reality'}
              className="block w-full text-center bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                {ctaText}
                <ArrowRight className="w-5 h-5" />
              </span>
            </TrackedLink>
          </div>
        )}
      </div>
    </div>
  );
}
