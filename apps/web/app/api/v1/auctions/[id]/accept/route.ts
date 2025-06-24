import { NextResponse } from 'next/server';
import { authenticateUser } from '@/libs/auth';
import { auctionItemService } from '@repo/shared/services';
import { toAuctionItemResponseDto } from '@repo/shared/transformers';
import { AuctionStatus } from '@repo/shared/types/models';
import { z } from 'zod';

// 거래완료 처리
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. 인증
    const auth = await authenticateUser(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // 2. 현재 상태 확인
    const auctionItem = await auctionItemService.findById(params.id);
    if (!auctionItem) {
      return NextResponse.json({ error: '경매 상품을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (auctionItem.status !== AuctionStatus.SUCCESS_BID) {
      return NextResponse.json({ error: '경매 상품이 낙찰 상태가 아닙니다.' }, { status: 400 });
    }

    if (auctionItem.buyer_steps !== 3 || auctionItem.seller_steps !== 3) {
      return NextResponse.json({ error: '경매 상품이 입금확인 상태가 아닙니다.' }, { status: 400 });
    }

    // 3. 거래완료 처리
    const updatedAuctionItem = await auctionItemService.update(params.id, {
      status: AuctionStatus.COMPLETED,
      seller_steps: 4,
      buyer_steps: 4,
    });

    // 4. 응답
    return NextResponse.json(toAuctionItemResponseDto(updatedAuctionItem));
  } catch (error) {
    console.error('Error accepting auction:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: '낙찰 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
