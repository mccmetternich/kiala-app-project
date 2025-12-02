'use client';

import { useState, useEffect } from 'react';
import { X, Users, Heart, Gift, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { trackLead } from '@/lib/meta-pixel';

interface CommunityPopupProps {
  siteId: string;
  triggerDelay?: number; // ms before showing popup
  doctorName?: string;
  communityName?: string;
  memberCount?: number;
  benefits?: string[];
  incentive?: string;
  onClose?: () => void;
  leadMagnetPdfUrl?: string; // URL to the PDF download
}

export default function CommunityPopup({
  siteId,
  triggerDelay = 5000,
  doctorName = "Dr. Heart",
  communityName = "Wellness Community",
  memberCount = 47284,
  benefits = [
    "Weekly health tips & protocols",
    "Early access to new content",
    "Exclusive member discounts",
    "Private Q&A sessions"
  ],
  incentive = "Free Hormone Health Guide",
  onClose,
  leadMagnetPdfUrl
}: CommunityPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check if already shown or subscribed
    const hasShown = sessionStorage.getItem(`community_popup_shown_${siteId}`);
    const hasSubscribed = localStorage.getItem(`community_subscribed_${siteId}`);

    if (hasShown || hasSubscribed) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
      sessionStorage.setItem(`community_popup_shown_${siteId}`, 'true');
    }, triggerDelay);

    return () => clearTimeout(timer);
  }, [siteId, triggerDelay]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          siteId,
          source: 'community_popup',
          tags: ['community', 'popup'],
          pageUrl: typeof window !== 'undefined' ? window.location.href : undefined
        }),
      });

      const data = await response.json();

      if (response.ok || data.success) {
        setStatus('success');
        setMessage(data.message || 'Welcome to the community!');
        localStorage.setItem(`community_subscribed_${siteId}`, 'true');

        // Fire Meta Pixel Lead event
        trackLead({
          content_name: incentive || 'community_popup',
          content_category: 'community_signup'
        });

        // Trigger PDF download if URL is available
        if (leadMagnetPdfUrl) {
          setTimeout(() => {
            const link = document.createElement('a');
            link.href = leadMagnetPdfUrl;
            link.download = '';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }, 500);
        }

        // Auto close after success (longer delay to allow download)
        setTimeout(() => {
          handleClose();
        }, 5000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn max-h-[90vh] overflow-y-auto">
        {/* Close Button - More prominent */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 md:top-4 md:right-4 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg border border-gray-200 text-gray-600 hover:text-gray-900 transition-all z-20"
          aria-label="Close popup"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Success State */}
        {status === 'success' ? (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {leadMagnetPdfUrl ? 'Welcome! Your Guide is Ready!' : 'Welcome to the Family!'}
            </h3>
            <p className="text-gray-600 mb-4">{message}</p>
            {leadMagnetPdfUrl ? (
              <div className="space-y-3">
                <a
                  href={leadMagnetPdfUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-semibold transition-colors"
                >
                  <Gift className="w-5 h-5" />
                  <span>Download Your Free Guide</span>
                </a>
                <p className="text-sm text-gray-500">Your download should start automatically</p>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                <Gift className="w-4 h-4" />
                <span>Welcome to the community!</span>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Header with gradient - more compact on mobile */}
            <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 text-white p-5 pb-8 md:p-8 md:pb-12">
              <div className="flex items-center gap-2 text-primary-100 text-sm mb-2 md:mb-4">
                <Sparkles className="w-4 h-4" />
                <span>Join {memberCount.toLocaleString()}+ members</span>
              </div>

              <h2 className="text-xl md:text-3xl font-bold mb-2 md:mb-3 pr-8">
                Join {doctorName}'s {communityName}
              </h2>

              <p className="text-primary-100 text-sm md:text-base">
                Get exclusive health tips, protocols, and community support from women just like you.
              </p>
            </div>

            {/* Content - more compact on mobile */}
            <div className="px-5 pb-5 md:px-8 md:pb-8 -mt-4 md:-mt-6">
              {/* Benefits Card */}
              <div className="bg-gray-50 rounded-xl p-4 md:p-5 mb-4 md:mb-6 border border-gray-100 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                  <Heart className="w-4 h-4 text-primary-500" />
                  Member Benefits
                </h4>
                <ul className="space-y-1.5 md:space-y-2">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs md:text-sm text-gray-700">
                      <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-secondary-500 mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Incentive Banner */}
              {incentive && (
                <div className="bg-gradient-to-r from-accent-50 to-accent-100 rounded-xl p-3 md:p-4 mb-4 md:mb-6 border border-accent-200 flex items-center gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-accent-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Gift className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-xs md:text-sm">Free Gift When You Join</p>
                    <p className="text-accent-700 text-xs md:text-sm">{incentive}</p>
                  </div>
                </div>
              )}

              {/* Email Form */}
              <form onSubmit={handleSubmit} className="space-y-2 md:space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-2.5 md:py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 text-sm md:text-base"
                  disabled={status === 'loading'}
                />

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-2.5 md:py-3 rounded-xl font-bold text-base md:text-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25"
                >
                  {status === 'loading' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Users className="w-5 h-5" />
                      Join the Community
                    </>
                  )}
                </button>

                {status === 'error' && (
                  <p className="text-red-600 text-sm text-center">{message}</p>
                )}
              </form>

              {/* Social Proof - hidden on very small screens */}
              <div className="mt-4 md:mt-6 flex items-center justify-center gap-2 md:gap-3">
                <div className="flex -space-x-2">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop&crop=face" alt="" className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-white" />
                  <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face" alt="" className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-white" />
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop&crop=face" alt="" className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-white" />
                  <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=32&h=32&fit=crop&crop=face" alt="" className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-white" />
                </div>
                <p className="text-xs md:text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{memberCount.toLocaleString()}</span> women joined this month
                </p>
              </div>

              {/* Privacy Note */}
              <p className="text-center text-xs text-gray-500 mt-3 md:mt-4">
                No spam, ever. Unsubscribe anytime.
              </p>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
