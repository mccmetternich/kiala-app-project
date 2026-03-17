'use client';

import { X, Check, ArrowRight } from 'lucide-react';
import TrackedLink from '@/components/TrackedLink';

interface ComparisonRow {
  feature: string;
  kiala: boolean | string;
  seed: boolean | string;
  ritual: boolean | string;
}

interface ThreeWayComparisonProps {
  title?: string;
  subtitle?: string;
  rows?: ComparisonRow[];
  // Column headers
  kialaHeader?: string;
  seedHeader?: string;
  ritualHeader?: string;
  // CTA props
  showCta?: boolean;
  ctaText?: string;
  ctaUrl?: string;
  ctaSubtext?: string;
  ctaType?: 'external' | 'anchor';
  target?: '_self' | '_blank';
}

export default function ThreeWayComparison({
  title = 'Product Comparison',
  subtitle = '',
  rows = [],
  kialaHeader = 'Kiala Gummies',
  seedHeader = 'Seed Daily Synbiotic',
  ritualHeader = 'Ritual Synbiotic+',
  showCta = false,
  ctaText = 'Try Kiala Risk-Free',
  ctaUrl = '#',
  ctaSubtext = '',
  ctaType = 'external',
  target = '_self'
}: ThreeWayComparisonProps) {
  
  const renderCell = (value: boolean | string, isKiala: boolean = false) => {
    if (typeof value === 'boolean') {
      return (
        <div className="flex items-center justify-center">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
            value 
              ? isKiala 
                ? 'bg-[#8FAF8A] shadow-md' 
                : 'bg-green-100'
              : 'bg-red-50'
          }`}>
            {value ? (
              <Check className={`w-4 h-4 ${isKiala ? 'text-white stroke-[3]' : 'text-green-600'}`} />
            ) : (
              <X className="w-4 h-4 text-red-400" />
            )}
          </div>
        </div>
      );
    }
    
    return (
      <span className={`text-sm font-medium ${
        isKiala ? 'text-gray-900 font-semibold' : 'text-gray-600'
      }`}>
        {value}
      </span>
    );
  };

  return (
    <div className="my-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
        {subtitle && (
          <p className="mt-2 text-lg text-gray-600">{subtitle}</p>
        )}
      </div>

      {/* Mobile/Tablet: Stacked Cards */}
      <div className="lg:hidden space-y-6">
        {/* Kiala Card - Highlighted */}
        <div className="bg-gradient-to-br from-[#8FAF8A]/10 to-[#8FAF8A]/20 rounded-2xl p-6 border-2 border-[#8FAF8A] shadow-lg">
          <h3 className="text-xl font-bold text-[#8FAF8A] text-center mb-6">{kialaHeader}</h3>
          <div className="space-y-3">
            {rows.map((row, index) => (
              <div key={index} className="flex items-center justify-between bg-white/60 rounded-lg p-3">
                <span className="text-gray-900 font-medium text-sm">{row.feature}</span>
                {renderCell(row.kiala, true)}
              </div>
            ))}
          </div>
        </div>

        {/* Seed Card */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-700 text-center mb-6">{seedHeader}</h3>
          <div className="space-y-3">
            {rows.map((row, index) => (
              <div key={index} className="flex items-center justify-between bg-white/60 rounded-lg p-3">
                <span className="text-gray-700 font-medium text-sm">{row.feature}</span>
                {renderCell(row.seed)}
              </div>
            ))}
          </div>
        </div>

        {/* Ritual Card */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-700 text-center mb-6">{ritualHeader}</h3>
          <div className="space-y-3">
            {rows.map((row, index) => (
              <div key={index} className="flex items-center justify-between bg-white/60 rounded-lg p-3">
                <span className="text-gray-700 font-medium text-sm">{row.feature}</span>
                {renderCell(row.ritual)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: Table */}
      <div className="hidden lg:block">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                <th className="px-6 py-5 text-left font-semibold text-gray-900 w-2/5">Feature</th>
                <th className="px-6 py-5 text-center font-semibold text-gray-900 bg-[#8FAF8A]/10 w-1/5">{kialaHeader}</th>
                <th className="px-6 py-5 text-center font-semibold text-gray-600 w-1/5">{seedHeader}</th>
                <th className="px-6 py-5 text-center font-semibold text-gray-600 w-1/5">{ritualHeader}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="border-t border-gray-100 bg-white">
                  <td className="px-6 py-4 font-medium text-gray-900">{row.feature}</td>
                  <td className="px-6 py-4 text-center bg-[#8FAF8A]/5">
                    {renderCell(row.kiala, true)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {renderCell(row.seed)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {renderCell(row.ritual)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA Button */}
      {showCta && ctaText && ctaUrl && (
        <div className="mt-8 text-center">
          <TrackedLink
            href={ctaUrl}
            target={target}
            widgetType="three-way-comparison"
            widgetName={title}
            className="inline-flex items-center justify-center gap-2 font-bold text-lg py-4 px-10 rounded-xl shadow-lg text-center no-underline whitespace-nowrap [&]:!text-white [&_*]:!text-white transition-all hover:shadow-xl transform hover:-translate-y-0.5"
            style={{ 
              background: '#8FAF8A !important', 
              textDecoration: 'none !important', 
              color: '#ffffff !important',
              border: 'none !important',
              WebkitTextFillColor: '#ffffff !important'
            }}
          >
            {ctaText}
            <ArrowRight className="w-5 h-5" />
          </TrackedLink>
          {ctaSubtext && (
            <p className="mt-2 text-sm text-gray-500">{ctaSubtext}</p>
          )}
        </div>
      )}
    </div>
  );
}