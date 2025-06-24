// 상품 조회 이력 조회
// + 경매 참여 이력 조회(진행중인 경매만 조회)
// 옵션: 조회 기간 설정, 판매 상태 설정, 경매 상태 설정

import { getServiceManager } from '@repo/shared/services';
import { authenticateUser } from '@/libs/auth';
import { createApiResponse, parseApiRequest, withApiHandler } from '@/libs/api-utils';
import { createSystemError, createBusinessError, createAuthError } from '@/libs/errors';
import type { ApiResponse } from '@/types/api';
import { convertBigIntToString } from '@/libs/utils';

interface RouteContext {
  params: { id: string };
}

/**
 * GET /users/[id]/viewhistory
 * 특정 사용자의 상품 조회 이력 및 경매 참여 이력 조회
 */
export const GET = withApiHandler(async (request: Request): Promise<ApiResponse> => {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    throw createAuthError('UNAUTHORIZED', auth.error || '인증 실패');
  }

  const { query } = await parseApiRequest(request);
  const page = parseInt(query.get('page') || '1', 10);
  const limit = parseInt(query.get('limit') || '20', 10);

  try {
    const where: any = { owner_id: BigInt(auth.userId as string) };

    const { data, total } = await getServiceManager().saleItemViewHistoryService.findWithPagination({
      page,
      limit,
      where,
      orderBy: { created_at: 'desc' },
    });

    return {
      success: true,
      data: convertBigIntToString(data),
      meta: {
        timestamp: Date.now(),
        path: request.url,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        }
      }
    };
  } catch (error) {
    console.error('Error fetching view history:', error);
    throw createSystemError('INTERNAL_ERROR', 'Failed to fetch view history');
  }
});