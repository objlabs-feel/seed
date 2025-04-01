import { prisma } from '@repo/shared';

const DAY_30 = 1000 * 60 * 60 * 24 * 30;
const DAY_1 = 1000 * 60 * 60 * 24;

export async function updateExpiredAuctions() {
  try {
    const currentTime = new Date();

    const expiredAuctions = await prisma.auctionItem.findMany({
      where: {
        start_timestamp: {
          lte: currentTime,
          gte: new Date(currentTime.getTime() - DAY_30)
        },
        expired_count: {
          lt: 3
        },
        status: 0,
        accept_id: null
      }
    });

    const updatedCount = expiredAuctions.length;

    for (const auction of expiredAuctions) {
      const startTimestamp = auction.start_timestamp || new Date();
      switch (auction.expired_count) {
        case 1:
          await prisma.auctionItem.update({
            where: { id: auction.id },
            data: {
              start_timestamp: new Date(startTimestamp.getTime() + DAY_30),
              expired_count: 2
            }
          });
          break;
        case 2:
          await prisma.auctionItem.update({
            where: { id: auction.id },
            data: {
              expired_count: 3,
              status: 3
            }
          });
          break;
        default:
          await prisma.auctionItem.update({
            where: { id: auction.id },
            data: {
              start_timestamp: new Date(startTimestamp.getTime() + DAY_1),
              expired_count: 1
            }
          });
          break;
      }
    }
    return { updatedCount };
  } catch (error) {
    console.error('경매 업데이트 오류:', error);
    throw error;
  }
}

export async function updateExpiredValidAuctions() {
  try {
    const currentTime = new Date();

    const expiredAuctions = await prisma.auctionItem.findMany({
      where: {
        // 구매자 타임아웃 조건(1일간 확인, 2단계이하 확인)
        buyer_timeout: {
          lte: currentTime,
          gte: new Date(currentTime.getTime() - DAY_1)
        },
        buyer_steps: {
          lte: 2
        },
        seller_steps: 2,
        status: 1,
        accept_id: {
          not: null
        }
      }
    });

    const updatedCount = expiredAuctions.length;

    for (const auction of expiredAuctions) {
      await prisma.auctionItem.update({
        where: { id: auction.id },
        data: {
          buyer_steps: 1,
          seller_steps: 1,
          accept_id: null,
          status: 0
        }
      });
    }
    return { updatedCount };
  } catch (error) {
    console.error('경매 업데이트 오류:', error);
    throw error;
  }
}