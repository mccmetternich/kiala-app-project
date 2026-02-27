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
  doctorName = "Our", // eslint-disable-line @typescript-eslint/no-unused-vars
  communityName = "Wellness Community", // eslint-disable-line @typescript-eslint/no-unused-vars
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-none shadow-2xl overflow-hidden animate-scaleIn max-h-[90vh] overflow-y-auto border border-secondary-200">
        {/* Close Button - Sophisticated styling */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 bg-white hover:bg-secondary-50 rounded-none border border-secondary-200 text-primary-700 hover:text-primary-900 transition-all z-20 shadow-sm"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success State */}
        {status === 'success' ? (
          <div className="p-8 md:p-12 text-center bg-secondary-50">
            <div className="w-16 h-16 bg-accent-100 rounded-none flex items-center justify-center mx-auto mb-6 border border-accent-200">
              <CheckCircle className="w-8 h-8 text-accent-600" />
            </div>
            <h3 className="text-2xl font-normal text-primary-900 mb-4 font-heading">
              {leadMagnetPdfUrl ? 'Your Guide Awaits' : 'Welcome to Our Community'}
            </h3>
            <p className="text-primary-700 mb-6 leading-relaxed">{message}</p>
            {leadMagnetPdfUrl ? (
              <div className="space-y-4">
                <a
                  href={leadMagnetPdfUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-primary-900 hover:bg-primary-800 text-white px-8 py-4 rounded-none font-normal transition-all uppercase tracking-wide text-sm border border-primary-900"
                >
                  <Gift className="w-4 h-4" />
                  <span>Access Your Guide</span>
                </a>
                <p className="text-sm text-primary-600">Download begins automatically</p>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-accent-50 text-accent-700 px-6 py-3 rounded-none text-sm font-normal border border-accent-200">
                <Heart className="w-4 h-4" />
                <span>You're part of our community</span>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Header - sophisticated styling */}
            <div className="bg-secondary-50 border-b border-secondary-200 p-6 md:p-8">
              <div className="flex items-center gap-2 text-primary-600 text-sm mb-4">
                <Sparkles className="w-4 h-4" />
                <span>Join {memberCount.toLocaleString()}+ women</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-normal text-primary-900 mb-3 pr-8 font-heading">
                Join Our Community
              </h2>

              <p className="text-primary-700 text-base leading-relaxed">
                Exclusive wellness insights, evidence-based protocols, and community support for sophisticated women.
              </p>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 md:px-8 md:pb-8">
              {/* Benefits Card */}
              <div className="bg-white rounded-none p-5 md:p-6 mb-6 border border-secondary-200 shadow-sm">
                <h4 className="font-normal text-primary-900 mb-4 flex items-center gap-2 text-base font-heading">
                  <Heart className="w-4 h-4 text-accent-600" />
                  Member Benefits
                </h4>
                <ul className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-primary-700 leading-relaxed">
                      <CheckCircle className="w-4 h-4 text-accent-600 mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Incentive Banner */}
              {incentive && (
                <div className="bg-accent-50 rounded-none p-4 md:p-5 mb-6 border border-accent-200 flex items-center gap-4">
                  <div className="w-10 h-10 bg-accent-600 rounded-none flex items-center justify-center flex-shrink-0">
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-normal text-primary-900 text-sm">Welcome Gift</p>
                    <p className="text-accent-700 text-sm">{incentive}</p>
                  </div>
                </div>
              )}

              {/* Email Form */}
              <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full px-4 py-3 rounded-none border border-secondary-300 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-primary-900 text-base bg-white"
                  disabled={status === 'loading'}
                />

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-primary-900 hover:bg-primary-800 text-white py-4 rounded-none font-normal text-base transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-wide border border-primary-900"
                >
                  {status === 'loading' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      Join Our Community
                    </>
                  )}
                </button>

                {status === 'error' && (
                  <p className="text-red-600 text-sm text-center">{message}</p>
                )}
              </form>

              {/* Social Proof */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="flex -space-x-1">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop&crop=face" alt="" className="w-8 h-8 rounded-none border-2 border-white shadow-sm" />
                  <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face" alt="" className="w-8 h-8 rounded-none border-2 border-white shadow-sm" />
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop&crop=face" alt="" className="w-8 h-8 rounded-none border-2 border-white shadow-sm" />
                  <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=32&h=32&fit=crop&crop=face" alt="" className="w-8 h-8 rounded-none border-2 border-white shadow-sm" />
                </div>
                <p className="text-sm text-primary-600">
                  <span className="font-normal text-primary-900">{memberCount.toLocaleString()}</span> women joined this month
                </p>
              </div>

              {/* Privacy Note */}
              <p className="text-center text-xs text-primary-600 border-t border-secondary-200 pt-4">
                Your privacy is sacred. No spam, ever. Unsubscribe anytime.
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
