'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, XCircle, Info, ChevronDown, ArrowRight, Sparkles } from 'lucide-react';
import { useTracking } from '@/contexts/TrackingContext';

interface Warning {
  text: string;
  severity?: 'low' | 'medium' | 'high';
}

interface WarningBoxProps {
  headline: string;
  content?: string;
  warnings: Warning[];
  footer?: string;
  style?: 'default' | 'urgent' | 'info' | 'cascade';
  // CTA options
  ctaText?: string;
  ctaUrl?: string;
  showCta?: boolean;
}

export default function WarningBox({
  headline,
  content,
  warnings,
  footer,
  style = 'default',
  ctaText,
  ctaUrl,
  showCta = false,
}: WarningBoxProps) {
  const { appendTracking } = useTracking();
  const trackedCtaUrl = ctaUrl ? appendTracking(ctaUrl) : '#';
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getSeverityStyles = (severity: string = 'medium', isHovered: boolean) => {
    const baseStyles = {
      high: {
        bg: isHovered ? 'bg-gradient-to-r from-red-100 to-rose-100' : 'bg-gradient-to-r from-red-50 to-rose-50',
        border: 'border-red-300',
        icon: <XCircle className="w-5 h-5 text-red-600" />,
        text: 'text-red-900',
        pulse: '',
      },
      medium: {
        bg: isHovered ? 'bg-gradient-to-r from-rose-100 to-pink-100' : 'bg-gradient-to-r from-rose-50 to-pink-50',
        border: 'border-rose-300',
        icon: <AlertCircle className="w-5 h-5 text-rose-600" />,
        text: 'text-rose-900',
        pulse: '',
      },
      low: {
        bg: isHovered ? 'bg-gradient-to-r from-pink-100 to-purple-100' : 'bg-gradient-to-r from-pink-50 to-purple-50',
        border: 'border-pink-300',
        icon: <Info className="w-5 h-5 text-pink-600" />,
        text: 'text-pink-900',
        pulse: '',
      },
    };
    return baseStyles[severity as keyof typeof baseStyles] || baseStyles.medium;
  };

  // Cascade/Pyramid style - builds visually with impact
  if (style === 'cascade') {
    return (
      <div className="my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 rounded-t-2xl px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur animate-pulse">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{headline}</h3>
                {content && <p className="text-rose-100 mt-1">{content}</p>}
              </div>
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronDown className={`w-5 h-5 text-white transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Pyramid cascade of warnings */}
        <div className={`bg-white shadow-xl border-2 border-t-0 border-rose-200 rounded-b-2xl overflow-hidden transition-all duration-500 ${expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-4 md:p-6">
            {/* Pyramid layout - full width on mobile, progressive on desktop */}
            <div className="space-y-3">
              {warnings.map((warning, idx) => {
                const isHovered = hoveredIndex === idx;
                const styles = getSeverityStyles(warning.severity, isHovered);
                // Calculate progressive width for pyramid effect (desktop only)
                const minWidth = 70; // Start at 70%
                const widthStep = (100 - minWidth) / Math.max(warnings.length - 1, 1);
                const width = minWidth + (widthStep * idx);

                return (
                  <div
                    key={idx}
                    className="flex justify-start"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      className={`
                        relative p-4 rounded-xl border-2
                        ${styles.bg} ${styles.border}
                        transition-all duration-300 ease-out cursor-pointer
                        ${isHovered ? 'shadow-xl scale-[1.02] z-10' : 'shadow-md'}
                        ${styles.pulse}
                        w-full md:w-auto
                      `}
                      style={{ width: isMobile ? '100%' : `${width}%` }}
                    >
                      {/* Connecting arrow to next item */}
                      {idx < warnings.length - 1 && (
                        <div className="absolute left-6 md:left-8 -bottom-3 transform flex flex-col items-center z-20">
                          <div className="w-0.5 h-3 bg-gradient-to-b from-gray-400 to-gray-300" />
                          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-300" />
                        </div>
                      )}

                      <div className="flex items-start gap-3 md:gap-4">
                        {/* Level indicator - on the left */}
                        <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-base font-bold ${
                          warning.severity === 'high' ? 'bg-red-200 text-red-800' :
                          warning.severity === 'low' ? 'bg-pink-200 text-pink-800' :
                          'bg-rose-200 text-rose-800'
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm md:text-base lg:text-lg leading-relaxed ${styles.text} transition-all duration-300`}>
                            {warning.text}
                          </p>
                          {isHovered && warning.severity === 'high' && (
                            <p className="text-xs md:text-sm text-red-700 mt-2 font-medium animate-fade-in">
                              ⚠️ Critical warning - requires immediate attention
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Alert footer when cascade builds */}
            {footer && (
              <div className="mt-8 bg-gradient-to-r from-rose-100 via-red-100 to-orange-100 rounded-xl p-5 border-2 border-rose-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-500 rounded-full">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-lg font-bold text-rose-900">{footer}</p>
                </div>
              </div>
            )}

            {/* CTA */}
            {showCta && ctaText && ctaUrl && (
              <div className="mt-6">
                <a
                  href={trackedCtaUrl}
                  className="block w-full text-center bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <span className="flex items-center justify-center gap-2">
                    {ctaText}
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Container styles for other variants
  const containerStyles = {
    default: 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-300',
    urgent: 'bg-gradient-to-br from-red-50 via-rose-50 to-orange-50 border-red-300',
    info: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300',
  };

  const headerStyles = {
    default: 'from-rose-500 to-pink-500',
    urgent: 'from-red-500 to-rose-500',
    info: 'from-blue-500 to-indigo-500',
  };

  const headerTextStyles = {
    default: 'text-rose-900',
    urgent: 'text-red-900',
    info: 'text-blue-900',
  };

  const iconBgStyles = {
    default: 'bg-rose-100 text-rose-600',
    urgent: 'bg-red-100 text-red-600',
    info: 'bg-blue-100 text-blue-600',
  };

  // Default/Urgent/Info styles - enhanced
  return (
    <div className="my-8">
      <div className={`rounded-2xl border-2 shadow-xl overflow-hidden ${containerStyles[style]}`}>
        {/* Header */}
        <div className={`bg-gradient-to-r ${headerStyles[style]} px-6 py-5`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{headline}</h3>
              {content && <p className="text-white/80 text-sm mt-0.5">{content}</p>}
            </div>
          </div>
        </div>

        {/* Warnings List */}
        <div className="p-6">
          <div className="space-y-3">
            {warnings.map((warning, idx) => {
              const isHovered = hoveredIndex === idx;
              const styles = getSeverityStyles(warning.severity, isHovered);
              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`
                    flex items-start gap-4 p-4 rounded-xl border-2
                    ${styles.bg} ${styles.border}
                    transition-all duration-300
                    ${isHovered ? 'shadow-lg scale-[1.01]' : 'shadow-sm'}
                    cursor-pointer
                  `}
                >
                  <div className={`flex-shrink-0 p-1.5 rounded-full transition-all duration-300 ${isHovered ? 'bg-white shadow-md' : 'bg-white/70'}`}>
                    {styles.icon}
                  </div>
                  <p className={`text-base font-medium leading-relaxed ${styles.text}`}>{warning.text}</p>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          {footer && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                <div className="p-1.5 bg-emerald-100 rounded-full">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-base font-semibold text-emerald-800">{footer}</p>
              </div>
            </div>
          )}

          {/* CTA */}
          {showCta && ctaText && ctaUrl && (
            <div className="mt-6">
              <a
                href={trackedCtaUrl}
                className={`block w-full text-center bg-gradient-to-r ${headerStyles[style]} hover:opacity-90 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
              >
                <span className="flex items-center justify-center gap-2">
                  {ctaText}
                  <ArrowRight className="w-5 h-5" />
                </span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
