import { userService } from '@repo/shared/services';
import { toUserResponseDto } from '@repo/shared/transformers';
import { UpdateProfileRequestDto, UpdateUserRequestDto } from '@repo/shared/dto';
import { authenticateUser } from '@/libs/auth';
import { createApiResponse, parseApiRequest, withApiHandler } from '@/libs/api-utils';
import { createSystemError, createBusinessError, createAuthError } from '@/libs/errors';
import type { ApiResponse } from '@/types/api';

// 내 정보 조회
export const GET = withApiHandler(async (request: Request): Promise<ApiResponse> => {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    throw createBusinessError('NOT_FOUND', auth.error || 'User not found');
  }
  const { userId } = auth as { userId: string };

  try {
    const user = await userService.findById(userId);

    if (!user) {
      throw createBusinessError('NOT_FOUND', 'User not found');
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

// 내 정보 수정
export const PUT = withApiHandler(async (request: Request): Promise<ApiResponse> => {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    throw createBusinessError('NOT_FOUND', auth.error || 'User not found');
  }

  const { userId } = auth as { userId: string };
  const { body } = await parseApiRequest<UpdateUserRequestDto & { profile?: UpdateProfileRequestDto }>(request);

  try {
    const updatedUser = await userService.update(userId, body);
    return {
      success: true,
      data: toUserResponseDto(updatedUser)
    };
  } catch (error) {
    console.error('Error updating user:', error);
    throw createSystemError('INTERNAL_ERROR', 'Failed to update user');
  }
});

// 내 정보 비활성화 (소프트 삭제)
export const DELETE = withApiHandler(async (request: Request): Promise<ApiResponse> => {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    throw createBusinessError('NOT_FOUND', auth.error || 'User not found');
  }

  const { userId } = auth as { userId: string };
  try {
    await userService.softDelete(userId);
    return {
      success: true,
      message: '사용자가 비활성화되었습니다.'
    };
  } catch (error) {
    console.error('Error deactivating user:', error);
    throw createSystemError('INTERNAL_ERROR', 'Failed to deactivate user');
  }
}); 