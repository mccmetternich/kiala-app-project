'use client';

import { Users, TrendingUp, Heart, Star, Sparkles } from 'lucide-react';

// Unique women's faces for the community display
const COMMUNITY_AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=40&h=40&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face',
];

export default function SocialValidationTile() {
  return (
    <div className="bg-gradient-to-r from-primary-50 via-white to-secondary-50 rounded-xl p-5 border border-primary-100 shadow-md">
      <div className="flex flex-col md:flex-row items-center gap-5">
        {/* Left - Avatar stack */}
        <div className="flex -space-x-2 flex-shrink-0">
          {COMMUNITY_AVATARS.map((avatar, index) => (
            <img
              key={index}
              src={avatar}
              alt=""
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
              style={{ zIndex: COMMUNITY_AVATARS.length - index }}
            />
          ))}
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-bold">
            47k+
          </div>
        </div>

        {/* Center - Main content */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-secondary-600" />
            <span className="text-xs font-bold text-secondary-700 uppercase tracking-wide">
              Fastest Growing Community
            </span>
          </div>
          <p className="text-gray-800 font-semibold">
            Join 47,000+ women over 40 finding health solutions that work
          </p>
        </div>

        {/* Right - Stats */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-center">
            <div className="flex items-center justify-center gap-0.5 mb-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-3.5 h-3.5 fill-current text-accent-400" />
              ))}
            </div>
            <span className="text-xs text-gray-600">4.9/5 rating</span>
          </div>

          <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

          <div className="text-center hidden md:block">
            <div className="flex items-center gap-1 text-green-600">
              <Sparkles className="w-4 h-4" />
              <span className="font-bold">+127</span>
            </div>
            <span className="text-xs text-gray-600">joined today</span>
          </div>
        </div>
      </div>
    </div>
  );
}
