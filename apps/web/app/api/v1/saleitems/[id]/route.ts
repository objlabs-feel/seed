import { saleItemService, userService } from '@repo/shared/services';
import { authenticateUser } from '@/libs/auth';
import { parseApiRequest, withApiHandler } from '@/libs/api-utils';
import { createSystemError, createBusinessError, createAuthError } from '@/libs/errors';
import type { ApiResponse } from '@/types/api';
import { bigintToString, toSaleItemResponseDto, toUserResponseDto } from '@repo/shared/transformers';
import { convertBigIntToString } from '@/libs/utils';

export const GET = withApiHandler(async (request: Request, context: { params: { id: string } }): Promise<ApiResponse> => {
  const { id } = context.params;

  try {
    const user = await authenticateUser(request);
    if (!user) {
      throw createAuthError('UNAUTHORIZED', '인증이 필요합니다.');
    }

    const saleItem = await saleItemService.findByIdWithItem(id);
    if (!saleItem) {
      throw createBusinessError('NOT_FOUND', '판매 상품을 찾을 수 없습니다.');
    }

    const owner = await userService.findById(saleItem.owner_id);

    return {
      success: true,
      data: {
        ...saleItem,
        item: convertBigIntToString(saleItem.item),
        user: owner ? toUserResponseDto(owner) : null
      },
      message: '판매 상품 정보를 성공적으로 조회했습니다.',
      meta: {
        timestamp: Date.now(),
        path: request.url
      }
    };
  } catch (error) {
    console.error('Error fetching sale item:', error);
    throw createSystemError('INTERNAL_ERROR', 'Failed to fetch sale item');
  }
});