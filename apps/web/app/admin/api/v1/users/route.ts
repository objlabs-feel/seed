import { userService } from '@repo/shared/services';
import { CreateUserRequestDto } from '@repo/shared/types/dto';
import { authenticateAdmin } from '@/libs/auth';
import { parseApiRequest, withApiHandler } from '@/libs/api-utils';
import { createSystemError, createAuthError } from '@/libs/errors';
import type { ApiResponse } from '@/types/api';
import { convertBigIntToString } from '@/libs/utils';

// 사용자 목록 조회 (관리자용)
export const GET = withApiHandler(async (request: Request): Promise<ApiResponse> => {
  const auth = await authenticateAdmin(request);
  if (auth.status !== 200) {
    throw createAuthError('UNAUTHORIZED', '인증 실패');
  }

  try {
    const { query } = await parseApiRequest(request);

    const searchOptions = {
      page: parseInt(query.get('page') || '1', 10),
      limit: parseInt(query.get('limit') || '10', 10),
      status: query.has('status') ? parseInt(query.get('status')!) : undefined,
      profile_name: query.get('profile_name') || undefined,
      email: query.get('email') || undefined,
      mobile: query.get('mobile') || undefined,
    };

    const result = await userService.findWithPagination(searchOptions);

    // console.log('result', result);

    return {
      success: true,
      data: convertBigIntToString(result.data),
      meta: {
        timestamp: Date.now(),
        path: request.url,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit),
          hasNext: result.page < Math.ceil(result.total / result.limit),
          hasPrev: result.page > 1
        }
      }
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw createSystemError('INTERNAL_ERROR', 'Failed to fetch users');
  }
});

// 신규 등록
export const POST = withApiHandler(async (request: Request): Promise<ApiResponse> => {
  const auth = await authenticateAdmin(request);
  if (auth.status !== 200) {
    throw createAuthError('UNAUTHORIZED', '인증 실패');
  }

  try {
    const { body } = await parseApiRequest<CreateUserRequestDto>(request);
    const newUser = await userService.create(body);

    return {
      success: true,
      data: newUser
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw createSystemError('INTERNAL_ERROR', 'Failed to create user');
  }
});