'use client';

import { Star, ArrowRight } from 'lucide-react';
import TrackedLink from '@/components/TrackedLink';

interface CTAButtonProps {
  // Title and subtitle
  title?: string;
  subtitle?: string;
  // CTA props (standardized)
  showCta?: boolean;
  ctaUrl?: string;
  ctaText?: string;
  // Legacy props for backwards compatibility
  buttonUrl?: string;
  buttonText?: string;
  target?: '_self' | '_blank';
  style?: 'primary' | 'secondary';
  // CTA type for anchor support
  ctaType?: 'external' | 'anchor';
  // Social proof
  showSocialProof?: boolean;
  socialProofAvatars?: string[];
  socialProofStars?: number;
  socialProofText?: string;
  // Badges
  showBadges?: boolean;
  badges?: string[];
  widgetId?: string;
}

export default function CTAButton({
  title = '',
  subtitle = '',
  showCta = true,
  ctaUrl,
  ctaText,
  buttonUrl = '#',
  buttonText = 'Take Action Now →',
  target = '_self',
  style = 'primary',
  ctaType = 'external',
  showSocialProof = false,
  socialProofAvatars = [],
  socialProofStars = 5,
  socialProofText = '10,000+ happy customers',
  showBadges = false,
  badges = ['Free Shipping', '90-Day Guarantee', 'Made in USA'],
  widgetId
}: CTAButtonProps) {
  // Use standardized props, fall back to legacy props
  const finalCtaText = ctaText || buttonText;
  const finalCtaUrl = ctaUrl || buttonUrl;

  // Default avatars - women from Unsplash
  const defaultAvatars = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&crop=face'
  ];
  const avatarsToShow = socialProofAvatars && socialProofAvatars.filter(a => a).length > 0 ? socialProofAvatars : defaultAvatars;

  return (
    <div className="my-8">
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-lg">
        {/* Title and Subtitle */}
        {(title || subtitle) && (
          <div className="text-center mb-6">
            {title && (
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{title}</h3>
            )}
            {subtitle && (
              <p className="text-gray-600 text-lg">{subtitle}</p>
            )}
          </div>
        )}

        {/* Social Proof Section */}
        {showSocialProof && (
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="flex items-center gap-3">
              {/* Stacked Avatars */}
              <div className="flex -space-x-3">
                {avatarsToShow.slice(0, 4).map((avatar, idx) => (
                  <img
                    key={idx}
                    src={avatar}
                    alt=""
                    className="w-10 h-10 rounded-full border-2 border-white shadow-md object-cover"
                  />
                ))}
              </div>

              {/* Stars and Text */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, idx) => (
                    <Star
                      key={idx}
                      className={`w-4 h-4 ${idx < socialProofStars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 font-medium">{socialProofText}</span>
              </div>
            </div>
          </div>
        )}

        {/* CTA Button */}
        {showCta && (
          <div className="text-center">
            <TrackedLink
              href={finalCtaUrl}
              target={target}
              widgetType="cta-button"
              widgetId={widgetId}
              widgetName={finalCtaText}
              className={`inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-xl ${
                style === 'secondary'
                  ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  : 'bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white'
              }`}
            >
              {finalCtaText}
              <ArrowRight className="w-5 h-5" />
            </TrackedLink>
          </div>
        )}

        {/* Badges Section */}
        {showBadges && badges && badges.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            {badges.map((badge, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-full border border-green-100"
              >
                <svg className="w-4 h-4 mr-1.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
