'use client';

import { X, Check } from 'lucide-react';

interface ComparisonRow {
  feature: string;
  standard: boolean | string;
  premium: boolean | string;
}

interface ComparisonTableProps {
  title?: string;
  rows?: ComparisonRow[];
  leftColumnHeader?: string;
  rightColumnHeader?: string;
}

export default function ComparisonTable({
  title = 'Compare Plans',
  rows = [],
  leftColumnHeader = 'Standard',
  rightColumnHeader = 'Premium'
}: ComparisonTableProps) {
  return (
    <div className="my-12 overflow-x-auto">
      <h2 className="text-3xl font-bold text-center mb-8">{title}</h2>
      <table className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
        <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
          <tr>
            <th className="px-6 py-4 text-left font-semibold text-gray-900">Feature</th>
            <th className="px-6 py-4 text-center font-semibold text-gray-500">{leftColumnHeader}</th>
            <th className="px-6 py-4 text-center font-semibold text-primary-600">{rightColumnHeader}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className={`border-t border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
              <td className="px-6 py-4 font-medium text-gray-900">{row.feature}</td>
              <td className="px-6 py-4 text-center">
                {typeof row.standard === 'boolean' ? (
                  row.standard ? (
                    <Check className="w-6 h-6 text-green-500 mx-auto" />
                  ) : (
                    <X className="w-6 h-6 text-red-400 mx-auto" />
                  )
                ) : (
                  <span className="text-gray-600">{row.standard}</span>
                )}
              </td>
              <td className="px-6 py-4 text-center bg-green-50/50">
                {typeof row.premium === 'boolean' ? (
                  row.premium ? (
                    <Check className="w-6 h-6 text-green-600 mx-auto" />
                  ) : (
                    <X className="w-6 h-6 text-red-400 mx-auto" />
                  )
                ) : (
                  <span className="text-green-700 font-medium">{row.premium}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
