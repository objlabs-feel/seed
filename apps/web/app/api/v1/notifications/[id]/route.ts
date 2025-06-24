import { NextResponse } from 'next/server';
import { authenticateUser } from '@/libs/auth';
import { notificationMessageService } from '@repo/shared/services';
import { toNotificationMessageResponseDto } from '@repo/shared/transformers';

interface Params {
  id: string;
}

/**
 * 특정 알림을 읽음 처리
 */
export async function PUT(request: Request, { params }: { params: Params }) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = params;
    const updatedMessage = await notificationMessageService.markOneAsRead(BigInt(id));

    return NextResponse.json(toNotificationMessageResponseDto(updatedMessage));
  } catch (error) {
    console.error(`Error marking notification ${params.id} as read:`, error);
    return NextResponse.json({ error: '알림 읽음 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}