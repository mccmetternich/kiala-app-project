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
  doctorName = "Our Team",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-none shadow-2xl overflow-hidden animate-scaleIn border border-secondary-200">
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
          <div className="p-12 text-center bg-secondary-50">
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
          <div className="grid md:grid-cols-2">
            {/* Left Side - Visual */}
            <div className="bg-primary-900 text-white p-8 flex flex-col justify-center border-r border-secondary-200">
              <div className="mb-6">
                <div className="w-12 h-12 bg-accent-600 rounded-none flex items-center justify-center mb-6 border border-accent-500">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h2 className="text-2xl md:text-3xl font-normal mb-4 font-heading">{headline}</h2>
                <p className="text-secondary-100 leading-relaxed">{subheadline}</p>
              </div>

              {/* Urgency Banner */}
              <div className="bg-accent-50 text-primary-900 rounded-none p-4 border border-accent-200">
                <div className="flex items-center gap-2 text-accent-700 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-normal">Limited Availability</span>
                </div>
                <p className="text-sm text-primary-700">{urgencyText}</p>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="p-8 bg-secondary-50">
              {/* What You'll Get */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Gift className="w-5 h-5 text-accent-600" />
                  <h3 className="font-normal text-primary-900 font-heading">"{incentive}"</h3>
                </div>

                <p className="text-sm text-primary-600 mb-4 leading-relaxed">
                  This comprehensive guide includes:
                </p>

                <ul className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-primary-700 leading-relaxed">
                      <Heart className="w-4 h-4 text-accent-600 mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Email Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full px-4 py-3 rounded-none border border-secondary-300 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-primary-900 bg-white"
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
                      <Gift className="w-4 h-4" />
                      Send My Guide
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
                className="w-full mt-4 text-sm text-primary-600 hover:text-primary-800 transition-colors border-t border-secondary-200 pt-4"
              >
                No thank you, I'll continue reading
              </button>

              {/* Trust Note */}
              <p className="text-center text-xs text-primary-600 mt-4">
                Your privacy is sacred. No spam, ever.
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
