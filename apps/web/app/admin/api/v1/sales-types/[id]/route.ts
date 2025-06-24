import { salesTypeService } from '@repo/shared/services';
import { createApiResponse, parseApiRequest, withApiHandler } from '@/libs/api-utils';
import { createValidationError, createSystemError, createBusinessError } from '@/libs/errors';
import type { ApiResponse } from '@/types/api';
import type { UpdateSalesTypeRequestDto } from '@repo/shared/dto';

/**
 * GET /admin/api/v1/sales-types/[id]
 * 특정 판매 유형을 조회합니다.
 */
export const GET = withApiHandler(async (
  request: Request,
  { params }: { params: { id: string } }
): Promise<ApiResponse> => {
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    throw createValidationError('INVALID_INPUT', '유효하지 않은 ID입니다.');
  }

  try {
    const salesType = await salesTypeService.findById(id);

    if (!salesType) {
      throw createBusinessError('NOT_FOUND', '판매 유형을 찾을 수 없습니다.');
    }

    return {
      success: true,
      data: salesType,
      message: '판매 유형을 성공적으로 조회했습니다.',
      meta: {
        timestamp: Date.now(),
        path: request.url
      }
    };
  } catch (error) {
    console.error(`Error fetching sales type ${params.id}:`, error);
    throw createSystemError('INTERNAL_ERROR', '판매 유형 조회 중 오류가 발생했습니다.');
  }
});

/**
 * PUT /admin/api/v1/sales-types/[id]
 * 특정 판매 유형을 수정합니다.
 */
export const PUT = withApiHandler(async (
  request: Request,
  { params }: { params: { id: string } }
): Promise<ApiResponse> => {
  const { body } = await parseApiRequest<UpdateSalesTypeRequestDto>(request);
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    throw createValidationError('INVALID_INPUT', '유효하지 않은 ID입니다.');
  }

  try {
    const updatedSalesType = await salesTypeService.update(id, body);

    return {
      success: true,
      data: updatedSalesType,
      message: '판매 유형을 성공적으로 수정했습니다.',
      meta: {
        timestamp: Date.now(),
        path: request.url
      }
    };
  } catch (error) {
    console.error(`Error updating sales type ${params.id}:`, error);
    throw createSystemError('INTERNAL_ERROR', '판매 유형 수정 중 오류가 발생했습니다.');
  }
});

/**
 * DELETE /admin/api/v1/sales-types/[id]
 * 특정 판매 유형을 삭제합니다.
 */
export const DELETE = withApiHandler(async (
  request: Request,
  { params }: { params: { id: string } }
): Promise<ApiResponse> => {
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    throw createValidationError('INVALID_INPUT', '유효하지 않은 ID입니다.');
  }

  try {
    const deletedSalesType = await salesTypeService.delete(id);

    return {
      success: true,
      data: deletedSalesType,
      message: '판매 유형을 성공적으로 삭제했습니다.',
      meta: {
        timestamp: Date.now(),
        path: request.url
      }
    };
  } catch (error) {
    console.error(`Error deleting sales type ${params.id}:`, error);
    throw createSystemError('INTERNAL_ERROR', '판매 유형 삭제 중 오류가 발생했습니다.');
  }
}); 