'use client';

import { Star, BadgeCheck } from 'lucide-react';
import { useTracking } from '@/contexts/TrackingContext';

interface Review {
  name: string;
  verified?: boolean;
  rating: number;
  title: string;
  review: string;
  image?: string;
  bottomImage?: string;
}

interface ReviewGridProps {
  headline?: string;
  subheading?: string;
  reviews?: Review[];
  ctaText?: string;
  ctaUrl?: string;
  target?: '_self' | '_blank';
}

const defaultReviews: Review[] = [
  {
    name: 'Jennifer M.',
    verified: true,
    rating: 5,
    title: 'Finally flat stomach!',
    review: 'The bloating I had for years is completely gone. I feel lighter and my clothes fit so much better!',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face'
  },
  {
    name: 'Sarah K.',
    verified: true,
    rating: 5,
    title: 'Energy is through the roof',
    review: 'No more 3pm crashes. I have consistent energy all day and sleep better at night too.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face'
  },
  {
    name: 'Michelle R.',
    verified: true,
    rating: 5,
    title: 'Lost 15 lbs in 8 weeks',
    review: 'The stubborn belly fat that wouldn\'t budge for years finally started coming off!',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face'
  },
  {
    name: 'Linda P.',
    verified: true,
    rating: 5,
    title: 'Brain fog is GONE',
    review: 'I can think clearly again. My focus and memory are so much better. Game changer!',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face'
  }
];

export default function ReviewGrid({
  headline = 'Real Results From Real Women',
  subheading = 'Join thousands who have transformed their health',
  reviews = defaultReviews,
  ctaText = 'Try It Now →',
  ctaUrl = '#',
  target = '_self'
}: ReviewGridProps) {
  const { appendTracking } = useTracking();
  const trackedCtaUrl = appendTracking(ctaUrl);

  return (
    <div className="my-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-10">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{headline}</h2>
        {subheading && <p className="text-gray-600">{subheading}</p>}
      </div>

      {/* Reviews Grid - 2x2 for larger cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-10 max-w-5xl mx-auto">
        {reviews.map((review, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex flex-col hover:shadow-xl transition-shadow"
          >
            {/* Stars at top */}
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= review.rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* Name with avatar */}
            <div className="flex items-center gap-3 mb-3">
              {review.image && (
                <img
                  src={review.image}
                  alt={review.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-primary-100"
                />
              )}
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 text-lg">{review.name}</span>
                {review.verified && (
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    Verified
                  </span>
                )}
              </div>
            </div>

            {/* Review Title */}
            <h3 className="font-bold text-xl text-gray-900 mb-3">{review.title}</h3>

            {/* Review Text */}
            <p className="text-gray-600 text-base flex-1 mb-5 leading-relaxed">"{review.review}"</p>

            {/* Bottom Image - Uploadable photo */}
            {review.bottomImage && (
              <div className="mt-auto pt-4 border-t border-gray-100">
                <img
                  src={review.bottomImage}
                  alt={`${review.name}'s results`}
                  className="w-full h-40 object-cover rounded-xl shadow-md"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <div className="text-center">
        <a
          href={trackedCtaUrl}
          target={target}
          className="inline-block bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-bold py-4 px-12 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center"
        >
          {ctaText}
        </a>
      </div>
    </div>
  );
}
