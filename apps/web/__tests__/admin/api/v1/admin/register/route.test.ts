import { POST } from '@/app/admin/api/v1/admin/register/route';
import { getServiceManager } from '@repo/shared/services';

// Mock the service manager
jest.mock('@repo/shared/services', () => ({
  getServiceManager: jest.fn(),
}));

describe('Admin Register API', () => {
  let mockAdminService: any;

  beforeEach(() => {
    mockAdminService = {
      count: jest.fn(),
      findByUsername: jest.fn(),
      create: jest.fn(),
    };

    (getServiceManager as jest.Mock).mockReturnValue({
      adminService: mockAdminService,
    });
  });

  it('should create first admin without token', async () => {
    mockAdminService.count.mockResolvedValue(0);
    mockAdminService.findByUsername.mockResolvedValue(null);
    mockAdminService.create.mockResolvedValue({
      id: '1',
      username: 'admin',
    });

    const request = new Request('http://localhost:3000/admin/api/v1/admin/register', {
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
        id: '1',
        username: 'admin',
      },
      message: '관리자 계정이 성공적으로 생성되었습니다.',
      meta: {
        timestamp: expect.any(Number),
        path: expect.any(String),
      },
    });
  });

  it('should require admin token for subsequent registrations', async () => {
    mockAdminService.count.mockResolvedValue(1);

    const request = new Request('http://localhost:3000/admin/api/v1/admin/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin2',
        password: 'password123',
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({
      success: false,
      error: {
        code: 'AUTH_004',
        message: '관리자 계정 생성 권한이 없습니다.',
        status: 401,
      },
      meta: {
        timestamp: expect.any(Number),
        path: expect.any(String),
      },
    });
  });

  it('should prevent duplicate usernames', async () => {
    mockAdminService.count.mockResolvedValue(0);
    mockAdminService.findByUsername.mockResolvedValue({
      id: '1',
      username: 'admin',
    });

    const request = new Request('http://localhost:3000/admin/api/v1/admin/register', {
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

    expect(response.status).toBe(400);
    expect(body).toEqual({
      success: false,
      error: {
        code: 'BUS_002',
        message: '이미 존재하는 사용자명입니다.',
        status: 400,
      },
      meta: {
        timestamp: expect.any(Number),
        path: expect.any(String),
      },
    });
  });

  it('should handle validation error', async () => {
    const request = new Request('http://localhost:3000/admin/api/v1/admin/register', {
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