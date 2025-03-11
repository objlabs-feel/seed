import { NextResponse } from 'next/server';
import { prisma } from '@repo/shared';

// 사용자 검색
export async function GET(request: Request) {
  const url = new URL(request.url);
  const search = url.searchParams.get('search') || '';
  const condition = url.searchParams.get('condition') || 'name'; // 기본 검색 조건을 'name'으로 설정

  try {
    const users = await prisma.profile.findMany({
      where: {
        [condition]: {
          contains: search,
          mode: 'insensitive',
        },
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('사용자 정보 조회 중 오류:', error);
    return NextResponse.json(
      { error: '사용자 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
