import { BaseRequestDto, BaseResponseDto, SearchRequestDto, BaseDto } from './common.dto';

/**
 * 경매 아이템 생성 요청 DTO
 */
export interface CreateAuctionItemRequestDto extends BaseRequestDto {
  owner_id: string;
  device_id?: string;
  auction_code: string;
  quantity?: number;
  start_timestamp?: string;
  auction_timeout?: string;
  visit_date?: string;
  visit_time?: string;
  department_id?: string;
  device_type_id?: string;
  manufacturer_id?: string;
  manufacture_date?: string;
  description?: string;
}

/**
 * 경매 아이템 업데이트 요청 DTO
 */
export interface UpdateAuctionItemRequestDto extends BaseRequestDto {
  device_id?: string;
  auction_code?: string;
  quantity?: number;
  status?: number;
  accept_id?: string | null;
  seller_steps?: number;
  buyer_steps?: number;
  seller_timeout?: string;
  buyer_timeout?: string;
  start_timestamp?: string;
  expired_count?: number;
  auction_timeout?: string;
  visit_date?: string;
  visit_time?: string;
  department_id?: string;
  device_type_id?: string;
  manufacturer_id?: string;
  manufacture_date?: string;
  description?: string;
}

/**
 * 경매 아이템 응답 DTO
 */
export interface AuctionItemResponseDto extends BaseResponseDto {
  device_id: string;
  auction_code: string;
  quantity?: number | null;
  accept_id?: string | null;
  seller_steps?: number | null;
  buyer_steps?: number | null;
  seller_timeout?: string | null;
  buyer_timeout?: string | null;
  start_timestamp?: string | null;
  expired_count?: number | null;
  auction_timeout?: string | null;
  visit_date?: string | null;
  visit_time?: string | null;
  device?: {
    id: string;
    company_id?: string | null;
    department_id?: number | null;
    device_type_id?: number | null;
    manufacturer_id?: number | null;
    manufacture_date?: string | null;
    images?: string[];
    description?: string | null;
    company?: {
      id: string;
      area?: string | null;
      owner_id?: string | null;
    };
    department?: {
      id: string;
      name?: string | null;
    };
    deviceType?: {
      id: string;
      name: string;
    };
    manufacturer?: {
      id: string;
      name?: string | null;
    };
  };
}

/**
 * 경매 아이템 목록 DTO
 */
export interface AuctionItemListDto extends BaseDto {
  device_id: string;
  auction_code: string;
  quantity?: number | null;
  status: number;
  start_timestamp?: string | null;
  auction_timeout?: string | null;
  visit_date?: string | null;
  visit_time?: string | null;
}

/**
 * 경매 아이템 히스토리 생성 요청 DTO
 */
export interface CreateAuctionItemHistoryRequestDto extends BaseRequestDto {
  auction_item_id: string;
  user_id: string;
  value?: number;
}

/**
 * 경매 아이템 히스토리 응답 DTO
 */
export interface AuctionItemHistoryResponseDto extends BaseResponseDto {
  auction_item_id: string;
  user_id: string;
  value?: number | null;
  auction_item?: {
    id: string;
    auction_code: string;
    quantity?: number | null;
  };
}

/**
 * 경매 아이템 히스토리 목록 DTO
 */
export interface AuctionItemHistoryListDto extends BaseDto {
  auction_item_id: string;
  user_id: string;
  value?: number | null;
  status: number;
}

/**
 * 경매 입찰 요청 DTO
 */
export interface AuctionBidRequestDto {
  auction_item_id: string;
  user_id: string;
  bid_value: number;
}

/**
 * 경매 입찰 응답 DTO
 */
export interface AuctionBidResponseDto {
  success: boolean;
  message: string;
  current_highest_bid?: number;
  bid_history?: AuctionItemHistoryResponseDto;
}

/**
 * 경매 상태 업데이트 요청 DTO
 */
export interface UpdateAuctionStatusRequestDto {
  status: number;
  accept_id?: string;
  seller_steps?: number;
  buyer_steps?: number;
}

/**
 * 경매 검색 요청 DTO
 */
export interface AuctionSearchRequestDto extends SearchRequestDto {
  device_id?: string;
  auction_code?: string;
  status?: number;
  start_date?: string;
  end_date?: string;
  company_id?: string;
  device_type_id?: number;
  manufacturer_id?: number;
  user_id?: string;
}

/**
 * 경매 통계 응답 DTO
 */
export interface AuctionStatisticsResponseDto {
  total_auctions: number;
  active_auctions: number;
  completed_auctions: number;
  expired_auctions: number;
  total_bids: number;
  average_bid_count: number;
  highest_bid_value: number;
}

/**
 * 경매 상세 응답 DTO (입찰 히스토리 포함)
 */
export interface AuctionDetailResponseDto extends AuctionItemResponseDto {
  bid_history?: AuctionItemHistoryResponseDto[];
  highest_bid?: {
    value: number;
    user_id: string;
    created_at: string;
  };
  bid_count: number;
}

/**
 * 경매 아이템 DTO
 */
export interface AuctionItemDto extends BaseDto {
  seller_id: string;
  buyer_id: string | null;
  device_id: string;
  title: string;
  description: string | null;
  start_price: number;
  current_price: number;
  min_bid_increment: number;
  start_date: string;
  end_date: string;
  status: number;
  seller: any | null; // UserDto로 변경 필요
  buyer: any | null; // UserDto로 변경 필요
  device: any | null; // DeviceDto로 변경 필요
  bids: AuctionBidDto[];
  history: AuctionItemHistoryDto[];
}

/**
 * 경매 입찰 DTO
 */
export interface AuctionBidDto extends BaseDto {
  auction_item_id: string;
  bidder_id: string;
  amount: number;
  status: number;
  bidder: any | null; // UserDto로 변경 필요
  auction_item: AuctionItemDto | null;
}

/**
 * 경매 아이템 히스토리 DTO
 */
export interface AuctionItemHistoryDto extends BaseDto {
  auction_item_id: string;
  action: string;
  description: string | null;
  auction_item: AuctionItemDto | null;
}

/**
 * 경매 입찰 목록 DTO
 */
export interface AuctionBidListDto extends BaseDto {
  auction_item_id: string;
  bidder_id: string;
  amount: number;
  status: number;
}

/**
 * 경매 아이템 생성 요청 DTO (상세)
 */
export interface CreateAuctionItemDetailRequestDto {
  seller_id: string;
  device_id: string;
  title: string;
  description?: string;
  start_price: number;
  min_bid_increment: number;
  start_date: string;
  end_date: string;
}

/**
 * 경매 아이템 업데이트 요청 DTO (상세)
 */
export interface UpdateAuctionItemDetailRequestDto {
  title?: string;
  description?: string;
  start_price?: number;
  min_bid_increment?: number;
  start_date?: string;
  end_date?: string;
  status?: number;
}

/**
 * 경매 입찰 생성 요청 DTO (상세)
 */
export interface CreateAuctionBidDetailRequestDto {
  auction_item_id: string;
  bidder_id: string;
  amount: number;
}

/**
 * 경매 입찰 업데이트 요청 DTO (상세)
 */
export interface UpdateAuctionBidDetailRequestDto {
  amount?: number;
  status?: number;
}

/**
 * 경매 아이템 검색 요청 DTO (상세)
 */
export interface AuctionItemDetailSearchRequestDto {
  seller_id?: string;
  buyer_id?: string;
  device_id?: string;
  title?: string;
  status?: number;
  start_date_min?: string;
  start_date_max?: string;
  end_date_min?: string;
  end_date_max?: string;
  page?: number;
  limit?: number;
}

/**
 * 경매 입찰 검색 요청 DTO (상세)
 */
export interface AuctionBidDetailSearchRequestDto {
  auction_item_id?: string;
  bidder_id?: string;
  status?: number;
  amount_min?: number;
  amount_max?: number;
  page?: number;
  limit?: number;
}

/**
 * 경매 아이템 히스토리 검색 요청 DTO (상세)
 */
export interface AuctionItemHistoryDetailSearchRequestDto {
  auction_item_id?: string;
  action?: string;
  status?: number;
  page?: number;
  limit?: number;
} 