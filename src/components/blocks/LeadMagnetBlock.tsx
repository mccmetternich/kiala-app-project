'use client';

import { useState } from 'react';
import { LeadMagnetBlock as LeadMagnetBlockType } from '@/types/blocks';

interface LeadMagnetBlockProps {
  block: LeadMagnetBlockType;
}

export default function LeadMagnetBlock({ block }: LeadMagnetBlockProps) {
  const { settings } = block;
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    
    try {
      // Submit to email API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setIsSuccess(true);
      setEmail('');
    } catch (error) {
      console.error('Error submitting email:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={`${settings.backgroundColor || 'bg-gradient-to-br from-purple-50 to-pink-50'} rounded-2xl p-8 border border-purple-100 shadow-lg`}>
        <div className="text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl text-white">✓</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Success! Check Your Email
          </h3>
          <p className="text-gray-700 text-lg mb-6">
            Your {settings.incentive.toLowerCase()} is on its way! Check your inbox (and spam folder) for your download link.
          </p>
          <button
            onClick={() => setIsSuccess(false)}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Download another resource →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${settings.backgroundColor || 'bg-gradient-to-br from-purple-50 to-pink-50'} rounded-2xl p-8 border border-purple-100 shadow-lg`}>
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
          <span>🎁</span>
          Free Resource
        </div>
        
        <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
          {settings.title}
        </h3>
        
        <p className="text-gray-700 mb-8 text-lg leading-relaxed">
          {settings.description}
        </p>
        
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8 max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl text-white">📖</span>
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-800">{settings.incentive}</div>
              <div className="text-sm text-gray-600">Instant Download</div>
            </div>
          </div>
          
          {settings.features && settings.features.length > 0 && (
            <div className="space-y-2 text-sm text-gray-600 text-left mb-6">
              {settings.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  {feature}
                </div>
              ))}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={settings.emailPlaceholder || "Enter your email address"}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:transform-none"
            >
              {isSubmitting ? 'Sending...' : settings.ctaText}
            </button>
          </form>
          
          <p className="text-xs text-gray-500 mt-3">
            {settings.privacyText || "No spam, ever. Unsubscribe anytime."}
          </p>
        </div>
      </div>
    </div>
  );
}