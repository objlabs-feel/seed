import { NextResponse } from 'next/server';
import { prisma } from '@repo/shared';

export async function GET() {
  try {
    // 병원과, 장비유형, 제조사 정보를 병렬로 조회
    const [departments, deviceTypes, manufacturers] = await Promise.all([
      prisma.department.findMany({
        select: {
          id: true,
          name: true,
          code: true
        },
        orderBy: {
          name: 'desc'
        }
      }),
      prisma.deviceType.findMany({
        select: {
          id: true,
          name: true,
          code: true
        },
        orderBy: {
          name: 'desc'
        }
      }),
      prisma.manufacturer.findMany({
        select: {
          id: true,
          name: true
        },
        orderBy: {
          name: 'asc'
        }
      })
    ]);

    return NextResponse.json({
      departments,
      deviceTypes,
      manufacturers
    });
  } catch (error) {
    console.error('상수 데이터 조회 중 오류:', error);
    return NextResponse.json(
      { error: '상수 데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
