import { NextResponse } from 'next/server';
import { usedDeviceService, companyService } from '@repo/shared/services';
import { toUsedDeviceListDtoArray } from '@repo/shared/transformers';
import { type UsedDeviceSearchRequestDto } from '@repo/shared/dto';
import { authenticateUser } from '@/libs/auth';
import { withApiHandler } from '@/libs/api-utils';
import { createAuthError } from '@/libs/errors';
import type { ApiResponse } from '@/types/api';

// 사용자의 의료 장비 목록 조회 API
export const GET = withApiHandler(async (request: Request): Promise<ApiResponse> => {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    throw createAuthError('UNAUTHORIZED', auth.error || '인증 실패');
  }
  const { userId } = auth as { userId: string };

  // 1. 사용자의 회사 정보 조회
  const companies = await companyService.findByOwnerId(userId);
  if (companies.length === 0) {
    return {
      success: true,
      data: [],
      message: '등록된 의료 장비가 없습니다.',
      meta: {
        timestamp: Date.now(),
        path: request.url,
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        }
      }
    };
  }
  const companyId = companies[0]!.id; // `!`로 null/undefined 아님을 단언

  // 2. 검색 조건 구성
  const searchParams = new URL(request.url).searchParams;
  const searchOptions: UsedDeviceSearchRequestDto = {
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: parseInt(searchParams.get('limit') || '10', 10),
    company_id: companyId.toString(),
    device_type_id: searchParams.has('deviceTypeId') ? parseInt(searchParams.get('deviceTypeId')!) : undefined,
    department_id: searchParams.has('departmentId') ? parseInt(searchParams.get('departmentId')!) : undefined,
    manufacturer_id: searchParams.has('manufacturerId') ? parseInt(searchParams.get('manufacturerId')!) : undefined,
  };

  // 3. 중고 장비 검색
  const result = await usedDeviceService.search(searchOptions);

  // 4. 결과 반환
  return {
    success: true,
    data: toUsedDeviceListDtoArray(result.data),
    message: '의료 장비 조회가 완료되었습니다.',
    meta: {
      timestamp: Date.now(),
      path: request.url,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
        hasNext: result.page < Math.ceil(result.total / result.limit),
        hasPrev: result.page > 1,
      }
    }
  };
});
