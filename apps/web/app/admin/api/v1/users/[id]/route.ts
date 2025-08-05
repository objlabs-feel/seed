import {
  getServiceManager,
  userService,
} from '@repo/shared/services';
import { createApiResponse, parseApiRequest, withApiHandler } from '@/libs/api-utils';
import { createValidationError, createSystemError, createBusinessError } from '@/libs/errors';
import type { ApiResponse } from '@/types/api';
import type { UpdateUserRequestDto } from '@repo/shared/dto';
import { convertBigIntToString } from '@/libs/utils';

/**
 * GET /admin/api/v1/users/[id]
 * 이용자 정보를 조회합니다.
 */
export const GET = withApiHandler(async (
  request: Request,
  { params }: { params: { id: string } }
): Promise<ApiResponse> => {
  try {
    const user = await userService.findById(params.id);

    if (!user) {
      throw createBusinessError('NOT_FOUND', '존재하지 않는 이용자입니다.');
    }

    return {
      success: true,
      data: convertBigIntToString(user),
      message: '이용자 정보를 성공적으로 조회했습니다.',
      meta: {
        timestamp: Date.now(),
        path: request.url
      }
    };
  } catch (error) {
    console.error('이용자 정보 조회 중 오류:', error);
    throw createSystemError('INTERNAL_ERROR', '이용자 정보 조회 중 오류가 발생했습니다.');
  }
});

/**
 * PUT /admin/api/v1/users/[id]
 * 이용자 정보를 수정합니다.
 */
export const PUT = withApiHandler(async (
  request: Request,
  { params }: { params: { id: string } }
): Promise<ApiResponse> => {
  const { body } = await parseApiRequest<UpdateUserRequestDto>(request);

  try {
    const updatedUser = await userService.update(params.id, body);

    return {
      success: true,
      data: updatedUser,
      message: '이용자 정보를 성공적으로 수정했습니다.',
      meta: {
        timestamp: Date.now(),
        path: request.url
      }
    };
  } catch (error) {
    console.error('이용자 정보 수정 중 오류:', error);
    throw createSystemError('INTERNAL_ERROR', '이용자 정보 수정 중 오류가 발생했습니다.');
  }
});

/**
 * DELETE /admin/api/v1/users/[id]
 * 이용자 정보를 삭제합니다.
 */
export const DELETE = withApiHandler(async (
  request: Request,
  { params }: { params: { id: string } }
): Promise<ApiResponse> => {
  try {
    await userService.delete(params.id);

    return {
      success: true,
      data: null,
      message: '이용자 정보를 성공적으로 삭제했습니다.',
      meta: {
        timestamp: Date.now(),
        path: request.url
      }
    };
  } catch (error) {
    console.error('이용자 정보 삭제 중 오류:', error);
    throw createSystemError('INTERNAL_ERROR', '이용자 정보 삭제 중 오류가 발생했습니다.');
  }
});