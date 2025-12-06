'use client';

import { X, Check, ArrowRight } from 'lucide-react';
import { useTracking } from '@/contexts/TrackingContext';

interface ComparisonRow {
  feature: string;
  standard: boolean | string;
  premium: boolean | string;
}

interface ComparisonTableProps {
  title?: string;
  subtitle?: string;
  rows?: ComparisonRow[];
  leftColumnHeader?: string;
  rightColumnHeader?: string;
  // CTA props
  showCta?: boolean;
  ctaText?: string;
  ctaUrl?: string;
  ctaSubtext?: string;
  ctaType?: 'external' | 'anchor';
  target?: '_self' | '_blank';
}

export default function ComparisonTable({
  title = 'Compare Plans',
  subtitle = '',
  rows = [],
  leftColumnHeader = 'Standard',
  rightColumnHeader = 'Premium',
  showCta = false,
  ctaText = 'Get Started',
  ctaUrl = '#',
  ctaSubtext = '',
  ctaType = 'external',
  target = '_self'
}: ComparisonTableProps) {
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

  return (
    <div className="my-12 overflow-x-auto">
      {/* Header with title and subtitle */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
        {subtitle && (
          <p className="mt-2 text-lg text-gray-600">{subtitle}</p>
        )}
      </div>

      {/* Comparison Table */}
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
              <th className="px-6 py-5 text-left font-semibold text-gray-900">Feature</th>
              <th className="px-6 py-5 text-center font-semibold text-gray-500">{leftColumnHeader}</th>
              <th className="px-6 py-5 text-center font-semibold text-primary-600 bg-primary-50/50">{rightColumnHeader}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className={`border-t border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                <td className="px-6 py-4 font-medium text-gray-900">{row.feature}</td>
                <td className="px-6 py-4 text-center">
                  {typeof row.standard === 'boolean' ? (
                    row.standard ? (
                      <div className="flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="w-4 h-4 text-green-600" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center">
                          <X className="w-4 h-4 text-red-400" />
                        </div>
                      </div>
                    )
                  ) : (
                    <span className="text-gray-600">{row.standard}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center bg-primary-50/30">
                  {typeof row.premium === 'boolean' ? (
                    row.premium ? (
                      <div className="flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="w-4 h-4 text-green-600" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center">
                          <X className="w-4 h-4 text-red-400" />
                        </div>
                      </div>
                    )
                  ) : (
                    <span className="text-primary-700 font-semibold">{row.premium}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CTA Button */}
      {showCta && ctaText && ctaUrl && (
        <div className="mt-8 text-center">
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
      )}
    </div>
  );
}
