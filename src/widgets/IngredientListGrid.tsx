'use client';

import { Sparkles } from 'lucide-react';

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
  style = 'default'
}: IngredientListGridProps) {
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
      </div>
    </div>
  );
}
