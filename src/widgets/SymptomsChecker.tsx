'use client';

import { useState } from 'react';
import { Check, AlertCircle, Sparkles } from 'lucide-react';
import TrackedLink from '@/components/TrackedLink';

interface Symptom {
  id?: string;
  text?: string;
  label?: string;  // Alias for text
  category?: string;
}

interface SymptomsCheckerProps {
  headline?: string;
  subheading?: string;
  symptoms?: Symptom[];
  conclusionHeadline?: string;
  conclusionText?: string;
  minSymptoms?: number;
  results?: any;  // Optional results config
  // CTA in reveal section
  showCta?: boolean;
  ctaText?: string;
  ctaUrl?: string;
  ctaType?: 'external' | 'anchor';
  anchorWidgetId?: string;
}

const defaultSymptoms: Symptom[] = [
  { text: 'Unexplained weight gain, especially around the midsection', category: 'Metabolism' },
  { text: 'Constant fatigue, even after a full night\'s sleep', category: 'Energy' },
  { text: 'Mood swings, irritability, or feeling "off"', category: 'Mood' },
  { text: 'Difficulty concentrating or "brain fog"', category: 'Mental' },
  { text: 'Hot flashes or night sweats', category: 'Hormones' },
  { text: 'Trouble falling or staying asleep', category: 'Sleep' },
  { text: 'Low libido or changes in intimate health', category: 'Hormones' },
  { text: 'Cravings for sugar or carbs', category: 'Metabolism' },
  { text: 'Thinning hair or dry skin', category: 'Physical' },
  { text: 'Feeling anxious or overwhelmed more than usual', category: 'Mood' }
];

export default function SymptomsChecker({
  headline = 'Are These Your Symptoms?',
  subheading = 'Check the symptoms you\'re currently experiencing',
  symptoms = defaultSymptoms,
  conclusionHeadline = 'If you checked 3 or more, this article was written for YOU',
  conclusionText = "These symptoms aren't just \"part of getting older\" — they're signs of hormonal imbalance that can be addressed naturally. Keep reading to discover the simple protocol that has helped over 47,000 women reclaim their energy, lose stubborn weight, and feel like themselves again.",
  minSymptoms = 3,
  showCta = false,
  ctaText = 'See The Solution →',
  ctaUrl = '#',
  ctaType = 'external',
  anchorWidgetId
}: SymptomsCheckerProps) {
  // Compute the actual CTA URL based on type
  const computedCtaUrl = ctaType === 'anchor' && anchorWidgetId ? `#widget-${anchorWidgetId}` : ctaUrl;
  const [checkedSymptoms, setCheckedSymptoms] = useState<Set<number>>(new Set());

  const toggleSymptom = (index: number) => {
    const newChecked = new Set(checkedSymptoms);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedSymptoms(newChecked);
  };

  const checkedCount = checkedSymptoms.size;
  const showConclusion = checkedCount >= minSymptoms;

  // Get symptom text (support both text and label properties)
  const getSymptomText = (symptom: Symptom) => symptom.text || symptom.label || '';

  return (
    <div className="my-8">
      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-purple-500 text-white p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-6 h-6" />
            <h2 className="text-2xl font-bold">{headline}</h2>
          </div>
          <p className="text-primary-100">{subheading}</p>
        </div>

        {/* Symptoms Checklist - 2 Column Grid */}
        <div className="p-5">
          <div className="grid md:grid-cols-2 gap-3">
            {symptoms.map((symptom, index) => {
              const isChecked = checkedSymptoms.has(index);

              return (
                <button
                  key={index}
                  onClick={() => toggleSymptom(index)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                    isChecked
                      ? 'border-primary-400 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  {/* Checkbox */}
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
                    isChecked
                      ? 'bg-primary-500 border-primary-500'
                      : 'border-2 border-gray-300 bg-white'
                  }`}>
                    {isChecked && <Check className="w-4 h-4 text-white" />}
                  </div>

                  {/* Symptom Text */}
                  <span className={`text-base leading-snug ${isChecked ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                    {getSymptomText(symptom)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Counter */}
          <div className="mt-5 text-center">
            <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full ${
              checkedCount >= minSymptoms
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600'
            }`}>
              <span className="font-bold text-lg">{checkedCount}</span>
              <span>of {symptoms.length} selected</span>
            </div>
          </div>
        </div>

        {/* Conclusion Section - Shows when enough symptoms are checked */}
        {showConclusion && (
          <div className="border-t border-gray-200 bg-gradient-to-br from-primary-50 to-purple-50 p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{conclusionHeadline}</h3>
                <p className="text-gray-700 leading-relaxed">{conclusionText}</p>
                {showCta && (
                  <TrackedLink
                    href={computedCtaUrl}
                    widgetType="symptoms-checker"
                    widgetName={headline}
                    className="inline-block mt-4 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-center"
                  >
                    {ctaText}
                  </TrackedLink>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Encouragement when not enough selected */}
        {!showConclusion && checkedCount > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 p-4 text-center text-gray-600">
            Select {minSymptoms - checkedCount} more to see if this article is for you...
          </div>
        )}
      </div>
    </div>
  );
}
