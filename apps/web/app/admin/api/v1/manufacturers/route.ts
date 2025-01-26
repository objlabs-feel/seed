import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const manufacturers = await prisma.manufacturer.findMany({
      orderBy: { id: 'asc' }
    });
    return NextResponse.json(manufacturers);
  } catch (error) {
    return NextResponse.json(
      { error: '제조사 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const manufacturer = await prisma.manufacturer.create({
      data: {
        name: data.name,
        device_types: JSON.stringify(data.device_types),
        description: data.description
      }
    });
    return NextResponse.json(manufacturer);
  } catch (error) {
    return NextResponse.json(
      { error: '제조사 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}