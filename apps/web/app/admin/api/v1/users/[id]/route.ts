import { NextResponse } from 'next/server';
import { prisma } from '@repo/shared';

// 이용자 정보 조회
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = BigInt(params.id);

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: {
          include: {
            company: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: '존재하지 않는 이용자입니다.' },
        { status: 404 }
      );
    }

    // BigInt를 문자열로 변환
    const serializedUser = JSON.stringify(user, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    );

    return NextResponse.json(JSON.parse(serializedUser));
  } catch (error) {
    console.error('이용자 정보 조회 중 오류:', error);
    return NextResponse.json(
      { error: '이용자 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 이용자 정보 수정
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = BigInt(params.id);
    const { user: userData, profile: profileData } = await request.json();

    const result = await prisma.$transaction(async (tx) => {

      // 프로필 정보 수정
      if (profileData.id) {
        await tx.profile.update({
          where: { id: profileData.id },
          data: profileData
        });
      } else {
        const newProfile = await tx.profile.create({
          data: profileData
        });
        profileData.id = newProfile.id;
        userData.profile_id = newProfile.id;
      }

      // 이용자 정보 수정
      const updatedUser = await tx.user.update({
        where: { id },
        data: userData,
        include: {
          profile: {
            include: {
              company: true
            }
          }
        }
      });

      // BigInt를 문자열로 변환
      const responseUser = {
        ...updatedUser,
        id: updatedUser.id.toString(), // BigInt 필드를 문자열로 변환
        profile_id: updatedUser.profile_id ? updatedUser.profile_id.toString() : null
      };

      return responseUser;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('이용자 정보 수정 중 오류:', error);
    return NextResponse.json(
      { error: '이용자 정보 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}