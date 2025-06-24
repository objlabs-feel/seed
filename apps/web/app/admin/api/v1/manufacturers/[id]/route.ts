import { NextResponse } from 'next/server';
import {
  getServices,
  UpdateManufacturerRequestDto,
} from '@repo/shared/services';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { manufacturer } = getServices();
    const id = Number(params.id);
    const body: UpdateManufacturerRequestDto = await request.json();
    const updatedManufacturer = await manufacturer.update(id, body);
    return NextResponse.json(updatedManufacturer);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error updating manufacturer: ${errorMessage}`);
    return NextResponse.json(
      { error: '제조사 수정 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { manufacturer } = getServices();
    const id = Number(params.id);
    await manufacturer.delete(id);
    return NextResponse.json({ message: 'Manufacturer deleted successfully' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error deleting manufacturer: ${errorMessage}`);
    return NextResponse.json(
      { error: '제조사 삭제 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}