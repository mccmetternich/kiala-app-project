'use client';

import { useTracking } from '@/contexts/TrackingContext';
import { trackInitiateCheckout } from '@/lib/meta-pixel';

interface CTAButtonProps {
  buttonUrl?: string;
  buttonText?: string;
  target?: '_self' | '_blank';
  style?: 'primary' | 'secondary';
}

export default function CTAButton({
  buttonUrl = '#',
  buttonText = 'Take Action Now →',
  target = '_self',
  style = 'primary'
}: CTAButtonProps) {
  const { appendTracking } = useTracking();
  const trackedUrl = appendTracking(buttonUrl);

  const handleClick = () => {
    // Fire InitiateCheckout event for CTA clicks
    trackInitiateCheckout({
      content_name: buttonText || 'CTA Button',
      content_category: 'cta_button'
    });
  };

  return (
    <div className="my-8 text-center">
      <a
        href={trackedUrl}
        target={target}
        onClick={handleClick}
        className={`block w-full md:w-auto md:inline-block md:mx-auto text-center px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-xl ${
          style === 'secondary'
            ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            : 'bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white'
        }`}
      >
        {buttonText}
      </a>
    </div>
  );
}
