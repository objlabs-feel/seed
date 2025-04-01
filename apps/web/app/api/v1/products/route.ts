import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies, headers } from 'next/headers';
import { authenticateUser } from '@/lib/auth';
import { convertBigIntToString } from '@/lib/utils';

const prisma = new PrismaClient();

// 사용자의 의료 장비 목록 조회 API
export async function GET(req: NextRequest) {
  try {
    // 쿠키나 헤더에서 사용자 ID 가져오기 (인증 방식에 따라 수정 필요)
    const auth = await authenticateUser(req);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { userId } = auth;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: '인증이 필요합니다'
        },
        { status: 401 }
      );
    }

    // URL 쿼리 파라미터 가져오기
    const searchParams = req.nextUrl.searchParams;
    const deviceTypeId = searchParams.get('deviceTypeId');
    const departmentId = searchParams.get('departmentId');
    const manufacturerId = searchParams.get('manufacturerId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // 필터 객체 생성
    const filters: any = {
      company: {
        owner_id: BigInt(userId as string)
      }
    };

    // 추가 필터 적용
    if (deviceTypeId) {
      filters.device_type_id = parseInt(deviceTypeId);
    }
    if (departmentId) {
      filters.department_id = parseInt(departmentId);
    }
    if (manufacturerId) {
      filters.manufacturer_id = parseInt(manufacturerId);
    }

    // 의료 장비 조회
    const [devices, totalCount] = await Promise.all([
      prisma.medicalDevice.findMany({
        where: filters,
        include: {
          department: true,
          deviceType: true,
          manufacturer: true,
          company: {
            select: {
              id: true,
              name: true,
              area: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc'
        }
      }),
      prisma.medicalDevice.count({
        where: filters
      })
    ]);

    // 페이지네이션 정보
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: devices.map((device) => convertBigIntToString(device)),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('의료 장비 조회 중 오류 발생:', error);
    return NextResponse.json(
      {
        success: false,
        message: '의료 장비 조회 중 오류가 발생했습니다',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}
