'use client';

import { useState } from 'react';
import { Star, BadgeCheck, Users, Award, Sparkles, ArrowRight, CheckCircle, ShieldCheck } from 'lucide-react';
import TrackedLink from '@/components/TrackedLink';

interface ProductRevealProps {
  headline?: string;
  subheadline?: string;
  productName?: string;
  productDescription?: string;
  productImage?: string;
  productImages?: string[]; // Multiple images for carousel
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
  communityExclusive?: boolean;
  communityExclusiveText?: string;
}

export default function ProductReveal({
  headline = "After 18 Months of Research, I Finally Found It",
  subheadline = "The one formula I can confidently recommend to every woman in my practice",
  productName = "Kiala Greens",
  productDescription = "The clinically-backed greens powder designed specifically for women over 40. One scoop daily addresses the root cause of hormone imbalance, not just the symptoms.",
  productImage = "https://kialanutrition.com/cdn/shop/files/1_89f1b0f3-3095-4bf4-a700-d7be3f09d2a5.png?v=1730842541",
  productImages,
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
  badge = "Dr. Amy's #1 Pick",
  communityExclusive = true,
  communityExclusiveText = "Exclusive to our community members"
}: ProductRevealProps) {
  // Use productImages if provided, otherwise create array from single productImage
  const images = productImages && productImages.length > 0 ? productImages : [productImage];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
      <div className="bg-white rounded-3xl shadow-2xl border border-purple-100/50 overflow-hidden">
        {/* Decorative top border */}
        <div className="h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />

        <div className="md:grid md:grid-cols-[55%_45%] gap-0">
          {/* Product Image Side - Larger allocation */}
          <div className="relative bg-gradient-to-br from-purple-50/80 via-white to-pink-50/80 p-4 md:p-4">
            {/* Badge with #1 - positioned top-left of image */}
            <div className="absolute top-6 left-6 md:top-6 md:left-6 z-10">
              <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl px-4 py-2.5 shadow-xl flex items-center gap-2">
                <Award className="w-5 h-5 text-white" />
                <span className="text-white font-black text-lg">#1</span>
              </div>
            </div>

            {/* Main Product Image - Much Larger */}
            <div className="relative flex items-center justify-center">
              <img
                src={images[selectedImageIndex]}
                alt={productName}
                className="w-full h-auto min-h-[350px] md:min-h-[450px] max-h-[600px] object-contain drop-shadow-2xl"
              />
            </div>

            {/* Image Thumbnails - Only show if multiple images exist */}
            {images.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImageIndex === idx
                        ? 'border-purple-500 ring-2 ring-purple-200 scale-105'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${productName} view ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Rating badge - directly under image */}
            <div className="mt-4">
              <div className="flex items-center justify-center gap-3 bg-white rounded-xl px-4 py-3 shadow-lg border border-purple-100">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${star <= Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'fill-amber-400/30 text-amber-400/30'}`}
                    />
                  ))}
                </div>
                <span className="font-bold text-gray-900">{rating}</span>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600 text-sm">{formatReviewCount(reviewCount)} reviews</span>
              </div>
            </div>

            {/* Social Proof Stats - moved under rating for balanced columns */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              {socialProofStats.map((stat, idx) => (
                <div key={idx} className="text-center bg-gradient-to-b from-purple-50 to-white rounded-xl p-3 border border-purple-100/50">
                  <div className="text-lg md:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{stat.value}</div>
                  <div className="text-xs text-gray-500 leading-tight">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Side - Tighter padding */}
          <div className="p-5 md:p-6 bg-gradient-to-b from-white to-purple-50/30">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{productName}</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">{productDescription}</p>

            {/* Key Benefits */}
            <div className="space-y-3 mb-6">
              {keyBenefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="p-1 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mt-0.5 shadow-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <TrackedLink
              href={ctaUrl}
              target={target}
              widgetType="product-reveal"
              widgetName={productName}
              className="block w-full bg-gradient-to-r from-purple-600 via-purple-600 to-pink-600 hover:from-purple-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-center"
            >
              <span className="flex items-center justify-center gap-2">
                {ctaText}
                <ArrowRight className="w-5 h-5" />
              </span>
            </TrackedLink>

            {/* Community Exclusive Badge */}
            {communityExclusive && (
              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-purple-700">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-medium">{communityExclusiveText}</span>
              </div>
            )}
          </div>
        </div>

        {/* Doctor Endorsement Strip - Updated gradient */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-sm scale-110" />
                <img
                  src={doctorImage}
                  alt={doctorName}
                  className="relative w-16 h-16 rounded-full border-3 border-white/30 shadow-xl object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <BadgeCheck className="w-5 h-5 text-amber-300" />
                  <span className="font-bold text-white">{doctorName}</span>
                </div>
                <p className="text-purple-200 text-sm">Board-Certified • Women's Health</p>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-white/90 italic text-center md:text-left leading-relaxed">
                "{doctorQuote}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
