import { NextResponse } from 'next/server';
import { authenticateUser } from '@/libs/auth';
import { notificationMessageService } from '@repo/shared/services';
import { toNotificationMessageListDtoArray, toNotificationMessageResponseDto } from '@repo/shared/transformers';
import { withApiHandler } from '@/libs/api-utils';
import { ApiResponse } from '@/types/api';
import { createSystemError } from '@/libs/errors';

interface Params {
  id: string;
}

export const GET = withApiHandler(async (request: Request, { params }: { params: Params }): Promise<ApiResponse> => {
  const auth = await authenticateUser(request);

  if ('error' in auth) {
    return {
      success: false,
      error: createSystemError('INTERNAL_ERROR', auth.error || 'Authentication failed'),
    };
  }

  const { userId } = auth as { userId: string };
  const { id } = params;

  const notificationMessage = await notificationMessageService.findMany({
    where: {
      user_id: BigInt(userId),
      group_id: BigInt(id),
    },
  });

  return {
    success: true,
    data: notificationMessage.map(toNotificationMessageResponseDto),
    message: '알림 목록을 성공적으로 조회했습니다.',
    meta: {
      timestamp: Date.now(),
      path: request.url,
    },
  };
});

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