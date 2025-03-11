import { NextResponse } from 'next/server';
import { prisma } from '@repo/shared';
import { authenticateUser } from '@/lib/auth';
import { convertBigIntToString } from '@/lib/utils';

// 특정 메시지 읽음 처리
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { userId } = auth;

  try {
    const message = await prisma.NotificationMessage.update({
      where: {
        id: BigInt(params.id),
        user_id: BigInt(userId)
      },
      data: {
        is_read: true,
        read_at: new Date()
      }
    });

    return NextResponse.json(convertBigIntToString(message));
  } catch (error) {
    console.error('Error marking message as read:', error);
    return NextResponse.json(
      { error: '알림 읽음 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}