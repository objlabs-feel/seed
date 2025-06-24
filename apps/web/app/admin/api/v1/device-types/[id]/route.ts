import { NextResponse } from 'next/server';
import {
  getServices,
  UpdateDeviceTypeRequestDto,
} from '@repo/shared/services';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { deviceType } = getServices();
    const id = Number(params.id);
    const body: UpdateDeviceTypeRequestDto = await request.json();
    const updatedDeviceType = await deviceType.update(id, body);
    return NextResponse.json(updatedDeviceType);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error updating device type: ${errorMessage}`);
    return NextResponse.json(
      { error: '장비 종류 수정 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { deviceType } = getServices();
    const id = Number(params.id);
    await deviceType.delete(id);
    return NextResponse.json({ message: 'Device type deleted successfully' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error deleting device type: ${errorMessage}`);
    return NextResponse.json(
      { error: '장비 종류 삭제 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}