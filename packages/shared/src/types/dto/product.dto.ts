import { BaseRequestDto, BaseResponseDto, SearchRequestDto } from './common.dto';

/**
 * 제품 생성 요청 DTO
 */
export interface CreateProductRequestDto extends BaseRequestDto {
  owner_id: string;
  media?: any;
  info?: any;
  device_id: string;
  available_quantity: number;
  origin_price: number;
  sale_price: number;
  discount_type: number;
  discount_value: number;
  components_ids?: any;
  version: number;
  description?: string;
}

/**
 * 제품 업데이트 요청 DTO
 */
export interface UpdateProductRequestDto extends BaseRequestDto {
  owner_id?: string;
  media?: any;
  info?: any;
  device_id?: string;
  available_quantity?: number;
  origin_price?: number;
  sale_price?: number;
  discount_type?: number;
  discount_value?: number;
  components_ids?: any;
  version?: number;
  description?: string;
}

/**
 * 제품 응답 DTO
 */
export interface ProductResponseDto extends BaseResponseDto {
  owner_id: string;
  media?: any | null;
  info?: any | null;
  device_id: string;
  available_quantity: number;
  origin_price: number;
  sale_price: number;
  discount_type: number;
  discount_value: number;
  components_ids?: any | null;
  version: number;
  description?: string | null;
  company?: {
    id: string;
    name?: string | null;
  };
  device?: {
    id: string;
    version: number;
    description?: string | null;
    manufacturer?: {
      id: string;
      name?: string | null;
    };
    deviceType?: {
      id: string;
      name: string;
    };
  };
}

/**
 * 제품 목록 DTO
 */
export interface ProductListDto {
  id: string;
  owner_id: string;
  device_id: string;
  available_quantity: number;
  origin_price: number;
  sale_price: number;
  discount_type: number;
  discount_value: number;
  version: number;
  description?: string | null;
  status: number;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * 제품 상세 응답 DTO (컴포넌트 정보 포함)
 */
export interface ProductDetailResponseDto extends ProductResponseDto {
  components?: Array<{
    id: string;
    version: number;
    description?: string | null;
    manufacturer?: {
      id: string;
      name?: string | null;
    };
    deviceType?: {
      id: string;
      name: string;
    };
  }>;
}

/**
 * 제품 검색 요청 DTO
 */
export interface ProductSearchRequestDto extends SearchRequestDto {
  owner_id?: string;
  device_id?: string;
  min_price?: number;
  max_price?: number;
  discount_type?: number;
  available_only?: boolean;
}

/**
 * 제품 가격 업데이트 요청 DTO
 */
export interface UpdateProductPriceRequestDto {
  origin_price?: number;
  sale_price?: number;
  discount_type?: number;
  discount_value?: number;
}

/**
 * 제품 재고 업데이트 요청 DTO
 */
export interface UpdateProductQuantityRequestDto {
  available_quantity: number;
} 