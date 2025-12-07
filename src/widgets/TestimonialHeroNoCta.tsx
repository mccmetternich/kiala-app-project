'use client';

import { BadgeCheck } from 'lucide-react';

interface TestimonialHeroNoCtaProps {
  image?: string;
  title?: string;
  body?: string;
  // Author info
  authorName?: string;
  authorAge?: string;
  authorLocation?: string;
  authorAvatar?: string;
  showVerifiedBadge?: boolean;
}

export default function TestimonialHeroNoCta({
  image = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=800&fit=crop&crop=face',
  title = 'I Lost 22 lbs and My Energy is Through the Roof!',
  body = `"At 52, I thought feeling tired and bloated was just part of getting older. I tried everything—different diets, expensive supplements, even considered medications. Nothing worked until I found Kiala Greens.

Within the first week, my bloating was GONE. By week 4, I had more energy than I'd felt in years. And now, 8 weeks later? I've lost 22 pounds—most of it from my midsection—and I feel like I'm in my 30s again.

If you're on the fence, just try it. The 90-day guarantee means you have nothing to lose (except the weight!). This has honestly changed my life."`,
  authorName = 'Jennifer M.',
  authorAge = '52',
  authorLocation = 'Austin, TX',
  authorAvatar,
  showVerifiedBadge = true
}: TestimonialHeroNoCtaProps) {
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
          <div className="text-gray-700 whitespace-pre-line text-sm md:text-base leading-relaxed mb-6">
            {body}
          </div>

          {/* Author Attribution Section */}
          {(authorName || authorAge || authorLocation) && (
            <div className="mt-auto pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                {authorAvatar ? (
                  <img
                    src={authorAvatar}
                    alt={authorName || 'Community member'}
                    className="w-14 h-14 rounded-full object-cover border-2 border-primary-200 shadow-md"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
                    {authorName ? authorName.charAt(0).toUpperCase() : 'C'}
                  </div>
                )}

                {/* Name, Age, Location + Badge */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900 text-lg">
                      {authorName}
                      {authorAge && <span className="text-gray-600 font-normal">, {authorAge}</span>}
                    </span>
                    {showVerifiedBadge && (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                        <BadgeCheck className="w-3.5 h-3.5" />
                        Verified Member
                      </span>
                    )}
                  </div>
                  {authorLocation && (
                    <p className="text-gray-500 text-sm mt-0.5">{authorLocation}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
