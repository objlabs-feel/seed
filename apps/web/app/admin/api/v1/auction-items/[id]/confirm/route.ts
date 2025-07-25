import { convertBigIntToString } from '@/libs/utils';
import { sendNotification } from '@/libs/notification';
import { withApiHandler } from '@/libs/api-utils';
import { createBusinessError, createSystemError } from '@/libs/errors';
import type { ApiResponse } from '@/types/api';
import { auctionItemService, auctionItemHistoryService, notificationService, AuctionStatus, notificationMessageService } from '@repo/shared';

/**
 * POST /admin/api/v1/auction-items/[id]/confirm
 * 경매 상품 입금 확인 및 방문 스케줄 전달
 */
export const POST = withApiHandler(async (
  request: Request,
  { params }: { params: { id: string } }
): Promise<ApiResponse> => {
  try {
    const auctionItem = await auctionItemService.update(params.id, {
      status: AuctionStatus.SUCCESS_BID,
      buyer_steps: 4,
      seller_steps: 3,
    });

    // accept_id로 낙찰된 히스토리 조회
    const auctionItemHistory = auctionItem.accept_id ? await auctionItemHistoryService.findById(auctionItem.accept_id.toString()) : null;

    if (!auctionItemHistory) {
      throw createBusinessError('NOT_FOUND', '낙찰 히스토리를 찾을 수 없습니다.');
    }

    // 알림 발송
    if (auctionItemHistory?.user_id) {
      const notificationInfoList = await notificationService.findMany({
        where: {
          user_id: {
            in: [auctionItemHistory.user_id, auctionItem.device?.company?.owner_id]
          }
        }
      });

      const title = '입금확인';
      const body = `경매상품[${auctionItem.device?.deviceType?.name}]에 대한 방문일자 및 위치를 확인하세요.\n[경매번호: ${auctionItem.auction_code}]`;
      const data = {
        type: 'AUCTION' as const,
        screen: 'AuctionDetail',
        targetId: auctionItem.id.toString(),
        title: title,
        body: body,
      };

      const notificationMessageList = await notificationMessageService.createMany(notificationInfoList.map(info => ({
        user_id: Number(info.user_id),
        title: title,
        body: body,
        data: data,
        group_id: Number(auctionItem.id),
      })));

      await sendNotification({
        type: 'MULTI',
        title,
        body,
        userTokens: notificationInfoList.map(info => info.device_token),
        data: data,
      });
    }

    return {
      success: true,
      data: convertBigIntToString(auctionItem),
      message: '입금 확인이 완료되었습니다.',
      meta: {
        timestamp: Date.now(),
        path: request.url
      }
    };
  } catch (error) {
    console.error('입금 확인 처리 중 오류:', error);
    throw createSystemError('INTERNAL_ERROR', '입금 확인 처리 중 오류가 발생했습니다.');
  }
});
