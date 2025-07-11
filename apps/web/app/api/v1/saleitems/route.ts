import { NextResponse } from 'next/server';
import { notificationMessageService, notificationService, saleItemService } from '@repo/shared/services';
import { type CreateSaleItemRequestDto } from '@repo/shared/dto';
import { authenticateUser } from '@/libs/auth';
import { createApiResponse, withApiHandler } from '@/libs/api-utils';
import { createSystemError } from '@/libs/errors';
import type { ApiResponse } from '@/types/api';
import { toSaleItemResponseDto, toSaleItemListDtoArray } from '@repo/shared';
import { sendBroadcastNotification } from '@/libs/notification';

// GET 요청 핸들러 (목록 조회 및 검색)
export const GET = withApiHandler(async (request: Request): Promise<ApiResponse> => {
  const authResult = await authenticateUser(request);
  if ('error' in authResult) {
    return {
      success: false,
      error: createSystemError('INTERNAL_ERROR', authResult.error || 'Authentication failed'),
    };
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const keyword = searchParams.get('keyword') || '';
    const department_id = searchParams.get('department_id') ? parseInt(searchParams.get('department_id')!) : undefined;
    const device_type_id = searchParams.get('device_type_id') ? parseInt(searchParams.get('device_type_id')!) : undefined;
    const manufacturer_id = searchParams.get('manufacturer_id') ? parseInt(searchParams.get('manufacturer_id')!) : undefined;
    const sales_type = searchParams.get('sales_type') ? parseInt(searchParams.get('sales_type')!) : '1';
    const status = searchParams.get('status') ? parseInt(searchParams.get('status')!) : '1';

    const result = await saleItemService.findWithPagination({
      page: Number(page),
      limit: Number(limit),
      where: {
        ...(keyword && {
          OR: [
            { name: { contains: keyword } },
            { description: { contains: keyword } },
          ],
        }),
        ...(department_id && { department_id: Number(department_id) }),
        ...(device_type_id && { device_type_id: Number(device_type_id) }),
        ...(manufacturer_id && { manufacturer_id: Number(manufacturer_id) }),
        ...(sales_type && { sales_type: Number(sales_type) }),
        ...(status && { status: Number(status) }),
      },
      orderBy: { updated_at: 'desc' },
    });

    return {
      success: true,
      data: toSaleItemListDtoArray(result.data),
      message: '판매 아이템 목록을 성공적으로 조회했습니다.',
      meta: {
        timestamp: Date.now(),
        path: request.url,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNext: result.page < result.totalPages,
          hasPrev: result.page > 1,
        },
      }
    };
  } catch (error) {
    console.error('판매 아이템 목록 조회 중 오류:', error);
    throw createSystemError('INTERNAL_ERROR', 'Failed to fetch sale items');
  }
});

// POST 요청 핸들러 (생성)
export const POST = withApiHandler(async (request: Request): Promise<ApiResponse> => {
  const authResult = await authenticateUser(request);
  if ('error' in authResult) {
    return {
      success: false,
      error: createSystemError('INTERNAL_ERROR', authResult.error || 'Authentication failed'),
    };
  }

  const { userId } = authResult as { userId: string };

  try {
    const data: CreateSaleItemRequestDto = await request.json();
    const saleItem = await saleItemService.create({
      ...data,
      owner_id: userId,
    });

    // topic all에 대한 푸시발송 진행
    if (saleItem.salesType?.code === 'AUCTION') {
      // 이용자별 푸시발송 메세지 생성
      const title = `새로운 [${saleItem.item?.device?.deviceType?.name}]이 등록되었습니다.`;
      const message = `[경매번호: ${saleItem.item?.auction_code}]`;
      const data = {
        type: saleItem.salesType?.code as 'AUCTION',
        screen: 'AuctionDetail',
        targetId: saleItem.id.toString(),
        title: title,
        body: message,
      }

      const notificationInfoList = await notificationService.findMany({
        where: {
          user_id: { not: userId },
        }
      });

      const notificationMessageList = await notificationMessageService.createMany(notificationInfoList.map(info => ({
        user_id: Number(info.user_id),
        title: title,
        body: message,
        data: data,
        group_id: Number(saleItem.item_id),
      })));

      await sendBroadcastNotification({
        type: 'BROADCAST',
        title: title,
        body: message,
        data: data,
      });
    }

    return {
      success: true,
      data: toSaleItemResponseDto(saleItem),
      message: '판매 아이템을 성공적으로 생성했습니다.',
      meta: {
        timestamp: Date.now(),
        path: request.url,
      }
    };
  } catch (error) {
    console.error('판매 아이템 생성 중 오류:', error);
    throw createSystemError('INTERNAL_ERROR', 'Failed to create sale item');
  }
});
