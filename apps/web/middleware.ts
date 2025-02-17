import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth';

// 인증이 필요하지 않은 경로 목록
const PUBLIC_PATHS = [
  '/api/v1/auth/checkin',
  '/api/v1/auth/verify',
  '/admin/login',
  '/admin/api/v1/departments/seed',
  '/admin/api/v1/device-types/seed',
  '/admin/api/v1/admin'
];

// 관리자 API 경로
const ADMIN_API_PATH = '/admin/api/v1';

// 일반 사용자 API 경로
const USER_API_PATH = '/api/v1';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 공개 경로는 인증 없이 통과
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 관리자 API 처리
  if (pathname.startsWith(ADMIN_API_PATH)) {
    const token = request.cookies.get('admin_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    const verificationResult = await verifyToken(token, true);
    if (verificationResult === 'expired' || verificationResult === null) {
      return NextResponse.json(
        { error: 'Admin token invalid or expired' },
        { status: 401 }
      );
    }
  }

  // 일반 사용자 API 처리
  if (pathname.startsWith(USER_API_PATH)) {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const verificationResult = await verifyToken(token);
    if (verificationResult === 'expired' || verificationResult === null) {
      return NextResponse.json(
        { error: 'Token invalid or expired' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/v1/:path*',
    '/admin/api/v1/:path*'
  ]
} 