'use client';

import { Star, ArrowRight, Check, Quote } from 'lucide-react';
import TrackedLink from '@/components/TrackedLink';

interface ProductShowcaseProps {
  title?: string;
  description?: string;
  price?: string;
  originalPrice?: string;
  image?: string;
  features?: string[];
  ctaText?: string;
  ctaLink?: string;
  ctaType?: 'external' | 'anchor';
  target?: '_self' | '_blank';
  // New: Bullets under CTA
  ctaBullets?: string[];
  // New: Testimonial
  showTestimonial?: boolean;
  testimonialQuote?: string;
  testimonialAuthor?: string;
  testimonialImage?: string;
  // New: Rating
  showRating?: boolean;
  ratingStars?: number;
  ratingCount?: string;
  widgetId?: string;
}

export default function ProductShowcase({
  title = 'Featured Product',
  description = 'Transform your health with our flagship solution',
  price,
  originalPrice,
  image,
  features = [],
  ctaText = 'Get Started',
  ctaLink = '#',
  ctaType = 'external',
  target = '_self',
  ctaBullets = ['Free Shipping', '60-Day Guarantee', '24/7 Support'],
  showTestimonial = false,
  testimonialQuote = '"This product changed my life! I feel so much better."',
  testimonialAuthor = 'Sarah M., Texas',
  testimonialImage,
  showRating = true,
  ratingStars = 5,
  ratingCount = '2,847 reviews',
  widgetId
}: ProductShowcaseProps) {
  return (
    <div className="bg-gradient-to-br from-primary-50 via-white to-purple-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden my-8">
      <div className="flex flex-col md:flex-row items-stretch">
        {/* Product Image */}
        {image && (
          <div className="md:w-2/5 relative">
            <div className="aspect-square md:aspect-auto md:h-full">
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Rating badge on image */}
            {showRating && (
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur px-3 py-2 rounded-xl shadow-lg flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, idx) => (
                    <Star
                      key={idx}
                      className={`w-4 h-4 ${idx < ratingStars ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 font-medium">{ratingCount}</span>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="md:w-3/5 p-6 md:p-8 flex flex-col justify-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{title}</h2>
          <p className="text-gray-600 mb-4">{description}</p>

          {/* Price */}
          {price && (
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-bold text-primary-600">{price}</span>
              {originalPrice && (
                <span className="text-lg text-gray-400 line-through">{originalPrice}</span>
              )}
            </div>
          )}

          {/* Features */}
          {features && features.length > 0 && (
            <ul className="space-y-2 mb-5">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          )}

          {/* CTA Button */}
          <TrackedLink
            href={ctaLink}
            target={target}
            widgetType="product-showcase"
            widgetId={widgetId || `product-showcase-${title?.substring(0, 20)}`}
            widgetName={title || 'Product Showcase'}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl text-lg"
          >
            {ctaText}
            <ArrowRight className="w-5 h-5" />
          </TrackedLink>

          {/* Bullets under CTA */}
          {ctaBullets && ctaBullets.length > 0 && (
            <div className="flex flex-wrap items-center justify-start gap-4 mt-4 text-sm text-gray-600">
              {ctaBullets.map((bullet, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          )}

          {/* Testimonial */}
          {showTestimonial && (
            <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-start gap-3">
                {testimonialImage ? (
                  <img
                    src={testimonialImage}
                    alt={testimonialAuthor}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Quote className="w-5 h-5 text-primary-600" />
                  </div>
                )}
                <div>
                  <p className="text-gray-700 italic text-sm mb-2">{testimonialQuote}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} className="w-3 h-3 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-600">{testimonialAuthor}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
