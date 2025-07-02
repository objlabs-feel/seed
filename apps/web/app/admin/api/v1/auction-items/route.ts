import { NextResponse } from 'next/server';
import { auctionItemService } from '@repo/shared/services';
import { CreateUsedDeviceRequestDto, AuctionSearchRequestDto } from '@repo/shared/dto';
import { toAuctionItemResponseDto, toAuctionItemListDtoArray } from '@repo/shared/transformers';
import { authenticateAdmin } from '@/libs/auth';

// 경매 상품 목록 조회 (관리자용)
export async function GET(request: Request) {
  const auth = await authenticateAdmin(request);
  if (auth.status !== 200) {
    return NextResponse.json({ error: '인증 실패' }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const deviceTypeId = searchParams.get('device_type_id');
    const manufacturerId = searchParams.get('manufacturer_id');

    const searchOptions: AuctionSearchRequestDto = {
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '10', 10),
      auction_code: searchParams.get('auction_code') || undefined,
      status: searchParams.has('status') ? parseInt(searchParams.get('status')!) : undefined,
      user_id: searchParams.get('user_id') || undefined,
      device_type_id: deviceTypeId ? parseInt(deviceTypeId, 10) : undefined,
      manufacturer_id: manufacturerId ? parseInt(manufacturerId, 10) : undefined,
      company_id: searchParams.get('company_id') || undefined,
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
    };

    const result = await auctionItemService.search(searchOptions);

    console.log(result.data.map(item => item.device));

    return NextResponse.json({
      items: toAuctionItemListDtoArray(result.data),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
    });
  } catch (error) {
    console.error('경매 상품 목록 조회 중 오류:', error);
    return NextResponse.json({ error: '경매 상품 목록 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 경매 상품 생성 (관리자용)
export async function POST(request: Request) {
  const auth = await authenticateAdmin(request);
  if (auth.status !== 200) {
    return NextResponse.json({ error: '인증 실패' }, { status: auth.status });
  }

  try {
    const usedDeviceData: CreateUsedDeviceRequestDto = await request.json();
    const result = await auctionItemService.createWithNewDevice(usedDeviceData);

    return NextResponse.json(toAuctionItemResponseDto(result));
  } catch (error) {
    console.error('경매 상품 생성 중 오류:', error);
    return NextResponse.json({ error: '경매 상품 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}