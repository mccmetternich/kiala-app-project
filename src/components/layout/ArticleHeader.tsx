'use client';

import { useState, useRef } from 'react';
import { Shield, Star, Award, Play, Pause } from 'lucide-react';
import { Site } from '@/types';

interface ArticleHeaderProps {
  site: Site;
  audioTrackUrl?: string;
}

export default function ArticleHeader({ site, audioTrackUrl }: ArticleHeaderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Get audio URL from props or site settings
  const effectiveAudioUrl = audioTrackUrl || (site as any).settings?.audioUrl;

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

      {/* Mobile: Collapsed Credibility Panel */}
      <div className="md:hidden">
        {/* Main Mobile Header - Keep original sizes, add audio on same row */}
        <div className="bg-gradient-to-br from-white via-primary-50/30 to-purple-50/30 border-b border-primary-100 px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Author Picture - Larger (original size) - No link */}
            <div className="flex-shrink-0">
              <div className="relative">
                <img
                  src={brand?.sidebarImage || brand?.profileImage || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop'}
                  alt={brand?.name || 'Doctor'}
                  className="w-16 h-16 rounded-full object-cover border-3 border-primary-300 shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-secondary-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                  <Shield className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            </div>

            {/* Author Info - Bigger (original size) */}
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-gray-900 text-lg leading-tight">
                {brand?.name || 'Dr. Heart'}
              </h1>
              <p className="text-sm text-primary-600 font-semibold mb-1">
                {brand?.title || 'Wellness Physician'}
              </p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {Array.isArray(brand?.credentials) ? brand.credentials.slice(0, 3).map((credential, index) => (
                  <span key={index} className="bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full text-xs font-bold">
                    {credential}
                  </span>
                )) : (
                  <>
                    <span className="bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full text-xs font-bold">MD</span>
                    <span className="bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full text-xs font-bold">Board Certified</span>
                  </>
                )}
                <span className="text-xs text-gray-600 flex items-center gap-1">
                  <Award className="w-4 h-4 text-accent-500" />
                  {brand?.yearsExperience || 15}+ yrs
                </span>
              </div>
            </div>

            {/* Audio Player - Compact Right Aligned */}
            {effectiveAudioUrl && (
              <div className="flex-shrink-0">
                <div className="bg-gradient-to-r from-purple-500 to-primary-500 rounded-xl px-2.5 py-2 shadow-md">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={togglePlayPause}
                      className="w-10 h-10 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center transition-all shadow-sm"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 text-purple-600" />
                      ) : (
                        <Play className="w-5 h-5 text-purple-600 ml-0.5" />
                      )}
                    </button>
                    <div className="w-16">
                      <div className="text-white font-semibold text-[9px] leading-tight mb-0.5">A Personal Welcome</div>
                      <div className="w-full bg-white/30 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-white h-full transition-all duration-100 ease-linear rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <audio
                  ref={audioRef}
                  src={effectiveAudioUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleEnded}
                  preload="metadata"
                />
              </div>
            )}
          </div>
        </div>

        {/* Mobile: Social Proof Sub-Row - Larger */}
        <div className="bg-gradient-to-r from-primary-500 to-purple-500 text-white px-4 py-3">
          <div className="flex items-center justify-center gap-3 text-sm">
            <div className="flex -space-x-2">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop&crop=face" className="w-7 h-7 rounded-full border-2 border-white" alt="" />
              <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face" className="w-7 h-7 rounded-full border-2 border-white" alt="" />
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop&crop=face" className="w-7 h-7 rounded-full border-2 border-white" alt="" />
              <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=32&h=32&fit=crop&crop=face" className="w-7 h-7 rounded-full border-2 border-white" alt="" />
            </div>
            <span className="font-semibold">47,284+ women in community</span>
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-4 h-4 fill-amber-300 text-amber-300" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
