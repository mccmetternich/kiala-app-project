'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  showWaveform?: boolean;
  showCTA?: boolean;
  compact?: boolean;
}

export default function AudioPlayer({
  audioUrl,
  title = "Personal Message from Dr. Heart",
  subtitle = "Listen to my personal story and approach to healing",
  className = "",
  showWaveform = true,
  showCTA = true,
  compact = false
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Default fallback audio URL
  const defaultAudioUrl = "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav";
  const finalAudioUrl = audioUrl || defaultAudioUrl;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.volume = volume;

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, [volume]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const restart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 border border-purple-100 shadow-lg ${className}`}>
      <audio ref={audioRef} src={finalAudioUrl} preload="metadata" />
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Volume2 className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{subtitle}</p>
      </div>

      {/* Waveform Visual (Decorative) */}
      {showWaveform && (
        <div className="flex items-center justify-center gap-1 mb-8 h-16">
          {Array.from({ length: 50 }, (_, i) => (
            <div
              key={i}
              className="bg-gradient-to-t from-purple-400 to-blue-500 rounded-full transition-all duration-75"
              style={{
                width: '3px',
                height: `${Math.random() * 40 + 10}px`,
                opacity: i < (progress / 2) ? 1 : 0.3,
                animation: isPlaying ? `pulse ${Math.random() * 0.5 + 0.5}s ease-in-out infinite alternate` : 'none'
              }}
            />
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="space-y-6">
        {/* Main Controls */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={restart}
            className="p-3 bg-white/80 hover:bg-white rounded-full shadow-md transition-all hover:scale-105"
            title="Restart"
          >
            <RotateCcw className="w-6 h-6 text-gray-700" />
          </button>

          <button
            onClick={togglePlayPause}
            disabled={isLoading}
            className="p-6 bg-gradient-to-br from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-full shadow-xl transition-all hover:scale-105 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-gray-600" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, rgb(147 51 234) 0%, rgb(147 51 234) ${volume * 100}%, rgb(229 231 235) ${volume * 100}%, rgb(229 231 235) 100%)`
              }}
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div
            className="relative h-3 bg-gray-200 rounded-full overflow-hidden cursor-pointer group"
            onClick={handleSeek}
          >
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-blue-600 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white border-2 border-purple-500 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${progress}%`, marginLeft: '-8px' }}
            />
          </div>
          
          <div className="flex justify-between text-sm text-gray-600">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Call to Action - only show if showCTA is true */}
      {showCTA && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Get my complete wellness protocols and join 47,284+ women transforming their health
          </p>
          <a
            href="/dr-heart/community"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-full transition-all transform hover:scale-105 shadow-lg"
          >
            Get Free Access
            <span>→</span>
          </a>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          from { opacity: 0.6; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}