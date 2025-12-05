'use client';

import { Star, BadgeCheck, Users, Award, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import TrackedLink from '@/components/TrackedLink';

interface ProductRevealProps {
  headline?: string;
  subheadline?: string;
  productName?: string;
  productDescription?: string;
  productImage?: string;
  doctorName?: string;
  doctorImage?: string;
  doctorQuote?: string;
  rating?: number;
  reviewCount?: number | string;
  keyBenefits?: string[];
  socialProofStats?: {
    value: string;
    label: string;
  }[];
  ctaText?: string;
  ctaUrl?: string;
  target?: '_self' | '_blank';
  badge?: string;
}

export default function ProductReveal({
  headline = "After 18 Months of Research, I Finally Found It",
  subheadline = "The one formula I can confidently recommend to every woman in my practice",
  productName = "Kiala Greens",
  productDescription = "The clinically-backed greens powder designed specifically for women over 40. One scoop daily addresses the root cause of hormone imbalance, not just the symptoms.",
  productImage = "https://kialanutrition.com/cdn/shop/files/1_89f1b0f3-3095-4bf4-a700-d7be3f09d2a5.png?v=1730842541",
  doctorName = "Dr. Amy Heart",
  doctorImage = "/uploads/oYx9upllBN3uNyd6FMlGj/WXPCOJ8PPZxy1Mt8H4AYm.jpg",
  doctorQuote = "In 15 years of practice, I've never endorsed a specific supplement—until now. The results from my community have been remarkable.",
  rating = 4.8,
  reviewCount = "47,000+",
  keyBenefits = [
    "Supports the gut-hormone axis during menopause",
    "Spectra® clinically-studied antioxidant blend",
    "No sugar alcohols that undermine gut health",
    "One simple daily habit that changes everything"
  ],
  socialProofStats = [
    { value: "83%", label: "still taking it after 60 days" },
    { value: "10,000+", label: "women in our community" },
    { value: "4.8", label: "average rating" }
  ],
  ctaText = "See Why Women Are Choosing Kiala",
  ctaUrl = "https://kialanutrition.com/pages/greens",
  target = "_blank",
  badge = "Dr. Amy's #1 Pick"
}: ProductRevealProps) {
  const formatReviewCount = (count: number | string) => {
    if (typeof count === 'string') return count;
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toLocaleString();
  };

  return (
    <div className="my-12">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
          <Sparkles className="w-4 h-4" />
          {badge}
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{headline}</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subheadline}</p>
      </div>

      {/* Main Reveal Card */}
      <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-3xl shadow-2xl border border-purple-100 overflow-hidden">
        <div className="md:grid md:grid-cols-2 gap-0">
          {/* Product Image Side */}
          <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 p-8 md:p-12 flex items-center justify-center">
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 md:top-8 md:right-8">
              <div className="bg-white/80 backdrop-blur rounded-full p-3 shadow-lg">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full blur-3xl opacity-30" />
              <img
                src={productImage}
                alt={productName}
                className="relative w-full max-w-sm mx-auto drop-shadow-2xl"
              />
            </div>

            {/* Rating badge */}
            <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 bg-white rounded-xl p-3 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'fill-amber-400/30 text-amber-400/30'}`}
                    />
                  ))}
                </div>
                <span className="font-bold text-gray-900">{rating}</span>
                <span className="text-gray-500 text-sm">({formatReviewCount(reviewCount)})</span>
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div className="p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{productName}</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">{productDescription}</p>

            {/* Key Benefits */}
            <div className="space-y-3 mb-8">
              {keyBenefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="p-1 bg-green-100 rounded-full mt-0.5">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Social Proof Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {socialProofStats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-2xl font-bold text-purple-700">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <TrackedLink
              href={ctaUrl}
              target={target}
              widgetType="product-reveal"
              widgetName={productName}
              className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center"
            >
              <span className="flex items-center justify-center gap-2">
                {ctaText}
                <ArrowRight className="w-5 h-5" />
              </span>
            </TrackedLink>
          </div>
        </div>

        {/* Doctor Endorsement Strip */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <img
                src={doctorImage}
                alt={doctorName}
                className="w-16 h-16 rounded-full border-4 border-white/20 shadow-xl"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <BadgeCheck className="w-5 h-5 text-amber-400" />
                  <span className="font-bold text-white">{doctorName}</span>
                </div>
                <p className="text-gray-400 text-sm">Board-Certified • Women's Health Authority</p>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-gray-300 italic text-center md:text-left">
                "{doctorQuote}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
