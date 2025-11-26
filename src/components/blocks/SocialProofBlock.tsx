'use client';

import { SocialProofBlock as SocialProofBlockType } from '@/types/blocks';

interface SocialProofBlockProps {
  block: SocialProofBlockType;
}

// Default women's face avatars
const defaultAvatars = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop&crop=face'
];

export default function SocialProofBlock({ block }: SocialProofBlockProps) {
  const { settings } = block;

  // Use default avatars if none provided
  const avatars = settings.avatars?.length ? settings.avatars : defaultAvatars;

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (settings.layout === 'inline') {
    return (
      <div className="flex items-center justify-center gap-4 py-4">
        {settings.showAvatars && (
          <div className="flex -space-x-2">
            {avatars.slice(0, 4).map((avatar, index) => (
              <img
                key={index}
                src={avatar}
                alt="Community member"
                className="w-8 h-8 rounded-full border-2 border-white object-cover"
              />
            ))}
          </div>
        )}
        <div className="text-center">
          <div className="font-bold text-lg text-gray-900">
            {formatCount(settings.count)}+
          </div>
          <div className="text-sm text-gray-600">{settings.text}</div>
        </div>
      </div>
    );
  }

  if (settings.layout === 'badge') {
    return (
      <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
        <span className="font-bold">{formatCount(settings.count)}+</span>
        <span className="text-sm">{settings.text}</span>
      </div>
    );
  }

  // banner layout
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 text-center">
      <div className="flex items-center justify-center gap-6">
        {settings.showAvatars && (
          <div className="flex -space-x-3">
            {avatars.slice(0, 5).map((avatar, index) => (
              <img
                key={index}
                src={avatar}
                alt="Community member"
                className="w-12 h-12 rounded-full border-3 border-white object-cover"
              />
            ))}
          </div>
        )}
        <div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatCount(settings.count)}+
          </div>
          <div className="text-gray-600">{settings.text}</div>
        </div>
      </div>
    </div>
  );
}