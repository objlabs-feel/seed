import type { AuctionItem, AuctionItemHistory } from '../types/models';
import type {
  AuctionItemResponseDto,
  AuctionItemListDto,
  AuctionItemHistoryResponseDto,
  AuctionItemHistoryListDto,
  AuctionDetailResponseDto
} from '../types/dto';
import { bigintToString, dateToString, transformIfExists, transformArray } from './common.transformer';
import { toUsedDeviceResponseDto } from './device.transformer';

/**
 * AuctionItem 모델을 AuctionItemResponseDto로 변환
 */
export function toAuctionItemResponseDto(auctionItem: AuctionItem): AuctionItemResponseDto {
  return {
    id: bigintToString(auctionItem.id)!,
    created_at: dateToString(auctionItem.created_at),
    updated_at: dateToString(auctionItem.updated_at),
    status: auctionItem.status ?? null,
    device_id: bigintToString(auctionItem.device_id)!,
    auction_code: auctionItem.auction_code,
    quantity: auctionItem.quantity,
    accept_id: bigintToString(auctionItem.accept_id),
    seller_steps: auctionItem.seller_steps,
    buyer_steps: auctionItem.buyer_steps,
    seller_timeout: dateToString(auctionItem.seller_timeout),
    buyer_timeout: dateToString(auctionItem.buyer_timeout),
    start_timestamp: dateToString(auctionItem.start_timestamp),
    expired_count: auctionItem.expired_count,
    auction_timeout: dateToString(auctionItem.auction_timeout),
    visit_date: dateToString(auctionItem.visit_date),
    visit_time: auctionItem.visit_time,
    device: auctionItem.device ? {
      id: bigintToString(auctionItem.device.id)!,
      company_id: bigintToString(auctionItem.device.company_id),
      department_id: auctionItem.device.department_id,
      device_type_id: auctionItem.device.device_type_id,
      manufacturer_id: auctionItem.device.manufacturer_id,
      manufacture_date: dateToString(auctionItem.device.manufacture_date),
      images: auctionItem.device.images,
      description: auctionItem.device.description,
      company: auctionItem.device.company ? {
        id: bigintToString(auctionItem.device.company.id)!,
        name: auctionItem.device.company.name,
      } : undefined,
      department: auctionItem.device.department ? {
        id: auctionItem.device.department.id.toString(),
        name: auctionItem.device.department.name,
      } : undefined,
      deviceType: auctionItem.device.deviceType ? {
        id: auctionItem.device.deviceType.id.toString(),
        name: auctionItem.device.deviceType.name,
      } : undefined,
      manufacturer: auctionItem.device.manufacturer ? {
        id: auctionItem.device.manufacturer.id.toString(),
        name: auctionItem.device.manufacturer.name,
      } : undefined,
    } : undefined,
  };
}

/**
 * AuctionItem 모델을 AuctionItemListDto로 변환
 */
export function toAuctionItemListDto(auctionItem: AuctionItem): AuctionItemListDto {
  return {
    id: bigintToString(auctionItem.id)!,
    device_id: bigintToString(auctionItem.device_id)!,
    auction_code: auctionItem.auction_code,
    quantity: auctionItem.quantity,
    status: auctionItem.status ?? 0,
    start_timestamp: dateToString(auctionItem.start_timestamp),
    auction_timeout: dateToString(auctionItem.auction_timeout),
    visit_date: dateToString(auctionItem.visit_date),
    visit_time: auctionItem.visit_time,
    created_at: dateToString(auctionItem.created_at),
    updated_at: dateToString(auctionItem.updated_at),
    device: auctionItem.device ? { ...toUsedDeviceResponseDto(auctionItem.device) } : undefined,
    auction_item_history: auctionItem.auction_item_history ? auctionItem.auction_item_history.map(toAuctionItemHistoryListDto) : [],
  };
}

/**
 * AuctionItemHistory 모델을 AuctionItemHistoryResponseDto로 변환
 */
export function toAuctionItemHistoryResponseDto(
  history: AuctionItemHistory
): AuctionItemHistoryResponseDto {
  return {
    id: bigintToString(history.id)!,
    created_at: dateToString(history.created_at),
    updated_at: dateToString(history.updated_at),
    status: history.status,
    auction_item_id: bigintToString(history.auction_item_id)!,
    user_id: bigintToString(history.user_id)!,
    value: history.value,
    auction_item: history.auction_item ? {
      id: bigintToString(history.auction_item.id)!,
      auction_code: history.auction_item.auction_code,
      quantity: history.auction_item.quantity,
    } : undefined,
  };
}

/**
 * AuctionItemHistory 모델을 AuctionItemHistoryListDto로 변환
 */
export function toAuctionItemHistoryListDto(
  history: AuctionItemHistory
): AuctionItemHistoryListDto {
  return {
    id: bigintToString(history.id)!,
    auction_item_id: bigintToString(history.auction_item_id)!,
    user_id: bigintToString(history.user_id)!,
    value: history.value,
    status: history.status ?? 0,
    created_at: dateToString(history.created_at),
    updated_at: dateToString(history.updated_at),
  };
}

/**
 * AuctionItem 모델을 AuctionDetailResponseDto로 변환 (입찰 히스토리 포함)
 */
export function toAuctionDetailResponseDto(
  auctionItem: AuctionItem,
  bidHistory?: AuctionItemHistory[]
): AuctionDetailResponseDto {
  const baseDto = toAuctionItemResponseDto(auctionItem);

  // 가장 높은 입찰가 찾기
  const sortedHistory = bidHistory?.sort((a, b) => (b.value || 0) - (a.value || 0));
  const highestBid = sortedHistory?.[0];

  return {
    ...baseDto,
    bid_history: transformArray(bidHistory, toAuctionItemHistoryResponseDto),
    highest_bid: highestBid ? {
      value: highestBid.value || 0,
      user_id: bigintToString(highestBid.user_id)!,
      created_at: dateToString(highestBid.created_at)!,
    } : undefined,
    bid_count: bidHistory?.length || 0,
  };
}

/**
 * 배열 변환 함수들
 */
export function toAuctionItemListDtoArray(auctionItems: AuctionItem[]): AuctionItemListDto[] {
  return auctionItems.map(toAuctionItemListDto);
}

export function toAuctionItemHistoryListDtoArray(
  histories: AuctionItemHistory[]
): AuctionItemHistoryListDto[] {
  return histories.map(toAuctionItemHistoryListDto);
} 