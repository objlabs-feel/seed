import { NextResponse } from 'next/server';
import { getServices, UpdateCompanyRequestDto } from '@repo/shared/services';

// 회사 정보 조회
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { company: companyService } = getServices();
    const company = await companyService.findById(Number(params.id));
    if (!company) {
      return NextResponse.json({ error: '회사를 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json(company);
  } catch (error) {
    return NextResponse.json(
      { error: '회사 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

// 수정
export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { company: companyService } = getServices();
    const id = Number(params.id);
    const body: UpdateCompanyRequestDto = await request.json();
    const updatedCompany = await companyService.update(id, body);
    return NextResponse.json(updatedCompany);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error updating company: ${errorMessage}`);
    return NextResponse.json(
      { error: '회사 정보 수정 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

// 삭제
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { company: companyService } = getServices();
    const id = Number(params.id);
    await companyService.delete(id);
    return NextResponse.json({ message: 'Company deleted successfully' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error deleting company: ${errorMessage}`);
    return NextResponse.json(
      { error: '회사 정보 삭제 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}