import { sendBroadcastNotification } from '@/libs/notification';
import { authenticateAdmin } from '@/libs/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const auth = await authenticateAdmin(request);
  if (auth.status !== 200) {
    return NextResponse.json({ error: '인증 실패' }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { title, message, data } = body;

    await sendBroadcastNotification(title, message, data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending broadcast notification:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}