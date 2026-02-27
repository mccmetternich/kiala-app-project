import { useState, useRef, useEffect } from 'react';
import { Star, Download, Award, Shield, Play, Pause, Check } from 'lucide-react';
import { BrandProfile, LeadMagnet } from '@/types';
import { trackLead } from '@/lib/meta-pixel';
import { formatCountShort, formatCountFull } from '@/lib/format-community-count';

interface CredibilitySidebarProps {
  doctor: BrandProfile;
  leadMagnet?: LeadMagnet;
  communityCount?: number;
  className?: string;
  showLeadMagnet?: boolean;
  audioTrackUrl?: string;
  siteId?: string;
}

export default function CredibilitySidebar({
  doctor,
  leadMagnet,
  communityCount = 0,
  className,
  showLeadMagnet = true,
  audioTrackUrl,
  siteId
}: CredibilitySidebarProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Email capture state
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [emailMessage, setEmailMessage] = useState('');
  const [hasDownloaded, setHasDownloaded] = useState(false);

  // Check if user has already downloaded
  useEffect(() => {
    const downloaded = localStorage.getItem(`health_guide_downloaded_${siteId || 'default'}`);
    if (downloaded) {
      setHasDownloaded(true);
    }
  }, [siteId]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setEmailStatus('error');
      setEmailMessage('Please enter a valid email');
      return;
    }
    setEmailStatus('loading');
    try {
      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          siteId: siteId || 'default',
          source: 'sidebar_lead_magnet',
          tags: ['lead_magnet', leadMagnet?.title || 'health_guide'],
          pageUrl: typeof window !== 'undefined' ? window.location.href : undefined
        }),
      });
      const data = await response.json();
      if (response.ok || data.success) {
        setEmailStatus('success');
        setEmailMessage(data.message || 'Check your inbox!');
        setEmail('');
        // Mark as downloaded and trigger download
        localStorage.setItem(`health_guide_downloaded_${siteId || 'default'}`, 'true');
        setHasDownloaded(true);

        // Fire Meta Pixel Lead event
        trackLead({
          content_name: leadMagnet?.title || 'sidebar_lead_magnet',
          content_category: 'lead_magnet'
        });

        // Trigger PDF download if URL exists
        if (leadMagnet?.downloadUrl) {
          window.open(leadMagnet.downloadUrl, '_blank');
        }
      } else {
        setEmailStatus('error');
        setEmailMessage(data.error || 'Please try again');
      }
    } catch {
      setEmailStatus('error');
      setEmailMessage('Please try again');
    }
  };

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

  if (!doctor) {
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
                src={doctor?.sidebarImage || doctor?.profileImage}
                alt={doctor?.name || 'Doctor'}
                className="absolute inset-0 w-full h-full rounded-full object-cover border-4 border-primary-200 shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-secondary-500 rounded-full flex items-center justify-center border-3 border-white shadow-lg">
                <Shield className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-1">{doctor?.name || 'Health Authority'}</h3>
            <p className="text-primary-600 font-medium text-sm mb-3">{doctor?.tagline || 'Health & Wellness Authority'}</p>
            
            <div className="flex flex-wrap gap-1 justify-center mb-3">
              {Array.isArray(doctor?.credentials) ? (
                doctor.credentials!.slice(0, 3).map((credential, index) => (
                  <span key={index} className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs font-semibold">
                    {credential}
                  </span>
                ))
              ) : (
                <>
                  <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs font-semibold">Evidence-Based</span>
                  <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs font-semibold">Research</span>
                </>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
              <Award className="w-4 h-4 text-accent-500" />
              <span className="font-medium">{doctor?.yearsExperience || 15}+ years of expertise</span>
            </div>

            {/* Audio Player */}
            {audioTrackUrl && (
              <div className="mb-4">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-primary-200">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlayPause}
                      className="w-10 h-10 bg-primary-300 hover:bg-primary-400 rounded-full flex items-center justify-center transition-colors shadow-md"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 text-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <div className="text-xs text-gray-600 mb-1 text-left">✨ My Personal Message</div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-primary-300 h-full transition-all duration-100 ease-linear"
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
                "{doctor?.quote || 'Dedicated to helping women achieve optimal health through evidence-based protocols.'}"
              </blockquote>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

        {/* Lead Magnet Section with Email Capture */}
        {leadMagnet && showLeadMagnet && !hasDownloaded && (
          <>
            <div className="px-6 py-5 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Download className="w-6 h-6" />
                </div>

                <h4 className="font-bold text-lg mb-2">{leadMagnet.title}</h4>
                <p className="text-primary-100 text-sm mb-4">{leadMagnet.description}</p>

                {/* Email Capture Form */}
                <form onSubmit={handleEmailSubmit} className="space-y-2 mb-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white"
                    disabled={emailStatus === 'loading'}
                  />
                  <button
                    type="submit"
                    disabled={emailStatus === 'loading'}
                    className="w-full bg-white text-primary-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    {emailStatus === 'loading' ? 'Sending...' : 'Get Free Guide'}
                  </button>
                </form>

                {emailMessage && (
                  <p className={`text-xs mb-2 ${emailStatus === 'success' ? 'text-green-200' : 'text-red-200'}`}>
                    {emailMessage}
                  </p>
                )}

                <p className="text-primary-200 text-xs flex items-center justify-center gap-2">
                  <span>✓</span> <span>{formatCountFull(communityCount).replace('+', '')} women downloaded</span>
                </p>
              </div>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
          </>
        )}

        {/* Downloaded State - Show thank you instead */}
        {leadMagnet && showLeadMagnet && hasDownloaded && (
          <>
            <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
              <div className="text-center">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Check className="w-5 h-5" />
                </div>
                <p className="font-medium text-sm">Guide Downloaded!</p>
                <p className="text-green-100 text-xs">Check your inbox</p>
              </div>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
          </>
        )}

        {/* Community Section */}
        {communityCount > 0 && (
          <>
            <div className="px-6 py-5 bg-gradient-to-br from-secondary-400 to-secondary-500 text-white text-center">
              <div className="flex justify-center mb-3">
                <div className="flex -space-x-2">
                  <img src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=32&h=32&fit=crop&crop=face" className="w-8 h-8 rounded-full border-2 border-white" alt="" />
                  <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=32&h=32&fit=crop&crop=face" className="w-8 h-8 rounded-full border-2 border-white" alt="" />
                  <img src="https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=32&h=32&fit=crop&crop=face" className="w-8 h-8 rounded-full border-2 border-white" alt="" />
                  <div className="w-8 h-8 bg-white/30 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold">
                    +{formatCountShort(communityCount).replace('+', '')}
                  </div>
                </div>
              </div>
              
              <div className="text-2xl font-bold mb-1">
                {communityCount.toLocaleString()}+
              </div>
              <p className="text-secondary-100 text-sm mb-3">
                Women transforming their health
              </p>
              
              <div className="flex justify-center mb-3">
                {[1,2,3,4,5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-current text-accent-300" />
                ))}
              </div>
              
              <blockquote className="text-secondary-100 text-xs italic">
                "Dr. Heart changed my life!" - Sarah M.
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
              { name: "Women's World", logo: '📰' },
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
                <span className="font-medium">Board Certified • 15+ Years Experience • {formatCountShort(communityCount)} Patients Helped</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
