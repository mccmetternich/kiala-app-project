/**
 * Subscribers API Integration Tests
 *
 * Tests the /api/subscribers endpoint for email subscription management
 */

import { GET, POST, DELETE } from '@/app/api/subscribers/route';
import db from '@/lib/db-enhanced';

// Mock the database module
jest.mock('@/lib/db-enhanced', () => ({
  __esModule: true,
  default: {
    execute: jest.fn(),
  },
}));

const mockDbExecute = db.execute as jest.MockedFunction<typeof db.execute>;

describe('Subscribers API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/subscribers', () => {
    it('should return 400 when siteId is missing', async () => {
      const request = new Request('http://localhost:3000/api/subscribers');
      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('siteId is required');
    });

    it('should return subscribers with stats', async () => {
      const mockSubscribers = [
        { id: 'sub1', email: 'test1@example.com', status: 'active', created_at: new Date().toISOString() },
        { id: 'sub2', email: 'test2@example.com', status: 'active', created_at: new Date().toISOString() },
        { id: 'sub3', email: 'test3@example.com', status: 'unsubscribed', created_at: new Date().toISOString() },
      ];

      mockDbExecute.mockResolvedValue({ rows: mockSubscribers } as any);

      const request = new Request('http://localhost:3000/api/subscribers?siteId=site1');
      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.subscribers).toHaveLength(3);
      expect(data.stats.total).toBe(3);
      expect(data.stats.active).toBe(2);
      expect(data.stats.unsubscribed).toBe(1);
    });

    it('should filter by status', async () => {
      mockDbExecute.mockResolvedValue({ rows: [{ id: 'sub1', email: 'test@example.com', status: 'active' }] } as any);

      const request = new Request('http://localhost:3000/api/subscribers?siteId=site1&status=active');
      const response = await GET(request as any);

      expect(response.status).toBe(200);
      expect(mockDbExecute).toHaveBeenCalledWith(
        expect.objectContaining({
          sql: expect.stringContaining('status = ?'),
        })
      );
    });

    it('should return CSV when format=csv', async () => {
      const mockSubscribers = [
        { id: 'sub1', email: 'test@example.com', name: 'Test', source: 'popup', status: 'active', tags: '[]', page_url: '/article', subscribed_at: '2024-01-01' },
      ];

      mockDbExecute.mockResolvedValue({ rows: mockSubscribers } as any);

      const request = new Request('http://localhost:3000/api/subscribers?siteId=site1&format=csv');
      const response = await GET(request as any);

      expect(response.headers.get('Content-Type')).toBe('text/csv');
      expect(response.headers.get('Content-Disposition')).toContain('attachment; filename="subscribers-');
    });
  });

  describe('POST /api/subscribers', () => {
    it('should return 400 when email is missing', async () => {
      const request = new Request('http://localhost:3000/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId: 'site1' }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Email and siteId are required');
    });

    it('should return 400 when siteId is missing', async () => {
      const request = new Request('http://localhost:3000/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Email and siteId are required');
    });

    it('should return 400 for invalid email format', async () => {
      const request = new Request('http://localhost:3000/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'invalid-email', siteId: 'site1' }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid email format');
    });

    it('should create new subscriber with valid data', async () => {
      // Mock: no site found by subdomain, but found by ID
      mockDbExecute
        .mockResolvedValueOnce({ rows: [] } as any) // subdomain lookup
        .mockResolvedValueOnce({ rows: [{ id: 'site1' }] } as any) // ID lookup
        .mockResolvedValueOnce({ rows: [] } as any) // existing subscriber check
        .mockResolvedValueOnce({ rowsAffected: 1 } as any); // insert

      const request = new Request('http://localhost:3000/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'new@example.com',
          siteId: 'site1',
          name: 'New User',
          source: 'popup',
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Successfully subscribed!');
      expect(data.subscriber.email).toBe('new@example.com');
    });

    it('should return success for already subscribed user', async () => {
      // Mock: site found, existing active subscriber
      mockDbExecute
        .mockResolvedValueOnce({ rows: [] } as any) // subdomain lookup
        .mockResolvedValueOnce({ rows: [{ id: 'site1' }] } as any) // ID lookup
        .mockResolvedValueOnce({ rows: [{ id: 'sub1', email: 'existing@example.com', status: 'active' }] } as any);

      const request = new Request('http://localhost:3000/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'existing@example.com',
          siteId: 'site1',
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('You are already subscribed!');
    });

    it('should reactivate unsubscribed user', async () => {
      // Mock: site found, existing unsubscribed subscriber
      mockDbExecute
        .mockResolvedValueOnce({ rows: [] } as any) // subdomain lookup
        .mockResolvedValueOnce({ rows: [{ id: 'site1' }] } as any) // ID lookup
        .mockResolvedValueOnce({ rows: [{ id: 'sub1', email: 'unsub@example.com', status: 'unsubscribed' }] } as any)
        .mockResolvedValueOnce({ rowsAffected: 1 } as any); // update

      const request = new Request('http://localhost:3000/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'unsub@example.com',
          siteId: 'site1',
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Welcome back! You have been resubscribed.');
    });

    it('should resolve subdomain to siteId', async () => {
      // Mock: site found by subdomain
      mockDbExecute
        .mockResolvedValueOnce({ rows: [{ id: 'actual-site-id' }] } as any) // subdomain lookup
        .mockResolvedValueOnce({ rows: [] } as any) // existing subscriber check
        .mockResolvedValueOnce({ rowsAffected: 1 } as any); // insert

      const request = new Request('http://localhost:3000/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          siteId: 'dr-amy', // subdomain, not ID
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });
  });

  describe('DELETE /api/subscribers', () => {
    it('should return 400 when email is missing', async () => {
      const request = new Request('http://localhost:3000/api/subscribers?siteId=site1', {
        method: 'DELETE',
      });

      const response = await DELETE(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Email and siteId are required');
    });

    it('should return 400 when siteId is missing', async () => {
      const request = new Request('http://localhost:3000/api/subscribers?email=test@example.com', {
        method: 'DELETE',
      });

      const response = await DELETE(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Email and siteId are required');
    });

    it('should unsubscribe existing subscriber', async () => {
      mockDbExecute.mockResolvedValue({ rowsAffected: 1 } as any);

      const request = new Request('http://localhost:3000/api/subscribers?email=test@example.com&siteId=site1', {
        method: 'DELETE',
      });

      const response = await DELETE(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Successfully unsubscribed');
    });

    it('should return 404 when subscriber not found', async () => {
      mockDbExecute.mockResolvedValue({ rowsAffected: 0 } as any);

      const request = new Request('http://localhost:3000/api/subscribers?email=nonexistent@example.com&siteId=site1', {
        method: 'DELETE',
      });

      const response = await DELETE(request as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Subscriber not found');
    });
  });
});
