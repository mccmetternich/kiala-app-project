'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, AlertCircle, Gift, CheckCircle, Loader2, Clock, Heart } from 'lucide-react';
import { trackLead } from '@/lib/meta-pixel';

interface ExitIntentPopupProps {
  siteId: string;
  doctorName?: string;
  headline?: string;
  subheadline?: string;
  incentive?: string;
  urgencyText?: string;
  benefits?: string[];
  onClose?: () => void;
  leadMagnetPdfUrl?: string; // URL to the PDF download
}

export default function ExitIntentPopup({
  siteId,
  doctorName = "Dr. Heart",
  headline = "Wait! Don't Leave Empty-Handed",
  subheadline = "Get instant access to my most popular health guide - absolutely free.",
  incentive = "The Complete Hormone Balance Guide",
  urgencyText = "This free guide is only available for a limited time",
  benefits = [
    "5 Signs Your Hormones Are Imbalanced",
    "The #1 Morning Routine for Energy",
    "Foods That Heal vs. Foods That Harm",
    "My Personal Supplement Stack"
  ],
  onClose,
  leadMagnetPdfUrl
}: ExitIntentPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    // Only trigger when mouse leaves from the top (exit intent)
    if (e.clientY <= 0) {
      const hasShown = sessionStorage.getItem(`exit_popup_shown_${siteId}`);
      const hasSubscribed = localStorage.getItem(`community_subscribed_${siteId}`);
      const communityPopupShown = sessionStorage.getItem(`community_popup_shown_${siteId}`);

      // Don't show exit popup if:
      // 1. Already shown this session
      // 2. User already subscribed
      // 3. Community popup hasn't shown yet (don't interrupt the first popup flow)
      if (!hasShown && !hasSubscribed && communityPopupShown) {
        setIsVisible(true);
        sessionStorage.setItem(`exit_popup_shown_${siteId}`, 'true');
      }
    }
  }, [siteId]);

  useEffect(() => {
    // Delay adding the listener to prevent triggering on initial page load
    // Wait at least 10 seconds to ensure the community popup has had a chance to show first
    // (default community popup delay is 8 seconds)
    const timeoutId = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 10000); // 10 second delay before enabling exit intent detection

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseLeave]);

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
          source: 'exit_intent_popup',
          tags: ['exit_intent', 'lead_magnet'],
          pageUrl: typeof window !== 'undefined' ? window.location.href : undefined
        }),
      });

      const data = await response.json();

      if (response.ok || data.success) {
        setStatus('success');
        setMessage(data.message || 'Your guide is ready!');
        localStorage.setItem(`community_subscribed_${siteId}`, 'true');

        // Fire Meta Pixel Lead event
        trackLead({
          content_name: incentive || 'exit_intent_popup',
          content_category: 'lead_magnet'
        });

        // Trigger PDF download if URL is available
        if (leadMagnetPdfUrl) {
          // Small delay to let user see success state before download starts
          setTimeout(() => {
            const link = document.createElement('a');
            link.href = leadMagnetPdfUrl;
            link.download = ''; // Browser will use filename from URL
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
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
          <div className="p-12 text-center bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {leadMagnetPdfUrl ? 'Your Guide is Ready!' : 'You\'re All Set!'}
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
          <div className="grid md:grid-cols-2">
            {/* Left Side - Visual */}
            <div className="bg-gradient-to-br from-red-500 via-primary-600 to-primary-700 text-white p-8 flex flex-col justify-center">
              <div className="mb-6">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-3">{headline}</h2>
                <p className="text-white/90">{subheadline}</p>
              </div>

              {/* Urgency Banner */}
              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 text-accent-300 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-semibold">Limited Time Offer</span>
                </div>
                <p className="text-sm text-white/80">{urgencyText}</p>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="p-8">
              {/* What You'll Get */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Gift className="w-5 h-5 text-primary-500" />
                  <h3 className="font-bold text-gray-900">Get "{incentive}"</h3>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  {doctorName}'s personal guide includes:
                </p>

                <ul className="space-y-2">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <Heart className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Email Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                  disabled={status === 'loading'}
                />

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-gradient-to-r from-red-500 to-primary-600 hover:from-red-600 hover:to-primary-700 text-white py-3 rounded-xl font-bold text-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                >
                  {status === 'loading' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Gift className="w-5 h-5" />
                      Send My Free Guide
                    </>
                  )}
                </button>

                {status === 'error' && (
                  <p className="text-red-600 text-sm text-center">{message}</p>
                )}
              </form>

              {/* No Thanks Link */}
              <button
                onClick={handleClose}
                className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                No thanks, I don't want free health tips
              </button>

              {/* Trust Note */}
              <p className="text-center text-xs text-gray-500 mt-4">
                Your email is safe. No spam, ever.
              </p>
            </div>
          </div>
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
