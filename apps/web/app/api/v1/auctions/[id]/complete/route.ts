import { NextResponse } from 'next/server';
import { authenticateUser } from '@/libs/auth';
import { auctionItemService } from '@repo/shared/services';
import { toAuctionItemResponseDto } from '@repo/shared/transformers';
import { createApiResponse, parseApiRequest, withApiHandler } from '@/libs/api-utils';
import { createValidationError, createSystemError, createBusinessError, createAuthError } from '@/libs/errors';
import type { ApiResponse } from '@/types/api';
import { AuctionStatus } from '@repo/shared/models';

interface RouteContext {
  params: { id: string };
}

// 낙찰완료
export const POST = withApiHandler(async (request: Request, context: RouteContext): Promise<ApiResponse> => {
  // 1. 인증
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    throw createAuthError('UNAUTHORIZED', auth.error || '인증 실패');
  }

  // 2. 경매 상품 정보 업데이트
  const updatedAuctionItem = await auctionItemService.update(context.params.id, {
    status: AuctionStatus.SUCCESS_BID,
    seller_timeout: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    buyer_steps: 1,
    seller_steps: 1,
  });

  // 3. 응답
  return {
    success: true,
    data: toAuctionItemResponseDto(updatedAuctionItem),
    message: '낙찰이 성공적으로 완료되었습니다.',
    meta: {
      timestamp: Date.now(),
      path: request.url,
    }
  };
});