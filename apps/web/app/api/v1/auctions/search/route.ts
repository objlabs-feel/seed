import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { convertBigIntToString } from '@/lib/utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');

  try {
    if (!keyword) {
      const items = await prisma.auctionItem.findMany({
        include: {
          medical_device: {
            include: {
              department: true,
              deviceType: true,
              manufacturer: true,
              company: true
            }
          }
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
              }
            },
            {
              medical_device: {
                department: {
                  name: {
                    contains: keyword
                  }
                }
              }
            },
            {
              medical_device: {
                department: {
                  name: {
                    contains: keyword
                  }
                }
              }
            },
            {
              medical_device: {
                company: {
                  area: {
                    contains: keyword
                  }
                }
              }
            },
            {
              auction_code: {
                contains: keyword
              }
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