import { POST } from '@/app/admin/api/v1/admin/verify/route';
import { getServiceManager } from '@repo/shared/services';

// Mock the service manager
jest.mock('@repo/shared/services', () => ({
  getServiceManager: jest.fn(),
}));

describe('Admin Verify API', () => {
  let mockAdminService: any;

  beforeEach(() => {
    mockAdminService = {
      findById: jest.fn(),
    };

    (getServiceManager as jest.Mock).mockReturnValue({
      adminService: mockAdminService,
    });
  });

  it('should verify valid token', async () => {
    const mockAdmin = {
      id: '1',
      username: 'admin',
    };

    mockAdminService.findById.mockResolvedValue(mockAdmin);

    const request = new Request('http://localhost:3000/admin/api/v1/admin/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: 'valid_token',
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      success: true,
      data: {
        id: '1',
        username: 'admin',
      },
      message: '토큰이 유효합니다.',
      meta: {
        timestamp: expect.any(Number),
        path: expect.any(String),
      },
    });
  });

  it('should handle invalid token', async () => {
    const request = new Request('http://localhost:3000/admin/api/v1/admin/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: 'invalid_token',
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({
      success: false,
      error: {
        code: 'AUTH_002',
        message: '유효하지 않은 토큰입니다.',
        status: 401,
      },
      meta: {
        timestamp: expect.any(Number),
        path: expect.any(String),
      },
    });
  });

  it('should handle missing token', async () => {
    const request = new Request('http://localhost:3000/admin/api/v1/admin/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      success: false,
      error: {
        code: 'VAL_002',
        message: '토큰이 필요합니다.',
        status: 400,
      },
      meta: {
        timestamp: expect.any(Number),
        path: expect.any(String),
      },
    });
  });

  it('should handle non-existent admin', async () => {
    mockAdminService.findById.mockResolvedValue(null);

    const request = new Request('http://localhost:3000/admin/api/v1/admin/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: 'valid_token_for_nonexistent_admin',
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({
      success: false,
      error: {
        code: 'AUTH_003',
        message: '존재하지 않는 관리자입니다.',
        status: 401,
      },
      meta: {
        timestamp: expect.any(Number),
        path: expect.any(String),
      },
    });
  });
}); 