import { auctionItemService } from '@repo/shared/services';

const DAY_30 = 1000 * 60 * 60 * 24 * 30;
const DAY_1 = 1000 * 60 * 60 * 24;

export async function updateExpiredAuctions() {
  try {
    return await auctionItemService.processExpiredAuctions();
  } catch (error) {
    console.error('만료 경매 처리 중 오류:', error);
    throw error;
  }
}

export async function updateExpiredValidAuctions() {
  try {
    return await auctionItemService.revertUnconfirmedAuctions();
  } catch (error) {
    console.error('미확정 경매 처리 중 오류:', error);
    throw error;
  }
}