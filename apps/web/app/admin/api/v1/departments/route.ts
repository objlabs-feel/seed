import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 목록 조회
export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { id: 'asc' }
    });
    return NextResponse.json(departments);
  } catch (error) {
    return NextResponse.json(
      { error: '진료과 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 신규 등록
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const department = await prisma.department.create({ data });
    return NextResponse.json(department);
  } catch (error) {
    return NextResponse.json(
      { error: '진료과 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}