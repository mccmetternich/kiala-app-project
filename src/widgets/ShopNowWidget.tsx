'use client';

import { useState } from 'react';
import { Star, Shield, Truck, CheckCircle, Package, Sparkles, Gift } from 'lucide-react';
import { useTracking } from '@/contexts/TrackingContext';

interface PricingOption {
  id: string;
  label: string;
  quantity: number;
  price: number;
  originalPrice: number;
  perUnit: number;
  savings: string;
  badge?: string;
  popular?: boolean;
  gifts?: { name: string; value: string }[];
}

interface ProductImage {
  url: string;
  alt: string;
}

interface ShopNowWidgetProps {
  productName?: string;
  description?: string;
  images?: ProductImage[];
  rating?: number;
  reviewCount?: number | string;
  lovedByCount?: string;
  pricingOptions?: PricingOption[];
  benefits?: string[];
  ctaText?: string;
  ctaUrl?: string;
  target?: '_self' | '_blank';
  guaranteeText?: string;
  testimonial?: {
    quote: string;
    name: string;
    avatar: string;
  };
}

const defaultImages: ProductImage[] = [
  { url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop', alt: 'Product main view' },
  { url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop', alt: 'Product angle view' },
  { url: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=500&h=500&fit=crop', alt: 'Product contents' },
  { url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop', alt: 'Product in use' },
  { url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&h=500&fit=crop', alt: 'Product detail' },
  { url: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=500&h=500&fit=crop', alt: 'Product lifestyle' }
];

const defaultPricingOptions: PricingOption[] = [
  {
    id: 'single',
    label: 'Buy 1 Get 1 FREE',
    quantity: 1,
    price: 97,
    originalPrice: 167,
    perUnit: 97,
    savings: 'Save $70',
    gifts: [
      { name: 'Free Shipping', value: '$10.00' }
    ]
  },
  {
    id: 'double',
    label: 'Buy 2 Get 2 FREE',
    quantity: 2,
    price: 167,
    originalPrice: 287,
    perUnit: 83.50,
    savings: 'Save $120',
    popular: true,
    gifts: [
      { name: 'Free Shipping', value: '$10.00' },
      { name: 'Free Frother', value: '$10.00' }
    ]
  },
  {
    id: 'triple',
    label: 'Buy 3 Get 3 FREE',
    quantity: 3,
    price: 227,
    originalPrice: 377,
    perUnit: 75.67,
    savings: 'Save $150',
    gifts: [
      { name: 'Free Shipping', value: '$10.00' },
      { name: 'Free Frother', value: '$10.00' },
      { name: 'Free Wellness Guide', value: '$10.00' }
    ]
  }
];

export default function ShopNowWidget({
  productName = 'Complete Hormone Reset',
  description = 'The all-in-one solution for naturally balancing your hormones and boosting your metabolism after 40.',
  images = defaultImages,
  rating = 4.7,
  reviewCount = 1200000,
  lovedByCount = '1,000,000+',
  pricingOptions = defaultPricingOptions,
  benefits = [
    'Clinically-backed formula',
    '90-day transformation protocol',
    'Free digital delivery',
    'Expert support included'
  ],
  ctaText = 'START NOW',
  ctaUrl = '#',
  target = '_self',
  guaranteeText = '90-Day Money-Back Guarantee',
  testimonial = {
    quote: 'This totally changed my life!',
    name: 'Sarah M.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=face'
  }
}: ShopNowWidgetProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedOption, setSelectedOption] = useState(
    pricingOptions.find(opt => opt.popular)?.id || pricingOptions[1]?.id || pricingOptions[0].id
  );
  const { appendTracking } = useTracking();

  // Format review count (e.g., 1.2M)
  const formatReviewCount = (count: number | string) => {
    if (typeof count === 'string') return count;
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toLocaleString();
  };

  const currentOption = pricingOptions.find(opt => opt.id === selectedOption) || pricingOptions[0];

  // Shared components for reuse
  const RatingSection = () => (
    <div className="text-center md:text-left">
      <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
        <div className="flex">
          {[1,2,3,4,5].map((star) => (
            <Star key={star} className={`w-5 h-5 ${star <= 4 ? 'fill-current text-amber-400' : 'fill-amber-400/70 text-amber-400/70'}`} />
          ))}
        </div>
        <span className="font-bold text-gray-900">4.7</span>
        <span className="text-gray-500">({formatReviewCount(reviewCount)} reviews)</span>
      </div>
      <p className="text-sm text-gray-500 mt-1">Loved by {lovedByCount} Women</p>
    </div>
  );

  const ImageGallery = () => (
    <>
      <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-white shadow-md group cursor-pointer">
        <img
          src={images[selectedImage]?.url}
          alt={images[selectedImage]?.alt}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="bg-gradient-to-r from-primary-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            BEST SELLER
          </span>
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            COMMUNITY EXCLUSIVE
          </span>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {images.slice(0, 6).map((image, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedImage(idx)}
            className={`flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
              selectedImage === idx
                ? 'border-primary-500 ring-2 ring-primary-200 scale-105'
                : 'border-gray-200 hover:border-primary-300 hover:scale-105 hover:shadow-md'
            }`}
          >
            <img
              src={image.url}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </>
  );

  const BenefitsSection = () => (
    <div className="grid grid-cols-2 gap-3">
      {benefits.map((benefit, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <span className="text-gray-700 text-sm">{benefit}</span>
        </div>
      ))}
    </div>
  );

  const PricingSection = () => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        Select Your Package:
      </label>
      <div className="space-y-1.5">
        {pricingOptions.map((option) => (
          <label
            key={option.id}
            className={`relative block px-3 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${
              selectedOption === option.id
                ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="pricing"
              value={option.id}
              checked={selectedOption === option.id}
              onChange={() => setSelectedOption(option.id)}
              className="sr-only"
            />
            <div className="flex items-center">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 flex-shrink-0 ${
                selectedOption === option.id
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-gray-300'
              }`}>
                {selectedOption === option.id && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{option.label}</span>
                  <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">{option.savings}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900">${option.price}</div>
                <div className="text-sm text-gray-400 line-through">${option.originalPrice}</div>
              </div>
            </div>
            {option.gifts && option.gifts.length > 0 && (
              <div className="mt-1 ml-9 flex flex-wrap gap-x-3 gap-y-0">
                {option.gifts.map((gift, giftIdx) => (
                  <div key={giftIdx} className="flex items-center gap-1.5 text-sm">
                    <Gift className="w-4 h-4 text-primary-500" />
                    <span className="text-gray-700">{gift.name}</span>
                    <span className="text-gray-400 line-through text-xs">{gift.value}</span>
                  </div>
                ))}
              </div>
            )}
          </label>
        ))}
      </div>
    </div>
  );

  const CTASection = () => {
    // Build the URL with option param, then apply tracking
    const baseUrl = ctaUrl.includes('?')
      ? `${ctaUrl}&option=${selectedOption}`
      : `${ctaUrl}?option=${selectedOption}`;
    const trackedUrl = appendTracking(baseUrl);

    return (
    <>
      <a
        href={trackedUrl}
        target={target}
        className="block w-full bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-xl text-lg text-center transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
      >
        {ctaText} - ${currentOption.price}
      </a>
      <div className="flex items-center justify-center gap-4 md:gap-6 mt-4 text-gray-500 text-xs md:text-sm flex-wrap">
        <div className="flex items-center gap-1">
          <Shield className="w-4 h-4 text-green-600" />
          <span>{guaranteeText}</span>
        </div>
        <div className="flex items-center gap-1">
          <Truck className="w-4 h-4 text-blue-600" />
          <span>Fast Delivery</span>
        </div>
      </div>
    </>
  );
  };

  const TestimonialSection = () => (
    testimonial && (
      <div className="bg-gray-50 md:bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center gap-3">
          <img
            src={testimonial.avatar}
            alt={testimonial.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-primary-200"
          />
          <div className="flex-1">
            <div className="flex mb-1">
              {[1,2,3,4,5].map((star) => (
                <Star key={star} className="w-4 h-4 fill-current text-amber-400" />
              ))}
            </div>
            <p className="text-gray-700 italic text-sm">"{testimonial.quote}"</p>
            <p className="text-gray-500 text-xs mt-1">— {testimonial.name}</p>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="my-6 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* Top Banner - Pink/Lavender theme */}
      <div className="bg-gradient-to-r from-primary-500 to-purple-500 text-white px-4 py-3 text-center font-medium">
        <Sparkles className="w-4 h-4 inline mr-2" />
        Free shipping on all orders + Bonuses and Gifts included!
        <Sparkles className="w-4 h-4 inline ml-2" />
      </div>

      {/* Mobile Layout - Specific order */}
      <div className="md:hidden p-4 space-y-5">
        {/* 1. Rating, review count, and Join copy */}
        <div className="text-center">
          <RatingSection />
          <p className="text-primary-600 font-medium mt-2">
            Join {lovedByCount} women who've made Kiala Greens their daily wellness ritual
          </p>
        </div>

        {/* 2. Main image and carousel */}
        <ImageGallery />

        {/* 3. Product description */}
        <p className="text-gray-600 text-center">
          {description}
        </p>

        {/* 4. Benefits with checkmarks */}
        <BenefitsSection />

        {/* 5. Select packages */}
        <PricingSection />

        {/* 6. CTA with icons */}
        <CTASection />

        {/* 7. Quote as final */}
        <TestimonialSection />
      </div>

      {/* Desktop Layout - 2 column grid */}
      <div className="hidden md:grid md:grid-cols-2 gap-0">
        {/* Left: Image Gallery + Benefits */}
        <div className="p-6 bg-gray-50">
          <ImageGallery />
          <div className="mt-4">
            <BenefitsSection />
          </div>
          <div className="mt-4">
            <TestimonialSection />
          </div>
        </div>

        {/* Right: Product Details */}
        <div className="p-6 md:p-8">
          <RatingSection />

          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 mt-4">{productName}</h2>
          <p className="text-gray-600 mb-5">{description}</p>

          <div className="mb-5">
            <PricingSection />
          </div>

          <CTASection />
        </div>
      </div>
    </div>
  );
}
