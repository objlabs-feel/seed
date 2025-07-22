import { NextResponse } from 'next/server';
import { auctionItemService } from '@repo/shared/services';
import { CreateAuctionItemRequestDto, CreateUsedDeviceRequestDto } from '@repo/shared/dto';
import { toAuctionItemResponseDto } from '@repo/shared/transformers';
import { authenticateUser } from '@/libs/auth';
import { toAuctionItemListDtoArray } from '@repo/shared/transformers';
import { AuctionSearchRequestDto } from '@repo/shared/dto';

export async function GET(request: Request) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const deviceTypeId = searchParams.get('device_type_id');
    const manufacturerId = searchParams.get('manufacturer_id');

    const searchDto: AuctionSearchRequestDto = {
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '10', 10),
      status: searchParams.get('status') ? parseInt(searchParams.get('status')!, 10) : undefined,
      device_type_id: deviceTypeId ? parseInt(deviceTypeId, 10) : undefined,
      company_id: searchParams.get('company_id') || undefined,
      manufacturer_id: manufacturerId ? parseInt(manufacturerId, 10) : undefined,
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      auction_code: searchParams.get('auction_code') || undefined,
    };

    const result = await auctionItemService.search(searchDto);

    return NextResponse.json({
      items: toAuctionItemListDtoArray(result.data),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
    });
  } catch (error) {
    console.error('Error in auction search:', error);
    return NextResponse.json({ error: '경매 상품 검색 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 경매 상품 생성
export async function POST(request: Request) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const auctionItemData: CreateAuctionItemRequestDto = await request.json();
    const result = await auctionItemService.create(auctionItemData);

    return NextResponse.json(toAuctionItemResponseDto(result));
  } catch (error) {
    console.error('경매 상품 생성 중 오류:', error);
    return NextResponse.json(
      { error: '경매 상품 생성 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}