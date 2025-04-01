import { NextResponse } from 'next/server';
import { prisma } from '@repo/shared';
import { convertBigIntToString } from '@/lib/utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');
  console.log('keyword:', keyword);

  const today = new Date();
  const endDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  try {
    if (!keyword) {
      const items = await prisma.auctionItem.findMany({
        where: {
          OR: [
            {
              start_timestamp: {
                lte: endDate
              }
            },
            {
              status: 0
            }
          ]
        },
        include: {
          medical_device: {
            include: {
              department: true,
              deviceType: true,
              manufacturer: true,
              company: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      console.log('Search results:', items);
      return NextResponse.json(convertBigIntToString(items));
    } else {
      const items = await prisma.auctionItem.findMany({
        where: {
          OR: [
            {
              medical_device: {
                department: {
                  name: {
                    contains: keyword
                  }
                }
              },
              OR: [
                {
                  start_timestamp: {
                    lte: endDate
                  }
                },
                {
                  status: 0
                }
              ]
            },
            {
              medical_device: { deviceType: { name: { contains: keyword } } },
              OR: [
                {
                  start_timestamp: {
                    lte: endDate
                  }
                },
                {
                  status: 0
                }
              ]
            },
            {
              medical_device: {
                company: {
                  area: {
                    contains: keyword
                  }
                }
              },
              OR: [
                {
                  start_timestamp: {
                    lte: endDate
                  }
                },
                {
                  status: 0
                }
              ]
            },
            {
              auction_code: {
                contains: keyword
              },
              OR: [
                {
                  start_timestamp: {
                    lte: endDate
                  }
                },
                {
                  status: 0
                }
              ]
            }
          ],
        },
        include: {
          medical_device: {
            include: {
              department: true,
              deviceType: true,
              manufacturer: true,
              company: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      console.log('Search results:', items);
      return NextResponse.json(convertBigIntToString(items));
    }
  } catch (error) {
    console.error('경매 상품 검색 중 오류:', error);
    return NextResponse.json(
      { error: '경매 상품 검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 