'use client';

import { ProductBlock as ProductBlockType } from '@/types/blocks';

interface ProductBlockProps {
  block: ProductBlockType;
}

export default function ProductBlock({ block }: ProductBlockProps) {
  const { settings } = block;
  
  const discountPercentage = settings.originalPrice && settings.price < settings.originalPrice
    ? Math.round(((settings.originalPrice - settings.price) / settings.originalPrice) * 100)
    : null;

  return (
    <div className={`bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100 shadow-lg`}>
      <div className="grid lg:grid-cols-2 gap-8 items-center">
        <div>
          {settings.badge && (
            <div className={`inline-flex items-center gap-2 ${settings.badgeColor || 'bg-green-100 text-green-800'} px-3 py-1 rounded-full text-sm font-medium mb-4`}>
              <span>🌟</span>
              {settings.badge}
            </div>
          )}
          
          <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
            {settings.title}
          </h3>
          
          <p className="text-gray-700 mb-6 text-lg leading-relaxed">
            {settings.description}
          </p>
          
          {settings.testimonials && settings.testimonials.length > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                <span className="text-yellow-400">
                  {'⭐'.repeat(settings.testimonials[0].rating || 5)}
                </span>
                <span className="text-sm text-gray-600">
                  ({settings.testimonials.length} reviews)
                </span>
              </div>
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Digital Download
              </span>
            </div>
          )}
          
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-green-600">${settings.price}</span>
            {settings.originalPrice && settings.originalPrice > settings.price && (
              <>
                <span className="text-lg text-gray-500 line-through">${settings.originalPrice}</span>
                {discountPercentage && (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                    {discountPercentage}% Off Today
                  </span>
                )}
              </>
            )}
          </div>
          
          <button className={`${settings.ctaColor || 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'} text-white font-semibold px-8 py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg text-lg`}>
            {settings.ctaText}
          </button>
        </div>
        
        <div className="relative">
          <div className="bg-white rounded-xl p-6 shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
            {settings.image ? (
              <img src={settings.image} alt={settings.title} className="w-full h-64 object-cover rounded-lg mb-4" />
            ) : (
              <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg h-64 flex items-center justify-center mb-4">
                <div className="text-center text-white">
                  <div className="text-6xl mb-2">📚</div>
                  <div className="font-bold text-lg">Complete Guide</div>
                  <div className="text-sm opacity-90">Digital Product</div>
                </div>
              </div>
            )}
            <div className="text-center">
              <div className="font-semibold text-gray-800 mb-1">{settings.title}</div>
              <div className="text-sm text-gray-600">PDF + Bonus Materials</div>
            </div>
          </div>
        </div>
      </div>
      
      {settings.features && settings.features.length > 0 && (
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
          <h4 className="font-semibold text-gray-800 mb-4">What's Included:</h4>
          <div className="grid md:grid-cols-2 gap-2">
            {settings.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-gray-600">
                <span className="text-green-500">✓</span>
                {feature}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}