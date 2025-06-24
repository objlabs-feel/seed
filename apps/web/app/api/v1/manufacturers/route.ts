import { NextResponse } from 'next/server';
import { manufacturerService } from '@repo/shared/services';
import {
  toManufacturerResponseDto,
  toManufacturerListDtoArray,
} from '@repo/shared/transformers';
import { type CreateManufacturerRequestDto } from '@repo/shared/dto';
import { authenticateUser } from '@/libs/auth';
import { createApiResponse, withApiHandler } from '@/libs/api-utils';
import { createSystemError } from '@/libs/errors';
import type { ApiResponse } from '@/types/api';

export const GET = withApiHandler(async (request: Request): Promise<ApiResponse> => {
  try {
    const manufacturers = await manufacturerService.findMany({
      orderBy: { id: 'asc' },
    });
    const manufacturersDto = toManufacturerListDtoArray(manufacturers);

    return {
      success: true,
      data: manufacturersDto,
      message: '제조사 목록을 성공적으로 조회했습니다.',
      meta: {
        timestamp: Date.now(),
        path: request.url,
      }
    };
  } catch (error) {
    console.error('제조사 목록 조회 중 오류:', error);
    throw createSystemError('INTERNAL_ERROR', 'Failed to fetch manufacturers');
  }
});

// export const POST = withApiHandler(async (request: Request): Promise<ApiResponse> => {
//   try {
//     const data: CreateManufacturerRequestDto = await request.json();
//     const manufacturer = await manufacturerService.create(data);
//     const manufacturerDto = toManufacturerResponseDto(manufacturer);

//     return {
//       success: true,
//       data: manufacturerDto,
//       message: '제조사를 성공적으로 등록했습니다.',
//       meta: {
//         timestamp: Date.now(),
//         path: request.url,
//       }
//     };
//   } catch (error) {
//     console.error('제조사 등록 중 오류:', error);
//     throw createSystemError('INTERNAL_ERROR', 'Failed to create manufacturer');
//   }
// });