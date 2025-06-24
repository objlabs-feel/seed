import { NextResponse } from 'next/server';
import { manufacturerService } from '@repo/shared/services';
import type { CreateManufacturerRequestDto } from '@repo/shared/dto';

// 목록 조회
export async function GET() {
  try {
    const manufacturers = await manufacturerService.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(manufacturers);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error fetching manufacturers: ${errorMessage}`);
    return NextResponse.json(
      { error: '제조사 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 신규 등록
export async function POST(request: Request) {
  try {
    const body: CreateManufacturerRequestDto = await request.json();
    const newManufacturer = await manufacturerService.create(body);
    return NextResponse.json(newManufacturer, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error creating manufacturer: ${errorMessage}`);
    return NextResponse.json(
      { error: '제조사 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}