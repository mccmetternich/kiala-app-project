'use client';

import { useState } from 'react';
import { Check, Circle, ArrowRight, ClipboardList } from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  checked?: boolean;
}

interface ChecklistProps {
  headline: string;
  subheading?: string;
  items: ChecklistItem[];
  footer?: string;
  ctaText?: string;
  ctaUrl?: string;
  style?: 'default' | 'interactive' | 'assessment';
}

export default function Checklist({
  headline,
  subheading,
  items,
  footer,
  ctaText,
  ctaUrl,
  style = 'default',
}: ChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(
    new Set(items.filter(i => i.checked).map(i => i.id))
  );

  const toggleItem = (id: string) => {
    if (style !== 'interactive' && style !== 'assessment') return;

    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  const checkedCount = checkedItems.size;
  const totalItems = items.length;
  const isAssessment = style === 'assessment';

  return (
    <div className={`rounded-2xl overflow-hidden ${
      isAssessment
        ? 'bg-gradient-to-br from-rose-50 to-orange-50 border-2 border-rose-200'
        : 'bg-white border border-gray-200 shadow-lg'
    }`}>
      {/* Header */}
      <div className={`px-6 py-5 ${isAssessment ? 'border-b border-rose-200' : 'border-b border-gray-100'}`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${isAssessment ? 'bg-rose-100' : 'bg-purple-100'}`}>
            <ClipboardList className={`w-5 h-5 ${isAssessment ? 'text-rose-600' : 'text-purple-600'}`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{headline}</h3>
            {subheading && <p className="text-sm text-gray-600 mt-1">{subheading}</p>}
          </div>
        </div>

        {/* Progress indicator for interactive */}
        {(style === 'interactive' || style === 'assessment') && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">
                {checkedCount} of {totalItems} {isAssessment ? 'symptoms selected' : 'completed'}
              </span>
              <span className={`font-medium ${
                isAssessment && checkedCount >= 3 ? 'text-rose-600' : 'text-purple-600'
              }`}>
                {Math.round((checkedCount / totalItems) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isAssessment && checkedCount >= 3 ? 'bg-rose-500' : 'bg-purple-500'
                }`}
                style={{ width: `${(checkedCount / totalItems) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="p-6">
        <ul className="space-y-3">
          {items.map((item) => {
            const isChecked = checkedItems.has(item.id);
            const isClickable = style === 'interactive' || style === 'assessment';

            return (
              <li key={item.id}>
                <button
                  onClick={() => toggleItem(item.id)}
                  disabled={!isClickable}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                    isClickable ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'
                  } ${isChecked ? (isAssessment ? 'bg-rose-50' : 'bg-purple-50') : 'bg-gray-50'}`}
                >
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isChecked
                      ? (isAssessment ? 'bg-rose-500 border-rose-500' : 'bg-purple-500 border-purple-500')
                      : 'border-gray-300 bg-white'
                  }`}>
                    {isChecked ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <Circle className="w-3 h-3 text-gray-300" />
                    )}
                  </div>
                  <span className={`text-gray-700 ${isChecked ? 'font-medium' : ''}`}>
                    {item.text}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Footer message */}
        {footer && (
          <div className={`mt-6 p-4 rounded-xl ${
            isAssessment && checkedCount >= 3
              ? 'bg-rose-100 text-rose-800'
              : 'bg-gray-100 text-gray-700'
          }`}>
            <p className="text-sm font-medium">{footer}</p>
          </div>
        )}

        {/* CTA */}
        {ctaText && ctaUrl && (
          <a
            href={ctaUrl}
            className={`mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
              isAssessment
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {ctaText}
            <ArrowRight className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}
