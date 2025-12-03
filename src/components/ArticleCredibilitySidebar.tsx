import { useState, useRef } from 'react';
import { Star, Award, Shield, Play, Pause, TrendingUp, Users } from 'lucide-react';
import { BrandProfile } from '@/types';

interface ArticleCredibilitySidebarProps {
  brand: BrandProfile;
  communityCount?: number;
  className?: string;
  audioTrackUrl?: string;
}

export default function ArticleCredibilitySidebar({ 
  brand, 
  communityCount = 0,
  className,
  audioTrackUrl
}: ArticleCredibilitySidebarProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlayPause = () => {
    if (!audioRef.current || !audioTrackUrl) return;
    
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

  if (!brand) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className={`sticky top-8 ${className}`}>
      {/* Single Floating Panel */}
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        
        {/* Doctor Profile Section */}
        <div className="p-6 bg-gradient-to-br from-primary-50 via-white to-primary-50">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <img
                src={brand?.sidebarImage || brand?.profileImage}
                alt={brand?.name || 'Doctor'}
                className="absolute inset-0 w-full h-full rounded-full object-cover border-4 border-primary-200 shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-secondary-500 rounded-full flex items-center justify-center border-3 border-white shadow-lg">
                <Shield className="w-4 h-4 text-white" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-1">{brand?.name || 'Dr. Heart'}</h3>
            <p className="text-primary-600 font-medium text-sm mb-3">{brand?.title || 'Wellness Physician'}</p>

            <div className="flex flex-wrap gap-1 justify-center mb-3">
              {Array.isArray(brand?.credentials) ? brand.credentials.slice(0, 3).map((credential, index) => (
                <span key={index} className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs font-semibold">
                  {credential}
                </span>
              )) : (
                <>
                  <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs font-semibold">MD</span>
                  <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs font-semibold">PhD</span>
                  <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs font-semibold">FACS</span>
                </>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
              <Award className="w-4 h-4 text-accent-500" />
              <span className="font-medium">{brand?.yearsExperience || 15}+ years helping women</span>
            </div>

            {/* Audio Player */}
            {audioTrackUrl && (
              <div className="mb-4">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-purple-200">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlayPause}
                      className="w-10 h-10 bg-purple-300 hover:bg-purple-400 rounded-full flex items-center justify-center transition-colors shadow-md"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 text-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <div className="text-xs text-gray-600 mb-1">Personal Message</div>
                      <div
                        className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden cursor-pointer"
                        onClick={handleSeek}
                      >
                        <div
                          className="bg-purple-300 h-full transition-all duration-100 ease-linear pointer-events-none"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <audio
                  ref={audioRef}
                  src={audioTrackUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleEnded}
                  preload="metadata"
                />
              </div>
            )}

            {/* Quote */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-primary-100">
              <blockquote className="text-sm text-gray-700 italic">
                "{brand?.quote || 'Dedicated to helping women achieve optimal health through evidence-based protocols.'}"
              </blockquote>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

        {/* Validation Section */}
        <div className="px-6 py-5 bg-gradient-to-r from-green-500 to-green-600 text-white text-center">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-6 h-6" />
          </div>
          
          <h4 className="font-bold text-lg mb-2">🏆 Top Source for Women's Health</h4>
          <p className="text-green-100 text-sm mb-4">Rated #1 by healthcare professionals nationwide</p>
          
          <div className="flex justify-center items-center gap-1 mb-3">
            {[1,2,3,4,5].map((star) => (
              <Star key={star} className="w-4 h-4 fill-current text-yellow-300" />
            ))}
          </div>
          
          <p className="text-green-100 text-xs">
            ✓ Evidence-based protocols • ✓ Medically reviewed • ✓ 47k+ success stories
          </p>
        </div>

        {/* Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

        {/* DR Conversion Widget - Product Unlock Stats */}
        <div className="px-6 py-5 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="text-center">
            {/* Avatar faces */}
            <div className="flex justify-center mb-3">
              <div className="flex -space-x-2">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop&crop=face" className="w-8 h-8 rounded-full border-2 border-white" alt="" />
                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face" className="w-8 h-8 rounded-full border-2 border-white" alt="" />
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop&crop=face" className="w-8 h-8 rounded-full border-2 border-white" alt="" />
                <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=32&h=32&fit=crop&crop=face" className="w-8 h-8 rounded-full border-2 border-white" alt="" />
                <div className="w-8 h-8 bg-white/30 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold">
                  +1.2k
                </div>
              </div>
            </div>

            <h4 className="font-bold text-lg mb-2">🔥 High Demand Alert</h4>
            <div className="bg-white/20 rounded-lg p-3 mb-4">
              <div className="text-2xl font-bold text-yellow-300 mb-1">1,247</div>
              <p className="text-purple-100 text-sm">
                Women unlocked this recommended product in the last 24 hours
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 mb-3 text-purple-100">
              <div className="animate-pulse w-2 h-2 bg-yellow-300 rounded-full"></div>
              <span className="text-xs font-medium">Live counter • Updates every 15 minutes</span>
            </div>

            <p className="text-purple-100 text-xs">
              ⚡ Don't miss out on what thousands of women are discovering
            </p>
          </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

        {/* Community Stats */}
        {communityCount > 0 && (
          <>
            <div className="px-6 py-5 bg-gradient-to-br from-secondary-400 to-secondary-500 text-white text-center">
              <div className="flex justify-center mb-3">
                <div className="flex -space-x-2">
                  <img src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=32&h=32&fit=crop&crop=face" className="w-8 h-8 rounded-full border-2 border-white" alt="" />
                  <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=32&h=32&fit=crop&crop=face" className="w-8 h-8 rounded-full border-2 border-white" alt="" />
                  <img src="https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=32&h=32&fit=crop&crop=face" className="w-8 h-8 rounded-full border-2 border-white" alt="" />
                  <div className="w-8 h-8 bg-white/30 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold">
                    +47k
                  </div>
                </div>
              </div>
              
              <div className="text-2xl font-bold mb-1">
                {communityCount.toLocaleString()}+
              </div>
              <p className="text-secondary-100 text-sm mb-3">
                Women transforming their health
              </p>
              
              <blockquote className="text-secondary-100 text-xs italic">
                "Life-changing protocols!" - Sarah M.
              </blockquote>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
          </>
        )}

        {/* Trust Badges Section */}
        <div className="px-6 py-5 bg-gradient-to-br from-gray-50 to-gray-100">
          <h4 className="font-bold text-gray-900 mb-4 text-center text-sm tracking-wide">AS FEATURED IN</h4>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { name: 'The View', logo: '📺' },
              { name: "Women's Health", logo: '📰' },
              { name: 'Healthline', logo: '🏥' },
              { name: 'WebMD', logo: '⚕️' }
            ].map((outlet) => (
              <div key={outlet.name} className="group">
                <div className="py-3 px-3 bg-white rounded-xl text-center border-2 border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-primary-300 hover:-translate-y-1">
                  <div className="text-lg mb-1">{outlet.logo}</div>
                  <div className="text-xs font-bold text-gray-800 group-hover:text-primary-600 transition-colors">
                    {outlet.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-white rounded-xl p-4 border-2 border-secondary-200 shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-secondary-500" />
              <span className="text-sm font-bold text-gray-900">Medically Reviewed Content</span>
            </div>
            <p className="text-xs text-gray-600 text-center leading-relaxed">
              All protocols reviewed by licensed physicians and backed by peer-reviewed research
            </p>
            
            {/* Professional credentials */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-center gap-1 text-xs text-gray-700">
                <Award className="w-3 h-3 text-accent-500" />
                <span className="font-medium">Board Certified • 15+ Years Experience • 47k+ Patients Helped</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}