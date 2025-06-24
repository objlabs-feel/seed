import { companyService } from '@repo/shared/services';
import { createApiResponse, parseApiRequest, withApiHandler } from '@/libs/api-utils';
import { createValidationError, createSystemError, createBusinessError } from '@/libs/errors';
import type { ApiResponse } from '@/types/api';
import type { CreateCompanyRequestDto } from '@repo/shared/dto';

/**
 * GET /admin/api/v1/companies
 * 회사 목록을 조회합니다.
 */
export const GET = withApiHandler(async (request: Request): Promise<ApiResponse> => {
  try {
    const companies = await companyService.findMany();

    return {
      success: true,
      data: companies,
      message: '회사 목록을 성공적으로 조회했습니다.',
      meta: {
        timestamp: Date.now(),
        path: request.url
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error fetching companies: ${errorMessage}`);
    throw createSystemError('INTERNAL_ERROR', '회사 목록 조회 중 오류가 발생했습니다.');
  }
});

/**
 * POST /admin/api/v1/companies
 * 회사를 생성합니다.
 */
export const POST = withApiHandler(async (request: Request): Promise<ApiResponse> => {
  const { body } = await parseApiRequest<CreateCompanyRequestDto>(request);

  try {
    const newCompany = await companyService.create(body);

    return {
      success: true,
      data: newCompany,
      message: '회사를 성공적으로 생성했습니다.',
      meta: {
        timestamp: Date.now(),
        path: request.url
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error creating company: ${errorMessage}`);
    throw createSystemError('INTERNAL_ERROR', '회사 생성 중 오류가 발생했습니다.');
  }
});