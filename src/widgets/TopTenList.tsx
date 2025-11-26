'use client';

import { CheckCircle, Star, Clock, Sparkles } from 'lucide-react';
import { useTracking } from '@/contexts/TrackingContext';

interface ListItem {
  title: string;
  description: string;
  tip?: string;
  timing?: string;
}

interface TopTenListProps {
  headline?: string;
  subheading?: string;
  items?: ListItem[];
  style?: 'numbered' | 'checkmarks' | 'stars';
  ctaText?: string;
  ctaUrl?: string;
}

const defaultItems: ListItem[] = [
  {
    title: 'Start Your Day with Warm Lemon Water',
    description: 'Jumpstarts digestion and hydrates your body after sleep.',
    tip: 'Add a pinch of cayenne for metabolism boost',
    timing: 'First thing in the morning'
  },
  {
    title: 'Morning Movement (10-15 minutes)',
    description: 'Gentle stretching or walking to activate your metabolism.',
    tip: 'Cortisol is naturally high - use it for energy!',
    timing: '6:00 - 7:00 AM'
  },
  {
    title: 'Protein-Rich Breakfast',
    description: 'Stabilizes blood sugar and reduces cravings throughout the day.',
    tip: 'Aim for 25-30g of protein',
    timing: 'Within 1 hour of waking'
  },
  {
    title: 'Cruciferous Vegetables at Lunch',
    description: 'Broccoli, cauliflower, or Brussels sprouts support estrogen balance.',
    tip: 'Steam lightly to preserve nutrients',
    timing: 'Midday meal'
  },
  {
    title: 'Afternoon Stress Reset',
    description: '5-minute breathing exercise to lower cortisol levels.',
    tip: 'Box breathing: 4 seconds in, hold, out, hold',
    timing: '2:00 - 3:00 PM'
  },
  {
    title: 'Limit Caffeine After 2 PM',
    description: 'Protects sleep quality and natural cortisol rhythm.',
    tip: 'Try green tea if you need a boost',
    timing: 'After lunch'
  },
  {
    title: 'Evening Walk (20-30 minutes)',
    description: 'Improves insulin sensitivity and aids digestion.',
    tip: 'Great for mental clarity too',
    timing: 'After dinner'
  },
  {
    title: 'Magnesium-Rich Dinner',
    description: 'Include leafy greens, nuts, or seeds for relaxation.',
    tip: 'Avocado is a hormone superfood',
    timing: '5:00 - 7:00 PM'
  },
  {
    title: 'Digital Sunset',
    description: 'Turn off screens 1-2 hours before bed for melatonin production.',
    tip: 'Use blue light blockers if needed',
    timing: '8:00 - 9:00 PM'
  },
  {
    title: 'Consistent Sleep Schedule',
    description: '7-9 hours in a cool, dark room optimizes hormone production.',
    tip: 'Same time every night, even weekends',
    timing: '10:00 PM - 6:00 AM'
  }
];

export default function TopTenList({
  headline = "Dr. Heart's Daily Hormone Balance Routine",
  subheading = 'Follow these 10 steps for optimal hormone health',
  items = defaultItems,
  style = 'numbered',
  ctaText = 'Download the Full Protocol →',
  ctaUrl = '#'
}: TopTenListProps) {
  const { appendTracking } = useTracking();
  const trackedCtaUrl = appendTracking(ctaUrl);

  const getIcon = (index: number) => {
    if (style === 'checkmarks') {
      return <CheckCircle className="w-6 h-6 text-primary-500" />;
    }
    if (style === 'stars') {
      return <Star className="w-6 h-6 fill-current text-primary-400" />;
    }
    return (
      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
        {index + 1}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden my-8 border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-purple-500 text-white p-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5" />
          <span className="text-primary-100 text-sm font-medium">EXPERT PROTOCOL</span>
        </div>
        <h2 className="text-2xl font-bold mb-1">{headline}</h2>
        <p className="text-primary-100">{subheading}</p>
      </div>

      {/* List Items */}
      <div className="p-5">
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="group p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all duration-200"
            >
              <div className="flex gap-4">
                {/* Number/Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getIcon(index)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-gray-900 text-base group-hover:text-primary-700 transition-colors">
                      {item.title}
                    </h3>
                    {item.timing && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 whitespace-nowrap">
                        <Clock className="w-4 h-4" />
                        {item.timing}
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 mt-1">{item.description}</p>
                  {item.tip && (
                    <div className="mt-2 flex items-start gap-2 text-sm bg-primary-50 text-primary-800 p-2 rounded-lg">
                      <span className="font-medium">💡</span>
                      <span>{item.tip}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-6 text-center">
          <a
            href={trackedCtaUrl}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            {ctaText}
          </a>
          <p className="text-sm text-gray-500 mt-3">
            Join 47,000+ women following this protocol
          </p>
        </div>
      </div>
    </div>
  );
}
