'use client';

import { Shield, Gift, RotateCcw, CheckCircle } from 'lucide-react';
import { useTracking } from '@/contexts/TrackingContext';

interface Benefit {
  icon: 'shield' | 'gift' | 'rotate' | 'check';
  text: string;
}

interface TestimonialHeroProps {
  image?: string;
  title?: string;
  body?: string;
  ctaText?: string;
  ctaUrl?: string;
  target?: '_self' | '_blank';
  benefits?: Benefit[] | string[];
}

const iconMap = {
  shield: Shield,
  gift: Gift,
  rotate: RotateCcw,
  check: CheckCircle
};

const defaultBenefits: Benefit[] = [
  { icon: 'rotate', text: '90-Day Money Back Guarantee' },
  { icon: 'shield', text: 'No Risk' },
  { icon: 'gift', text: 'Free Gifts Included' }
];

export default function TestimonialHero({
  image = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=800&fit=crop&crop=face',
  title = 'I Lost 22 lbs and My Energy is Through the Roof!',
  body = `"At 52, I thought feeling tired and bloated was just part of getting older. I tried everything—different diets, expensive supplements, even considered medications. Nothing worked until I found Kiala Greens.

Within the first week, my bloating was GONE. By week 4, I had more energy than I'd felt in years. And now, 8 weeks later? I've lost 22 pounds—most of it from my midsection—and I feel like I'm in my 30s again.

If you're on the fence, just try it. The 90-day guarantee means you have nothing to lose (except the weight!). This has honestly changed my life."

— Jennifer M., 52, Austin TX`,
  ctaText = 'TRY NOW - SAVE 50%',
  ctaUrl = '#',
  target = '_self',
  benefits = defaultBenefits
}: TestimonialHeroProps) {
  const { appendTracking } = useTracking();
  const trackedCtaUrl = appendTracking(ctaUrl);

  return (
    <div className="my-8 bg-gradient-to-br from-primary-50 via-white to-purple-50 rounded-2xl overflow-hidden shadow-xl">
      <div className="grid md:grid-cols-2 gap-0">
        {/* Left - Large Image */}
        <div className="relative h-64 md:h-auto">
          <img
            src={image}
            alt="Customer testimonial"
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay for mobile */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent md:hidden" />
        </div>

        {/* Right - Content */}
        <div className="p-6 md:p-8 lg:p-10 flex flex-col justify-center">
          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
            {title}
          </h2>

          {/* Body - Testimonial Quote */}
          <div className="text-gray-700 mb-6 whitespace-pre-line text-sm md:text-base leading-relaxed">
            {body}
          </div>

          {/* CTA Button */}
          <a
            href={trackedCtaUrl}
            target={target}
            className="block w-full md:w-auto md:inline-block text-center bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 mb-6"
          >
            {ctaText}
          </a>

          {/* Benefit Icons */}
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            {benefits.map((benefit, index) => {
              // Handle both string[] and Benefit[] formats
              const isString = typeof benefit === 'string';
              const text = isString ? benefit : benefit.text;
              const Icon = isString ? CheckCircle : (iconMap[benefit.icon] || CheckCircle);
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 text-gray-600 text-sm"
                >
                  <Icon className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>{text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
