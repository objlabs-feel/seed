import { AuctionItemResponseDto } from './auction.dto';
import { ProductResponseDto } from './product.dto';
import { BaseRequestDto, BaseResponseDto, SearchRequestDto, BaseDto } from './common.dto';

/**
 * 판매 유형 생성 요청 DTO
 */
export interface CreateSalesTypeRequestDto {
  /** 판매 유형 코드 */
  code?: string;
  /** 판매 유형 이름 */
  name: string;
  /** 판매 유형 이미지 */
  img?: string;
  /** 판매 유형 서비스 이름 */
  service_name: string;
  /** 판매 유형 모델 이름 */
  model: string;
  /** 판매 유형 설명 */
  description?: string;
  /** 정렬 순서 */
  sort_key?: number;
  /** 상태 (1: 활성, 0: 비활성) */
  status?: number;
}

/**
 * 판매 유형 수정 요청 DTO
 */
export interface UpdateSalesTypeRequestDto {
  /** 판매 유형 코드 */
  code?: string;
  /** 판매 유형 이름 */
  name?: string;
  /** 판매 유형 이미지 */
  img?: string;
  /** 판매 유형 서비스 이름 */
  service_name?: string;
  /** 판매 유형 모델 이름 */
  model?: string;
  /** 판매 유형 설명 */
  description?: string;
  /** 정렬 순서 */
  sort_key?: number;
  /** 상태 (1: 활성, 0: 비활성) */
  status?: number;
}

/**
 * 판매 유형 응답 DTO
 */
export interface SalesTypeResponseDto extends BaseResponseDto {
  code?: string | null;
  name?: string | null;
  /** 판매 유형 이미지 */
  img?: string;
  service_name: string;
  model: string;
  description?: string | null;
  sort_key: number;
}

/**
 * 판매 유형 DTO
 */
export interface SalesTypeDto {
  /** 판매 유형 ID */
  id: number;
  /** 판매 유형 코드 */
  code: string | null;
  /** 판매 유형 이름 */
  name: string | null;
  /** 판매 유형 이미지 */
  img?: string;
  /** 판매 유형 서비스 이름 */
  service_name: string;
  /** 판매 유형 모델 이름 */
  model: string;
  /** 판매 유형 설명 */
  description: string | null;
  /** 정렬 순서 */
  sort_key: number;
  /** 상태 (1: 활성, 0: 비활성) */
  status: number;
  /** 생성 일시 */
  created_at: string;
  /** 수정 일시 */
  updated_at: string;
}

/**
 * 판매 유형 목록 DTO
 */
export interface SalesTypeListDto {
  /** 판매 유형 ID */
  id: number;
  /** 판매 유형 코드 */
  code: string | null;
  /** 판매 유형 이름 */
  name: string | null;
  /** 판매 유형 이미지 */
  img?: string;
  /** 판매 유형 서비스 이름 */
  service_name: string;
  /** 판매 유형 모델 이름 */
  model: string;
  /** 판매 유형 설명 */
  description: string | null;
  /** 정렬 순서 */
  sort_key: number;
  /** 상태 (1: 활성, 0: 비활성) */
  status: number;
}

/**
 * 판매 아이템 생성 요청 DTO
 */
export interface CreateSaleItemRequestDto extends BaseRequestDto {
  owner_id: string;
  sales_type: number;
  item_id: string;

  // 판매아이템 필수 필드
  department_id?: string;
  device_type_id?: string;

  // 판매아이템 옵션 필드 (optional) -> 실제로는 낙찰 또는 최초 1회 구매 절차 진행시 필요정보
  name?: string;
  phone?: string;
  hospitalName?: string;
  location?: string;
  manufacturer_id?: string;
  manufacture_date?: string;
  description?: string;
  images?: string[];
}

/**
 * 판매 아이템 업데이트 요청 DTO
 */
export interface UpdateSaleItemRequestDto extends BaseRequestDto {
  owner_id?: string;
  sales_type?: number;
  item_id?: string;
}

/**
 * 판매 아이템 응답 DTO
 */
export interface SaleItemResponseDto extends BaseResponseDto {
  owner_id: string;
  sales_type: number;
  item_id: string;
  salesType?: SalesTypeResponseDto;
  item?: AuctionItemResponseDto | ProductResponseDto;
}

/**
 * 판매 아이템 목록 DTO
 */
export interface SaleItemListDto {
  id: string;
  owner_id: string;
  sales_type: number;
  item_id: string;

  status?: number | null;

  created_at?: string | null;
  updated_at?: string | null;

  item?: AuctionItemResponseDto | ProductResponseDto;
  salesType?: SalesTypeResponseDto;
}

/**
 * 판매 아이템 뷰 히스토리 생성 요청 DTO
 */
export interface CreateSaleItemViewHistoryRequestDto extends BaseRequestDto {
  owner_id: string;
  item_id: string;
}

/**
 * 판매 아이템 뷰 히스토리 업데이트 요청 DTO
 */
export interface UpdateSaleItemViewHistoryRequestDto extends BaseRequestDto {
  owner_id?: string;
  item_id?: string;
}

/**
 * 판매 아이템 뷰 히스토리 응답 DTO
 */
export interface SaleItemViewHistoryResponseDto extends BaseResponseDto {
  owner_id: string;
  item_id: string;
}

/**
 * 판매 아이템 카트 생성 요청 DTO
 */
export interface CreateSaleItemCartRequestDto extends BaseRequestDto {
  owner_id: string;
  item_id: string;
}

/**
 * 판매 아이템 카트 업데이트 요청 DTO
 */
export interface UpdateSaleItemCartRequestDto extends BaseRequestDto {
  owner_id?: string;
  item_id?: string;
}

/**
 * 판매 아이템 카트 응답 DTO
 */
export interface SaleItemCartResponseDto extends BaseResponseDto {
  owner_id: string;
  item_id: string;
  saleItem?: {
    id: string;
    owner_id: string;
    sales_type: number;
    item_id: string;
  };
}

/**
 * 판매업자 관리자 생성 요청 DTO
 */
export interface CreateSalesAdminRequestDto extends BaseRequestDto {
  username: string;
  password: string;
  email: string;
  level: number;
  status?: number;
}

/**
 * 판매업자 관리자 업데이트 요청 DTO
 */
export interface UpdateSalesAdminRequestDto extends BaseRequestDto {
  username?: string;
  password?: string;
  email?: string;
  level?: number;
  status?: number;
}

/**
 * 판매업자 관리자 응답 DTO (비밀번호 제외)
 */
export interface SalesAdminResponseDto extends BaseResponseDto {
  username: string;
  email: string;
  level: number;
}

/**
 * 판매업자 관리자 목록 DTO
 */
export interface SalesAdminListDto extends BaseDto {
  /** 판매 관리자 ID */
  id: string;
  /** 사용자명 */
  username: string;
  /** 이메일 */
  email: string;
  /** 레벨 */
  level: number;
  /** 상태 (1: 활성, 0: 비활성) */
  status: number;
  /** 생성 일시 */
  created_at: string | null;
  /** 수정 일시 */
  updated_at: string | null;
}

/**
 * 판매업자 관리자 로그인 요청 DTO
 */
export interface SalesAdminLoginRequestDto {
  username: string;
  password: string;
}

/**
 * 판매업자 관리자 로그인 응답 DTO
 */
export interface SalesAdminLoginResponseDto {
  admin: SalesAdminResponseDto;
  token?: string;
}

/**
 * 판매 아이템 검색 요청 DTO
 */
export interface SaleItemSearchRequestDto extends SearchRequestDto {
  owner_id?: string;
  sales_type?: number;
  item_type?: 'product' | 'auction';
}

/**
 * 판매업자 관리자 검색 요청 DTO
 */
export interface SalesAdminSearchRequestDto extends SearchRequestDto {
  keyword?: string;
  username?: string;
  email?: string;
  level?: number;
  status?: number;
  page?: number;
  limit?: number;
}

/**
 * 판매 통계 응답 DTO
 */
export interface SalesStatisticsResponseDto {
  total_items: number;
  total_products: number;
  total_auctions: number;
  active_items: number;
  inactive_items: number;
  total_views: number;
  total_cart_items: number;
}

export interface SalesAdminDto extends BaseDto {
  user_id: number;
  sales_type_id: number;
  user: any | null; // UserDto로 변경 필요
  sales_type: SalesTypeDto | null;
}

/**
 * 판매 유형 검색 요청 DTO
 */
export interface SalesTypeSearchRequestDto {
  /** 현재 페이지 */
  page?: number;
  /** 페이지당 항목 수 */
  limit?: number;
  /** 판매 유형 코드 */
  code?: string;
  /** 판매 유형 이름 */
  name?: string;
  /** 상태 (1: 활성, 0: 비활성) */
  status?: number;
}

/**
 * 판매 생성 요청 DTO
 * 새로운 판매를 생성할 때 필요한 데이터를 정의합니다.
 */
export interface CreateSaleRequestDto {
  /** 부서 ID */
  department: string;
  /** 장비 유형 ID */
  equipmentType: string;
  /** 제조사 ID (선택) */
  manufacturer_id?: string;
  /** 제조년도 (선택) */
  manufacturingYear?: string;
  /** 판매명 */
  name: string;
  /** 설명 (선택) */
  description?: string;
  /** 상태 */
  status: number;
}

/**
 * 판매 수정 요청 DTO
 * 기존 판매 정보를 수정할 때 필요한 데이터를 정의합니다.
 */
export interface UpdateSaleRequestDto {
  /** 부서 ID (선택) */
  department?: string;
  /** 장비 유형 ID (선택) */
  equipmentType?: string;
  /** 제조사 ID (선택) */
  manufacturer_id?: string;
  /** 제조년도 (선택) */
  manufacturingYear?: string;
  /** 판매명 (선택) */
  name?: string;
  /** 설명 (선택) */
  description?: string;
  /** 상태 (선택) */
  status?: number;
}

/**
 * 판매 정보 DTO
 * 판매 정보를 표현하는 데이터 구조를 정의합니다.
 */
export interface SaleDto extends BaseDto {
  /** 부서 ID */
  department_id: number;
  /** 장비 유형 ID */
  device_type_id: number;
  /** 제조사 ID (null 허용) */
  manufacturer_id: number | null;
  /** 제조년도 (null 허용) */
  manufacture_year: number | null;
  /** 판매명 */
  name: string;
  /** 설명 (null 허용) */
  description: string | null;
  /** 상태 */
  status: number;
  /** 생성일시 */
  created_at: string;
  /** 수정일시 */
  updated_at: string;
}

/**
 * 판매 목록 DTO
 * 판매 목록과 페이지네이션 정보를 포함하는 데이터 구조를 정의합니다.
 */
export interface SaleListDto {
  /** 판매 목록 */
  items: SaleDto[];
  /** 메타데이터 */
  metadata: {
    /** 페이지네이션 정보 */
    pagination: {
      /** 현재 페이지 */
      page: number;
      /** 페이지당 항목 수 */
      limit: number;
      /** 전체 항목 수 */
      total: number;
      /** 전체 페이지 수 */
      totalPages: number;
    };
  };
}

/**
 * 판매 검색 요청 DTO
 * 판매 목록을 검색할 때 사용하는 조건을 정의합니다.
 */
export interface SaleSearchRequestDto {
  /** 부서 ID (선택) */
  department?: string;
  /** 장비 유형 ID (선택) */
  equipmentType?: string;
  /** 제조사 ID (선택) */
  manufacturer_id?: string;
  /** 판매명 (선택) */
  name?: string;
  /** 상태 (선택) */
  status?: number;
  /** 페이지 번호 (선택) */
  page?: number;
  /** 페이지당 항목 수 (선택) */
  limit?: number;
} 