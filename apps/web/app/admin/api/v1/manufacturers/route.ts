import { NextResponse } from 'next/server';
import { manufacturerService } from '@repo/shared/services';
import type { CreateManufacturerRequestDto } from '@repo/shared/dto';
import { withApiHandler } from '@/libs/api-utils';
import type { ApiResponse } from '@/types/api';
import { convertBigIntToString } from '@/libs/utils';
import { createSystemError } from '@/libs/errors';

// 목록 조회
export const GET = withApiHandler(async (request: Request): Promise<ApiResponse> => {
  try {
    const manufacturers = await manufacturerService.findMany({
      orderBy: { name: 'asc' },
    });
    return {
      success: true,
      data: convertBigIntToString(manufacturers),
      message: '제조사 목록을 성공적으로 조회했습니다.',
      meta: {
        timestamp: Date.now(),
        path: request.url
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error fetching manufacturers: ${errorMessage}`);
    throw createSystemError('INTERNAL_ERROR', '제조사 목록 조회 중 오류가 발생했습니다.');
  }
});

// 신규 등록
export const POST = withApiHandler(async (request: Request): Promise<ApiResponse> => {
  try {
    const body: CreateManufacturerRequestDto = await request.json();
    const newManufacturer = await manufacturerService.create(body);
    return {
      success: true,
      data: convertBigIntToString(newManufacturer),
      message: '제조사를 성공적으로 생성했습니다.',
      meta: {
        timestamp: Date.now(),
        path: request.url
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error creating manufacturer: ${errorMessage}`);
    throw createSystemError('INTERNAL_ERROR', '제조사 등록 중 오류가 발생했습니다.');
  }
});