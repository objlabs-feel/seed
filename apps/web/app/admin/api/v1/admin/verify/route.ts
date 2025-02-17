import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const adminToken = cookieHeader?.split(';')
      .find(c => c.trim().startsWith('admin_token='))
      ?.split('=')[1];

    if (!adminToken) {
      return NextResponse.json({ error: '토큰이 없습니다.' }, { status: 401 });
    }

    const verificationResult = await verifyToken(adminToken, true);
    
    if (verificationResult === 'expired' || verificationResult === null) {
      return NextResponse.json({ error: '토큰이 만료되었거나 유효하지 않습니다.' }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: '인증 확인 중 오류가 발생했습니다.' }, { status: 500 });
  }
} 