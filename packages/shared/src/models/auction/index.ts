import { IMedicalDevice } from '../product';

// AuctionHistory 타입 정의
export interface IAuctionHistory {
  id: string | number;
  auction_item_id: string | number;
  user_id: string | number;
  value: number;
  created_at: string;
}

export interface IAuctionItem {
  id: string | number;
  medical_device_id: string | number;
  auction_code: string;
  quantity: number;
  status: AuctionStatus;
  start_timestamp: string;
  expired_count: number;
  accept_id: string | number;
  seller_steps: number;
  buyer_steps: number;
  created_at: string;
  updated_at: string;
  visit_date: string | null;
  visit_time: string | null;
  medical_device: IMedicalDevice;
  auction_item_history: IAuctionHistory[];
}

// 필요한 경우 관련 enum이나 타입들도 추가
export enum AuctionStatus {
  ACTIVE = 0,
  SUCCESS_BID = 1,
  COMPLETED = 2,
  CANCELLED = 3,
}
