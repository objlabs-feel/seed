import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// 토큰 검증 함수
export async function verifyToken(token: string, isAdmin: boolean = false) {
  try {
    const secret = isAdmin
      ? process.env.ADMIN_JWT_SECRET
      : process.env.USER_JWT_SECRET;

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret || 'fallback-secret')
    );
    return payload;
  } catch (error: any) {
    if (error.code === 'ERR_JWT_EXPIRED') {
      console.error('JWT expired:', error);
      return 'expired';
    }
    console.error('JWT verification failed:', error);
    return null;
  }
}

export async function authenticateAdmin(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return { status: 401, error: 'Authentication required' };
    }

    const verificationResult = await verifyToken(token, true);
    if (verificationResult === 'expired' || verificationResult === null) {
      return { status: 401, error: 'Token invalid or expired' };
    }

    return { status: 200, adminId: verificationResult.adminId };
  } catch (error) {
    console.error('Authentication error:', error);
    return { status: 500, error: 'Authentication failed' };
  }
}

export async function authenticateUser(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return { error: 'Authentication required', status: 401 };
    }

    const verificationResult = await verifyToken(token);
    if (verificationResult === 'expired' || verificationResult === null) {
      return { error: 'Token invalid or expired', status: 401 };
    }

    return { userId: verificationResult.userId };
  } catch (error) {
    console.error('Authentication error:', error);
    return { error: 'Authentication failed', status: 500 };
  }
}