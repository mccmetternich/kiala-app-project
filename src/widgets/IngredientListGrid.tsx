'use client';

import { Sparkles, Plus, ArrowRight } from 'lucide-react';
import { useTracking } from '@/contexts/TrackingContext';

interface Ingredient {
  name: string;
  description: string;
  image?: string;
}

interface IngredientListGridProps {
  headline?: string;
  bannerText?: string;
  ingredients?: Ingredient[];
  columns?: 2 | 3 | 4;
  style?: 'default' | 'simple';  // simple = no banner, just cards
  // New: Additional ingredients callout
  additionalCount?: number;
  additionalText?: string;
  showAdditional?: boolean;
  // CTA props
  showCta?: boolean;
  ctaText?: string;
  ctaUrl?: string;
  ctaSubtext?: string;
  ctaType?: 'external' | 'anchor';
  target?: '_self' | '_blank';
}

const defaultIngredients: Ingredient[] = [
  {
    name: 'Ashwagandha',
    description: 'Adaptogen that helps balance cortisol levels and reduce stress-related weight gain',
    image: ''
  },
  {
    name: 'Maca Root',
    description: 'Peruvian superfood that supports hormone balance and boosts energy naturally',
    image: ''
  },
  {
    name: 'Spirulina',
    description: 'Nutrient-dense blue-green algae packed with protein and essential vitamins',
    image: ''
  },
  {
    name: 'Chlorella',
    description: 'Powerful detoxifier that helps remove toxins and supports cellular health',
    image: ''
  },
  {
    name: 'Green Tea Extract',
    description: 'Metabolism booster with antioxidants that support healthy weight management',
    image: ''
  },
  {
    name: 'Turmeric',
    description: 'Anti-inflammatory powerhouse that supports joint health and digestion',
    image: ''
  }
];

export default function IngredientListGrid({
  headline = 'Powerful Ingredients, Proven Results',
  bannerText = '✨ 6 Clinically-Backed Superfoods in Every Scoop',
  ingredients = defaultIngredients,
  columns = 2,
  style = 'default',
  additionalCount = 20,
  additionalText = 'hormone-supporting, gut-healing superfoods in every scoop',
  showAdditional = true,
  showCta = false,
  ctaText = 'Learn More →',
  ctaUrl = '#',
  ctaSubtext = '',
  ctaType = 'external',
  target = '_self'
}: IngredientListGridProps) {
  const { appendTracking } = useTracking();
  const finalCtaUrl = ctaType === 'anchor' ? ctaUrl : (ctaUrl ? appendTracking(ctaUrl) : '#');
  const finalTarget = ctaType === 'anchor' ? '_self' : target;

  const handleCtaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (ctaType === 'anchor' && ctaUrl) {
      e.preventDefault();
      const element = document.getElementById(ctaUrl.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // CTA Button component to reuse across styles
  const CtaButton = () => showCta && ctaText && ctaUrl ? (
    <div className="mt-6 text-center">
      <a
        href={finalCtaUrl}
        target={finalTarget}
        rel={finalTarget === '_blank' ? 'noopener noreferrer' : undefined}
        onClick={handleCtaClick}
        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-bold text-lg py-4 px-10 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        {ctaText}
        <ArrowRight className="w-5 h-5" />
      </a>
      {ctaSubtext && (
        <p className="mt-2 text-sm text-gray-500">{ctaSubtext}</p>
      )}
    </div>
  ) : null;

  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4'
  };

  // Simple style - matches the article's current HTML styling
  if (style === 'simple') {
    return (
      <div className="my-6">
        <div className={`grid gap-4 ${gridCols[columns]}`}>
          {ingredients.map((ingredient, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                {/* Thumbnail Image */}
                {ingredient.image ? (
                  <img
                    src={ingredient.image}
                    alt={ingredient.name}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-green-600">
                      {ingredient.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">{ingredient.name}</h4>
                  <p className="text-gray-600 text-sm">{ingredient.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Ingredients Callout - Simple Style */}
        {showAdditional && additionalCount > 0 && (
          <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-center justify-center gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <Plus className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-purple-800 font-medium">
                <span className="text-2xl font-bold text-purple-700">+{additionalCount}</span> {additionalText}
              </p>
            </div>
          </div>
        )}

        <CtaButton />
      </div>
    );
  }

  // Default style - with banner
  return (
    <div className="my-8">
      {/* Gradient Banner */}
      <div className="bg-gradient-to-r from-primary-500 via-purple-500 to-primary-600 text-white py-4 px-6 rounded-t-2xl">
        <div className="flex items-center justify-center gap-2 text-lg font-bold">
          <Sparkles className="w-5 h-5" />
          <span>{bannerText}</span>
          <Sparkles className="w-5 h-5" />
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-b-2xl shadow-xl border border-gray-100 border-t-0 p-6 md:p-8">
        {headline && (
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">
            {headline}
          </h2>
        )}

        {/* Ingredients Grid */}
        <div className={`grid gap-6 ${gridCols[columns]}`}>
          {ingredients.map((ingredient, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all group"
            >
              {/* Avatar/Image */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {ingredient.image ? (
                    <img
                      src={ingredient.image}
                      alt={ingredient.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-primary-200 shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center border-2 border-primary-200 shadow-md">
                      <span className="text-2xl font-bold text-primary-600">
                        {ingredient.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-primary-600 transition-colors">
                    {ingredient.name}
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                    {ingredient.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Ingredients Callout */}
        {showAdditional && additionalCount > 0 && (
          <div className="mt-8 bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 rounded-2xl p-6 border border-purple-200">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
              <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-lg">
                <Plus className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-lg md:text-xl text-purple-900">
                  <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">+{additionalCount}</span>
                  <span className="font-semibold ml-2">more</span>
                </p>
                <p className="text-purple-700 font-medium">{additionalText}</p>
              </div>
            </div>
          </div>
        )}

        <CtaButton />
      </div>
    </div>
  );
}
