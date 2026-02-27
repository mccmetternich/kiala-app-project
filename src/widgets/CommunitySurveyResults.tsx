'use client';

import { Users, TrendingUp, CheckCircle, Award, Sparkles, ArrowRight } from 'lucide-react';
import TrackedLink from '@/components/TrackedLink';

interface SurveyResult {
  label: string;
  percentage: number;
  highlighted?: boolean;
}

interface CommunitySurveyResultsProps {
  headline?: string;
  subheading?: string;
  results?: SurveyResult[];
  totalRespondents?: number | string;
  source?: string;
  highlightText?: string;
  style?: 'default' | 'compact' | 'featured';
  // CTA props
  showCta?: boolean;
  ctaText?: string;
  ctaUrl?: string;
  ctaSubtext?: string;
  ctaType?: 'external' | 'anchor';
  target?: '_self' | '_blank';
}

export default function CommunitySurveyResults({
  headline = "Community Survey Results",
  subheading = "Based on feedback from verified community members",
  results = [
    { label: "Reported more consistent energy by week 3", percentage: 78 },
    { label: "Said healthy habits became easier to maintain", percentage: 71 },
    { label: "Still taking it daily after 60 days", percentage: 83, highlighted: true },
    { label: "Would recommend to a friend over 40", percentage: 91 }
  ],
  totalRespondents = "10,000+",
  source = "Dr. Amy Heart Community Challenge, 2024",
  highlightText = "Compare that 83% to the 8% who succeed with traditional New Year resolutions.",
  style = 'default',
  showCta = false,
  ctaText = 'See How They Did It →',
  ctaUrl = '#',
  ctaSubtext = '',
  ctaType = 'external',
  target = '_self'
}: CommunitySurveyResultsProps) {
  // CTA Button component to reuse across styles
  const CtaButton = () => showCta && ctaText && ctaUrl ? (
    <div className="mt-6 text-center">
      <TrackedLink
        href={ctaUrl}
        target={target}
        widgetType="community-survey-results"
        widgetName={headline}
        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-bold text-lg py-4 px-10 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        {ctaText}
        <ArrowRight className="w-5 h-5" />
      </TrackedLink>
      {ctaSubtext && (
        <p className="mt-2 text-sm text-gray-500">{ctaSubtext}</p>
      )}
    </div>
  ) : null;

  if (style === 'compact') {
    return (
      <div className="my-8 bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-6 border border-primary-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary-100 rounded-xl">
            <Users className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{headline}</h3>
            <p className="text-sm text-gray-500">{subheading}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {results.map((result, idx) => (
            <div key={idx} className="text-center">
              <div className={`text-3xl font-bold ${result.highlighted ? 'text-primary-700' : 'text-gray-900'}`}>
                {result.percentage}%
              </div>
              <div className="text-xs text-gray-600 mt-1">{result.label}</div>
            </div>
          ))}
        </div>
        <CtaButton />
      </div>
    );
  }

  if (style === 'featured') {
    return (
      <div className="my-12">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 via-accent-600 to-primary-600 rounded-t-2xl px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white">{headline}</h3>
              <p className="text-accent-100">{subheading}</p>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="bg-white rounded-b-2xl border-2 border-t-0 border-primary-200 shadow-xl overflow-hidden">
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              {results.map((result, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-xl border-2 transition-all ${
                    result.highlighted
                      ? 'bg-gradient-to-r from-primary-50 to-accent-50 border-primary-300 shadow-md'
                      : 'bg-gray-50 border-gray-100 hover:border-primary-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-4xl font-bold ${result.highlighted ? 'text-primary-700' : 'text-gray-900'}`}>
                      {result.percentage}%
                    </span>
                    {result.highlighted && (
                      <div className="p-1.5 bg-primary-100 rounded-full">
                        <Award className="w-5 h-5 text-primary-600" />
                      </div>
                    )}
                  </div>
                  <p className={`text-sm ${result.highlighted ? 'text-primary-800 font-medium' : 'text-gray-600'}`}>
                    {result.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Highlight callout */}
            {highlightText && (
              <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-800 font-medium">{highlightText}</p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-5 flex items-center justify-between text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {totalRespondents} verified respondents
              </span>
              <span>{source}</span>
            </div>

            <CtaButton />
          </div>
        </div>
      </div>
    );
  }

  // Default style
  return (
    <div className="my-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 text-primary-700 mb-2">
          <TrendingUp className="w-5 h-5" />
          <span className="font-semibold text-sm uppercase tracking-wide">Survey Results</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{headline}</h3>
        <p className="text-gray-600">{subheading}</p>
      </div>

      {/* Results */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="divide-y divide-gray-100">
          {results.map((result, idx) => (
            <div
              key={idx}
              className={`p-5 ${result.highlighted ? 'bg-primary-50' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-1.5 rounded-full ${result.highlighted ? 'bg-primary-200' : 'bg-gray-100'}`}>
                    <CheckCircle className={`w-4 h-4 ${result.highlighted ? 'text-primary-700' : 'text-gray-500'}`} />
                  </div>
                  <span className={`${result.highlighted ? 'font-semibold text-primary-900' : 'text-gray-700'}`}>
                    {result.label}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Progress bar */}
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden hidden md:block">
                    <div
                      className={`h-full rounded-full ${result.highlighted ? 'bg-primary-500' : 'bg-gray-400'}`}
                      style={{ width: `${result.percentage}%` }}
                    />
                  </div>
                  <span className={`text-xl font-bold ${result.highlighted ? 'text-primary-700' : 'text-gray-900'}`}>
                    {result.percentage}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
          {highlightText && (
            <p className="text-sm text-primary-800 font-medium mb-3 bg-primary-100 px-3 py-2 rounded-lg">
              {highlightText}
            </p>
          )}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {totalRespondents} respondents
            </span>
            <span>{source}</span>
          </div>

          <CtaButton />
        </div>
      </div>
    </div>
  );
}
