import { userService } from '@repo/shared/services';
import { NextResponse } from 'next/server';
import { createApiResponse, parseApiRequest, withApiHandler } from '@/libs/api-utils';
import { createValidationError, createSystemError, createAuthError } from '@/libs/errors';
import type { ApiResponse } from '@/types/api';
import { jwtVerify } from 'jose';
import { convertBigIntToString } from '@/libs/utils';

export const POST = withApiHandler(async (request: Request): Promise<ApiResponse> => {
  const { body } = await parseApiRequest<{ token: string }>(request);
  const { token } = body;

  if (!token) {
    throw createValidationError('MISSING_REQUIRED', 'Token is required');
  }

  try {
    // JWT 토큰 검증
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.USER_JWT_SECRET)
    );

    const { userId, deviceToken } = payload as { userId: string; deviceToken: string };

    // 사용자 존재 여부 확인
    const user = await userService.findByDeviceTokenAndId(deviceToken, BigInt(userId));

    if (!user) {
      throw createAuthError('INVALID_TOKEN', 'Invalid token or user not found');
    }

    return {
      success: true,
      data: convertBigIntToString({
        user: {
          id: user.id,
          created_at: user.created_at,
          device_token: user.device_token,
          profile: user.profile || null,
        }
      })
    };
  } catch (error) {
    console.error('Token verification error:', error);
    if (error instanceof Error && error.message.includes('JWT')) {
      throw createAuthError('INVALID_TOKEN', 'Invalid or expired token');
    }
    throw createSystemError('INTERNAL_ERROR', 'Failed to verify token');
  }
});
