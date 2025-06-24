import { userService } from '@repo/shared/services';
import { toUserResponseDto } from '@repo/shared/transformers';
import { authenticateUser } from '@/libs/auth';
import { withApiHandler } from '@/libs/api-utils';
import { createSystemError, createBusinessError, createAuthError } from '@/libs/errors';
import type { ApiResponse } from '@/types/api';

interface RouteContext {
  params: { id: string };
}

// 이용자 정보 조회
export const GET = withApiHandler(async (request: Request, context: RouteContext): Promise<ApiResponse> => {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    throw createAuthError('UNAUTHORIZED', auth.error || '인증 실패');
  }

  const { id } = context.params;
  try {
    const user = await userService.findById(id);

    if (!user) {
      throw createBusinessError('NOT_FOUND', '존재하지 않는 이용자입니다.');
    }

    return {
      success: true,
      data: toUserResponseDto(user)
    };
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw createSystemError('INTERNAL_ERROR', 'Failed to fetch user info');
  }
});