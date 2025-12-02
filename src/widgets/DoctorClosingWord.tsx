'use client';

import { Heart, MessageCircle, Shield, CheckCircle } from 'lucide-react';

interface DoctorClosingWordProps {
  doctorName?: string;
  doctorImage?: string;
  headline?: string;
  paragraphs?: string[];
  closingLine?: string;
  signature?: string;
  highlightParagraph?: number; // Index of paragraph to highlight (0-based)
}

export default function DoctorClosingWord({
  doctorName = "Dr. Amy Heart",
  doctorImage = "/uploads/oYx9upllBN3uNyd6FMlGj/WXPCOJ8PPZxy1Mt8H4AYm.jpg",
  headline = "A Final Word From Dr. Amy",
  paragraphs = [
    "I know how frustrating this journey can be. You've tried so many things. You've been told it's \"just aging\" or \"just menopause.\" You've wondered if you're doing something wrong.",
    "You're not. Your body is responding to real biological changes—and you deserve a solution that addresses the real cause.",
    "I've seen thousands of women transform their health by healing their gut first. The weight, the hot flashes, the mood swings, the bloating, the exhaustion—they're all connected to the same root cause. Address that, and everything else follows.",
    "Kiala Greens is the only product I've found that does this comprehensively, safely, and effectively. I stake my professional reputation on it.",
    "Give it 90 days. If it doesn't work for you, you get every penny back. But I'm confident you'll feel the difference long before then."
  ],
  closingLine = "Here's to your health,",
  signature = "— Dr. Amy Heart",
  highlightParagraph = 1 // "You're not..." paragraph
}: DoctorClosingWordProps) {
  return (
    <div className="my-8">
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-3 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-white" />
          <span className="text-white font-semibold text-sm">Personal Message</span>
        </div>

        {/* Main Content */}
        <div className="p-5 md:p-8">
          {/* Mobile Layout */}
          <div className="md:hidden">
            {/* Doctor Info */}
            <div className="flex items-center gap-3 mb-4">
              <img
                src={doctorImage}
                alt={doctorName}
                className="w-14 h-14 rounded-full border-3 border-white shadow-lg object-cover"
              />
              <div>
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  {headline}
                </h3>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
              {paragraphs.map((paragraph, index) => {
                const isHighlight = index === highlightParagraph;
                return (
                  <p
                    key={index}
                    className={`text-sm leading-relaxed ${
                      isHighlight
                        ? 'text-gray-900 font-bold text-base'
                        : 'text-gray-700'
                    }`}
                  >
                    {paragraph}
                  </p>
                );
              })}
            </div>

            {/* Closing */}
            <div className="mt-5 pt-4 border-t border-gray-200">
              <p className="text-gray-600 italic mb-1">{closingLine}</p>
              <p className="text-gray-900 font-bold">{signature}</p>
            </div>

            {/* Trust Badge */}
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500 bg-gray-100 rounded-lg py-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span>90-Day Money-Back Guarantee</span>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex gap-6">
            {/* Doctor Image Column */}
            <div className="flex-shrink-0">
              <img
                src={doctorImage}
                alt={doctorName}
                className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl object-cover"
              />
              <div className="mt-3 flex flex-col items-center gap-2">
                <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                  <CheckCircle className="w-4 h-4" />
                  <span>Verified</span>
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className="flex-1">
              {/* Headline */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-500" />
                {headline}
              </h3>

              {/* Content */}
              <div className="space-y-4">
                {paragraphs.map((paragraph, index) => {
                  const isHighlight = index === highlightParagraph;
                  return (
                    <p
                      key={index}
                      className={`leading-relaxed ${
                        isHighlight
                          ? 'text-gray-900 font-bold text-lg'
                          : 'text-gray-700'
                      }`}
                    >
                      {paragraph}
                    </p>
                  );
                })}
              </div>

              {/* Closing */}
              <div className="mt-6 pt-4 border-t border-gray-200 flex items-end justify-between">
                <div>
                  <p className="text-gray-600 italic mb-1">{closingLine}</p>
                  <p className="text-gray-900 font-bold text-lg">{signature}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 rounded-lg px-4 py-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>90-Day Money-Back Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
