import { NextResponse } from 'next/server';
import { companyService } from '@repo/shared/services';
import { toCompanyResponseDto } from '@repo/shared/transformers';
import { type CreateCompanyRequestDto } from '@repo/shared/dto';
import { authenticateUser } from '@/libs/auth';
import { createApiResponse, parseApiRequest, withApiHandler } from '@/libs/api-utils';
import type { ApiResponse } from '@/types/api';

export async function POST(request: Request) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { userId } = auth as { userId: string };

  try {
    const body: Omit<CreateCompanyRequestDto, 'owner_id'> = await request.json();
    const createData: CreateCompanyRequestDto = {
      ...body,
      owner_id: userId,
    };

    const company = await companyService.create(createData);
    const companyDto = toCompanyResponseDto(company);

    return NextResponse.json(companyDto, { status: 201 });
  } catch (error) {
    console.error('업체 등록 중 오류:', error);
    return NextResponse.json(
      { error: '업체 등록 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}