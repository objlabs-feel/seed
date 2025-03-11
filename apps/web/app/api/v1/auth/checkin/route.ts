import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@repo/shared';
import { convertBigIntToString } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { device_token } = body;

    if (!device_token) {
      return NextResponse.json(
        { error: 'Device token is required' },
        { status: 400 }
      );
    }

    // 기존 사용자 확인
    let user = await prisma.user.findFirst({
      where: {
        device_token: device_token
      }
    });

    // 새 사용자 생성 또는 기존 사용자 토큰 업데이트
    if (!user) {
      // 새 사용자 생성
      user = await prisma.user.create({
        data: {
          device_token: device_token,          
        }
      });
    }

    // 응답 데이터 구조 확인
    const responseData = {
      token: user.token,
      user: {
        id: user.id,
        created_at: user.createdAt,
        device_token: user.device_token
      }
    };

    console.log('Response data:', responseData); // 디버깅을 위한 로그

    return NextResponse.json(convertBigIntToString(responseData));

  } catch (error) {
    console.error('User registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
