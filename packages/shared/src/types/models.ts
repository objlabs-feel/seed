/**
 * Prisma 모델에 대한 TypeScript 타입 정의
 * 
 * 이 파일은 데이터베이스의 모든 주요 모델에 대한 타입을 정의합니다.
 * 스키마 변경 시 이 파일도 함께 업데이트해야 합니다.
 */

/**
 * 경매 상태 열거형 ( 0: 활성, 1: 낙찰, 3: 완료, 4: 취소, 만료  )
 */
export enum AuctionStatus {
  INACTIVE = 0,
  ACTIVE = 1,
  SUCCESS_BID = 2,
  COMPLETED = 3,
  CANCELLED = 4,
  EXPIRED = 5,
}

/**
 * 상태 열거형 ( 0 : 비활성, 1 : 활성 )
 */
export enum Status {
  ACTIVE = 1,
  INACTIVE = 0,
}

/**
 * 기본 모델 인터페이스 (모든 모델에 공통적으로 존재하는 필드)
 */
export interface BaseModel {
  id: number | bigint;
  created_at?: Date | null;
  updated_at?: Date | null;
  status: number | null;
}

/**
 * 시스템 관리자 모델
 */
export interface Admin extends BaseModel {
  username: string;
  password: string;
  level: number;
}

/**
 * 시스템 환경변수 모델
 */
export interface SystemEnvironment extends BaseModel {
  parameters: any;
}

/**
 * 판매 유형 모델
 */
export interface SalesType extends BaseModel {
  code?: string | null;
  name?: string | null;
  img?: string | null;
  service_name: string;
  model: string;  // 실제 모델 이름 ('product' | 'auction' 등)
  description?: string | null;
  sort_key: number;

  // 관계형 필드
  saleItems?: SaleItem[];
}

/**
 * 기기 타입 모델
 */
export interface DeviceType extends BaseModel {
  code?: string | null;
  name: string;
  description?: string | null;
  img?: string | null;
  sort_key: number;

  // 관계형 필드
  devices?: Device[];
  usedDevices?: UsedDevice[];
  departments?: DepartmentToDeviceType[];
}

/**
 * 부서 모델
 */
export interface Department extends BaseModel {
  code?: string | null;
  name?: string | null;
  img?: string | null;
  description?: string | null;
  sort_key: number;

  // 관계형 필드
  deviceTypes?: DepartmentToDeviceType[];
  usedDevices?: UsedDevice[];
}

/**
 * 부서와 기기 타입 연결 모델
 */
export interface DepartmentToDeviceType extends BaseModel {
  department_id: number;
  device_type_id: number;
  sort_key: number;

  // 관계형 필드
  department?: Department;
  deviceType?: DeviceType;
}

/**
 * 제조사 모델
 */
export interface Manufacturer extends BaseModel {
  name?: string | null;
  device_types?: any | null;
  img?: string | null;
  description?: string | null;

  // 관계형 필드
  devices?: Device[];
  usedDevices?: UsedDevice[];
}

/**
 * 기기 모델
 */
export interface Device extends BaseModel {
  manufacturer_id?: number | null;
  device_type?: number | null;
  media?: any | null;
  info?: any | null;
  version: number;
  description?: string | null;

  // 관계형 필드
  manufacturer?: Manufacturer;
  deviceType?: DeviceType;
  productComponents?: Product[];
  productDevice?: Product[];
}

/**
 * 사용자 모델
 */
export interface User extends BaseModel {
  device_token: string;
  profile_id?: bigint | null;

  // 관계형 필드
  profile?: Profile;
  company?: Company;
}

/**
 * 사용자 프로필 모델
 */
export interface Profile extends BaseModel {
  company_id?: bigint | null;
  profile_type?: number | null;
  name?: string | null;
  mobile?: string | null;
  email?: string | null;

  // 관계형 필드
  company?: Company;
  user?: User;
  companies?: Company[];
}

/**
 * 회사 모델
 */
export interface Company extends BaseModel {
  name?: string | null;
  business_no?: string | null;
  business_tel?: string | null;
  license_img?: string | null;
  owner_id?: bigint | null;
  related_members?: any | null;
  institute_members?: any | null;
  created_at?: Date | null;
  updated_at?: Date | null;
  company_type?: number | null;
  business_mobile?: string | null;
  secret_info?: any | null;
  zipcode?: string | null;
  address?: string | null;
  address_detail?: string | null;
  area?: string | null;
  status: number;

  // 관계형 필드
  owner?: User;
  devices?: UsedDevice[];
  profiles?: Profile[];
  manyProfiles?: Profile[];
  products?: Product[];
}

/**
 * 판매 아이템 모델
 */
export interface SaleItem extends BaseModel {
  owner_id: bigint;
  sales_type: number;
  item_id: bigint;

  // ignore from prisma
  // 데이터 모델 스키마에는 없는 필드 ( 판매 아이템 타입에 따라 다른 모델 타입을 가질 수 있음 )
  // 데이터 처리를 위한 필드로 실제 데이터베이스에는 저장하지 않음
  item?: Product | AuctionItem;

  // 관계형 필드
  salesType?: SalesType;
  viewHistories?: SaleItemViewHistory[];
  cartItems?: SaleItemCart[];
}

/**
 * 판매 아이템 뷰 히스토리 모델
 */
export interface SaleItemViewHistory extends BaseModel {
  owner_id: bigint;
  item_id: bigint;

  // 관계형 필드
  saleItem?: SaleItem;
}

/**
 * 판매 아이템 카트 모델
 */
export interface SaleItemCart extends BaseModel {
  owner_id: bigint;
  item_id: bigint;

  // 관계형 필드
  saleItem?: SaleItem;
}

/**
 * 판매업자 관리자 모델
 */
export interface SalesAdmin extends BaseModel {
  username: string;
  password: string;
  email: string;
  level: number;
}

/**
 * 제품 모델
 */
export interface Product extends BaseModel {
  owner_id: bigint;
  media?: any | null;
  info?: any | null;
  device_id: bigint;
  available_quantity: number;
  origin_price: number;
  sale_price: number;
  discount_type: number;
  discount_value: number;
  components_ids?: any | null;
  version: number;
  description?: string | null;

  // 관계형 필드
  company?: Company;
  components?: Device[];
  device?: Device;
  saleItems?: SaleItem[];
}

/**
 * 중고 기기 모델 (개인 기기)
 */
export interface UsedDevice extends BaseModel {
  company_id?: bigint | null;
  department_id?: number | null;
  device_type_id?: number | null;
  manufacturer_id?: number | null;
  manufacture_date?: Date | null;
  images?: any | null;
  description?: string | null;

  // 관계형 필드
  company?: Company;
  department?: Department;
  deviceType?: DeviceType;
  manufacturer?: Manufacturer;
  auctions?: AuctionItem[];
}

/**
 * 경매 아이템 모델
 */
export interface AuctionItem extends BaseModel {
  device_id: bigint;
  auction_code: string;
  quantity?: number | null;
  accept_id?: bigint | null;
  seller_steps?: number | null;
  buyer_steps?: number | null;
  seller_timeout?: Date | null;
  buyer_timeout?: Date | null;
  start_timestamp?: Date | null;
  expired_count?: number | null;
  auction_timeout?: Date | null;
  visit_date?: Date | null;
  visit_time?: string | null;

  // 관계형 필드
  device?: UsedDevice;
  auction_item_history?: AuctionItemHistory[];
  saleItems?: SaleItem[];
}

/**
 * 경매 아이템 히스토리 모델
 */
export interface AuctionItemHistory extends BaseModel {
  auction_item_id: bigint;
  user_id: bigint;
  value?: number | null;

  // 관계형 필드
  auction_item?: AuctionItem;
}

/**
 * 알림 정보 모델
 */
export interface NotificationInfo extends BaseModel {
  id: bigint;
  user_id: bigint;
  device_type: number;
  device_os: number;
  device_token: string;
  permission_status?: number | null;
  noti_notice?: number | null;
  noti_event?: number | null;
  noti_sms?: number | null;
  noti_email?: number | null;
  noti_auction?: number | null;
  noti_favorite?: number | null;
  noti_set?: any | null;
  status: number;
}

/**
 * 알림 메시지 모델
 */
export interface NotificationMessage extends BaseModel {
  id: bigint;
  user_id: bigint;
  title: string;
  body: string;
  data?: any | null;
  is_read: boolean;
  group_id?: bigint | null;
  read_at?: Date | null;
  status: number;
}
