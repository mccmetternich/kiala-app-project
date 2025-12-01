'use client';

interface TestimonialHeroNoCtaProps {
  image?: string;
  title?: string;
  body?: string;
}

export default function TestimonialHeroNoCta({
  image = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=800&fit=crop&crop=face',
  title = 'I Lost 22 lbs and My Energy is Through the Roof!',
  body = `"At 52, I thought feeling tired and bloated was just part of getting older. I tried everything—different diets, expensive supplements, even considered medications. Nothing worked until I found Kiala Greens.

Within the first week, my bloating was GONE. By week 4, I had more energy than I'd felt in years. And now, 8 weeks later? I've lost 22 pounds—most of it from my midsection—and I feel like I'm in my 30s again.

If you're on the fence, just try it. The 90-day guarantee means you have nothing to lose (except the weight!). This has honestly changed my life."

— Jennifer M., 52, Austin TX`
}: TestimonialHeroNoCtaProps) {
  return (
    <div className="my-8 bg-gradient-to-br from-primary-50 via-white to-purple-50 rounded-2xl overflow-hidden shadow-xl">
      <div className="grid md:grid-cols-2 gap-0">
        {/* Left - Large Image */}
        <div className="relative h-64 md:h-auto">
          <img
            src={image}
            alt="Customer testimonial"
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay for mobile */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent md:hidden" />
        </div>

        {/* Right - Content */}
        <div className="p-6 md:p-8 lg:p-10 flex flex-col justify-center">
          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
            {title}
          </h2>

          {/* Body - Testimonial Quote */}
          <div className="text-gray-700 whitespace-pre-line text-sm md:text-base leading-relaxed">
            {body}
          </div>
        </div>
      </div>
    </div>
  );
}
