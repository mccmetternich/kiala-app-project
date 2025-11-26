'use client';

import { useEffect, useRef } from 'react';

interface ImageColumn {
  images: string[];
}

interface ScrollingThumbnailsProps {
  headline?: string;
  columns?: ImageColumn[];
  speed?: number;
  imageHeight?: number;
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

// Generate 15 columns with rotating images (all verified working women faces)
const betterDefaults: ImageColumn[] = Array(15).fill(null).map((_, colIndex) => ({
  images: [
    womenFaces[(colIndex * 3) % womenFaces.length],
    womenFaces[(colIndex * 3 + 1) % womenFaces.length],
    womenFaces[(colIndex * 3 + 2) % womenFaces.length]
  ]
}));

export default function ScrollingThumbnails({
  headline = 'Join 1,000,000+ Happy Customers',
  columns = betterDefaults,
  speed = 30,
  imageHeight = 100
}: ScrollingThumbnailsProps) {
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
  const displayColumns = [...columns, ...columns];

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
          {displayColumns.map((column, colIndex) => (
            <div
              key={colIndex}
              className="flex flex-col gap-3 flex-shrink-0"
            >
              {column.images.map((image, imgIndex) => (
                <div
                  key={imgIndex}
                  className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                  style={{ width: imageHeight, height: imageHeight }}
                >
                  <img
                    src={image}
                    alt={`Customer ${colIndex * 3 + imgIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
