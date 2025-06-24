// API 응답 기본 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    timestamp: number;
    path: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

// API 요청 기본 타입
export interface ApiRequest<T = any> {
  body: T;
  headers: Headers;
  query: URLSearchParams;
}

// API 핸들러 타입
export type ApiHandler<T = any, R = any> = (
  request: ApiRequest<T>
) => Promise<ApiResponse<R>>;

// API 메서드 타입
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// API 라우트 설정 타입
export interface ApiRouteConfig {
  method: HttpMethod;
  handler: ApiHandler;
  middleware?: Array<(req: Request) => Promise<void>>;
} 