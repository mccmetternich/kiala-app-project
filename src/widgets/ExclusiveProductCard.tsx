'use client';

import { useState, useEffect } from 'react';
import { Shield, Truck, BadgeCheck, Star, Award, Heart, Sparkles, CheckCircle, Clock } from 'lucide-react';
import { useTracking } from '@/contexts/TrackingContext';

interface ExclusiveProductCardProps {
  name?: string;
  description?: string;
  image?: string;
  price?: number;
  originalPrice?: number;
  savingsText?: string; // Manual override for savings display (e.g., "Save $100")
  rating?: number;
  reviewCount?: number | string;
  benefits?: string[];
  badges?: string[];
  doctorName?: string;
  doctorImage?: string;
  ctaText?: string;
  ctaUrl?: string;
  target?: '_self' | '_blank';
  shippingBadgeText?: string; // Customizable shipping badge text
  guaranteeBadgeText?: string; // Customizable guarantee badge text
  evaluatedBadgeText?: string; // Customizable evaluated badge text
  showFreeShipping?: boolean;
  showGuarantee?: boolean;
  showMedicallyEvaluated?: boolean;
}

export default function ExclusiveProductCard({
  name = 'Complete Hormone Reset Kit',
  description = 'My personally curated 3-step system for naturally balancing hormones and boosting metabolism after 40.',
  image = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
  price = 97,
  originalPrice = 197,
  rating = 4.7,
  reviewCount = 1200000,
  benefits = [
    'Clinically-backed hormone support formula',
    '90-day transformation protocol',
    'Complete meal plan & recipes',
    'Weekly coaching video series',
    'Private community access'
  ],
  badges = ['#1 BEST SELLER', 'DOCTOR RECOMMENDED'],
  doctorName = 'Dr. Heart',
  doctorImage = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop',
  ctaText = 'TRY IT NOW',
  ctaUrl = '#',
  target = '_self',
  shippingBadgeText = 'Free, Fast Shipping',
  guaranteeBadgeText = '90-Day Guarantee',
  evaluatedBadgeText = 'Medically Evaluated',
  savingsText,
  showFreeShipping = true,
  showGuarantee = true,
  showMedicallyEvaluated = true
}: ExclusiveProductCardProps) {
  const { appendTracking } = useTracking();
  const trackedCtaUrl = appendTracking(ctaUrl);
  const savings = originalPrice - price;

  // Countdown timer state - 24 hours from now
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        // Reset to 24 hours when timer runs out
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format review count nicely (e.g., 1.2M)
  const formatReviewCount = (count: number | string) => {
    if (typeof count === 'string') return count;
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toLocaleString();
  };

  return (
    <div className="my-8">
      {/* Dr. Recommendation Header */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-purple-600 text-white rounded-t-2xl p-3 md:p-4">
        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex items-center gap-2 mb-2">
            <img
              src={doctorImage}
              alt={doctorName}
              className="w-10 h-10 rounded-full border-2 border-white shadow-lg flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <BadgeCheck className="w-4 h-4 text-amber-300 flex-shrink-0" />
                <span className="font-bold text-sm truncate">{doctorName}'s #1 Pick</span>
              </div>
              <p className="text-primary-100 text-xs">Personally vetted & recommended</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur px-2 py-1 rounded-full">
              <Clock className="w-3 h-3 text-amber-300" />
              <span className="text-xs font-semibold">
                {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
            {badges.slice(0, 1).map((badge, idx) => (
              <span
                key={idx}
                className="px-2 py-1 rounded-full text-xs font-bold bg-amber-400 text-amber-900"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={doctorImage}
              alt={doctorName}
              className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-amber-300" />
                <span className="font-bold">{doctorName}'s #1 Pick</span>
              </div>
              <p className="text-primary-100 text-sm">Personally vetted & recommended</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Countdown Timer */}
            <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur px-3 py-1.5 rounded-full">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-xs font-semibold">
                {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-xs text-primary-100">left</span>
            </div>
            {badges.slice(0, 1).map((badge, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-amber-900"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-b-2xl shadow-2xl border-2 border-t-0 border-primary-200 overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Side */}
          <div className="relative bg-gradient-to-br from-gray-50 to-primary-50 p-6">
            {/* Community Exclusive badge */}
            <div className="absolute top-4 left-4 z-10">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                COMMUNITY EXCLUSIVE
              </div>
            </div>

            <img
              src={image}
              alt={name}
              className="w-full h-auto rounded-xl shadow-xl"
            />

            {/* Rating - 4.7 stars */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${star <= 4 ? 'fill-current text-amber-400' : 'fill-amber-400/70 text-amber-400/70'}`}
                  />
                ))}
              </div>
              <span className="font-bold text-gray-900">4.7</span>
              <span className="text-gray-500">({formatReviewCount(reviewCount)} reviews)</span>
            </div>
          </div>

          {/* Details Side */}
          <div className="p-6 md:p-8 flex flex-col">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{name}</h2>
            <p className="text-gray-600 mb-6">{description}</p>

            {/* Benefits */}
            <div className="space-y-3 mb-6 flex-1">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Trust Badges Row */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {showFreeShipping && (
                <div className="flex flex-col items-center p-3 bg-green-50 rounded-lg border border-green-100">
                  <Truck className="w-6 h-6 text-green-600 mb-1" />
                  <span className="text-xs font-medium text-green-800 text-center">{shippingBadgeText}</span>
                </div>
              )}
              {showGuarantee && (
                <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <Shield className="w-6 h-6 text-blue-600 mb-1" />
                  <span className="text-xs font-medium text-blue-800 text-center">{guaranteeBadgeText}</span>
                </div>
              )}
              {showMedicallyEvaluated && (
                <div className="flex flex-col items-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <Award className="w-6 h-6 text-purple-600 mb-1" />
                  <span className="text-xs font-medium text-purple-800 text-center">{evaluatedBadgeText}</span>
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 mb-6 border border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">${price}</span>
                    <span className="text-lg text-gray-400 line-through">${originalPrice}</span>
                  </div>
                  <p className="text-green-600 font-medium text-sm">
                    {savingsText || `You save $${savings} (${Math.round((savings/originalPrice)*100)}% off)`}
                  </p>
                </div>
                <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold animate-pulse">
                  LIMITED TIME
                </div>
              </div>
            </div>

            {/* CTA */}
            <a
              href={trackedCtaUrl}
              target={target}
              className="block w-full bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center"
            >
              <span className="flex items-center justify-center gap-2">
                <Heart className="w-5 h-5" />
                {ctaText}
              </span>
            </a>

            <p className="text-center text-xs text-gray-500 mt-3">
              No Risk • Free Gifts • Limited Availability
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
