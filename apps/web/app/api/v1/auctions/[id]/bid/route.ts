import { NextResponse } from 'next/server';
import { prisma } from '@repo/shared';
import { convertBigIntToString } from '@/lib/utils';
import { authenticateUser } from '@/lib/auth';
import { sendNotification } from '@/lib/notification';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { userId } = auth;

  try {
    const auctionItemId = parseInt(params.id);
    const { value } = await request.json();

    const auctionItem = await prisma.auctionItem.findUnique({
      where: {
        id: auctionItemId
      },
      include: {
        medical_device: {
          include: {
            company: true
          }
        }
      }
    });

    if (!auctionItem) {
      return NextResponse.json({ error: '경매 상품을 찾을 수 없습니다.' }, { status: 404 });
    }

    const notificationInfoList = await prisma.notificationInfo.findMany({
      where: {
        user_id: auctionItem?.medical_device?.company?.owner_id
      }
    });

    const history = await prisma.auctionItemHistory.create({
      data: {
        auction_item_id: auctionItemId,
        user_id: BigInt(userId),
        value
      }
    });

    // 경매 상품 등록 알림발송
    // 경매 상품 등록은 'all' 토픽에 알림발송
    if (notificationInfoList.length > 0) {
      await sendNotification({
        type: 'MULTI',
        title: '경매 입찰',
        body: `경매상품[${auctionItem.auction_code}]에 입찰이 등록되었습니다.`,
        data: {
          type: 'AUCTION',
          targetId: auctionItem.auction_code,
          userTokens: notificationInfoList.map(info => info.device_token),
          title: '경매 입찰',
          body: `경매상품[${auctionItem.auction_code}]에 입찰이 등록되었습니다.`
        }
      });
    }

    return NextResponse.json(convertBigIntToString(history));
  } catch (error) {
    console.error('입찰 처리 중 오류:', error);
    return NextResponse.json(
      { error: '입찰 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}