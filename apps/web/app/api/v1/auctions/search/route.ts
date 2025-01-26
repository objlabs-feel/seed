import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { convertBigIntToString } from '@/lib/utils';

export async function GET(request: Request) {
  try {
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
  } catch (error) {
    console.error('경매 상품 검색 중 오류:', error);
    return NextResponse.json(
      { error: '경매 상품 검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 