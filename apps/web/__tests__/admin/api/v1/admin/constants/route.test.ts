import { GET } from '@/app/admin/api/v1/admin/constants/route';

describe('Admin Constants API', () => {
  it('should return system environment variables', async () => {
    const request = new Request('http://localhost:3000/admin/api/v1/admin/constants', {
      method: 'GET',
    });

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      success: true,
      data: {
        NODE_ENV: expect.any(String),
        DATABASE_URL: expect.any(String),
        JWT_SECRET: expect.any(String),
        JWT_EXPIRES_IN: expect.any(String),
      },
      message: '시스템 환경 변수를 성공적으로 조회했습니다.',
      meta: {
        timestamp: expect.any(Number),
        path: expect.any(String),
      },
    });
  });

  it('should handle environment variable access error', async () => {
    // Mock process.env to throw an error
    const originalEnv = process.env;
    process.env = {} as NodeJS.ProcessEnv;

    const request = new Request('http://localhost:3000/admin/api/v1/admin/constants', {
      method: 'GET',
    });

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({
      success: false,
      error: {
        code: 'SYS_001',
        message: '시스템 환경 변수에 접근할 수 없습니다.',
        status: 500,
      },
      meta: {
        timestamp: expect.any(Number),
        path: expect.any(String),
      },
    });

    // Restore original process.env
    process.env = originalEnv;
  });
}); 