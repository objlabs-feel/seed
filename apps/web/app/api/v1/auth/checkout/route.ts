import { userService } from '@repo/shared/services';
import { createApiResponse, parseApiRequest, withApiHandler } from '@/libs/api-utils';
import { createValidationError, createSystemError, createBusinessError } from '@/libs/errors';
import type { ApiResponse } from '@/types/api';

export const POST = withApiHandler(async (request: Request): Promise<ApiResponse> => {
  const { body } = await parseApiRequest<{ device_token: string }>(request);
  const { device_token } = body;

  if (!device_token) {
    throw createValidationError('MISSING_REQUIRED', 'Device token is required');
  }

  try {
    const user = await userService.findByDeviceToken(device_token);

    if (!user) {
      throw createBusinessError('NOT_FOUND', 'User not found');
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
