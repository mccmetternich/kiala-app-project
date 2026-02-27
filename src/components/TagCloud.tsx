'use client';

import { useState, useMemo } from 'react';
import { Hash, TrendingUp } from 'lucide-react';

interface TagCloudProps {
  articles: any[];
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

export default function TagCloud({ articles, selectedTag, onTagSelect }: TagCloudProps) {
  // Extract and count tags from articles
  const tagStats = useMemo(() => {
    const tagCount: Record<string, number> = {};
    
    articles.forEach(article => {
      if (article.category) {
        const tag = article.category.trim();
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      }
    });
    
    // Convert to array and sort by count
    return Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [articles]);

  const maxCount = Math.max(...tagStats.map(t => t.count));

  // Calculate tag size based on frequency
  const getTagSize = (count: number) => {
    const ratio = count / maxCount;
    if (ratio > 0.8) return 'text-lg font-semibold';
    if (ratio > 0.6) return 'text-base font-medium';
    if (ratio > 0.4) return 'text-sm font-medium';
    return 'text-sm font-normal';
  };

  const getTagOpacity = (count: number) => {
    const ratio = count / maxCount;
    if (ratio > 0.8) return 'opacity-100';
    if (ratio > 0.6) return 'opacity-90';
    if (ratio > 0.4) return 'opacity-80';
    return 'opacity-70';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300 sticky top-6">
      <div className="flex items-center gap-2 mb-6">
        <Hash className="w-5 h-5 text-gray-600" />
        <h3 className="goop-heading text-lg font-semibold text-gray-900">Explore Topics</h3>
      </div>

      {/* All Articles Button */}
      <button
        onClick={() => onTagSelect(null)}
        className={`w-full text-left px-3 py-2 rounded-lg mb-4 transition-all duration-200 ${
          selectedTag === null
            ? 'bg-primary-100 text-primary-900 border border-primary-200'
            : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="font-medium">All Articles</span>
          <span className="text-sm text-gray-500">{articles.length}</span>
        </div>
      </button>

      {/* Tag Cloud */}
      <div className="space-y-2">
        {tagStats.map(({ tag, count }) => (
          <button
            key={tag}
            onClick={() => onTagSelect(selectedTag === tag ? null : tag)}
            className={`block w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
              selectedTag === tag
                ? 'bg-accent-100 text-accent-900 border border-accent-200 shadow-sm'
                : 'hover:bg-gray-50 text-gray-700 border border-transparent hover:border-gray-200'
            } ${getTagSize(count)} ${getTagOpacity(count)}`}
          >
            <div className="flex items-center justify-between">
              <span className="leading-tight">{tag}</span>
              <div className="flex items-center gap-1">
                {count > maxCount * 0.8 && <TrendingUp className="w-3 h-3 text-accent-600" />}
                <span className="text-xs text-gray-500">{count}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Popular Topics Label */}
      {tagStats.length > 5 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">
            Most Popular
          </div>
          <div className="flex flex-wrap gap-2">
            {tagStats.slice(0, 3).map(({ tag }) => (
              <button
                key={tag}
                onClick={() => onTagSelect(tag)}
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedTag === tag
                    ? 'bg-accent-200 text-accent-900'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}