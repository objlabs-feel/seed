import { NextResponse } from 'next/server';
import { authenticateUser } from '@/libs/auth';
import { notificationMessageService } from '@repo/shared/services';
import { toNotificationMessageResponseDto, transformArray } from '@repo/shared/transformers';
import { NotificationMessageListDto } from '@repo/shared/dto';

/**
 * 사용자의 모든 알림 목록과 안 읽은 개수 조회
 */
export async function GET(request: Request) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { userId } = auth as { userId: string };

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const paginationResult = await notificationMessageService.findWithPagination({
      where: { user_id: BigInt(userId) },
      page,
      limit,
      orderBy: { created_at: 'desc' },
    });

    const unreadCount = await notificationMessageService.getUnreadCount(userId);

    console.log(paginationResult);

    const response: NotificationMessageListDto = {
      data: transformArray(paginationResult.data, toNotificationMessageResponseDto) || [],
      total: paginationResult.total,
      page: paginationResult.page,
      limit: paginationResult.limit,
      totalPages: Math.ceil(paginationResult.total / paginationResult.limit),
      unreadCount,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: '알림 목록 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

/**
 * 사용자의 모든 알림을 읽음 처리
 */
export async function POST(request: Request) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { userId } = auth as { userId: string };

  try {
    const result = await notificationMessageService.markAllAsRead(userId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json({ error: '알림 읽음 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 읽지 않은 알림 개수 조회
export async function HEAD(request: Request) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { userId } = auth as { userId: string };

  try {
    const count = await notificationMessageService.getUnreadCount(userId);

    return NextResponse.json({ unreadCount: count });
  } catch (error) {
    console.error('Error counting unread messages:', error);
    return NextResponse.json(
      { error: '알림 개수 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}