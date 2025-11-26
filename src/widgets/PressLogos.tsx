'use client';

interface PressItem {
  logo: string;
  publication: string;
  quote: string;
}

interface PressLogosProps {
  headline?: string;
  items?: PressItem[];
}

// Default items - these should be replaced with uploaded images in admin
const defaultItems: PressItem[] = [
  {
    logo: '',
    publication: 'Forbes',
    quote: '"A game-changer for women\'s health"'
  },
  {
    logo: '',
    publication: 'Vogue',
    quote: '"The greens powder that\'s taking over wellness"'
  },
  {
    logo: '',
    publication: 'Cosmopolitan',
    quote: '"The viral supplement that actually works"'
  },
  {
    logo: '',
    publication: 'Elle',
    quote: '"Every woman over 40 needs this"'
  },
  {
    logo: '',
    publication: 'Today Show',
    quote: '"The wellness trend doctors are recommending"'
  },
  {
    logo: '',
    publication: 'Glamour',
    quote: '"Backed by science, loved by women"'
  }
];

export default function PressLogos({
  headline = 'As Featured In',
  items = defaultItems
}: PressLogosProps) {
  return (
    <div className="my-8 py-10 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
      {/* Header */}
      {headline && (
        <h2 className="text-center text-base font-semibold text-gray-600 uppercase tracking-wider mb-10">
          {headline}
        </h2>
      )}

      {/* 2 columns x 3 rows grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8 max-w-4xl mx-auto">
        {items.slice(0, 6).map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow group"
          >
            {/* Logo - uploadable image */}
            <div className="h-16 md:h-20 flex items-center justify-center mb-4 grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300">
              {item.logo ? (
                <img
                  src={item.logo}
                  alt={item.publication}
                  className="max-h-full max-w-[180px] object-contain"
                />
              ) : (
                <span className="text-2xl md:text-3xl font-bold text-gray-400 uppercase tracking-wider">{item.publication}</span>
              )}
            </div>

            {/* Quote - larger text */}
            <p className="text-sm md:text-base text-gray-700 italic leading-relaxed font-medium">
              {item.quote}
            </p>

            {/* Publication name */}
            <p className="text-xs text-gray-500 mt-2 font-semibold uppercase tracking-wide">
              — {item.publication}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
