'use client';

import { TestimonialBlock as TestimonialBlockType } from '@/types/blocks';

interface TestimonialBlockProps {
  block: TestimonialBlockType;
}

export default function TestimonialBlock({ block }: TestimonialBlockProps) {
  const { settings } = block;

  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating);
  };

  if (settings.layout === 'single') {
    const testimonial = settings.testimonials[0];
    return (
      <div className={`py-12 px-8 rounded-2xl ${settings.backgroundColor || 'bg-blue-50'}`}>
        <div className="max-w-3xl mx-auto text-center">
          <blockquote className="text-xl italic text-gray-700 mb-6">
            "{testimonial.text}"
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            {testimonial.image && (
              <img src={testimonial.image} alt={testimonial.author} className="w-12 h-12 rounded-full" />
            )}
            <div>
              <div className="font-semibold text-gray-900">{testimonial.author}</div>
              {testimonial.title && <div className="text-gray-600 text-sm">{testimonial.title}</div>}
              {settings.showRatings && testimonial.rating && (
                <div className="text-yellow-400">{renderStars(testimonial.rating)}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`py-12 px-8 rounded-2xl ${settings.backgroundColor || 'bg-gray-50'}`}>
      <div className={`grid gap-6 ${settings.layout === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {settings.testimonials.map((testimonial, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
            <blockquote className="text-gray-700 mb-4">
              "{testimonial.text}"
            </blockquote>
            <div className="flex items-center gap-3">
              {testimonial.image && (
                <img src={testimonial.image} alt={testimonial.author} className="w-10 h-10 rounded-full" />
              )}
              <div>
                <div className="font-semibold text-gray-900 text-sm">{testimonial.author}</div>
                {testimonial.title && <div className="text-gray-600 text-xs">{testimonial.title}</div>}
                {settings.showRatings && testimonial.rating && (
                  <div className="text-yellow-400 text-sm">{renderStars(testimonial.rating)}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}