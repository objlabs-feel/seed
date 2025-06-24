import { NextResponse } from 'next/server';
import { companyService } from '@repo/shared/services';
import { toCompanyDetailResponseDto } from '@repo/shared/transformers';
import { authenticateUser } from '@/libs/auth';
import { type UpdateCompanyRequestDto } from '@repo/shared/dto';

interface RouteContext {
  params: { id: string };
}

// 회사 정보 조회
export async function GET(request: Request, context: RouteContext) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = context.params;
  try {
    const company = await companyService.findById(id);

    if (!company) {
      return NextResponse.json(
        { error: '존재하지 않는 회사입니다.' },
        { status: 404 },
      );
    }

    // 기본적인 권한 확인: 요청자와 소유자가 같은지 확인
    if (company.owner_id?.toString() !== auth.userId) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const companyDto = toCompanyDetailResponseDto(company);

    return NextResponse.json(companyDto);
  } catch (error) {
    console.error('회사 정보 조회 중 오류:', error);
    return NextResponse.json(
      { error: '회사 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

// 회사 정보 수정
export async function PUT(request: Request, context: RouteContext) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { userId } = auth as { userId: string };
  const { id } = context.params;

  try {
    // 수정 전 회사 정보 조회하여 소유권 확인
    const existingCompany = await companyService.findById(id);
    if (!existingCompany) {
      return NextResponse.json({ error: '존재하지 않는 회사입니다.' }, { status: 404 });
    }
    if (existingCompany.owner_id?.toString() !== userId) {
      return NextResponse.json({ error: '수정 권한이 없습니다.' }, { status: 403 });
    }

    const updateData: UpdateCompanyRequestDto = await request.json();
    const updatedCompany = await companyService.update(id, updateData);
    const companyDto = toCompanyDetailResponseDto(updatedCompany);

    return NextResponse.json(companyDto);
  } catch (error) {
    console.error('회사 정보 수정 중 오류:', error);
    return NextResponse.json(
      { error: '회사 정보 수정 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

// 회사 정보 삭제 (소프트 삭제)
export async function DELETE(request: Request, context: RouteContext) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { userId } = auth as { userId: string };
  const { id } = context.params;

  try {
    // 삭제 전 회사 정보 조회하여 소유권 확인
    const existingCompany = await companyService.findById(id);
    if (!existingCompany) {
      return NextResponse.json({ error: '존재하지 않는 회사입니다.' }, { status: 404 });
    }
    if (existingCompany.owner_id?.toString() !== userId) {
      return NextResponse.json({ error: '삭제 권한이 없습니다.' }, { status: 403 });
    }

    await companyService.softDelete(id);

    return NextResponse.json({ message: '회사가 비활성화되었습니다.' }, { status: 200 });
  } catch (error) {
    console.error('회사 정보 삭제 중 오류:', error);
    return NextResponse.json(
      { error: '회사 정보 삭제 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}