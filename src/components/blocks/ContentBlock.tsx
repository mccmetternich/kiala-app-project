'use client';

import { ContentBlock as ContentBlockType } from '@/types/blocks';

interface ContentBlockProps {
  block: ContentBlockType;
}

export default function ContentBlock({ block }: ContentBlockProps) {
  const { settings } = block;

  return (
    <div 
      className={`py-8 ${settings.backgroundColor || ''}`}
      style={{ color: settings.textColor || 'inherit' }}
    >
      <div 
        className={`mx-auto text-${settings.alignment || 'left'}`}
        style={{ maxWidth: settings.maxWidth || '48rem' }}
      >
        {settings.title && (
          <h2 className="text-2xl font-bold mb-6">{settings.title}</h2>
        )}
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: settings.content }}
        />
      </div>
    </div>
  );
}