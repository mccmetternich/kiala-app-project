'use client';

import { Lightbulb, Quote } from 'lucide-react';

interface DrTipProps {
  tip: string;
  name?: string;
  credentials?: string;
  image?: string;
  style?: 'default' | 'highlighted' | 'minimal';
}

export default function DrTip({
  tip,
  name = 'Dr. Amy Heart',
  credentials,
  image,
  style = 'default',
}: DrTipProps) {
  if (style === 'minimal') {
    return (
      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-gray-700">{tip}</p>
          <p className="text-sm text-gray-500 mt-2">— {name}</p>
        </div>
      </div>
    );
  }

  if (style === 'highlighted') {
    return (
      <div className="relative bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-2xl p-6 md:p-8 border-2 border-purple-200 overflow-hidden">
        {/* Decorative quote mark */}
        <div className="absolute -top-4 -left-4 text-purple-200 opacity-50">
          <Quote className="w-24 h-24" />
        </div>

        <div className="relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
            <Lightbulb className="w-4 h-4" />
            <span>Dr.'s Insight</span>
          </div>

          {/* Tip content */}
          <p className="text-lg text-gray-800 leading-relaxed font-medium mb-4">
            "{tip}"
          </p>

          {/* Attribution */}
          <div className="flex items-center gap-3">
            {image && (
              <img
                src={image}
                alt={name}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
              />
            )}
            <div>
              <p className="font-semibold text-gray-900">{name}</p>
              {credentials && (
                <p className="text-sm text-gray-500">{credentials}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default style
  return (
    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 p-2 bg-amber-100 rounded-full">
          <Lightbulb className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
              Dr.'s Tip
            </span>
          </div>
          <p className="text-gray-700 leading-relaxed">{tip}</p>
          <p className="text-sm text-gray-500 mt-3">— {name}</p>
        </div>
      </div>
    </div>
  );
}
