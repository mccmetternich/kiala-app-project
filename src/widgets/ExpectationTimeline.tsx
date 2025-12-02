'use client';

import { Check, Zap, TrendingUp, Heart, Star, Sparkles, Leaf, Sun, Moon, Crown } from 'lucide-react';
import { useTracking } from '@/contexts/TrackingContext';

interface TimelineStep {
  period?: string;
  week?: string;  // Alias for period
  title: string;
  subtitle?: string;  // e.g., "Metabolic Priming" or ingredient list
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
  showDisclaimer?: boolean;
}

const defaultSteps: TimelineStep[] = [
  {
    period: 'Week 1',
    title: 'Inflammation Reset Begins',
    subtitle: 'Probiotics • Digestive Enzymes • Ginger Root • Turmeric',
    description: 'Your Body Starts Calming Down',
    benefits: ['Digestion feels smoother → bloating noticeably reduced', 'Morning puffiness begins to ease', 'First boost of clean energy + lighter mood'],
    icon: 'zap'
  },
  {
    period: 'Month 1',
    title: 'Hormone + Gut Support',
    subtitle: 'Adaptogens • Prebiotics • Vitamin-Rich Superfoods',
    description: 'Real Change You Can Feel',
    benefits: ['Hormonal chaos begins to steady → calmer days', 'Body releases trapped water + inflammation weight', 'Digestion becomes more regular and predictable'],
    icon: 'leaf'
  },
  {
    period: 'Month 2',
    title: 'Deeper Inflammation Relief',
    subtitle: 'Adaptogens • Polyphenols • Antioxidants',
    description: 'The Menopause "Shift" Begins',
    benefits: ['Evening bloating decreases noticeably', 'Sleep becomes deeper and more restorative', 'Mood swings soften as calm confidence returns'],
    icon: 'moon'
  },
  {
    period: 'Month 3',
    title: 'Visible Body Composition Change',
    subtitle: 'Probiotics + Enzymes • Supergreens • Estrogen-supporting botanicals',
    description: 'Your Outside Reflects the Inner Work',
    benefits: ['Stomach looks flatter, mornings feel lighter', 'Brain fog fades as clarity improves', 'Energy feels naturally steady all day'],
    icon: 'trending'
  },
  {
    period: 'Month 6',
    title: 'Hormonal Alignment & Weight Stability',
    subtitle: 'Daily antioxidants • Cortisol-calming adaptogens • Anti-inflammatory botanicals',
    description: 'Dramatic Internal & External Change',
    benefits: ['Waistline visibly slimmer from reduced inflammation', 'Hormones feel more aligned → fewer menopause symptoms', 'Water retention stabilizes for steady weight'],
    icon: 'sun'
  },
  {
    period: 'Month 12',
    title: 'Long-Term Renewal',
    subtitle: 'Balanced hormones • Healthy gut microbiome • Clean metabolism',
    description: 'The New You',
    benefits: ['Radiant, hydrated, glowing skin', 'Stronger hair + nails from deeper nutrient absorption', 'Steady, reliable energy with easier weight maintenance'],
    icon: 'crown'
  }
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  check: Check,
  zap: Zap,
  trending: TrendingUp,
  heart: Heart,
  star: Star,
  sparkles: Sparkles,
  seedling: Leaf,
  leaf: Leaf,
  rocket: TrendingUp,
  crown: Crown,
  sun: Sun,
  moon: Moon
};

export default function ExpectationTimeline({
  headline = 'Your Transformation Timeline',
  subheading = 'What to expect when you start supporting your hormones the right way',
  steps = defaultSteps,
  ctaText = 'Start Your Transformation →',
  ctaUrl = '#',
  target = '_self',
  showDisclaimer = true
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
          {/* Vertical Line - Desktop */}
          <div className="absolute left-7 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500 via-purple-500 to-primary-400 hidden md:block rounded-full"></div>

          {/* Timeline Steps */}
          <div className="space-y-5">
            {steps.map((step, index) => {
              const Icon = iconMap[step.icon || 'check'] || Check;
              const isLast = index === steps.length - 1;
              const periodLabel = step.period || step.week || `Step ${index + 1}`;

              return (
                <div key={index} className="relative">
                  {/* Mobile: Vertical line on left side */}
                  {!isLast && (
                    <div className="md:hidden absolute left-[6px] top-14 bottom-0 w-1 bg-gradient-to-b from-primary-500 to-primary-300 rounded-full" style={{ height: 'calc(100% + 0.75rem)' }}></div>
                  )}

                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Icon Circle */}
                    <div className="flex-shrink-0 flex items-center gap-4 md:gap-0">
                      <div className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${
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
                    <div className="flex-1 bg-gray-50 rounded-xl p-4 md:ml-4 border border-gray-100 hover:border-primary-200 transition-all ml-5 md:ml-4">
                      <div className="hidden md:block mb-2">
                        <span className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-bold">
                          {periodLabel}
                        </span>
                      </div>
                      <h3 className="hidden md:block text-lg font-bold text-gray-900 mb-1">{step.title}</h3>

                      {/* Subtitle / Ingredients line */}
                      {step.subtitle && (
                        <p className="text-xs text-purple-600 font-medium mb-2 tracking-wide">{step.subtitle}</p>
                      )}

                      {/* Description as a highlighted tagline */}
                      <p className="text-primary-700 font-semibold mb-3">{step.description}</p>

                      {/* Benefits */}
                      {step.benefits && step.benefits.length > 0 && (
                        <div className="space-y-1.5">
                          {step.benefits.map((benefit, bIndex) => (
                            <div
                              key={bIndex}
                              className="flex items-start gap-2 text-sm md:text-base"
                            >
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
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
                </div>
              );
            })}
          </div>
        </div>

        {/* What to Expect Note */}
        {showDisclaimer && (
          <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Heart className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Everyone's Journey Is Unique</h4>
                <p className="text-sm text-gray-600">
                  Results vary based on your starting point, consistency, and lifestyle. Some women notice changes within the first week,
                  while deeper transformation unfolds over months. Trust the process—your body knows what to do when given the right support.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">12</div>
            <div className="text-sm text-gray-600">Month Journey</div>
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
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-bold text-lg py-4 px-10 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-center"
          >
            {ctaText}
          </a>
        </div>
      </div>
    </div>
  );
}
