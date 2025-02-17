import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { prisma } from '@/lib/prisma';
import { convertBigIntToString } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { device_token, user_id } = body;

    if (!device_token || !user_id) {
      return NextResponse.json(
        { error: 'Device token and user ID are required' },
        { status: 400 }
      );
    }

    // 사용자 확인 - device_token과 user_id 모두 일치하는지 확인
    const user = await prisma.user.findFirst({
      where: {
        AND: [
          { device_token: device_token },
          { id: BigInt(user_id) }
        ]
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid user credentials' },
        { status: 400 }
      );
    }

    // JWT 토큰 생성
    const token = await new SignJWT({
      userId: user.id.toString(),
      profileId: user.profile_id ? user.profile_id.toString() : null,
      status: user.status
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(new TextEncoder().encode(process.env.USER_JWT_SECRET || 'fallback-secret'));

    return NextResponse.json(convertBigIntToString({
      token,
      user: {
        id: user.id,
        created_at: user.created_at,
        profile_id: user.profile_id,
        status: user.status
      }
    }));

  } catch (error) {
    console.error('Verification error:', error);

    // BigInt 변환 에러 처리
    if (error instanceof Error && error.message.includes('BigInt')) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
