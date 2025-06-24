import { NextResponse } from 'next/server';
import { companyService } from '@repo/shared/services';
import { toCompanyListDtoArray } from '@repo/shared/transformers';
import { type CompanySearchRequestDto } from '@repo/shared/dto';
import { authenticateUser } from '@/libs/auth';

export async function GET(request: Request) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const searchOptions: CompanySearchRequestDto = {
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '10', 10),
      name: searchParams.get('name') || undefined,
      business_no: searchParams.get('business_no') || undefined,
      company_type: searchParams.has('company_type') ? parseInt(searchParams.get('company_type')!, 10) : undefined,
      profile_name: searchParams.get('profile_name') || undefined,
    };

    const result = await companyService.search(searchOptions);

    return NextResponse.json({
      items: toCompanyListDtoArray(result.data),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
    });
  } catch (error) {
    console.error('업체 목록 조회 중 오류:', error);
    return NextResponse.json(
      { error: '업체 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}