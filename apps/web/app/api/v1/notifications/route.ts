import { NextResponse } from 'next/server';
import { prisma } from '@repo/shared';
import { authenticateUser } from '@/lib/auth';
import { convertBigIntToString } from '@/lib/utils';

// GET: 사용자의 알림 설정 조회
export async function GET(request: Request) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { userId } = auth;

  if (userId === null) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const notificationInfo = await prisma.notificationInfo.findFirst({
      where: {
        user_id: BigInt(userId)
      }
    });

    if (!notificationInfo) {
      return NextResponse.json({ error: '알림 설정을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(convertBigIntToString(notificationInfo));
  } catch (error) {
    console.error('Error fetching notification info:', error);
    return NextResponse.json(
      { error: '알림 설정 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 알림 권한 상태와 디바이스 토큰 업데이트
export async function POST(request: Request) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { userId } = auth;

  if (userId === null) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const { permission_status, device_token, device_type, device_os } = await request.json();

    const notificationInfo = await prisma.notificationInfo.upsert({
      where: {
        user_id_device_type_device_os_device_token: {
          user_id: BigInt(userId),
          device_type,
          device_os,
          device_token
        }
      },
      update: {
        permission_status,
        updated_at: new Date()
      },
      create: {
        user_id: BigInt(userId),
        device_type,
        device_os,
        device_token,
        permission_status,
        noti_notice: 1,
        noti_event: 1,
        noti_sms: 1,
        noti_email: 1,
        noti_auction: 1,
        noti_favorite: 1,
        noti_set: { topics: ["all"] }
      }
    });

    return NextResponse.json(convertBigIntToString(notificationInfo));
  } catch (error) {
    console.error('Error updating notification info:', error);
    return NextResponse.json(
      { error: '알림 설정 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT: 알림 설정 항목 업데이트
export async function PUT(request: Request) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { userId } = auth;

  if (userId === null) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const {
      device_token,
      device_type,
      device_os,
      noti_notice,
      noti_event,
      noti_sms,
      noti_email,
      noti_auction,
      noti_favorite,
      noti_set
    } = await request.json();

    console.log('request.json', {
      device_token,
      device_type,
      device_os,
      noti_notice,
      noti_event,
      noti_sms,
      noti_email,
      noti_auction,
      noti_favorite,
      noti_set
    });

    const notificationInfo = await prisma.notificationInfo.upsert({
      where: {
        user_id_device_type_device_os_device_token: {
          user_id: BigInt(userId),
          device_type,
          device_os,
          device_token
        }
      },
      update: {
        permission_status: 1,
        noti_set,
        updated_at: new Date()
      },
      create: {
        user_id: BigInt(userId),
        device_type,
        device_os,
        device_token,
        permission_status: 1,
        noti_notice: 1,
        noti_event: 1,
        noti_sms: 1,
        noti_email: 1,
        noti_auction: 1,
        noti_favorite: 1,
        noti_set: { topics: ["all"] }
      }
    });

    return NextResponse.json(convertBigIntToString(notificationInfo));
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json(
      { error: '알림 설정 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
