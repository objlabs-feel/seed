import { getServiceManager } from '@repo/shared/services';
import { toAdminResponseDto } from '@repo/shared/transformers';
import { createApiResponse, parseApiRequest, withApiHandler } from '@/libs/api-utils';
import { createSystemError, createBusinessError, createAuthError } from '@/libs/errors';
import type { ApiResponse } from '@/types/api';

export const POST = withApiHandler(async (request: Request): Promise<ApiResponse> => {
  try {
    const { body } = await parseApiRequest<{ username: string; password: string }>(request);
    const { username, password } = body;

    const adminService = getServiceManager().adminService;

    const adminToken = request.headers.get('admin_token');
    const adminCount = await adminService.count();
    if (!adminToken && adminCount > 0) {
      throw createAuthError('UNAUTHORIZED', '관리자 계정 생성 권한이 없습니다.');
    }

    const existingAdmin = await adminService.findByUsername(username);
    if (existingAdmin) {
      throw createBusinessError('ALREADY_EXISTS', '이미 존재하는 사용자명입니다.');
    }

    const admin = await adminService.create({
      username,
      password,
      email: '',
      level: 1, // Default level
    });

    return {
      success: true,
      data: toAdminResponseDto(admin),
      message: '관리자 계정이 성공적으로 생성되었습니다.',
      meta: {
        timestamp: Date.now(),
        path: request.url
      }
    };
  } catch (error) {
    console.error('Error registering admin:', error);
    throw createSystemError('INTERNAL_ERROR', 'Failed to register admin');
  }
});