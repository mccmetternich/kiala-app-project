'use client';

import { Check, X, Star, Crown, Zap } from 'lucide-react';
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
}

interface DualOfferComparisonProps {
  headline?: string;
  subheading?: string;
  leftOffer?: Offer;
  rightOffer?: Offer;
  vsText?: string;
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
  vsText = 'VS'
}: DualOfferComparisonProps) {
  return (
    <div className="my-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{headline}</h2>
        <p className="text-gray-600">{subheading}</p>
      </div>

      {/* Comparison Grid */}
      <div className="grid md:grid-cols-2 gap-4 md:gap-0 relative">
        {/* VS Badge - Center */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-xl">
            {vsText}
          </div>
        </div>

        {/* Left Offer */}
        <OfferCard offer={leftOffer} side="left" />

        {/* Right Offer */}
        <OfferCard offer={rightOffer} side="right" />
      </div>

      {/* Bottom note */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-500">
          💡 <strong>Pro tip:</strong> 94% of members choose the Complete Kit for best results
        </p>
      </div>
    </div>
  );
}

function OfferCard({ offer, side }: { offer: Offer; side: 'left' | 'right' }) {
  const isHighlighted = offer.highlighted;

  return (
    <div className={`relative ${side === 'left' ? 'md:pr-6' : 'md:pl-6'}`}>
      {/* Highlighted glow effect */}
      {isHighlighted && (
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl opacity-20 blur-lg"></div>
      )}

      <div className={`relative bg-white rounded-2xl overflow-hidden border-2 h-full flex flex-col ${
        isHighlighted
          ? 'border-amber-400 shadow-2xl ring-2 ring-amber-200'
          : 'border-gray-200 shadow-lg'
      }`}>
        {/* Badge */}
        {offer.badge && (
          <div className={`text-center py-2 font-bold text-sm ${
            isHighlighted
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {isHighlighted && <Crown className="w-4 h-4 inline mr-1" />}
            {offer.badge}
          </div>
        )}

        <div className="p-6 flex-1 flex flex-col">
          {/* Image & Name */}
          <div className="text-center mb-4">
            {offer.image && (
              <img
                src={offer.image}
                alt={offer.name}
                className="w-24 h-24 rounded-xl mx-auto mb-4 shadow-md object-cover"
              />
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
              <span className="text-4xl font-bold text-gray-900">${offer.price}</span>
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
            widgetType="dual-offer-comparison"
            widgetId={`dual-offer-${side}`}
            widgetName={offer.name}
            value={offer.price}
            className={`block w-full py-4 rounded-xl font-bold text-lg transition-all text-center ${
              isHighlighted
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            {isHighlighted && <Zap className="w-5 h-5 inline mr-2" />}
            {offer.ctaText}
          </TrackedLink>
        </div>

        {/* Popular ribbon for highlighted */}
        {isHighlighted && (
          <div className="absolute -right-8 top-12 bg-red-500 text-white px-10 py-1 transform rotate-45 text-xs font-bold shadow-lg">
            MOST POPULAR
          </div>
        )}
      </div>
    </div>
  );
}
