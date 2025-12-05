interface Site {
  id: string;
  name: string;
  domain: string;
  subdomain: string;
  theme: string;
  settings: any;
  brand_profile: any;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Article {
  id: string;
  site_id: string;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  category: string;
  image: string;
  featured: boolean;
  trending: boolean;
  published: boolean;
  read_time: number;
  views: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export async function getSiteBySubdomain(subdomain: string, publishedOnly = false): Promise<Site | null> {
  try {
    const url = publishedOnly
      ? `/api/sites?subdomain=${subdomain}&publishedOnly=true`
      : `/api/sites?subdomain=${subdomain}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    return data.site || null;
  } catch (error) {
    console.error('Error fetching site:', error);
    return null;
  }
}

export async function getArticlesBySite(siteId: string, published = true): Promise<Article[]> {
  try {
    const response = await fetch(`/api/articles?siteId=${siteId}&published=${published}`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

export async function getArticleBySlug(siteId: string, slug: string): Promise<Article | null> {
  try {
    const response = await fetch(`/api/articles?siteId=${siteId}&slug=${slug}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.article || null;
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

// Client-side versions for use in components
export const clientAPI = {
  async getSiteBySubdomain(subdomain: string, publishedOnly = false) {
    const url = publishedOnly
      ? `/api/sites?subdomain=${subdomain}&publishedOnly=true`
      : `/api/sites?subdomain=${subdomain}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch site');
    const data = await response.json();
    return data.site;
  },

  async getAllSites() {
    const response = await fetch(`/api/sites`);
    if (!response.ok) throw new Error('Failed to fetch sites');
    const data = await response.json();
    return data.sites || [];
  },

  async getAllArticles() {
    const response = await fetch(`/api/articles`);
    if (!response.ok) throw new Error('Failed to fetch articles');
    const data = await response.json();
    return data.articles || [];
  },

  async getArticlesBySite(siteId: string, published = true) {
    const response = await fetch(`/api/articles?siteId=${siteId}&published=${published}`);
    if (!response.ok) throw new Error('Failed to fetch articles');
    const data = await response.json();
    return data.articles;
  },

  async getArticleBySlug(siteId: string, slug: string) {
    const response = await fetch(`/api/articles?siteId=${siteId}&slug=${slug}`);
    if (!response.ok) throw new Error('Failed to fetch article');
    const data = await response.json();
    return data.article;
  }
};