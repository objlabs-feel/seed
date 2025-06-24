import { deviceTypeService } from '@repo/shared/services';
import { withApiHandler } from '@/libs/api-utils';
import { CreateDeviceTypeRequestDto } from '@repo/shared/dto';
import { convertBigIntToString } from '@/libs/utils';
import { createSystemError } from '@/libs/errors';
import type { ApiResponse } from '@/types/api';

// 목록 조회
export const GET = withApiHandler(async (request: Request): Promise<ApiResponse> => {
  try {
    const deviceTypes = await deviceTypeService.findMany({
      orderBy: { sort_key: 'asc' },
    });

    return {
      success: true,
      data: convertBigIntToString(deviceTypes),
      message: '장비 종류 목록을 성공적으로 조회했습니다.',
      meta: {
        timestamp: Date.now(),
        path: request.url
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error fetching device types: ${errorMessage}`);
    throw createSystemError('INTERNAL_ERROR', '장비 종류 목록 조회 중 오류가 발생했습니다.');
  }
});

// 신규 등록
export const POST = withApiHandler(async (request: Request): Promise<ApiResponse> => {
  try {
    const body: CreateDeviceTypeRequestDto = await request.json();
    const newDeviceType = await deviceTypeService.create(body);
    return {
      success: true,
      data: convertBigIntToString(newDeviceType),
      message: '장비 종류를 성공적으로 생성했습니다.',
      meta: {
        timestamp: Date.now(),
        path: request.url
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error creating device type: ${errorMessage}`);
    throw createSystemError('INTERNAL_ERROR', '장비 종류 등록 중 오류가 발생했습니다.');
  }
});