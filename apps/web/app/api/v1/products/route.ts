import { NextRequest, NextResponse } from 'next/server';
import { usedDeviceService, companyService } from '@repo/shared/services';
import { toUsedDeviceListDtoArray } from '@repo/shared/transformers';
import { type UsedDeviceSearchRequestDto } from '@repo/shared/dto';
import { authenticateUser } from '@/libs/auth';

// 사용자의 의료 장비 목록 조회 API
export async function GET(req: NextRequest) {
  const auth = await authenticateUser(req);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { userId } = auth as { userId: string };

  try {
    // 1. 사용자의 회사 정보 조회
    const companies = await companyService.findByOwnerId(userId);
    if (companies.length === 0) {
      return NextResponse.json({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 });
    }
    const companyId = companies[0]!.id; // `!`로 null/undefined 아님을 단언

    // 2. 검색 조건 구성
    const searchParams = req.nextUrl.searchParams;
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
    return NextResponse.json({
      items: toUsedDeviceListDtoArray(result.data),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
    });

  } catch (error) {
    console.error('의료 장비 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '의료 장비 조회 중 오류가 발생했습니다' },
      { status: 500 },
    );
  }
}
