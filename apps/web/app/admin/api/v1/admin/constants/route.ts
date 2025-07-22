import { getServiceManager } from '@repo/shared/services';
import { NextResponse } from 'next/server';
import { createApiResponse, parseApiRequest, withApiHandler } from '@/libs/api-utils';
import { createValidationError, createSystemError, createAuthError } from '@/libs/errors';
import type { ApiResponse } from '@/types/api';

export const GET = withApiHandler(async (request: Request): Promise<ApiResponse> => {
  try {
    const constants = await getServiceManager().systemEnvironmentService.getParameters();
    return {
      success: true,
      data: constants,
      message: '시스템 환경 변수를 성공적으로 조회했습니다.',
      meta: {
        timestamp: Date.now(),
        path: request.url
      }
    };
  } catch (error) {
    console.error('Error fetching system environments:', error);
    throw createSystemError('INTERNAL_ERROR', 'Failed to fetch system environments');
  }
});