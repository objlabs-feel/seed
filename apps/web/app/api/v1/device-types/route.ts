import { NextResponse } from 'next/server';
import { deviceTypeService } from '@repo/shared/services';
import {
  toDeviceTypeResponseDto,
  toDeviceTypeListDtoArray,
} from '@repo/shared/transformers';
import { type CreateDeviceTypeRequestDto } from '@repo/shared/dto';
import { authenticateUser } from '@/libs/auth';
import { createApiResponse, withApiHandler } from '@/libs/api-utils';
import { createSystemError } from '@/libs/errors';
import type { ApiResponse } from '@/types/api';

export const GET = withApiHandler(async (request: Request): Promise<ApiResponse> => {
  try {
    const deviceTypes = await deviceTypeService.findMany({
      orderBy: { id: 'asc' },
    });
    const deviceTypesDto = toDeviceTypeListDtoArray(deviceTypes);

    return {
      success: true,
      data: deviceTypesDto,
      message: '장비 종류 목록을 성공적으로 조회했습니다.',
      meta: {
        timestamp: Date.now(),
        path: request.url,
      }
    };
  } catch (error) {
    console.error('장비 종류 목록 조회 중 오류:', error);
    throw createSystemError('INTERNAL_ERROR', 'Failed to fetch device types');
  }
});

// export async function POST(request: Request) {
//   const auth = await authenticateAdmin(request);
//   if (auth.status !== 200) {
//     return NextResponse.json({ error: '인증 실패' }, { status: auth.status });
//   }

//   try {
//     const data: CreateDeviceTypeRequestDto = await request.json();

//     const deviceType = await deviceTypeService.create(data);
//     const deviceTypeDto = toDeviceTypeResponseDto(deviceType);
//     return NextResponse.json(deviceTypeDto, { status: 201 });
//   } catch (error) {
//     console.error('장비 종류 등록 중 오류:', error);
//     return NextResponse.json(
//       { error: '장비 종류 등록 중 오류가 발생했습니다.' },
//       { status: 500 },
//     );
//   }
// }