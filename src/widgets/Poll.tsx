'use client';

import { useState } from 'react';
import { CheckCircle, Users } from 'lucide-react';

interface PollOption {
  id: string;
  label: string;
  votes: number;
  percentage?: number;
}

interface PollProps {
  question: string;
  options: PollOption[];
  totalVotes: number;
  showResults?: boolean;
  resultsMessage?: string;
  source?: string;
  style?: 'default' | 'highlighted' | 'results-only';
}

export default function Poll({
  question,
  options,
  totalVotes,
  showResults = false,
  resultsMessage,
  source,
  style = 'default',
}: PollProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(showResults || style === 'results-only');

  const handleVote = (optionId: string) => {
    if (hasVoted) return;
    setSelectedOption(optionId);
    setHasVoted(true);
  };

  const getPercentage = (option: PollOption) => {
    if (option.percentage !== undefined) return option.percentage;
    return Math.round((option.votes / totalVotes) * 100);
  };

  const isResultsOnly = style === 'results-only';
  const isHighlighted = style === 'highlighted';

  return (
    <div className={`rounded-2xl overflow-hidden ${
      isHighlighted
        ? 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border-2 border-purple-200'
        : 'bg-white border border-gray-200 shadow-lg'
    }`}>
      <div className="p-6 md:p-8">
        {/* Question */}
        <div className="flex items-start gap-3 mb-6">
          <div className={`p-2 rounded-full ${isHighlighted ? 'bg-purple-100' : 'bg-gray-100'}`}>
            <Users className={`w-5 h-5 ${isHighlighted ? 'text-purple-600' : 'text-gray-600'}`} />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900">{question}</h3>
            {!hasVoted && !isResultsOnly && (
              <p className="text-sm text-gray-500 mt-1">Click to vote and see results</p>
            )}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {options.map((option) => {
            const percentage = getPercentage(option);
            const isSelected = selectedOption === option.id;

            return (
              <button
                key={option.id}
                onClick={() => handleVote(option.id)}
                disabled={hasVoted}
                className={`w-full text-left relative overflow-hidden rounded-xl transition-all ${
                  hasVoted
                    ? 'cursor-default'
                    : 'cursor-pointer hover:shadow-md hover:scale-[1.01]'
                } ${
                  isSelected
                    ? 'ring-2 ring-purple-500 bg-purple-50'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {/* Progress bar background */}
                {hasVoted && (
                  <div
                    className={`absolute inset-y-0 left-0 transition-all duration-700 ease-out ${
                      isSelected ? 'bg-purple-200' : 'bg-gray-200'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                )}

                {/* Content */}
                <div className="relative p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {hasVoted && isSelected && (
                      <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    )}
                    <span className={`font-medium ${isSelected ? 'text-purple-900' : 'text-gray-800'}`}>
                      {option.label}
                    </span>
                  </div>
                  {hasVoted && (
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${isSelected ? 'text-purple-700' : 'text-gray-700'}`}>
                        {percentage}%
                      </span>
                      <span className="text-sm text-gray-500">
                        ({option.votes.toLocaleString()})
                      </span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Results message */}
        {hasVoted && resultsMessage && (
          <div className={`mt-6 p-4 rounded-xl ${
            isHighlighted ? 'bg-purple-100/50' : 'bg-amber-50'
          }`}>
            <p className={`text-sm font-medium ${
              isHighlighted ? 'text-purple-800' : 'text-amber-800'
            }`}>
              {resultsMessage}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>{totalVotes.toLocaleString()} total responses</span>
          {source && <span>{source}</span>}
        </div>
      </div>
    </div>
  );
}
