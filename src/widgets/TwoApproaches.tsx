'use client';

import { XCircle, CheckCircle, TrendingDown, Sparkles } from 'lucide-react';

interface ApproachItem {
  text: string;
  icon?: string;
  positive?: boolean;
  negative?: boolean;
}

interface ApproachColumn {
  header: string;
  subheader?: string;
  items: ApproachItem[];
  result?: string;
}

interface TwoApproachesProps {
  headline?: string;
  leftColumn?: ApproachColumn;
  rightColumn?: ApproachColumn;
  style?: 'default' | 'contrast' | 'gradient';
}

export default function TwoApproaches({
  headline = "Two Paths Forward",
  leftColumn = {
    header: "The Old Way",
    subheader: "What hasn't worked",
    items: [
      { text: "Approach 1", negative: true },
      { text: "Approach 2", negative: true },
    ],
    result: "Result: Failure"
  },
  rightColumn = {
    header: "The New Way",
    subheader: "What actually works",
    items: [
      { text: "Approach 1", positive: true },
      { text: "Approach 2", positive: true },
    ],
    result: "Result: Success"
  },
  style = 'contrast'
}: TwoApproachesProps) {

  return (
    <div className="my-12">
      {headline && (
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">{headline}</h2>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column - The "Wrong" Way */}
        <div className={`rounded-2xl overflow-hidden border-2 ${
          style === 'contrast'
            ? 'border-primary-200 bg-gradient-to-b from-primary-50 to-white'
            : style === 'gradient'
              ? 'border-gray-200 bg-gradient-to-b from-gray-100 to-white'
              : 'border-gray-200 bg-white'
        }`}>
          {/* Header */}
          <div className={`px-6 py-5 ${
            style === 'contrast'
              ? 'bg-gradient-to-r from-primary-100 to-primary-50 border-b border-primary-200'
              : 'bg-gray-100 border-b border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                style === 'contrast' ? 'bg-red-200' : 'bg-gray-300'
              }`}>
                <TrendingDown className={`w-5 h-5 ${
                  style === 'contrast' ? 'text-primary-600' : 'text-gray-600'
                }`} />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${
                  style === 'contrast' ? 'text-red-900' : 'text-gray-900'
                }`}>{leftColumn.header}</h3>
                {leftColumn.subheader && (
                  <p className={`text-sm ${
                    style === 'contrast' ? 'text-primary-700' : 'text-gray-600'
                  }`}>{leftColumn.subheader}</p>
                )}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="p-6 space-y-4">
            {leftColumn.items.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className={`flex-shrink-0 p-1 rounded-full ${
                  item.negative
                    ? 'bg-red-100'
                    : 'bg-gray-100'
                }`}>
                  <XCircle className={`w-5 h-5 ${
                    item.negative ? 'text-primary-500' : 'text-gray-400'
                  }`} />
                </div>
                <span className={`text-gray-700 ${item.negative ? 'line-through opacity-75' : ''}`}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>

          {/* Result Footer */}
          {leftColumn.result && (
            <div className={`px-6 py-4 border-t ${
              style === 'contrast'
                ? 'bg-red-100/50 border-red-200'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <p className={`text-center font-semibold ${
                style === 'contrast' ? 'text-primary-700' : 'text-gray-600'
              }`}>
                {leftColumn.result}
              </p>
            </div>
          )}
        </div>

        {/* Right Column - The "Right" Way */}
        <div className={`rounded-2xl overflow-hidden border-2 shadow-lg ${
          style === 'contrast'
            ? 'border-accent-300 bg-gradient-to-b from-accent-50 to-white'
            : style === 'gradient'
              ? 'border-primary-200 bg-gradient-to-b from-primary-50 to-white'
              : 'border-primary-200 bg-white'
        }`}>
          {/* Header */}
          <div className={`px-6 py-5 ${
            style === 'contrast'
              ? 'bg-gradient-to-r from-accent-500 to-accent-600 text-white'
              : 'bg-gradient-to-r from-primary-500 to-accent-500 text-white'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-white/20 backdrop-blur">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{rightColumn.header}</h3>
                {rightColumn.subheader && (
                  <p className="text-sm opacity-90">{rightColumn.subheader}</p>
                )}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="p-6 space-y-4">
            {rightColumn.items.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className={`flex-shrink-0 p-1 rounded-full ${
                  item.positive
                    ? style === 'contrast'
                      ? 'bg-accent-100'
                      : 'bg-primary-100'
                    : 'bg-gray-100'
                }`}>
                  <CheckCircle className={`w-5 h-5 ${
                    item.positive
                      ? style === 'contrast'
                        ? 'text-accent-600'
                        : 'text-primary-600'
                      : 'text-gray-400'
                  }`} />
                </div>
                <span className={`font-medium ${
                  item.positive
                    ? style === 'contrast'
                      ? 'text-accent-900'
                      : 'text-primary-900'
                    : 'text-gray-700'
                }`}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>

          {/* Result Footer */}
          {rightColumn.result && (
            <div className={`px-6 py-4 border-t ${
              style === 'contrast'
                ? 'bg-gradient-to-r from-accent-100 to-accent-50 border-accent-200'
                : 'bg-gradient-to-r from-primary-100 to-accent-100 border-primary-200'
            }`}>
              <p className={`text-center font-bold ${
                style === 'contrast' ? 'text-accent-700' : 'text-primary-700'
              }`}>
                {rightColumn.result}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
