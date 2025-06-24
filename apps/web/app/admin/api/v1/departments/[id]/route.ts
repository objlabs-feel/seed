import { NextResponse } from 'next/server';
import {
  departmentService,
  UpdateDepartmentRequestDto,
} from '@repo/shared/services';

// 수정
export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const id = Number(params.id);
    const body: UpdateDepartmentRequestDto = await request.json();
    const updatedDepartment = await departmentService().update(id, body);
    return NextResponse.json(updatedDepartment);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error updating department: ${errorMessage}`);
    return NextResponse.json(
      { error: '부서 수정 중 오류가 발생했습니다.' },
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
    const id = Number(params.id);
    await departmentService().delete(id);
    return NextResponse.json({ message: 'Department deleted successfully' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error deleting department: ${errorMessage}`);
    return NextResponse.json(
      { error: '부서 삭제 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}