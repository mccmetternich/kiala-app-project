'use client';

import { Heart, Eye, Clock, MessageCircle, TrendingUp } from 'lucide-react';
import TrackedLink from '@/components/TrackedLink';

interface HeroStoryProps {
  title?: string;
  subtitle?: string;
  story?: string;
  image?: string;
  ctaText?: string;
  ctaLink?: string;
  author?: string;
  authorImage?: string;
  likes?: number;
  views?: number;
  readTime?: number;
  comments?: number;
  category?: string;
  isTrending?: boolean;
  config?: {
    headline?: string;
    subheading?: string;
    image?: string;
    buttonText?: string;
    buttonUrl?: string;
    rating?: string;
    views?: number;
    readTime?: number;
    author?: string;
    authorImage?: string;
  };
}

export default function HeroStory({
  title,
  subtitle,
  story,
  image,
  ctaText = 'Read Full Article',
  ctaLink = '#',
  author = 'Health Authority',
  authorImage,
  likes = 1247,
  views = 8934,
  readTime = 5,
  comments = 89,
  category = 'Featured',
  isTrending = true,
  config
}: HeroStoryProps) {
  // Use config props if provided (from homepage)
  const displayTitle = config?.headline || title || 'Transform Your Health Today';
  const displaySubtitle = config?.subheading || subtitle || 'Join thousands who have already changed their lives';
  const displayImage = config?.image || image;
  const displayCtaText = config?.buttonText || ctaText;
  const displayCtaLink = config?.buttonUrl || ctaLink;
  const displayViews = config?.views || views;
  const displayReadTime = config?.readTime || readTime;
  const displayAuthor = config?.author || author;
  const displayAuthorImage = config?.authorImage || authorImage;

  return (
    <TrackedLink href={displayCtaLink} widgetType="hero-story" widgetName={displayTitle} className="block relative bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 cursor-pointer group">
      <div className="grid md:grid-cols-2 gap-0">
        {/* Image Side */}
        {displayImage && (
          <div className="relative h-64 md:h-auto overflow-hidden">
            <img
              src={displayImage}
              alt={displayTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {isTrending && (
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                  <TrendingUp className="w-3 h-3" />
                  TRENDING
                </span>
              )}
              <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                {category}
              </span>
            </div>
            {/* Engagement overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm">
                  <Heart className="w-4 h-4 text-red-500 fill-current" />
                  <span className="font-medium text-gray-800">{likes.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm">
                  <MessageCircle className="w-4 h-4 text-primary-500" />
                  <span className="font-medium text-gray-800">{comments}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Side */}
        <div className="p-8 flex flex-col justify-center">
          {/* Author */}
          <div className="flex items-center gap-3 mb-4">
            <img
              src={displayAuthorImage}
              alt={displayAuthor}
              className="w-10 h-10 rounded-full border-2 border-primary-200"
            />
            <div>
              <p className="font-semibold text-gray-900">{displayAuthor}</p>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {displayViews.toLocaleString()} views
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {displayReadTime} min read
                </span>
              </div>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight hover:text-primary-600 transition-colors">
            {displayTitle}
          </h1>

          <p className="text-gray-600 mb-6 line-clamp-3">
            {displaySubtitle}
          </p>

          {story && (
            <p className="text-gray-500 text-sm mb-6 line-clamp-2">
              {story}
            </p>
          )}

          <span
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 group-hover:from-primary-600 group-hover:to-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform group-hover:scale-105 shadow-md group-hover:shadow-lg w-fit text-center"
          >
            {displayCtaText}
          </span>
        </div>
      </div>
    </TrackedLink>
  );
}
