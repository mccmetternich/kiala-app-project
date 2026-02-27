'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, CheckCircle, Users, Book, Heart } from 'lucide-react';
import TrackedLink from '@/components/TrackedLink';
import EmailCapture from '@/widgets/EmailCapture';

interface SophisticatedHomepageProps {
  site: any;
  siteId: string;
}

export default function SophisticatedHomepage({ site, siteId }: SophisticatedHomepageProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const brand = site?.brand || {};
  const settings = site?.settings || {};

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Hero Section - Goop-inspired minimal elegance */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-secondary-50 to-secondary-100">
        <div 
          className="absolute inset-0 opacity-40" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f7f3f0' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
        
        <div className="relative container mx-auto px-4 py-16 sm:py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            
            {/* Left Side - Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-accent-100 text-accent-800 px-4 py-2 rounded-full text-sm font-medium tracking-wide">
                <Sparkles className="w-4 h-4" />
                <span>Evidence-Based Wellness</span>
              </div>
              
              <div className="space-y-6">
                <h1 className="goop-heading text-3xl sm:text-4xl lg:text-6xl leading-tight">
                  Discover Your
                  <br />
                  <span className="italic text-accent-700">Sophisticated</span>
                  <br />
                  Wellness Journey
                </h1>
                
                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-lg">
                  {brand.bio || "Where ancient wisdom meets modern science. Curated protocols for the discerning woman who values both elegance and efficacy."}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <TrackedLink 
                  href={`/site/${siteId}/articles`}
                  className="goop-button inline-flex items-center gap-3 justify-center"
                  widgetType="hero-cta"
                  widgetName="explore-wellness"
                >
                  <span>Explore Wellness</span>
                  <ArrowRight className="w-5 h-5" />
                </TrackedLink>
                
                <TrackedLink 
                  href={`/site/${siteId}/about`}
                  className="goop-button-secondary inline-flex items-center gap-3 justify-center"
                  widgetType="hero-cta" 
                  widgetName="our-approach"
                >
                  <span>Our Approach</span>
                </TrackedLink>
              </div>

              {/* Trust Indicators - Mobile Optimized */}
              <div className="grid grid-cols-3 gap-4 sm:flex sm:items-center sm:gap-8 pt-8">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-semibold text-primary-900">47.5K+</div>
                  <div className="text-xs sm:text-sm text-gray-600 uppercase tracking-wider">Women Empowered</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-semibold text-primary-900">12</div>
                  <div className="text-xs sm:text-sm text-gray-600 uppercase tracking-wider">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-semibold text-primary-900">98%</div>
                  <div className="text-xs sm:text-sm text-gray-600 uppercase tracking-wider">Client Satisfaction</div>
                </div>
              </div>
            </div>

            {/* Right Side - Elegant Visual */}
            <div className="relative">
              <div className="aspect-[4/5] relative">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-100 to-secondary-200 rounded-lg shadow-2xl"></div>
                <img
                  src={brand.aboutImage || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=800&fit=crop"}
                  alt={brand.name || "Wellness Authority"}
                  className="absolute inset-4 w-auto h-auto object-cover rounded-sm"
                />
                {/* Floating testimonial - Mobile Responsive */}
                <div className="absolute -bottom-4 sm:-bottom-8 -left-4 sm:-left-8 bg-white p-4 sm:p-6 rounded-sm shadow-xl max-w-xs sm:max-w-sm">
                  <blockquote className="text-xs sm:text-sm text-gray-700 italic mb-2 sm:mb-3">
                    "{brand.quote || 'The sophisticated approach to wellness I\'ve been searching for.'}"
                  </blockquote>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full" alt="" />
                    <div>
                      <div className="font-medium text-xs sm:text-sm">Sarah M.</div>
                      <div className="text-xs text-gray-500">Wellness Enthusiast</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <div className="space-y-6">
              <h2 className="goop-heading text-2xl sm:text-3xl lg:text-5xl">
                Our <span className="italic">Philosophy</span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                True wellness transcends trends. It's found in the thoughtful curation of practices that honor both your body's wisdom and scientific rigor.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Book className="w-8 h-8" />,
                  title: "Evidence-Based",
                  description: "Every recommendation is backed by peer-reviewed research and clinical experience."
                },
                {
                  icon: <Heart className="w-8 h-8" />,
                  title: "Holistic Approach", 
                  description: "We consider your entire wellbeing—mind, body, and spirit—in our protocols."
                },
                {
                  icon: <Users className="w-8 h-8" />,
                  title: "Community-Driven",
                  description: "Join a sophisticated community of women committed to intentional living."
                }
              ].map((item, index) => (
                <div key={index} className="elegant-card text-center space-y-4">
                  <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto text-accent-700">
                    {item.icon}
                  </div>
                  <h3 className="goop-heading text-xl">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section - Sophisticated */}
      <section className="py-20 sophisticated-gradient">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-6">
              <h2 className="goop-heading text-2xl sm:text-3xl lg:text-5xl">
                Join Our <span className="italic">Circle</span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                Receive curated wellness insights, exclusive protocols, and invitations to our intimate community events.
              </p>
            </div>

            <EmailCapture
              headline="The Sophisticated Woman's Guide to Wellness"
              subheading="Access evidence-based protocols for modern women seeking elegant solutions to health and vitality."
              ctaText="Join the Circle"
              siteId={siteId}
              style="sophisticated"
              incentive="Exclusive wellness guide included"
            />

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent-600" />
                <span>Curated Content Only</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent-600" />
                <span>No Spam, Ever</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent-600" />
                <span>Unsubscribe Anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Content Preview */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-6 mb-16">
              <h2 className="goop-heading text-2xl sm:text-3xl lg:text-5xl">
                Latest <span className="italic">Wellness</span> Insights
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                Thoughtfully curated content to elevate your wellness journey.
              </p>
            </div>

            {/* This will be replaced with actual article grid */}
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((item) => (
                <article key={item} className="goop-card group cursor-pointer">
                  <div className="aspect-[4/3] bg-secondary-100 mb-6">
                    <img 
                      src={`https://images.unsplash.com/photo-${1560707303 + item}?w=400&h=300&fit=crop`}
                      alt="Article preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6 space-y-4">
                    <h3 className="goop-heading text-xl group-hover:text-accent-700 transition-colors">
                      The Art of Mindful Wellness
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Discover the intersection of science and intuition in your daily wellness practice.
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-secondary-200">
                      <span className="text-xs text-gray-500 uppercase tracking-wider">5 min read</span>
                      <ArrowRight className="w-4 h-4 text-accent-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="text-center mt-12">
              <TrackedLink 
                href={`/site/${siteId}/articles`}
                className="goop-button-secondary inline-flex items-center gap-3"
                widgetType="content-preview"
                widgetName="view-all-articles"
              >
                <span>View All Articles</span>
                <ArrowRight className="w-5 h-5" />
              </TrackedLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}