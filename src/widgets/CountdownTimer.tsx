'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, Truck, Star } from 'lucide-react';
import TrackedLink from '@/components/TrackedLink';

interface CountdownTimerProps {
  endDate?: string;
  message?: string;
  urgencyText?: string;
  productImage?: string;
  productName?: string;
  productDescription?: string;
  originalPrice?: string;
  salePrice?: string;
  ctaText?: string;
  ctaUrl?: string;
  ctaType?: 'external' | 'anchor';
  target?: '_self' | '_blank';
  benefits?: string[];
  widgetId?: string;
}

export default function CountdownTimer({
  endDate,
  message = 'Flash Sale - 40% Off Today Only!',
  urgencyText = 'Offer expires in:',
  productImage = 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop',
  productName = 'Hormone Balance Complete Kit',
  productDescription = 'Everything you need to start your hormone reset journey. Includes supplements, meal guide, and exclusive access to our community.',
  originalPrice = '$147',
  salePrice = '$89',
  ctaText = 'Claim Your Discount Now',
  ctaUrl = '#',
  ctaType = 'external',
  target = '_self',
  benefits = ['Free Shipping', '60-Day Guarantee', '24/7 Support'],
  widgetId
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!endDate) {
      // Start with a fixed time that counts down
      const fakeEndDate = new Date();
      fakeEndDate.setDate(fakeEndDate.getDate() + 2);
      fakeEndDate.setHours(fakeEndDate.getHours() + 14);
      fakeEndDate.setMinutes(fakeEndDate.getMinutes() + 30);

      const calculateTimeLeft = () => {
        const difference = +fakeEndDate - +new Date();
        if (difference > 0) {
          setTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
          });
        }
      };

      calculateTimeLeft();
      const timer = setInterval(calculateTimeLeft, 1000);
      return () => clearInterval(timer);
    }

    const calculateTimeLeft = () => {
      const difference = +new Date(endDate) - +new Date();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="bg-gradient-to-br from-primary-50 to-purple-50 border-2 border-primary-300 rounded-2xl overflow-hidden my-6">
      {/* Urgency Header */}
      <div className="bg-gradient-to-r from-primary-500 to-purple-500 text-white py-3 px-4 text-center">
        <p className="text-base font-bold uppercase tracking-wide">{message}</p>
      </div>

      <div className="p-4 md:p-6">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-square relative rounded-xl overflow-hidden shadow-lg">
              <Image
                src={productImage}
                alt={productName}
                fill
                className="object-cover"
              />
              {/* Sale Badge */}
              <div className="absolute top-3 right-3 bg-gradient-to-r from-primary-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                40% OFF
              </div>
            </div>
            {/* Rating */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-1">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-sm text-gray-600 ml-1">(2,847)</span>
            </div>
          </div>

          {/* Product Info & Timer */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{productName}</h3>
            <p className="text-gray-600 mb-4">{productDescription}</p>

            {/* Price */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-bold text-primary-600">{salePrice}</span>
              <span className="text-xl text-gray-400 line-through">{originalPrice}</span>
              <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-sm font-bold">SAVE $58</span>
            </div>

            {/* Countdown Timer */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2 font-medium">{urgencyText}</p>
              <div className="flex gap-2">
                {Object.entries(timeLeft).map(([unit, value]) => (
                  <div key={unit} className="bg-white rounded-lg p-2 min-w-[60px] shadow-sm border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-primary-600">{String(value).padStart(2, '0')}</div>
                    <div className="text-xs text-gray-500 uppercase">{unit}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <TrackedLink
              href={ctaUrl}
              target={target}
              widgetType="countdown-timer"
              widgetId={widgetId}
              widgetName={productName}
              value={parseFloat(salePrice.replace(/[^0-9.]/g, ''))}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl text-base mb-4"
            >
              {ctaText}
              <ArrowRight className="w-5 h-5" />
            </TrackedLink>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  {idx === 0 && <Truck className="w-4 h-4 text-primary-500" />}
                  {idx === 1 && <ShieldCheck className="w-4 h-4 text-primary-500" />}
                  {idx === 2 && <Star className="w-4 h-4 text-primary-500" />}
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
