import { userService } from '@repo/shared/services';
import { createApiResponse, parseApiRequest, withApiHandler } from '@/libs/api-utils';
import { createValidationError, createSystemError, createBusinessError, createAuthError } from '@/libs/errors';
import type { ApiResponse } from '@/types/api';
import { jwtVerify } from 'jose';

export const POST = withApiHandler(async (request: Request): Promise<ApiResponse> => {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    // JWT 토큰 검증
    const { payload } = await jwtVerify(
      token || '',
      new TextEncoder().encode(process.env.USER_JWT_SECRET)
    );

    const { userId, deviceToken } = payload as { userId: string; deviceToken: string };

    // 사용자 존재 여부 확인
    const user = await userService.findByDeviceTokenAndId(deviceToken, BigInt(userId));

    if (!user) {
      throw createAuthError('INVALID_TOKEN', 'Invalid token or user not found');
    }

    // 현재는 특별한 서버 측 세션 만료 로직이 없으므로,
    // 성공적으로 요청을 받았다는 것을 클라이언트에 알려주는 것만으로 충분합니다.
    // 향후 로직이 추가될 수 있습니다. (예: 푸시알림 토큰 비활성화 등)

    return {
      success: true,
      data: { message: 'Successfully checked out' }
    };
  } catch (error) {
    console.error('User check-out error:', error);
    throw createSystemError('INTERNAL_ERROR', 'Failed to process check-out');
  }
});
