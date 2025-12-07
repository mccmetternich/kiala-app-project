'use client';

import { useState, useEffect } from 'react';
import { Check, Circle, ArrowRight, ClipboardList, AlertTriangle, Sparkles, Heart } from 'lucide-react';
import TrackedLink from '@/components/TrackedLink';

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
  // Alert config
  alertThreshold?: number;
  alertHeadline?: string;
  alertMessage?: string;
  // CTA options
  ctaText?: string;
  ctaUrl?: string;
  showCta?: boolean;
  ctaType?: 'external' | 'anchor';
  target?: '_self' | '_blank';
  style?: 'default' | 'interactive' | 'assessment';
}

export default function Checklist({
  headline,
  subheading,
  items,
  footer,
  alertThreshold = 3,
  alertHeadline = "⚠️ You've hit the threshold!",
  alertMessage = "With this many signs, it's time to take action. The good news? There's a solution.",
  ctaText,
  ctaUrl,
  showCta = false,
  ctaType = 'external',
  target = '_self',
  style = 'default',
}: ChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(
    new Set(items.filter(i => i.checked).map(i => i.id))
  );
  const [isShaking, setIsShaking] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

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
  const isOverThreshold = checkedCount >= alertThreshold;

  // Handle threshold crossing
  useEffect(() => {
    if (isOverThreshold && !showAlert) {
      setShowAlert(true);
      setIsShaking(true);
      // Stop shaking after animation
      const timer = setTimeout(() => setIsShaking(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isOverThreshold, showAlert]);

  // Trigger shake on every additional check after threshold
  useEffect(() => {
    if (isOverThreshold && checkedCount > alertThreshold) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 600);
      return () => clearTimeout(timer);
    }
  }, [checkedCount, alertThreshold, isOverThreshold]);

  // Progress bar color logic
  const getProgressColor = () => {
    const percentage = (checkedCount / alertThreshold) * 100;
    if (percentage >= 100) return 'from-red-500 to-rose-500';
    if (percentage >= 66) return 'from-orange-500 to-amber-500';
    return 'from-primary-500 to-purple-500';
  };

  return (
    <div className={`my-8 rounded-2xl overflow-hidden shadow-xl ${
      isAssessment
        ? 'border-2 border-rose-200'
        : 'border-2 border-primary-200'
    } ${isShaking ? 'animate-shake' : ''}`}>
      {/* Add shake keyframes via style tag */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}</style>

      {/* Header */}
      <div className={`px-6 py-5 ${
        isAssessment
          ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500'
          : 'bg-gradient-to-r from-primary-500 to-purple-500'
      }`}>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur">
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white">{headline}</h3>
            {subheading && <p className="text-white/80 mt-1">{subheading}</p>}
          </div>
        </div>

        {/* Progress indicator for interactive/assessment */}
        {(style === 'interactive' || style === 'assessment') && (
          <div className="mt-5">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-white/90 font-medium">
                {checkedCount} of {totalItems} selected
              </span>
              <span className={`font-bold px-3 py-1 rounded-full ${
                isOverThreshold
                  ? 'bg-red-100 text-red-700'
                  : 'bg-white/20 text-white'
              }`}>
                {Math.round((checkedCount / totalItems) * 100)}%
              </span>
            </div>
            <div className="h-3 bg-white/30 rounded-full overflow-hidden shadow-inner">
              <div
                className={`h-full transition-all duration-500 bg-gradient-to-r ${getProgressColor()}`}
                style={{ width: `${(checkedCount / totalItems) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="bg-white p-6">
        <ul className="space-y-3">
          {items.map((item) => {
            const isChecked = checkedItems.has(item.id);
            const isClickable = style === 'interactive' || style === 'assessment';

            return (
              <li key={item.id}>
                <button
                  onClick={() => toggleItem(item.id)}
                  disabled={!isClickable}
                  className={`w-full flex items-start gap-4 p-4 rounded-xl text-left transition-all duration-300 ${
                    isClickable ? 'cursor-pointer hover:shadow-md hover:scale-[1.01]' : 'cursor-default'
                  } ${isChecked
                    ? (isAssessment
                        ? 'bg-gradient-to-r from-rose-50 to-pink-50 border-2 border-rose-300 shadow-md'
                        : 'bg-gradient-to-r from-primary-50 to-purple-50 border-2 border-primary-300 shadow-md')
                    : 'bg-gray-50 border-2 border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    isChecked
                      ? (isAssessment
                          ? 'bg-gradient-to-r from-rose-500 to-pink-500 border-rose-500 shadow-lg'
                          : 'bg-gradient-to-r from-primary-500 to-purple-500 border-primary-500 shadow-lg')
                      : 'border-gray-300 bg-white'
                  }`}>
                    {isChecked ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <Circle className="w-3 h-3 text-gray-300" />
                    )}
                  </div>
                  <span className={`text-base leading-relaxed ${
                    isChecked ? 'text-gray-900 font-semibold' : 'text-gray-700'
                  }`}>
                    {item.text}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Footer message */}
        {footer && !showAlert && (
          <div className={`mt-6 p-4 rounded-xl border ${
            isAssessment
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-gray-50 border-gray-200 text-gray-700'
          }`}>
            <p className="text-sm font-medium">{footer}</p>
          </div>
        )}

        {/* Alert Box - appears when threshold is hit */}
        {showAlert && (
          <div className="mt-6 rounded-2xl overflow-hidden shadow-xl border-2 border-rose-300">
            <div className="bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-bold text-white">{alertHeadline}</h4>
              </div>
            </div>
            <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 p-6">
              <p className="text-lg text-gray-800 leading-relaxed mb-4 font-medium">
                {alertMessage}
              </p>
              <div className="flex items-center gap-2 text-rose-700 font-semibold">
                <Sparkles className="w-5 h-5" />
                <span>You've selected {checkedCount} of {totalItems} signs.</span>
              </div>

              {/* CTA in alert */}
              {showCta && ctaText && ctaUrl && (
                <TrackedLink
                  href={ctaUrl}
                  target={target}
                  widgetType="checklist"
                  widgetName={headline}
                  className="mt-5 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Heart className="w-5 h-5" />
                  {ctaText}
                  <ArrowRight className="w-5 h-5" />
                </TrackedLink>
              )}
            </div>
          </div>
        )}

        {/* CTA - shown when not in alert state */}
        {!showAlert && showCta && ctaText && ctaUrl && (
          <TrackedLink
            href={ctaUrl}
            target={target}
            widgetType="checklist"
            widgetName={headline}
            className={`mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
              isAssessment
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white'
                : 'bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white'
            }`}
          >
            {ctaText}
            <ArrowRight className="w-5 h-5" />
          </TrackedLink>
        )}
      </div>
    </div>
  );
}
