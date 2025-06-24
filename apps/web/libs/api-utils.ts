import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types/api';
import { ApiError, ErrorCode } from './errors';

// API 응답 생성 함수
export function createApiResponse<T>({
  data,
  error,
  meta,
}: {
  data?: T;
  error?: ApiError;
  meta?: Omit<ApiResponse['meta'], 'timestamp' | 'path'>;
}): NextResponse {
  const response: ApiResponse<T> = {
    success: !error,
    ...(data && { data }),
    ...(error && { error: error.toJSON() }),
    meta: {
      timestamp: Date.now(),
      path: '',
      ...meta,
    },
  };

  return NextResponse.json(response, {
    status: error?.status || 200,
  });
}

// API 요청 파싱 함수
export async function parseApiRequest<T>(request: Request): Promise<{
  body: T;
  headers: Headers;
  query: URLSearchParams;
}> {
  const url = new URL(request.url);
  const query = url.searchParams;
  const headers = request.headers;

  let body: T;
  try {
    body = await request.json();
  } catch {
    body = {} as T;
  }

  return { body, headers, query };
}

// API 핸들러 래퍼 함수
export function withApiHandler<T = any, R = any>(
  handler: (request: Request, context?: any) => Promise<ApiResponse<R>>
) {
  return async (request: Request, context?: any) => {
    try {
      const response = await handler(request, context);
      return createApiResponse({
        data: response.data,
        error: response.error ? new ApiError(response.error.code as ErrorCode, response.error.message) : undefined,
        meta: response.meta,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        return createApiResponse({ error });
      }
      return createApiResponse({
        error: new ApiError(
          'SYS_001' as ErrorCode,
          'Internal server error',
          500
        ),
      });
    }
  };
} 