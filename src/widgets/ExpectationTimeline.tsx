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
  target?: '_self' | '_blank';
}

const defaultSteps: TimelineStep[] = [
  {
    period: 'Days 1-7',
    title: 'The Detox Phase',
    description: 'Your body begins flushing out toxins and adjusting to the nutrient-dense formula. Some women notice immediate changes in digestion and energy.',
    benefits: ['Reduced bloating within days', 'Improved digestion', 'Initial energy boost', 'Better hydration'],
    icon: 'zap'
  },
  {
    period: 'Week 2-3',
    title: 'The Awakening',
    description: 'Your gut microbiome starts rebalancing. The 34+ superfoods begin working synergistically to support your hormonal pathways.',
    benefits: ['Clearer thinking & less brain fog', 'More stable energy throughout the day', 'Reduced sugar cravings', 'Better sleep quality'],
    icon: 'sparkles'
  },
  {
    period: 'Week 4-6',
    title: 'The Shift',
    description: 'This is where the magic happens. Your metabolism starts responding, cortisol levels normalize, and your body enters fat-burning mode.',
    benefits: ['Noticeable weight changes', 'Clothes fitting better', 'Mood improvements', 'Fewer hot flashes & night sweats'],
    icon: 'trending'
  },
  {
    period: 'Week 7-9',
    title: 'Deep Transformation',
    description: 'Hormones are actively rebalancing. Estrogen, progesterone, and cortisol find their optimal levels. Your body is healing from the inside out.',
    benefits: ['Significant energy transformation', 'Skin clarity & glow', 'Stronger hair & nails', 'Improved libido'],
    icon: 'heart'
  },
  {
    period: 'Week 10-12+',
    title: 'The New You',
    description: 'Full hormone optimization achieved. Women report feeling like themselves again—or even better than before. This is sustainable, lasting change.',
    benefits: ['Optimal hormone balance', 'Sustained healthy weight', 'Vibrant energy daily', 'Complete wellness transformation'],
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
  headline = 'Your 90-Day Transformation Journey',
  subheading = 'Here\'s exactly what happens when you start supporting your hormones the right way',
  steps = defaultSteps,
  ctaText = 'Start Your Transformation →',
  ctaUrl = '#',
  target = '_self'
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

        {/* What to Expect Note */}
        <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Important: Everyone's Journey Is Unique</h4>
              <p className="text-sm text-gray-600">
                While this timeline reflects what most women experience, your results may vary based on your starting point,
                consistency, and overall lifestyle. Some women see changes in days, others take a few weeks.
                Trust the process—your body knows what to do when given the right support.
              </p>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">90</div>
            <div className="text-sm text-gray-600">Day Protocol</div>
          </div>
          <div className="text-center border-x border-primary-100">
            <div className="text-3xl font-bold text-primary-600">1M+</div>
            <div className="text-sm text-gray-600">Women Transformed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">94%</div>
            <div className="text-sm text-gray-600">Report Results</div>
          </div>
        </div>

        {/* CTA */}
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
      </div>
    </div>
  );
}
