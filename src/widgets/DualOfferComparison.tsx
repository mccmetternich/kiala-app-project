'use client';

import { Check, X, Star, Crown, Zap, Clock, ArrowRight } from 'lucide-react';
import TrackedLink from '@/components/TrackedLink';

interface Offer {
  name: string;
  description: string;
  image?: string;
  price: number;
  originalPrice?: number;
  features: { text: string; included: boolean }[];
  badge?: string;
  highlighted?: boolean;
  ctaText: string;
  ctaUrl: string;
  ctaType?: 'external' | 'anchor';
  target?: '_self' | '_blank';
}

interface DualOfferComparisonProps {
  headline?: string;
  subheading?: string;
  leftOffer?: Offer;
  rightOffer?: Offer;
  vsText?: string;
  showExclusiveBanner?: boolean;
  exclusiveText?: string;
  widgetId?: string;
}

const defaultLeftOffer: Offer = {
  name: 'Basic Protocol',
  description: 'Great for getting started',
  image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop',
  price: 47,
  features: [
    { text: '30-Day Meal Plan', included: true },
    { text: 'Basic Exercise Guide', included: true },
    { text: 'Email Support', included: true },
    { text: 'Video Coaching Series', included: false },
    { text: 'Private Community Access', included: false },
    { text: 'Live Q&A Sessions', included: false },
    { text: '1-on-1 Check-ins', included: false }
  ],
  badge: 'STARTER',
  ctaText: 'Get Basic',
  ctaUrl: '#'
};

const defaultRightOffer: Offer = {
  name: 'Complete Reset Kit',
  description: 'Everything you need for total transformation',
  image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop',
  price: 97,
  originalPrice: 197,
  features: [
    { text: '90-Day Meal Plan', included: true },
    { text: 'Advanced Exercise Program', included: true },
    { text: 'Priority Support', included: true },
    { text: 'Video Coaching Series', included: true },
    { text: 'Private Community Access', included: true },
    { text: 'Live Q&A Sessions', included: true },
    { text: '1-on-1 Check-ins', included: true }
  ],
  badge: 'BEST VALUE',
  highlighted: true,
  ctaText: 'Get Complete Kit →',
  ctaUrl: '#'
};

export default function DualOfferComparison({
  headline = 'Choose Your Path to Transformation',
  subheading = 'Select the option that fits your goals',
  leftOffer = defaultLeftOffer,
  rightOffer = defaultRightOffer,
  vsText = 'VS',
  showExclusiveBanner = true,
  exclusiveText = 'Community Exclusive - Limited Time Pricing',
  widgetId
}: DualOfferComparisonProps) {
  return (
    <div className="my-8">
      {/* Exclusive Banner */}
      {showExclusiveBanner && (
        <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-t-2xl px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 animate-pulse" />
            <span className="font-bold text-sm uppercase tracking-wide">{exclusiveText}</span>
            <Clock className="w-4 h-4 animate-pulse" />
          </div>
        </div>
      )}

      <div className={`bg-gradient-to-br from-gray-50 to-white p-6 md:p-8 ${showExclusiveBanner ? 'rounded-b-2xl' : 'rounded-2xl'} shadow-xl border border-gray-100`}>
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{headline}</h2>
          <p className="text-gray-600">{subheading}</p>
        </div>

        {/* Comparison Grid */}
        <div className="grid md:grid-cols-2 gap-6 relative">
          {/* VS Badge - Center */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-900 to-gray-700 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-xl border-4 border-white">
              {vsText}
            </div>
          </div>

          {/* Left Offer */}
          <OfferCard offer={leftOffer} side="left" widgetId={widgetId} />

          {/* Right Offer */}
          <OfferCard offer={rightOffer} side="right" widgetId={widgetId} />
        </div>

        {/* Bottom note */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            <Star className="w-4 h-4 inline text-amber-500 mr-1" />
            <strong>Pro tip:</strong> 94% of members choose the Complete Kit for best results
          </p>
        </div>
      </div>
    </div>
  );
}

function OfferCard({ offer, side, widgetId }: { offer: Offer; side: 'left' | 'right'; widgetId?: string }) {
  const isHighlighted = offer.highlighted;

  return (
    <div className={`relative ${side === 'left' ? 'md:pr-4' : 'md:pl-4'}`}>
      {/* Highlighted glow effect */}
      {isHighlighted && (
        <div className="absolute -inset-1 bg-gradient-to-r from-primary-400 to-accent-500 rounded-2xl opacity-30 blur-lg"></div>
      )}

      <div className={`relative bg-white rounded-2xl overflow-hidden border-2 h-full flex flex-col ${
        isHighlighted
          ? 'border-primary-400 shadow-2xl ring-2 ring-primary-200'
          : 'border-gray-200 shadow-lg'
      }`}>
        {/* Badge */}
        {offer.badge && (
          <div className={`text-center py-2.5 font-bold text-sm uppercase tracking-wide ${
            isHighlighted
              ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {isHighlighted && <Crown className="w-4 h-4 inline mr-1" />}
            {offer.badge}
          </div>
        )}

        <div className="p-6 flex-1 flex flex-col">
          {/* Image & Name - Larger image */}
          <div className="text-center mb-5">
            {offer.image && (
              <div className="relative inline-block mb-4">
                <img
                  src={offer.image}
                  alt={offer.name}
                  className="w-36 h-36 rounded-2xl mx-auto shadow-lg object-cover border-2 border-gray-100"
                />
                {isHighlighted && (
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center shadow-lg">
                    <Star className="w-5 h-5 text-white fill-white" />
                  </div>
                )}
              </div>
            )}
            <h3 className="text-xl font-bold text-gray-900">{offer.name}</h3>
            <p className="text-gray-600 text-sm mt-1">{offer.description}</p>
          </div>

          {/* Price */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2">
              {offer.originalPrice && (
                <span className="text-xl text-gray-400 line-through">${offer.originalPrice}</span>
              )}
              <span className={`text-4xl font-bold ${isHighlighted ? 'text-primary-600' : 'text-gray-900'}`}>${offer.price}</span>
            </div>
            {offer.originalPrice && (
              <p className="text-green-600 text-sm font-medium mt-1">
                Save ${offer.originalPrice - offer.price}!
              </p>
            )}
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6 flex-1">
            {offer.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                {feature.included ? (
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                ) : (
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <X className="w-4 h-4 text-gray-400" />
                  </div>
                )}
                <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <TrackedLink
            href={offer.ctaUrl}
            target={offer.target || '_self'}
            widgetType="dual-offer-comparison"
            widgetId={widgetId || `dual-offer-${side}`}
            widgetName={offer.name}
            value={offer.price}
            className={`flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-lg transition-all text-center ${
              isHighlighted
                ? 'bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            {isHighlighted && <Zap className="w-5 h-5" />}
            {offer.ctaText}
            <ArrowRight className="w-5 h-5" />
          </TrackedLink>
        </div>

        {/* Popular ribbon for highlighted */}
        {isHighlighted && (
          <div className="absolute -right-8 top-14 bg-gradient-to-r from-accent-500 to-accent-600 text-white px-10 py-1 transform rotate-45 text-xs font-bold shadow-lg">
            MOST POPULAR
          </div>
        )}
      </div>
    </div>
  );
}
