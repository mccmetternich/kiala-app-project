'use client';

import { useState } from 'react';
import TrackedLink from '@/components/TrackedLink';

interface Testimonial {
  id: string;
  name: string;
  role?: string;
  content: string;
  image?: string;
  rating?: number;
}

interface TestimonialCarouselProps {
  testimonials?: Testimonial[];
  // Optional CTA
  showCta?: boolean;
  ctaText?: string;
  ctaUrl?: string;
  target?: '_self' | '_blank';
  widgetId?: string;
}

export default function TestimonialCarousel({
  testimonials = [],
  showCta = false,
  ctaText = 'Join Them →',
  ctaUrl = '#',
  target = '_self',
  widgetId
}: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  if (testimonials.length === 0) {
    return null;
  }

  const current = testimonials[currentIndex];

  return (
    <div className="bg-gray-50 rounded-2xl p-8 my-12 relative">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          {current.image && (
            <img
              src={current.image}
              alt={current.name}
              className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
            />
          )}
          {current.rating && (
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-6 h-6 ${i < current.rating! ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          )}
          <blockquote className="text-xl text-gray-700 italic mb-6">
            "{current.content}"
          </blockquote>
          <div className="font-bold text-gray-900">{current.name}</div>
          {current.role && <div className="text-gray-600">{current.role}</div>}
        </div>

        {testimonials.length > 1 && (
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
              aria-label="Previous testimonial"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={next}
              className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
              aria-label="Next testimonial"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        <div className="flex justify-center gap-2 mt-4">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-primary-600' : 'bg-gray-300'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Optional CTA */}
        {showCta && ctaText && ctaUrl && (
          <div className="mt-8 text-center">
            <TrackedLink
              href={ctaUrl}
              target={target}
              widgetType="testimonial-carousel"
              widgetId={widgetId}
              widgetName="Testimonial Carousel"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-bold text-lg py-4 px-10 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {ctaText}
            </TrackedLink>
          </div>
        )}
      </div>
    </div>
  );
}
