import { NextResponse } from 'next/server';
import { departmentService } from '@repo/shared/services';
import {
  toDepartmentResponseDto,
  toDepartmentListDtoArray,
} from '@repo/shared/transformers';
import { type CreateDepartmentRequestDto } from '@repo/shared/dto';
import { authenticateUser } from '@/libs/auth';
import { createApiResponse, withApiHandler } from '@/libs/api-utils';
import { createSystemError } from '@/libs/errors';
import type { ApiResponse } from '@/types/api';

// 목록 조회
export const GET = withApiHandler(async (request: Request): Promise<ApiResponse> => {
  const authResult = await authenticateUser(request);
  if ('error' in authResult) {
    return {
      success: false,
      error: authResult.error,
      status: authResult.status,
    };
  }

  try {
    const departments = await departmentService.findMany({
      orderBy: { id: 'asc' },
      include: {
        deviceTypes: {
          include: {
            deviceType: true,
          },
        },
      },
    });
    const departmentsDto = toDepartmentListDtoArray(departments);

    return {
      success: true,
      data: departmentsDto,
      message: '진료과 목록을 성공적으로 조회했습니다.',
      meta: {
        timestamp: Date.now(),
        path: request.url,
      }
    };
  } catch (error) {
    console.error('진료과 목록 조회 중 오류:', error);
    throw createSystemError('INTERNAL_ERROR', 'Failed to fetch departments');
  }
});

// // 신규 등록
// export async function POST(request: Request) {
//   const auth = await authenticateAdmin(request);
//   if (auth.status !== 200) {
//     return NextResponse.json({ error: '인증 실패' }, { status: auth.status });
//   }

//   try {
//     const data: CreateDepartmentRequestDto = await request.json();

//     const department = await departmentService.create(data);
//     const departmentDto = toDepartmentResponseDto(department);
//     return NextResponse.json(departmentDto, { status: 201 });
//   } catch (error) {
//     console.error('진료과 등록 중 오류:', error);
//     return NextResponse.json(
//       { error: '진료과 등록 중 오류가 발생했습니다.' },
//       { status: 500 },
//     );
//   }
// }