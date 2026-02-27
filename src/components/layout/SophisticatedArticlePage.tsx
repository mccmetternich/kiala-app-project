'use client';

import { Site, Page } from '@/types';
import SiteLayout from '@/components/layout/SiteLayout';
import ArticleTemplate from '@/components/ArticleTemplate';

interface SophisticatedArticlePageProps {
  site: Site;
  articlePage: Page;
  views?: number;
  readTime?: number;
  heroImage?: string;
}

export default function SophisticatedArticlePage({
  site,
  articlePage,
  views,
  readTime,
  heroImage
}: SophisticatedArticlePageProps) {
  return (
    <SiteLayout
      site={site}
      showSidebar={false}
      isArticle={true}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ArticleTemplate
          page={articlePage}
          site={site}
          views={views}
          readTime={readTime}
          heroImage={heroImage}
        />
      </div>
    </SiteLayout>
  );
}