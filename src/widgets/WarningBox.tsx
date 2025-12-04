'use client';

import { AlertTriangle, AlertCircle, XCircle, Info } from 'lucide-react';

interface Warning {
  text: string;
  severity?: 'low' | 'medium' | 'high';
}

interface WarningBoxProps {
  headline: string;
  content?: string;
  warnings: Warning[];
  footer?: string;
  style?: 'default' | 'urgent' | 'info';
}

export default function WarningBox({
  headline,
  content,
  warnings,
  footer,
  style = 'default',
}: WarningBoxProps) {
  const getSeverityStyles = (severity: string = 'medium') => {
    switch (severity) {
      case 'high':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: <XCircle className="w-4 h-4 text-red-500" />,
          text: 'text-red-800',
        };
      case 'low':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          icon: <Info className="w-4 h-4 text-amber-500" />,
          text: 'text-amber-800',
        };
      default:
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          icon: <AlertCircle className="w-4 h-4 text-orange-500" />,
          text: 'text-orange-800',
        };
    }
  };

  const containerStyles = {
    default: 'bg-amber-50 border-amber-300',
    urgent: 'bg-gradient-to-br from-red-50 to-orange-50 border-red-300',
    info: 'bg-blue-50 border-blue-300',
  };

  const headerStyles = {
    default: 'text-amber-900',
    urgent: 'text-red-900',
    info: 'text-blue-900',
  };

  const iconStyles = {
    default: 'bg-amber-100 text-amber-600',
    urgent: 'bg-red-100 text-red-600',
    info: 'bg-blue-100 text-blue-600',
  };

  return (
    <div className={`rounded-2xl border-2 ${containerStyles[style]} overflow-hidden`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-inherit">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${iconStyles[style]}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${headerStyles[style]}`}>{headline}</h3>
            {content && <p className="text-sm text-gray-600 mt-0.5">{content}</p>}
          </div>
        </div>
      </div>

      {/* Warnings List */}
      <div className="p-6">
        <div className="space-y-3">
          {warnings.map((warning, idx) => {
            const styles = getSeverityStyles(warning.severity);
            return (
              <div
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-xl ${styles.bg} border ${styles.border}`}
              >
                <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>
                <p className={`text-sm font-medium ${styles.text}`}>{warning.text}</p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {footer && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-700 font-medium flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              {footer}
            </p>
          </div>
        )}
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
