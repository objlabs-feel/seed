import { userService } from '@repo/shared/services';
import { toUserResponseDto } from '@repo/shared/transformers';
import { authenticateAdmin } from '@/libs/auth';
import { createApiResponse, parseApiRequest, withApiHandler } from '@/libs/api-utils';
import { createSystemError, createBusinessError, createAuthError } from '@/libs/errors';
import type { ApiResponse } from '@/types/api';

// 사용자 목록 조회 (관리자용)
export const GET = withApiHandler(async (request: Request): Promise<ApiResponse> => {
  const auth = await authenticateAdmin(request);
  if (auth.status !== 200) {
    throw createAuthError('UNAUTHORIZED', '인증 실패');
  }

  try {
    const { query } = await parseApiRequest(request);
    const page = parseInt(query.get('page') || '1', 10);
    const limit = parseInt(query.get('limit') || '20', 10);
    const search = query.get('search') || '';

    const users = await userService.findMany({ page, limit, search });
    return {
      success: true,
      data: users.items.map(toUserResponseDto),
      meta: {
        pagination: {
          page: users.page,
          limit: users.limit,
          total: users.total,
          totalPages: users.totalPages,
          hasNext: users.hasNext,
          hasPrev: users.hasPrev
        }
      }
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw createSystemError('INTERNAL_ERROR', 'Failed to fetch users');
  }
});