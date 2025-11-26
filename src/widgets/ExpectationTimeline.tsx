'use client';

import { Check, Zap, TrendingUp, Heart, Star, Sparkles } from 'lucide-react';
import { useTracking } from '@/contexts/TrackingContext';

interface TimelineStep {
  period?: string;
  week?: string;  // Alias for period
  title: string;
  description: string;
  benefits?: string[];
  icon?: string;
}

interface ExpectationTimelineProps {
  headline?: string;
  subheading?: string;
  steps?: TimelineStep[];
  ctaText?: string;
  ctaUrl?: string;
}

const defaultSteps: TimelineStep[] = [
  {
    period: 'Week 1-2',
    title: 'Initial Reset',
    description: 'Your body begins adjusting to the new protocol',
    benefits: ['Reduced bloating', 'Better sleep quality', 'Less brain fog'],
    icon: 'zap'
  },
  {
    period: 'Week 3-4',
    title: 'Energy Surge',
    description: 'Noticeable improvements in daily energy levels',
    benefits: ['Sustained energy all day', 'Fewer cravings', 'Improved mood'],
    icon: 'trending'
  },
  {
    period: 'Week 5-8',
    title: 'Deep Transformation',
    description: 'Hormones begin to balance naturally',
    benefits: ['Weight loss begins', 'Better metabolism', 'Clearer skin'],
    icon: 'heart'
  },
  {
    period: 'Week 9-12',
    title: 'Full Results',
    description: 'Complete hormone optimization achieved',
    benefits: ['Optimal hormone levels', 'Sustained weight loss', 'Vibrant health'],
    icon: 'star'
  }
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  check: Check,
  zap: Zap,
  trending: TrendingUp,
  heart: Heart,
  star: Star,
  sparkles: Sparkles,
  seedling: Zap,
  rocket: TrendingUp,
  crown: Star
};

export default function ExpectationTimeline({
  headline = 'Your Transformation Timeline',
  subheading = 'What to expect when you start the Hormone Reset Protocol',
  steps = defaultSteps,
  ctaText = 'Start Your Journey Today →',
  ctaUrl = '#'
}: ExpectationTimelineProps) {
  const { appendTracking } = useTracking();
  const trackedCtaUrl = appendTracking(ctaUrl);

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden my-8 border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-purple-500 text-white p-5">
        <h2 className="text-2xl font-bold mb-1">{headline}</h2>
        <p className="text-primary-100">{subheading}</p>
      </div>

      {/* Timeline */}
      <div className="p-5 md:p-6">
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 via-purple-500 to-primary-400 hidden md:block"></div>

          {/* Timeline Steps */}
          <div className="space-y-5">
            {steps.map((step, index) => {
              const Icon = iconMap[step.icon || 'check'] || Check;
              const isLast = index === steps.length - 1;
              const periodLabel = step.period || step.week || `Step ${index + 1}`;

              return (
                <div key={index} className="relative">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Icon Circle */}
                    <div className="flex-shrink-0 flex items-center gap-4 md:gap-0">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${
                        index === 0 ? 'bg-gradient-to-br from-primary-500 to-primary-600' :
                        index === 1 ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                        index === 2 ? 'bg-gradient-to-br from-primary-400 to-purple-500' :
                        'bg-gradient-to-br from-purple-400 to-primary-500'
                      } text-white`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="md:hidden">
                        <div className="text-sm font-bold text-primary-600">{periodLabel}</div>
                        <div className="text-lg font-bold text-gray-900">{step.title}</div>
                      </div>
                    </div>

                    {/* Content Card */}
                    <div className="flex-1 bg-gray-50 rounded-xl p-4 md:ml-4 border border-gray-100 hover:border-primary-200 transition-all">
                      <div className="hidden md:block mb-2">
                        <span className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-bold">
                          {periodLabel}
                        </span>
                      </div>
                      <h3 className="hidden md:block text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600 mb-3">{step.description}</p>

                      {/* Benefits */}
                      {step.benefits && step.benefits.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {step.benefits.map((benefit, bIndex) => (
                            <div
                              key={bIndex}
                              className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full text-sm border border-gray-200"
                            >
                              <Check className="w-4 h-4 text-primary-500" />
                              <span className="text-gray-700">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Progress indicator for last step */}
                      {isLast && (
                        <div className="mt-3 p-3 bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg border border-primary-200">
                          <div className="flex items-center gap-2 text-primary-700 font-medium">
                            <Sparkles className="w-5 h-5" />
                            <span>Complete Transformation Achieved!</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Connector arrow on mobile */}
                  {!isLast && (
                    <div className="md:hidden flex justify-center my-3">
                      <div className="w-0.5 h-6 bg-gradient-to-b from-primary-500 to-primary-300"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">12</div>
            <div className="text-sm text-gray-600">Weeks Total</div>
          </div>
          <div className="text-center border-x border-primary-100">
            <div className="text-3xl font-bold text-primary-600">10k+</div>
            <div className="text-sm text-gray-600">Success Stories</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">94%</div>
            <div className="text-sm text-gray-600">See Results</div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 text-center">
          <a
            href={trackedCtaUrl}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            {ctaText}
          </a>
        </div>
      </div>
    </div>
  );
}
