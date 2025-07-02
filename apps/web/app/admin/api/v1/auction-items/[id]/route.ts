import { NextResponse } from 'next/server';
import {
  getServiceManager,
  auctionItemService
} from '@repo/shared/services';
import { convertBigIntToString } from '@/libs/utils';
import { UpdateUsedDeviceRequestDto, UpdateAuctionItemRequestDto } from '@repo/shared/dto';

// 개별 조회
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const auctionItem = await auctionItemService.findById(params.id);

    if (!auctionItem) {
      return NextResponse.json(
        { error: '존재하지 않는 경매 상품입니다.' },
        { status: 404 },
      );
    }
    return NextResponse.json(convertBigIntToString(auctionItem));
  } catch (error) {
    console.error('경매 상품 조회 중 오류:', error);
    return NextResponse.json(
      { error: '경매 상품 조회 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

// 경매 상품 수정
export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const id = BigInt(params.id);
    const body: {
      device?: UpdateUsedDeviceRequestDto;
      auction?: UpdateAuctionItemRequestDto;
    } = await request.json();

    const prisma = getServiceManager().getPrismaClient();

    const result = await prisma.$transaction(async (tx: any) => {
      const auctionItem = await tx.auctionItem.findUnique({
        where: { id },
      });

      if (!auctionItem) {
        throw new Error('존재하지 않는 경매 상품입니다.');
      }

      if (body.device) {
        await tx.usedDevice.update({
          where: { id: auctionItem.device_id },
          data: body.device,
        });
      }

      if (body.auction) {
        const updatedAuctionItem = await tx.auctionItem.update({
          where: { id },
          data: body.auction,
          include: {
            device: true,
          },
        });
        return updatedAuctionItem;
      }

      return auctionItem;
    });

    return NextResponse.json(convertBigIntToString(result));
  } catch (error) {
    console.error('경매 상품 수정 중 오류:', error);
    return NextResponse.json(
      { error: '경매 상품 수정 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

// 경매 상품 삭제
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    await auctionItemService.delete(params.id);
    return NextResponse.json({ message: 'Auction item deleted successfully' });
  } catch (error) {
    console.error('경매 상품 삭제 중 오류:', error);
    return NextResponse.json(
      { error: '경매 상품 삭제 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}