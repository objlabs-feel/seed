import { NextResponse } from 'next/server';
import { prisma } from '@repo/shared';
import { authenticateUser } from '@/lib/auth';
import { convertBigIntToString } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    // 쿠키나 헤더에서 사용자 ID 가져오기 (인증 방식에 따라 수정 필요)
    const auth = await authenticateUser(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { userId } = auth as { userId: string };

    const user = await prisma.user.findUnique({
      where: {
        id: BigInt(userId)
      },
      include: {
        profile: {
          include: {
            company: true,            
          }
        }
      }
    });

    // BigInt를 문자열로 변환
    const responseUser = convertBigIntToString(user);

    return NextResponse.json({
      ...responseUser,
    });
  } catch (error) {
    console.error('이용자 목록 조회 중 오류:', error);
    return NextResponse.json(
      { error: '이용자 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newUser = await prisma.user.create({
      data: {
        // 필요한 필드에 따라 데이터를 설정합니다.
        device_token: data.device_token || '',
        profile_id: (data.name || data.email || data.mobile) ? (await prisma.profile.create({
          data: {
            name: data.name,
            email: data.email,
            mobile: data.mobile,
            profile_type: data.profile_type || 0,
          }
        })).id : undefined,
        status: data.status || 0,
      }
    });

    // BigInt를 문자열로 변환
    const responseUser = {
      ...newUser,
      id: newUser.id.toString(), // BigInt 필드를 문자열로 변환
      profile_id: newUser.profile_id ? newUser.profile_id.toString() : null
    };

    return NextResponse.json(responseUser, { status: 201 });
  } catch (error) {
    console.error('이용자 생성 중 오류:', error);
    return NextResponse.json(
      { error: '이용자 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}