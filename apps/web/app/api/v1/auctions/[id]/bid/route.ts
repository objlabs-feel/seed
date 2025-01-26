import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { convertBigIntToString } from '@/lib/utils';
import { authenticateUser } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { userId } = auth;

  try {
    const auctionItemId = parseInt(params.id);
    const { value } = await request.json();

    const history = await prisma.auctionItemHistory.create({
      data: {
        auction_item_id: auctionItemId,
        user_id: BigInt(userId),
        value
      }
    });

    return NextResponse.json(convertBigIntToString(history));
  } catch (error) {
    console.error('입찰 처리 중 오류:', error);
    return NextResponse.json(
      { error: '입찰 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}