'use client';

import { useState, useEffect } from 'react';
import { Gift, Users, Clock, Shield, Star, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import TrackedLink from '@/components/TrackedLink';

interface SpecialOfferWidgetProps {
  headline?: string;
  subheading?: string;
  offerDescription?: string;
  productImage?: string;
  originalPrice?: number;
  salePrice?: number;
  savingsText?: string;
  features?: string[];
  redemptionCount?: number;
  limitedSpots?: number;
  ctaText?: string;
  ctaUrl?: string;
  ctaType?: 'external' | 'anchor';
  target?: '_self' | '_blank';
  urgencyMessage?: string;
  endDate?: string;
  widgetId?: string;
}

export default function SpecialOfferWidget({
  headline = 'EXCLUSIVE READER OFFER',
  subheading = 'Unlock Your Complete Hormone Reset Kit',
  offerDescription = 'Get instant access to everything you need to naturally balance your hormones and transform your health in 12 weeks or less.',
  productImage,
  originalPrice = 197,
  salePrice = 97,
  savingsText,
  features = [
    '90-Day Hormone Reset Protocol',
    'Complete Meal Plan Guide',
    'Weekly Coaching Videos',
    'Private Community Access',
    'Bonus: Sleep Optimization Guide'
  ],
  redemptionCount = 1247,
  limitedSpots = 50,
  ctaText = 'Claim Your Spot Now →',
  ctaUrl = '#',
  ctaType = 'external',
  target = '_self',
  urgencyMessage = 'Only {spots} spots left at this price!',
  endDate,
  widgetId
}: SpecialOfferWidgetProps) {
  const [spotsRemaining, setSpotsRemaining] = useState(limitedSpots);
  const [recentRedemptions, setRecentRedemptions] = useState(redemptionCount);
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  // Simulate real-time social proof
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7 && spotsRemaining > 10) {
        setSpotsRemaining(prev => prev - 1);
        setRecentRedemptions(prev => prev + 1);
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [spotsRemaining]);

  // Countdown timer
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
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const savings = originalPrice - salePrice;
  const savingsPercent = Math.round((savings / originalPrice) * 100);

  return (
    <div className="my-8 relative">
      {/* Animated border */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary-400 via-accent-500 to-primary-600 rounded-2xl opacity-75 blur animate-pulse"></div>

      <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-primary-400">
        {/* Top banner */}
        <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white p-3 flex items-center justify-center gap-3">
          <Gift className="w-5 h-5 animate-bounce" />
          <span className="font-bold uppercase tracking-wide">{headline}</span>
          <Gift className="w-5 h-5 animate-bounce" />
        </div>

        {/* Social proof ticker */}
        <div className="bg-primary-50 border-b border-primary-200 px-4 py-2">
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-primary-800">
              <Users className="w-4 h-4" />
              <span><strong>{recentRedemptions.toLocaleString()}</strong> women joined today</span>
            </div>
            <div className="flex items-center gap-2 text-accent-700 font-medium">
              <TrendingUp className="w-4 h-4" />
              <span>{urgencyMessage.replace('{spots}', spotsRemaining.toString())}</span>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {/* Header with optional product image */}
          <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
            {productImage && (
              <div className="md:w-1/3 flex-shrink-0">
                <div className="relative rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={productImage}
                    alt={subheading}
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    {savingsPercent}% OFF
                  </div>
                </div>
              </div>
            )}
            <div className={`text-center ${productImage ? 'md:text-left md:w-2/3' : ''}`}>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{subheading}</h2>
              <p className="text-gray-600 text-lg">{offerDescription}</p>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl p-4 mb-6">
            <div className="text-center mb-2 text-primary-300 font-medium text-sm">
              <Clock className="w-4 h-4 inline mr-1" />
              OFFER EXPIRES IN
            </div>
            <div className="flex justify-center gap-3">
              {[
                { value: timeLeft.hours, label: 'Hours' },
                { value: timeLeft.minutes, label: 'Minutes' },
                { value: timeLeft.seconds, label: 'Seconds' }
              ].map((item, idx) => (
                <div key={idx} className="text-center">
                  <div className="bg-gray-700 rounded-lg px-4 py-2 min-w-[60px]">
                    <span className="text-3xl font-bold font-mono">{String(item.value).padStart(2, '0')}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-3 mb-6">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-6 mb-6 text-center">
            <div className="flex items-center justify-center gap-4 mb-2">
              <span className="text-3xl text-gray-400 line-through">${originalPrice}</span>
              <span className="text-5xl font-bold text-primary-600">${salePrice}</span>
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                SAVE ${savings}
              </span>
            </div>
            <p className="text-gray-600">{savingsText || `That's ${savingsPercent}% off the regular price!`}</p>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <TrackedLink
              href={ctaUrl}
              target={target}
              widgetType="special-offer"
              widgetId={widgetId || `special-offer-${subheading?.substring(0, 20)}`}
              widgetName={subheading || 'Special Offer'}
              value={salePrice}
              className="block w-full md:w-auto md:inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-bold py-5 px-12 rounded-xl text-xl transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-center"
            >
              {ctaText}
              <ArrowRight className="w-6 h-6 hidden md:inline" />
            </TrackedLink>

            {/* Trust signals */}
            <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-green-600" />
                <span>30-Day Money Back</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-500" />
                <span>4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-primary-600" />
                <span>47,000+ Members</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom urgency bar */}
        <div className="bg-gradient-to-r from-primary-600 to-accent-600 text-white py-2 px-4 text-center text-sm font-medium">
          <span className="animate-pulse">⚡</span> {spotsRemaining} people are viewing this offer right now
        </div>
      </div>
    </div>
  );
}
