import { NextResponse } from 'next/server';
import { deviceTypeService } from '@repo/shared/services';
import type { CreateDeviceTypeRequestDto } from '@repo/shared/dto';

// 목록 조회
export async function GET() {
  try {
    const deviceTypes = await deviceTypeService.findMany({
      orderBy: { sort_key: 'asc' },
    });
    return NextResponse.json(deviceTypes);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error fetching device types: ${errorMessage}`);
    return NextResponse.json(
      { error: '장비 종류 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 신규 등록
export async function POST(request: Request) {
  try {
    const body: CreateDeviceTypeRequestDto = await request.json();
    const newDeviceType = await deviceTypeService.create(body);
    return NextResponse.json(newDeviceType, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error creating device type: ${errorMessage}`);
    return NextResponse.json(
      { error: '장비 종류 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}