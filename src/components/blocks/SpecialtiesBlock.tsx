'use client';

import { SpecialtiesBlock as SpecialtiesBlockType } from '@/types/blocks';

interface SpecialtiesBlockProps {
  block: SpecialtiesBlockType;
}

export default function SpecialtiesBlock({ block }: SpecialtiesBlockProps) {
  const { settings } = block;

  return (
    <div className={`py-12 px-8 rounded-2xl ${settings.backgroundColor || 'bg-gray-50'}`}>
      <h2 className="text-2xl font-bold text-center mb-8">{settings.title}</h2>
      
      <div className={`grid gap-6 ${
        settings.layout === 'horizontal' 
          ? 'md:grid-cols-3' 
          : 'md:grid-cols-2 lg:grid-cols-3'
      }`}>
        {settings.specialties.map((specialty, index) => (
          <div key={index} className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">
                {specialty.icon || (index === 0 ? '🧬' : index === 1 ? '⚖️' : '💊')}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{specialty.name}</h3>
            {specialty.description && (
              <p className="text-gray-600 text-sm">{specialty.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}