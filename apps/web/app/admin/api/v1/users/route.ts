import { NextResponse } from 'next/server';
import { userService, CreateUserRequestDto } from '@repo/shared/services';

// 목록 조회
export async function GET() {
  try {
    const users = await userService.findMany();
    return NextResponse.json(users);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error fetching users: ${errorMessage}`);
    return NextResponse.json(
      { error: '사용자 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 신규 등록
export async function POST(request: Request) {
  try {
    const body: CreateUserRequestDto = await request.json();
    const newUser = await userService.create(body);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error creating user: ${errorMessage}`);
    return NextResponse.json(
      { error: '사용자 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}