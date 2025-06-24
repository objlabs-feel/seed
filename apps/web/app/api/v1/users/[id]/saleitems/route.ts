import { getServiceManager } from '@repo/shared/services';
import { authenticateUser } from '@/libs/auth';
import { parseApiRequest, withApiHandler } from '@/libs/api-utils';
import { createSystemError, createBusinessError, createAuthError } from '@/libs/errors';
import type { ApiResponse } from '@/types/api';

/**
 * GET /users/[id]/saleitems
 * 특정 사용자의 판매등록 상품 목록 조회
 */
export const GET = withApiHandler(async (request: Request, context: { params: { id: string } }): Promise<ApiResponse> => {
  const { id: userId } = context.params;

  const { query } = await parseApiRequest(request);
  const salesType = query.get('sales_type');
  const status = query.get('status');
  const page = parseInt(query.get('page') || '1', 10);
  const limit = parseInt(query.get('limit') || '20', 10);

  try {
    const auth = await authenticateUser(request);
    if ('error' in auth) {
      throw createAuthError('UNAUTHORIZED', auth.error || '인증 실패');
    }

    if (auth.userId !== userId) {
      throw createAuthError('UNAUTHORIZED', '접근 권한이 없습니다.');
    }

    const user = await getServiceManager().userService.findById(userId);
    if (!user) {
      throw createBusinessError('NOT_FOUND', '사용자를 찾을 수 없습니다.');
    }

    const profile = user.profile;
    if (!profile?.company_id) {
      return {
        success: true,
        data: [],
        message: '등록된 판매상품이 없습니다.',
        meta: {
          timestamp: Date.now(),
          path: request.url,
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          }
        }
      };
    }

    const whereConditions: any = {
      owner_id: profile.company_id,
    };

    if (salesType) {
      whereConditions.sales_type = parseInt(salesType, 10);
    }

    if (status) {
      whereConditions.status = parseInt(status, 10);
    }

    const result = await getServiceManager().saleItemService.findWithPagination({
      page,
      limit,
      where: whereConditions,
      orderBy: { created_at: 'desc' },
      include: {
        salesType: true,
        product: {
          include: {
            device: {
              include: {
                manufacturer: true,
                deviceType: true,
              },
            },
            company: true,
          },
        },
        auction: {
          include: {
            device: {
              include: {
                manufacturer: true,
                deviceType: true,
                department: true,
                company: true,
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      data: result.data,
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
    console.error('Error fetching sale items:', error);
    throw createSystemError('INTERNAL_ERROR', 'Failed to fetch sale items');
  }
});