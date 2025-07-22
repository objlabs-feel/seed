import { NextResponse } from 'next/server';
import { salesTypeService } from '@repo/shared/services';
import { toSalesTypeListDtoArray } from '@repo/shared/transformers';
import { authenticateUser } from '@/libs/auth';
import { createApiResponse, withApiHandler } from '@/libs/api-utils';
import { createSystemError } from '@/libs/errors';
import type { ApiResponse } from '@/types/api';

export const GET = withApiHandler(async (request: Request): Promise<ApiResponse> => {
  try {
    const salesTypes = await salesTypeService.findMany({
      orderBy: { id: 'asc' },
    });
    const salesTypesDto = toSalesTypeListDtoArray(salesTypes);

    return {
      success: true,
      data: salesTypesDto,
      message: '판매유형 목록을 성공적으로 조회했습니다.',
      meta: {
        timestamp: Date.now(),
        path: request.url,
      }
    };
  } catch (error) {
    console.error('판매유형 목록 조회 중 오류:', error);
    throw createSystemError('INTERNAL_ERROR', 'Failed to fetch sales types');
  }
});