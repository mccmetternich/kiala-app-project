/**
 * Articles API Integration Tests
 *
 * Tests the /api/articles endpoint for CRUD operations
 */

import { GET, POST } from '@/app/api/articles/route';
import { createQueries } from '@/lib/db-enhanced';

// Mock the database module
jest.mock('@/lib/db-enhanced', () => ({
  createQueries: jest.fn(),
}));

const mockCreateQueries = createQueries as jest.MockedFunction<typeof createQueries>;

describe('Articles API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/articles', () => {
    it('should return all articles when no siteId provided (admin view)', async () => {
      const mockArticles = [
        { id: 'art1', title: 'Article 1', site_id: 'site1' },
        { id: 'art2', title: 'Article 2', site_id: 'site2' },
      ];

      mockCreateQueries.mockReturnValue({
        articleQueries: {
          getAll: jest.fn().mockResolvedValue(mockArticles),
          getAllBySite: jest.fn(),
          getPublishedBySite: jest.fn(),
          getBySlug: jest.fn(),
          getById: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      } as any);

      const request = new Request('http://localhost:3000/api/articles');
      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.articles).toEqual(mockArticles);
      expect(data.articles).toHaveLength(2);
    });

    it('should return articles for a specific site', async () => {
      const mockArticles = [
        { id: 'art1', title: 'Site Article 1', site_id: 'site1' },
        { id: 'art2', title: 'Site Article 2', site_id: 'site1' },
      ];

      mockCreateQueries.mockReturnValue({
        articleQueries: {
          getAllBySite: jest.fn().mockResolvedValue(mockArticles),
          getAll: jest.fn(),
          getPublishedBySite: jest.fn(),
          getBySlug: jest.fn(),
          getById: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      } as any);

      const request = new Request('http://localhost:3000/api/articles?siteId=site1');
      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.articles).toEqual(mockArticles);
    });

    it('should return only published articles when published=true', async () => {
      const mockPublishedArticles = [
        { id: 'art1', title: 'Published Article', published: true },
      ];

      mockCreateQueries.mockReturnValue({
        articleQueries: {
          getPublishedBySite: jest.fn().mockResolvedValue(mockPublishedArticles),
          getAll: jest.fn(),
          getAllBySite: jest.fn(),
          getBySlug: jest.fn(),
          getById: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      } as any);

      const request = new Request('http://localhost:3000/api/articles?siteId=site1&published=true');
      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.articles).toEqual(mockPublishedArticles);
    });

    it('should return single article by slug', async () => {
      const mockArticle = {
        id: 'art1',
        title: 'Specific Article',
        slug: 'specific-article',
        site_id: 'site1',
      };

      mockCreateQueries.mockReturnValue({
        articleQueries: {
          getBySlug: jest.fn().mockResolvedValue(mockArticle),
          getAll: jest.fn(),
          getAllBySite: jest.fn(),
          getPublishedBySite: jest.fn(),
          getById: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      } as any);

      const request = new Request('http://localhost:3000/api/articles?siteId=site1&slug=specific-article');
      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.article).toEqual(mockArticle);
      expect(data.article.slug).toBe('specific-article');
    });

    it('should return null when article not found by slug', async () => {
      mockCreateQueries.mockReturnValue({
        articleQueries: {
          getBySlug: jest.fn().mockResolvedValue(null),
          getAll: jest.fn(),
          getAllBySite: jest.fn(),
          getPublishedBySite: jest.fn(),
          getById: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      } as any);

      const request = new Request('http://localhost:3000/api/articles?siteId=site1&slug=nonexistent');
      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.article).toBeNull();
    });

    it('should return 500 on database error', async () => {
      mockCreateQueries.mockReturnValue({
        articleQueries: {
          getAll: jest.fn().mockRejectedValue(new Error('DB Error')),
          getAllBySite: jest.fn(),
          getPublishedBySite: jest.fn(),
          getBySlug: jest.fn(),
          getById: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      } as any);

      const request = new Request('http://localhost:3000/api/articles');
      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch articles');
    });
  });

  describe('POST /api/articles', () => {
    it('should create a new article with valid data', async () => {
      const newArticle = {
        site_id: 'site1',
        title: 'New Article',
        slug: 'new-article',
        excerpt: 'A new article excerpt',
        content: '<p>Article content</p>',
        category: 'Health',
        published: false,
      };

      const createdArticle = {
        id: 'generated-id',
        ...newArticle,
      };

      mockCreateQueries.mockReturnValue({
        articleQueries: {
          create: jest.fn().mockResolvedValue(undefined),
          getById: jest.fn().mockResolvedValue(createdArticle),
          getAll: jest.fn(),
          getAllBySite: jest.fn(),
          getPublishedBySite: jest.fn(),
          getBySlug: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      } as any);

      const request = new Request('http://localhost:3000/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newArticle),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.article.title).toBe('New Article');
      expect(data.article.slug).toBe('new-article');
    });

    it('should return 400 when required fields are missing', async () => {
      mockCreateQueries.mockReturnValue({
        articleQueries: {
          create: jest.fn(),
          getById: jest.fn(),
          getAll: jest.fn(),
          getAllBySite: jest.fn(),
          getPublishedBySite: jest.fn(),
          getBySlug: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      } as any);

      // Missing site_id
      const request = new Request('http://localhost:3000/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test', slug: 'test' }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('site_id, title, and slug are required');
    });

    it('should return 400 when title is missing', async () => {
      mockCreateQueries.mockReturnValue({
        articleQueries: {
          create: jest.fn(),
          getById: jest.fn(),
          getAll: jest.fn(),
          getAllBySite: jest.fn(),
          getPublishedBySite: jest.fn(),
          getBySlug: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      } as any);

      const request = new Request('http://localhost:3000/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site_id: 'site1', slug: 'test' }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('site_id, title, and slug are required');
    });

    it('should return 500 on creation error', async () => {
      mockCreateQueries.mockReturnValue({
        articleQueries: {
          create: jest.fn().mockRejectedValue(new Error('Duplicate slug')),
          getById: jest.fn(),
          getAll: jest.fn(),
          getAllBySite: jest.fn(),
          getPublishedBySite: jest.fn(),
          getBySlug: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      } as any);

      const request = new Request('http://localhost:3000/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_id: 'site1',
          title: 'Test',
          slug: 'existing-slug',
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create article');
    });
  });
});
