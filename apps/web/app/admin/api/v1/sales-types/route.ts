import { NextRequest, NextResponse } from 'next/server';
import {
  salesTypeService,
} from '@repo/shared/services';
import { CreateSalesTypeRequestDto } from '@repo/shared/dto';
import { withApiHandler } from '@/libs/api-utils';
import { convertBigIntToString } from '@/libs/utils';
import { createSystemError } from '@/libs/errors';
import type { ApiResponse } from '@/types/api';

/**
 * GET /admin/api/v1/sales-types
 * 판매 유형 목록을 조회합니다.
 */
export const GET = withApiHandler(async (request: Request): Promise<ApiResponse> => {
  try {
    const salesTypes = await salesTypeService.findMany({
      orderBy: { sort_key: 'asc' },
    });
    return {
      success: true,
      data: convertBigIntToString(salesTypes),
      message: '판매 유형 목록을 성공적으로 조회했습니다.',
      meta: {
        timestamp: Date.now(),
        path: request.url
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error fetching sales types: ${errorMessage}`);
    throw createSystemError('INTERNAL_ERROR', '판매 유형 목록 조회 중 오류가 발생했습니다.');
  }
});

/**
 * POST /admin/api/v1/sales-types
 * 새로운 판매 유형을 생성합니다.
 */
export const POST = withApiHandler(async (request: Request): Promise<ApiResponse> => {
  try {
    const body: CreateSalesTypeRequestDto = await request.json();
    const newSalesType = await salesTypeService.create(body);
    return {
      success: true,
      data: convertBigIntToString(newSalesType),
      message: '판매 유형을 성공적으로 생성했습니다.',
      meta: {
        timestamp: Date.now(),
        path: request.url
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error creating sales type: ${errorMessage}`);
    throw createSystemError('INTERNAL_ERROR', '판매 유형 등록 중 오류가 발생했습니다.');
  }
});