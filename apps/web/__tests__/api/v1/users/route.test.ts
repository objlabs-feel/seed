import { GET, POST } from '@/app/api/v1/users/route';
import { getServiceManager } from '@repo/shared/services';
import { createAuthError, createBusinessError } from '@/libs/errors';

// Mock the service manager
jest.mock('@repo/shared/services', () => ({
  getServiceManager: jest.fn(),
}));

describe('Users API', () => {
  let mockUserService: any;

  beforeEach(() => {
    mockUserService = {
      findById: jest.fn(),
      create: jest.fn(),
    };

    (getServiceManager as jest.Mock).mockReturnValue({
      userService: mockUserService,
    });
  });

  describe('GET /api/v1/users', () => {
    it('should return user info when authenticated', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        profile: {
          company_id: '1',
        },
      };

      mockUserService.findById.mockResolvedValue(mockUser);

      const request = new Request('http://localhost:3000/api/v1/users', {
        headers: {
          'Authorization': 'Bearer valid-token',
        },
      });

      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({
        success: true,
        data: mockUser,
        meta: {
          timestamp: expect.any(Number),
          path: expect.any(String),
        },
      });
    });

    it('should handle authentication error', async () => {
      const request = new Request('http://localhost:3000/api/v1/users', {
        headers: {
          'Authorization': 'Bearer invalid-token',
        },
      });

      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body).toEqual({
        success: false,
        error: {
          code: 'AUTH_004',
          message: expect.any(String),
          status: 401,
        },
        meta: {
          timestamp: expect.any(Number),
          path: expect.any(String),
        },
      });
    });
  });

  describe('POST /api/v1/users', () => {
    it('should create a new user', async () => {
      const mockNewUser = {
        id: '1',
        username: 'newuser',
      };

      mockUserService.create.mockResolvedValue(mockNewUser);

      const request = new Request('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'newuser',
          password: 'password123',
        }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({
        success: true,
        data: mockNewUser,
        meta: {
          timestamp: expect.any(Number),
          path: expect.any(String),
        },
      });
    });

    it('should handle validation error', async () => {
      const request = new Request('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Missing required fields
        }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toEqual({
        success: false,
        error: {
          code: 'VAL_002',
          message: expect.any(String),
          status: 400,
        },
        meta: {
          timestamp: expect.any(Number),
          path: expect.any(String),
        },
      });
    });
  });
}); 