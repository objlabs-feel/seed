import { BaseRequestDto, BaseResponseDto, SearchRequestDto, BaseDto } from './common.dto';
import { CompanyListDto, CompanyResponseDto } from './company.dto';

/**
 * 사용자 생성 요청 DTO
 */
export interface CreateUserRequestDto extends BaseRequestDto {
  device_token: string | null;
  profile_id?: string;

  // 프로필 생성을 위한 필드
  name?: string;
  mobile?: string;
  email?: string;
  profile_type?: number;
  company_id?: string;
}

/**
 * 사용자 업데이트 요청 DTO
 */
export interface UpdateUserRequestDto extends BaseRequestDto {
  device_token?: string;
  profile_id?: string;
  profile_type?: number;
  company_id?: string;
  status?: number;
}

/**
 * 사용자 응답 DTO
 */
export interface UserResponseDto extends BaseResponseDto {
  device_token: string | null;
  profile_id?: string | null;
  profile?: ProfileResponseDto | null;
}

/**
 * 사용자 목록 DTO
 */
export interface UserListDto extends BaseDto {
  id: string;
  device_token: string | null;
  profile_id?: string | null;
  status: number;
  created_at: string | null;
  updated_at: string | null;
  email: string;
  profile: ProfileListDto | null;
}

/**
 * 프로필 생성 요청 DTO
 */
export interface CreateProfileRequestDto extends BaseRequestDto {
  company_id?: string;
  profile_type?: number;
  name?: string;
  mobile?: string;
  email?: string;
}

/**
 * 프로필 업데이트 요청 DTO
 */
export interface UpdateProfileRequestDto extends BaseRequestDto {
  company_id?: string;
  profile_type?: number;
  name?: string;
  mobile?: string;
  email?: string;
  status?: number;
}

/**
 * 프로필 응답 DTO
 */
export interface ProfileResponseDto extends BaseResponseDto {
  company_id?: string | null;
  profile_type?: number | null;
  name?: string | null;
  mobile?: string | null;
  email?: string | null;
  company?: CompanyResponseDto | null;
}

/**
 * 프로필 목록 DTO
 */
export interface ProfileListDto extends BaseDto {
  id: string;
  company_id?: string | null;
  profile_type?: number | null;
  name?: string | null;
  mobile?: string | null;
  email?: string | null;
  status: number;
  created_at: string | null;
  updated_at: string | null;
  user_id: string;
  company?: CompanyResponseDto | null;
}

/**
 * 사용자 검색 요청 DTO
 */
export interface UserSearchRequestDto extends SearchRequestDto {
  profile_type?: number;
  company_id?: string;
  email?: string;
  name?: string;
  mobile?: string;
  status?: number;
  page?: number;
  limit?: number;
}

/**
 * 프로필 검색 요청 DTO
 */
export interface ProfileSearchRequestDto extends SearchRequestDto {
  name?: string;
  email?: string;
  mobile?: string;
  profile_type?: number;
  company_id?: string;
}

export interface UserDto extends BaseDto {
  email: string;
  device_token: string | null;
  profile: ProfileDto | null;
}

export interface ProfileDto extends BaseDto {
  user_id: number;
  name: string;
  mobile: string | null;
  profile_type: number;
  company_id: number | null;
  company?: CompanyDto | null;
}

export interface CompanyDto extends BaseDto {
  name: string;
  business_number: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  description: string | null;
} 