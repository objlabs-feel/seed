import { NextResponse } from 'next/server';
import { authenticateUser } from '@/libs/auth';
import { sendNotification } from '@/libs/notification';
import { auctionItemService, userService, companyService, profileService, notificationService, auctionItemHistoryService } from '@repo/shared/services';
import { AuctionStatus } from '@repo/shared/models';
import { toAuctionItemResponseDto } from '@repo/shared/transformers';
import { createApiResponse, parseApiRequest, withApiHandler } from '@/libs/api-utils';
import { createValidationError, createSystemError, createBusinessError, createAuthError } from '@/libs/errors';
import type { ApiResponse } from '@/types/api';
import { z } from 'zod';

const sellerBidRequestSchema = z.object({
  accept_id: z.string(),
  companyName: z.string().min(1, '회사명은 필수입니다.'),
  address: z.string().min(1, '주소는 필수입니다.'),
  addressDetail: z.string().optional(),
  zipCode: z.string().min(1, '우편번호는 필수입니다.'),
  ownerName: z.string().min(1, '대표자명은 필수입니다.'),
  ownerEmail: z.string().email('올바른 이메일 형식이 아닙니다.'),
  ownerMobile: z.string().min(1, '연락처는 필수입니다.'),
  businessNo: z.string().min(1, '사업자등록번호는 필수입니다.'),
  bankHolder: z.string().min(1, '예금주는 필수입니다.'),
  bankAccount: z.string().min(1, '계좌번호는 필수입니다.'),
  bankCode: z.string().min(1, '은행코드는 필수입니다.'),
});

interface RouteContext {
  params: { id: string };
}

// 낙찰 처리
export const POST = withApiHandler(async (request: Request, context: RouteContext): Promise<ApiResponse> => {
// 1. 인증
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    throw createAuthError('UNAUTHORIZED', auth.error || '인증 실패');
  }
  const { userId } = auth as { userId: string };

  // 2. 요청 데이터 검증
  const { body } = await parseApiRequest(request);
  const validatedData = sellerBidRequestSchema.parse(body);

  // 3. 사용자 정보 조회
  const user = await userService.findById(userId);
  if (!user) {
    throw createBusinessError('NOT_FOUND', '사용자를 찾을 수 없습니다.');
  }

  // 4. 프로필 정보 조회 및 업데이트
  const profile = await profileService.findById(user.profile_id?.toString() || '');
  if (!profile) {
    throw createBusinessError('NOT_FOUND', '프로필을 찾을 수 없습니다.');
  }

  // 5. 회사 정보 조회 및 업데이트
  const company = await companyService.findById(profile.company_id?.toString() || '');
  if (!company) {
    throw createBusinessError('NOT_FOUND', '회사를 찾을 수 없습니다.');
  }

  // 6. 경매 상품 정보 조회
  const auctionItem = await auctionItemService.findById(context.params.id);
  if (!auctionItem) {
    throw createBusinessError('NOT_FOUND', '경매 상품을 찾을 수 없습니다.');
  }

  // 7. 데이터 업데이트
  const updatedAuctionItem = await auctionItemService.update(context.params.id, {
    status: AuctionStatus.SUCCESS_BID,
    accept_id: validatedData.accept_id,
    seller_steps: 2,
    buyer_steps: 1,
  });

  await profileService.update(profile.id.toString(), {
    name: validatedData.ownerName,
    email: validatedData.ownerEmail,
    mobile: validatedData.ownerMobile,
  });

  await companyService.update(company.id.toString(), {
    name: validatedData.companyName,
    address: validatedData.address,
    address_detail: validatedData.addressDetail,
    zipcode: validatedData.zipCode,
    business_no: validatedData.businessNo,
    business_mobile: validatedData.ownerMobile,
    secret_info: {
      bankAccount: validatedData.bankAccount,
      bankCode: validatedData.bankCode,
      bankHolder: validatedData.bankHolder,
      businessEmail: validatedData.ownerEmail,
      businessNo: validatedData.businessNo,
      businessTel: '',
      businessMobile: validatedData.ownerMobile,
    },
  });

  // 8. 알림 발송
  const history = await auctionItemHistoryService.findById(validatedData.accept_id);
  if (history) {
    const notificationInfoList = await notificationService.findMany({
      where: { user_id: history.user_id }
    });

    if (notificationInfoList.length > 0) {
      await sendNotification({
        type: 'MULTI',
        title: '경매 낙찰',
        body: `경매상품[${auctionItem.device?.deviceType?.name}]이 낙찰 되었습니다.\n[경매번호: ${auctionItem.auction_code}]`,
        userTokens: notificationInfoList.map((info: { device_token: string }) => info.device_token),
        data: {
          type: 'AUCTION',
          screen: 'AuctionDetail',
          targetId: auctionItem.id.toString(),
          title: '경매 낙찰',
          body: `경매상품[${auctionItem.device?.deviceType?.name}]이 낙찰 되었습니다.\n[경매번호: ${auctionItem.auction_code}]`
        }
      });
    }
  }

  // 9. 응답
  return {
    success: true,
    data: toAuctionItemResponseDto(updatedAuctionItem),
    message: '낙찰이 성공적으로 처리되었습니다.',
    meta: {
      timestamp: Date.now(),
      path: request.url,
    }
  };
});