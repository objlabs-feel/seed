import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();
    const deviceType = await prisma.deviceType.update({
      where: { id },
      data
    });
    return NextResponse.json(deviceType);
  } catch (error) {
    return NextResponse.json(
      { error: '장비 종류 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    await prisma.deviceType.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: '장비 종류 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}