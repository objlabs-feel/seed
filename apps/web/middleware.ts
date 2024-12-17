import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// 토큰 검증 함수
function verifyToken(token: string) {
  try {
    return jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret'))
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  // admin 경로에 대해서만 처리
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // 로그인 페이지는 제외
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next()
  }

  const token = request.cookies.get('admin_token')?.value

  if (!token || !verifyToken(token)) {
    // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*'
} 