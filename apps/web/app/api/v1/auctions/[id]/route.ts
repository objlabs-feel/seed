import { NextResponse } from 'next/server';
import { authenticateUser } from '@/libs/auth';
import { auctionItemService, auctionItemHistoryService } from '@repo/shared/services';
import { toAuctionDetailResponseDto, toAuctionItemResponseDto } from '@repo/shared/transformers';
import { UpdateAuctionItemRequestDto, UpdateUsedDeviceRequestDto } from '@repo/shared/dto';

// 경매 상품 상세 조회
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = params;
    const auctionItem = await auctionItemService.findById(id);

    if (!auctionItem) {
      return NextResponse.json({ error: '존재하지 않는 경매 상품입니다.' }, { status: 404 });
    }

    // findById에서 이미 히스토리를 포함하므로 별도 조회 필요 없음
    const bidHistory = auctionItem.auction_item_history;

    return NextResponse.json(toAuctionDetailResponseDto(auctionItem, bidHistory));
  } catch (error) {
    console.error('경매 상품 조회 중 오류:', error);
    return NextResponse.json({ error: '경매 상품 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 경매 상품 수정
export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const id = BigInt(params.id);
    const body = await request.json();

    const {
      device: deviceData, // 요청 body의 필드명에 맞게 수정
      ...auctionData
    } = body as { device?: UpdateUsedDeviceRequestDto } & UpdateAuctionItemRequestDto;

    const result = await auctionItemService.updateAuctionWithDevice(id, auctionData, deviceData);

    return NextResponse.json(toAuctionItemResponseDto(result));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '경매 상품 수정 중 오류가 발생했습니다.';
    const statusCode = error instanceof Error && error.message === '존재하지 않는 경매 상품입니다.' ? 404 : 500;
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}