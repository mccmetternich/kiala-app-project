'use client';

import { useState, useRef, useEffect } from 'react';
import { Shield, Star, Award, Play, Pause } from 'lucide-react';
import { Site, NavigationTemplateConfig } from '@/types';
import { formatCommunityCount } from '@/lib/format-community-count';

interface ArticleHeaderProps {
  site: Site;
  audioTrackUrl?: string;
  navConfig?: NavigationTemplateConfig;
}

export default function ArticleHeader({ site, audioTrackUrl, navConfig }: ArticleHeaderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Feature flags from navConfig (with defaults)
  const showAudioTrack = navConfig?.showAudioTrack ?? true;
  const showSocialProof = navConfig?.showSocialProof ?? true;
  const showLogo = navConfig?.showLogo ?? true;

  // Get audio URL from props, navConfig, or site settings
  const effectiveAudioUrl = showAudioTrack
    ? (audioTrackUrl || navConfig?.audioTrack?.url || (site as any).settings?.audioUrl)
    : undefined;

  // Track scroll for collapsed header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 120);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const togglePlayPause = () => {
    if (!audioRef.current || !effectiveAudioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const currentTime = audioRef.current.currentTime;
    const duration = audioRef.current.duration;
    setProgress((currentTime / duration) * 100);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const duration = audioRef.current.duration;
    if (duration) {
      audioRef.current.currentTime = percentage * duration;
    }
  };

  const brand = site.brand;

  // Get formatted community count from settings
  const communityCount = formatCommunityCount((site as any).settings);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Desktop: Original Validation Banner - only if social proof enabled */}
      {showSocialProof && (
        <div className="hidden md:block bg-gradient-to-r from-primary-500 to-purple-500 text-white py-3 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-center text-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-semibold">Trusted by {communityCount.full} women transforming their health</span>
              <div className="flex items-center gap-1 ml-2">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-4 h-4 fill-amber-300 text-amber-300" />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop: Original Logo + Social Proof */}
      <nav className="hidden md:block bg-white border-b-2 border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo - No link */}
            {showLogo && (
              <div className="flex items-center gap-3">
                {(brand?.logoImage || brand?.profileImage) ? (
                  <img
                    src={brand.logoImage || brand.profileImage}
                    alt={brand?.name || 'Logo'}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {brand?.name ? brand.name.split(' ').map(n => n[0]).join('') : 'DR'}
                    </span>
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {brand?.name || 'Dr. Heart'}
                  </h1>
                  <p className="text-sm text-primary-600 font-medium">
                    {brand?.tagline || 'Your 40+ Wellness Authority'}
                  </p>
                </div>
              </div>
            )}

            {/* Social Proof Only - No Links */}
            {showSocialProof && (
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop&crop=face" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="" />
                  <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="" />
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop&crop=face" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="" />
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-500 text-white rounded-full border-2 border-white flex items-center justify-center text-xs font-bold shadow-sm">
                    {communityCount.short}
                  </div>
                </div>
                <span className="text-gray-600 font-medium text-sm">active members</span>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile: Elegant Compact Header */}
      <div className="md:hidden">
        {/* Single sticky header that transforms on scroll */}
        <div className="sticky top-0 z-[60] bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 shadow-lg">
          {/* Smooth transition between expanded and collapsed */}
          <div className={`transition-all duration-300 ease-out overflow-hidden ${isScrolled ? 'max-h-14' : 'max-h-40'}`}>
            <div className="px-4 py-3">
              {/* Expanded view layout */}
              <div className={`transition-all duration-300 overflow-hidden ${isScrolled ? 'max-h-0 opacity-0' : 'max-h-24 opacity-100'}`}>
                {/* Top row: Avatar + Bio */}
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={brand?.logoImage || brand?.sidebarImage || brand?.profileImage}
                    alt={brand?.name || 'Doctor'}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white/30 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm leading-tight">
                      {brand?.name || 'Dr. Amy'}
                    </p>
                    <p className="text-white/70 text-xs leading-tight">
                      {brand?.tagline || 'Your 40+ Wellness Authority'}
                    </p>
                    <p className="text-white font-semibold text-xs leading-tight mt-1">
                      👋 Hi from {brand?.name || 'Dr. Amy'}
                    </p>
                  </div>
                </div>

                {/* Play button + Progress bar row - integrated unit */}
                {effectiveAudioUrl && (
                  <div className="flex items-center bg-white/15 backdrop-blur-sm rounded-full pl-1 pr-3 py-1">
                    <button
                      onClick={togglePlayPause}
                      className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-all flex-shrink-0"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 text-purple-600" />
                      ) : (
                        <Play className="w-4 h-4 text-purple-600 ml-0.5" />
                      )}
                    </button>
                    <div
                      className="flex-1 mx-3 bg-white/30 rounded-full h-1.5 cursor-pointer"
                      onClick={handleSeek}
                    >
                      <div
                        className="bg-white h-full rounded-full transition-all duration-100 pointer-events-none"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Collapsed/Mini view layout */}
              <div className={`transition-all duration-300 overflow-hidden ${isScrolled ? 'max-h-12 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="flex items-center gap-3">
                  {/* Left half: Avatar + Bio */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <img
                      src={brand?.logoImage || brand?.sidebarImage || brand?.profileImage}
                      alt={brand?.name || 'Doctor'}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-white/30 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-xs leading-tight truncate">
                        👋 Hi from {brand?.name || 'Dr. Amy'}
                      </p>
                      <p className="text-white/70 text-[10px] leading-tight truncate">
                        {brand?.tagline || 'Your 40+ Wellness Authority'}
                      </p>
                    </div>
                  </div>

                  {/* Right half: Play button + Progress bar - integrated unit */}
                  {effectiveAudioUrl && (
                    <div className="flex items-center bg-white/15 backdrop-blur-sm rounded-full pl-0.5 pr-2 py-0.5 flex-1">
                      <button
                        onClick={togglePlayPause}
                        className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-all flex-shrink-0"
                      >
                        {isPlaying ? (
                          <Pause className="w-3.5 h-3.5 text-purple-600" />
                        ) : (
                          <Play className="w-3.5 h-3.5 text-purple-600 ml-0.5" />
                        )}
                      </button>
                      <div
                        className="flex-1 mx-2 bg-white/30 rounded-full h-1 cursor-pointer"
                        onClick={handleSeek}
                      >
                        <div
                          className="bg-white h-full rounded-full transition-all duration-100 pointer-events-none"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Social Validation Bumper - only in expanded view, if social proof enabled */}
          {showSocialProof && (
            <div className={`bg-purple-700/90 text-white px-4 transition-all duration-300 overflow-hidden ${isScrolled ? 'max-h-0 py-0' : 'max-h-10 py-2'}`}>
              <div className="flex items-center justify-center gap-2">
                <div className="flex -space-x-1.5">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=28&h=28&fit=crop&crop=face" className="w-5 h-5 rounded-full border-2 border-purple-600" alt="" />
                  <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=28&h=28&fit=crop&crop=face" className="w-5 h-5 rounded-full border-2 border-purple-600" alt="" />
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=28&h=28&fit=crop&crop=face" className="w-5 h-5 rounded-full border-2 border-purple-600" alt="" />
                </div>
                <span className="font-medium text-xs">{communityCount.full} women trust {brand?.name || 'Dr. Amy'}</span>
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-3 h-3 fill-amber-300 text-amber-300" />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Audio element */}
        <audio
          ref={audioRef}
          src={effectiveAudioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          preload="metadata"
        />
      </div>
    </header>
  );
}
