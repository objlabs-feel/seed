import { NextResponse } from 'next/server';
import { prisma } from '@repo/shared';
import { convertBigIntToString } from '@/lib/utils';
import { authenticateUser } from '@/lib/auth';
import { sendNotification } from '@/lib/notification';
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
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { userId } = auth;
  try {
    const body = await request.json();

    // 프로파일 조회 및 생성을 트랜잭션으로 처리
    const profileAndCompany = await prisma.$transaction(async (tx) => {
      // 기존 프로파일 조회
      let profile = await tx.profile.findFirst({
        where: {
          user: {
            id: BigInt(userId)
          }
        }
      });

      let company;
      
      if (!profile) {
        profile = await tx.profile.create({
          data: {
            user: {
              connect: {
                id: BigInt(userId)
              }
            },
            name: body.name,
            mobile: body.phone
          }
        });

        company = await tx.company.create({
          data: {
            name: body.hospitalName,
            area: body.location,
            owner_id: BigInt(userId),
            business_mobile: body.phone,
            profile: {
              connect: {
                id: profile.id
              }
            }
          }
        });
      } else {
        company = await tx.company.findFirst({
          where: {
            owner_id: BigInt(userId)
          }
        });

        if (!company) {
          company = await tx.company.create({
            data: {
              name: body.hospitalName,
              area: body.location,
              owner_id: Number(userId),
              business_mobile: body.phone,
              profile: {
                connect: {
                  id: profile.id
                }
              }
            }
          });
        }
      }

      return { profile, company };
    });

    // 오늘 생성된 경매 건수 조회
    const today = new Date();

    // department와 device_type 정보 조회
    const [department, deviceType] = await Promise.all([
      prisma.department.findUnique({
        where: { id: parseInt(body.department) }
      }),
      prisma.deviceType.findUnique({
        where: { id: parseInt(body.equipmentType) }
      })
    ]);

    if (!department || !deviceType) {
      throw new Error('진료과 또는 기기 유형 정보를 찾을 수 없습니다.');
    }        

    // 트랜잭션으로 medical_device와 auction_item 동시 생성
    const result = await prisma.$transaction(async (tx) => {
      // auction_code 생성
      const year = today.getFullYear().toString().slice(-2);
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');

      const todayCount = await prisma.auctionItem.count({
        where: {
          auction_code: {
            startsWith: `${department.code}${deviceType.code}${year}${month}${day}`
          },
        }
      });

      const sequence = String(todayCount + 1).padStart(2, '0');
      const auction_code = `${department.code}${deviceType.code}${year}${month}${day}${sequence}`;

      const device = await tx.medicalDevice.create({
        data: {
          company_id: profileAndCompany.company.id,
          department_id: parseInt(body.department),
          device_type_id: parseInt(body.equipmentType),
          manufacturer_id: parseInt(body.manufacturer_id),
          manufacture_year: body.manufacturingYear ? parseInt(body.manufacturingYear) : null,
          images: body.images || [],
          description: body.description
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
          medical_device: {
            include: {
              deviceType: true
            }
          }
        }
      });

      return {...auctionItem, ...profileAndCompany};
    });

    // 경매 상품 등록 알림발송
    // 경매 상품 등록은 'all' 토픽에 알림발송
    await sendNotification({
      type: 'BROADCAST',
      title: '경매 상품 등록',
      body: `경매 상품 [${result.medical_device?.deviceType?.name}]이 등록되었습니다.\n[경매번호: ${result.auction_code}]`,
      data: {
        type: 'AUCTION',
        screen: 'AuctionDetail',
        targetId: result.id.toString(),
        auction_code: result.auction_code,
        title: '경매 상품 등록',
        body: `경매 상품 [${result.medical_device?.deviceType?.name}]이 등록되었습니다.\n[경매번호: ${result.auction_code}]`
      }
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