import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { convertBigIntToString } from '@/lib/utils';

// 경매 상품 목록 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const auction_code = searchParams.get('auction_code');
    const status = searchParams.get('status') ? parseInt(searchParams.get('status') || '0') : undefined;
    const user_id = searchParams.get('user_id') ? BigInt(searchParams.get('user_id') || '0') : undefined;
    const profile_id = searchParams.get('profile_id') ? parseInt(searchParams.get('profile_id') || '0') : undefined;
    const device_id = searchParams.get('device_id') ? parseInt(searchParams.get('device_id') || '0') : undefined;

    const skip = (page - 1) * limit;

    const where = {
      ...(auction_code && { auction_code }),
      ...(status !== undefined && { status }),
      ...(user_id && {
        auction_item_history: {
          some: { user_id }
        }
      }),
      ...(profile_id && {
        medical_device: {
          company: {
            profile: {
              id: profile_id
            }
          }
        }
      }),
      ...(device_id && {
        medical_device_id: device_id
      })
    };

    const [items, total] = await Promise.all([
      prisma.auctionItem.findMany({
        where,
        include: {
          medical_device: true,
          auction_item_history: {
            orderBy: {
              value: 'desc'
            },
            take: 1
          }
        },
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc'
        }
      }),
      prisma.auctionItem.count({ where })
    ]);

    return NextResponse.json({
      items: convertBigIntToString(items),
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + items.length < total
    });
  } catch (error) {
    console.error('경매 상품 목록 조회 중 오류:', error);
    return NextResponse.json(
      { error: '경매 상품 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 경매 상품 생성
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 오늘 생성된 경매 건수 조회
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const todayCount = await prisma.auctionItem.count({
      where: {
        created_at: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    // department와 device_type 정보 조회
    const [department, deviceType] = await Promise.all([
      prisma.department.findUnique({
        where: { id: parseInt(body.medical_device.department) }
      }),
      prisma.deviceType.findUnique({
        where: { id: parseInt(body.medical_device.device_type) }
      })
    ]);

    if (!department || !deviceType) {
      throw new Error('진료과 또는 기기 유형 정보를 찾을 수 없습니다.');
    }

    // auction_code 생성
    const year = today.getFullYear().toString().slice(-2);
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const sequence = String(todayCount + 1).padStart(2, '0');
    const auction_code = `${department.code}${deviceType.code}${year}${month}${day}${sequence}`;

    // 트랜잭션으로 medical_device와 auction_item 동시 생성
    const result = await prisma.$transaction(async (tx) => {
      const device = await tx.medicalDevice.create({
        data: {
          company_id: parseInt(body.medical_device.company_id),
          department: parseInt(body.medical_device.department),
          device_type: parseInt(body.medical_device.device_type),
          manufacturer_id: parseInt(body.medical_device.manufacturer_id),
          manufacture_date: body.medical_device.manufacture_date ? new Date(body.medical_device.manufacture_date) : null,
          images: body.medical_device.images,
          description: body.medical_device.description
        }
      });

      const auctionItem = await tx.auctionItem.create({
        data: {
          medical_device_id: device.id,
          auction_code,
          status: 0,
          expired_count: 0
        },
        include: {
          medical_device: true
        }
      });

      return auctionItem;
    });

    // BigInt 값을 문자열로 변환
    const responseData = convertBigIntToString(result);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('경매 상품 생성 중 오류:', error);
    return NextResponse.json(
      { error: '경매 상품 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}