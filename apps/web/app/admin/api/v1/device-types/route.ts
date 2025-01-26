import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const deviceTypes = await prisma.deviceType.findMany({
      orderBy: { id: 'asc' }
    });
    return NextResponse.json(deviceTypes);
  } catch (error) {
    return NextResponse.json(
      { error: '장비 종류 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const deviceType = await prisma.deviceType.create({ data });
    return NextResponse.json(deviceType);
  } catch (error) {
    return NextResponse.json(
      { error: '장비 종류 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}