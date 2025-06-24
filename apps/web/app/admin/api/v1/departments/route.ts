import { departmentService } from '@repo/shared/services';
import { createApiResponse, parseApiRequest, withApiHandler } from '@/libs/api-utils';
import { createValidationError, createSystemError, createBusinessError } from '@/libs/errors';
import type { ApiResponse } from '@/types/api';
import type { CreateDepartmentRequestDto } from '@repo/shared/dto';

/**
 * GET /admin/api/v1/departments
 * 부서 목록을 조회합니다.
 */
export const GET = withApiHandler(async (request: Request): Promise<ApiResponse> => {
  try {
    const departments = await departmentService.findMany({
      orderBy: { sort_key: 'asc' },
    });

    return {
      success: true,
      data: departments,
      message: '부서 목록을 성공적으로 조회했습니다.',
      meta: {
        timestamp: Date.now(),
        path: request.url
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error fetching departments: ${errorMessage}`);
    throw createSystemError('INTERNAL_ERROR', '부서 목록 조회 중 오류가 발생했습니다.');
  }
});

/**
 * POST /admin/api/v1/departments
 * 부서를 생성합니다.
 */
export const POST = withApiHandler(async (request: Request): Promise<ApiResponse> => {
  const { body } = await parseApiRequest<CreateDepartmentRequestDto>(request);

  try {
    const newDepartment = await departmentService.create(body);

    return {
      success: true,
      data: newDepartment,
      message: '부서를 성공적으로 생성했습니다.',
      meta: {
        timestamp: Date.now(),
        path: request.url
      }
    };
  } catch (error) {
    console.error('Error creating department:', error);
    throw createSystemError('INTERNAL_ERROR', '부서 생성 중 오류가 발생했습니다.');
  }
});