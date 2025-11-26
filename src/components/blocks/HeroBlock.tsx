'use client';

import { HeroBlock as HeroBlockType } from '@/types/blocks';

interface HeroBlockProps {
  block: HeroBlockType;
}

export default function HeroBlock({ block }: HeroBlockProps) {
  const { settings } = block;

  return (
    <div 
      className={`relative py-20 px-8 rounded-2xl ${settings.backgroundColor || 'bg-gradient-to-r from-blue-50 to-purple-50'}`}
      style={{
        backgroundImage: settings.backgroundImage ? `url(${settings.backgroundImage})` : undefined,
        color: settings.textColor || 'inherit'
      }}
    >
      <div className={`max-w-4xl mx-auto text-${settings.alignment || 'center'}`}>
        <h1 className="text-4xl lg:text-6xl font-bold mb-6">
          {settings.title}
        </h1>
        <p className="text-xl lg:text-2xl mb-8 opacity-90">
          {settings.subtitle}
        </p>
        {settings.showCTA && settings.ctaText && (
          <a
            href={settings.ctaLink || '#'}
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg text-lg"
          >
            {settings.ctaText}
          </a>
        )}
      </div>
    </div>
  );
}