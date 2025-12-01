'use client';

import { useEffect, useRef } from 'react';

interface ImageColumn {
  images: string[];
}

interface ScrollingThumbnailsProps {
  headline?: string;
  columns?: ImageColumn[];
  customImages?: string[]; // Array of uploaded image URLs
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

// Generate columns from a list of images (custom + stock as needed)
function generateColumns(customImages: string[] = [], columnCount: number = 15, imagesPerColumn: number = 3): ImageColumn[] {
  // Combine custom images with stock photos to fill gaps
  const totalImagesNeeded = columnCount * imagesPerColumn;
  const allImages: string[] = [];

  // Add custom images first
  if (customImages.length > 0) {
    allImages.push(...customImages);
  }

  // Fill remaining slots with stock photos (cycling through them)
  let stockIndex = 0;
  while (allImages.length < totalImagesNeeded) {
    allImages.push(womenFaces[stockIndex % womenFaces.length]);
    stockIndex++;
  }

  // Shuffle the combined array for variety (but keep custom images prominent)
  // We'll interleave custom and stock rather than pure shuffle
  const shuffled: string[] = [];
  const customCount = customImages.length;
  const stockCount = allImages.length - customCount;

  if (customCount > 0) {
    // Interleave custom images throughout
    const customInterval = Math.max(1, Math.floor(totalImagesNeeded / customCount));
    let customIdx = 0;
    let stockIdx = customCount;

    for (let i = 0; i < totalImagesNeeded; i++) {
      if (customIdx < customCount && (i % customInterval === 0 || stockIdx >= allImages.length)) {
        shuffled.push(allImages[customIdx]);
        customIdx++;
      } else if (stockIdx < allImages.length) {
        shuffled.push(allImages[stockIdx]);
        stockIdx++;
      }
    }
  } else {
    shuffled.push(...allImages);
  }

  // Generate columns from the shuffled images
  return Array(columnCount).fill(null).map((_, colIndex) => ({
    images: [
      shuffled[(colIndex * imagesPerColumn) % shuffled.length],
      shuffled[(colIndex * imagesPerColumn + 1) % shuffled.length],
      shuffled[(colIndex * imagesPerColumn + 2) % shuffled.length]
    ]
  }));
}

// Default columns using only stock photos
const defaultColumns: ImageColumn[] = generateColumns([], 15, 3);

export default function ScrollingThumbnails({
  headline = 'Join 1,000,000+ Happy Customers',
  columns,
  customImages = [],
  speed = 30,
  imageHeight = 100
}: ScrollingThumbnailsProps) {
  // Use provided columns, or generate from customImages, or use defaults
  const displayColumnsData = columns || generateColumns(customImages, 15, 3);
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
