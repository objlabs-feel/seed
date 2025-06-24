import { POST } from '@/app/admin/api/v1/admin/auth/route';
import { getServiceManager } from '@repo/shared/services';

// Mock the service manager
jest.mock('@repo/shared/services', () => ({
  getServiceManager: jest.fn(),
}));

describe('Admin Auth API', () => {
  let mockAdminService: any;

  beforeEach(() => {
    mockAdminService = {
      findByUsername: jest.fn(),
      verifyPassword: jest.fn(),
    };

    (getServiceManager as jest.Mock).mockReturnValue({
      adminService: mockAdminService,
    });
  });

  it('should login successfully with valid credentials', async () => {
    const mockAdmin = {
      id: '1',
      username: 'admin',
      password: 'hashed_password',
    };

    mockAdminService.findByUsername.mockResolvedValue(mockAdmin);
    mockAdminService.verifyPassword.mockResolvedValue(true);

    const request = new Request('http://localhost:3000/admin/api/v1/admin/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'password123',
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      success: true,
      data: {
        admin: {
          id: '1',
          username: 'admin',
        },
        token: expect.any(String),
      },
      message: '로그인에 성공했습니다.',
      meta: {
        timestamp: expect.any(Number),
        path: expect.any(String),
      },
    });
  });

  it('should handle invalid credentials', async () => {
    mockAdminService.findByUsername.mockResolvedValue(null);

    const request = new Request('http://localhost:3000/admin/api/v1/admin/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'wrong_password',
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({
      success: false,
      error: {
        code: 'AUTH_001',
        message: '잘못된 사용자명 또는 비밀번호입니다.',
        status: 401,
      },
      meta: {
        timestamp: expect.any(Number),
        path: expect.any(String),
      },
    });
  });

  it('should handle validation error', async () => {
    const request = new Request('http://localhost:3000/admin/api/v1/admin/auth', {
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