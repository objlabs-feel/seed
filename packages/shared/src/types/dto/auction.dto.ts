import { BaseRequestDto, BaseResponseDto, SearchRequestDto, BaseDto } from './common.dto';
import { CompanyListDto } from './company.dto';

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
  images?: string[];
  area?: string;
  deposit_confirm?: number;
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
  images?: string[];
  area?: string;
  deposit_confirm?: number;
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
  deposit_confirm?: number | null;
  device?: {
    id: string;
    company_id?: string | null;
    department_id?: number | null;
    device_type_id?: number | null;
    manufacturer_id?: number | null;
    manufacture_date?: string | null;
    images?: {
      id: string;
      url: string;
    }[];
    description?: string | null;
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
    company?: CompanyListDto;
  };
  auction_item_history?: AuctionItemHistoryResponseDto[];
}

/**
 * 경매 아이템 목록 DTO
 */
export interface AuctionItemListDto extends BaseDto {
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
  description?: string | null;
  deposit_confirm?: number | null;
  device?: {
    id: string;
    company_id?: string | null;
    department_id?: number | null;
    device_type_id?: number | null;
    manufacturer_id?: number | null;
    manufacture_date?: string | null;
    images?: {
      id: string;
      url: string;
    }[];
    description?: string | null;
    company?: {
      id: string;
      name?: string | null;
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
  auction_item_history?: AuctionItemHistoryResponseDto[];
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
  seller_steps?: number;
  buyer_steps?: number;
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