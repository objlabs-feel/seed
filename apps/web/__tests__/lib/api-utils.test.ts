import { createApiResponse, parseApiRequest, withApiHandler } from '@/libs/api-utils';
import { ApiError } from '@/libs/errors';
import type { ApiResponse } from '@/types/api';

describe('API Utils', () => {
  describe('createApiResponse', () => {
    it('should create a success response with data', () => {
      const data = { id: 1, name: 'test' };
      const response = createApiResponse({ data });
      const body = response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({
        success: true,
        data,
        meta: {
          timestamp: expect.any(Number),
          path: '',
        },
      });
    });

    it('should create an error response', () => {
      const error = new ApiError('SYS_001', 'Internal server error', 500);
      const response = createApiResponse({ error });
      const body = response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({
        success: false,
        error: {
          code: 'SYS_001',
          message: 'Internal server error',
          status: 500,
        },
        meta: {
          timestamp: expect.any(Number),
          path: '',
        },
      });
    });
  });

  describe('parseApiRequest', () => {
    it('should parse request body and query parameters', async () => {
      const body = { name: 'test' };
      const request = new Request('http://localhost:3000/api/test?page=1', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      const result = await parseApiRequest(request);

      expect(result.body).toEqual(body);
      expect(result.query.get('page')).toBe('1');
    });

    it('should handle empty body', async () => {
      const request = new Request('http://localhost:3000/api/test');
      const result = await parseApiRequest(request);

      expect(result.body).toEqual({});
    });
  });

  describe('withApiHandler', () => {
    it('should handle successful API calls', async () => {
      const handler = async (request: Request): Promise<ApiResponse> => ({
        success: true,
        data: { id: 1 },
      });

      const wrappedHandler = withApiHandler(handler);
      const request = new Request('http://localhost:3000/api/test');
      const response = await wrappedHandler(request);
      const body = response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({
        success: true,
        data: { id: 1 },
        meta: {
          timestamp: expect.any(Number),
          path: '',
        },
      });
    });

    it('should handle API errors', async () => {
      const handler = async (request: Request): Promise<ApiResponse> => {
        throw new ApiError('SYS_001', 'Internal server error', 500);
      };

      const wrappedHandler = withApiHandler(handler);
      const request = new Request('http://localhost:3000/api/test');
      const response = await wrappedHandler(request);
      const body = response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({
        success: false,
        error: {
          code: 'SYS_001',
          message: 'Internal server error',
          status: 500,
        },
        meta: {
          timestamp: expect.any(Number),
          path: '',
        },
      });
    });

    it('should handle unknown errors', async () => {
      const handler = async (request: Request): Promise<ApiResponse> => {
        throw new Error('Unknown error');
      };

      const wrappedHandler = withApiHandler(handler);
      const request = new Request('http://localhost:3000/api/test');
      const response = await wrappedHandler(request);
      const body = response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({
        success: false,
        error: {
          code: 'SYS_001',
          message: 'Internal server error',
          status: 500,
        },
        meta: {
          timestamp: expect.any(Number),
          path: '',
        },
      });
    });
  });
}); 