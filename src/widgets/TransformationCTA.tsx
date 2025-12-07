'use client';

import TrackedLink from '@/components/TrackedLink';

interface TransformationCTAProps {
  title?: string;
  description?: string;
  beforeLabel?: string;
  afterLabel?: string;
  beforeImage?: string;
  afterImage?: string;
  ctaText?: string;
  ctaLink?: string;
  widgetId?: string;
}

export default function TransformationCTA({
  title = 'See Real Results',
  description = 'Join thousands who have transformed their health',
  beforeLabel = 'Before',
  afterLabel = 'After',
  beforeImage,
  afterImage,
  ctaText = 'Start Your Transformation',
  ctaLink = '#',
  widgetId
}: TransformationCTAProps) {
  return (
    <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-12 my-12 text-center">
      <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
      <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">{description}</p>

      {beforeImage && afterImage && (
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-8">
          <div>
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <img src={beforeImage} alt={beforeLabel} className="rounded-lg w-full" />
              <div className="mt-4 text-lg font-semibold text-gray-700">{beforeLabel}</div>
            </div>
          </div>
          <div>
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <img src={afterImage} alt={afterLabel} className="rounded-lg w-full" />
              <div className="mt-4 text-lg font-semibold text-primary-600">{afterLabel}</div>
            </div>
          </div>
        </div>
      )}

      <TrackedLink
        href={ctaLink}
        widgetType="transformation-cta"
        widgetId={widgetId || `transformation-cta-${title?.substring(0, 20)}`}
        widgetName={title || ctaText || 'Transformation CTA'}
        className="inline-block bg-primary-600 text-white px-12 py-5 rounded-lg font-bold text-xl hover:bg-primary-700 transition-colors shadow-lg"
      >
        {ctaText}
      </TrackedLink>

      <p className="mt-6 text-sm text-gray-600">
        ✓ No credit card required  •  ✓ 30-day money-back guarantee
      </p>
    </div>
  );
}
