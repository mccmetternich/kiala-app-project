'use client';

import { useState } from 'react';
import { Lightbulb, Quote, ArrowRight, Sparkles, BadgeCheck } from 'lucide-react';
import TrackedLink from '@/components/TrackedLink';

interface DrTipProps {
  tip: string;
  name?: string;
  credentials?: string;
  image?: string;
  style?: 'default' | 'highlighted' | 'minimal' | 'featured';
  // CTA options
  ctaText?: string;
  ctaUrl?: string;
  showCta?: boolean;
  ctaType?: 'external' | 'anchor';
  target?: '_self' | '_blank';
}

export default function DrTip({
  tip,
  name = 'Dr. Amy Heart',
  credentials,
  image,
  style = 'default',
  ctaText,
  ctaUrl,
  showCta = false,
  ctaType = 'external',
  target = '_self',
}: DrTipProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (style === 'minimal') {
    return (
      <div
        className="flex items-start gap-4 p-5 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`p-2 rounded-full transition-all duration-300 ${isHovered ? 'bg-pink-200 shadow-md' : 'bg-pink-100'}`}>
          <Lightbulb className="w-5 h-5 text-pink-600" />
        </div>
        <div className="flex-1">
          <p className="text-gray-700 text-base leading-relaxed">{tip}</p>
          <div className="flex items-center gap-3 mt-3">
            {image && (
              <img
                src={image}
                alt={name}
                className="w-8 h-8 rounded-full object-cover border-2 border-pink-200 shadow-sm"
              />
            )}
            <p className="text-sm font-medium text-gray-600">— {name}</p>
          </div>
        </div>
      </div>
    );
  }

  if (style === 'highlighted') {
    return (
      <div
        className="my-8 relative bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 rounded-2xl p-6 md:p-8 border-2 border-purple-200 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Decorative quote mark */}
        <div className="absolute -top-6 -left-6 text-purple-200/40">
          <Quote className="w-32 h-32" />
        </div>

        <div className="relative">
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1.5 rounded-full text-sm font-bold mb-5 shadow-lg transition-all duration-300 ${isHovered ? 'scale-105' : ''}`}>
            <Sparkles className="w-4 h-4" />
            <span>Dr.'s Insight</span>
          </div>

          {/* Tip content */}
          <p className="text-base md:text-lg lg:text-xl text-gray-800 leading-relaxed font-medium mb-6">
            "{tip}"
          </p>

          {/* Attribution with avatar */}
          <div className="flex items-center gap-4">
            {image && (
              <div className={`relative transition-all duration-300 ${isHovered ? 'scale-110' : ''}`}>
                <img
                  src={image}
                  alt={name}
                  className="w-14 h-14 rounded-full object-cover border-3 border-white shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 bg-purple-500 rounded-full p-1">
                  <BadgeCheck className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
            <div>
              <p className="font-bold text-gray-900 text-lg">{name}</p>
              {credentials && (
                <p className="text-sm text-purple-700">{credentials}</p>
              )}
            </div>
          </div>

          {/* CTA */}
          {showCta && ctaText && ctaUrl && (
            <TrackedLink
              href={ctaUrl}
              target={target}
              widgetType="dr-tip"
              widgetName={`Dr. Tip: ${tip.substring(0, 30)}...`}
              className="inline-flex items-center justify-center gap-2 mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {ctaText}
              <ArrowRight className="w-4 h-4" />
            </TrackedLink>
          )}
        </div>
      </div>
    );
  }

  // Featured style - big, bold, and prominent
  if (style === 'featured') {
    return (
      <div className="my-8">
        {/* Header bar */}
        <div className="bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 rounded-t-2xl px-6 py-4">
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold">Expert Insight</span>
          </div>
        </div>

        <div
          className="bg-white rounded-b-2xl shadow-xl border-2 border-t-0 border-primary-200 overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Doctor avatar - prominent */}
              {image && (
                <div className="flex-shrink-0 flex justify-center md:justify-start">
                  <div className={`relative inline-block transition-all duration-300 ${isHovered ? 'scale-105' : ''}`}>
                    <img
                      src={image}
                      alt={name}
                      className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-4 border-primary-100 shadow-xl"
                    />
                    <div className="absolute bottom-1 right-1 md:-bottom-2 md:-right-2 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full p-1.5 md:p-2 shadow-lg">
                      <BadgeCheck className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="flex-1">
                {/* Quote icon */}
                <div className="text-primary-200 mb-4">
                  <Quote className="w-10 h-10" />
                </div>

                <p className="text-base md:text-lg lg:text-xl text-gray-800 leading-relaxed font-medium mb-6">
                  "{tip}"
                </p>

                {/* Attribution */}
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{name}</p>
                    {credentials && (
                      <p className="text-sm text-primary-600 font-medium">{credentials}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            {showCta && ctaText && ctaUrl && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <TrackedLink
                  href={ctaUrl}
                  target={target}
                  widgetType="dr-tip"
                  widgetName={`Dr. Tip: ${tip.substring(0, 30)}...`}
                  className="block w-full text-center bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <span className="flex items-center justify-center gap-2">
                    {ctaText}
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </TrackedLink>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default style - enhanced with avatar and professional pink/purple theme
  return (
    <div
      className="my-8 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 rounded-2xl p-6 border-2 border-pink-200 shadow-lg hover:shadow-xl transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col sm:flex-row items-start gap-4">
        {/* Avatar + Icon combo */}
        <div className="flex items-center gap-3">
          {image && (
            <div className={`relative transition-all duration-300 ${isHovered ? 'scale-110' : ''}`}>
              <img
                src={image}
                alt={name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full p-1">
                <Lightbulb className="w-3 h-3 text-white" />
              </div>
            </div>
          )}
          {!image && (
            <div className={`flex-shrink-0 p-3 rounded-full transition-all duration-300 ${isHovered ? 'bg-pink-200 shadow-md' : 'bg-pink-100'}`}>
              <Lightbulb className="w-6 h-6 text-pink-600" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-pink-700 uppercase tracking-wider bg-pink-100 px-3 py-1 rounded-full">
              Dr.'s Tip
            </span>
          </div>
          <p className="text-lg text-gray-800 leading-relaxed font-medium">{tip}</p>
          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm font-semibold text-gray-700">— {name}</span>
            {credentials && (
              <span className="text-sm text-pink-700 font-medium">• {credentials}</span>
            )}
          </div>

          {/* CTA */}
          {showCta && ctaText && ctaUrl && (
            <TrackedLink
              href={ctaUrl}
              target={target}
              widgetType="dr-tip"
              widgetName={`Dr. Tip: ${tip.substring(0, 30)}...`}
              className="inline-flex items-center justify-center gap-2 mt-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {ctaText}
              <ArrowRight className="w-4 h-4" />
            </TrackedLink>
          )}
        </div>
      </div>
    </div>
  );
}
