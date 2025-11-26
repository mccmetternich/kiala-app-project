'use client';

import { useTracking } from '@/contexts/TrackingContext';

interface ProductShowcaseProps {
  title?: string;
  description?: string;
  price?: string;
  image?: string;
  features?: string[];
  ctaText?: string;
  ctaLink?: string;
  target?: '_self' | '_blank';
}

export default function ProductShowcase({
  title = 'Featured Product',
  description = 'Transform your health with our flagship solution',
  price,
  image,
  features = [],
  ctaText = 'Get Started',
  ctaLink = '#',
  target = '_self'
}: ProductShowcaseProps) {
  const { appendTracking } = useTracking();
  const trackedCtaLink = appendTracking(ctaLink);

  return (
    <div className="bg-gradient-to-br from-primary-50 to-white rounded-2xl p-8 shadow-lg my-8">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          {image && (
            <img src={image} alt={title} className="rounded-lg shadow-md w-full" />
          )}
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-lg text-gray-600 mb-6">{description}</p>
          {price && (
            <div className="text-4xl font-bold text-primary-600 mb-6">{price}</div>
          )}
          {features.length > 0 && (
            <ul className="space-y-3 mb-6">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          )}
          <a
            href={trackedCtaLink}
            target={target}
            className="inline-block bg-primary-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-primary-700 transition-colors"
          >
            {ctaText}
          </a>
        </div>
      </div>
    </div>
  );
}
