import { getServiceManager } from '@repo/shared/services';
import { authenticateUser } from '@/libs/auth';
import { parseApiRequest, withApiHandler } from '@/libs/api-utils';
import { createSystemError, createBusinessError, createAuthError } from '@/libs/errors';
import type { ApiResponse } from '@/types/api';
import { convertBigIntToString } from '@/libs/utils';

/**
 * GET /users/[id]/saleitems
 * 특정 사용자의 판매등록 상품 목록 조회
 */
export const GET = withApiHandler(async (request: Request): Promise<ApiResponse> => {
  console.log('=== API 호출 시작 ===');

  try {
    const { query } = await parseApiRequest(request);
    const salesType = query.get('sales_type');
    const status = query.get('status');
    const page = parseInt(query.get('page') || '1', 10);
    const limit = parseInt(query.get('limit') || '20', 10);

    console.log('Query params:', { salesType, status, page, limit });

    console.log('=== 인증 시작 ===');
    const auth = await authenticateUser(request);
    console.log('Auth result:', auth);

    if ('error' in auth) {
      console.log('인증 실패:', auth.error);
      throw createAuthError('UNAUTHORIZED', auth.error || '인증 실패');
    }

    const user = await getServiceManager().userService.findById(auth.userId as string);

    if (!user) {
      throw createBusinessError('NOT_FOUND', '사용자를 찾을 수 없습니다.');
    }

    const profile = user.profile;

    const whereConditions: any = {
      owner_id: user.id,
    };

    if (salesType) {
      whereConditions.sales_type = parseInt(salesType, 10);
    }

    if (status) {
      whereConditions.status = parseInt(status, 10);
    }

    console.log('=== 판매 아이템 조회 시작 ===');
    console.log('Where conditions:', whereConditions);

    const result = await getServiceManager().saleItemService.findWithPagination({
      page,
      limit,
      where: whereConditions,
      orderBy: { created_at: 'desc' },
    });

    console.log('=== 조회 결과 ===');
    console.log('Result:', result);
    console.log('Data length:', result.data?.length);

    return {
      success: true,
      data: convertBigIntToString(result.data),
      message: '판매상품 목록을 성공적으로 조회했습니다.',
      meta: {
        timestamp: Date.now(),
        path: request.url,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNext: result.page < result.totalPages,
          hasPrev: result.page > 1,
        }
      }
    };
  } catch (error) {
    console.error('=== 에러 발생 ===');
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Full error:', error);
    throw createSystemError('INTERNAL_ERROR', 'Failed to fetch sale items');
  }
});