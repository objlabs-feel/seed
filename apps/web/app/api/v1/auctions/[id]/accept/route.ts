import { NextResponse } from 'next/server';
import { authenticateUser } from '@/libs/auth';
import { auctionItemHistoryService, auctionItemService, notificationMessageService, notificationService } from '@repo/shared/services';
import { toAuctionItemResponseDto } from '@repo/shared/transformers';
import { AuctionStatus } from '@repo/shared/types/models';
import { z } from 'zod';
import { sendNotification } from '@/libs/notification';

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
    console.log('auth', auth);

    // 2. 현재 상태 확인
    const auctionItem = await auctionItemService.findById(params.id);
    if (!auctionItem) {
      return NextResponse.json({ error: '경매 상품을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (auctionItem.status !== AuctionStatus.SUCCESS_BID) {
      return NextResponse.json({ error: '경매 상품이 낙찰 상태가 아닙니다.' }, { status: 400 });
    }

    if (auctionItem.buyer_steps !== 4 || auctionItem.seller_steps !== 3) {
      return NextResponse.json({ error: '경매 상품이 입금확인 상태가 아닙니다.' }, { status: 400 });
    }

    const history = auctionItem.accept_id ? await auctionItemHistoryService.findById(auctionItem.accept_id.toString()) : null;

    if (!history) {
      return NextResponse.json({ error: '낙찰 히스토리를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 3. 거래완료 처리
    const updatedAuctionItem = await auctionItemService.update(params.id, {
      status: AuctionStatus.COMPLETED,
      seller_steps: 4,
      buyer_steps: 5,
    });

    // 4. 알림 발송
    const notificationInfoList = await notificationService.findMany({
      where: {
        user_id: auctionItem.device?.company?.owner_id
      }
    });

    const targetMemberList = await notificationService.findMany({
      where: {
        id: {
          in: [auctionItem.device?.company?.owner_id, history?.user_id]
        }
      }
    });

    if (notificationInfoList.length > 0) {
      const title = '거래완료';
      const messageBody = `경매상품[${auctionItem.device?.deviceType?.name}]의 거래가 완료되었습니다.\n[경매번호: ${auctionItem.auction_code}] 영업일로 1일 이내에 입금이 완료됩니다.`;
      const body = `경매상품[${auctionItem.device?.deviceType?.name}]의 거래가 완료되었습니다.\n[경매번호: ${auctionItem.auction_code}]`;
      const data = {
        type: 'AUCTION' as const,
        screen: 'AuctionDetail',
        targetId: auctionItem.id.toString(),
        title: title,
        body: messageBody,
      };

      const notificationMessageList = await notificationMessageService.createMany(targetMemberList.map(info => ({
        user_id: Number(info.user_id),
        title: title,
        body: body,
        data: data,
        group_id: Number(auctionItem.id),
      })));

      await sendNotification({
        type: 'MULTI',
        title: title,
        body: messageBody,
        userTokens: notificationInfoList.map(info => info.device_token),
        data: data,
      });
    }

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
