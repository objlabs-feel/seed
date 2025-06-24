import { NextResponse } from 'next/server';
import { userService } from '@repo/shared/services';
import { SignJWT } from 'jose';
import { convertBigIntToString } from '@/libs/utils';
import { createApiResponse, parseApiRequest, withApiHandler } from '@/libs/api-utils';
import { createValidationError, createSystemError } from '@/libs/errors';
import type { ApiResponse } from '@/types/api';

export const POST = withApiHandler(async (request: Request): Promise<ApiResponse> => {
  const { body } = await parseApiRequest<{ device_token: string }>(request);
  const { device_token } = body;

  if (!device_token) {
    throw createValidationError('MISSING_REQUIRED', 'Device token is required');
  }

  try {
    const user = await userService.checkIn(device_token);

    // JWT 토큰 생성
    const token = await new SignJWT({
      userId: user.id.toString(),
      deviceToken: user.device_token,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1d')
      .sign(new TextEncoder().encode(process.env.USER_JWT_SECRET));

    return {
      success: true,
      data: convertBigIntToString({
        token,
        user: {
          id: user.id,
          created_at: user.created_at,
          device_token: user.device_token,
          profile: user.profile || null,
        }
      })
    };
  } catch (error) {
    console.error('User check-in error:', error);
    throw createSystemError('INTERNAL_ERROR', 'Failed to process check-in');
  }
});
