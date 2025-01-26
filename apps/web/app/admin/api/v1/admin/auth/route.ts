import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { SignJWT } from 'jose';

// 비밀번호 해시 함수
function hashPassword(password: string): string {
  const salt = 'your_salt_value';
  const hash = Buffer.from(crypto.createHash('sha512').update(password + salt).digest()).toString('base64');
  return `${hash}`; // salt와 해시를 함께 반환
}

// JWT 토큰 생성 함수
async function generateToken(adminId: number): Promise<string> {
  return await new SignJWT({ adminId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret'));
}

// 로그인
export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const admin = await prisma.admin.findUnique({
      where: { username }
    });

    if (!admin || admin.password !== hashPassword(password)) {
      return NextResponse.json(
        { error: '잘못된 사용자명 또는 비밀번호입니다.' },
        { status: 401 }
      );
    }

    const token = await generateToken(admin.id);

    return NextResponse.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}