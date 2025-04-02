import { NextResponse } from 'next/server';
import { prisma } from '@repo/shared';
import { convertBigIntToString } from '@/lib/utils';

export async function GET(request: Request) {
  try {
  // 세션 확인
    const { searchParams } = new URL(request.url);

    // 필터 파라미터 추출
    const deviceTypes = searchParams.getAll('deviceTypes');
    const areas = searchParams.getAll('areas');
    const departments = searchParams.getAll('departments');

    // 페이징 파라미터 추출
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // 필터 조건 구성
    const where = {
      AND: [
        // 장비 유형 필터
        deviceTypes.length > 0 ? {
          medical_device: {
            deviceType: {
              name: {
                in: deviceTypes
              }
            }
          }
        } : {},
        // 지역 필터
        areas.length > 0 ? {
          medical_device: {
            company: {
              area: {
                in: areas
              }
            }
          }
        } : {},
        // 진료과 필터
        departments.length > 0 ? {
          medical_device: {
            department: {
              name: {
                in: departments
              }
            }
          }
        } : {},
        {
          status: {
            in: [0, 1]
          }
        }
      ]
    };

    // 데이터 조회
    const [auctions, total] = await Promise.all([
      prisma.auctionItem.findMany({
        where,
        include: {
          medical_device: {
            include: {
              deviceType: true,
              company: true,
              department: true,              
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.auctionItem.count({ where })
    ]);

    return NextResponse.json({
      items: convertBigIntToString(auctions),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error in auction search:', error);
    return NextResponse.json(
      { error: '경매 상품 검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 