import { systemEnvironmentService } from '@repo/shared/services';
import { createApiResponse, parseApiRequest, withApiHandler } from '@/libs/api-utils';
import { createValidationError, createSystemError, createBusinessError } from '@/libs/errors';
import type { ApiResponse } from '@/types/api';
import type { CreateSystemEnvironmentRequestDto } from '@repo/shared/dto';

/**
 * GET /admin/api/v1/system-environments
 * 시스템 환경 변수를 조회합니다.
 */
export const GET = withApiHandler(async (request: Request): Promise<ApiResponse> => {
  try {
    const systemEnvironments = await systemEnvironmentService.findMany();

    return {
      success: true,
      data: systemEnvironments,
      message: '시스템 환경 변수를 성공적으로 조회했습니다.',
      meta: {
        timestamp: Date.now(),
        path: request.url
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error fetching system environments: ${errorMessage}`);
    throw createSystemError('INTERNAL_ERROR', '시스템 환경 목록 조회 중 오류가 발생했습니다.');
  }
});

/**
 * POST /admin/api/v1/system-environments
 * 시스템 환경 변수를 생성합니다.
 */
export const POST = withApiHandler(async (request: Request): Promise<ApiResponse> => {
  const { body } = await parseApiRequest<CreateSystemEnvironmentRequestDto>(request);

  try {
    const newSystemEnvironment = await systemEnvironmentService.create(body);

    return {
      success: true,
      data: newSystemEnvironment,
      message: '시스템 환경 변수를 성공적으로 생성했습니다.',
      meta: {
        timestamp: Date.now(),
        path: request.url
      }
    };
  } catch (error) {
    console.error('Error creating system environment:', error);
    throw createSystemError('INTERNAL_ERROR', '시스템 환경 변수 생성 중 오류가 발생했습니다.');
  }
});