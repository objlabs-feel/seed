import { NextResponse } from 'next/server';
import { authenticateUser } from '@/libs/auth';
import { notificationService } from '@repo/shared/services';
import { toNotificationInfoResponseDto, toNotificationInfoListDtoArray } from '@repo/shared/transformers';
import { CreateNotificationInfoRequestDto, UpdateNotificationInfoRequestDto } from '@repo/shared/dto';
import { createApiResponse, parseApiRequest, withApiHandler } from '@/libs/api-utils';
import type { ApiResponse } from '@/types/api';

// GET: 사용자의 모든 알림 설정 조회
export async function GET(request: Request) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { userId } = auth as { userId: string };

  try {
    const notificationInfos = await notificationService.findMany({
      where: { user_id: BigInt(userId) }, // findMany는 toPrismaData를 안 거치므로 BigInt 변환 필요
    });

    return NextResponse.json(toNotificationInfoListDtoArray(notificationInfos));
  } catch (error) {
    console.error('Error fetching notification info:', error);
    return NextResponse.json({ error: '알림 설정 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// POST: 알림 권한 상태와 디바이스 토큰 등록/업데이트
export async function POST(request: Request) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { userId } = auth as { userId: string };

  try {
    const body = await request.json();
    const createData: CreateNotificationInfoRequestDto = {
      ...body,
      user_id: userId,
    };
    const notificationInfo = await notificationService.registerDevice(createData);

    return NextResponse.json(toNotificationInfoResponseDto(notificationInfo));
  } catch (error) {
    console.error('Error updating notification info:', error);
    return NextResponse.json({ error: '알림 설정 업데이트 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// PUT: 알림 설정 항목 업데이트
export async function PUT(request: Request) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { userId } = auth as { userId: string };

  try {
    const body = await request.json();
    const updateData: UpdateNotificationInfoRequestDto = {
      ...body,
      user_id: userId,
    };
    const notificationInfo = await notificationService.updateSettings(updateData);

    return NextResponse.json(toNotificationInfoResponseDto(notificationInfo));
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json({ error: '알림 설정 업데이트 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
