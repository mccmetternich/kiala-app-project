'use client';

import { useEffect, useRef } from 'react';
import TrackedLink from '@/components/TrackedLink';

interface ImageColumn {
  images: string[];
}

interface ScrollingThumbnailsProps {
  headline?: string;
  columns?: ImageColumn[];
  customImages?: string[]; // Array of uploaded image URLs
  speed?: number;
  imageHeight?: number;
  // Optional CTA
  showCta?: boolean;
  ctaText?: string;
  ctaUrl?: string;
  target?: '_self' | '_blank';
  widgetId?: string;
}

// Known working women's face images from Unsplash
const womenFaces = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1464863979621-258859e62245?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&h=150&fit=crop&crop=face'
];

// Generate columns from uploaded images only (no stock photos)
function generateColumns(customImages: string[] = [], imagesPerColumn: number = 3): ImageColumn[] {
  // If no custom images, fall back to stock photos
  const imagesToUse = customImages.length > 0 ? customImages : womenFaces;

  // Calculate number of columns based on images available
  const columnCount = Math.max(5, Math.ceil(imagesToUse.length / imagesPerColumn));

  // Generate columns by cycling through available images
  return Array(columnCount).fill(null).map((_, colIndex) => ({
    images: Array(imagesPerColumn).fill(null).map((_, imgIndex) => {
      const imageIndex = (colIndex * imagesPerColumn + imgIndex) % imagesToUse.length;
      return imagesToUse[imageIndex];
    })
  }));
}

// Default columns using stock photos (only shown when no custom images uploaded)
const defaultColumns: ImageColumn[] = generateColumns([], 3);

export default function ScrollingThumbnails({
  headline = 'Join 1,000,000+ Happy Customers',
  columns,
  customImages = [],
  speed = 30,
  imageHeight = 200,
  showCta = false,
  ctaText = 'Join Them →',
  ctaUrl = '#',
  target = '_self',
  widgetId
}: ScrollingThumbnailsProps) {
  // Force minimum size of 200px (overrides any smaller saved values)
  const actualImageHeight = Math.max(200, imageHeight || 200);

  // Use provided columns, or generate from customImages (only uploaded images), or use defaults
  const displayColumnsData = columns || generateColumns(customImages, 3);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    let scrollPosition = 0;

    const animate = () => {
      scrollPosition += 0.5;

      // Reset when we've scrolled half the width (since we duplicate the content)
      const halfWidth = scrollContainer.scrollWidth / 2;
      if (scrollPosition >= halfWidth) {
        scrollPosition = 0;
      }

      scrollContainer.style.transform = `translateX(-${scrollPosition}px)`;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [speed]);

  // Duplicate columns for seamless loop
  const displayColumns = [...displayColumnsData, ...displayColumnsData];

  return (
    <div className="my-8 overflow-hidden bg-gradient-to-r from-primary-50 via-white to-purple-50 rounded-2xl py-8">
      {/* Header */}
      {headline && (
        <h2 className="text-center text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          {headline}
        </h2>
      )}

      {/* Scrolling Container */}
      <div className="relative overflow-hidden">
        {/* Gradient Overlays for fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-primary-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-purple-50 to-transparent z-10 pointer-events-none" />

        {/* Scrolling Content */}
        <div
          ref={scrollRef}
          className="flex gap-3"
          style={{ willChange: 'transform' }}
        >
          {displayColumns.map((column, colIndex) => {
            // Stagger columns by applying different top margins based on column index
            // Creates a wave-like visual effect across the scrolling thumbnails
            const staggerOffsets = [0, 40, 20, 60, 10, 50, 30]; // Pattern repeats
            const topOffset = staggerOffsets[colIndex % staggerOffsets.length];

            return (
              <div
                key={colIndex}
                className="flex flex-col gap-3 flex-shrink-0"
                style={{ marginTop: topOffset }}
              >
                {column.images.map((image, imgIndex) => (
                  <div
                    key={imgIndex}
                    className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                    style={{ width: actualImageHeight, height: actualImageHeight }}
                  >
                    <img
                      src={image}
                      alt={`Customer ${colIndex * 3 + imgIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Optional CTA */}
      {showCta && ctaText && ctaUrl && (
        <div className="mt-6 text-center">
          <TrackedLink
            href={ctaUrl}
            target={target}
            widgetType="scrolling-thumbnails"
            widgetId={widgetId}
            widgetName={headline}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-bold text-lg py-4 px-10 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {ctaText}
          </TrackedLink>
        </div>
      )}
    </div>
  );
}
