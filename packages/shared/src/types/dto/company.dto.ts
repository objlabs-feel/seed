import { BaseRequestDto, BaseResponseDto, SearchRequestDto } from './common.dto';

/**
 * 회사 생성 요청 DTO
 */
export interface CreateCompanyRequestDto extends BaseRequestDto {
  name?: string;
  business_no?: string;
  business_tel?: string;
  license_img?: string;
  owner_id?: string;
  related_members?: any;
  institute_members?: any;
  company_type?: number;
  business_mobile?: string;
  secret_info?: any;
  zipcode?: string;
  address?: string;
  address_detail?: string;
  area?: string;
}

/**
 * 회사 업데이트 요청 DTO
 */
export interface UpdateCompanyRequestDto extends BaseRequestDto {
  name?: string;
  business_no?: string;
  business_tel?: string;
  license_img?: string;
  owner_id?: string;
  related_members?: any;
  institute_members?: any;
  company_type?: number;
  business_mobile?: string;
  secret_info?: any;
  zipcode?: string;
  address?: string;
  address_detail?: string;
  area?: string;
}

/**
 * 회사 응답 DTO
 */
export interface CompanyResponseDto extends BaseResponseDto {
  name?: string | null;
  business_no?: string | null;
  business_tel?: string | null;
  license_img?: string | null;
  owner_id?: string | null;
  related_members?: any | null;
  institute_members?: any | null;
  company_type?: number | null;
  business_mobile?: string | null;
  secret_info?: any | null;
  zipcode?: string | null;
  address?: string | null;
  address_detail?: string | null;
  area?: string | null;
}

/**
 * 회사 목록 DTO (민감한 정보 제외)
 */
export interface CompanyListDto {
  id: string;
  name?: string | null;
  business_no?: string | null;
  business_tel?: string | null;
  owner_id?: string | null;
  company_type?: number | null;
  business_mobile?: string | null;
  zipcode?: string | null;
  address?: string | null;
  address_detail?: string | null;
  area?: string | null;
  status: number;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * 회사 검색 요청 DTO
 */
export interface CompanySearchRequestDto extends SearchRequestDto {
  name?: string;
  business_no?: string;
  company_type?: number;
  area?: string;
  profile_name?: string;
}

/**
 * 회사 상세 응답 DTO (소유자 정보 포함)
 */
export interface CompanyDetailResponseDto extends CompanyResponseDto {
  owner?: {
    id: string;
    device_token: string;
    profile?: {
      name?: string | null;
      mobile?: string | null;
      email?: string | null;
    };
  };
} 