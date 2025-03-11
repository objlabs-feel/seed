import { sendBroadcastNotification } from '@/lib/notification';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, message, data } = body;

    await sendBroadcastNotification(title, message, data);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error sending broadcast notification:', error);
    return Response.json({ error: 'Failed to send notification' }, { status: 500 });
  }
} 