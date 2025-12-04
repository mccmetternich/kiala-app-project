/**
 * Sites API Integration Tests
 *
 * Tests the /api/sites endpoint for CRUD operations
 */

import { createMocks } from 'node-mocks-http';
import { GET, POST } from '@/app/api/sites/route';
import { createQueries } from '@/lib/db-enhanced';

// Mock the database module
jest.mock('@/lib/db-enhanced', () => ({
  createQueries: jest.fn(),
}));

const mockCreateQueries = createQueries as jest.MockedFunction<typeof createQueries>;

describe('Sites API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/sites', () => {
    it('should return all sites when no filters provided', async () => {
      const mockSites = [
        { id: 'site1', name: 'Test Site 1', subdomain: 'test1' },
        { id: 'site2', name: 'Test Site 2', subdomain: 'test2' },
      ];

      mockCreateQueries.mockReturnValue({
        siteQueries: {
          getAll: jest.fn().mockResolvedValue(mockSites),
          getBySubdomain: jest.fn(),
          getByDomain: jest.fn(),
          getById: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      } as any);

      const request = new Request('http://localhost:3000/api/sites');
      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.sites).toEqual(mockSites);
      expect(data.sites).toHaveLength(2);
    });

    it('should return site by subdomain when subdomain param provided', async () => {
      const mockSite = { id: 'site1', name: 'Dr Amy', subdomain: 'dr-amy' };

      mockCreateQueries.mockReturnValue({
        siteQueries: {
          getBySubdomain: jest.fn().mockResolvedValue(mockSite),
          getAll: jest.fn(),
          getByDomain: jest.fn(),
          getById: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      } as any);

      const request = new Request('http://localhost:3000/api/sites?subdomain=dr-amy');
      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.site).toEqual(mockSite);
      expect(data.site.subdomain).toBe('dr-amy');
    });

    it('should return site by domain when domain param provided', async () => {
      const mockSite = { id: 'site1', name: 'Dr Amy', domain: 'dramy.com' };

      mockCreateQueries.mockReturnValue({
        siteQueries: {
          getByDomain: jest.fn().mockResolvedValue(mockSite),
          getBySubdomain: jest.fn(),
          getAll: jest.fn(),
          getById: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      } as any);

      const request = new Request('http://localhost:3000/api/sites?domain=dramy.com');
      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.site).toEqual(mockSite);
    });

    it('should return null when site not found', async () => {
      mockCreateQueries.mockReturnValue({
        siteQueries: {
          getBySubdomain: jest.fn().mockResolvedValue(null),
          getAll: jest.fn(),
          getByDomain: jest.fn(),
          getById: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      } as any);

      const request = new Request('http://localhost:3000/api/sites?subdomain=nonexistent');
      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.site).toBeNull();
    });

    it('should return 500 on database error', async () => {
      mockCreateQueries.mockReturnValue({
        siteQueries: {
          getAll: jest.fn().mockRejectedValue(new Error('Database connection failed')),
          getBySubdomain: jest.fn(),
          getByDomain: jest.fn(),
          getById: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      } as any);

      const request = new Request('http://localhost:3000/api/sites');
      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch sites');
    });
  });

  describe('POST /api/sites', () => {
    it('should create a new site with valid data', async () => {
      const newSite = {
        name: 'New Site',
        subdomain: 'new-site',
        theme: 'medical',
        settings: { communityCount: 10000 },
        brand_profile: { name: 'Dr. New' },
      };

      const createdSite = {
        id: 'generated-id',
        ...newSite,
        status: 'draft',
      };

      mockCreateQueries.mockReturnValue({
        siteQueries: {
          create: jest.fn().mockResolvedValue(undefined),
          getById: jest.fn().mockResolvedValue(createdSite),
          getAll: jest.fn(),
          getBySubdomain: jest.fn(),
          getByDomain: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      } as any);

      const request = new Request('http://localhost:3000/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSite),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.site.name).toBe('New Site');
      expect(data.site.subdomain).toBe('new-site');
    });

    it('should use default values for optional fields', async () => {
      const minimalSite = { name: 'Minimal Site' };

      mockCreateQueries.mockReturnValue({
        siteQueries: {
          create: jest.fn().mockResolvedValue(undefined),
          getById: jest.fn().mockResolvedValue({
            id: 'id',
            name: 'Minimal Site',
            theme: 'medical',
            status: 'draft',
          }),
          getAll: jest.fn(),
          getBySubdomain: jest.fn(),
          getByDomain: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      } as any);

      const request = new Request('http://localhost:3000/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(minimalSite),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.site.theme).toBe('medical');
      expect(data.site.status).toBe('draft');
    });

    it('should return 500 on creation error', async () => {
      mockCreateQueries.mockReturnValue({
        siteQueries: {
          create: jest.fn().mockRejectedValue(new Error('Duplicate subdomain')),
          getById: jest.fn(),
          getAll: jest.fn(),
          getBySubdomain: jest.fn(),
          getByDomain: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      } as any);

      const request = new Request('http://localhost:3000/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test', subdomain: 'existing' }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create site');
    });
  });
});
