'use client';

import { useState } from 'react';
import { Search, Filter, Calendar, Clock, ArrowRight, Star } from 'lucide-react';
import TrackedLink from '@/components/TrackedLink';

interface SophisticatedArticlesProps {
  articles: any[];
  site: any;
  siteId: string;
}

export default function SophisticatedArticles({ articles, site, siteId }: SophisticatedArticlesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const brand = site?.brand || {};
  const settings = site?.settings || {};

  // Get unique categories from articles
  const categories = ['all', ...new Set(articles.map(article => article.category).filter(Boolean))];

  // Filter articles
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get featured article (first article or one marked as featured)
  const featuredArticle = articles.find(article => article.featured) || articles[0];
  const otherArticles = filteredArticles.filter(article => article.id !== featuredArticle?.id);

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="py-16 lg:py-24 sophisticated-gradient border-b border-secondary-200/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-accent-100 text-accent-800 px-4 py-2 rounded-full text-sm font-medium tracking-wide">
                <Star className="w-4 h-4" />
                <span>Curated Wellness Content</span>
              </div>
              
              <h1 className="goop-heading text-3xl sm:text-4xl lg:text-6xl leading-tight">
                Wellness <span className="italic">Journal</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                Thoughtfully curated insights at the intersection of ancient wisdom and modern science. 
                Each piece is crafted to elevate your understanding of sophisticated wellness.
              </p>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search wellness insights..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="goop-input w-full pl-10"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="goop-input pl-10 pr-8 appearance-none cursor-pointer"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Topics' : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      {featuredArticle && (
        <section className="py-16 lg:py-20 bg-white border-b border-secondary-100">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="goop-heading text-3xl lg:text-4xl mb-4">
                  Featured <span className="italic">Insight</span>
                </h2>
              </div>
              
              <TrackedLink
                href={`/site/${siteId}/articles/${featuredArticle.slug}`}
                className="block group"
                widgetType="featured-article"
                widgetName={featuredArticle.title}
              >
                <div className="grid lg:grid-cols-2 gap-12 items-center p-8 border border-secondary-200/40 rounded-lg hover:border-accent-200/60 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-white via-secondary-50/30 to-white">
                  <div className="aspect-[5/4] relative overflow-hidden bg-secondary-100">
                    <img
                      src={featuredArticle.image || "https://images.unsplash.com/photo-1560707303-3df363006833?w=600&h=480&fit=crop"}
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=480&fit=crop';
                      }}
                    />
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="bg-accent-100 text-accent-800 px-3 py-1 rounded-full uppercase tracking-wider font-medium">
                          {featuredArticle.category || 'Wellness'}
                        </span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(featuredArticle.published_date || featuredArticle.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{featuredArticle.read_time || 5} min read</span>
                        </div>
                      </div>
                      
                      <h3 className="goop-heading text-3xl lg:text-4xl group-hover:text-accent-700 transition-colors">
                        {featuredArticle.title}
                      </h3>
                      
                      <p className="text-lg text-gray-600 leading-relaxed">
                        {featuredArticle.excerpt || 'Discover sophisticated insights for your wellness journey...'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3 text-accent-700 group-hover:gap-4 transition-all">
                      <span className="font-medium uppercase tracking-wider text-sm">Read Full Article</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </TrackedLink>
            </div>
          </div>
        </section>
      )}

      {/* Articles Grid */}
      <section className="py-16 lg:py-20 bg-gradient-to-b from-secondary-50/30 via-white to-secondary-50/20">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            
            {otherArticles.length > 0 && (
              <div className="text-center mb-12">
                <h2 className="goop-heading text-3xl lg:text-4xl">
                  All <span className="italic">Articles</span>
                </h2>
              </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherArticles.map((article) => (
                <TrackedLink
                  key={article.id}
                  href={`/site/${siteId}/articles/${article.slug}`}
                  className="block group"
                  widgetType="article-card"
                  widgetName={article.title}
                >
                  <article className="goop-card h-full border border-secondary-200/30 hover:border-accent-200/50 transition-all duration-300 hover:shadow-xl">
                    <div className="aspect-[4/3] bg-secondary-100 mb-6 overflow-hidden">
                      <img
                        src={article.image || 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop'}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop';
                        }}
                      />
                    </div>
                    
                    <div className="p-6 space-y-4 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="bg-accent-100 text-accent-800 px-2 py-1 rounded-full uppercase tracking-wider font-medium">
                          {article.category || 'Wellness'}
                        </span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(article.published_date || article.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <h3 className="goop-heading text-xl group-hover:text-accent-700 transition-colors flex-1">
                        {article.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                        {article.excerpt || 'Explore sophisticated wellness insights...'}
                      </p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-secondary-200">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{article.read_time || 5} min read</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-accent-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </article>
                </TrackedLink>
              ))}
            </div>

            {/* No articles message */}
            {filteredArticles.length === 0 && (
              <div className="text-center py-16">
                <div className="space-y-4">
                  <h3 className="goop-heading text-2xl text-gray-600">
                    No articles found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search terms or filters
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                    className="goop-button-secondary"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 lg:py-20 sophisticated-gradient border-t border-secondary-200/50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-6">
              <h2 className="goop-heading text-3xl lg:text-4xl">
                Never Miss an <span className="italic">Insight</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Join our sophisticated community for curated wellness content delivered thoughtfully to your inbox.
              </p>
            </div>

            <div className="relative">
              <TrackedLink
                href="#newsletter"
                className="goop-button inline-flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300"
                widgetType="newsletter-cta"
                widgetName="join-newsletter"
              >
                <span>Join Our Circle</span>
                <ArrowRight className="w-5 h-5" />
              </TrackedLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}