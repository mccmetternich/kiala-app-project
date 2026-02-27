'use client';

import { BadgeCheck, Award, Shield, Star, Sparkles } from 'lucide-react';

interface DoctorAssessmentProps {
  doctorName?: string;
  doctorImage?: string;
  doctorCredentials?: string;
  headline?: string;
  paragraphs?: string[];
  signature?: string;
  highlightText?: string;
  badgeText?: string;
}

export default function DoctorAssessment({
  doctorName = "Sarah Chen, MS, RD",
  doctorImage = "/uploads/oYx9upllBN3uNyd6FMlGj/WXPCOJ8PPZxy1Mt8H4AYm.jpg",
  doctorCredentials = "MS Nutritional Science, Registered Dietitian",
  headline = "My Nutritional Assessment",
  paragraphs = [
    "In over a decade of analyzing supplements, I rarely endorse specific products. The industry's history of overpromising made me protective of my professional credibility and your trust.",
    "Kiala Greens earned my recommendation through rigorous evaluation and consistent results from thousands of women dealing with energy fluctuations, digestive issues, and wellness challenges.",
    "I've watched women who tried everything finally see results. The bloating resolves. The energy stabilizes. The wellness foundation strengthens."
  ],
  signature = "— Sarah Chen, MS, RD",
  highlightText = "Kiala Greens earned my recommendation through rigorous evaluation and consistent results from thousands of women dealing with energy fluctuations, digestive issues, and wellness challenges.",
  badgeText = "Professional Nutritional Assessment"
}: DoctorAssessmentProps) {
  return (
    <div className="my-8">
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-white rounded-2xl border border-purple-200 shadow-lg overflow-hidden">
        {/* Header Badge */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 flex items-center gap-2">
          <Award className="w-5 h-5 text-white" />
          <span className="text-white font-semibold text-sm">{badgeText}</span>
        </div>

        {/* Main Content */}
        <div className="p-5 md:p-8">
          {/* Mobile Layout */}
          <div className="md:hidden">
            {/* Doctor Info Row */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <img
                  src={doctorImage}
                  alt={doctorName}
                  className="w-16 h-16 rounded-full border-3 border-white shadow-lg object-cover"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center border-2 border-white">
                  <BadgeCheck className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{doctorName}</h3>
                <p className="text-purple-600 text-xs font-medium">{doctorCredentials}</p>
              </div>
            </div>

            {/* Headline */}
            <h4 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              {headline}
            </h4>

            {/* Content */}
            <div className="space-y-3">
              {paragraphs.map((paragraph, index) => {
                const isHighlight = paragraph === highlightText;
                return (
                  <p
                    key={index}
                    className={`text-base leading-relaxed ${
                      isHighlight
                        ? 'text-purple-800 font-semibold bg-purple-100/50 p-3 rounded-lg border-l-4 border-purple-500'
                        : 'text-gray-700'
                    }`}
                  >
                    {paragraph}
                  </p>
                );
              })}
            </div>

            {/* Signature */}
            <div className="mt-4 pt-3 border-t border-purple-100">
              <p className="text-purple-700 font-semibold text-sm">{signature}</p>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex gap-6">
            {/* Doctor Image Column */}
            <div className="flex-shrink-0">
              <div className="relative">
                <img
                  src={doctorImage}
                  alt={doctorName}
                  className="w-28 h-28 rounded-2xl border-4 border-white shadow-xl object-cover"
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center border-3 border-white shadow-md">
                  <BadgeCheck className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mt-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-current text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-gray-500">Trusted by 1M+ Women</p>
              </div>
            </div>

            {/* Content Column */}
            <div className="flex-1">
              {/* Doctor Name & Credentials */}
              <div className="mb-4">
                <h3 className="font-bold text-gray-900 text-xl">{doctorName}</h3>
                <p className="text-purple-600 text-sm font-medium">{doctorCredentials}</p>
              </div>

              {/* Headline */}
              <h4 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-500" />
                {headline}
              </h4>

              {/* Content */}
              <div className="space-y-4">
                {paragraphs.map((paragraph, index) => {
                  const isHighlight = paragraph === highlightText;
                  return (
                    <p
                      key={index}
                      className={`leading-relaxed ${
                        isHighlight
                          ? 'text-purple-800 font-semibold bg-purple-100/50 p-4 rounded-xl border-l-4 border-purple-500'
                          : 'text-gray-700'
                      }`}
                    >
                      {paragraph}
                    </p>
                  );
                })}
              </div>

              {/* Signature */}
              <div className="mt-6 pt-4 border-t border-purple-100 flex items-center justify-between">
                <p className="text-purple-700 font-bold">{signature}</p>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Verified Medical Professional</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
