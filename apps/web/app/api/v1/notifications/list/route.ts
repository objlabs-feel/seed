import { NextResponse } from 'next/server';
import { prisma } from '@repo/shared';
import { authenticateUser } from '@/lib/auth';
import { convertBigIntToString } from '@/lib/utils';

// 알림 메시지 목록 조회
export async function GET(request: Request) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { userId } = auth;

  try {
    const messages = await prisma.NotificationMessage.findMany({
      where: {
        user_id: BigInt(userId)
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json(messages.map(msg => convertBigIntToString(msg)));
  } catch (error) {
    console.error('Error fetching notification messages:', error);
    return NextResponse.json(
      { error: '알림 메시지 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 읽지 않은 알림 개수 조회
export async function HEAD(request: Request) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { userId } = auth;

  try {
    const count = await prisma.NotificationMessage.count({
      where: {
        user_id: BigInt(userId),
        is_read: false
      }
    });

    return NextResponse.json({ unreadCount: count });
  } catch (error) {
    console.error('Error counting unread messages:', error);
    return NextResponse.json(
      { error: '알림 개수 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 모든 메시지 읽음 처리
export async function POST(request: Request) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { userId } = auth;

  try {
    await prisma.NotificationMessage.updateMany({
      where: {
        user_id: BigInt(userId),
        is_read: false
      },
      data: {
        is_read: true,
        read_at: new Date()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking all messages as read:', error);
    return NextResponse.json(
      { error: '알림 읽음 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}