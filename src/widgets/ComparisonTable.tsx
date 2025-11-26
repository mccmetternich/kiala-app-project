'use client';

interface ComparisonRow {
  feature: string;
  standard: boolean | string;
  premium: boolean | string;
}

interface ComparisonTableProps {
  title?: string;
  rows?: ComparisonRow[];
}

export default function ComparisonTable({
  title = 'Compare Plans',
  rows = []
}: ComparisonTableProps) {
  return (
    <div className="my-12 overflow-x-auto">
      <h2 className="text-3xl font-bold text-center mb-8">{title}</h2>
      <table className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-4 text-left font-semibold text-gray-900">Feature</th>
            <th className="px-6 py-4 text-center font-semibold text-gray-900">Standard</th>
            <th className="px-6 py-4 text-center font-semibold text-primary-600">Premium</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-t border-gray-200">
              <td className="px-6 py-4 font-medium text-gray-900">{row.feature}</td>
              <td className="px-6 py-4 text-center">
                {typeof row.standard === 'boolean' ? (
                  row.standard ? (
                    <span className="text-green-500 text-2xl">✓</span>
                  ) : (
                    <span className="text-gray-300 text-2xl">-</span>
                  )
                ) : (
                  <span className="text-gray-700">{row.standard}</span>
                )}
              </td>
              <td className="px-6 py-4 text-center">
                {typeof row.premium === 'boolean' ? (
                  row.premium ? (
                    <span className="text-green-500 text-2xl">✓</span>
                  ) : (
                    <span className="text-gray-300 text-2xl">-</span>
                  )
                ) : (
                  <span className="text-gray-700">{row.premium}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
