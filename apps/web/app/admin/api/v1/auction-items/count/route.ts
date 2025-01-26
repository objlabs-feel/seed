import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0];

    const startOfDay = new Date(date + 'T00:00:00Z');
    const endOfDay = new Date(date + 'T23:59:59Z');

    const count = await prisma.auctionItem.count({
      where: {
        created_at: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('경매 건수 조회 중 오류:', error);
    return NextResponse.json(
      { error: '경매 건수 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}