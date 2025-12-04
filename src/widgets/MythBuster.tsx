'use client';

import { XCircle, CheckCircle, AlertTriangle, Brain, Thermometer, Link, Zap, Heart } from 'lucide-react';

interface Myth {
  myth: string;
  truth: string;
  icon?: string;
}

interface MythBusterProps {
  headline?: string;
  subheading?: string;
  myths: Myth[];
  style?: 'cards' | 'list' | 'compact';
}

const iconMap: Record<string, React.ReactNode> = {
  brain: <Brain className="w-5 h-5" />,
  thermometer: <Thermometer className="w-5 h-5" />,
  link: <Link className="w-5 h-5" />,
  zap: <Zap className="w-5 h-5" />,
  heart: <Heart className="w-5 h-5" />,
};

export default function MythBuster({
  headline = "Myth vs. Reality",
  subheading,
  myths,
  style = 'cards',
}: MythBusterProps) {
  if (style === 'compact') {
    return (
      <div className="bg-gray-50 rounded-2xl p-6 md:p-8">
        {headline && (
          <h3 className="text-xl font-bold text-gray-900 mb-2">{headline}</h3>
        )}
        {subheading && (
          <p className="text-gray-600 mb-6">{subheading}</p>
        )}
        <div className="space-y-4">
          {myths.map((item, idx) => (
            <div key={idx} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3 mb-2">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-600 line-through">{item.myth}</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-900 font-medium">{item.truth}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (style === 'list') {
    return (
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        {headline && (
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">{headline}</h3>
            {subheading && <p className="text-gray-600 text-sm mt-1">{subheading}</p>}
          </div>
        )}
        <div className="divide-y divide-gray-100">
          {myths.map((item, idx) => (
            <div key={idx} className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-red-700 font-semibold text-sm mb-2">
                    <XCircle className="w-4 h-4" />
                    <span>MYTH</span>
                  </div>
                  <p className="text-gray-700">{item.myth}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-green-700 font-semibold text-sm mb-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>TRUTH</span>
                  </div>
                  <p className="text-gray-700">{item.truth}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Cards style (default)
  return (
    <div className="space-y-6">
      {headline && (
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900">{headline}</h3>
          {subheading && <p className="text-gray-600 mt-2">{subheading}</p>}
        </div>
      )}
      <div className="grid md:grid-cols-1 gap-4">
        {myths.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="grid md:grid-cols-2">
              {/* Myth side */}
              <div className="bg-gradient-to-br from-red-50 to-rose-50 p-6 border-b md:border-b-0 md:border-r border-red-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-red-100 rounded-full">
                    <XCircle className="w-4 h-4 text-red-600" />
                  </div>
                  <span className="text-xs font-bold text-red-700 uppercase tracking-wide">What You've Been Told</span>
                </div>
                <p className="text-gray-700">{item.myth}</p>
              </div>

              {/* Truth side */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-green-100 rounded-full">
                    {item.icon && iconMap[item.icon] ? (
                      <span className="text-green-600">{iconMap[item.icon]}</span>
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-green-700 uppercase tracking-wide">What's Actually True</span>
                </div>
                <p className="text-gray-700 font-medium">{item.truth}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
