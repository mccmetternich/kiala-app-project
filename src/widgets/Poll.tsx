'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Users, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import TrackedLink from '@/components/TrackedLink';

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
  /** @deprecated Use style='results-only' instead. This prop is ignored. */
  showResults?: boolean;
  resultsMessage?: string;
  source?: string;
  style?: 'default' | 'highlighted' | 'results-only';
  // CTA options
  ctaText?: string;
  ctaUrl?: string;
  showCta?: boolean;
  ctaType?: 'external' | 'anchor';
  target?: '_self' | '_blank';
  // Poll ID for localStorage persistence (optional)
  pollId?: string;
}

export default function Poll({
  question,
  options,
  totalVotes,
  showResults = false,
  resultsMessage,
  source,
  style = 'default',
  ctaText,
  ctaUrl,
  showCta = false,
  ctaType = 'external',
  target = '_self',
  pollId,
}: PollProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  // Only show results immediately if style is explicitly 'results-only'
  // The 'showResults' prop is IGNORED - use style='results-only' to show results immediately
  // Regular polls (default, highlighted) ALWAYS start with voting options visible
  const isResultsOnlyStyle = style === 'results-only';
  const [hasVoted, setHasVoted] = useState(isResultsOnlyStyle);
  const [isClient, setIsClient] = useState(false);

  // Check localStorage on client mount to see if user already voted
  // This only runs on the client after hydration
  useEffect(() => {
    setIsClient(true);
    // Only check localStorage for non-results-only polls
    if (!isResultsOnlyStyle && pollId) {
      try {
        const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '{}');
        if (votedPolls[pollId]) {
          setSelectedOption(votedPolls[pollId]);
          setHasVoted(true);
        }
      } catch (e) {
        // localStorage might be unavailable or corrupted
        console.warn('Could not read poll state from localStorage');
      }
    }
  }, [pollId, isResultsOnlyStyle]);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const handleVote = (optionId: string) => {
    if (hasVoted) return;
    setSelectedOption(optionId);
    setHasVoted(true);

    // Save to localStorage if pollId is provided
    if (pollId) {
      const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '{}');
      votedPolls[pollId] = optionId;
      localStorage.setItem('votedPolls', JSON.stringify(votedPolls));
    }
  };

  const getPercentage = (option: PollOption) => {
    if (option.percentage !== undefined) return option.percentage;
    return Math.round((option.votes / totalVotes) * 100);
  };

  // Find the winning option
  const winningOption = options.reduce((prev, current) =>
    (getPercentage(current) > getPercentage(prev)) ? current : prev
  );

  // Process resultsMessage with dynamic variables
  const processedResultsMessage = resultsMessage?.replace(
    /\{winner_percentage\}/g,
    String(getPercentage(winningOption))
  ).replace(
    /\{winner_label\}/g,
    winningOption.label
  ).replace(
    /\{total_votes\}/g,
    totalVotes.toLocaleString()
  );

  const isHighlighted = style === 'highlighted';

  return (
    <div className="my-8">
      {/* Header */}
      <div className={`rounded-t-2xl px-6 py-5 ${
        isHighlighted
          ? 'bg-gradient-to-r from-accent-500 via-accent-600 to-primary-500'
          : 'bg-gradient-to-r from-primary-500 to-accent-500'
      }`}>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl md:text-2xl font-bold text-white">{question}</h3>
            {!hasVoted && !isResultsOnlyStyle && (
              <p className="text-white/80 mt-1">Tap to vote and see how others answered</p>
            )}
            {hasVoted && (
              <p className="text-white/80 mt-1 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {totalVotes.toLocaleString()} people have voted
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className={`rounded-b-2xl bg-white border-2 border-t-0 shadow-xl overflow-hidden ${
        isHighlighted ? 'border-accent-200' : 'border-primary-200'
      }`}>
        <div className="p-6">
          {/* Options */}
          <div className="space-y-3">
            {options.map((option) => {
              const percentage = getPercentage(option);
              const isSelected = selectedOption === option.id;
              const isWinner = hasVoted && option.id === winningOption.id;
              const isHovered = hoveredOption === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => handleVote(option.id)}
                  onMouseEnter={() => setHoveredOption(option.id)}
                  onMouseLeave={() => setHoveredOption(null)}
                  disabled={hasVoted}
                  className={`w-full text-left relative overflow-hidden rounded-xl transition-shadow duration-300 ${
                    hasVoted
                      ? 'cursor-default'
                      : 'cursor-pointer hover:shadow-lg'
                  } ${
                    isSelected
                      ? 'ring-2 ring-primary-500 shadow-lg'
                      : isWinner
                        ? 'ring-2 ring-accent-400'
                        : ''
                  } ${
                    isHovered && !hasVoted
                      ? 'bg-primary-50 border-2 border-primary-200'
                      : 'bg-gray-50 border-2 border-gray-100'
                  }`}
                >
                  {/* Progress bar background */}
                  {hasVoted && (
                    <div
                      className={`absolute inset-y-0 left-0 transition-all duration-700 ease-out ${
                        isSelected
                          ? 'bg-gradient-to-r from-primary-200 to-accent-200'
                          : isWinner
                            ? 'bg-gradient-to-r from-accent-100 to-accent-200'
                            : 'bg-gray-100'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  )}

                  {/* Content */}
                  <div className="relative p-4 md:p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {hasVoted && isSelected && (
                        <div className="p-1 bg-primary-500 rounded-full">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                      )}
                      {hasVoted && isWinner && !isSelected && (
                        <div className="p-1 bg-accent-500 rounded-full">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <span className={`font-semibold text-base md:text-lg ${
                        isSelected ? 'text-primary-900' :
                        isWinner ? 'text-accent-900' :
                        'text-gray-800'
                      }`}>
                        {option.label}
                      </span>
                      {isWinner && hasVoted && (
                        <span className="px-2 py-0.5 bg-accent-100 text-accent-700 text-xs font-bold rounded-full uppercase">
                          Most Common
                        </span>
                      )}
                    </div>
                    {hasVoted && (
                      <div className="flex items-center gap-3">
                        <span className={`text-xl font-bold ${
                          isSelected ? 'text-primary-700' :
                          isWinner ? 'text-accent-700' :
                          'text-gray-700'
                        }`}>
                          {percentage}%
                        </span>
                        <span className="text-sm text-gray-500 hidden md:inline">
                          ({option.votes.toLocaleString()})
                        </span>
                      </div>
                    )}
                    {!hasVoted && (
                      <ArrowRight className={`w-5 h-5 transition-all duration-300 ${
                        isHovered ? 'text-primary-500 translate-x-1' : 'text-gray-400'
                      }`} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Results message */}
          {hasVoted && processedResultsMessage && (
            <div className={`mt-6 p-5 rounded-xl border-2 ${
              isHighlighted
                ? 'bg-gradient-to-r from-accent-50 to-primary-50 border-accent-200'
                : 'bg-gradient-to-r from-primary-50 to-accent-50 border-primary-200'
            }`}>
              <div className="flex items-start gap-3">
                <Sparkles className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  isHighlighted ? 'text-accent-500' : 'text-primary-500'
                }`} />
                <p className={`text-base font-medium ${
                  isHighlighted ? 'text-accent-800' : 'text-primary-800'
                }`}>
                  {processedResultsMessage}
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-5 flex items-center justify-between text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {totalVotes.toLocaleString()} total responses
            </span>
            {source && <span className="text-gray-400">{source}</span>}
          </div>

          {/* CTA - Only shown after voting (isClient check ensures proper hydration) */}
          {isClient && hasVoted && showCta && ctaText && ctaUrl && (
            <TrackedLink
              href={ctaUrl}
              target={target}
              widgetType="poll"
              widgetId={pollId}
              widgetName={question}
              className="mt-6 w-full flex items-center justify-center gap-2 font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 bg-gradient-to-r from-primary-500 via-accent-500 to-accent-600 hover:from-primary-600 hover:via-accent-600 hover:to-accent-700 text-white"
            >
              {ctaText}
              <ArrowRight className="w-5 h-5" />
            </TrackedLink>
          )}
        </div>
      </div>
    </div>
  );
}
