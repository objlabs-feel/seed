import { NextResponse } from 'next/server';
import { authenticateUser } from '@/libs/auth';
import { sendNotification } from '@/libs/notification';
import { auctionItemService, userService, companyService, profileService, notificationService } from '@repo/shared/services';
import { toAuctionItemResponseDto } from '@repo/shared/transformers';
import { createApiResponse, parseApiRequest, withApiHandler } from '@/libs/api-utils';
import { createValidationError, createSystemError, createBusinessError, createAuthError } from '@/libs/errors';
import type { ApiResponse } from '@/types/api';
import { z } from 'zod';
import { AuctionStatus } from '@repo/shared/types/models';

const visitScheduleRequestSchema = z.object({
  visitDate: z.string().min(1, '방문일은 필수입니다.'),
  visitTime: z.string().min(1, '방문시간은 필수입니다.'),
});

const buyerInfoRequestSchema = z.object({
  companyName: z.string().min(1, '회사명은 필수입니다.'),
  address: z.string().min(1, '주소는 필수입니다.'),
  addressDetail: z.string().optional(),
  zipCode: z.string().min(1, '우편번호는 필수입니다.'),
  ownerName: z.string().min(1, '대표자명은 필수입니다.'),
  ownerEmail: z.string().email('올바른 이메일 형식이 아닙니다.'),
  ownerMobile: z.string().min(1, '연락처는 필수입니다.'),
  businessNo: z.string().min(1, '사업자등록번호는 필수입니다.'),
});

interface RouteContext {
  params: { id: string };
}

// 입금확인 후 방문일정 교환
export const PUT = withApiHandler(async (request: Request, context: RouteContext): Promise<ApiResponse> => {
  // 1. 인증
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    throw createAuthError('UNAUTHORIZED', auth.error || '인증 실패');
  }
  const { userId } = auth as { userId: string };

  // 2. 요청 데이터 검증
  const { body } = await parseApiRequest(request);
  const validatedData = visitScheduleRequestSchema.parse(body);

  // 3. 경매 상품 정보 조회
  const auctionItem = await auctionItemService.findById(context.params.id);
  if (!auctionItem) {
    throw createBusinessError('NOT_FOUND', '경매 상품을 찾을 수 없습니다.');
  }

  if (auctionItem.status !== AuctionStatus.SUCCESS_BID) {
    throw createBusinessError('INVALID_STATE', '경매 상품이 진행중이 아닙니다.');
  }

  if (auctionItem.buyer_steps !== 3 || auctionItem.seller_steps !== 3) {
    throw createBusinessError('INVALID_STATE', '경매 상품이 진행중이 아닙니다.');
  }

  // 4. 데이터 업데이트
  const updatedAuctionItem = await auctionItemService.update(context.params.id, {
    visit_date: validatedData.visitDate,
    visit_time: validatedData.visitTime,
    seller_steps: 3,
    buyer_steps: 3,
  });

  // 5. 알림 발송
  const notificationInfoList = await notificationService.findMany({
    where: {
      user_id: {
        in: [
          auctionItem.device?.company?.owner_id,
          userId
        ]
      }
    }
  });

  if (notificationInfoList.length > 0) {
    await sendNotification({
      type: 'MULTI',
      title: '입금확인',
      body: `경매상품[${auctionItem.device?.deviceType?.name}]에 대한 방문일정을 확인하세요.\n[경매번호: ${auctionItem.auction_code}]`,
      userTokens: notificationInfoList.map(info => info.device_token),
      data: {
        type: 'AUCTION',
        screen: 'AuctionDetail',
        targetId: auctionItem.id.toString(),
        title: '입금확인',
        body: `경매상품[${auctionItem.device?.deviceType?.name}]에 대한 방문일정을 확인하세요.\n[경매번호: ${auctionItem.auction_code}]`
      }
    });
  }

  // 6. 응답
  return {
    success: true,
    data: toAuctionItemResponseDto(updatedAuctionItem),
    message: '방문일정이 성공적으로 등록되었습니다.',
    meta: {
      timestamp: Date.now(),
      path: request.url,
    }
  };
});

// 낙찰 후 낙찰자 거래정보 입력
export const POST = withApiHandler(async (request: Request, context: RouteContext): Promise<ApiResponse> => {
// 1. 인증
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    throw createAuthError('UNAUTHORIZED', auth.error || '인증 실패');
  }
  const { userId } = auth as { userId: string };

  // 2. 요청 데이터 검증
  const { body } = await parseApiRequest(request);
  const validatedData = buyerInfoRequestSchema.parse(body);

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

  // 5. 회사 정보 조회 및 업데이트 또는 생성
  let company = await companyService.findById(profile.company_id?.toString() || '');
  if (!company) {
    // 회사가 없는 경우 신규 생성
    company = await companyService.create({
      name: validatedData.companyName,
      address: validatedData.address,
      address_detail: validatedData.addressDetail,
      zipcode: validatedData.zipCode,
      business_no: validatedData.businessNo,
      business_mobile: validatedData.ownerMobile,
      owner_id: userId,
    });

    // 프로필에 회사 ID 업데이트
    await profileService.update(profile.id.toString(), {
      company_id: company.id.toString(),
    });
  } else {
    // 기존 회사 정보 업데이트
    await companyService.update(company.id.toString(), {
      name: validatedData.companyName,
      address: validatedData.address,
      address_detail: validatedData.addressDetail,
      zipcode: validatedData.zipCode,
      business_no: validatedData.businessNo,
      business_mobile: validatedData.ownerMobile,
    });
  }

  // 6. 경매 상품 정보 조회
  const auctionItem = await auctionItemService.findById(context.params.id);
  if (!auctionItem) {
    throw createBusinessError('NOT_FOUND', '경매 상품을 찾을 수 없습니다.');
  }

  // 7. 데이터 업데이트
  const updatedAuctionItem = await auctionItemService.update(context.params.id, {
    seller_steps: 2,
    buyer_steps: 2,
  });

  await profileService.update(profile.id.toString(), {
    name: validatedData.ownerName,
    email: validatedData.ownerEmail,
    mobile: validatedData.ownerMobile,
  });

  // 8. 알림 발송
  const notificationInfoList = await notificationService.findMany({
    where: {
      user_id: auctionItem.device?.company?.owner_id
    }
  });

  if (notificationInfoList.length > 0) {
    await sendNotification({
      type: 'MULTI',
      title: '입금대기',
      body: `경매상품[${auctionItem.device?.deviceType?.name}]이 입금대기 상태가 되었습니다.\n[경매번호: ${auctionItem.auction_code}]`,
      userTokens: notificationInfoList.map(info => info.device_token),
      data: {
        type: 'AUCTION',
        screen: 'AuctionDetail',
        targetId: auctionItem.id.toString(),
        title: '입금대기',
        body: `경매상품[${auctionItem.device?.deviceType?.name}]이 입금대기 상태가 되었습니다.\n[경매번호: ${auctionItem.auction_code}]`
      }
    });
  }

  // 9. 응답
  return {
    success: true,
    data: toAuctionItemResponseDto(updatedAuctionItem),
    message: '낙찰자 정보가 성공적으로 입력되었습니다.',
    meta: {
      timestamp: Date.now(),
      path: request.url,
    }
  };
});