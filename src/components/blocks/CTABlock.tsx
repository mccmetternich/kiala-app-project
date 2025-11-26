'use client';

import { CTABlock as CTABlockType } from '@/types/blocks';

interface CTABlockProps {
  block: CTABlockType;
}

export default function CTABlock({ block }: CTABlockProps) {
  const { settings } = block;

  const getStyleClasses = () => {
    switch (settings.style) {
      case 'banner':
        return 'py-8 px-6 text-center';
      case 'card':
        return 'p-8 rounded-2xl shadow-lg text-center max-w-2xl mx-auto';
      case 'full-width':
        return 'py-16 px-8 text-center';
      default:
        return 'p-8 rounded-lg text-center';
    }
  };

  return (
    <div 
      className={`${getStyleClasses()} ${settings.backgroundColor || 'bg-primary-50'}`}
    >
      <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
        {settings.title}
      </h3>
      
      <p className="text-gray-700 mb-6 text-lg max-w-2xl mx-auto">
        {settings.description}
      </p>
      
      {settings.urgency && (
        <p className="text-red-600 font-medium mb-6 text-sm">
          {settings.urgency}
        </p>
      )}
      
      <a
        href={settings.ctaLink || '#'}
        className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg text-lg"
      >
        {settings.ctaText}
      </a>
    </div>
  );
}