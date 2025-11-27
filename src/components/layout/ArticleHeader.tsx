'use client';

import { useState, useRef, useEffect } from 'react';
import { Shield, Star, Award, Play, Pause } from 'lucide-react';
import { Site } from '@/types';

interface ArticleHeaderProps {
  site: Site;
  audioTrackUrl?: string;
}

export default function ArticleHeader({ site, audioTrackUrl }: ArticleHeaderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Get audio URL from props or site settings
  const effectiveAudioUrl = audioTrackUrl || (site as any).settings?.audioUrl;

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

  const brand = site.brand;

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Desktop: Original Validation Banner */}
      <div className="hidden md:block bg-gradient-to-r from-primary-500 to-purple-500 text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center text-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-semibold">Trusted by 47,284+ women transforming their health</span>
            <div className="flex items-center gap-1 ml-2">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-4 h-4 fill-amber-300 text-amber-300" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: Original Logo + Social Proof */}
      <nav className="hidden md:block bg-white border-b-2 border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo - No link */}
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
                  {brand?.tagline || 'Women\'s Health Authority'}
                </p>
              </div>
            </div>

            {/* Social Proof Only - No Links */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop&crop=face" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="" />
                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="" />
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop&crop=face" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="" />
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-500 text-white rounded-full border-2 border-white flex items-center justify-center text-xs font-bold shadow-sm">
                  47k+
                </div>
              </div>
              <span className="text-gray-600 font-medium text-sm">active members</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile: Elegant Compact Header */}
      <div className="md:hidden">
        {/* Collapsed Sticky Header (appears on scroll) */}
        <div
          className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300 ${
            isScrolled ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
          }`}
        >
          <div className="px-4 py-2.5">
            <div className="flex items-center justify-between">
              {/* Left: Avatar + Name */}
              <div className="flex items-center gap-3">
                <img
                  src={brand?.profileImage || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop'}
                  alt={brand?.name || 'Doctor'}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-100"
                />
                <span className="font-semibold text-gray-900 text-sm">{brand?.name || 'Dr. Amy'}</span>
              </div>

              {/* Right: Compact Audio Player */}
              {effectiveAudioUrl && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full pl-3 pr-1 py-1 shadow-md">
                  <div className="flex flex-col">
                    <span className="text-white text-[10px] font-medium leading-tight">Hi from {brand?.name?.split(' ')[0] || 'Dr. Amy'}</span>
                    <div className="w-14 bg-white/30 rounded-full h-1 mt-0.5">
                      <div className="bg-white h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <button
                    onClick={togglePlayPause}
                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 text-purple-600" />
                    ) : (
                      <Play className="w-4 h-4 text-purple-600 ml-0.5" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Mobile Header - Elegant Profile Card */}
        <div className="bg-white px-4 py-4">
          <div className="flex items-start gap-4">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <img
                src={brand?.profileImage || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&h=120&fit=crop'}
                alt={brand?.name || 'Doctor'}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-purple-200 shadow-md"
              />
            </div>

            {/* Bio + Audio Player */}
            <div className="flex-1 min-w-0">
              {/* Name & Title */}
              <div className="mb-2">
                <h1 className="font-bold text-gray-900 text-base leading-tight">
                  {brand?.name || 'Dr. Amy'}
                </h1>
                <p className="text-xs text-gray-500">
                  {brand?.title || brand?.tagline || "Women's Health Expert"}
                </p>
              </div>

              {/* Audio Player - Prominent */}
              {effectiveAudioUrl && (
                <div className="flex items-center gap-3 bg-gradient-to-r from-purple-500 via-purple-500 to-pink-500 rounded-xl px-3 py-2 shadow-lg">
                  <button
                    onClick={togglePlayPause}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform flex-shrink-0"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 text-purple-600" />
                    ) : (
                      <Play className="w-5 h-5 text-purple-600 ml-0.5" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm leading-tight">
                      Hi from {brand?.name?.split(' ')[0] || 'Dr. Amy'}
                    </p>
                    <p className="text-white/80 text-[11px] leading-tight">A quick welcome message</p>
                    <div className="w-full bg-white/30 rounded-full h-1.5 mt-1.5">
                      <div
                        className="bg-white h-full rounded-full transition-all duration-100"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
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

        {/* Social Validation Bumper */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2.5">
          <div className="flex items-center justify-center gap-2.5">
            <div className="flex -space-x-1.5">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=28&h=28&fit=crop&crop=face" className="w-6 h-6 rounded-full border-2 border-white/80" alt="" />
              <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=28&h=28&fit=crop&crop=face" className="w-6 h-6 rounded-full border-2 border-white/80" alt="" />
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=28&h=28&fit=crop&crop=face" className="w-6 h-6 rounded-full border-2 border-white/80" alt="" />
            </div>
            <span className="font-medium text-sm">47,284+ women trust {brand?.name?.split(' ')[0] || 'Dr. Amy'}</span>
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
