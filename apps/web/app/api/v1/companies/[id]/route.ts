import { NextResponse } from 'next/server';
import { prisma } from '@repo/shared';

// 회사 정보 조회
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        profile: true
      }
    });

    if (!company) {
      return NextResponse.json(
        { error: '존재하지 않는 회사입니다.' },
        { status: 404 }
      );
    }

    // BigInt를 문자열로 변환
    const serializedCompany = JSON.stringify(company, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    );

    return NextResponse.json(JSON.parse(serializedCompany));
  } catch (error) {
    console.error('회사 정보 조회 중 오류:', error);
    return NextResponse.json(
      { error: '회사 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}