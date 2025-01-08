import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// 토큰 검증 함수
async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret'))
    return payload
  } catch (error) {
    if (error.code === 'ERR_JWT_EXPIRED') {
      console.error('JWT expired:', error)
      return 'expired'
    }
    console.error('JWT verification failed:', error)
    return null
  }
}

export async function middleware(request: NextRequest) {
  // admin 경로에 대해서만 처리
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // 로그인 페이지는 제외
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next()
  }

  const token = request.cookies.get('admin_token')?.value

  if (!token) {
    // 토큰이 없는 경우 로그인 페이지로 리다이렉트
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  const verificationResult = await verifyToken(token)

  if (verificationResult === 'expired' || verificationResult === null) {
    // 토큰이 만료되었거나 검증에 실패한 경우 로그인 페이지로 리다이렉트
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*'
} 