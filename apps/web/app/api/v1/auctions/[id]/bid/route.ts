import { NextResponse } from 'next/server';
import { authenticateUser } from '@/libs/auth';
import { sendNotification } from '@/libs/notification';
import { auctionItemService, auctionItemHistoryService, notificationService, saleItemViewHistoryService, saleItemService, notificationMessageService } from '@repo/shared/services';
import { type NotificationInfo } from '@repo/shared';
import { toAuctionItemHistoryResponseDto } from '@repo/shared/transformers';
import { CreateAuctionItemHistoryRequestDto } from '@repo/shared/dto';
import { createApiResponse, parseApiRequest, withApiHandler } from '@/libs/api-utils';
import { createValidationError, createSystemError, createBusinessError, createAuthError } from '@/libs/errors';
import type { ApiResponse } from '@/types/api';
import { z } from 'zod';

const bidRequestSchema = z.object({
  value: z.number().positive('입찰가는 0보다 커야 합니다.'),
});

interface RouteContext {
  params: { id: string };
}

// 입찰
export const POST = withApiHandler(async (request: Request, context: RouteContext): Promise<ApiResponse> => {
  try {
    // 1. 인증
    const auth = await authenticateUser(request);
    if ('error' in auth) {
      throw createAuthError('UNAUTHORIZED', auth.error || '인증 실패');
    }
    const { userId } = auth as { userId: string };

    console.log('userId', userId);

    // 2. 요청 데이터 검증
    const { body } = await parseApiRequest(request);
    const validatedData = bidRequestSchema.parse(body);

    // 3. 입찰 생성
    const createDto: CreateAuctionItemHistoryRequestDto = {
      auction_item_id: context.params.id,
      user_id: userId,
      value: validatedData.value,
    };
    const history = await auctionItemHistoryService.create(createDto);

    // 4. 경매 상품 정보 조회
    const auctionItem = await auctionItemService.findById(context.params.id);
    if (!auctionItem) {
      throw createBusinessError('NOT_FOUND', '경매 상품을 찾을 수 없습니다.');
    }

    const saleItem = await saleItemService.findByItemId(auctionItem.id.toString());
    if (!saleItem) {
      throw createBusinessError('NOT_FOUND', '판매 상품을 찾을 수 없습니다.');
    }

    // 5. 경매 상품 조회 이력 생성
    await saleItemViewHistoryService.create({
      owner_id: userId,
      item_id: saleItem?.id?.toString() || '',
    });

    // 6. 최고가 입찰 갱신의 경우 알림발송
    const ownerId = auctionItem.device?.company?.owner_id;
    if (ownerId) {
      const notificationInfoList: NotificationInfo[] = await notificationService.findMany({
        where: { user_id: ownerId }
      });

      if (notificationInfoList.length > 0) {
        const title = `경매상품[${auctionItem.device?.deviceType?.name}]에 최고입찰 가격이 갱신되었습니다.`;
        const message = `[경매번호: ${auctionItem.auction_code}] 입찰가: ${Math.floor(validatedData.value / 1.18).toLocaleString()}원`;
        const data = {
          type: 'AUCTION' as const,
          screen: 'AuctionDetail',
          targetId: auctionItem.id.toString(),
          title: title,
          body: message,
        };

        const notificationMessageList = await notificationMessageService.createMany(notificationInfoList.map(info => ({
          user_id: Number(info.user_id),
          title: title,
          body: message,
          data: data,
          group_id: Number(auctionItem.id),
        })));

        await sendNotification({
          type: 'MULTI',
          title: title,
          body: message,
          userTokens: notificationInfoList.map(info => info.device_token),
          data: data,
        });
      }
    }

    // 7. 응답
    return {
      success: true,
      data: toAuctionItemHistoryResponseDto(history),
      message: '입찰이 성공적으로 등록되었습니다.',
      meta: {
        timestamp: Date.now(),
        path: request.url,
      }
    };
  } catch (error) {
    console.error('입찰 API 오류:', error);
    throw error;
  }
});