import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './libs/auth';

// NOTE: 이 미들웨어는 Edge Runtime에서 실행될 수 있으므로, Node.js 전용 API 사용에 주의해야 합니다.

// 인증이 필요하지 않은 경로 목록
const PUBLIC_VIEW_PATHS = [
  '/admin/login',
  '/test'
];

// 관리자 API 경로
const ADMIN_API_PATH = '/admin/api';

// 일반 사용자 API 경로
const USER_API_PATH = '/api/v1';

// 토큰 검증이 필요 없는 경로 목록
const PUBLIC_API_PATHS = [
  // USER API PUBLIC LIST
  '/api/v1/auth/checkin',
  '/api/v1/auth/checkout',
  '/api/v1/auth/verify',
  '/api/v1/schedule/auction',
  // '/api/v1/notifications/broadcast', // TODO: 브로드캐스트 기능 테스트 시 활성화
  // ADMIN API PUBLIC LIST
  '/admin/api/v1/admin/auth',
  '/admin/api/v1/admin/register',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('pathname', pathname);

  // 이용자 뷰 경로는 토큰 검증 없이 통과
  if (PUBLIC_VIEW_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (pathname.startsWith(USER_API_PATH)) { // 사용자 API 요청 처리: 토큰 검증
    // 공개 API 경로는 토큰 검증 없이 통과
    if (PUBLIC_API_PATHS.some(path => pathname.startsWith(path))) {
      return NextResponse.next();
    }

    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    // const token = request.headers.get('authorization')?.split(' ')[1];
    console.log('client_token', token);
    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    try {
      await verifyToken(token, false); // 이용자 토큰 검증
      // 모든 처리가 끝난 후 다음 단계로 진행
      return NextResponse.next();
    } catch (error) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }
  }

  if (pathname.startsWith(ADMIN_API_PATH)) { // 관리자 API 요청 처리: 토큰 검증
    // 공개 API 경로는 토큰 검증 없이 통과
    if (PUBLIC_API_PATHS.some(path => pathname.startsWith(path))) {
      return NextResponse.next();
    }

    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    // const token = request.headers.get('authorization')?.split(' ')[1];
    console.log('admin_token', token);
    if (!token) {
      return new NextResponse(JSON.stringify({ error: 'Authentication required' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    try {
      await verifyToken(token, true); // 관리자 토큰 검증
      // 모든 처리가 끝난 후 다음 단계로 진행
      return NextResponse.next();
    } catch (error) {
      return new NextResponse(JSON.stringify({ error: 'Invalid or expired token' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
  }

  // 모든 처리가 끝난 후 다음 단계로 진행
  return NextResponse.next();
}

export const config = {
  /*
   * 미들웨어를 적용할 경로를 지정합니다.
   * - api (사용자 API)
   * - admin/api (관리자 API)
   * - 정적 파일(_next/static), 이미지 파일(_next/image), 파비콘 등은 제외합니다.
   */
  matcher: [
    '/api/v1/:path*',
    '/admin/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|test/client/auth).*)',
  ],
}; 