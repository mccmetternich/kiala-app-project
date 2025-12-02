'use client';

import { useState, useEffect } from 'react';
import { Star, Shield, Truck, CheckCircle, Gift, BadgeCheck, Clock } from 'lucide-react';
import { useTracking } from '@/contexts/TrackingContext';
import { trackInitiateCheckout } from '@/lib/meta-pixel';

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
  benefitsRow2?: string[];
  // Individual benefit fields (new approach)
  benefit1?: string;
  benefit2?: string;
  benefit3?: string;
  benefit4?: string;
  benefit5?: string;
  benefit6?: string;
  ctaText?: string;
  ctaUrl?: string;
  target?: '_self' | '_blank';
  guaranteeText?: string;
  // Doctor header props
  doctorName?: string;
  doctorImage?: string;
  badges?: string[];
  badgeText?: string; // Single badge text for admin editor
  // Testimonial props (editable)
  testimonialQuote?: string;
  testimonialName?: string;
  testimonialAvatar?: string;
  showTestimonial?: boolean;
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

const defaultBenefits = [
  'Clinically-backed hormone support formula',
  '90-day transformation protocol',
  'Complete meal plan & recipes',
  'Weekly coaching video series',
  'Private community access'
];

const defaultBenefitsRow2: string[] = [];

export default function ShopNowWidget({
  productName = 'Complete Hormone Reset',
  description = 'The all-in-one solution for naturally balancing your hormones and boosting your metabolism after 40.',
  images = defaultImages,
  rating = 4.7,
  reviewCount = 1200000,
  lovedByCount = '1,000,000+',
  pricingOptions = defaultPricingOptions,
  benefits = defaultBenefits,
  benefitsRow2 = defaultBenefitsRow2,
  // Individual benefit fields
  benefit1,
  benefit2,
  benefit3,
  benefit4,
  benefit5,
  benefit6,
  ctaText = 'START NOW',
  ctaUrl = '#',
  target = '_self',
  guaranteeText = '90-Day Money-Back Guarantee',
  doctorName = 'Dr. Amy',
  doctorImage = '',
  badges = ['#1 BEST SELLER'],
  badgeText,
  testimonialQuote = 'This completely changed my energy levels and mood. I feel like myself again after just 3 weeks!',
  testimonialName = 'Sarah M., 47',
  testimonialAvatar = '',
  showTestimonial = true
}: ShopNowWidgetProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedOption, setSelectedOption] = useState(
    pricingOptions.find(opt => opt.popular)?.id || pricingOptions[1]?.id || pricingOptions[0].id
  );
  const { appendTracking } = useTracking();

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

  // Dr Header Component (like ExclusiveProductCard) - with avatar and countdown only
  const DrHeader = () => (
    <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-purple-600 text-white rounded-t-2xl p-3 md:p-4">
      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {doctorImage && (
              <img
                src={doctorImage}
                alt={doctorName}
                className="w-10 h-10 rounded-full border-2 border-white shadow-lg flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <BadgeCheck className="w-4 h-4 text-amber-300 flex-shrink-0" />
                <span className="font-bold text-sm truncate">{doctorName}'s #1 Pick</span>
              </div>
              <p className="text-primary-100 text-xs">Personally vetted & recommended</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur px-2 py-1 rounded-full">
            <Clock className="w-3 h-3 text-amber-300" />
            <span className="text-xs font-semibold">
              {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between">
        <div className="flex items-center gap-3">
          {doctorImage && (
            <img
              src={doctorImage}
              alt={doctorName}
              className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
            />
          )}
          <div>
            <div className="flex items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-amber-300" />
              <span className="font-bold">{doctorName}'s #1 Pick</span>
            </div>
            <p className="text-primary-100 text-sm">Personally vetted & recommended</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur px-3 py-1.5 rounded-full">
          <Clock className="w-3.5 h-3.5 text-amber-300" />
          <span className="text-xs font-semibold">
            {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-xs text-primary-100">left</span>
        </div>
      </div>
    </div>
  );

  // Rating Section (below community exclusive badge)
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

  // Image Gallery (without badges on image)
  const ImageGallery = () => (
    <>
      <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-white shadow-md group cursor-pointer">
        <img
          src={images[selectedImage]?.url}
          alt={images[selectedImage]?.alt}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* No badges on image anymore */}
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

  // Benefits Section - uses individual fields if set, otherwise falls back to arrays
  const BenefitsSection = () => {
    // Check if individual benefit fields are used
    const hasIndividualBenefits = benefit1 || benefit2 || benefit3 || benefit4 || benefit5 || benefit6;

    if (hasIndividualBenefits) {
      // Use individual benefit fields in 3 rows x 2 columns
      const benefitRows = [
        [benefit1, benefit2],
        [benefit3, benefit4],
        [benefit5, benefit6]
      ];

      return (
        <div className="space-y-3">
          {benefitRows.map((row, rowIdx) => (
            <div key={rowIdx} className="grid grid-cols-2 gap-3">
              {row.map((benefit, colIdx) => benefit && (
                <div key={colIdx} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    }

    // Fallback to legacy array format
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700 text-sm">{benefit}</span>
            </div>
          ))}
        </div>
        {benefitsRow2 && benefitsRow2.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {benefitsRow2.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Helper to calculate total savings: (originalPrice - price) + sum of gift values
  const calculateSavings = (option: PricingOption) => {
    const priceSavings = option.originalPrice - option.price;
    const giftSavings = option.gifts?.reduce((sum, gift) => {
      // Parse gift value like "$10.00" to number
      const value = parseFloat(gift.value.replace(/[^0-9.]/g, '')) || 0;
      return sum + value;
    }, 0) || 0;
    return priceSavings + giftSavings;
  };

  const PricingSection = () => (
    <div className="space-y-1.5">
      {pricingOptions.map((option) => {
        const totalSavings = calculateSavings(option);
        // Use badge text if provided, otherwise check popular flag for backward compatibility
        const badgeText = option.badge || (option.popular ? 'MOST POPULAR' : null);

        return (
          <label
            key={option.id}
            className={`relative block px-3 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${
              selectedOption === option.id
                ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                : badgeText
                  ? 'border-purple-300 bg-purple-50/50'
                  : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Badge ribbon - floated right above pricing */}
            {badgeText && (
              <div className="absolute -top-2.5 right-3">
                <span className="bg-gradient-to-r from-primary-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  {badgeText}
                </span>
              </div>
            )}
            <input
              type="radio"
              name="pricing"
              value={option.id}
              checked={selectedOption === option.id}
              onChange={() => setSelectedOption(option.id)}
              className="sr-only"
            />
            <div className={`flex items-center ${badgeText ? 'mt-1' : ''}`}>
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
                  <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">Save ${totalSavings}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900">${option.price}</div>
                <div className="text-sm text-gray-400 line-through">${option.originalPrice}</div>
              </div>
            </div>
            {option.gifts && option.gifts.length > 0 && (
              <div className="ml-9 flex flex-wrap gap-x-3 gap-y-0">
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
        );
      })}
    </div>
  );

  const CTASection = () => {
    const baseUrl = ctaUrl.includes('?')
      ? `${ctaUrl}&option=${selectedOption}`
      : `${ctaUrl}?option=${selectedOption}`;
    const trackedUrl = appendTracking(baseUrl);

    const handleCTAClick = () => {
      // Fire InitiateCheckout event with product details
      trackInitiateCheckout({
        content_name: productName,
        content_category: 'product',
        content_ids: [selectedOption],
        value: currentOption.price,
        currency: 'USD',
        num_items: currentOption.quantity
      });
    };

    return (
    <>
      <a
        href={trackedUrl}
        target={target}
        onClick={handleCTAClick}
        className="block w-full bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-xl text-lg text-center transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
      >
        {ctaText} ${currentOption.price}
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

  // Testimonial Section (editable) - simple border, no quote icon
  const TestimonialSection = () => (
    showTestimonial && testimonialQuote && (
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        {/* Testimonial content */}
        <p className="text-gray-700 italic text-sm leading-relaxed mb-3">
          "{testimonialQuote}"
        </p>

        {/* Avatar and name */}
        <div className="flex items-center gap-3">
          {testimonialAvatar && (
            <img
              src={testimonialAvatar}
              alt={testimonialName}
              className="w-10 h-10 rounded-full object-cover border-2 border-primary-200"
            />
          )}
          <div>
            <p className="font-semibold text-gray-900 text-sm">{testimonialName}</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-3 h-3 fill-current text-amber-400" />
              ))}
              <span className="text-xs text-green-600 font-medium ml-1">Verified Buyer</span>
            </div>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="my-6">
      {/* Dr Header with countdown and badge */}
      <DrHeader />

      {/* Main Card */}
      <div className="bg-white rounded-b-2xl shadow-xl overflow-hidden border-2 border-t-0 border-primary-200">
        {/* Mobile Layout - Specific order */}
        <div className="md:hidden p-4 space-y-5">
          {/* 1. Rating, review count, and Join copy */}
          <div className="text-center">
            <RatingSection />
            <p className="text-primary-600 font-medium mt-2">
              Join {lovedByCount} women who've made Kiala Greens their daily wellness ritual
            </p>
          </div>

          {/* 3. Main image and carousel */}
          <ImageGallery />

          {/* 4. Product description */}
          <p className="text-gray-600 text-center">
            {description}
          </p>

          {/* 5. Benefits with checkmarks (2 rows) */}
          <BenefitsSection />

          {/* 6. Testimonial */}
          <TestimonialSection />

          {/* 7. Select packages */}
          <PricingSection />

          {/* 8. CTA with icons */}
          <CTASection />
        </div>

        {/* Desktop Layout - 2 column grid */}
        <div className="hidden md:grid md:grid-cols-2 gap-0">
          {/* Left: Image Gallery + Benefits + Testimonial */}
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
    </div>
  );
}
